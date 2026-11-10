# IMPLEMENTATION-READINESS-GATES-001

**Version:** 1.0-draft  
**Status:** NOT ASSESSED — IMPLEMENTATION NOT APPROVED

## 1. Principle

Readiness is evaluated against measured blockers and reproducible evidence, not screen count or CI status alone.

## 2. Readiness levels

| Level | Meaning | Permitted next step |
|---|---|---|
| R0 — Not Assessed | Evidence insufficient | Continue review |
| R1 — Architecture Ready | Domain and contracts approved | Prepare implementation plan |
| R2 — Implementation Ready | Critical design, schema, and security gates validated | Request implementation authorization |
| R3 — Integration Ready | API, database, and platform integration tested | Request staging E2E authorization |
| R4 — Release Candidate | Security, E2E, operations, governance, and release evidence complete | Request release approval |
| R5 — Production Authorized | Explicit approval from all required release authorities | Deploy only within approved scope |

No level is granted automatically by CI PASS or screen completion.

## 3. Mandatory gates

### Gate A — API contracts

- [ ] Every screen maps to actual or explicitly proposed APIs.
- [ ] Request, response, error, and version contracts are documented.
- [ ] Tenant, participant, membership, role, permission, and site preconditions are explicit.
- [ ] Retired endpoints are not active client dependencies.
- [ ] Platform-specific differences have approved responsibility boundaries.
- [ ] Mutations define idempotency and audit behavior.

### Gate B — Authorization

- [ ] All 42 NAX cases and 6 PAX controls are reviewed and executable.
- [ ] Backend enforcement is proven independently of UI.
- [ ] No cross-tenant data leakage.
- [ ] Revocation, stale context, and offline replay semantics are approved.
- [ ] Sensitive operations fail closed on authorization/audit failure.

### Gate C — Schema and migration

- [ ] Canonical ownership model is approved.
- [ ] Composite integrity requirements are implemented and tested.
- [ ] Migration inventory and schema version are available per platform.
- [ ] Fresh install and upgrade paths pass.
- [ ] Runtime migration responsibility is explicit and proven.
- [ ] Database topology is decided.
- [ ] RLS is verified if Supabase is the selected backend.

### Gate D — Domain governance

- [ ] Contract snapshot and bilateral scope approval contracts are defined.
- [ ] Payment ledger and guarantee lifecycle contracts are defined.
- [ ] Release instruction and contract-conditioned release checks are defined.
- [ ] Syariah review authority and audit workflow are defined.
- [ ] Evidence and compliance reconciliation contracts are defined.

### Gate E — Integration and live

- [ ] Web/Mobile/Desktop domain semantics are consistent.
- [ ] Cross-platform sync, idempotency, conflict, and replay are tested.
- [ ] Production-like environment configuration is verified.
- [ ] Runtime health, login, database connectivity, and authorization are verified.
- [ ] Full E2E evidence is tied to exact tested commit SHA.
- [ ] Store signing/distribution and operational runbooks are evidenced before release.

## 4. Critical blocker register

| ID | Blocker | Severity | Required resolution |
|---|---|---|---|
| BLK-001 | Mobile single-enterprise authorization | Critical | Align with approved multi-tenant architecture |
| BLK-002 | Mobile transaction write endpoints retired | Critical | Provide supported authorized transaction contract |
| BLK-003 | Mobile tenant sync retired | High | Define and verify tenant sync |
| BLK-004 | Duplicate Mobile transaction route registration | High | Prove route order and active handler |
| BLK-005 | Five composite integrity gaps | Critical | Enforce participant and tenant/site referential integrity |
| BLK-006 | Runtime migration path unverified | Critical | Prove fresh install and upgrade |
| BLK-007 | Contract/scope approval APIs missing | Critical | Define immutable contract and bilateral approval |
| BLK-008 | Payment ledger/guarantee APIs missing | Critical | Define financial and guarantee lifecycle |
| BLK-009 | Release instruction API missing | Critical | Define server-enforced release authorization |
| BLK-010 | Negative-access suite not executed | Critical | Execute and pass NAX/PAX suite |
| BLK-011 | Supabase staging inactive; RLS unverified | Critical if Supabase is target | Restore inspectable staging and verify RLS |
| BLK-012 | Production runtime configuration unverified | High | Verify environment and runtime |
| BLK-013 | Web/Desktop supply-chain API parity incomplete | High | Define platform responsibilities/contracts |
| BLK-014 | Offline authorization/replay incomplete | Critical | Define revocation, idempotency, replay, audit |
| BLK-015 | Syariah governance API absent | High | Define reviewer workflow and authority |
| BLK-016 | Full production E2E not proven | Critical | Complete production-like E2E evidence |

## 5. R2 mandatory blockers

R2 cannot be recommended while any applicable Critical blocker remains unresolved or lacks an explicitly approved risk disposition. At minimum:
- BLK-001, BLK-005, BLK-006, BLK-010, BLK-014.
- BLK-011 if Supabase is the selected backend.
- Domain contracts for transaction, contract, payment, guarantee, and release.

## 6. Evidence quality rules

Every acceptance record must include:
- Repository, branch, and exact commit SHA.
- File/API/test reference.
- Test environment and configuration provenance.
- Expected and actual result.
- Timestamp and run URL where applicable.
- Reviewer and approval status.

Candidate-branch evidence must never be attributed to main. A deployment artifact marked READY is not proof of runtime health, login, database, or E2E.

## 7. Current readiness disposition

**R0 — NOT ASSESSED.**

The source audit establishes material blockers but does not authorize implementation. The next formal decision is approval of the integrated review package, followed by closure or disposition of blockers and open decisions.
