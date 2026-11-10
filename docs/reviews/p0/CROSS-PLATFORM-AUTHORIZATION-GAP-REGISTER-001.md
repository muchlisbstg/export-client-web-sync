# CROSS-PLATFORM-AUTHORIZATION-GAP-REGISTER-001

**Status:** READ-ONLY SOURCE AUTHORIZATION RECONCILIATION  
**Baseline date:** 2026-11-10  
**Decision basis:** OD-001–OD-022; approved multi-tenant Buyer/Seller/Supplier hybrid model  
**Candidate SHAs:** Web `836821995c58293edadc982ae89f5519e1d4076b`; Mobile `0a3c595c6697f56d0cef8536c3b93c3886cc5ab1`; Desktop `3cb71f658712ee6c2b60d33b339a9600c09f15d6`.

This is a source-level authorization gap register. No tests were executed in this audit. A route's presence or a helper's existence is not proof that every role/scope combination is correctly enforced at runtime.

## 1. Authorization baseline

Every protected request must be authorized server-side using all applicable dimensions:

1. Authenticated principal and current session.
2. Active tenant membership and bounded active tenant context.
3. Effective permission set composed from multiple active roles, with deterministic deny precedence.
4. Explicit transaction-party relationship and transaction scope.
5. Explicit site assignment and permitted operational action.
6. Resource ownership/classification and document purpose.
7. Current contract, dispute, payment, evidence, custody and release conditions where relevant.
8. Client/API compatibility capability for protected operations.
9. Attributable, tamper-resistant audit and correlation evidence.

Client-provided tenant IDs, role labels, transaction IDs, site IDs, local database state, offline timestamps, or UI visibility are inputs only; none is proof of authorization.

## 2. Evidence baseline and limits

| Platform | Pinned source evidence | What it demonstrates | What it does not demonstrate |
|---|---|---|---|
| Web | [server/index.ts](https://github.com/muchlisbstg/export-client-web-sync/blob/836821995c58293edadc982ae89f5519e1d4076b/server/index.ts), [server/auth.ts](https://github.com/muchlisbstg/export-client-web-sync/blob/836821995c58293edadc982ae89f5519e1d4076b/server/auth.ts), [OpenAPI](https://github.com/muchlisbstg/export-client-web-sync/blob/836821995c58293edadc982ae89f5519e1d4076b/docs/openapi.yaml) | Authentication, tenant header/membership checks, inquiry/product/tracking and transaction route source | Full 22-OD role/tenant/transaction/site matrix, Supplier hybrid access, signer, release, document and Syariah governance |
| Mobile | [authorization.mjs](https://github.com/muchlisbstg/export-client-mobile-sync/blob/0a3c595c6697f56d0cef8536c3b93c3886cc5ab1/server/authorization.mjs), [server/index.mjs](https://github.com/muchlisbstg/export-client-mobile-sync/blob/0a3c595c6697f56d0cef8536c3b93c3886cc5ab1/server/index.mjs), [supply-chain-routes.mjs](https://github.com/muchlisbstg/export-client-mobile-sync/blob/0a3c595c6697f56d0cef8536c3b93c3886cc5ab1/server/supply-chain-routes.mjs), [authorization matrix](https://github.com/muchlisbstg/export-client-mobile-sync/blob/0a3c595c6697f56d0cef8536c3b93c3886cc5ab1/docs/p0-api-endpoint-authorization-matrix.md) | Enterprise/supply role helpers, transaction/site assignment checks, some route-level negative-access test specifications | Approved independent multi-tenant model, all 22 OD controls, complete allowed-role Cartesian matrix, live release authorization, test execution on this pinned SHA |
| Desktop | [electron/auth.ts](https://github.com/muchlisbstg/export-client-desktop-sync/blob/3cb71f658712ee6c2b60d33b339a9600c09f15d6/electron/auth.ts), [electron/local-api.ts](https://github.com/muchlisbstg/export-client-desktop-sync/blob/3cb71f658712ee6c2b60d33b339a9600c09f15d6/electron/local-api.ts), [api client](https://github.com/muchlisbstg/export-client-desktop-sync/blob/3cb71f658712ee6c2b60d33b339a9600c09f15d6/src/shared/api-client.ts) | Local API, authentication and tenant membership-oriented checks | Supplier/site/transaction assignment policy parity, complete scoped role matrix, contract/release/Syariah authorization |

## 3. Canonical role vocabulary and boundaries

This is the approved logical role/authority model against which source must be evaluated. It is not a claim that all roles already exist in code.

| Role / authority | Permitted capability | Explicit prohibition / boundary |
|---|---|---|
| Tenant Owner | Tenant administration within own tenant; appoint authorized administrators | No cross-tenant access without explicit participant/assignment relationship |
| Tenant Administrator | Membership administration only with explicit `membership.admin` and delegated-authority ceiling | Cannot self-escalate or grant beyond own delegated authority |
| Buyer Authorized Representative | Buyer-side contract/scope decisions and Buyer approvals when contract/law requires | No Seller instruction or unrelated tenant authority |
| Seller Authorized Representative | Seller-side contract/scope decisions and Seller release instruction | Cannot bypass contract/legal release conditions or Buyer approval when explicitly required |
| Supplier operational actor | Assigned transaction/site operations within explicit active assignment | No general Buyer/Seller tenant access; no goods-release authority from assignment alone |
| Platform Administrator | Broad platform administration under explicit permissions, least privilege, and full audit | No unlogged access, financial mutation, contract override, or goods release merely by platform role |
| Syariah Reviewer | Assigned-scope review, comment, recommendation, evidence access for review purpose | No transaction approval, ledger mutation, evidence provenance mutation, or release authorization |
| Auditor / independent reviewer | Read/review audit evidence within assigned purpose | No implied Syariah authority, operational write, or self-approval |
| Emergency break-glass holder | Minimum approved incident scope for limited duration after step-up authentication | Cannot bypass contract, financial, Syariah, custody, dispute, or release gates |

## 4. Tenant × transaction × site authorization matrix

| Access scenario | Required server-side proof | Web | Mobile | Desktop | Severity |
|---|---|---|---|---|---|
| User accesses own tenant resource | Authenticated user + active membership + active tenant context + resource tenant match | Partial | Partial / single enterprise | Partial | HIGH |
| User selects another tenant | Membership belongs to principal, active, context established server-side | Partial | Non-compliant: fixed enterprise | Partial | CRITICAL |
| User accesses unrelated tenant resource | Explicit participant/assignment relationship and scope | Not evidenced | Partial helpers; single enterprise model conflict | Not evidenced | CRITICAL |
| Supplier accesses Buyer/Seller transaction | Independent Supplier tenant + transaction participant bridge + active assignment | Not evidenced | Partial; participant/assignment model not fully aligned | Not evidenced | CRITICAL |
| Supplier accesses unassigned site | Active assignment for exact tenant, transaction, site, action and time | Not evidenced | Partial route checks; full matrix not established | Not evidenced | CRITICAL |
| Supplier accesses unrelated tenant data after assignment | Resource must be within assignment scope; fail closed outside scope | Not evidenced | Partial | Not evidenced | CRITICAL |
| User switches tenant with open requests/cache | Old context and cached permissions invalidated; in-flight requests bound to old context rejected | Not evidenced | Not evidenced; fixed enterprise context | Not evidenced | CRITICAL |
| Membership suspended/revoked | Server recognizes status change; protected requests fail closed; authorization cache invalidated | Partial | Partial | Partial | HIGH |
| Role removed while session active | Effective permission recomputed/version invalidated | Not evidenced | Partial | Not evidenced | HIGH |
| Site assignment revoked during handover | New actions denied; handover suspended; custody reassignment separately authorized | Not evidenced | Partial; suspension state not evidenced | Not evidenced | CRITICAL |
| Cross-tenant transaction/site ID substitution | Composite tenant+transaction/site FK and server-side relationship checks | Not evidenced | Partial; five schema blockers | Not evidenced | CRITICAL |
| Syariah Reviewer attempts approve transaction | Explicit deny; review finding only | Not evidenced | Not evidenced / role boundary absent | Not evidenced | CRITICAL |
| Syariah Reviewer attempts ledger mutation | Explicit deny and auditable denial | Not evidenced | Not evidenced | Not evidenced | CRITICAL |
| Syariah Reviewer attempts goods release | Explicit deny; server release authority remains separate | Not evidenced | Not evidenced | Not evidenced | CRITICAL |
| Platform Administrator attempts unscoped data access | Explicit permission, purpose, tenant/resource scope, audit | Not evidenced | Not evidenced | Not evidenced | HIGH |
| Emergency access outside incident scope | Reject; step-up, expiry, independent review | Not evidenced | Not evidenced | Not evidenced | HIGH |

## 5. Route inventory and route-to-policy mapping

The table lists source-observed route families and their authorization evidence status. It is not a complete generated route inventory; a complete AST/runtime route catalogue remains a required evidence item.

| Platform / route family | Source evidence | Required authorization dimensions | Current finding |
|---|---|---|---|
| Web `/api/v1/tenant/*` and active tenant context | [server/index.ts](https://github.com/muchlisbstg/export-client-web-sync/blob/836821995c58293edadc982ae89f5519e1d4076b/server/index.ts) | Principal, membership, active context, context replacement, audit | Membership/header checks found; context lifecycle and cache isolation not established |
| Web product/inquiry/tracking routes | [server/index.ts](https://github.com/muchlisbstg/export-client-web-sync/blob/836821995c58293edadc982ae89f5519e1d4076b/server/index.ts), [OpenAPI](https://github.com/muchlisbstg/export-client-web-sync/blob/836821995c58293edadc982ae89f5519e1d4076b/docs/openapi.yaml) | Principal, tenant ownership, inquiry owner, transaction participant, resource scope | Existing API coverage does not prove all OD-001–022 controls; OpenAPI route parity incomplete |
| Web transaction list/detail/create/status | [server/index.ts](https://github.com/muchlisbstg/export-client-web-sync/blob/836821995c58293edadc982ae89f5519e1d4076b/server/index.ts) | Tenant, explicit participant, role permission, transaction scope, lifecycle approval | Routes present; approved bilateral scope and Supplier participant model not established |
| Mobile `/api/v1/enterprise/session` | [server/index.mjs](https://github.com/muchlisbstg/export-client-mobile-sync/blob/0a3c595c6697f56d0cef8536c3b93c3886cc5ab1/server/index.mjs) | Principal, membership, active enterprise/tenant context | Single-enterprise constraint conflicts with approved multi-tenant architecture |
| Mobile `/api/v1/transactions` list/detail | [server/supply-chain-routes.mjs](https://github.com/muchlisbstg/export-client-mobile-sync/blob/0a3c595c6697f56d0cef8536c3b93c3886cc5ab1/server/supply-chain-routes.mjs), [server/index.mjs](https://github.com/muchlisbstg/export-client-mobile-sync/blob/0a3c595c6697f56d0cef8536c3b93c3886cc5ab1/server/index.mjs) | Active tenant, participant, transaction assignment, site scope, deterministic route owner | Duplicate GET handler registration requires route ownership and precedence test |
| Mobile transaction create/status and tenant sync | [server/index.mjs](https://github.com/muchlisbstg/export-client-mobile-sync/blob/0a3c595c6697f56d0cef8536c3b93c3886cc5ab1/server/index.mjs) | Approved multi-tenant participant model, lifecycle permission and audit | Legacy transaction create/status and tenant sync paths return 410; replacement runtime contract not established |
| Mobile site assignment grant/revoke | [server/supply-chain-routes.mjs](https://github.com/muchlisbstg/export-client-mobile-sync/blob/0a3c595c6697f56d0cef8536c3b93c3886cc5ab1/server/supply-chain-routes.mjs) | Tenant admin/delegated authority, exact site/transaction scope, effective/expiry, audit | Route family exists; full lifecycle metadata, independent Supplier tenant and handover revocation semantics incomplete |
| Mobile handover prepare/dispatch/receive/reject | [server/supply-chain-routes.mjs](https://github.com/muchlisbstg/export-client-mobile-sync/blob/0a3c595c6697f56d0cef8536c3b93c3886cc5ab1/server/supply-chain-routes.mjs) | Current assignment, custody roles, sender/receiver, evidence, state transition, audit | Operational workflow exists; assignment-revocation suspension and controlled reassignment not evidenced |
| Mobile release authorization | [release-authorization.openapi.yaml](https://github.com/muchlisbstg/export-client-mobile-sync/blob/0a3c595c6697f56d0cef8536c3b93c3886cc5ab1/docs/api/release-authorization.openapi.yaml) | Contract snapshot, signer authority, ledger, evidence, guarantee, legal/Syariah gates, Seller instruction, conditional Buyer approval | Draft contract only; no runtime route implementation proven |
| Desktop local API and transaction routes | [electron/local-api.ts](https://github.com/muchlisbstg/export-client-desktop-sync/blob/3cb71f658712ee6c2b60d33b339a9600c09f15d6/electron/local-api.ts) | Principal, tenant membership, transaction ownership/participant, permission, site assignment | Basic local API/auth/tenant behavior found; full Supplier/site and governance authorization parity not evidenced |

### 5.1 Mobile duplicate route registration

The transaction GET list/detail handlers are registered in both `server/supply-chain-routes.mjs` and `server/index.mjs`, with supply-chain route registration called before later handlers. This creates a route ownership/precedence risk. A deterministic route-registration test and a single documented owner are required before runtime confidence can be claimed.

Evidence:
- [server/index.mjs](https://github.com/muchlisbstg/export-client-mobile-sync/blob/0a3c595c6697f56d0cef8536c3b93c3886cc5ab1/server/index.mjs)
- [server/supply-chain-routes.mjs](https://github.com/muchlisbstg/export-client-mobile-sync/blob/0a3c595c6697f56d0cef8536c3b93c3886cc5ab1/server/supply-chain-routes.mjs)

## 6. Negative-access coverage requirements

The following matrix defines minimum denial scenarios. These are required tests, not executed results.

| Test ID | Actor / condition | Attempt | Expected result | Required evidence |
|---|---|---|---|---|
| NAX-AUTH-001 | Unauthenticated | Any protected route | 401/deny; no data disclosure | Request/response, audit/security log |
| NAX-TEN-001 | Authenticated user without membership in target tenant | Select tenant | Deny; no context established | Membership lookup, response, audit |
| NAX-TEN-002 | Suspended/revoked membership | Read or mutate tenant resource | Deny after server recognizes revocation | Revocation version, request trace |
| NAX-TEN-003 | User switches tenant while prior request/token/cache exists | Reuse old context | Deny old-context access; no cache leakage | Context version, cache invalidation evidence |
| NAX-ROLE-001 | User with multiple roles, one denied scope | Invoke denied action | Explicit deny precedence | Permission composition trace |
| NAX-ROLE-002 | Tenant admin exceeds delegated authority | Grant higher role/permission | Deny; no privilege escalation | Before/after membership state and audit |
| NAX-ROLE-003 | Administrator self-grants authority | Modify own membership | Deny or independent authorized approval | Audit and negative response |
| NAX-SUP-001 | Supplier tenant not a transaction participant | Read Buyer/Seller transaction | Deny | Participant lookup and audit |
| NAX-SUP-002 | Supplier participant without active site assignment | Access site operation | Deny | Assignment lookup and audit |
| NAX-SUP-003 | Supplier assignment revoked/expired | Repeat protected action | Deny; active handover suspended where applicable | Assignment state, handover state |
| NAX-SITE-001 | Actor assigned to Site A | Read/mutate Site B | Deny | Site scope check |
| NAX-SITE-002 | Tenant A assignment references Tenant B site/transaction | Create/use relationship | Reject by composite FK and server validation | Database constraint evidence |
| NAX-DOC-001 | Party lacks document classification permission | Preview/download/export/share | Deny each separately | Document policy decision and audit |
| NAX-REP-001 | Delegate scope exceeds delegator authority | Sign/approve | Deny | Delegation chain and authority proof |
| NAX-REP-002 | Delegation expired/revoked | Sign/approve | Deny | Revocation/version evidence |
| NAX-BG-001 | No qualifying incident / no step-up auth | Activate break-glass | Deny | Incident and authentication evidence |
| NAX-CON-001 | One party attempts unilateral activation/reactivation | Activate transaction scope | Deny; bilateral approvals required | Scope decision record |
| NAX-CON-002 | Unauthorized signer | Sign contract snapshot | Deny | Signer authority and contract audit |
| NAX-REL-001 | Seller release instruction absent | Release goods | Deny | Release gate trace |
| NAX-REL-002 | Buyer approval required by signed contract but absent | Release goods | Deny | Contract condition evaluation |
| NAX-REL-003 | Payment ledger not satisfied | Release goods | Deny | Ledger reconciliation evidence |
| NAX-REL-004 | Required evidence missing/invalid | Release goods | Deny | Evidence register evaluation |
| NAX-REL-005 | Material unresolved dispute/hold | Release goods | Deny | Hold state and release decision |
| NAX-SHR-001 | Syariah Reviewer attempts transaction approval | Approve transaction | Deny | Role permission denial |
| NAX-SHR-002 | Syariah Reviewer attempts ledger mutation | Mutate payment ledger | Deny | Audit and immutable ledger evidence |
| NAX-SHR-003 | Syariah Reviewer attempts goods release | Release goods | Deny | Server authorization denial |
| NAX-AUD-001 | Actor attempts to alter/suppress own audit record | Mutate audit | Deny; audit integrity preserved | Tamper-evident evidence |
| NAX-OFF-001 | Duplicate offline command replay | Replay same command/idempotency key | No duplicate business effect | Idempotency record |
| NAX-OFF-002 | Stale offline command after assignment/membership revocation | Replay command | Deny at replay time | Current authorization check |
| NAX-OFF-003 | Client clock/time claims newer business state | Override server order | Server order/version wins | Causal/version trace |
| NAX-VER-001 | Unsupported client version | Contract/payment/release action | Deny protected operation with explicit error | Version policy and audit |

## 7. Positive-access coverage requirements

Positive tests must prove least-privilege success, not merely that administrators can perform all actions.

| Test ID | Actor / precondition | Allowed action | Required proof |
|---|---|---|---|
| PAX-001 | Active Buyer member with required role | Read own tenant resources | Tenant ownership and permission trace |
| PAX-002 | Active Seller member with required role | Read own tenant resources | Tenant ownership and permission trace |
| PAX-003 | Supplier active tenant member and explicit transaction participant | Read only assigned transaction scope | Participant and tenant scope |
| PAX-004 | Supplier actor with active Site A assignment | Perform permitted Site A action | Assignment action/scope/time validation |
| PAX-005 | Multi-role membership with non-conflicting grants | Perform combined permitted actions | Deterministic permission composition |
| PAX-006 | Tenant admin with delegated membership.admin ceiling | Manage membership within ceiling | Before/after audit and ceiling proof |
| PAX-007 | Valid Authorized Representative | Sign within authority and contract scope | Signer/authority/snapshot binding |
| PAX-008 | Valid delegate with active bounded delegation | Perform delegated action only | Delegator/delegate/scope/expiry audit |
| PAX-009 | Seller Authorized Representative | Issue release instruction | Active signer authority and contract scope |
| PAX-010 | Buyer Authorized Representative where contract/law requires | Provide conditional Buyer approval | Contract condition reference |
| PAX-011 | Syariah Reviewer assigned to review | View permitted evidence and submit recommendation | Purpose/scope audit; no business-state mutation |
| PAX-012 | Independent finding verifier | Verify evidence-backed closure | Segregation of duties and closure record |
| PAX-013 | Active handover sender/receiver | Complete custody transfer | Assignment, identity, condition and evidence |
| PAX-014 | Supported client version | Invoke supported contract endpoint | Client/API compatibility proof |
| PAX-015 | Offline command with current authority and valid idempotency | Reconcile once | Server authorization and replay trace |

## 8. Existing negative/positive test specification reconciliation

The integrated package defines:
- NAX-001–NAX-047: negative-access scenarios.
- PAX-001–PAX-015: positive-access scenarios.
- Mobile architecture baseline: NEG-001–NEG-030 and POS-001–POS-012.

These are specifications/crosswalks, not evidence of execution. This audit does not claim any of these suites passed on the candidate SHAs. Execution status remains **NOT EXECUTED** until an exact candidate SHA, environment, workflow/run ID, job result, and relevant logs are recorded.

## 9. Priority gap register

| Gap ID | Priority | Platforms | Required closure evidence |
|---|---|---|---|
| AUTH-GAP-001 | CRITICAL | All | Independent Buyer/Seller/Supplier tenant and transaction participant enforcement |
| AUTH-GAP-002 | CRITICAL | Mobile | Replace single-enterprise assumption with approved tenant context model |
| AUTH-GAP-003 | CRITICAL | Web/Desktop | Context replacement, stale-token rejection and cache isolation |
| AUTH-GAP-004 | HIGH | All | Multiple role composition, deny precedence and delegated membership.admin ceiling |
| AUTH-GAP-005 | CRITICAL | All | Authorized Representative/delegation signer validation |
| AUTH-GAP-006 | HIGH | All | Break-glass incident eligibility, step-up, expiry, independent review |
| AUTH-GAP-007 | CRITICAL | Web/Desktop | Supplier transaction/site assignment and handover policy parity |
| AUTH-GAP-008 | CRITICAL | Mobile | Assignment revocation must suspend active handover and preserve custody evidence |
| AUTH-GAP-009 | CRITICAL | All | Document classification and per-action visibility authorization |
| AUTH-GAP-010 | CRITICAL | All | Runtime release gates linked to contract, ledger, evidence, dispute, law and Syariah controls |
| AUTH-GAP-011 | CRITICAL | All | Syariah Reviewer deny boundary for transaction, ledger and release mutations |
| AUTH-GAP-012 | HIGH | All | Review findings lifecycle and independent closure verification |
| AUTH-GAP-013 | CRITICAL | All | SQLite local-only authority boundary and Supabase gated backend controls |
| AUTH-GAP-014 | CRITICAL | All | Composite tenant+transaction/site referential integrity |
| AUTH-GAP-015 | HIGH | Mobile | Remove duplicate transaction GET route ownership ambiguity |
| AUTH-GAP-016 | HIGH | All | Complete route catalogue, OpenAPI parity and route-role test traceability |
| AUTH-GAP-017 | HIGH | All | Offline replay reauthorization, idempotency and protected conflict handling |
| AUTH-GAP-018 | HIGH | All | Minimum client version enforcement and compatibility test evidence |

## 10. Acceptance criteria before authorization sign-off

1. Every protected route is inventoried with method, handler owner, authentication requirement, permission key, tenant scope, transaction scope, site scope, and resource classification.
2. Each route has explicit allow and deny behavior for every applicable canonical role.
3. Every tenant boundary is enforced by server-side checks and composite database constraints where applicable.
4. Role combination, membership admin delegation, signer delegation, and break-glass are tested for privilege escalation.
5. Supplier access is limited to active transaction participant and site assignments.
6. Assignment revocation blocks new actions and suspends dependent handover safely.
7. Document visibility is independently tested for view/download/export/share.
8. Contract, payment, evidence, dispute, guarantee, legal and Syariah gates are server-authoritative for release.
9. Syariah Reviewer is technically unable to approve, mutate ledger, or authorize release.
10. Offline commands are idempotent and reauthorized against current server state.
11. OpenAPI route parity and client compatibility are verified against exact candidate SHAs.
12. Negative/positive test runs include reproducible environment, workflow, job and log evidence.

## 11. Governance boundary

This register is a read-only review artifact. It does not authorize code changes, implementation, schema/DDL, migration, test execution against shared/live systems, PR, merge, deployment, or staging/production mutation. Separate explicit authorization is required for each such activity.
