# UI-API-CONTRACT-MATRIX-001 — Cross-Platform API Contract Matrix

**Version:** 1.1-draft  
**Status:** SOURCE EVIDENCE RECONCILED — PER-SCREEN TRACEABILITY OPEN  
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


## 9. Source-pinned evidence reconciliation

Use [EVIDENCE-RECONCILIATION-001](./EVIDENCE-RECONCILIATION-001.md) as the canonical evidence index. Material source references:

| Platform | Source reference | Commit SHA | Evidence conclusion |
|---|---|---|---|
| Mobile | `server/index.mjs#L296-L340`, `#L385-L408` | `0a3c595c6697f56d0cef8536c3b93c3886cc5ab1` | Enterprise session remains; tenant sync and transaction writes return 410; duplicate transaction GET registrations are visible |
| Mobile | `server/supply-chain-routes.mjs#L299-L300` | `0a3c595c6697f56d0cef8536c3b93c3886cc5ab1` | Supply-chain transaction GET handlers are registered before the later index-level GET handlers |
| Mobile | `server/authorization.mjs#L17-L78` | `0a3c595c6697f56d0cef8536c3b93c3886cc5ab1` | Current helper is enterprise/single-enterprise-oriented |
| Web | `server/index.ts#L116-L123`, `#L186-L245` | `836821995c58293edadc982ae89f5519e1d4076b` | Tenant/transaction source routes exist; runtime readiness and authorization parity are not thereby proven |
| Web | `docs/openapi.yaml#L12-L116` | `836821995c58293edadc982ae89f5519e1d4076b` | OpenAPI lists only health, products, inquiries, tracking, and inquiry sync; tenant/transaction routes are omitted |

### 9.1 Corrections to the earlier audit matrix

- BLK-004 is **CONFIRMED** at the pinned Mobile main source: the same transaction list/detail GET method-path pairs are registered by the supply-chain route registrar and again in `server/index.mjs`. The earlier endpoint inventory document's statement that duplicate registrations had been removed is stale relative to this pinned source.
- Mobile transaction write and tenant-sync status are confirmed as 410 at the pinned source, not merely classified from a historical API matrix.
- Web's OpenAPI document is demonstrably narrower than the source route inventory. Until regenerated/reconciled, it must not be treated as the canonical complete API contract.
- The API matrix describes screen families (WEB-001–015, MOB-001–013, DES-001–010). It does **not** yet map every individual screen ID to exact method/path, request/response schema, error contract, and authorization preconditions.

### 9.2 Required per-screen acceptance record

For each of the 38 screen IDs, record:

1. Screen ID and actor/role.
2. Active tenant and resource/transaction/site scope.
3. Read and mutation method/path dependencies.
4. Request, response, error code, and version contract.
5. Required authorization predicates and audit behavior.
6. Loading, empty, denied, conflict, offline, and retry behavior.
7. Source evidence or explicit PROPOSED/MISSING classification.

**Disposition:** source evidence for the listed endpoint findings is reconciled. Individual screen-to-endpoint traceability remains OPEN and must be completed or formally deferred before final package approval.
