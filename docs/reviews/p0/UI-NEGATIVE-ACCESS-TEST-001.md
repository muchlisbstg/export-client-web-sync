# UI-NEGATIVE-ACCESS-TEST-001 — Negative-Access Test Specification

**Version:** 1.0-draft  
**Status:** SPECIFICATION ONLY — NOT EXECUTED  
**Baseline:** AUTH-MOBILE-RECONCILIATION-001 and approved tenant architecture

## 1. Objective

Prove that backend authorization denies unauthorized access even when a client forges tenant context, modifies requests, opens deep links, replays offline tasks, or holds stale role/assignment state.

Tests must assert backend outcomes and side effects. UI hiding is not sufficient.

## 2. Negative cases

### A. Authentication and tenant isolation

| ID | Scenario | Expected result | Severity |
|---|---|---|---|
| NAX-001 | Anonymous request to protected API | 401 | Critical |
| NAX-002 | Expired or revoked session | 401 | Critical |
| NAX-003 | Missing active tenant context | Deny/context error | Critical |
| NAX-004 | Switch to tenant without membership | 403 | Critical |
| NAX-005 | Revoked membership continues access | 403 | Critical |
| NAX-006 | Buyer reads Seller private data | 403/404 without leakage | Critical |
| NAX-007 | Seller reads private Buyer inquiry | 403/404 without leakage | Critical |
| NAX-008 | Forged tenant ID | Deny | Critical |
| NAX-009 | Supplier accesses unrelated tenant | Deny | Critical |
| NAX-010 | Role from another tenant is reused | Deny | Critical |

### B. Transaction and Supplier assignment

| ID | Scenario | Expected result | Severity |
|---|---|---|---|
| NAX-011 | No transaction assignment | Deny | Critical |
| NAX-012 | Revoked assignment is reused | Deny | Critical |
| NAX-013 | Out-of-scope transaction resource | Deny | Critical |
| NAX-014 | Nonparticipant reads restricted transaction | Deny | Critical |
| NAX-015 | Role lacks transaction permission | 403 | Critical |
| NAX-016 | Tenant administrator grants platform permission to self | Deny | Critical |
| NAX-017 | Assignment references wrong tenant participant | Deny | Critical |
| NAX-018 | Assignment without valid membership | Deny | Critical |

### C. Site and supply-chain authorization

| ID | Scenario | Expected result | Severity |
|---|---|---|---|
| NAX-019 | Inventory movement at unassigned site | Deny | Critical |
| NAX-020 | Destination site not assigned | Deny | Critical |
| NAX-021 | QC inspection at unauthorized site | Deny | Critical |
| NAX-022 | Role without site assignment | Deny | Critical |
| NAX-023 | Role incompatible with site operation | Deny | Critical |
| NAX-024 | Cross-tenant lot access | Deny | Critical |
| NAX-025 | Dispatch while QC hold is active | Deny | Critical |
| NAX-026 | Movement exceeds available stock | Deny | Critical |

### D. Contract and governance

| ID | Scenario | Expected result | Severity |
|---|---|---|---|
| NAX-027 | Unilateral activation of bilateral scope | Deny | Critical |
| NAX-028 | Syariah Reviewer approves transaction | Deny | Critical |
| NAX-029 | Syariah Reviewer changes payment ledger | Deny | Critical |
| NAX-030 | Syariah Reviewer authorizes goods release | Deny | Critical |
| NAX-031 | Unauthorized role issues release | Deny | Critical |
| NAX-032 | Contractual release condition unmet | Deny | Critical |
| NAX-033 | Buyer approval incorrectly required when contract does not require it | Do not impose blanket approval | High |

### E. Offline, administration, and audit

| ID | Scenario | Expected result | Severity |
|---|---|---|---|
| NAX-034 | Revoked offline task replay | Deny | Critical |
| NAX-035 | Cross-tenant offline task replay | Deny | Critical |
| NAX-036 | Duplicate movement replay | No duplicate side effect | Critical |
| NAX-037 | Audit persistence fails during sensitive action | Fail closed | Critical |
| NAX-038 | Platform Admin lacks explicit permission | Deny | Critical |
| NAX-039 | Platform Admin has explicit permission | Allow only within scope and audit | High |
| NAX-040 | Deep link bypasses UI navigation | Backend still denies | Critical |
| NAX-041 | API/authorization service failure | Fail closed | Critical |
| NAX-042 | Stale client authorization cache after revocation | Deny sensitive operation | Critical |

## 3. Positive controls

| ID | Scenario | Expected result |
|---|---|---|
| PAX-001 | Authorized Buyer accesses permitted transaction | Allow |
| PAX-002 | Authorized Seller accesses permitted transaction | Allow |
| PAX-003 | Assigned Supplier performs permitted operation | Allow |
| PAX-004 | Authorized QC user operates at assigned site | Allow |
| PAX-005 | Platform Admin with explicit permission performs permitted cross-tenant action | Allow and audit |
| PAX-006 | Syariah Reviewer accesses review scope | Allow review/comment; deny execution authority |

## 4. Test fixture requirements

Each test must record:
- Actor identity and session state.
- Tenant membership and role.
- Transaction participant relationship.
- Supplier assignment and site assignment, where relevant.
- Resource owner and resource tenant.
- Contract/release conditions where relevant.
- Request, response, side effects, and audit event.
- Environment, commit SHA, execution timestamp, and test result.

Use separate tenants and deliberately colliding resource identifiers where possible to prove tenant scoping is not based on globally unique IDs alone.

## 5. Acceptance criteria

- All 42 negative cases and 6 positive controls are executed.
- Zero unauthorized access successes.
- Zero cross-tenant data leakage.
- Sensitive mutations produce traceable audit events.
- Revocation takes effect according to an approved revocation policy.
- Offline replay cannot bypass authorization or duplicate side effects.
- Authorization and audit failures fail closed for sensitive operations.
- Each result includes reproducible evidence and exact tested SHA.
- Any Critical failure blocks affected implementation readiness.

## 6. Execution status

**NOT EXECUTED.** This document defines test intent and expected outcomes only. A green CI run elsewhere is not evidence that these 48 scenarios passed.
