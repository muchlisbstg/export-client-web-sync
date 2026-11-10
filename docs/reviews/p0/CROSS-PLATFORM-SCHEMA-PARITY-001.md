# CROSS-PLATFORM-SCHEMA-PARITY-001

**Status:** READ-ONLY SOURCE SCHEMA RECONCILIATION  
**Baseline date:** 2026-11-10  
**Decision basis:** Approved OD-001–OD-022  
**Candidate commits:** Web `836821995c58293edadc982ae89f5519e1d4076b`; Mobile `0a3c595c6697f56d0cef8536c3b93c3886cc5ab1`; Desktop `3cb71f658712ee6c2b60d33b339a9600c09f15d6`.

No database was opened, migrated, or mutated. This document compares repository source/schema artifacts only. It does not assert physical database parity or runtime migration state.

## 1. Executive assessment

**Cross-platform canonical schema parity: NOT ACHIEVED.**

- Web and Desktop expose a comparatively simple Buyer/Seller tenant model.
- Mobile has a richer supply-chain schema, operational site/transaction assignments, handover, and evidence structures, but its runtime remains single-enterprise-oriented.
- Mobile source reconciliation records five integrity gaps: one missing transaction-party bridge and four missing composite tenant-scoped foreign keys.
- No single canonical schema release, shared migration registry, or reproducible schema-diff evidence was established across all three clients and the intended shared backend.
- SQLite is used as application persistence in inspected source; under OD-017 this must be limited to permitted local cache/draft/offline/outbox roles, not authoritative shared business state.
- Supabase is the approved gated target direction under OD-018, not a certified existing deployment.

## 2. Pinned evidence sources

| Platform | Schema / implementation evidence | SHA |
|---|---|---|
| Web | [server/database.ts](https://github.com/muchlisbstg/export-client-web-sync/blob/836821995c58293edadc982ae89f5519e1d4076b/server/database.ts), [tenant migration](https://github.com/muchlisbstg/export-client-web-sync/blob/836821995c58293edadc982ae89f5519e1d4076b/scripts/migrate-tenant-isolation.mjs), [server/index.ts](https://github.com/muchlisbstg/export-client-web-sync/blob/836821995c58293edadc982ae89f5519e1d4076b/server/index.ts) | `836821995c58293edadc982ae89f5519e1d4076b` |
| Mobile | [supply-chain-schema.sql](https://github.com/muchlisbstg/export-client-mobile-sync/blob/0a3c595c6697f56d0cef8536c3b93c3886cc5ab1/docs/supply-chain-schema.sql), [schema reconciliation](https://github.com/muchlisbstg/export-client-mobile-sync/blob/0a3c595c6697f56d0cef8536c3b93c3886cc5ab1/docs/p0-source-schema-reconciliation-2026-11-04.md), [migration](https://github.com/muchlisbstg/export-client-mobile-sync/blob/0a3c595c6697f56d0cef8536c3b93c3886cc5ab1/scripts/migrate-tenant-isolation.mjs) | `0a3c595c6697f56d0cef8536c3b93c3886cc5ab1` |
| Desktop | [tenant migration](https://github.com/muchlisbstg/export-client-desktop-sync/blob/3cb71f658712ee6c2b60d33b339a9600c09f15d6/scripts/migrate-tenant-isolation.mjs), [Electron main](https://github.com/muchlisbstg/export-client-desktop-sync/blob/3cb71f658712ee6c2b60d33b339a9600c09f15d6/electron/main.ts), [local API](https://github.com/muchlisbstg/export-client-desktop-sync/blob/3cb71f658712ee6c2b60d33b339a9600c09f15d6/electron/local-api.ts) | `3cb71f658712ee6c2b60d33b339a9600c09f15d6` |

## 3. Canonical entity parity matrix

The canonical model below is the target logical model derived from the approved OD decisions. “Not evidenced” means the audited source did not establish the entity/relationship sufficiently; it does not assert that no similarly named table exists elsewhere.

| Canonical entity / relationship | Required invariant | Web | Mobile | Desktop | Gap / severity |
|---|---|---|---|---|---|
| User / authenticated principal | Stable identity independent of tenant; authenticated actor is server-derived | Partial evidence | Partial evidence | Partial evidence | Identity is present, but cross-platform identity lifecycle parity and exact shared principal mapping are not evidenced. HIGH |
| Tenant | Independent Buyer, Seller, and Supplier tenant identities | Buyer/Seller only | Single enterprise configuration | Buyer/Seller only | Supplier hybrid tenant missing; Mobile context contradicts multi-tenant decision. CRITICAL |
| Tenant membership | User-to-tenant relationship, active/suspended/revoked lifecycle | Membership with singular role model | Enterprise membership | Membership with singular role model | Multiple concurrent roles and complete membership governance not aligned. HIGH |
| Membership role grants | Multiple active roles per membership with scope and audit | Not established | Role assignments exist | Not established | Permission composition/deny precedence not proven consistently. HIGH |
| Permission / policy grant | Explicit permission key, scope, validity, grantor, revocation | Broad admin/role checks | Role/permission helpers | Broad admin/role checks | No canonical permission catalog and delegated admin authority parity. HIGH |
| Tenant context | Server-validated active membership; bounded and replaceable | Active tenant header flow | Single enterprise ID | Active tenant header flow | Mobile is incompatible; Web/Desktop stale-context and cache isolation unproven. CRITICAL |
| Authorized Representative | Active authority tied to tenant and transaction/contract scope | Not evidenced | Not evidenced | Not evidenced | Signer authority register and scope validation absent. CRITICAL |
| Delegation | Delegator, delegate, scope, effective/expiry, revocation, reason, audit | Not evidenced | Not evidenced | Not evidenced | No canonical delegation schema/workflow. CRITICAL |
| Transaction | Stable transaction identity and lifecycle | Present | Present, legacy writes retired | Present | No evidence of identical lifecycle and authoritative shared record. HIGH |
| Transaction party bridge | Explicit Buyer/Seller/Supplier participant relationship, role, tenant key, status | Not evidenced | Missing per source reconciliation | Not evidenced | Missing tenant-party bridge blocks tenant participant integrity. CRITICAL |
| Transaction scope approval | Party, scope, decision, signer, timestamp, contract version | Not evidenced | Draft/retired routes; runtime unproven | Not evidenced | Bilateral activation/reactivation not established. CRITICAL |
| Transaction access assignment | Tenant + transaction + actor + scope + validity | Not evidenced | Present in source schema | Not evidenced | Four-column tenant composite FK issue and cross-platform absence. CRITICAL |
| Site | Tenant-owned physical/operational site | Not evidenced in equivalent model | Present | Not evidenced | No common site entity/tenant ownership contract. CRITICAL |
| Site assignment | Supplier/user, tenant, transaction, site, actions, effective/expiry, approval/revocation | Not evidenced | Present partially | Not evidenced | Lifecycle metadata and scope/history incomplete. HIGH |
| Handover / custody event | Sender, receiver, goods/sample, condition, evidence, timestamps, chain-of-custody | Not evidenced | Present | Not evidenced | No parity; revocation suspension state not evidenced. CRITICAL |
| Document / evidence register | Owner, source, purpose, classification, transaction/scope, provenance, version, retention | Not evidenced | Evidence structures present | Not evidenced | Cross-party classification and action-specific visibility absent. CRITICAL |
| Signed contract snapshot | Immutable agreed terms, signers, conditions, version, effective status | Not evidenced | Draft release contract references it; authoritative runtime model unproven | Not evidenced | Contract source of truth not established. CRITICAL |
| Shipment / release request | Contract-linked shipment and scope-specific release request | Not evidenced | Draft OpenAPI only | Not evidenced | Runtime shipment release model not established. CRITICAL |
| Release gate evaluation | Gate, evidence ref, rule, evaluator, result, timestamp, policy version | Not evidenced | Draft OpenAPI only | Not evidenced | No runtime authoritative evaluation proof. CRITICAL |
| Payment ledger | Append-only financial entries and reconciliation; independent source of truth | Not evidenced | Not evidenced as authoritative ledger | Not evidenced | Payment source-of-truth not evidenced. CRITICAL |
| Guarantee instrument | Type, issuer, beneficiary, amount/currency, validity, claim conditions, verification | Not evidenced | Draft release contract references guarantee gate | Not evidenced | No canonical guarantee schema or verification lifecycle. CRITICAL |
| Dispute / hold | Scope, evidence conflict, materiality, authority, hold/release decision | Status vocabulary only | Status/evidence structures partially | Status vocabulary only | Dispute state not equivalent to controlled hold and adjudication. CRITICAL |
| Syariah review | Assigned reviewer, scope, finding, recommendation, no approval authority | Not evidenced | Dedicated role/workflow not evidenced | Not evidenced | Reviewer boundary and finding lifecycle absent. CRITICAL |
| Review finding | Severity, owner, due date, response, evidence, independent closure | Not evidenced | Not evidenced | Not evidenced | No auditable finding closure lifecycle. HIGH |
| Audit event | Actor, tenant, resource, action, before/after, reason, timestamp, correlation, immutable provenance | Partial | Partial/stronger in some supply mutations | Partial | No shared canonical audit event contract and tamper-resistance evidence. HIGH |
| Outbox / command | Stable ID, idempotency key, actor/scope, causal version, replay result | Partial | Partial | Partial | Offline replay semantics are not uniform across protected domains. HIGH |
| Schema/API version | Canonical version, migration ID, client compatibility range | Not evidenced | Not evidenced | Not evidenced | No common migration registry or supported-client matrix. HIGH |

## 4. Composite-key and foreign-key requirements

### 4.1 Minimum canonical key strategy

The following logical constraints are required to prevent cross-tenant reference substitution. Names are illustrative logical constraints, not approved DDL.

| Relationship | Required candidate key / FK | Purpose |
|---|---|---|
| Tenant membership | `UNIQUE(tenant_id, membership_id)`; membership references tenant and user | Prevent membership reuse across tenant contexts |
| Transaction participant | `UNIQUE(tenant_id, transaction_id, participant_id)` or equivalent transaction-party identity | Bind a participant to the correct tenant and transaction |
| Transaction-party bridge | FK to transaction and tenant; unique party role constraints per transaction | Explicitly identify Buyer, Seller, Supplier participants |
| Transaction access assignment | Composite FK `(tenant_id, transaction_id)` → tenant-scoped transaction | Prevent assignment to another tenant's transaction |
| Transaction access assignment site | Composite FK `(tenant_id, site_id)` → tenant-scoped site | Prevent assignment to another tenant's site |
| Transaction-site link | Composite FK `(tenant_id, transaction_id)` → transaction | Prevent cross-tenant transaction link |
| Transaction-site link site | Composite FK `(tenant_id, site_id)` → site | Prevent cross-tenant site link |
| Site assignment | Composite FK to tenant/site and transaction participant; explicit actor/supplier identity | Enforce operational scope |
| Evidence register | Composite FK to tenant, transaction, and optionally shipment/site | Preserve evidence ownership and provenance |
| Contract snapshot | FK to transaction + immutable snapshot version + signer authority references | Bind contract conditions to correct transaction |
| Release request | FK to contract snapshot, shipment, transaction, and tenant | Prevent release across contract/tenant boundary |
| Payment ledger | FK to transaction and tenant, unique idempotency/source references | Prevent financial entries being attributed to another transaction |
| Handover | FK to transaction/site/assignment and custody item | Preserve chain-of-custody relationship |

Do not implement these illustrative constraints without canonical schema review, source-data integrity assessment, and separate migration authorization.

### 4.2 Confirmed Mobile source reconciliation blockers

The Mobile source reconciliation document explicitly records five findings:

| Finding | Missing invariant | Severity | Consequence |
|---|---|---|---|
| MOB-SCH-001 | Transaction-party bridge | CRITICAL | Tenant cannot be proven as an explicit transaction participant through a normalized bridge |
| MOB-SCH-002 | Composite FK `(tenant_id, transaction_id)` on transaction access assignment | CRITICAL | Assignment transaction reference is not constrained to same tenant |
| MOB-SCH-003 | Composite FK `(tenant_id, site_id)` on transaction access assignment | CRITICAL | Assignment site reference is not constrained to same tenant |
| MOB-SCH-004 | Composite FK `(tenant_id, transaction_id)` on transaction-site link | CRITICAL | Transaction-site link may not be structurally bound to same tenant |
| MOB-SCH-005 | Composite FK `(tenant_id, site_id)` on transaction-site link | CRITICAL | Site reference may not be structurally bound to same tenant |

Source: [Mobile P0 source schema reconciliation](https://github.com/muchlisbstg/export-client-mobile-sync/blob/0a3c595c6697f56d0cef8536c3b93c3886cc5ab1/docs/p0-source-schema-reconciliation-2026-11-04.md).

The referenced contract test asserts that a read-only schema inspector reports five findings. This audit did not execute that test and does not claim the findings were revalidated against a physical database.

## 5. Platform-specific schema observations

### Web

- Tenant migration and database source show a Buyer/Seller-oriented tenant model.
- Application persistence is SQLite-backed.
- The OpenAPI contract does not enumerate all tenant/transaction routes visible in server source.
- No equivalent normalized Supplier tenant, site assignment, custody, contract snapshot, ledger, release gate, or Syariah review schema was established in the inspected paths.

Evidence: [database.ts](https://github.com/muchlisbstg/export-client-web-sync/blob/836821995c58293edadc982ae89f5519e1d4076b/server/database.ts), [migration](https://github.com/muchlisbstg/export-client-web-sync/blob/836821995c58293edadc982ae89f5519e1d4076b/scripts/migrate-tenant-isolation.mjs), [OpenAPI](https://github.com/muchlisbstg/export-client-web-sync/blob/836821995c58293edadc982ae89f5519e1d4076b/docs/openapi.yaml).

### Mobile

- Supply-chain schema is the richest of the three inspected candidates.
- It includes sites, assignments, transaction/site relationships, handover and evidence-oriented structures.
- Runtime authorization remains single-enterprise-oriented.
- Transaction create/status and tenant sync legacy routes return 410 in the inspected server source.
- Five schema integrity blockers are explicitly documented.
- Release authorization exists as a draft OpenAPI contract, not proof of a live runtime API.

Evidence: [supply schema](https://github.com/muchlisbstg/export-client-mobile-sync/blob/0a3c595c6697f56d0cef8536c3b93c3886cc5ab1/docs/supply-chain-schema.sql), [server/index.mjs](https://github.com/muchlisbstg/export-client-mobile-sync/blob/0a3c595c6697f56d0cef8536c3b93c3886cc5ab1/server/index.mjs), [release OpenAPI](https://github.com/muchlisbstg/export-client-mobile-sync/blob/0a3c595c6697f56d0cef8536c3b93c3886cc5ab1/docs/api/release-authorization.openapi.yaml).

### Desktop

- Electron stores local application data under its user-data persistence path and exposes a local API.
- Tenant migration is separate from Web and Mobile.
- Equivalent supply-chain, Supplier assignment, custody, contract/release, and Syariah governance schema parity was not established in inspected source.
- Local SQLite must be bounded to permitted local/offline roles under OD-017.

Evidence: [electron/main.ts](https://github.com/muchlisbstg/export-client-desktop-sync/blob/3cb71f658712ee6c2b60d33b339a9600c09f15d6/electron/main.ts), [local-api.ts](https://github.com/muchlisbstg/export-client-desktop-sync/blob/3cb71f658712ee6c2b60d33b339a9600c09f15d6/electron/local-api.ts), [migration](https://github.com/muchlisbstg/export-client-desktop-sync/blob/3cb71f658712ee6c2b60d33b339a9600c09f15d6/scripts/migrate-tenant-isolation.mjs).

## 6. Canonical schema acceptance criteria

A future canonical schema review should not pass until evidence establishes:

1. One logical entity catalogue with stable IDs and tenant ownership semantics.
2. Independent Buyer, Seller, and Supplier tenant identities.
3. Explicit transaction-party bridge and participant role constraints.
4. Composite tenant-scoped FKs for every tenant-owned transaction/site relationship.
5. Membership-to-role grants supporting multiple active roles and deterministic deny precedence.
6. Assignment lifecycle fields, scope, effective/expiry, approver, revocation, and history.
7. Contract snapshot immutability and signer/delegation references.
8. Ledger and evidence register as separate authoritative domains.
9. Shipment release requests and server-side gate evaluation bound to contract, ledger, evidence, law and Syariah controls.
10. Dispute holds and custody/handover lifecycle.
11. Audit/outbox idempotency, provenance and version semantics.
12. One ordered migration registry and compatibility mapping across all platforms.
13. Reproducible schema-diff and integrity evidence pinned to exact candidate SHAs.
14. Physical schema/RLS verification in a specifically authorized non-production environment before any production decision.

## 7. Unverified items

The following were not established by this source audit:

- Actual deployed SQLite schema state on user devices or servers.
- Actual PostgreSQL/Supabase tables, indexes, constraints, triggers, RLS policies, grants, or functions.
- Whether migration scripts were executed in any environment.
- Data quality/orphan records and feasibility of adding composite FKs.
- Backup, restore, disaster recovery, and operational monitoring.
- Runtime behavior of all route handlers and database transactions.

## 8. Related artifacts and governance

- [OD-001–OD-022 Decision Register](./OPEN-ARCHITECTURE-DECISIONS-001.md)
- [Architecture Decision Compliance Matrix](./ARCHITECTURE-DECISION-COMPLIANCE-MATRIX-001.md)
- [Cross-Platform Authorization Gap Register](./CROSS-PLATFORM-AUTHORIZATION-GAP-REGISTER-001.md)

This document is an audit/review artifact only. It does not authorize DDL, schema changes, migrations, implementation, test execution against shared/live systems, PR, merge, deployment, or staging/production mutation.
