# UI-API-CONTRACT-MATRIX-001 — Cross-Platform API Contract Matrix

**Version:** 1.0-draft  
**Status:** PENDING REVIEW  
**Baseline:** 2026-11-10 read-only source audit

## 1. Status definitions

- **EXISTS:** endpoint implementation observed.
- **PARTIAL:** endpoint exists but scope, authorization, behavior, or contract is incomplete against target.
- **RETIRED:** endpoint observed returning 410.
- **MISSING:** required capability not found in audited source.
- **PROPOSED:** target contract, not verified implementation.

Endpoint existence does not prove correct authorization or production readiness.

## 2. Common API baseline

| API | Web | Mobile | Desktop | Review requirement |
|---|---|---|---|---|
| GET /api/v1/auth/session | EXISTS | EXISTS | EXISTS | Tenant-aware identity and membership |
| GET /api/v1/admin/session | EXISTS | EXISTS | EXISTS | Explicit platform-admin authorization |
| GET /health | EXISTS | EXISTS | EXISTS | Define meaningful service health |
| GET /api/v1/products | EXISTS | EXISTS | EXISTS | Catalog visibility and tenant policy |
| POST /api/v1/inquiries | EXISTS | EXISTS | EXISTS | Explicit ownership and participant rules |
| GET /api/v1/inquiries/:trackingCode | EXISTS | EXISTS | EXISTS | Prevent private tenant data leakage |
| POST /api/v1/sync/inquiries | EXISTS | EXISTS | EXISTS | Idempotency and tenant-bound synchronization |

## 3. Tenant and transaction APIs

| Capability | Web | Mobile | Desktop | Assessment |
|---|---|---|---|---|
| Tenant middleware | EXISTS | PARTIAL | EXISTS | Mobile model mismatch |
| Active tenant context | EXISTS | PARTIAL | EXISTS | Mobile uses enterprise context |
| Transaction read/list/detail | PARTIAL | PARTIAL | PARTIAL | Scope parity not established |
| Transaction create | EXISTS | RETIRED (410) | EXISTS | Mobile blocker |
| Transaction status update | EXISTS | RETIRED (410) | EXISTS | Mobile blocker |
| Tenant synchronization | EXISTS | RETIRED (410) | EXISTS | Mobile blocker |
| Transaction access assignment | Not equivalent | PARTIAL | Not equivalent | Harmonize semantics |
| Transaction site linking | Not equivalent | PARTIAL | Not equivalent | Harmonize semantics |

Mobile source still contains `SINGLE_ENTERPRISE_ID`, `requireActiveEnterprise()`, and `/api/v1/enterprise/session`. These do not implement the approved Buyer/Seller/Supplier tenant model.

Two Mobile registrations of `GET /api/v1/transactions` were observed in `server/supply-chain-routes.mjs` and `server/index.mjs`. Add a route-order test to prove which handler is active and prevent shadowing.

## 4. Mobile supply-chain API surface

Mobile-only observed capabilities:
- Sites and site assignments.
- Lots and lot inspection.
- Processing.
- Inventory movement and stock lookup.
- Traceability.
- Supply evidence.
- Handover prepare, dispatch, and receive.
- Transaction access assignments.
- Transaction site links.

Web and Desktop do not expose equivalent supply-chain APIs in the audited baseline. This may be an intentional platform responsibility split, but shared domain semantics, identifiers, ownership, and authorization must remain consistent.

## 5. Missing or insufficient domain API capabilities

| Domain | Status | Required contract |
|---|---|---|
| Contract versioning/signing | MISSING | Immutable contract snapshot, signer identity and authority |
| Bilateral scope approval | MISSING | Party approval, suspension, reactivation lifecycle |
| Release instruction | MISSING | Seller authority and contract-conditioned release checks |
| Payment ledger | MISSING | Append-only financial events and reconciliation |
| Guarantee registry | MISSING | Guarantee lifecycle, issuer, validity, verification |
| Approval task center | MISSING | Task ownership, delegation, expiry, decision audit |
| Notifications | MISSING | Delivery, retry, acknowledgment semantics |
| Offline task synchronization | PARTIAL/MISSING | Idempotency, conflict, revocation, replay |
| Compliance findings | MISSING | Finding, evidence, disposition, audit |
| Syariah review | MISSING | Review scope, comments, recommendations, audit |
| Evidence reconciliation | MISSING | Obligation-to-evidence mapping and disposition |

## 6. Contract requirements

Each endpoint contract must specify:
- Method, path, version, request schema, response schema.
- HTTP status and stable error codes.
- Authentication preconditions.
- Active tenant context and membership validation.
- Role/permission and resource-scope checks.
- Transaction participant and site assignment checks where applicable.
- Audit event requirements.
- Idempotency and replay semantics for mutations.
- Data ownership and visibility rules.
- Offline behavior and conflict policy where applicable.

Client-supplied tenant IDs, role claims, or local UI state must not be treated as authorization proof.

## 7. Screen-to-API traceability

| Screen family | API dependencies | Current gap |
|---|---|---|
| Web WEB-001–015 | Auth/context, catalog, inquiry, transaction, admin | Contract/payment/guarantee/release missing; admin/audit/Syariah partial or missing |
| Mobile MOB-001–013 | Auth/enterprise, catalog/inquiry, supply-chain, handover | Authorization model mismatch; approvals missing; operational APIs partial |
| Desktop DES-001–010 | Business/transaction, catalog, monitoring, admin | Transaction partial; supply-chain monitoring and evidence/compliance/Syariah missing |

The screen inventory and platform responsibilities are defined in [UI-SCREEN-SPECIFICATION-001](./UI-SCREEN-SPECIFICATION-001.md).

## 8. Acceptance criteria

- Every screen has explicit endpoint dependencies.
- EXISTS/PARTIAL/RETIRED/MISSING/PROPOSED statuses are evidence-backed.
- Every sensitive endpoint documents server-side authorization preconditions.
- OpenAPI or equivalent contract reflects source implementation.
- Retired endpoints are not active client dependencies.
- Platform differences are deliberate and documented.
- Mutation endpoints define idempotency and audit behavior.
- Unauthorized requests fail closed.

**Status:** audit matrix only; not an approved implementation contract.
