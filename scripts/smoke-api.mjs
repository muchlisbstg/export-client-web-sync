import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer as createHttpServer } from "node:http";
import { migrateTenantIsolation } from "./migrate-tenant-isolation.mjs";
import { once } from "node:events";
import { createServer } from "node:net";
import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const tempDir = mkdtempSync(path.join(os.tmpdir(), "export-client-peer-api-"));
const secret = "test-sync-secret-32-chars-minimum-123456";
const processes = [];
let authUrl = "";
let authServer;

async function allocatePort() {
  const probe = createServer();
  probe.listen(0, "127.0.0.1");
  await once(probe, "listening");
  const address = probe.address();
  assert(address && typeof address === "object");
  const port = address.port;
  probe.close();
  await once(probe, "close");
  return port;
}

function startNode({ nodeId, port, dbPath, peers = "", sharedSecret = "", rfqLimit = 20, trackLimit = 20 }) {
  let output = "";
  const child = spawn(process.execPath, ["--import", "tsx", "server/index.ts"], {
    cwd: root,
    env: {
      ...process.env,
      API_HOST: "127.0.0.1",
      API_PORT: String(port),
      DB_PATH: dbPath,
      NODE_ENV: "test",
      WEB_ORIGINS: "http://localhost:5173",
      RFQ_LIMIT_PER_15M: String(rfqLimit),
      TRACK_LOOKUP_LIMIT_PER_15M: String(trackLimit),
      SYNC_NODE_ID: nodeId,
      SYNC_SHARED_SECRET: sharedSecret,
      SYNC_PEERS: peers,
      SUPABASE_URL: authUrl,
      SUPABASE_ANON_KEY: "test-anon-key",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  child.stdout.on("data", (chunk) => { output += chunk.toString(); });
  child.stderr.on("data", (chunk) => { output += chunk.toString(); });
  const node = { child, port, dbPath, base: `http://127.0.0.1:${port}`, getOutput: () => output };
  processes.push(node);
  return node;
}

async function waitForHealth(node) {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (node.child.exitCode !== null) throw new Error(`API node exited early:\n${node.getOutput()}`);
    try {
      const response = await fetch(`${node.base}/health`);
      if (response.ok) return response.json();
    } catch {
      // Wait for the API process to bind its port.
    }
    await delay(100);
  }
  throw new Error(`API node did not become ready:\n${node.getOutput()}`);
}

async function waitForTracking(node, code) {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    const response = await fetch(`${node.base}/api/v1/inquiries/${code}`);
    if (response.ok) return response.json();
    if (response.status !== 404) throw new Error(`Unexpected tracking response ${response.status}`);
    await delay(100);
  }
  throw new Error(`Inquiry ${code} did not replicate to ${node.base}`);
}

async function stopNode(node) {
  if (node.child.exitCode !== null) return;
  const exited = once(node.child, "exit").catch(() => undefined);
  node.child.kill("SIGTERM");
  await Promise.race([exited, delay(3_000)]);
  if (node.child.exitCode === null) node.child.kill("SIGKILL");
}

async function waitForOutboxState(dbPath, inquiryId, peerNodeId, condition, expectedState) {
  const db = new Database(dbPath, { readonly: true });
  try {
    const find = db.prepare("SELECT attempt_count AS attemptCount FROM sync_outbox WHERE inquiry_id = ? AND peer_node_id = ?");
    for (let attempt = 0; attempt < 100; attempt += 1) {
      const row = find.get(inquiryId, peerNodeId);
      if (condition(row)) return row;
      await delay(100);
    }
    throw new Error(`Outbox did not reach ${expectedState} for ${inquiryId} -> ${peerNodeId}`);
  } finally {
    db.close();
  }
}


const authPort = await allocatePort();
authServer = createHttpServer((request, response) => {
  const token = /^Bearer\s+(.+)$/i.exec(String(request.headers.authorization ?? ""))?.[1] ?? "";
  const ids = { "buyer-token": "buyer-admin", "seller-token": "seller-admin", "member-token": "buyer-member", "outsider-token": "outsider" };
  if (request.url !== "/auth/v1/user" || !ids[token]) {
    response.writeHead(401, { "content-type": "application/json" });
    response.end(JSON.stringify({ error: "invalid_token" }));
    return;
  }
  response.writeHead(200, { "content-type": "application/json" });
  response.end(JSON.stringify({ id: ids[token] }));
});
await new Promise((resolve) => authServer.listen(authPort, "127.0.0.1", resolve));
authUrl = "http://127.0.0.1:" + authPort;

const portA = await allocatePort();
const portB = await allocatePort();
const portC = await allocatePort();
const portD = await allocatePort();
const nodeA = startNode({
  nodeId: "web-a",
  port: portA,
  dbPath: path.join(tempDir, "web-a.sqlite"),
  peers: `web-b=http://127.0.0.1:${portB},web-c=http://127.0.0.1:${portC}`,
  sharedSecret: secret,
  rfqLimit: 3,
  trackLimit: 3,
});
const nodeB = startNode({
  nodeId: "web-b",
  port: portB,
  dbPath: path.join(tempDir, "web-b.sqlite"),
  peers: `web-a=http://127.0.0.1:${portA},web-c=http://127.0.0.1:${portC}`,
  sharedSecret: secret,
});
const nodeC = startNode({
  nodeId: "web-c",
  port: portC,
  dbPath: path.join(tempDir, "web-c.sqlite"),
  peers: "web-a=http://127.0.0.1:" + portA + ",web-b=http://127.0.0.1:" + portB,
  sharedSecret: secret,
});
const nodeD = startNode({
  nodeId: "web-disabled",
  port: portD,
  dbPath: path.join(tempDir, "web-disabled.sqlite"),
});

try {
  const [healthA, healthB, healthC, healthD] = await Promise.all([waitForHealth(nodeA), waitForHealth(nodeB), waitForHealth(nodeC), waitForHealth(nodeD)]);
  assert.equal(healthA.status, "ok");
  assert.equal(healthA.nodeId, "web-a");
  assert.equal(healthA.syncEnabled, true);
  assert.deepEqual(healthA.syncStatus, { enabled: true, peerCount: 2, pendingDeliveries: 0, retryingDeliveries: 0, conflicts: 0 });
  assert.equal(healthB.syncEnabled, true);
  assert.equal(healthC.syncEnabled, true);
  assert.equal(healthC.syncStatus.enabled, true);
  assert.equal(healthD.syncEnabled, false);
  assert.equal(healthD.syncStatus.enabled, false);

  for (const node of [nodeA,nodeB,nodeC]) {
    const migrationDb = new Database(node.dbPath);
    try { migrateTenantIsolation(migrationDb); }
    finally { migrationDb.close(); }
  }
  const migrationDb = new Database(nodeA.dbPath);
  try {
    const createdAt = new Date().toISOString();
    const tenantInsert = migrationDb.prepare("INSERT INTO tenants (id,tenant_type,display_name,created_at) VALUES (?,?,?,?)");
    tenantInsert.run("buyer-a", "buyer", "Buyer A", createdAt);
    tenantInsert.run("seller-a", "seller", "Seller A", createdAt);
    tenantInsert.run("buyer-b", "buyer", "Buyer B", createdAt);
    const membershipInsert = migrationDb.prepare("INSERT INTO tenant_memberships (tenant_id,user_id,role,status,created_at) VALUES (?,?,?,'active',?)");
    membershipInsert.run("buyer-a", "buyer-admin", "buyer_admin", createdAt);
    membershipInsert.run("buyer-a", "buyer-member", "buyer_member", createdAt);
    membershipInsert.run("seller-a", "seller-admin", "seller_admin", createdAt);
    membershipInsert.run("buyer-b", "outsider", "buyer_admin", createdAt);
  } finally {
    migrationDb.close();
  }

  const tenantHeaders = (token, tenantId) => ({ authorization: "Bearer " + token, "x-active-tenant-id": tenantId, "content-type": "application/json" });
  async function waitForTenantTransaction(node, transactionId, token, tenantId) {
    for (let attempt=0; attempt<100; attempt+=1) {
      const response=await fetch(node.base+"/api/v1/transactions/"+transactionId,{headers:tenantHeaders(token,tenantId)});
      if(response.ok) return (await response.json()).data;
      if(response.status!==404) throw new Error("Unexpected tenant transaction response "+response.status+" from "+node.base+": "+await response.text());
      await delay(100);
    }
    throw new Error("Tenant transaction "+transactionId+" did not replicate to "+node.base);
  }
  const unauthenticatedTransactions = await fetch(nodeA.base + "/api/v1/transactions", { headers: { "x-active-tenant-id": "buyer-a" } });
  assert.equal(unauthenticatedTransactions.status, 401);
  const missingTenant = await fetch(nodeA.base + "/api/v1/transactions", { headers: { authorization: "Bearer buyer-token" } });
  assert.equal(missingTenant.status, 400);
  const createdTransactionResponse = await fetch(nodeA.base + "/api/v1/transactions", {
    method: "POST", headers: tenantHeaders("buyer-token", "buyer-a"),
    body: JSON.stringify({ buyerTenantId: "buyer-b", sellerTenantId: "seller-a" }),
  });
  assert.equal(createdTransactionResponse.status, 201);
  const createdTransaction = (await createdTransactionResponse.json()).data;
  assert.equal(createdTransaction.buyerTenantId, "buyer-a");
  const replicated = await Promise.all([
    waitForTenantTransaction(nodeB,createdTransaction.id,"buyer-token","buyer-a"),
    waitForTenantTransaction(nodeC,createdTransaction.id,"buyer-token","buyer-a"),
  ]);
  assert.equal(replicated[0].id,createdTransaction.id);
  assert.equal(replicated[1].id,createdTransaction.id);
  const tenantList = await fetch(nodeA.base + "/api/v1/transactions", { headers: tenantHeaders("buyer-token", "buyer-a") });
  assert.equal((await tenantList.json()).data.length, 1);
  const crossTenantRead = await fetch(nodeA.base + "/api/v1/transactions/" + createdTransaction.id, { headers: tenantHeaders("outsider-token", "buyer-b") });
  assert.equal(crossTenantRead.status, 404);
  const forgedTenant = await fetch(nodeA.base + "/api/v1/transactions", { headers: tenantHeaders("outsider-token", "buyer-a") });
  assert.equal(forgedTenant.status, 403);
  const memberWrite = await fetch(nodeA.base + "/api/v1/transactions/" + createdTransaction.id + "/status", {
    method: "PATCH", headers: tenantHeaders("member-token", "buyer-a"), body: JSON.stringify({ status: "cancelled" }),
  });
  assert.equal(memberWrite.status, 403);
  const sellerAccept = await fetch(nodeA.base + "/api/v1/transactions/" + createdTransaction.id + "/status", {
    method: "PATCH", headers: tenantHeaders("seller-token", "seller-a"), body: JSON.stringify({ status: "accepted" }),
  });
  assert.equal(sellerAccept.status, 200);
  const sellerFulfill = await fetch(nodeA.base + "/api/v1/transactions/" + createdTransaction.id + "/status", {
    method: "PATCH", headers: tenantHeaders("seller-token", "seller-a"), body: JSON.stringify({ status: "fulfilled" }),
  });
  assert.equal(sellerFulfill.status, 200);
  const terminalWrite = await fetch(nodeA.base + "/api/v1/transactions/" + createdTransaction.id + "/status", {
    method: "PATCH", headers: tenantHeaders("buyer-token", "buyer-a"), body: JSON.stringify({ status: "cancelled" }),
  });
  assert.equal(terminalWrite.status, 403);


  const malformedJson = await fetch(`${nodeA.base}/api/v1/inquiries`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: '{"customerName":',
  });
  assert.equal(malformedJson.status, 400);
  assert.equal((await malformedJson.json()).error, "invalid_json");

  const oversizedJson = await fetch(`${nodeA.base}/api/v1/inquiries`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ padding: "x".repeat(17 * 1024) }),
  });
  assert.equal(oversizedJson.status, 413);
  assert.equal((await oversizedJson.json()).error, "payload_too_large");

  const productsResponse = await fetch(`${nodeA.base}/api/v1/products`);
  assert.equal(productsResponse.status, 200);
  const products = (await productsResponse.json()).data;
  assert.equal(products.length, 3);

  const invalidResponse = await fetch(`${nodeA.base}/api/v1/inquiries`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ customerName: "X" }),
  });
  assert.equal(invalidResponse.status, 400);

  const requestBody = {
    customerName: "Sample Client",
    customerEmail: "client@example.com",
    destinationCountry: "Japan",
    productId: products[0].id,
    quantity: 1000,
  };
  const missingProductResponse = await fetch(`${nodeA.base}/api/v1/inquiries`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ...requestBody, productId: "missing-product" }),
  });
  assert.equal(missingProductResponse.status, 404);

  const createdResponse = await fetch(`${nodeA.base}/api/v1/inquiries`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(requestBody),
  });
  assert.equal(createdResponse.status, 201);
  const created = await createdResponse.json();
  assert.match(created.trackingCode, /^[A-F0-9]{24}$/);

  const rateLimitedRfq = await fetch(`${nodeA.base}/api/v1/inquiries`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(requestBody),
  });
  assert.equal(rateLimitedRfq.status, 429);

  const trackedAtOrigin = await fetch(`${nodeA.base}/api/v1/inquiries/${created.trackingCode}`);
  assert.equal(trackedAtOrigin.status, 200);
  const tracked = (await trackedAtOrigin.json()).data;
  assert.equal(tracked.status, "received");
  assert.equal(tracked.productName, products[0].name);
  assert.equal("customerName" in tracked, false);
  assert.equal("customerEmail" in tracked, false);

  const remoteTracking = await waitForTracking(nodeB, created.trackingCode);
  assert.equal(remoteTracking.data.productName, products[0].name);

  const noAuth = await fetch(`${nodeB.base}/api/v1/sync/inquiries`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}",
  });
  assert.equal(noAuth.status, 401);

  const sourceDb = new Database(nodeA.dbPath, { readonly: true });
  const record = sourceDb.prepare(`
    SELECT id, tracking_code AS trackingCode, customer_name AS customerName,
      customer_email AS customerEmail, destination_country AS destinationCountry,
      product_id AS productId, quantity, unit, status, created_at AS createdAt,
      origin_node_id AS originNodeId FROM inquiries WHERE tracking_code = ?
  `).get(created.trackingCode);
  sourceDb.close();
  assert(record);

  const wrongUnitResponse = await fetch(`${nodeB.base}/api/v1/sync/inquiries`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${secret}` },
    body: JSON.stringify({ ...record, id: "22222222-2222-4222-8222-222222222222", trackingCode: "B".repeat(24), unit: "piece" }),
  });
  assert.equal(wrongUnitResponse.status, 404);

  const duplicateResponse = await fetch(`${nodeB.base}/api/v1/sync/inquiries`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${secret}` },
    body: JSON.stringify(record),
  });
  assert.equal(duplicateResponse.status, 200);
  assert.equal((await duplicateResponse.json()).result, "duplicate");

  const conflictResponse = await fetch(`${nodeB.base}/api/v1/sync/inquiries`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${secret}` },
    body: JSON.stringify({ ...record, customerName: "Conflicting Name" }),
  });
  assert.equal(conflictResponse.status, 409);
  assert.equal((await conflictResponse.json()).error, "sync_conflict");

  const targetDb = new Database(nodeB.dbPath, { readonly: true });
  const storedName = targetDb.prepare("SELECT customer_name FROM inquiries WHERE id = ?").get(record.id).customer_name;
  const conflictCount = targetDb.prepare("SELECT COUNT(*) AS count FROM sync_conflicts WHERE inquiry_id = ?").get(record.id).count;
  targetDb.close();
  assert.equal(storedName, "Sample Client", "conflict must never overwrite the original record");
  assert.equal(conflictCount, 1);
  const conflictStatus = await (await fetch(`${nodeB.base}/health`)).json();
  assert.equal(conflictStatus.syncStatus.conflicts, 1);
  assert.equal(conflictStatus.syncStatus.pendingDeliveries, 0);

  const collisionId = "33333333-3333-4333-8333-333333333333";
  const codeCollisionResponse = await fetch(`${nodeB.base}/api/v1/sync/inquiries`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${secret}` },
    body: JSON.stringify({ ...record, id: collisionId, customerName: "Tracking Code Collision" }),
  });
  assert.equal(codeCollisionResponse.status, 409);
  assert.equal((await codeCollisionResponse.json()).error, "sync_conflict");
  const collisionDb = new Database(nodeB.dbPath, { readonly: true });
  const collision = collisionDb.prepare("SELECT reason FROM sync_conflicts WHERE inquiry_id = ?").get(collisionId);
  const preservedName = collisionDb.prepare("SELECT customer_name FROM inquiries WHERE id = ?").get(record.id).customer_name;
  collisionDb.close();
  assert.equal(collision.reason, "tracking_code_collision");
  assert.equal(preservedName, "Sample Client", "tracking-code collision must not overwrite the original record");
  const collisionStatus = await (await fetch(`${nodeB.base}/health`)).json();
  assert.equal(collisionStatus.syncStatus.conflicts, 2);

  const invalidCodeResponse = await fetch(`${nodeA.base}/api/v1/inquiries/not-a-code`);
  assert.equal(invalidCodeResponse.status, 400);
  const missingRequestResponse = await fetch(`${nodeA.base}/api/v1/inquiries/${"F".repeat(24)}`);
  assert.equal(missingRequestResponse.status, 404);
  const rateLimitedLookup = await fetch(`${nodeA.base}/api/v1/inquiries/${created.trackingCode}`);
  assert.equal(rateLimitedLookup.status, 429);

  const peersOnlyPort = await allocatePort();
  const ipv6PeerPort = await allocatePort();
  const ipv6LoopbackNode = startNode({
    nodeId: "web-ipv6-loopback",
    port: await allocatePort(),
    dbPath: path.join(tempDir, "web-ipv6-loopback.sqlite"),
    peers: `web-ipv6-target=http://[::1]:${ipv6PeerPort}`,
    sharedSecret: secret,
  });
  await waitForHealth(ipv6LoopbackNode);

  for (const partialConfig of [
    { nodeId: "web-secret-only", sharedSecret: secret },
    { nodeId: "web-peers-only", peers: `web-peer-target=http://127.0.0.1:${peersOnlyPort}` },
  ]) {
    const partialNode = startNode({
      ...partialConfig,
      port: await allocatePort(),
      dbPath: path.join(tempDir, `${partialConfig.nodeId}.sqlite`),
    });
    await waitForHealth(partialNode);
    const partialCreate = await fetch(`${partialNode.base}/api/v1/inquiries`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(requestBody),
    });
    assert.equal(partialCreate.status, 201);
    const partialDb = new Database(partialNode.dbPath, { readonly: true });
    try {
      const outboxCount = partialDb.prepare("SELECT COUNT(*) AS count FROM sync_outbox").get().count;
      assert.equal(outboxCount, 0, `${partialConfig.nodeId} must not queue outbound sync with partial configuration`);
    } finally {
      partialDb.close();
    }
  }

  const disabledSync = await fetch(`${nodeD.base}/api/v1/sync/inquiries`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}",
  });
  assert.equal(disabledSync.status, 503);

  const recoverySourcePort = await allocatePort();
  const recoveryTargetPort = await allocatePort();
  const recoverySourceDbPath = path.join(tempDir, "recovery-source.sqlite");
  const recoveryTargetDbPath = path.join(tempDir, "recovery-target.sqlite");
  const recoveryPeerId = "web-recovery-target";
  const recoveryPeers = `${recoveryPeerId}=http://127.0.0.1:${recoveryTargetPort}`;
  const recoverySource = startNode({
    nodeId: "web-recovery-source",
    port: recoverySourcePort,
    dbPath: recoverySourceDbPath,
    peers: recoveryPeers,
    sharedSecret: secret,
  });
  await waitForHealth(recoverySource);
  const offlineCreateResponse = await fetch(`${recoverySource.base}/api/v1/inquiries`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(requestBody),
  });
  assert.equal(offlineCreateResponse.status, 201);
  const offlineCreated = await offlineCreateResponse.json();
  const sourceRecordDb = new Database(recoverySourceDbPath, { readonly: true });
  const sourceRecord = sourceRecordDb.prepare("SELECT id FROM inquiries WHERE tracking_code = ?").get(offlineCreated.trackingCode);
  sourceRecordDb.close();
  assert(sourceRecord);
  const failedAttempt = await waitForOutboxState(
    recoverySourceDbPath,
    sourceRecord.id,
    recoveryPeerId,
    (row) => row?.attemptCount >= 1,
    "a persisted failed attempt",
  );
  assert.ok(failedAttempt.attemptCount >= 1);
  const pendingStatus = await (await fetch(`${recoverySource.base}/health`)).json();
  assert.deepEqual(pendingStatus.syncStatus, { enabled: true, peerCount: 1, pendingDeliveries: 1, retryingDeliveries: 1, conflicts: 0 });
  assert.equal("peerUrl" in pendingStatus.syncStatus, false);
  assert.equal("lastError" in pendingStatus.syncStatus, false);
  await stopNode(recoverySource);

  const recoveryTarget = startNode({
    nodeId: recoveryPeerId,
    port: recoveryTargetPort,
    dbPath: recoveryTargetDbPath,
    sharedSecret: secret,
    trackLimit: 100,
  });
  await waitForHealth(recoveryTarget);
  const restartedSource = startNode({
    nodeId: "web-recovery-source",
    port: recoverySourcePort,
    dbPath: recoverySourceDbPath,
    peers: recoveryPeers,
    sharedSecret: secret,
  });
  await waitForHealth(restartedSource);
  const recoveredTracking = await waitForTracking(recoveryTarget, offlineCreated.trackingCode);
  assert.equal(recoveredTracking.data.productName, products[0].name);
  const recoveredStatus = await (await fetch(`${restartedSource.base}/health`)).json();
  assert.equal(recoveredStatus.syncStatus.pendingDeliveries, 0);
  assert.equal(recoveredStatus.syncStatus.retryingDeliveries, 0);
  await waitForOutboxState(
    recoverySourceDbPath,
    sourceRecord.id,
    recoveryPeerId,
    (row) => !row,
    "successful delivery and outbox removal",
  );

  const hopPortA = await allocatePort();
  const hopPortB = await allocatePort();
  const hopPortC = await allocatePort();
  const hopDbPaths = {
    a: path.join(tempDir, "hop-a.sqlite"),
    b: path.join(tempDir, "hop-b.sqlite"),
    c: path.join(tempDir, "hop-c.sqlite"),
  };
  const hopNodeA = startNode({
    nodeId: "web-hop-a",
    port: hopPortA,
    dbPath: hopDbPaths.a,
    peers: `web-hop-b=http://127.0.0.1:${hopPortB}`,
    sharedSecret: secret,
    trackLimit: 100,
  });
  const hopNodeB = startNode({
    nodeId: "web-hop-b",
    port: hopPortB,
    dbPath: hopDbPaths.b,
    peers: `web-hop-a=http://127.0.0.1:${hopPortA},web-hop-c=http://127.0.0.1:${hopPortC}`,
    sharedSecret: secret,
    trackLimit: 100,
  });
  const hopNodeC = startNode({
    nodeId: "web-hop-c",
    port: hopPortC,
    dbPath: hopDbPaths.c,
    peers: `web-hop-b=http://127.0.0.1:${hopPortB}`,
    sharedSecret: secret,
    trackLimit: 100,
  });
  await Promise.all([waitForHealth(hopNodeA), waitForHealth(hopNodeB), waitForHealth(hopNodeC)]);

  const hopCreateResponse = await fetch(`${hopNodeA.base}/api/v1/inquiries`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ...requestBody, customerName: "Three Node Client" }),
  });
  assert.equal(hopCreateResponse.status, 201);
  const hopCreated = await hopCreateResponse.json();
  const hopSourceDb = new Database(hopDbPaths.a, { readonly: true });
  const hopSourceRecord = hopSourceDb.prepare("SELECT id FROM inquiries WHERE tracking_code = ?").get(hopCreated.trackingCode);
  hopSourceDb.close();
  assert(hopSourceRecord);

  const hopAtB = await waitForTracking(hopNodeB, hopCreated.trackingCode);
  const hopAtC = await waitForTracking(hopNodeC, hopCreated.trackingCode);
  assert.equal(hopAtB.data.productName, products[0].name);
  assert.equal(hopAtC.data.productName, products[0].name);

  await waitForOutboxState(hopDbPaths.a, hopSourceRecord.id, "web-hop-b", (row) => !row, "delivery to middle peer");
  await waitForOutboxState(hopDbPaths.b, hopSourceRecord.id, "web-hop-c", (row) => !row, "forwarding to final peer");
  await waitForOutboxState(hopDbPaths.c, hopSourceRecord.id, "web-hop-b", (row) => !row, "duplicate echo acknowledgement");

  for (const [label, dbPath] of Object.entries(hopDbPaths)) {
    const db = new Database(dbPath, { readonly: true });
    try {
      const stored = db.prepare("SELECT COUNT(*) AS count, MIN(origin_node_id) AS originNodeId FROM inquiries WHERE id = ?").get(hopSourceRecord.id);
      assert.equal(stored.count, 1, `${label} must store exactly one copy of the inquiry`);
      assert.equal(stored.originNodeId, "web-hop-a", `${label} must preserve the original node ID`);
      assert.equal(db.prepare("SELECT COUNT(*) AS count FROM sync_outbox WHERE inquiry_id = ?").get(hopSourceRecord.id).count, 0, `${label} outbox must drain`);
      assert.equal(db.prepare("SELECT COUNT(*) AS count FROM sync_conflicts WHERE inquiry_id = ?").get(hopSourceRecord.id).count, 0, `${label} must not record a conflict`);
    } finally {
      db.close();
    }
  }

  console.log("API smoke tests passed: local API, validation, rate limits, peer replication, conflict safety, offline outbox recovery after restart, three-node forwarding without loops, sync auth, and sync-off default.");
} finally {
  for (const node of processes) {
    if (node.child.exitCode === null) {
      const exited = once(node.child, "exit").catch(() => undefined);
      node.child.kill("SIGTERM");
      await Promise.race([exited, delay(3_000)]);
      if (node.child.exitCode === null) node.child.kill("SIGKILL");
    }
  }
  if (authServer?.listening) await new Promise((resolve) => authServer.close(resolve));
  rmSync(tempDir, { recursive: true, force: true });
}
