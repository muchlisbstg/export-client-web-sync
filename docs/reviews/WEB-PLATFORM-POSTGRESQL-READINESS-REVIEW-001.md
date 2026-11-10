# WEB Platform PostgreSQL Readiness Review 001

- **Document ID:** WEB-PLATFORM-POSTGRESQL-READINESS-REVIEW-001
- **Repository:** `muchlisbstg/export-client-web-sync`
- **Review base:** `main` at `836821995c58293edadc982ae89f5519e1d4076b`
- **Review branch:** `review/web-platform-postgresql-readiness-2026-11-10`
- **Review date:** 2026-11-10
- **Review mode:** Source-level, read-only
- **Disposition:** NOT READY — PostgreSQL authoritative backend integration is not implemented or evidenced
- **Change boundary:** This document only. No application source, database, migration, CI workflow, deployment, or default-branch changes are authorized by this review.

## 1. Executive summary

The Web repository currently runs an Express API backed by local SQLite through `better-sqlite3`. Supabase Auth is used to validate bearer tokens, but tenant membership and transaction authorization are resolved from SQLite. The repository has no PostgreSQL driver or connection pool in its declared runtime dependencies, and the inspected API composition does not establish transaction-local PostgreSQL tenant/user context or enforce PostgreSQL RLS.

The repository also retains peer-to-peer synchronization paths. The tenant sync endpoint accepts a shared bearer secret plus a configured peer identifier, then upserts tenant, membership, and transaction records from the incoming bundle. The inquiry sync endpoint authenticates the shared secret but passes `originNodeId` from the payload to the sync coordinator; the inspected handler does not authenticate the `x-sync-peer` header. These are material provenance and authorization boundaries that must be resolved before synchronization can coexist safely with an authoritative PostgreSQL transaction service.

This review is a source-code assessment, not a runtime database audit. It does not prove the contents of any deployed SQLite file, Supabase staging schema, production configuration, or latest GitHub Actions execution. Earlier project-level PostgreSQL decisions DEC-001–DEC-008 are treated as normative design inputs, not as evidence that this Web repository implements them.

### 1.1 Overall disposition

| Workstream | Disposition | Evidence status |
|---|---|---|
| WEB-DB-01 | Source schema inventory documented | Partial: source only; no runtime DB inspection |
| WEB-AUTH-01 | Auth/membership gap documented | Partial: source only |
| WEB-API-01 | Target API contract proposed | Design proposal; not implemented |
| WEB-SYNC-01 | Peer provenance and write-authority gaps documented | Source evidence; runtime exploitability not tested |
| WEB-TEST-01 | Acceptance matrix defined | Tests not executed as part of this review |
| WEB-REVIEW-01 | DEC and cross-platform gaps recorded | Open pending Web/Mobile/Desktop/PostgreSQL evidence |

**No schema freeze, database cutover, or production readiness approval is granted by this document.**

## 2. Scope, method, and evidence rules

### 2.1 Scope

This review covers six workstreams:

1. WEB-DB-01 — SQLite schema and Web data dependencies.
2. WEB-AUTH-01 — Supabase Auth, admin authorization, and tenant membership.
3. WEB-API-01 — API contract against the PostgreSQL authoritative backend.
4. WEB-SYNC-01 — Peer-to-peer synchronization provenance and authorization.
5. WEB-TEST-01 — Negative-access, security, concurrency, and parity acceptance tests.
6. WEB-REVIEW-01 — Reconciliation with DEC-001–DEC-008 and cross-platform contracts.

### 2.2 Evidence baseline

The following repository state was inspected:

- Repository: `muchlisbstg/export-client-web-sync`
- Branch: `main`
- Commit: `836821995c58293edadc982ae89f5519e1d4076b`
- Commit title: `fix(sync): identify Web peer on outbound sync`
- Commit date: 2026-11-04
- Relevant source: `package.json`, `server/database.ts`, `server/auth.ts`, `server/index.ts`, `server/sync.ts`, `scripts/migrate-tenant-isolation.mjs`, `scripts/interop-sync.mjs`, `test/auth.test.mjs`, `test/tenant-migration.test.mjs`, and `.github/workflows/ci.yml`.

Evidence links:

- [Reviewed base commit](https://github.com/muchlisbstg/export-client-web-sync/commit/836821995c58293edadc982ae89f5519e1d4076b)
- [package.json](https://github.com/muchlisbstg/export-client-web-sync/blob/main/package.json)
- [server/database.ts](https://github.com/muchlisbstg/export-client-web-sync/blob/main/server/database.ts)
- [server/auth.ts](https://github.com/muchlisbstg/export-client-web-sync/blob/main/server/auth.ts)
- [server/index.ts](https://github.com/muchlisbstg/export-client-web-sync/blob/main/server/index.ts)
- [server/sync.ts](https://github.com/muchlisbstg/export-client-web-sync/blob/main/server/sync.ts)
- [tenant migration script](https://github.com/muchlisbstg/export-client-web-sync/blob/main/scripts/migrate-tenant-isolation.mjs)
- [interoperability script](https://github.com/muchlisbstg/export-client-web-sync/blob/main/scripts/interop-sync.mjs)
- [auth tests](https://github.com/muchlisbstg/export-client-web-sync/blob/main/test/auth.test.mjs)
- [tenant migration tests](https://github.com/muchlisbstg/export-client-web-sync/blob/main/test/tenant-migration.test.mjs)
- [CI workflow](https://github.com/muchlisbstg/export-client-web-sync/blob/main/.github/workflows/ci.yml)

A source-level statement is not treated as proof of deployed runtime state. A test file or workflow definition is not treated as proof that the test passed. No live credentials, business records, or production data were requested or inspected.

### 2.3 Severity definitions

- **CRITICAL:** Directly conflicts with a P0 security/domain invariant or permits a high-impact authority boundary failure if exercised.
- **HIGH:** Material authorization, provenance, data-integrity, or tenant-isolation gap requiring closure before production transaction handling.
- **MEDIUM:** Operational or contract weakness that must be addressed before the affected capability is approved.
- **LOW:** Documentation or maintainability issue with limited direct security impact.
- **INFO:** Verified architectural fact or dependency.

Severity describes the risk indicated by the inspected source; it is not a claim that a vulnerability has been exploited.

## 3. WEB-DB-01 — SQLite schema and data dependency inventory

**Disposition:** PARTIAL — source inventory only.

### 3.1 Persistence architecture

The runtime database factory in `server/database.ts` creates a SQLite database using `better-sqlite3`. It enables WAL mode and foreign-key enforcement. The database path is selected from `DB_PATH`, otherwise defaults to `data/export-client.sqlite`.

The package manifest declares `better-sqlite3` and does not declare a PostgreSQL client or pool dependency. The inspected server startup imports `createDatabase()` and uses that SQLite handle for product, inquiry, tenant, membership, transaction, and synchronization operations.

### 3.2 Source schema inventory

The source definitions and tenant migration establish or reference the following tables:

| Table | Observed purpose | Data classification | Authority concern |
|---|---|---|---|
| `products` | Product catalogue and active flag | Reference data | Must be sourced from canonical catalogue authority or explicitly cached |
| `inquiries` | RFQ/inquiry details, tracking code, customer contact, product, quantity, status, origin node | Business data; includes personal/contact data | Must define ownership, access policy, retention, and authoritative write path |
| `sync_outbox` | Per-inquiry delivery queue per peer | Integration state | Local delivery state; not domain authority |
| `sync_conflicts` | Existing/incoming hashes and conflict reason | Integration/audit metadata | Must retain trustworthy provenance and operational retention |
| `tenants` | Buyer/Seller tenant identity and status | Identity/domain | Must reconcile to canonical tenant/legal-party model |
| `tenant_memberships` | User-to-tenant role and status | Authorization data | Must move to authoritative membership resolver |
| `commercial_transactions` | Buyer/Seller tenant transaction relationship and lifecycle status | Core business transaction | Must be PostgreSQL authoritative |
| `tenant_sync_outbox` | Tenant/transaction bundle event queue | Integration state; payload includes membership data | Must not become an alternate authorization authority |

The first four tables are created by the base database factory. Tenant migration code and runtime paths establish the tenant tables and tenant sync outbox. The complete physical schema, migration order, indexes, triggers, and deployed database state have not been independently inspected; the list above is a source inventory, not a runtime catalog dump.

### 3.3 Observed data dependencies

- `products` are read by the catalogue API and inquiry creation path.
- `inquiries` are created through the public inquiry endpoint and read by tracking-code lookup.
- `sync_outbox` is used by inquiry peer delivery.
- `sync_conflicts` records conflicting inbound inquiry synchronization.
- `tenants` and `tenant_memberships` are read by active-tenant authorization.
- `commercial_transactions` are read and mutated by transaction endpoints.
- `tenant_sync_outbox` queues transaction bundles that include tenant and membership records for peer synchronization.

### 3.4 Findings

| ID | Severity | Finding | Evidence |
|---|---|---|---|
| WEB-DB-001 | CRITICAL | SQLite is the current runtime persistence for membership and commercial transaction operations; PostgreSQL is not wired into this API composition. | `package.json`, `server/database.ts`, `server/index.ts` |
| WEB-DB-002 | HIGH | The transaction and membership model is still Buyer/Seller-centric and does not demonstrate the canonical Supplier participant relationship. | Tenant types and transaction bundle in `server/index.ts`; migration script |
| WEB-DB-003 | HIGH | Tenant sync outbox payload includes tenant and membership records, allowing authorization state to travel through a peer replication path. | `readTenantBundle()`, `enqueueTenantBundle()` in `server/index.ts` |
| WEB-DB-004 | HIGH | Inquiry records contain customer name/email and are exposed by a tracking-code lookup path; tracking code functions as a bearer lookup credential. | Inquiry schema and `GET /api/v1/inquiries/:trackingCode` |
| WEB-DB-005 | MEDIUM | Runtime schema is created and altered by application startup code rather than a demonstrated versioned PostgreSQL migration chain. | `createDatabase()` and migration logic in `server/database.ts` |

### 3.5 Acceptance criteria

WEB-DB-01 can be closed only when:

- [ ] A complete SQLite schema inventory is produced from a disposable copy or sanitized schema-only export, including columns, types, nullability, PK, FK, unique/check constraints, indexes, triggers, and migration/version state.
- [ ] Every Web route and service is mapped to its tables, reads, writes, transaction boundaries, and data classification.
- [ ] Each table/field is classified as authoritative domain data, derived projection, local cache, offline command, or integration metadata.
- [ ] Canonical PostgreSQL entities and constraints are mapped to the Web data model without inventing schema before DB-01/SEC-01 staging evidence.
- [ ] Customer/contact fields and tracking-code access receive explicit authorization, rate-limit, retention, and audit requirements.
- [ ] No peer-sync mechanism can silently become an authority for membership or commercial transaction state.

## 4. WEB-AUTH-01 — Supabase Auth, admin authorization, and membership

**Disposition:** PARTIAL — token verification exists; tenant authorization remains SQLite-backed.

### 4.1 Observed authentication behavior

`server/auth.ts` extracts a bearer token, calls Supabase `/auth/v1/user`, and uses the returned user ID as the authenticated identity. Missing or invalid tokens are rejected; provider failure returns a service-unavailable response.

The same module derives an `admin` or `customer` role from the `ADMIN_USER_IDS` environment variable. This is a static allowlist, not a PostgreSQL role/membership resolver.

### 4.2 Observed tenant authorization behavior

The `requireActiveTenant` middleware in `server/index.ts`:

1. Requires tenant schema readiness in SQLite.
2. Reads `x-active-tenant-id` from the request.
3. Joins SQLite `tenants` and `tenant_memberships` using authenticated user ID and selected tenant ID.
4. Checks tenant and membership status.
5. Stores the resulting membership data in response-local state.

The header is a tenant selector, not proof of membership. The current source does perform a membership lookup, but it does so against SQLite rather than the agreed PostgreSQL authority. The observed tenant type union is Buyer/Seller; Supplier authorization is not represented in this middleware contract.

### 4.3 Findings

| ID | Severity | Finding | Evidence |
|---|---|---|---|
| WEB-AUTH-001 | CRITICAL | Membership and tenant status are resolved from SQLite rather than authoritative PostgreSQL. | `requireActiveTenant()` in `server/index.ts` |
| WEB-AUTH-002 | HIGH | Administrative authorization is derived from `ADMIN_USER_IDS`, separate from the canonical membership/role authority. | `server/auth.ts` |
| WEB-AUTH-003 | HIGH | The tenant middleware models Buyer/Seller only; canonical Supplier participation and scoped permissions are not evidenced. | Tenant type and transaction routes in `server/index.ts` |
| WEB-AUTH-004 | MEDIUM | Active tenant selection is supplied through a request header. The current implementation checks it against membership, but future PostgreSQL integration must preserve that validation and must never trust the selector by itself. | `requireActiveTenant()` |
| WEB-AUTH-005 | MEDIUM | The inspected identity type reduces the provider identity to a user ID and local admin/customer role; no database-derived membership scope is attached at authentication time. | `AuthenticatedIdentity` in `server/auth.ts` |

### 4.4 Target authorization contract

- Verify the bearer token with Supabase Auth; obtain the stable verified user ID.
- Treat all client-supplied tenant, role, membership, legal-party, and site values as untrusted selectors or input.
- Resolve active membership and role/scope from PostgreSQL using a deliberately least-privileged resolver design.
- Reject absent, revoked, suspended, expired, or out-of-scope membership.
- Re-check authorization at the operation boundary; do not rely only on a previously selected tenant.
- Derive admin privileges from explicit authoritative permissions and audited governance, not a client claim or unreviewed static allowlist.
- Preserve independent Buyer, Seller, and Supplier identities and site-scoped operational access as required by the canonical decisions.

### 4.5 Acceptance criteria

- [ ] Auth tests cover missing, malformed, invalid, expired, and provider-unavailable token cases.
- [ ] Verified user identity cannot be overridden by request body, query, or custom headers.
- [ ] Membership resolver uses the authoritative PostgreSQL schema confirmed by DB-01/SEC-01.
- [ ] Resolver execution uses a least-privilege role; no superuser, service-role secret, or BYPASSRLS role is used as the ordinary resolver.
- [ ] Revoked/suspended/expired membership and tenant suspension are denied.
- [ ] Role and operational scope are resolved from authoritative records and tested for Buyer, Seller, and Supplier.
- [ ] Admin authority has explicit source, scope, revocation, audit, and break-glass governance.
- [ ] Cross-tenant negative-access tests pass against the actual API composition.

## 5. WEB-API-01 — Canonical API contract for PostgreSQL authoritative backend

**Disposition:** DESIGN PROPOSAL — no PostgreSQL production integration evidenced.

### 5.1 Target responsibilities

| Component | Responsibility | Must not do |
|---|---|---|
| Web client | Present UI; submit user intent; hold non-authoritative cache/offline queue | Assert trusted user/tenant/role identity |
| Supabase Auth | Verify user identity/session | Act as tenant membership database |
| Production API | Validate input, resolve authorization, execute business rules and transactions | Trust client-supplied authorization context |
| Membership resolver | Resolve active tenant membership, role, and scope | Use superuser/BYPASSRLS as normal resolver |
| PostgreSQL | Authoritative domain state, constraints, RLS, audit | Accept direct client database writes |
| SQLite/local storage | Cache, read model, offline command queue | Become competing transaction authority |
| Sync/replay service | Submit commands for server-side validation and idempotent processing | Blindly replicate membership or authoritative transaction rows |

### 5.2 Proposed request lifecycle

1. Validate request shape and rate limits.
2. Verify bearer token with Supabase Auth.
3. Obtain verified user ID from provider response.
4. Resolve active membership and required scope from PostgreSQL.
5. Acquire a connection from the API PostgreSQL pool.
6. Begin a transaction.
7. Set transaction-local user, tenant, membership, and request context on that same connection.
8. Execute authorization-aware domain operation under RLS and database constraints.
9. Commit on success or rollback on every failure path.
10. Release the connection only after transaction completion; verify context cannot leak on pool reuse.

Conceptual transaction-local context keys may include `app.user_id`, `app.tenant_id`, `app.membership_id`, and `app.request_id`. Exact key names and policies remain subject to the canonical DB design and staging audit; this document does not create schema.

### 5.3 Proposed API surface

| Domain | Proposed route | Contract requirement |
|---|---|---|
| Session | `GET /api/v1/session` | Verified identity and safe session summary; no trusted role from client metadata |
| Membership | `GET /api/v1/memberships` | Current user's active memberships only |
| Active tenant | `PUT /api/v1/session/active-tenant` | Treat tenant ID as selector; resolve and validate membership server-side |
| Catalogue | `GET /api/v1/catalog/products` | Read canonical catalogue projection with explicit visibility rules |
| Inquiry | `POST /api/v1/inquiries` | Authenticated or intentionally public policy, ownership, anti-abuse and tracking controls explicitly specified |
| Transactions | `GET/POST /api/v1/transactions` | Tenant-scoped authorization and authoritative PostgreSQL transaction |
| Transaction detail | `GET /api/v1/transactions/{id}` | Participant and tenant scope checked server-side |
| Transaction action | `POST /api/v1/transactions/{id}/actions` | Explicit state transition, participant authority, idempotency, and audit |
| Offline command replay | `POST /api/v1/sync/commands` | Revalidate current identity/membership; idempotent command processing; no direct row replication |

These routes are proposals, not claims about existing deployed endpoints. A canonical OpenAPI document must be generated/reconciled against the approved cross-platform contract before implementation.

### 5.4 Findings

| ID | Severity | Finding | Evidence |
|---|---|---|---|
| WEB-API-001 | CRITICAL | API composition has no PostgreSQL pool/transaction context and reads/writes authoritative business state in SQLite. | `package.json`, `server/index.ts`, `server/database.ts` |
| WEB-API-002 | HIGH | Transaction creation/status mutation is implemented directly in route handlers over SQLite, without demonstrated PostgreSQL RLS or DB-level canonical constraints. | Transaction routes in `server/index.ts` |
| WEB-API-003 | HIGH | Existing route contract and proposed canonical contract are not yet reconciled into a versioned OpenAPI artifact. | Inspected server routes; OpenAPI artifact not verified in reviewed paths |
| WEB-API-004 | MEDIUM | Public inquiry creation and tracking lookup need explicit product policy for authentication, ownership, privacy, and abuse prevention. | Inquiry routes in `server/index.ts` |

### 5.5 Acceptance criteria

- [ ] Canonical API contract is approved and versioned across Web, Mobile, Desktop, and backend.
- [ ] Every route has authentication, authorization, tenant scope, data classification, idempotency, and error semantics documented.
- [ ] PostgreSQL is the only authoritative writer for tenant membership and commercial transactions.
- [ ] Resolver and business query use the intended database role model and same transaction context.
- [ ] Transaction-local context is set and cleared safely across commit, rollback, exception, timeout, and cancellation.
- [ ] Database constraints enforce canonical composite keys and participant relationships.
- [ ] Public inquiry/tracking policies are explicitly approved and tested.
- [ ] No production cutover until parity, security, and operational rollback criteria are approved.

## 6. WEB-SYNC-01 — Peer provenance and peer-to-peer authorization

**Disposition:** HIGH-RISK DESIGN GAP — source evidence requires remediation and focused testing.

### 6.1 Observed behavior

The outbound inquiry sync change in commit `8368219` adds `x-sync-peer` to outbound requests. The interop test supplies the header using `duplicateCandidate.originNodeId`, which is the origin value in the record payload.

The inspected inbound inquiry sync route validates the shared sync secret, parses the payload, and calls:

```ts
sync.receive(parsed.data, parsed.data.originNodeId);
```

That route does not read or validate `x-sync-peer`. Therefore, the header addition on outbound requests does not establish authenticated peer identity at the receiving inquiry endpoint.

The tenant sync route checks a shared bearer secret and checks `x-sync-peer` against configured peers. It then accepts a `transaction.upsert` bundle and upserts tenant, membership, and transaction rows. This is an authorization-sensitive write path: a peer credential can carry membership and transaction state changes. The source does not demonstrate independent cryptographic peer identity or event-level authorization beyond the shared secret and configured peer identifier.

### 6.2 Findings

| ID | Severity | Finding | Evidence |
|---|---|---|---|
| WEB-SYNC-001 | CRITICAL | Inbound inquiry sync derives origin from payload `originNodeId`; receiver does not validate `x-sync-peer` in the inspected route. | `POST /api/v1/sync/inquiries` in `server/index.ts` |
| WEB-SYNC-002 | CRITICAL | Tenant sync can upsert tenant membership and transaction state from peer-supplied bundle under shared-secret authentication. | `POST /api/v1/sync/tenants`, `validTenantBundle()` |
| WEB-SYNC-003 | HIGH | Shared cluster secret plus caller-supplied peer ID does not independently prove the identity of each peer. | `SYNC_SHARED_SECRET`, `x-sync-peer`, peer parsing/checks |
| WEB-SYNC-004 | HIGH | Sync event authorization is not shown to be constrained by aggregate ownership, event type policy, or membership governance. | Tenant sync handler |
| WEB-SYNC-005 | HIGH | Sync and transaction authority are coupled to SQLite peer replication rather than a server-authoritative command API. | Outbox and sync handlers |
| WEB-SYNC-006 | MEDIUM | The current interoperability test uses the payload origin value as the sender peer header, so it does not establish an independent peer identity proof. | `scripts/interop-sync.mjs` |

### 6.3 Target boundary

- Prefer authenticated server-to-server identity per peer, with credential rotation and revocation; do not treat a shared secret as unique peer identity.
- Bind authenticated peer identity to an allowlisted peer record server-side.
- Never derive trusted origin solely from a payload field.
- Sign or otherwise integrity-protect events where required, including event ID, source identity, aggregate ID, sequence/version, timestamp, and payload digest.
- Apply strict event-type and aggregate authorization.
- Do not allow generic peer sync to create, revoke, elevate, or rewrite membership/role data.
- Do not let peers directly upsert authoritative commercial transaction rows.
- Convert offline sync into command submission; the authoritative API revalidates identity, current membership, domain rules, idempotency, and current state before applying.
- Preserve immutable provenance and conflict/audit history.

### 6.4 Acceptance criteria

- [ ] Spoofed `x-sync-peer` and spoofed `originNodeId` are independently rejected.
- [ ] A valid peer credential cannot impersonate another peer.
- [ ] Unknown, revoked, expired, or rotated peer credentials are rejected.
- [ ] Unauthorized event types and aggregate scopes are rejected.
- [ ] Membership and authorization mutations cannot be performed through generic sync.
- [ ] Replay and duplicate delivery are idempotent; stale sequence/version is rejected or reconciled.
- [ ] Payload tampering is detected.
- [ ] Audit provenance records authenticated peer, claimed origin, event ID, aggregate, timestamp, digest, decision, and result.
- [ ] Peer-sync tests run against the actual receiver API, not only a helper function or mocked adapter.

## 7. WEB-TEST-01 — Negative-access, concurrency, and parity acceptance matrix

**Disposition:** TEST PLAN DEFINED — no test execution or pass claim is made by this document.

### 7.1 Authentication and authorization

| Test ID | Scenario | Expected result |
|---|---|---|
| WEB-AUTH-T01 | Missing bearer token | 401 |
| WEB-AUTH-T02 | Invalid/expired bearer token | 401 |
| WEB-AUTH-T03 | Auth provider unavailable | Fail closed; service error, no DB operation |
| WEB-AUTH-T04 | Forged user ID in body/header | Ignored or rejected; verified identity remains authoritative |
| WEB-AUTH-T05 | Forged active tenant header | 403 unless current membership grants access |
| WEB-AUTH-T06 | Forged tenant ID in body/query | Cannot change resolved context |
| WEB-AUTH-T07 | Revoked/suspended/expired membership | 403 |
| WEB-AUTH-T08 | Cross-tenant read | No unauthorized row returned |
| WEB-AUTH-T09 | Cross-tenant write | Denied; no mutation |
| WEB-AUTH-T10 | Unauthorized role/action | 403 |
| WEB-AUTH-T11 | Supplier attempts prohibited contract/payment/ledger/goods-release action | Denied |
| WEB-AUTH-T12 | Site-scoped user accesses another site | Denied |

### 7.2 PostgreSQL roles, RLS, and connection pool

| Test ID | Scenario | Expected result |
|---|---|---|
| WEB-PG-T01 | API role privilege inspection | No SUPERUSER/BYPASSRLS; only required grants |
| WEB-PG-T02 | Resolver role privilege inspection | Least privilege; no superuser/service-role shortcut |
| WEB-PG-T03 | RLS on all in-scope tables | Coverage complete; forced where required |
| WEB-PG-T04 | Direct cross-tenant SELECT | No unauthorized rows |
| WEB-PG-T05 | Cross-tenant INSERT/UPDATE/DELETE | Rejected by policy/constraints |
| WEB-PG-T06 | Missing transaction context | Fail closed |
| WEB-PG-T07 | Context after COMMIT | No context leakage |
| WEB-PG-T08 | Context after ROLLBACK | No context leakage |
| WEB-PG-T09 | Pool reuse across two tenants/users | No cross-request context leakage |
| WEB-PG-T10 | Concurrent mixed-tenant requests | Isolation maintained under concurrency |
| WEB-PG-T11 | Error/timeout/cancellation path | Transaction rolled back and connection safely released |
| WEB-PG-T12 | Resolver membership revoked during lifecycle | Subsequent operation denied according to approved consistency semantics |

### 7.3 Transaction integrity and parity

| Test ID | Scenario | Expected result |
|---|---|---|
| WEB-PAR-T01 | Canonical participant uniqueness | Same canonical constraint semantics |
| WEB-PAR-T02 | Composite tenant/participant FK | Invalid cross-tenant reference rejected |
| WEB-PAR-T03 | Supplier participant lifecycle | Matches approved domain decision |
| WEB-PAR-T04 | Transaction-site assignment tuple | Exact tenant/transaction/participant/site tuple enforced |
| WEB-PAR-T05 | Transaction lifecycle transition | Same allowed transitions and actor authority |
| WEB-PAR-T06 | Concurrent temporal writes | No invalid overlapping/effective state |
| WEB-PAR-T07 | Offline command replay | Revalidated and idempotent |
| WEB-PAR-T08 | Multi-step failure | Atomic rollback |
| WEB-PAR-T09 | Audit history mutation | Immutable to application actor |
| WEB-PAR-T10 | PostgreSQL vs SQLite parity | Equivalent supported constraints and semantics; known intentional differences documented |

### 7.4 Sync security

| Test ID | Scenario | Expected result |
|---|---|---|
| WEB-SYNC-T01 | Missing/invalid peer credential | 401 |
| WEB-SYNC-T02 | Unknown or revoked peer | 403 |
| WEB-SYNC-T03 | Spoofed peer header | Rejected |
| WEB-SYNC-T04 | Spoofed payload origin | Rejected or retained only as untrusted claim |
| WEB-SYNC-T05 | Duplicate event replay | Idempotent acknowledgement |
| WEB-SYNC-T06 | Same event ID, altered payload | Rejected and audited |
| WEB-SYNC-T07 | Membership mutation through sync | Rejected |
| WEB-SYNC-T08 | Unauthorized transaction mutation through sync | Rejected |
| WEB-SYNC-T09 | Out-of-order/stale event | Rejected or safely reconciled |
| WEB-SYNC-T10 | Peer key rotation/revocation | Old key rejected after effective revocation |

### 7.5 Test evidence requirements

Every execution must preserve:

- repository, branch, exact commit SHA, workflow run URL and job result;
- PostgreSQL and SQLite versions;
- schema fingerprint and migration revision;
- sanitized role/policy inventory;
- test case ID, input class (synthetic), expected result, actual result;
- machine-readable JSON summary, exit status, and artifact manifest;
- clear PASS, FAIL, BLOCKED, or NOT_RUN status.

No test may be marked PASS solely because a test harness or fixture exists. A passing disposable fixture is not proof of production API integration.

## 8. WEB-REVIEW-01 — DEC and cross-platform reconciliation

**Disposition:** OPEN — dependent on canonical domain and database evidence.

The following mapping uses the current project decision register as supplied in the wider architecture review. It does not claim the Web repository implements these decisions.

| Decision | Normative requirement from the Mobile canonical decision register | Web evidence/gap | Status |
|---|---|---|---|
| DEC-001 | At most one verified/effective tenant–legal-party binding at a time; retain versioned history and evidence | Web schema has no canonical binding-version entity | GAP |
| DEC-002 | At most one participant per (tenant, transaction); multiple independent Supplier tenants may participate | Web `commercial_transactions` is Buyer/Seller tenant-column based; no canonical `transaction_participants` model | GAP |
| DEC-003 | Operational access is site-scoped; transaction-wide access is only an explicit bounded exception; NULL site is not unrestricted | Web route authorization does not evidence canonical site-link/assignment scope | GAP |
| DEC-004 | Normalized permission-action vocabulary shared across platforms | No canonical action catalog/assignment-action enforcement evidenced | GAP |
| DEC-005 | Bilateral Buyer/Seller activation approval; explicit independent Supplier approval and bounded scope | Web model does not evidence participant lifecycle approval or Supplier participation controls | GAP |
| DEC-006 | PostgreSQL RLS design, non-bypass app role, server context, read/write policies and negative tests | Staging public schema currently has no application tables or policies; Mobile disposable fixture remains distinct from staging | OPEN |
| DEC-007 | Actual SQLite runtime schema provenance per platform | Web source establishes SQLite startup code only; live runtime file/version/connection inventory not verified | PARTIAL |
| DEC-008 | PostgreSQL–SQLite parity using same corpus and pinned engines | Mobile disposable harness evidence is partial; Web's legacy peer interop is not canonical parity | OPEN |

### 8.1 Cross-repository contract requirements

Before Web implementation is approved, reconcile:

- canonical entity and composite-key specification;
- Buyer/Seller/Supplier participant and membership model;
- tenant/legal-party binding and historical provenance;
- operational site scope and assignment tuple;
- API request/response/error/idempotency contract;
- offline command and replay semantics;
- authorization and RLS policy matrix;
- audit event/provenance contract;
- PostgreSQL–SQLite parity and intentionally local-only fields.

### 8.2 Open decisions

| Open ID | Decision required | Required evidence/approver |
|---|---|---|
| WEB-OD-001 | Which Web data remains local cache versus authoritative domain data? | Canonical data ownership matrix; architecture approval |
| WEB-OD-002 | Is inquiry creation public, authenticated, or dual-mode, and how is ownership enforced? | Product/security/legal policy |
| WEB-OD-003 | What replaces `ADMIN_USER_IDS` for admin and break-glass access? | Identity/governance decision and audit requirements |
| WEB-OD-004 | What authenticated peer identity mechanism replaces shared-secret-only trust? | Security architecture decision |
| WEB-OD-005 | Which sync event types remain allowed, and which must become API commands? | Domain/event ownership contract |
| WEB-OD-006 | What is the approved Supplier Web workflow and permission matrix? | DEC reconciliation and business approval |
| WEB-OD-007 | What is the approved PostgreSQL resolver role/function ownership model after staging role/RLS audit? | DB-01/SEC-01 evidence and security review |
| WEB-OD-008 | What is the migration and rollback strategy from SQLite-backed Web runtime? | Data migration plan, parity evidence, operational approval |
| WEB-OD-009 | What are the offline conflict and replay semantics when membership is revoked while a device is offline? | Cross-platform sync contract |
| WEB-OD-010 | What evidence is required to approve schema freeze across Web, Mobile, Desktop, and backend? | Architecture review board decision |

## 9. Consolidated severity register

| Finding ID | Severity | Workstream | Summary | Closure gate |
|---|---|---|---|---|
| WEB-DB-001 | CRITICAL | DB | SQLite remains runtime store for membership/transactions | PostgreSQL authoritative integration and cutover evidence |
| WEB-AUTH-001 | CRITICAL | AUTH | Membership resolver reads SQLite | Verified PostgreSQL resolver and negative tests |
| WEB-API-001 | CRITICAL | API | No PostgreSQL pool/context in API composition | Actual API integration and pool/RLS tests |
| WEB-SYNC-001 | CRITICAL | SYNC | Inquiry sync origin comes from payload; receiver does not validate peer header | Authenticated peer identity and spoofing tests |
| WEB-SYNC-002 | CRITICAL | SYNC | Tenant sync upserts membership and transaction state | Remove/restrict authority path; event authorization tests |
| WEB-DB-002 | HIGH | DB | Canonical Supplier participant model not evidenced | DEC/domain schema parity |
| WEB-DB-003 | HIGH | DB/SYNC | Membership data is included in peer sync bundle | Membership authority boundary enforced |
| WEB-DB-004 | HIGH | DB/API | Tracking code acts as bearer lookup credential for contact-associated inquiry | Approved privacy/access/abuse controls |
| WEB-AUTH-002 | HIGH | AUTH | Admin role based on static environment allowlist | Governed authoritative admin permission model |
| WEB-AUTH-003 | HIGH | AUTH | Buyer/Seller-only middleware model | Supplier and site-scope authorization |
| WEB-API-002 | HIGH | API | Transaction operations execute directly on SQLite | PostgreSQL transaction service and constraints |
| WEB-SYNC-003 | HIGH | SYNC | Shared secret does not uniquely authenticate peer identity | Per-peer identity and credential lifecycle |
| WEB-SYNC-004 | HIGH | SYNC | No demonstrated event-level authorization | Event/aggregate authorization contract |
| WEB-SYNC-005 | HIGH | SYNC | Peer replication remains coupled to domain authority | Command-based authoritative sync |
| WEB-DB-005 | MEDIUM | DB | Runtime schema setup is not a versioned PostgreSQL migration chain | Migration/version governance |
| WEB-AUTH-004 | MEDIUM | AUTH | Tenant selector supplied in request header | Server-side selector validation preserved |
| WEB-AUTH-005 | MEDIUM | AUTH | Auth identity object carries local admin/customer role | Separate verified identity and resolved authorization context |
| WEB-API-003 | HIGH | API | Canonical OpenAPI contract not verified/reconciled | Approved versioned API specification |
| WEB-API-004 | MEDIUM | API | Public inquiry/tracking policy requires explicit decision | Product/security approval and tests |
| WEB-SYNC-006 | MEDIUM | SYNC | Interop test uses payload origin as peer header | Independent peer authentication test |

## 10. Implementation sequencing and exit gates

No implementation should start by simply replacing the SQLite driver. The recommended sequence is:

1. **DB-01 / SEC-01:** Complete staging migration/schema/role/grant/RLS inventory once the Supabase project is confirmed ACTIVE. These are read-only gates.
2. **WEB-RECON-01:** Reconcile Web schema and data ownership with canonical DEC-001–DEC-008 and Mobile/Desktop.
3. **AUTH-01:** Approve identity, membership resolver, admin governance, and least-privilege database role design.
4. **WEB-API-01:** Approve canonical OpenAPI and PostgreSQL transaction composition.
5. **WEB-SYNC-01:** Approve peer identity, event provenance, and offline command/replay boundary.
6. **WEB-TEST-01:** Execute negative-access, forged-context, RLS, concurrency, pool-reset, transaction atomicity, sync security, and parity tests against the actual API composition.
7. **WEB-REVIEW-01:** Reconcile all evidence and unresolved decisions; submit a separate schema-freeze decision.

### 10.1 Schema freeze exit criteria

Schema freeze may only be proposed when:

- [ ] DB-01 and SEC-01 inventories are complete and evidence-backed.
- [ ] Canonical domain decisions DEC-001–DEC-008 are mapped to physical PostgreSQL constraints and Web API contracts.
- [ ] Supabase Auth identity and PostgreSQL membership resolver are verified end-to-end.
- [ ] Resolver and API roles are least privilege and do not use SUPERUSER/BYPASSRLS.
- [ ] RLS coverage is complete for all in-scope tenant data.
- [ ] Production API composition uses PostgreSQL as authoritative transaction backend.
- [ ] Transaction-local context is safe across all pool lifecycle paths.
- [ ] Forged-context, negative-access, concurrency, and pool-reset tests pass.
- [ ] Sync provenance and authorization tests pass; membership cannot be mutated through generic peer sync.
- [ ] PostgreSQL–SQLite parity and offline replay semantics are accepted.
- [ ] No unresolved CRITICAL finding remains; all HIGH findings have approved closure evidence or explicit risk disposition.
- [ ] Human architecture, security, and business approvals are recorded.

## 11. Final review decision

**Decision: NOT READY — DO NOT FREEZE SCHEMA.**

The Web repository has a working SQLite-backed API and Supabase token verification, but the authoritative PostgreSQL backend, membership resolver, least-privilege connection model, transaction-local RLS context, and production API security tests are not evidenced in this repository baseline.

The peer synchronization implementation also requires a clear authority boundary: peer identity must be authenticated independently of payload claims, and generic sync must not be allowed to mutate authoritative membership or transaction state.

This document records findings, proposals, acceptance criteria, and open decisions only. It does not authorize schema changes, migrations, production cutover, source implementation, merge, or deployment.

## 12. Review sign-off

| Role | Decision | Name/date/evidence |
|---|---|---|
| Product/domain owner | PENDING | |
| Architecture owner | PENDING | |
| Security reviewer | PENDING | |
| Database owner | PENDING | |
| Web/Mobile/Desktop integration reviewer | PENDING | |
| Syariah/legal governance reviewer (where transaction/contract/payment flows are affected) | PENDING | |

---
**End of document.**


## 13. Independent review and cross-platform / staging reconciliation addendum

- **Review date:** 2026-11-10
- **Review scope:** Read-only review of this document plus Mobile, Desktop and Supabase staging evidence.
- **No implementation authorization:** This addendum does not authorize DDL, migration, grants, RLS changes, application code changes, merge or deployment.

### 13.1 Review of this document — corrections and quality findings

The original six-workstream assessment is directionally sound: Web is not yet a PostgreSQL-authoritative API, and its peer-sync paths must not be treated as transaction authority. The following corrections are material and supersede inconsistent statements earlier in this document:

1. **DEC mapping correction (HIGH documentation defect).** The original Section 8 table incorrectly assigned meanings to DEC-001–DEC-005. The authoritative Mobile register `CANONICAL-SCHEMA-DECISION-REGISTER-001.md` defines:
   - DEC-001: versioned tenant–legal-party binding cardinality/history.
   - DEC-002: one participant per `(tenant_id, transaction_id)`; independent Supplier tenants may each participate.
   - DEC-003: site-scoped operational access; transaction-wide scope only as an explicit bounded exception; NULL site is not unrestricted.
   - DEC-004: normalized canonical permission-action vocabulary.
   - DEC-005: bilateral Buyer/Seller activation approval and explicit independent Supplier participation approval.
   The corrected matrix in Section 8 now follows that register. Other canonical domain invariants (legal party distinct from tenant; Buyer/Seller/Supplier independent tenants; participant/site/membership composite relationships) are captured in the GH-04 contract and canonical participant specification, but must not be misattributed to a different DEC number.

2. **OpenAPI finding refinement (HIGH).** Web does have `docs/openapi.yaml`. It is not absent: it is a legacy API description for peer-local SQLite catalogue/inquiry and shared-secret inquiry sync. It does not describe the canonical transaction/participant/site/assignment/command API. WEB-API-003 is therefore restated as a stale/incomplete contract, not an unverified artifact.

3. **Evidence boundary retained.** The eight-table Web inventory remains a source-level inventory (four base tables plus four tenant-migration tables). It is not a live SQLite catalog inventory. The runtime schema and database path claims remain limited to the inspected source code.

### 13.2 Cross-platform baseline

| Platform | Repository and reviewed baseline | Observed architecture | Reconciliation result |
|---|---|---|---|
| Web | `muchlisbstg/export-client-web-sync`, main `836821995c58293edadc982ae89f5519e1d4076b` | Express 5 + better-sqlite3; Supabase token verification; SQLite membership resolver; local tenant/transaction data; inquiry and tenant peer sync | NOT READY; legacy API/OpenAPI and sync authority gaps |
| Mobile | `muchlisbstg/export-client-mobile-sync`, review branch `review/p0-domain-schema-readonly-2026-11-10`, HEAD `f4a06acf3bcea0a9ba85325c1bcd196c0dcd3726` | Expo/React Native client with Node/Express SQLite API; reviewed canonical domain and key/constraint specifications are design-only | Domain decisions DEC-001–005 approved; DEC-006–008 remain open |
| Desktop | `muchlisbstg/export-client-desktop-sync`, main `3cb71f658712ee6c2b60d33b339a9600c09f15d6` | Electron + React + local Express + better-sqlite3; local API defaults to loopback and persistent app user-data DB; Supabase Auth session/admin endpoints; SQLite tenant membership path; peer sync | NOT READY; local SQLite remains data store and local API is not the shared authoritative transaction service |

Evidence links:
- [Mobile canonical decision register](https://github.com/muchlisbstg/export-client-mobile-sync/blob/review/p0-domain-schema-readonly-2026-11-10/docs/reviews/p0/CANONICAL-SCHEMA-DECISION-REGISTER-001.md)
- [Mobile participant relationship specification](https://github.com/muchlisbstg/export-client-mobile-sync/blob/review/p0-domain-schema-readonly-2026-11-10/docs/reviews/p0/CANONICAL-PARTICIPANT-RELATIONSHIP-SPEC-001.md)
- [Mobile canonical key/constraint mapping](https://github.com/muchlisbstg/export-client-mobile-sync/blob/review/p0-domain-schema-readonly-2026-11-10/docs/reviews/p0/CANONICAL-ENTITY-KEY-CONSTRAINT-MAPPING-001.md)
- [Mobile DEC-006–008 evidence review](https://github.com/muchlisbstg/export-client-mobile-sync/blob/review/p0-domain-schema-readonly-2026-11-10/docs/reviews/p0/DEC-006-008-EVIDENCE-REVIEW-001.md)
- [Mobile GH-04 cross-platform API contract](https://github.com/muchlisbstg/export-client-mobile-sync/blob/review/p0-domain-schema-readonly-2026-11-10/docs/reviews/p0/GH-04-CANONICAL-CROSS-PLATFORM-API-CONTRACT-001.md)
- [Desktop package manifest](https://github.com/muchlisbstg/export-client-desktop-sync/blob/main/package.json)
- [Desktop local API and sync implementation](https://github.com/muchlisbstg/export-client-desktop-sync/blob/main/electron/local-api.ts)
- [Desktop Supabase Auth adapter](https://github.com/muchlisbstg/export-client-desktop-sync/blob/main/electron/auth.ts)
- [Desktop README](https://github.com/muchlisbstg/export-client-desktop-sync/blob/main/README.md)
- [Web legacy OpenAPI](https://github.com/muchlisbstg/export-client-web-sync/blob/main/docs/openapi.yaml)

### 13.3 Cross-platform reconciliation findings

| ID | Severity | Finding | Required disposition |
|---|---|---|---|
| XPLAT-001 | CRITICAL | All three platforms still carry local SQLite backend/API behavior; none is evidenced as using one shared PostgreSQL-authoritative transaction API. | Retain SQLite only for cache/offline/outbox; route final shared commands through authoritative API |
| XPLAT-002 | HIGH | Mobile DEC-001–005 are approved domain rules, but the original Web DEC mapping was incorrect. | Corrected above; treat Mobile register as canonical DEC numbering |
| XPLAT-003 | HIGH | Mobile GH-04 defines the proposed shared command contract, but route-by-route implementation and contract tests across all three clients are not evidenced. | Adopt only after API owner review and cross-platform contract tests |
| XPLAT-004 | HIGH | Desktop README says the backend has no login/auth, while `electron/local-api.ts` now exposes Supabase Auth session/admin endpoints and `electron/auth.ts` implements token verification plus `ADMIN_USER_IDS`. This is documentation drift; these endpoints do not prove complete authorization on all local API routes. | Reconcile README and route-level auth coverage; do not treat the auth session endpoint as membership authorization |
| XPLAT-005 | CRITICAL | Desktop local API stores inquiries in SQLite and has no evidence of a PostgreSQL transaction pool/context or authoritative RLS-backed transaction service. | Same backend integration gate as Web/Mobile |
| XPLAT-006 | HIGH | Web and Desktop outbound inquiry sync now send `x-sync-peer`, but the Web receiver's inspected inquiry route still derives origin from payload `originNodeId`; sender header alone is not receiver authentication. | Authenticate peer identity at receiver and bind origin to authenticated peer |
| XPLAT-007 | HIGH | Web tenant sync bundle can carry tenant, membership and transaction rows; the canonical GH-04 contract says peer sync must not replicate authoritative transaction decisions. | Replace generic row replication with server-validated commands/events; prohibit membership mutation through sync |
| XPLAT-008 | HIGH | Mobile canonical specification has more complete participant/site/membership composite relationships than current Web/Desktop SQLite domain models. | Reconcile physical data ownership and migration mapping before implementation |

### 13.4 Supabase staging DB-01 — read-only inventory result

**Project:** `export-client-staging`  
**Project ref:** `utvxuzmtevnmrcpxfpaa`  
**Status at audit:** `ACTIVE_HEALTHY`  
**PostgreSQL:** 17.11.0.011 (engine 17), region `ap-south-1`  
**Audit execution role:** `postgres` (privileged inspection context)

Read-only results captured on 2026-11-10:

| DB-01 item | Observed result | Interpretation |
|---|---|---|
| Public application tables | 0 | No application schema objects currently exist in `public` |
| Supabase migration history | 0 entries | No project migration ledger entries were returned |
| Public schema RLS policies | 0 | No application RLS policy coverage exists yet; no public application tables were found |
| Public table grants | 0 rows | No public application table grants exist |
| Public application constraints/indexes | Not applicable | No public application tables to inventory |
| Runtime application schema | Not present in public | Canonical domain schema has not been deployed to this staging project |

Managed Supabase schemas were also observed and must not be confused with application schema coverage: `auth` has 27 tables (16 with RLS enabled); `storage` has 10 tables (10 with RLS enabled); `realtime` has 3 tables (1 with RLS enabled). These managed service tables are not the project's canonical tenant/business schema. No app-owned RLS policy is evidenced by these counts.

**DB-01 disposition:** baseline blank-state inventory complete; canonical application schema/migration audit is BLOCKED because there are no application tables or migration entries to inspect. This is not a schema pass.

### 13.5 Supabase staging SEC-01 — read-only security inventory result

Observed built-in role attributes:

| Role | SUPERUSER | BYPASSRLS | Audit implication |
|---|---:|---:|---|
| `anon` | false | false | Non-bypass built-in role |
| `authenticated` | false | false | Non-bypass built-in role |
| `service_role` | false | true | RLS-bypass privileged role; must not be the ordinary API role |
| `postgres` | false | true | Privileged database owner/inspection role; not a valid least-privilege application role |
| `supabase_admin` | true | true | Managed administrative role; not an application role |
| `authenticator` | false | false | Connection/authenticator role, not the domain resolver role |

No project-specific application API/resolver roles or grants over application tables were evidenced. The audit SQL ran as `postgres`, so these results do **not** prove the privileges of a future application pool role.

Supabase Security Advisor returned one warning:
- `auth_leaked_password_protection`: leaked-password protection disabled.

This warning is a project Auth configuration hardening item; no setting was changed during this review.

**SEC-01 disposition:** initial built-in role and empty-public-grant inventory complete; application role/grant/RLS review is BLOCKED until an application schema and explicitly approved non-bypass role design exist. Do not solve this by using `service_role` or `postgres` for ordinary API requests.

### 13.6 Consolidated cross-platform and staging gate

| Gate | Result | Why it remains open |
|---|---|---|
| Canonical domain DEC-001–005 | APPROVED (logical domain only) | Physical schema and implementation not yet proven |
| DEC-006 RLS | OPEN / BLOCKED | Staging has no app tables/policies; role design and API integration not tested there |
| DEC-007 SQLite provenance | OPEN | Source schemas exist, but live runtime DB identity/version/per-connection FK proof is incomplete for all platforms |
| DEC-008 PostgreSQL–SQLite parity | OPEN | Mobile disposable harness evidence is partial; no approved full cross-platform corpus run against actual authoritative API |
| Web PostgreSQL API readiness | NOT READY | SQLite runtime, stale OpenAPI, tenant resolver and sync authority gaps |
| Desktop PostgreSQL API readiness | NOT READY | SQLite local API and incomplete route-level authorization |
| Mobile PostgreSQL API readiness | NOT READY | SQLite API/runtime remains; canonical specification is not implementation evidence |
| Schema freeze | NOT APPROVED | Multiple CRITICAL/HIGH gates remain open |

### 13.7 Required next evidence gates (no implementation yet)

1. Preserve DB-01/SEC-01 read-only results as the empty staging baseline; do not create a schema merely to make the audit non-empty.
2. Finalize the canonical API contract from Mobile GH-04 with explicit API owner, route mapping and OpenAPI versioning across Web/Mobile/Desktop.
3. Complete source-level route and data-ownership mapping for Desktop and Web; correct Desktop README drift and Web OpenAPI drift in a separately approved documentation change.
4. Define the non-bypass application role and resolver architecture only after the canonical schema and security boundary are approved; prove no ordinary request uses `service_role`, `postgres`, SUPERUSER or BYPASSRLS.
5. Design and test actual PostgreSQL RLS policies on disposable PostgreSQL using synthetic data and the real non-bypass API role; do not treat managed Supabase schema policies as application RLS coverage.
6. Complete DEC-007 runtime provenance and DEC-008 full PostgreSQL/SQLite parity corpus with pinned versions and artifacts.
7. Re-run end-to-end negative-access, forged-context, pool-reset, concurrency, sync provenance and offline replay tests against the actual production API composition.
8. Obtain architecture, security, database, product and relevant legal/Syariah approvals before schema freeze or implementation authorization.

**Final disposition remains: NOT READY — DO NOT FREEZE SCHEMA; DO NOT APPROVE PRODUCTION POSTGRESQL IMPLEMENTATION.**

The staging project being ACTIVE_HEALTHY only means the database is available. It does not mean the canonical application schema, role model, RLS policies, API pool/context or parity evidence exist.
