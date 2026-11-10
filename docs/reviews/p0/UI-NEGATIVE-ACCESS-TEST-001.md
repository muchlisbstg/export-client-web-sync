# UI-NEGATIVE-ACCESS-TEST-001 — Negative-Access Test Specification

**Version:** 1.1-draft  
**Status:** CROSSWALK RECONCILED — SPECIFICATION ONLY — NOT EXECUTED  
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
| NAX-043 | Legacy enterprise role is the sole authority without a valid membership-bound role | 403 | Critical |
| NAX-044 | Buyer and Seller participant tenant are identical or duplicate party records are inserted | Database reject; no transaction side effect | Critical |
| NAX-045 | Inquiry ownership is inferred from email, creator, tracking code, or ambiguous legacy metadata | No ownership assignment; quarantine where ambiguous | Critical |
| NAX-046 | Transaction participant and linked inquiry ownership are inconsistent | Reject; no cross-tenant disclosure | Critical |
| NAX-047 | Duplicate transaction route handlers remain registered for the same method/path | CI/static contract failure; one authoritative handler required | High |

## 3. Positive controls

| ID | Scenario | Expected result |
|---|---|---|
| PAX-001 | Authorized Buyer accesses permitted transaction | Allow |
| PAX-002 | Authorized Seller accesses permitted transaction | Allow |
| PAX-003 | Assigned Supplier performs permitted operation | Allow |
| PAX-004 | Authorized QC user operates at assigned site | Allow |
| PAX-005 | Platform Admin with explicit permission performs permitted cross-tenant action | Allow and audit |
| PAX-006 | Syariah Reviewer accesses review scope | Allow review/comment; deny execution authority |
| PAX-007 | User with two active memberships switches tenant after fresh membership and permission validation | Allow only in selected tenant context |
| PAX-008 | Site owner approves an external transaction-site link | Allow only for approved purpose and effective period |
| PAX-009 | One site participates in multiple transactions with a distinct approved link for each | Allow only within each transaction link |
| PAX-010 | Revoked site approval is reused | Deny subsequent site-bound operation |
| PAX-011 | Assignment is constrained to active membership, participant, transaction, role, and site | Allow only when every relationship is valid |
| PAX-012 | Inquiry remains with originating tenant until authorized transfer | Allow origin tenant; deny unauthorized transfer/read |
| PAX-013 | Ambiguous legacy inquiry remains quarantined | Deny business access until evidence-backed assignment |
| PAX-014 | Mandatory audit record commits atomically with sensitive mutation | Allow only when mutation and audit commit together |
| PAX-015 | Contract-defined goods-release conditions are enforced independently of generic role access | Allow only when all applicable release conditions pass |

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

- All 47 negative cases and 15 positive controls are executed.
- Zero unauthorized access successes.
- Zero cross-tenant data leakage.
- Sensitive mutations produce traceable audit events.
- Revocation takes effect according to an approved revocation policy.
- Offline replay cannot bypass authorization or duplicate side effects.
- Authorization and audit failures fail closed for sensitive operations.
- Each result includes reproducible evidence and exact tested SHA.
- Any Critical failure blocks affected implementation readiness.

## 6. Execution status

**NOT EXECUTED.** This document defines test intent and expected outcomes only. A green CI run elsewhere is not evidence that these 62 scenarios passed.


## 7. Architecture test-ID crosswalk

The following crosswalk preserves the architecture document's NEG/POS IDs and the integrated suite's NAX/PAX IDs as separate namespaces. A mapping means scenario coverage is intended; it does not mean the test has run or passed.

### 7.1 Architecture NEG to integrated NAX

| AUTH-MOBILE NEG | Integrated NAX coverage | Coverage note |
|---|---|---|
| NEG-001 | NAX-001 | Unauthenticated protected request |
| NEG-002 | NAX-003 | Missing/unknown/inactive tenant context |
| NEG-003 | NAX-004 | Tenant switch without membership |
| NEG-004 | NAX-002, NAX-005 | Expired session and revoked/inactive membership |
| NEG-005 | NAX-004 | Unauthorized tenant switch |
| NEG-006 | NAX-010 | Role from another tenant |
| NEG-007 | NAX-018 | Role/assignment without valid membership |
| NEG-008 | NAX-043 | Legacy enterprise role as sole authority |
| NEG-009 | NAX-044 | Buyer and Seller tenant identity collision |
| NEG-010 | NAX-006, NAX-013, NAX-014 | Nonparticipant and out-of-scope transaction access |
| NEG-011 | NAX-009, NAX-014 | Third-party access without participant relationship |
| NEG-012 | NAX-017 | Assignment tenant differs from participant |
| NEG-013 | NAX-018 | Assignment grantee lacks active membership |
| NEG-014 | NAX-044 | Duplicate Buyer/Seller participant |
| NEG-015 | NAX-019, NAX-020, NAX-024 | Tenant/site mismatch |
| NEG-016 | NAX-019, NAX-021 | External site without owner approval |
| NEG-017 | NAX-012, NAX-020 | Pending/expired/revoked assignment or site scope |
| NEG-018 | NAX-018, NAX-022 | Site assignment without active membership |
| NEG-019 | NAX-024 | Cross-tenant site/resource access |
| NEG-020 | NAX-019, NAX-020 | Unauthorized source/destination site |
| NEG-021 | NAX-045 | Ownership must not be inferred |
| NEG-022 | NAX-045 | Ambiguous legacy ownership quarantine |
| NEG-023 | NAX-046 | Inquiry/transaction participant mismatch |
| NEG-024 | NAX-047 | Duplicate route registration |
| NEG-025 | NAX-037 | Audit persistence failure |
| NEG-026 | NAX-012, NAX-034, NAX-042 | Revocation and stale authority |
| NEG-027 | NAX-008, NAX-017 | Forged tenant/participant/site identifiers |
| NEG-028 | NAX-025, NAX-031, NAX-032 | Release blocked by QC/role/contract condition |
| NEG-029 | NAX-006, NAX-007 | Cross-party private document/inquiry access |
| NEG-030 | NAX-042 | Stale cached permission after revocation |

### 7.2 Architecture POS to integrated PAX

| AUTH-MOBILE POS | Integrated PAX coverage |
|---|---|
| POS-001 | PAX-001 |
| POS-002 | PAX-002 |
| POS-003 | PAX-003 |
| POS-004 | PAX-007 |
| POS-005 | PAX-008 |
| POS-006 | PAX-009 |
| POS-007 | PAX-010 |
| POS-008 | PAX-004 and PAX-011 |
| POS-009 | PAX-012 |
| POS-010 | PAX-013 |
| POS-011 | PAX-014 |
| POS-012 | PAX-015 |

PAX-005 (Platform Administrator with explicit permission) and PAX-006 (Syariah Reviewer review-only scope) are additional integrated positive controls with no one-to-one POS identifier in the architecture document.

### 7.3 Crosswalk acceptance

- Every architecture NEG/POS scenario has an integrated suite mapping.
- Integrated-only cases remain explicitly identified as additional coverage.
- No mapping is counted as execution evidence.
- The complete suite contains **47 negative cases and 15 positive controls**.
- Execution status remains **NOT EXECUTED** until a run is tied to an exact candidate SHA and all required fixtures, side effects, and audit assertions are reported.
