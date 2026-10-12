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
app.get("/api/v1/auth/session", auth.authenticate, (_request, response) => {
  response.setHeader("Cache-Control", "no-store");
  return response.json({ user: response.locals.authIdentity });
});
app.get("/api/v1/admin/session", auth.authenticate, auth.requireAdmin, (_request, response) => {
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
});

function shutdown() {
  sync.stop();
  server.close(() => {
    db.close();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 3_000).unref();
}

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
