import { createHash, timingSafeEqual } from "node:crypto";
import type Database from "better-sqlite3";
import type { InquiryRecord } from "./database";

export type SyncPeer = { nodeId: string; baseUrl: string };

type InquiryRow = InquiryRecord;

type SyncOptions = {
  db: Database.Database;
  nodeId: string;
  secret: string;
  peers: SyncPeer[];
  fetcher?: typeof fetch;
};

const selectInquiry = `
  SELECT id, tracking_code AS trackingCode, customer_name AS customerName,
         customer_email AS customerEmail, destination_country AS destinationCountry,
         product_id AS productId, quantity, unit, status, created_at AS createdAt,
         origin_node_id AS originNodeId
  FROM inquiries WHERE id = ?`;

function normalizedRecord(record: InquiryRecord): InquiryRecord {
  return {
    id: record.id,
    trackingCode: record.trackingCode,
    customerName: record.customerName,
    customerEmail: record.customerEmail,
    destinationCountry: record.destinationCountry,
    productId: record.productId,
    quantity: record.quantity,
    unit: record.unit,
    status: record.status,
    createdAt: record.createdAt,
    originNodeId: record.originNodeId,
  };
}

export function hashInquiry(record: InquiryRecord): string {
  return createHash("sha256").update(JSON.stringify(normalizedRecord(record))).digest("hex");
}

export function parseSyncPeers(raw: string, localNodeId: string): SyncPeer[] {
  const peers: SyncPeer[] = [];
  const seen = new Set<string>();
  for (const entry of raw.split(",").map((part) => part.trim()).filter(Boolean)) {
    const separator = entry.indexOf("=");
    if (separator <= 0) throw new Error(`SYNC_PEERS entry must use nodeId=url: ${entry.split("=")[0] || "(empty)"}`);
    const nodeId = entry.slice(0, separator).trim();
    const rawUrl = entry.slice(separator + 1).trim();
    if (!/^[A-Za-z0-9._-]{1,80}$/.test(nodeId)) throw new Error(`Invalid peer node ID: ${nodeId}`);
    if (nodeId === localNodeId) throw new Error("SYNC_PEERS cannot contain this node's own ID.");
    if (seen.has(nodeId)) throw new Error(`Duplicate peer node ID: ${nodeId}`);

    let url: URL;
    try {
      url = new URL(rawUrl);
    } catch {
      throw new Error(`Invalid SYNC_PEERS URL for ${nodeId}.`);
    }
    if (!(url.protocol === "http:" || url.protocol === "https:") || url.username || url.password || url.search || url.hash) {
      throw new Error(`Peer URL for ${nodeId} must be HTTP(S) without credentials, query, or fragment.`);
    }
    const loopback = ["localhost", "127.0.0.1", "::1", "[::1]"].includes(url.hostname);
    if (url.protocol === "http:" && !loopback) {
      throw new Error(`Peer ${nodeId} must use HTTPS unless it is a loopback development URL.`);
    }
    seen.add(nodeId);
    peers.push({ nodeId, baseUrl: `${url.origin}${url.pathname.replace(/\/+$/, "")}` });
  }
  return peers;
}

export function isValidSyncSecret(secret: string): boolean {
  return secret.length >= 32;
}

export function matchesSyncSecret(header: string | undefined, expected: string): boolean {
  const match = header?.match(/^Bearer (.+)$/i);
  if (!match || !expected) return false;
  const actual = Buffer.from(match[1]);
  const wanted = Buffer.from(expected);
  return actual.length === wanted.length && timingSafeEqual(actual, wanted);
}

export function createSyncCoordinator(options: SyncOptions) {
  const { db, nodeId, secret, peers } = options;
  const fetcher = options.fetcher ?? fetch;
  const syncEnabled = Boolean(secret);
  let flushing = false;
  let timer: NodeJS.Timeout | undefined;

  function queueRecord(id: string, originNodeId: string) {
    if (!secret || !peers.length) return;
    const insert = db.prepare(`
      INSERT OR IGNORE INTO sync_outbox (inquiry_id, peer_node_id, peer_url, next_attempt_at_ms)
      VALUES (?, ?, ?, 0)
    `);
    const transaction = db.transaction(() => {
      for (const peer of peers) {
        if (peer.nodeId === nodeId || peer.nodeId === originNodeId) continue;
        insert.run(id, peer.nodeId, peer.baseUrl);
      }
    });
    transaction();
    void flushOutbox();
  }

  function addConflict(id: string, peerNodeId: string, existing: InquiryRecord, incoming: InquiryRecord, reason: string) {
    db.prepare(`
      INSERT INTO sync_conflicts (inquiry_id, peer_node_id, existing_hash, incoming_hash, reason, detected_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, peerNodeId, hashInquiry(existing), hashInquiry(incoming), reason, new Date().toISOString());
  }

  function receive(record: InquiryRecord, peerNodeId: string) {
    const existingById = db.prepare(selectInquiry).get(record.id) as InquiryRow | undefined;
    const existingByCode = db.prepare(`${selectInquiry.replace("WHERE id = ?", "WHERE tracking_code = ?")}`).get(record.trackingCode) as InquiryRow | undefined;
    const existing = existingById ?? existingByCode;
    if (existing) {
      if (hashInquiry(existing) === hashInquiry(record)) return { result: "duplicate" as const };
      const reason = existing.id === record.id ? "record_mismatch" : "tracking_code_collision";
      addConflict(record.id, peerNodeId, existing, record, reason);
      return {
        result: "conflict" as const,
        existingHash: hashInquiry(existing),
        incomingHash: hashInquiry(record),
      };
    }

    const product = db.prepare("SELECT id, unit FROM products WHERE id = ? AND active = 1").get(record.productId) as { id: string; unit: string } | undefined;
    if (!product || product.unit !== record.unit) return { result: "product_not_found" as const };

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
    queueRecord(record.id, record.originNodeId);
    return { result: "inserted" as const };
  }

  async function flushOutbox() {
    if (flushing || !secret || !peers.length) return;
    flushing = true;
    try {
      const due = db.prepare(`
        SELECT o.inquiry_id AS inquiryId, o.peer_node_id AS peerNodeId,
               o.peer_url AS peerUrl, o.attempt_count AS attemptCount
        FROM sync_outbox o WHERE o.next_attempt_at_ms <= ?
        ORDER BY o.next_attempt_at_ms LIMIT 20
      `).all(Date.now()) as Array<{ inquiryId: string; peerNodeId: string; peerUrl: string; attemptCount: number }>;
      for (const item of due) {
        const record = db.prepare(selectInquiry).get(item.inquiryId) as InquiryRow | undefined;
        if (!record) {
          db.prepare("DELETE FROM sync_outbox WHERE inquiry_id = ? AND peer_node_id = ?").run(item.inquiryId, item.peerNodeId);
          continue;
        }
        try {
          const response = await fetcher(`${item.peerUrl}/api/v1/sync/inquiries`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${secret}`, "x-sync-peer": nodeId },
            body: JSON.stringify(normalizedRecord(record)),
            signal: AbortSignal.timeout(5_000),
          });
          if (response.ok) {
            db.prepare("DELETE FROM sync_outbox WHERE inquiry_id = ? AND peer_node_id = ?").run(item.inquiryId, item.peerNodeId);
          } else if (response.status === 409) {
            const body = await response.json().catch(() => ({})) as { existingHash?: string; incomingHash?: string };
            db.prepare(`
              INSERT INTO sync_conflicts (inquiry_id, peer_node_id, existing_hash, incoming_hash, reason, detected_at)
              VALUES (?, ?, ?, ?, 'remote_conflict', ?)
            `).run(item.inquiryId, item.peerNodeId, body.existingHash ?? hashInquiry(record), body.incomingHash ?? "unknown", new Date().toISOString());
            db.prepare("DELETE FROM sync_outbox WHERE inquiry_id = ? AND peer_node_id = ?").run(item.inquiryId, item.peerNodeId);
          } else {
            throw new Error(`peer_http_${response.status}`);
          }
        } catch (error) {
          const attemptCount = item.attemptCount + 1;
          const waitMs = Math.min(300_000, 1_000 * 2 ** Math.min(attemptCount, 8));
          db.prepare(`
            UPDATE sync_outbox SET attempt_count = ?, next_attempt_at_ms = ?, last_error = ?
            WHERE inquiry_id = ? AND peer_node_id = ?
          `).run(attemptCount, Date.now() + waitMs, error instanceof Error ? error.message.slice(0, 120) : "sync_error", item.inquiryId, item.peerNodeId);
        }
      }
    } finally {
      flushing = false;
    }
  }

  function start() {
    if (!secret) return;
    if (!isValidSyncSecret(secret)) throw new Error("SYNC_SHARED_SECRET must contain at least 32 characters.");
    if (peers.length > 0) {
      const all = db.prepare("SELECT id, origin_node_id AS originNodeId FROM inquiries").all() as Array<{ id: string; originNodeId: string }>;
      for (const record of all) queueRecord(record.id, record.originNodeId);
      timer = setInterval(() => void flushOutbox(), 2_000);
      timer.unref();
      void flushOutbox();
    }
  }

  function stop() {
    if (timer) clearInterval(timer);
  }

  return { syncEnabled, queueRecord, receive, start, stop, flushOutbox };
}
