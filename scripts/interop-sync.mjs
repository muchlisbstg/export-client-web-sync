import assert from "node:assert/strict";
import { spawn, execFileSync } from "node:child_process";
import { once } from "node:events";
import { createServer as createNetServer } from "node:net";
import { appendFile, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import Database from "better-sqlite3";

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const mobileRoot = path.resolve(process.env.MOBILE_REPO ?? path.join(webRoot, "../export-client-mobile-sync"));
const desktopRoot = path.resolve(process.env.DESKTOP_REPO ?? path.join(webRoot, "../export-client-desktop-sync"));
const nodeIds = { web: "interop-web", mobile: "interop-mobile", desktop: "interop-desktop" };
const secret = "cross-repository-test-secret-not-for-production-2026";
const recordSelect = `SELECT id, tracking_code AS trackingCode, customer_name AS customerName,
  customer_email AS customerEmail, destination_country AS destinationCountry,
  product_id AS productId, quantity, unit, status, created_at AS createdAt,
  origin_node_id AS originNodeId FROM inquiries ORDER BY id`;
const dbCount = (db, table) => db.prepare(`SELECT COUNT(*) AS count FROM ${table}`).get().count;
const outputLimit = 12_000;

for (const [label, root, requiredFile] of [
  ["web", webRoot, "server/index.ts"],
  ["mobile", mobileRoot, "server/index.mjs"],
  ["desktop", desktopRoot, "electron/local-api.ts"],
]) {
  assert.ok(root && requiredFile, `${label} repository path must be configured`);
  try {
    await import("node:fs/promises").then(({ access }) => access(path.join(root, requiredFile)));
  } catch {
    throw new Error(`Cannot find ${label} backend at ${path.join(root, requiredFile)}. Set ${label.toUpperCase()}_REPO to its checkout path.`);
  }
}

const tempDir = await mkdtemp(path.join(os.tmpdir(), "export-client-interop-"));
const emptyEnvPath = path.join(tempDir, "empty.env");
await writeFile(emptyEnvPath, "", { mode: 0o600 });
let webChild;
let webDb;
let mobileService;
let desktopService;
let mobileDb;
let desktopDb;

async function allocatePort() {
  const probe = createNetServer();
  probe.listen(0, "127.0.0.1");
  await once(probe, "listening");
  const address = probe.address();
  assert(address && typeof address === "object");
  const port = address.port;
  const closed = once(probe, "close");
  probe.close();
  await closed;
  return port;
}

function startWeb({ port, dbPath, peers }) {
  let output = "";
  let spawnError;
  const child = spawn(process.execPath, ["--import", "tsx", "server/index.ts"], {
    cwd: webRoot,
    env: {
      ...process.env,
      API_HOST: "127.0.0.1",
      API_PORT: String(port),
      DB_PATH: dbPath,
      DOTENV_CONFIG_PATH: emptyEnvPath,
      NODE_ENV: "test",
      WEB_ORIGINS: "http://localhost:5173",
      RFQ_LIMIT_PER_15M: "100",
      TRACK_LOOKUP_LIMIT_PER_15M: "100",
      SYNC_NODE_ID: nodeIds.web,
      SYNC_SHARED_SECRET: secret,
      SYNC_PEERS: peers,
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  const collect = (chunk) => { output = `${output}${chunk.toString()}`.slice(-outputLimit); };
  child.stdout.on("data", collect);
  child.stderr.on("data", collect);
  child.on("error", (error) => { spawnError = error; });
  webChild = { child, base: `http://127.0.0.1:${port}`, dbPath, getOutput: () => output, getSpawnError: () => spawnError };
  return webChild;
}

async function waitForHealth(node) {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const exitError = node.child.exitCode !== null || node.getSpawnError();
    if (exitError) throw new Error(`Web API exited before becoming healthy:\n${node.getOutput()}\n${node.getSpawnError() ?? ""}`);
    try {
      const response = await fetch(`${node.base}/health`, { signal: AbortSignal.timeout(1_000) });
      if (response.ok) {
        const health = await response.json();
        assert.deepEqual(health, {
          status: "ok",
          nodeId: nodeIds.web,
          syncEnabled: true,
          syncStatus: { enabled: true, peerCount: 2, pendingDeliveries: 0, retryingDeliveries: 0, conflicts: 0 },
        });
        return;
      }
    } catch {
      // The child process may need a moment to bind its isolated test port.
    }
    await delay(100);
  }
  throw new Error(`Web API did not become healthy:\n${node.getOutput()}`);
}

async function stopWeb() {
  if (!webChild || webChild.child.exitCode !== null) return;
  const exited = once(webChild.child, "exit").catch(() => undefined);
  webChild.child.kill("SIGTERM");
  await Promise.race([exited, delay(3_000)]);
  if (webChild.child.exitCode === null) {
    webChild.child.kill("SIGKILL");
    await Promise.race([once(webChild.child, "exit").catch(() => undefined), delay(1_000)]);
  }
}

async function waitForConvergence(databases, expectedRecords) {
  const deadline = Date.now() + 20_000;
  let lastState = "not yet checked";
  while (Date.now() < deadline) {
    const snapshots = databases.map(({ name, db }) => ({
      name,
      records: db.prepare(recordSelect).all(),
      outboxCount: dbCount(db, "sync_outbox"),
      conflictCount: dbCount(db, "sync_conflicts"),
    }));
    const converged = snapshots.every(({ records, outboxCount, conflictCount }) =>
      JSON.stringify(records) === JSON.stringify(expectedRecords) && outboxCount === 0 && conflictCount === 0);
    if (converged) return snapshots;
    lastState = snapshots.map(({ name, records, outboxCount, conflictCount }) =>
      `${name}: records=${records.length}, outbox=${outboxCount}, conflicts=${conflictCount}`).join("; ");
    await delay(100);
  }
  throw new Error(`Three-backend sync did not converge within 20 seconds (${lastState})`);
}

async function createInquiry(base, source, index) {
  const response = await fetch(`${base}/api/v1/inquiries`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      customerName: `Interop Synthetic ${source}`,
      customerEmail: `interop-${source.toLowerCase()}@example.invalid`,
      destinationCountry: "Japan",
      productId: "green-coffee",
      quantity: 100 + index,
    }),
  });
  const body = await response.json();
  assert.equal(response.status, 201, `${source} inquiry creation failed: ${JSON.stringify(body)}`);
  assert.match(body.trackingCode, /^[A-F0-9]{24}$/);
  return body;
}

function repositoryRevision(root) {
  try {
    return execFileSync("git", ["rev-parse", "--short", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
  } catch {
    return "unknown";
  }
}

try {
  const [webPort, mobilePort, desktopPort] = await Promise.all([allocatePort(), allocatePort(), allocatePort()]);
  const webBase = `http://127.0.0.1:${webPort}`;
  const mobileBase = `http://127.0.0.1:${mobilePort}`;
  const desktopBase = `http://127.0.0.1:${desktopPort}`;
  const dbPaths = {
    web: path.join(tempDir, "web.sqlite"),
    mobile: path.join(tempDir, "mobile.sqlite"),
    desktop: path.join(tempDir, "desktop.sqlite"),
  };
  const peers = {
    web: `${nodeIds.mobile}=${mobileBase},${nodeIds.desktop}=${desktopBase}`,
    mobile: `${nodeIds.web}=${webBase},${nodeIds.desktop}=${desktopBase}`,
    desktop: [
      { nodeId: nodeIds.web, url: webBase },
      { nodeId: nodeIds.mobile, url: mobileBase },
    ],
  };

  startWeb({ port: webPort, dbPath: dbPaths.web, peers: peers.web });
  await waitForHealth(webChild);

  // Import mobile source from an empty temporary working directory so a developer's
  // local .env.api file is never read as part of this synthetic-only test.
  const originalCwd = process.cwd();
  let mobileModule;
  try {
    process.chdir(tempDir);
    mobileModule = await import(pathToFileURL(path.join(mobileRoot, "server/index.mjs")).href);
  } finally {
    process.chdir(originalCwd);
  }
  mobileService = mobileModule.createServer({
    envFile: path.join(tempDir, "no-such-mobile-env"),
    host: "127.0.0.1",
    port: mobilePort,
    nodeId: nodeIds.mobile,
    syncSecret: secret,
    syncPeers: peers.mobile,
    dbPath: dbPaths.mobile,
  });
  const mobileStarted = await mobileService.start();
  assert.equal(mobileStarted.port, mobilePort);
  mobileDb = mobileService.db;

  const desktopModule = await import(pathToFileURL(path.join(desktopRoot, "electron/local-api.ts")).href);
  desktopService = await desktopModule.startLocalApi({
    dbPath: dbPaths.desktop,
    port: desktopPort,
    host: "127.0.0.1",
    nodeId: nodeIds.desktop,
    sharedSecret: secret,
    peers: peers.desktop,
  });
  desktopDb = desktopService.db;

  const origins = [
    { name: "Web", nodeId: nodeIds.web, base: webBase },
    { name: "Mobile", nodeId: nodeIds.mobile, base: mobileBase },
    { name: "Desktop", nodeId: nodeIds.desktop, base: desktopBase },
  ];
  const created = [];
  for (let index = 0; index < origins.length; index += 1) {
    const origin = origins[index];
    const response = await createInquiry(origin.base, origin.name, index);
    created.push({ ...origin, trackingCode: response.trackingCode, createdAt: response.createdAt });
  }

  webDb = new Database(dbPaths.web, { readonly: true, fileMustExist: true });
  const databases = [
    { name: "web", db: webDb },
    { name: "mobile", db: mobileDb },
    { name: "desktop", db: desktopDb },
  ];
  const sourceRecords = created.map(({ name, nodeId, trackingCode }) => {
    const sourceDb = databases.find(({ name: dbName }) => dbName === name.toLowerCase())?.db;
    assert(sourceDb, `Missing source database for ${name}`);
    const record = sourceDb.prepare(`${recordSelect.replace(" ORDER BY id", " WHERE tracking_code = ?")}`).get(trackingCode);
    assert(record, `Could not read synthetic inquiry created by ${name}`);
    assert.equal(record.originNodeId, nodeId, `${name} record must start with its own origin ID`);
    return record;
  }).sort((left, right) => left.id.localeCompare(right.id));

  const snapshots = await waitForConvergence(databases, sourceRecords);
  assert.equal(snapshots.length, 3);
  for (const snapshot of snapshots) {
    assert.equal(snapshot.records.length, 3, `${snapshot.name} database must contain all 3 inquiries exactly once`);
    assert.equal(dbCount(databases.find(({ name }) => name === snapshot.name).db, "inquiries"), 3);
  }
  assert.equal(snapshots.reduce((total, snapshot) => total + snapshot.records.length, 0), 9);

  for (const origin of origins) {
    for (const record of sourceRecords) {
      const response = await fetch(`${origin.base}/api/v1/inquiries/${record.trackingCode}`);
      assert.equal(response.status, 200, `${origin.name} tracking endpoint must expose replicated record ${record.originNodeId}`);
      const body = await response.json();
      assert.deepEqual(body.data, {
        status: record.status,
        createdAt: record.createdAt,
        productName: "Kopi Arabika hijau",
      });
      assert.equal("customerEmail" in body.data, false, "public tracking response must not expose customer email");
    }
  }

  const collisionId = "33333333-3333-4333-8333-333333333333";
  let duplicateReplays = 0;
  let recordMismatchConflicts = 0;
  let trackingCodeCollisions = 0;

  for (const origin of origins) {
    // A receiver must only acknowledge a replay from a configured remote peer.
    // Selecting a source independently for each target avoids nondeterministically
    // replaying a node's own record back to itself (which is correctly rejected).
    const duplicateCandidate = sourceRecords.find((record) => record.originNodeId !== origin.nodeId);
    assert(duplicateCandidate, `${origin.name} must receive a replay from a configured remote peer`);
    const targetDatabase = databases.find(({ name }) => name === origin.name.toLowerCase())?.db;
    assert(targetDatabase, `Missing database for ${origin.name}`);
    const sendSyncRecord = (record) => fetch(`${origin.base}/api/v1/sync/inquiries`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${secret}` },
      body: JSON.stringify(record),
    });

    const duplicateResponse = await sendSyncRecord(duplicateCandidate);
    assert.equal(duplicateResponse.status, 200, `${origin.name} must acknowledge an identical replay`);
    assert.deepEqual(await duplicateResponse.json(), { result: "duplicate" });
    duplicateReplays += 1;

    const mismatchResponse = await sendSyncRecord({ ...duplicateCandidate, customerName: "Conflicting Synthetic Payload" });
    assert.equal(mismatchResponse.status, 409, `${origin.name} must reject a changed payload with the same inquiry ID`);
    const mismatchBody = await mismatchResponse.json();
    assert.equal(mismatchBody.error, "sync_conflict");
    assert.match(mismatchBody.existingHash, /^[a-f0-9]{64}$/);
    assert.match(mismatchBody.incomingHash, /^[a-f0-9]{64}$/);
    const storedOriginal = targetDatabase.prepare(
      "SELECT customer_name AS customerName FROM inquiries WHERE id = ?",
    ).get(duplicateCandidate.id);
    assert.equal(storedOriginal.customerName, duplicateCandidate.customerName, `${origin.name} must preserve the original record`);
    const mismatchConflict = targetDatabase.prepare(
      "SELECT reason FROM sync_conflicts WHERE inquiry_id = ?",
    ).get(duplicateCandidate.id);
    assert.equal(mismatchConflict.reason, "record_mismatch");
    recordMismatchConflicts += 1;

    const collisionResponse = await sendSyncRecord({
      ...duplicateCandidate,
      id: collisionId,
      customerName: "Synthetic Tracking-Code Collision",
    });
    assert.equal(collisionResponse.status, 409, `${origin.name} must reject a reused tracking code with a different inquiry ID`);
    const collisionBody = await collisionResponse.json();
    assert.equal(collisionBody.error, "sync_conflict");
    assert.match(collisionBody.existingHash, /^[a-f0-9]{64}$/);
    assert.match(collisionBody.incomingHash, /^[a-f0-9]{64}$/);
    const collisionConflict = targetDatabase.prepare(
      "SELECT reason FROM sync_conflicts WHERE inquiry_id = ?",
    ).get(collisionId);
    assert.equal(collisionConflict.reason, "tracking_code_collision");
    const preservedRecord = targetDatabase.prepare(
      recordSelect.replace(" ORDER BY id", " WHERE id = ?"),
    ).get(duplicateCandidate.id);
    assert.deepEqual(preservedRecord, duplicateCandidate, `${origin.name} must preserve every original inquiry field after conflict rejection`);
    assert.equal(dbCount(targetDatabase, "inquiries"), 3, `${origin.name} must not insert a collision record`);
    assert.equal(dbCount(targetDatabase, "sync_outbox"), 0, `${origin.name} must keep its outbox drained`);
    assert.equal(dbCount(targetDatabase, "sync_conflicts"), 2, `${origin.name} must durably record both rejected conflicts`);
    trackingCodeCollisions += 1;
  }

  assert.equal(duplicateReplays, 3, "Each backend must acknowledge one duplicate replay");
  assert.equal(recordMismatchConflicts, 3, "Each backend must reject one conflicting payload");
  assert.equal(trackingCodeCollisions, 3, "Each backend must reject one tracking-code collision");

  const revisions = {
    web: repositoryRevision(webRoot),
    mobile: repositoryRevision(mobileRoot),
    desktop: repositoryRevision(desktopRoot),
  };
  const result = `PASS cross-repository sync: 3 synthetic inquiries created across 3 actual backends; 9 total SQLite rows (3 per database); origin IDs preserved; 3 duplicate replays acknowledged; 3 record mismatches and 3 tracking-code collisions rejected without overwrite; all outboxes drained; 6 conflict records.\nRevisions: web=${revisions.web}, mobile=${revisions.mobile}, desktop=${revisions.desktop}`;
  console.log(result);
  if (process.env.GITHUB_STEP_SUMMARY) {
    await appendFile(process.env.GITHUB_STEP_SUMMARY,
      `### Cross-repository synchronization\n\n` +
      `- Result: **passed**\n` +
      `- Synthetic inquiries: **3**; total records across three temporary SQLite databases: **9**\n` +
      `- Origin IDs: preserved; outboxes: drained; duplicate replays: **3**\n` +
      `- Conflict regressions: **3** record mismatches and **3** tracking-code collisions rejected without overwrite; **6** durable conflict records\n` +
      `- Revisions: web \`${revisions.web}\`, mobile \`${revisions.mobile}\`, desktop \`${revisions.desktop}\`\n`);
  }
} finally {
  if (webDb?.open) webDb.close();
  if (desktopService) await desktopService.close();
  if (mobileService) await mobileService.close();
  await stopWeb();
  await rm(tempDir, { recursive: true, force: true });
}
