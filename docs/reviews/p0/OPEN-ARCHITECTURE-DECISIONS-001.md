# OPEN-ARCHITECTURE-DECISIONS-001 — Decision Register

**Version:** 1.0-draft  
**Status:** OPEN — OWNER AND DISPOSITION REQUIRED

This register contains unresolved questions surfaced during the integrated review. No option is approved merely by appearing here. Each decision requires a named owner, alternatives, consequences, approval, and ADR reference where applicable.

## 1. Identity and membership

| ID | Open question | Proposed owner |
|---|---|---|
| OD-001 | Can one membership hold multiple active roles? | Architecture / Security |
| OD-002 | Who may administer membership administrators? | Governance |
| OD-003 | How is tenant switching and active context established? | Architecture / Security |
| OD-004 | When does tenant context expire or require revocation? | Security |
| OD-005 | How is Authorized Representative delegation issued, scoped, and revoked? | Governance / Legal |
| OD-006 | Is emergency access permitted, and what are its audit/expiry controls? | Security / Governance |

## 2. Supplier and site assignment

| ID | Open question | Proposed owner |
|---|---|---|
| OD-007 | Must Supplier always be an independent tenant? | Product / Architecture |
| OD-008 | How is assignment revocation handled during an active handover? | Operations / Security |
| OD-009 | Must assignment include effective date, expiry, and revocation reason? | Architecture |
| OD-010 | How is cross-party document visibility determined? | Legal / Product |

## 3. Transaction and governance

| ID | Open question | Proposed owner |
|---|---|---|
| OD-011 | How are scope approval and reactivation represented in contract lifecycle? | Legal / Architecture |
| OD-012 | How is delegated signer authority validated against signed contract snapshot? | Legal |
| OD-013 | How are release conditions mapped from contract snapshot to shipment? | Operations / Legal |
| OD-014 | How do disputes or conflicting evidence affect release? | Legal / Operations |
| OD-015 | What is the Syariah Reviewer access boundary for sensitive documents/evidence? | Syariah Governance |
| OD-016 | How are review findings and recommendations closed or actioned? | Syariah Governance |

## 4. Platform and data architecture

| ID | Open question | Proposed owner |
|---|---|---|
| OD-017 | Are per-platform SQLite databases only cache/offline stores or authoritative databases? | Architecture |
| OD-018 | Is Supabase the authoritative shared backend? | Architecture / Infrastructure |
| OD-019 | How is canonical schema version managed across three platforms? | Data Architecture |
| OD-020 | How are offline conflict resolution and replay ordering defined? | Architecture / Operations |
| OD-021 | Is one OpenAPI source of truth required? | Architecture |
| OD-022 | How is backward compatibility handled for mobile clients on older versions? | Architecture / Product |

## 5. Decision record acceptance

For each OD item, record:
- Decision ID and exact question.
- Decision owner and required approvers.
- Options considered.
- Selected option and rationale, or explicit deferral.
- Security, legal, operational, financial, and Syariah implications.
- Effective date and review date.
- ADR link and evidence references.

A deferred decision must include a safe interim rule and the scope it blocks. Do not let implementation silently choose policy.


## 6. Decision records

### OD-001 — Multiple active roles per membership

**Status:** APPROVED  
**Decision:** One tenant membership may hold multiple active roles concurrently.

**Approved controls:**
- A user may hold separate memberships in different tenants.
- Each membership may have multiple active roles.
- Effective permissions are evaluated server-side from the active membership, role grants, and applicable transaction/site/time scopes.
- Role combination must not create privilege escalation or bypass explicit permission boundaries.
- Role grants, changes, expiry, and revocation require attributable audit records.

**Decision note:** No additional condition or qualification was supplied.

**Decision authority:** User approval recorded in this conversation.  
**Implementation status:** NOT AUTHORIZED. This is an architecture decision only; it does not authorize code changes, schema/DDL, migrations, tests against shared/live systems, PR, merge, or deployment.

**Follow-on evidence required:** Define deterministic permission-composition rules, conflict/deny precedence, scoped-role evaluation, and tests proving that combined roles cannot exceed the membership's permitted scope.


### OD-002 — Membership administrator governance

**Status:** APPROVED  
**Decision:** Membership administration may be performed only by a Tenant Owner or Tenant Administrator holding the explicit `membership.admin` permission.

**Approved controls:**
- The actor must have an active membership in the target tenant.
- The actor may grant, change, suspend, or revoke membership roles only within the authority explicitly delegated to that actor.
- An administrator cannot grant permissions or roles exceeding their own delegated administrative authority.
- Membership administration must be tenant-scoped and fail-closed.
- Every membership/role change must record actor, target membership, tenant, action, before/after state, timestamp, reason, and correlation/audit reference.
- The system must prevent self-escalation and unauthorized privilege transfer.

**Decision note:** “Ya” accepts the recommendation as stated; no additional qualification was supplied.

**Decision authority:** User approval recorded in this conversation.  
**Implementation status:** NOT AUTHORIZED. This is an architecture decision only; it does not authorize code changes, schema/DDL, migrations, tests against shared/live systems, PR, merge, or deployment.

**Follow-on evidence required:** A permission matrix for `membership.admin`, tests for delegated-authority ceilings, cross-tenant administration denial, self-escalation denial, revocation, and complete audit attribution.


### OD-003 — Tenant switching and active context

**Status:** APPROVED  
**Decision:** A user with multiple tenant memberships must explicitly select an active tenant context. The server is authoritative for establishing and validating that context.

**Approved controls:**
- After authentication, the user selects an active tenant from eligible memberships.
- The server validates that the selected membership exists, is active, and belongs to the authenticated user before establishing tenant context.
- A tenant identifier supplied by the client is a context-selection input only; it is never proof of membership or authorization.
- Every request is authorized against the server-validated active tenant context and applicable resource/transaction/site scopes.
- A successful tenant switch replaces the prior active context; requests or credentials bound to the previous context must not remain usable as if the old context were active.
- Context switching must not carry over permissions, resource access, or cached authorization decisions from the previous tenant.
- Tenant switching and context establishment/replacement must be auditable.

**Decision note:** User approval (“Y”) accepts the recommendation as stated; no additional qualification was supplied.

**Decision authority:** User approval recorded in this conversation.  
**Implementation status:** NOT AUTHORIZED. This is an architecture decision only; it does not authorize code changes, schema/DDL, migrations, tests against shared/live systems, PR, merge, or deployment.

**Follow-on evidence required:** Tests for unauthorized tenant selection, inactive/revoked membership, cross-tenant resource access, stale session/token context after switching, cache isolation, and audit attribution.
