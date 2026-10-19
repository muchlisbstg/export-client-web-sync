import "dotenv/config";
import { randomBytes, randomUUID } from "node:crypto";
import path from "node:path";
import cors from "cors";
import { rateLimit } from "express-rate-limit";
import express, { type NextFunction, type Request, type Response } from "express";
import { z } from "zod";
import { createDatabase, type InquiryRecord, type Product } from "./database";
import { createSyncCoordinator, isValidSyncSecret, matchesSyncSecret, parseSyncPeers } from "./sync";
import { createSupabaseAuth } from "./auth";

const db = createDatabase();
const app = express();
const port = Number(process.env.API_PORT ?? 4000);
const host = process.env.API_HOST ?? "127.0.0.1";
const allowedOrigins = (process.env.WEB_ORIGINS ?? "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const trustProxyHops = Number(process.env.TRUST_PROXY_HOPS ?? 0);
const syncSecret = process.env.SYNC_SHARED_SECRET?.trim() ?? "";
const nodeId = process.env.SYNC_NODE_ID?.trim() || "web-local";

if (syncSecret && !isValidSyncSecret(syncSecret)) {
  throw new Error("SYNC_SHARED_SECRET must contain at least 32 characters.");
}
if (syncSecret && !process.env.SYNC_NODE_ID?.trim()) {
  throw new Error("SYNC_NODE_ID is required when SYNC_SHARED_SECRET enables synchronization.");
}

const peers = parseSyncPeers(process.env.SYNC_PEERS ?? "", nodeId);
const sync = createSyncCoordinator({ db, nodeId, secret: syncSecret, peers });

app.disable("x-powered-by");
if (Number.isSafeInteger(trustProxyHops) && trustProxyHops >= 0) {
  app.set("trust proxy", trustProxyHops);
}
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Origin is not allowed by CORS"));
    },
  })
);
app.use(express.json({ limit: "16kb" }));

function positiveIntegerEnv(name: string, fallback: number): number {
  const value = Number(process.env[name] ?? fallback);
  return Number.isSafeInteger(value) && value > 0 ? value : fallback;
}

function createRateLimiter(limit: number) {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    handler(_request, response) {
      response.status(429).json({ error: "rate_limit_exceeded" });
    },
  });
}

const createInquiryLimiter = createRateLimiter(positiveIntegerEnv("RFQ_LIMIT_PER_15M", 10));
const trackInquiryLimiter = createRateLimiter(positiveIntegerEnv("TRACK_LOOKUP_LIMIT_PER_15M", 60));
const authLimiter = createRateLimiter(positiveIntegerEnv("AUTH_LIMIT_PER_15M", 120));

const inquiryInput = z.object({
  customerName: z.string().trim().min(2).max(120),
  customerEmail: z.string().trim().email().max(254),
  destinationCountry: z.string().trim().min(2).max(80),
  productId: z.string().trim().min(1).max(80),
  quantity: z.coerce.number().positive().max(1_000_000),
});

const syncInquiryInput = z.object({
  id: z.string().uuid(),
  trackingCode: z.string().regex(/^[A-F0-9]{24}$/),
  customerName: z.string().min(2).max(120),
  customerEmail: z.string().email().max(254),
  destinationCountry: z.string().min(2).max(80),
  productId: z.string().min(1).max(80),
  quantity: z.number().positive().max(1_000_000),
  unit: z.string().min(1).max(20),
  status: z.literal("received"),
  createdAt: z.string().datetime({ offset: true }),
  originNodeId: z.string().regex(/^[A-Za-z0-9._-]{1,80}$/),
}).strict();

const auth = createSupabaseAuth();
app.get("/api/v1/auth/session", authLimiter, auth.authenticate, (_request, response) => {
  response.setHeader("Cache-Control", "no-store");
  return response.json({ user: response.locals.authIdentity });
});
app.get("/api/v1/admin/session", authLimiter, auth.authenticate, auth.requireAdmin, (_request, response) => {
  response.setHeader("Cache-Control", "no-store");
  return response.json({ ok: true, user: response.locals.authIdentity });
});

app.get("/health", (_request, response) => {
  db.prepare("SELECT 1").get();
  const pendingDeliveries = (db.prepare("SELECT COUNT(*) AS count FROM sync_outbox").get() as { count: number }).count;
  const retryingDeliveries = (db.prepare("SELECT COUNT(*) AS count FROM sync_outbox WHERE last_error IS NOT NULL").get() as { count: number }).count;
  const conflicts = (db.prepare("SELECT COUNT(*) AS count FROM sync_conflicts").get() as { count: number }).count;
  response.setHeader("Cache-Control", "no-store");
  response.json({
    status: "ok",
    nodeId,
    syncEnabled: sync.syncEnabled,
    syncStatus: { enabled: sync.syncEnabled, peerCount: peers.length, pendingDeliveries, retryingDeliveries, conflicts },
  });
});


function tenantSchemaReady(): boolean {
  const tables = new Set((db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as Array<{name:string}>).map((row) => row.name));
  if (!["tenants", "tenant_memberships", "commercial_transactions"].every((name) => tables.has(name))) return false;
  const columns = new Set((db.prepare("PRAGMA table_info(inquiries)").all() as Array<{name:string}>).map((row) => row.name));
  return ["buyer_tenant_id", "seller_tenant_id", "tenant_migration_state"].every((name) => columns.has(name));
}
function requireActiveTenant(request: Request, response: Response, next: NextFunction) {
  if (!tenantSchemaReady()) return response.status(503).json({ error: "tenant_schema_not_ready" });
  const identity = response.locals.authIdentity as { id: string } | undefined;
  const tenantId = String(request.header("x-active-tenant-id") ?? "").trim();
  if (!tenantId) return response.status(400).json({ error: "active_tenant_required" });
  const membership = db.prepare(`SELECT t.id, t.tenant_type AS tenantType, t.status AS tenantStatus, m.role, m.status AS membershipStatus
    FROM tenants t JOIN tenant_memberships m ON m.tenant_id=t.id WHERE m.user_id=? AND t.id=?`).get(identity?.id ?? "", tenantId) as
    {id:string;tenantType:"buyer"|"seller";tenantStatus:string;role:string;membershipStatus:string}|undefined;
  if (!identity || !membership || membership.tenantStatus !== "active" || membership.membershipStatus !== "active") return response.status(403).json({ error: "tenant_access_denied" });
  response.locals.activeTenant = membership;
  return next();
}

type TenantBundle = {
  transaction: { id:string; buyerTenantId:string; sellerTenantId:string; inquiryId:string|null; status:string; createdAt:string };
  tenants: Array<{id:string;tenantType:string;displayName:string;status:string;createdAt:string}>;
  memberships: Array<{tenantId:string;userId:string;role:string;status:string;createdAt:string}>;
};
let tenantOutboxFlushing = false;
function readTenantBundle(transactionId: string): TenantBundle | undefined {
  const transaction = db.prepare(`SELECT id,buyer_tenant_id AS buyerTenantId,seller_tenant_id AS sellerTenantId,inquiry_id AS inquiryId,status,created_at AS createdAt FROM commercial_transactions WHERE id=?`).get(transactionId) as TenantBundle["transaction"]|undefined;
  if (!transaction) return undefined;
  const tenants = db.prepare("SELECT id,tenant_type AS tenantType,display_name AS displayName,status,created_at AS createdAt FROM tenants WHERE id IN (?,?)").all(transaction.buyerTenantId,transaction.sellerTenantId) as TenantBundle["tenants"];
  const memberships = db.prepare("SELECT tenant_id AS tenantId,user_id AS userId,role,status,created_at AS createdAt FROM tenant_memberships WHERE tenant_id IN (?,?)").all(transaction.buyerTenantId,transaction.sellerTenantId) as TenantBundle["memberships"];
  return { transaction, tenants, memberships };
}
function enqueueTenantBundle(transactionId: string) {
  if (!syncSecret || peers.length === 0 || !tenantSchemaReady()) return;
  const bundle = readTenantBundle(transactionId);
  if (!bundle) return;
  const enqueue = db.prepare(`INSERT INTO tenant_sync_outbox
    (event_id,peer_node_id,peer_url,event_type,aggregate_id,payload_json,created_at)
    VALUES (?,?,?,?,?,?,?)`);
  const transaction = db.transaction(() => {
    for (const peer of peers) enqueue.run(randomUUID(),peer.nodeId,peer.baseUrl,"transaction.upsert",transactionId,JSON.stringify(bundle),new Date().toISOString());
  });
  transaction();
  void flushTenantOutbox();
}
async function flushTenantOutbox() {
  if (tenantOutboxFlushing || !syncSecret || !tenantSchemaReady()) return;
  tenantOutboxFlushing = true;
  try {
    const due = db.prepare("SELECT event_id AS eventId,peer_node_id AS peerNodeId,peer_url AS peerUrl,payload_json AS payloadJson,attempt_count AS attemptCount FROM tenant_sync_outbox WHERE delivered_at IS NULL AND next_attempt_at_ms<=? ORDER BY created_at LIMIT 20").all(Date.now()) as Array<{eventId:string;peerNodeId:string;peerUrl:string;payloadJson:string;attemptCount:number}>;
    for (const item of due) {
      try {
        const result = await fetch(`${item.peerUrl}/api/v1/sync/tenants`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${syncSecret}`,"x-sync-peer":nodeId},body:JSON.stringify({eventId:item.eventId,eventType:"transaction.upsert",payload:JSON.parse(item.payloadJson)}),signal:AbortSignal.timeout(5000)});
        if (!result.ok) throw new Error(`peer_http_${result.status}`);
        db.prepare("UPDATE tenant_sync_outbox SET delivered_at=?,last_error=NULL WHERE event_id=? AND peer_node_id=?").run(new Date().toISOString(),item.eventId,item.peerNodeId);
      } catch (error) {
        const attempts=item.attemptCount+1, delay=Math.min(300000,1000*2**Math.min(attempts,8));
        db.prepare("UPDATE tenant_sync_outbox SET attempt_count=?,next_attempt_at_ms=?,last_error=? WHERE event_id=? AND peer_node_id=?").run(attempts,Date.now()+delay,error instanceof Error?error.message.slice(0,120):"tenant_sync_error",item.eventId,item.peerNodeId);
      }
    }
  } finally { tenantOutboxFlushing=false; }
}
function validTenantBundle(value: unknown): value is TenantBundle {
  if (!value || typeof value !== "object") return false;
  const b=value as TenantBundle;
  return Boolean(b.transaction && typeof b.transaction.id==="string" && typeof b.transaction.buyerTenantId==="string" && typeof b.transaction.sellerTenantId==="string"
    && ["pending","accepted","fulfilled","cancelled","disputed"].includes(b.transaction.status)
    && Array.isArray(b.tenants) && b.tenants.length===2 && b.tenants.every(t=>t && typeof t.id==="string" && ["buyer","seller"].includes(t.tenantType) && typeof t.displayName==="string" && ["active","suspended","archived"].includes(t.status) && typeof t.createdAt==="string")
    && Array.isArray(b.memberships) && b.memberships.every(m=>m && typeof m.tenantId==="string" && typeof m.userId==="string" && ["buyer_admin","buyer_member","seller_admin","seller_member"].includes(m.role) && ["active","suspended","revoked"].includes(m.status) && typeof m.createdAt==="string"));
}
app.post("/api/v1/sync/tenants", (request,response) => {
  if (!syncSecret || !tenantSchemaReady()) return response.status(503).json({error:"tenant_sync_unavailable"});
  if (!matchesSyncSecret(request.header("authorization"),syncSecret)) return response.status(401).json({error:"unauthorized"});
  const peerId=String(request.header("x-sync-peer")??"");
  if (!peers.some(peer=>peer.nodeId===peerId)) return response.status(403).json({error:"unknown_sync_peer"});
  const body=request.body as {eventId?:unknown;eventType?:unknown;payload?:unknown};
  if (typeof body.eventId!=="string" || body.eventType!=="transaction.upsert" || !validTenantBundle(body.payload)) return response.status(400).json({error:"invalid_tenant_sync_event"});
  const bundle=body.payload;
  try {
    db.transaction(() => {
      for (const tenant of bundle.tenants) db.prepare(`INSERT INTO tenants(id,tenant_type,display_name,status,created_at) VALUES(@id,@tenantType,@displayName,@status,@createdAt)
        ON CONFLICT(id) DO UPDATE SET tenant_type=excluded.tenant_type,display_name=excluded.display_name,status=excluded.status`).run(tenant);
      for (const member of bundle.memberships) db.prepare(`INSERT INTO tenant_memberships(tenant_id,user_id,role,status,created_at) VALUES(@tenantId,@userId,@role,@status,@createdAt)
        ON CONFLICT(tenant_id,user_id) DO UPDATE SET role=excluded.role,status=excluded.status`).run(member);
      const t=bundle.transaction;
      db.prepare(`INSERT INTO commercial_transactions(id,buyer_tenant_id,seller_tenant_id,inquiry_id,status,created_at) VALUES(@id,@buyerTenantId,@sellerTenantId,@inquiryId,@status,@createdAt)
        ON CONFLICT(id) DO UPDATE SET buyer_tenant_id=excluded.buyer_tenant_id,seller_tenant_id=excluded.seller_tenant_id,inquiry_id=excluded.inquiry_id,status=excluded.status`).run(t);
    })();
  } catch { return response.status(409).json({error:"tenant_sync_conflict"}); }
  return response.status(200).json({result:"applied",eventId:body.eventId});
});

app.get("/api/v1/transactions", auth.authenticate, requireActiveTenant, (_request, response) => {
  const tenant = response.locals.activeTenant as {id:string};
  const rows = db.prepare(`SELECT id, buyer_tenant_id AS buyerTenantId, seller_tenant_id AS sellerTenantId, inquiry_id AS inquiryId, status, created_at AS createdAt
    FROM commercial_transactions WHERE buyer_tenant_id=? OR seller_tenant_id=? ORDER BY created_at DESC LIMIT 100`).all(tenant.id, tenant.id);
  response.setHeader("Cache-Control", "no-store");
  return response.json({ data: rows });
});
app.get("/api/v1/transactions/:id", auth.authenticate, requireActiveTenant, (request, response) => {
  const tenant = response.locals.activeTenant as {id:string};
  const row = db.prepare(`SELECT id, buyer_tenant_id AS buyerTenantId, seller_tenant_id AS sellerTenantId, inquiry_id AS inquiryId, status, created_at AS createdAt
    FROM commercial_transactions WHERE id=? AND (buyer_tenant_id=? OR seller_tenant_id=?)`).get(request.params.id, tenant.id, tenant.id);
  response.setHeader("Cache-Control", "no-store");
  if (!row) return response.status(404).json({ error: "transaction_not_found" });
  return response.json({ data: row });
});
app.post("/api/v1/transactions", auth.authenticate, requireActiveTenant, (request, response) => {
  const tenant = response.locals.activeTenant as {id:string;tenantType:string;role:string};
  const sellerTenantId = typeof request.body?.sellerTenantId === "string" ? request.body.sellerTenantId.trim() : "";
  if (tenant.tenantType !== "buyer" || tenant.role !== "buyer_admin") return response.status(403).json({ error: "buyer_admin_required" });
  if (!sellerTenantId || sellerTenantId === tenant.id) return response.status(400).json({ error: "invalid_seller_tenant" });
  const seller = db.prepare("SELECT id FROM tenants WHERE id=? AND tenant_type='seller' AND status='active'").get(sellerTenantId);
  if (!seller) return response.status(404).json({ error: "seller_tenant_not_found" });
  const id = randomUUID();
  const createdAt = new Date().toISOString();
  db.prepare("INSERT INTO commercial_transactions (id,buyer_tenant_id,seller_tenant_id,status,created_at) VALUES (?,?,?,'pending',?)").run(id, tenant.id, sellerTenantId, createdAt);
  response.setHeader("Cache-Control", "no-store");
  enqueueTenantBundle(id);
  return response.status(201).json({ data: { id, buyerTenantId: tenant.id, sellerTenantId, status: "pending", createdAt } });
});
app.patch("/api/v1/transactions/:id/status", auth.authenticate, requireActiveTenant, (request, response) => {
  const tenant = response.locals.activeTenant as {id:string;tenantType:string;role:string};
  const nextStatus = request.body?.status;
  const row = db.prepare("SELECT id,buyer_tenant_id AS buyerTenantId,seller_tenant_id AS sellerTenantId,status FROM commercial_transactions WHERE id=? AND (buyer_tenant_id=? OR seller_tenant_id=?)").get(request.params.id, tenant.id, tenant.id) as
    {id:string;buyerTenantId:string;sellerTenantId:string;status:string}|undefined;
  if (!row) return response.status(404).json({ error: "transaction_not_found" });
  const sellerAction = tenant.tenantType === "seller" && tenant.role === "seller_admin" && ["accepted","fulfilled"].includes(nextStatus);
  const buyerAction = tenant.tenantType === "buyer" && tenant.role === "buyer_admin" && ["cancelled","disputed"].includes(nextStatus);
  const validTransition = (nextStatus === "accepted" && row.status === "pending" && sellerAction)
    || (nextStatus === "fulfilled" && row.status === "accepted" && sellerAction)
    || ((nextStatus === "cancelled" || nextStatus === "disputed") && ["pending","accepted"].includes(row.status) && buyerAction);
  if (!validTransition) return response.status(403).json({ error: "transaction_transition_denied" });
  const changed = db.prepare("UPDATE commercial_transactions SET status=? WHERE id=? AND status=?").run(nextStatus, row.id, row.status);
  if (changed.changes !== 1) return response.status(409).json({ error: "transaction_state_conflict" });
  enqueueTenantBundle(row.id);
  response.setHeader("Cache-Control", "no-store");
  return response.json({ data: { id: row.id, status: nextStatus } });
});

app.get("/api/v1/products", (_request, response) => {
  const products = db
    .prepare("SELECT id, name, category, origin, unit FROM products WHERE active = 1 ORDER BY name")
    .all() as Product[];
  response.setHeader("Cache-Control", "no-store");
  response.json({ data: products });
});

app.post("/api/v1/inquiries", createInquiryLimiter, (request, response) => {
  const parsed = inquiryInput.safeParse(request.body);
  if (!parsed.success) {
    return response.status(400).json({
      error: "invalid_request",
      fields: parsed.error.flatten().fieldErrors,
    });
  }

  const product = db
    .prepare("SELECT id, unit FROM products WHERE id = ? AND active = 1")
    .get(parsed.data.productId) as { id: string; unit: string } | undefined;
  if (!product) return response.status(404).json({ error: "product_not_found" });

  let trackingCode = "";
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const candidate = randomBytes(12).toString("hex").toUpperCase();
    const exists = db.prepare("SELECT 1 FROM inquiries WHERE tracking_code = ?").get(candidate);
    if (!exists) {
      trackingCode = candidate;
      break;
    }
  }
  if (!trackingCode) return response.status(503).json({ error: "tracking_code_unavailable" });

  const record: InquiryRecord = {
    id: randomUUID(),
    trackingCode,
    customerName: parsed.data.customerName,
    customerEmail: parsed.data.customerEmail,
    destinationCountry: parsed.data.destinationCountry,
    productId: parsed.data.productId,
    quantity: parsed.data.quantity,
    unit: product.unit,
    status: "received",
    createdAt: new Date().toISOString(),
    originNodeId: nodeId,
  };
  db.prepare(`
    INSERT INTO inquiries
      (id, tracking_code, customer_name, customer_email, destination_country, product_id, quantity, unit, status, created_at, origin_node_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    record.id,
    record.trackingCode,
    record.customerName,
    record.customerEmail,
    record.destinationCountry,
    record.productId,
    record.quantity,
    record.unit,
    record.status,
    record.createdAt,
    record.originNodeId
  );
  sync.queueRecord(record.id, record.originNodeId);

  response.setHeader("Cache-Control", "no-store");
  return response.status(201).json({ trackingCode, status: record.status, createdAt: record.createdAt });
});

app.post("/api/v1/sync/inquiries", (request, response) => {
  if (!syncSecret) return response.status(503).json({ error: "sync_disabled" });
  if (!matchesSyncSecret(request.header("authorization"), syncSecret)) {
    return response.status(401).json({ error: "unauthorized" });
  }

  const parsed = syncInquiryInput.safeParse(request.body);
  if (!parsed.success) return response.status(400).json({ error: "invalid_sync_record" });

  const result = sync.receive(parsed.data, parsed.data.originNodeId);
  if (result.result === "product_not_found") return response.status(404).json({ error: "product_not_found" });
  if (result.result === "conflict") {
    return response.status(409).json({ error: "sync_conflict", ...result });
  }
  return response.status(result.result === "inserted" ? 201 : 200).json({ result: result.result });
});

app.get("/api/v1/inquiries/:trackingCode", trackInquiryLimiter, (request, response) => {
  const trackingCode = String(request.params.trackingCode ?? "").trim().toUpperCase();
  if (!/^[A-F0-9]{24}$/.test(trackingCode)) {
    return response.status(400).json({ error: "invalid_tracking_code" });
  }

  const inquiry = db
    .prepare(`
      SELECT i.status, i.created_at AS createdAt, p.name AS productName
      FROM inquiries i JOIN products p ON p.id = i.product_id
      WHERE i.tracking_code = ?
    `)
    .get(trackingCode) as
    | { status: string; createdAt: string; productName: string }
    | undefined;

  response.setHeader("Cache-Control", "no-store");
  if (!inquiry) return response.status(404).json({ error: "inquiry_not_found" });
  return response.json({ data: inquiry });
});

if (process.env.NODE_ENV === "production") {
  const webBuild = path.resolve("dist");
  app.use(express.static(webBuild));
  app.get(/^(?!\/api\/).*/, (_request, response, next) => {
    response.sendFile(path.join(webBuild, "index.html"), (error) => {
      if (error) next(error);
    });
  });
}

app.use((error: unknown, _request: Request, response: Response, _next: NextFunction) => {
  const parserError = error as { type?: unknown } | null;
  if (parserError?.type === "entity.parse.failed") {
    return response.status(400).json({ error: "invalid_json" });
  }
  if (parserError?.type === "entity.too.large") {
    return response.status(413).json({ error: "payload_too_large" });
  }
  console.error("API request failed:", error);
  response.status(500).json({ error: "internal_server_error" });
});

const server = app.listen(port, host, () => {
  console.log(`Web API node ${nodeId} listening on http://${host}:${port}`);
  sync.start();
  const tenantSyncTimer = setInterval(() => void flushTenantOutbox(), 2000);
  tenantSyncTimer.unref();
  void flushTenantOutbox();
});

function shutdown() {
  sync.stop();
  clearInterval(tenantSyncTimer);
  server.close(() => {
    db.close();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 3_000).unref();
}

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
