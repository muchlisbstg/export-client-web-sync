# CANONICAL-SCHEMA-SPECIFICATION-POSTGRESQL-SQLITE-001

**Version:** 1.0  
**Date:** 2026-11-10  
**Status:** DOMAIN BASELINE APPROVED FOR DEC-001–DEC-005; TECHNICAL GATES OPEN  
**Repository scope:** Web, Mobile, Desktop, and authoritative backend  
**Database targets:** PostgreSQL (authoritative shared business state); SQLite (local/offline persistence)  
**Execution status:** SPECIFICATION ONLY — NO DDL OR MIGRATION AUTHORIZED

## 1. Purpose and governance

This document defines the canonical logical schema and cross-engine constraint contract for PostgreSQL and SQLite. It consolidates the approved Supplier hybrid domain model, legal-party binding, canonical transaction participants, site-scoped assignments, lifecycle/revocation rules, composite referential integrity, and cross-platform acceptance criteria.

The specification is not an implementation authorization. It does not authorize code changes, DDL execution, migration creation or execution, test execution against shared/live systems, PR creation, merge, deployment, or staging/production mutation.

### 1.1 Authority boundaries

- PostgreSQL is the target authoritative shared business database, subject to the security and operational gates in DEC-006 through DEC-008 and the existing gated backend direction.
- SQLite is local persistence for permitted cache, drafts, offline commands, and synchronization metadata. It is not authoritative for shared tenant, contract, financial, fulfillment, or release state.
- Server-side authorization is the sole authority for protected business operations.
- Signed contract snapshot is the contractual agreement source of truth.
- Payment ledger is the financial settlement source of truth.
- Evidence register is the fulfillment source of truth.
- Goods release is authorized only by server-side policy evaluation.
- RLS is defense-in-depth and does not replace backend authorization.

## 2. Normative domain model

### 2.1 Canonical entities

| Entity | Responsibility |
|---|---|
| `tenants` | Independent identity, membership, administration, and data-isolation boundary |
| `tenant_memberships` | User-to-tenant membership and role grants |
| `legal_parties` | Verified legal identity |
| `tenant_legal_party_bindings` | Versioned relationship between tenant and legal party |
| `commercial_transactions` | Transaction identity and Buyer/Seller legal-party references |
| `transaction_participants` | Canonical tenant/legal-party participation in a transaction |
| `supply_sites` | Site owned by one tenant |
| `transaction_site_links` | Participant-scoped transaction/site relationship |
| `transaction_access_assignments` | Subject-user authorization bounded by participant, transaction, site/scope, action, and time |
| `permission_actions` | Canonical action vocabulary |
| `transaction_access_assignment_actions` | Normalized assignment-to-action grants |
| `audit_events` | Attributable history of security- and business-relevant events |

### 2.2 Normative invariants

1. Buyer, Seller, and Supplier are independent tenants.
2. A legal party is not the same entity as a tenant.
3. Supplier is not merely a role inside a Buyer or Seller tenant.
4. A tenant does not gain transaction access merely by knowing a transaction identifier.
5. A participant does not automatically gain access to every site in a transaction.
6. Operational assignments are bounded by tenant, participant, transaction, site, action, and effective period.
7. A client-supplied tenant identifier is context-selection input, never proof of authorization.
8. PostgreSQL is authoritative for shared business state; SQLite state is untrusted when synchronized.
9. No local state, role label, assignment row, or client assertion can authorize contract activation, payment settlement, fulfillment completion, or goods release.
10. Cross-tenant access is explicit, server-validated, auditable, and fail-closed.

## 3. Canonical table contracts

The following are logical contracts. Engine-specific physical DDL must preserve these semantics.

### 3.1 legal_parties

| Column | Requirement |
|---|---|
| `id` | UUID logical identifier; primary key |
| `legal_name` | Required official legal name |
| `registration_country` | Required ISO country code |
| `registration_number` | Conditional on jurisdiction and verification |
| `legal_status` | Controlled vocabulary |
| `created_at`, `updated_at` | Required UTC timestamps |

Legal identity must not be inferred from email, user display name, tenant name, creator, or unverified transaction metadata.

### 3.2 tenant_legal_party_bindings

Required logical fields:

- `id`, `tenant_id`, `legal_party_id`
- `verification_status`
- `effective_from`, `effective_until`
- `verified_by`, `evidence_reference`
- `audit_reference`, `created_at`

Recommended lifecycle: `pending`, `verified`, `rejected`, `revoked`, `expired`.

Required candidate keys:

```sql
UNIQUE (id, tenant_id, legal_party_id)
```

#### DEC-001 — normative binding invariant (APPROVED)

A tenant may have at most one verified and currently effective tenant-to-legal-party binding at a time. Previous binding versions must be retained. A legal-party change is represented by a new version with effective period, verification evidence, verifier attribution, and audit history.

Temporal invariant:

```
For every tenant:
count(verified bindings effective at instant t) <= 1
```

A binding is currently effective only when its status is verified, its start is not in the future, its end is null or later than the evaluation instant, and it has not been revoked or otherwise terminated.

A verified binding must have verifier attribution and verification evidence. Invalid or overlapping effective periods must be rejected. Historical versions must not be destructively overwritten or deleted as part of a legal-party change.

Changing a tenant's current binding must not silently change the legal-party identity recorded on an existing transaction or signed contract snapshot. Contract-party changes follow the applicable amendment and legal approval process.

**PostgreSQL mapping:** use a temporal exclusion constraint over a verified/effective time range where practical, or a transactionally serialized enforcement strategy. A partial unique index on status alone is insufficient to prevent overlapping future or historical effective periods.

**SQLite mapping:** use CHECK constraints for valid ranges, triggers to reject overlapping verified effective periods, and a serialized write transaction. SQLite must produce the same accept/reject result as PostgreSQL for the same test corpus.

### 3.3 commercial_transactions

Required fields:

- `id` primary key;
- `buyer_party_id` FK to `legal_parties`;
- `seller_party_id` FK to `legal_parties`;
- transaction lifecycle status;
- UTC creation/update timestamps.

Buyer and Seller must be distinct legal parties. Tenant identity must not replace contractual legal-party identity. The legal-party references used for the transaction must remain stable according to contract lifecycle and amendment rules.

### 3.4 transaction_participants

This is the canonical tenant-to-transaction participation relationship.

Required fields:

- `id` primary key;
- `tenant_id`;
- `transaction_id`;
- `legal_party_id`;
- `participant_role`: `buyer`, `seller`, or `supplier`;
- `participation_status`;
- `effective_from`, `effective_until`;
- `approved_by`, `approval_reference` where required;
- `created_at`, `updated_at`.

Required candidate keys:

```sql
UNIQUE (tenant_id, transaction_id);
UNIQUE (id, tenant_id, transaction_id);
```

Rules:

- Buyer participant must match the transaction's Buyer legal party through a verified tenant/legal-party binding.
- Seller participant must match the transaction's Seller legal party through a verified tenant/legal-party binding.
- Supplier participant must use an independent Supplier tenant and verified legal-party binding.
- Supplier participation requires explicit approval and a bounded operational scope.
- A participant record does not itself grant site or action access.
- The same tenant cannot be both Buyer and Seller in one transaction.
- A participant's lifecycle and approval evidence must be attributable and auditable.

#### DEC-002 — participant cardinality (APPROVED)

There is at most one participant record for each `(tenant_id, transaction_id)`. A participant may have multiple user assignments and multiple site links. A different Supplier tenant may have its own participant record in the same transaction. Duplicate participant rows must not be used to bypass lifecycle or authorization rules.

The unique key `(tenant_id, transaction_id)` is normative.

#### DEC-005 — activation and approval (APPROVED)

Participant activation and reactivation must follow the approved transaction-scope approval model:

- Scope activation/reactivation requires bilateral approval by the relevant Buyer and Seller authorized representatives.
- Unilateral protective suspension remains permitted under the previously approved domain rule.
- Buyer and Seller participation requires verified legal identity and valid participation approval.
- Supplier requires an independent tenant, verified legal-party binding, explicit participation approval, and approved bounded operational scope.
- Pending participants receive no operational access.
- Supplier participation does not grant contract approval, payment approval, or goods-release authority.

The exact approval evidence and actor authorization must be traceable to the applicable transaction-scope decision and contract lifecycle. This specification does not create an alternate approval route.

### 3.5 supply_sites

Required keys:

```sql
PRIMARY KEY (id);
UNIQUE (tenant_id, id);
```

Each site has exactly one owning tenant. A site owned by another tenant cannot be used by changing a client-supplied `site_id`.

### 3.6 transaction_site_links

Required logical fields:

- `id`, `tenant_id`, `transaction_id`, `participant_id`, `site_id`;
- `purpose`, `link_status`;
- `effective_from`, `effective_until`;
- creation and audit attribution.

A site link must be consistent with the exact participant, tenant, transaction, and site owner. Its lifecycle must support activation, suspension, revocation, and expiry without deleting history.

### 3.7 transaction_access_assignments

Required logical fields:

- `id`, `tenant_id`, `transaction_id`, `participant_id`, `site_id`;
- `subject_user_id`;
- `assignment_status`;
- `effective_from`, `effective_until`;
- `granted_by`, `revoked_by`, `revocation_reason`;
- `audit_reference`.

Operational assignments require a non-null, matching site scope. A null site must never mean unrestricted transaction access.

### 3.8 permission_actions and assignment action grants

#### DEC-004 — normalized action vocabulary (APPROVED)

Use a normalized, controlled action catalog and an assignment-to-action relation. Do not rely solely on free-form JSON action arrays.

Logical entities:

- `permission_actions`: canonical action code, category, description, active/deprecated lifecycle.
- `transaction_access_assignment_actions`: assignment ID and action code, with uniqueness and FKs to both parent entities.

Rules:

1. Action codes are canonical and shared by Web, Mobile, Desktop, PostgreSQL, and SQLite.
2. Clients cannot create arbitrary action codes.
3. Deprecated actions cannot be used for new grants.
4. Role membership is an input to server-side permission composition, not proof of resource access.
5. Sensitive actions require their own domain policy gates.
6. Supplier operational assignments cannot confer contract activation, payment approval, or goods-release authority.

Examples of operational actions include site read, inventory record, quality inspection, handover proposal, and evidence submission. These are examples, not a final exhaustive vocabulary.

## 4. Composite referential integrity

### 4.1 Required parent candidate keys

```sql
-- transaction_participants
UNIQUE (tenant_id, transaction_id);
UNIQUE (id, tenant_id, transaction_id);

-- supply_sites
UNIQUE (tenant_id, id);
```

### 4.2 Four mandatory composite foreign keys

| ID | Child | Child columns | Parent | Parent columns |
|---|---|---|---|---|
| CFK-001 | transaction_access_assignments | (tenant_id, transaction_id) | transaction_participants | (tenant_id, transaction_id) |
| CFK-002 | transaction_access_assignments | (tenant_id, site_id) | supply_sites | (tenant_id, id) |
| CFK-003 | transaction_site_links | (tenant_id, transaction_id) | transaction_participants | (tenant_id, transaction_id) |
| CFK-004 | transaction_site_links | (tenant_id, site_id) | supply_sites | (tenant_id, id) |

### 4.3 Additional participant consistency FK

Every child table storing `participant_id` must also enforce:

```sql
FOREIGN KEY (participant_id, tenant_id, transaction_id)
REFERENCES transaction_participants (id, tenant_id, transaction_id);
```

The four mandatory FKs do not replace this consistency FK. Without it, a child row could combine a participant identifier with a different tenant or transaction.

A further integrity relationship must ensure that an assignment's site is linked to the same participant and transaction. This may be enforced with an additional composite FK using a suitable candidate key on `transaction_site_links`, or by a documented transactional backend constraint if the chosen schema cannot express the full relationship declaratively. A simple independent FK to `supply_sites` is not sufficient to prove participant-to-site authorization.

Foreign keys establish referential integrity only. They do not prove active status, effective time, permission action, membership validity, or approval authority.

## 5. DEC-003 — operational and transaction-wide permission scope (APPROVED)

- Operational access is site-scoped and requires an exact active site link and assignment.
- `site_id = NULL` never means unrestricted access.
- Transaction-wide access is an explicit exception, never the default.
- A transaction-wide grant must identify its scope type, subject, transaction, permitted action, effective period, grant authority, revocation path, and audit reference.
- Transaction-wide grants cannot bypass contract, payment, custody, legal, Syariah, or goods-release policies.
- Operational roles cannot use a transaction-wide grant to evade site-level authorization.

A separate explicit scope representation is required if transaction-wide actions are approved for a particular use case. Do not encode the exception as a null site in an ordinary operational assignment.

## 6. PostgreSQL and SQLite type mapping

| Logical type | PostgreSQL | SQLite | Required parity |
|---|---|---|---|
| UUID | UUID | TEXT canonical UUID | Same identity semantics |
| Text/code | VARCHAR/TEXT | TEXT | Same validation |
| Country code | CHAR(2) + CHECK | TEXT + CHECK | ISO country code |
| Status | TEXT/VARCHAR + CHECK or governed enum | TEXT + CHECK | Same vocabulary |
| Timestamp | TIMESTAMPTZ | UTC ISO-8601 TEXT | Same UTC semantics |
| Boolean | BOOLEAN | INTEGER CHECK 0/1 | Same truth values |
| Money | Integer minor units or exact NUMERIC | INTEGER minor units | No floating-point money |
| Quantity | Agreed exact NUMERIC | Scaled INTEGER or exact representation | Agreed precision |
| JSON metadata | JSONB | Validated JSON TEXT | Same logical schema |
| Permission action | FK relation | FK relation | Same canonical vocabulary |

SQLite must enable `PRAGMA foreign_keys = ON` on every connection. Parent composite keys must have matching unique constraints/indexes. Child FK columns require query-supporting indexes where needed.

### 6.1 Engine-specific constraint mapping

| Constraint | PostgreSQL | SQLite |
|---|---|---|
| PK and unique keys | Native | Native |
| Composite FK | Native FK | Native FK; enabled per connection |
| Status vocabulary | CHECK / governed enum | CHECK |
| Effective period validity | CHECK | CHECK |
| Binding period overlap | Exclusion constraint or serialized transaction strategy | Trigger + serialized transaction |
| Action catalog | FK | FK |
| Append-only audit | Restricted privileges and controlled trigger/policy | Trigger and controlled write access |
| Tenant isolation | RLS + backend authorization | Backend authorization; local scope is untrusted |
| Revocation | Server-authoritative state and checks | Provisional local view; server revalidation |
| Idempotency | Unique server idempotency key | Unique local command key; server deduplication |

### 6.2 Temporal overlap enforcement

A partial unique index on a status column alone does not prove non-overlapping effective periods. PostgreSQL should use a range exclusion constraint where supported by the chosen key/type design, or a transactionally serialized enforcement mechanism. SQLite should use triggers that reject overlapping verified effective periods plus a serialized write transaction.

Both engines must be tested against the same boundary cases: adjacent non-overlapping periods, open-ended period, future period, expired period, overlapping period, and revoked period.

## 7. Lifecycle, revocation, and custody

### 7.1 Participant lifecycle

Allowed lifecycle vocabulary:

- `invited`
- `pending`
- `active`
- `suspended`
- `revoked`
- `expired`

Only active participants within their effective period can satisfy participant authorization. Lifecycle transitions must be backend-controlled and auditable.

### 7.2 Assignment lifecycle

Recommended controlled states:

- `pending`
- `active`
- `suspended`
- `revoked`
- `expired`

Revocation must preserve history and identify actor, reason, time, target, prior/new state, and audit/correlation reference. Reassignment creates a new assignment record; it does not erase revocation history.

### 7.3 Revocation propagation

A protected operation must be denied when any required authority is suspended, revoked, expired, or no longer effective, including:

- membership;
- participant;
- site link;
- assignment;
- permission action grant;
- tenant/legal-party binding where the operation requires a current verified binding.

Revocation must invalidate relevant authorization caches and be checked again for offline replay. A stale local active flag is never sufficient.

### 7.4 Custody

Revocation is not a custody transfer. A dependent handover must be suspended or routed to controlled review. Transfer to a new custodian requires an eligible recipient, active participant, exact site assignment, explicit custody acceptance, evidence, and server confirmation. No silent custody transfer is permitted.

## 8. Authorization contract

Operational authorization requires all of the following:

```
valid_identity_and_session
AND active_membership
AND server_established_tenant_context
AND matching_active_participant
AND active_site_link
AND exact_active_assignment
AND permitted_action
AND valid_effective_period
AND current_non_revoked_state
```

Additional contract, payment, evidence, custody, legal, and Syariah gates apply where relevant. Any missing, stale, or unverifiable authorization input results in deny.

RLS is an additional database boundary. It must not be treated as a replacement for application authorization or domain policy evaluation.

## 9. PostgreSQL RLS and security gate — DEC-006

**Status: DESIGN REQUIRED; not an approved physical policy implementation.**

Required design outcomes:

- RLS for tenant-scoped business tables exposed through application access.
- Non-bypass application database roles for ordinary requests.
- Server-established tenant context; client tenant IDs are not trusted as authorization proof.
- Explicit policy coverage for tenants/memberships, legal bindings, transactions, participants, sites, site links, assignments, actions, and audit records.
- Both read filtering and write `WITH CHECK` semantics.
- Service-role or RLS-bypass access narrowly restricted, separately governed, and audited.
- Negative tests using the actual non-bypass application role.
- RLS must fail closed and remain defense-in-depth to backend authorization.

Policy definitions and exact role/session context mechanism remain a separate design deliverable.

## 10. SQLite runtime provenance gate — DEC-007

**Status: NOT VERIFIED; evidence blocker, not a domain decision.**

Before SQLite parity can be claimed, establish from the actual runtime configuration and an authorized disposable/read-only inspection:

1. Exact database file(s) used by each platform runtime.
2. Whether `PRAGMA foreign_keys = ON` is enabled on every connection.
3. Actual schema version and migration history.
4. Composite FK inventory using `PRAGMA foreign_key_list`.
5. Unique/index inventory using `PRAGMA index_list` and `PRAGMA index_info`.
6. CHECK constraints and triggers.
7. Whether runtime and test databases use the same schema construction path.
8. Connection lifecycle and transaction behavior relevant to enforcement.

Source SQL files alone do not prove physical runtime schema state.

## 11. Cross-engine parity gate — DEC-008

**Status: NOT VERIFIED; validation evidence outstanding.**

A single logical schema contract and common acceptance corpus must be used against disposable PostgreSQL and SQLite databases. Engine-specific DDL is permitted only when it preserves the same domain outcomes. Every exception must be documented with rationale and a test.

## 12. Index requirements

| ID | Table | Candidate index |
|---|---|---|
| IDX-001 | tenant_legal_party_bindings | (tenant_id, verification_status, effective_from) |
| IDX-002 | tenant_legal_party_bindings | (legal_party_id, verification_status) |
| IDX-003 | transaction_participants | (tenant_id, participation_status, effective_from) |
| IDX-004 | transaction_participants | (transaction_id, participant_role, participation_status) |
| IDX-005 | transaction_site_links | (tenant_id, transaction_id, site_id, link_status) |
| IDX-006 | transaction_access_assignments | (tenant_id, subject_user_id, assignment_status) |
| IDX-007 | transaction_access_assignments | (participant_id, transaction_id, site_id) |
| IDX-008 | audit_events | (tenant_id, occurred_at) |
| IDX-009 | transaction_access_assignment_actions | (assignment_id, action_code) |

All child FK access paths must be reviewed for suitable indexes. Final index design must be confirmed against actual query patterns and each engine's query planner.

## 13. Final acceptance criteria

These are acceptance requirements, not executed test results.

### 13.1 Schema integrity

| ID | Scenario | Expected |
|---|---|---|
| SCH-001 | Canonical entities and required columns exist | PASS |
| SCH-002 | PK and unique keys match the logical contract | PASS |
| SCH-003 | All four mandatory composite FKs exist | PASS |
| SCH-004 | Participant consistency composite FK exists | PASS |
| SCH-005 | Participant-to-site link consistency is enforced | PASS |
| SCH-006 | Duplicate tenant/transaction participant is rejected | REJECT |
| SCH-007 | Invalid effective period is rejected | REJECT |
| SCH-008 | DEC-001 overlapping verified active binding is rejected | REJECT |
| SCH-009 | Binding version change retains historical version | PASS |
| SCH-010 | Unknown/deprecated action cannot be granted | REJECT |

### 13.2 Legal binding

| ID | Scenario | Expected |
|---|---|---|
| LEG-001 | Tenant without verified binding attempts legal participant activation | DENY |
| LEG-002 | Two verified binding periods overlap for one tenant | REJECT |
| LEG-003 | Old binding is superseded | History retained |
| LEG-004 | New binding is verified | New version recorded |
| LEG-005 | Tenant binding changes after contract signing | Contract party unchanged |
| LEG-006 | Verified binding lacks verifier/evidence | REJECT |
| LEG-007 | Revoked binding is used for new protected participation | DENY |

### 13.3 Participant and authorization

| ID | Scenario | Expected |
|---|---|---|
| AUTH-001 | Tenant without participant accesses transaction | DENY |
| AUTH-002 | Supplier without active participant | DENY |
| AUTH-003 | Supplier active without exact site assignment | DENY |
| AUTH-004 | Assignment references site owned by another tenant | FK REJECT |
| AUTH-005 | Participant ID belongs to another tenant/transaction | FK REJECT |
| AUTH-006 | Suspended participant has active assignment row | DENY |
| AUTH-007 | Revoked membership has active assignment row | DENY |
| AUTH-008 | Assignment is expired | DENY |
| AUTH-009 | Action is not granted to assignment | DENY |
| AUTH-010 | Valid Buyer/Seller participant and scope | ALLOW within scope |
| AUTH-011 | Client switches tenant ID without valid membership | DENY |
| AUTH-012 | Supplier enumerates unrelated transactions | DENY |

### 13.4 Site, assignment, and custody

| ID | Scenario | Expected |
|---|---|---|
| SITE-001 | Site link references mismatched participant | REJECT |
| SITE-002 | Operational assignment has no site scope | REJECT |
| SITE-003 | Site link is revoked | DENY |
| SITE-004 | Assignment is revoked | Next protected operation DENY |
| SITE-005 | Participant is suspended | Descendant assignments ineffective |
| CUST-001 | Handover depends on revoked assignment | Suspend/review |
| CUST-002 | Custody transfer lacks explicit acceptance | DENY |
| CUST-003 | New custodian has valid scope and acceptance | ALLOW subject to policy |

### 13.5 Cross-engine parity corpus

For each applicable constraint, run the same positive and negative fixture set against disposable PostgreSQL and SQLite databases.

| ID | Scenario | PostgreSQL | SQLite |
|---|---|---|---|
| PAR-001 | Duplicate participant | Reject | Reject |
| PAR-002 | Cross-tenant transaction FK | Reject | Reject |
| PAR-003 | Cross-tenant site FK | Reject | Reject |
| PAR-004 | Invalid lifecycle status | Reject | Reject |
| PAR-005 | Invalid effective period | Reject | Reject |
| PAR-006 | Overlapping verified binding | Reject | Reject |
| PAR-007 | Participant consistency mismatch | Reject | Reject |
| PAR-008 | Unknown permission action | Reject | Reject |
| PAR-009 | Audit history mutation attempt | Reject | Reject |
| PAR-010 | Revoked offline command replay | Server rejects | Server rejects |

SQLite's local state may be provisional; final replay acceptance is determined by the server. Therefore parity here means equivalent integrity and final business outcome, not equal offline authority.

### 13.6 Security and readiness evidence

- RLS tested with non-bypass application role.
- Backend authorization demonstrated fail-closed.
- Revocation propagation demonstrated.
- Offline idempotency and replay ordering demonstrated.
- Actual SQLite runtime provenance verified.
- PostgreSQL authoritative backend role demonstrated.
- Audit events traceable to actor, target, reason, and request/correlation ID.
- Test reports identify exact candidate repository, branch, commit SHA, schema version, and disposable environment.
- No shared/staging/production mutation is used as an acceptance shortcut.

## 14. DEC register and approval status

| DEC | Decision | Status |
|---|---|---|
| DEC-001 | At most one verified/effective legal-party binding per tenant at a time; retain versions and audit | APPROVED |
| DEC-002 | One participant per tenant per transaction; multiple user assignments and site links allowed | APPROVED |
| DEC-003 | Operational access site-scoped; transaction-wide access only as explicit bounded exception | APPROVED |
| DEC-004 | Normalized canonical permission action catalog and assignment-action relation | APPROVED |
| DEC-005 | Bilateral scope activation/reactivation; explicit Supplier participation approval and bounded operational scope | APPROVED |
| DEC-006 | PostgreSQL RLS policy design and verification | DESIGN REQUIRED |
| DEC-007 | Actual SQLite runtime schema provenance | NOT VERIFIED |
| DEC-008 | Physical PostgreSQL/SQLite parity evidence | NOT VERIFIED |

DEC-001 through DEC-005 are domain/specification approvals recorded by the user on 2026-11-10. They do not authorize implementation, DDL, migrations, tests against shared/live systems, PR, merge, deployment, or staging/production mutation.

DEC-006 is a technical security design gate. DEC-007 and DEC-008 are evidence/verification gates. Their open status must not be represented as approved or completed.

## 15. Readiness disposition

- Canonical domain mapping: defined.
- DEC-001–DEC-005: approved.
- PostgreSQL/SQLite logical constraint mapping: specified.
- Four mandatory composite FKs: specified.
- Additional participant consistency FK: specified.
- Physical schema parity: not verified.
- RLS policy implementation/evidence: not verified.
- SQLite runtime provenance: not verified.
- Implementation readiness: NOT READY.
- Migration authorization: NOT GRANTED.

**Governance boundary:** This document records a design baseline only. No source code, DDL, migration, database, PR, merge, deployment, or staging/production state is changed or authorized by this document.
