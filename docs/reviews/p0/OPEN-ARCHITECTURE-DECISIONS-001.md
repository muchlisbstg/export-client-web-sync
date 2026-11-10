# OPEN-ARCHITECTURE-DECISIONS-001 — Decision Register

**Version:** 1.1  
**Status:** MASTER REVIEW APPROVED — OD-001–OD-022; IMPLEMENTATION NOT AUTHORIZED  
**Decision date:** 2026-11-10  
**Approval basis:** User selected `review_all` for the complete OD-001–OD-022 master review with no additional notes.

This register records approved domain and architecture decisions, their operational/security implications, and evidence required before implementation readiness can be assessed. Approval of an OD establishes policy/architecture direction only. It does not authorize code changes, schema/DDL, migrations, tests against shared/live systems, PR creation, merge, deployment, or mutation of production/staging systems.

## 1. Identity and membership

| ID | Decision topic | Proposed owner | Status |
|---|---|---|---|
| OD-001 | Multiple active roles per membership | Architecture / Security | APPROVED |
| OD-002 | Membership administrator governance | Governance | APPROVED |
| OD-003 | Tenant switching and active context | Architecture / Security | APPROVED |
| OD-004 | Tenant context expiry and revocation | Security | APPROVED |
| OD-005 | Authorized Representative delegation | Governance / Legal | APPROVED |
| OD-006 | Emergency access and break-glass controls | Security / Governance | APPROVED |

## 2. Supplier and site assignment

| ID | Decision topic | Proposed owner | Status |
|---|---|---|---|
| OD-007 | Supplier hybrid tenant and operational access semantics | Product / Architecture | APPROVED — CLARIFICATION |
| OD-008 | Assignment revocation during active handover | Operations / Security | APPROVED |
| OD-009 | Assignment lifecycle metadata and governance | Architecture / Operations | APPROVED |
| OD-010 | Cross-party document visibility and access policy | Legal / Product / Security | APPROVED |

## 3. Transaction and governance

| ID | Decision topic | Proposed owner | Status |
|---|---|---|---|
| OD-011 | Scope approval and reactivation in contract lifecycle | Legal / Architecture | APPROVED |
| OD-012 | Delegated signer authority validation | Legal / Governance | APPROVED |
| OD-013 | Contract release conditions mapped to shipment | Operations / Legal | APPROVED |
| OD-014 | Disputes and conflicting evidence impact on release | Legal / Operations | APPROVED |
| OD-015 | Syariah Reviewer access boundary | Syariah Governance / Security | APPROVED |
| OD-016 | Review findings and recommendations closure | Syariah Governance | APPROVED |

## 4. Platform and data architecture

| ID | Decision topic | Proposed owner | Status |
|---|---|---|---|
| OD-017 | SQLite role across Web, Mobile, and Desktop | Architecture | APPROVED |
| OD-018 | Authoritative shared backend direction | Architecture / Infrastructure / Security | APPROVED — GATED TARGET |
| OD-019 | Canonical schema and migration version governance | Data Architecture | APPROVED |
| OD-020 | Offline conflict resolution and replay ordering | Architecture / Operations | APPROVED |
| OD-021 | OpenAPI source of truth | Architecture | APPROVED |
| OD-022 | Backward compatibility for older clients | Architecture / Product | APPROVED |

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


### OD-004 — Tenant context expiry and revocation

**Status:** APPROVED  
**Decision:** Active tenant contexts must be time-bounded and subject to server-side validation and revocation. Token expiry alone is insufficient to enforce membership or permission changes.

**Approved controls:**
- Active tenant contexts have a bounded lifetime.
- Sensitive requests validate the authenticated session, active tenant context, and current membership status server-side.
- Suspended, revoked, or expired memberships immediately lose access once the server recognizes the status change; access must fail closed.
- Role or permission changes invalidate affected authorization contexts and cached authorization decisions.
- Logout, session revocation, and successful tenant switching terminate or replace the applicable context.
- Revocation/version checks are server-authoritative; expiry-only token validation is insufficient.
- Expiry, revocation, and invalidation events must be attributable and auditable.

**Decision note:** User approval (“Ya”) accepts the recommendation as stated; no additional qualification was supplied.

**Decision authority:** User approval recorded in this conversation.  
**Implementation status:** NOT AUTHORIZED. This is an architecture decision only; it does not authorize code changes, schema/DDL, migrations, tests against shared/live systems, PR, merge, or deployment.

**Follow-on evidence required:** Tests for expired context, membership suspension/revocation, role/permission change invalidation, logout, tenant switching, stale tokens, cache invalidation, and fail-closed behavior.

### OD-005 — Authorized Representative delegation

**Status:** APPROVED  
**Decision:** Authorized Representative authority may be delegated only through an explicit, bounded, auditable delegation issued by an Authorized Representative whose own authority is active and covers the delegated action.

**Approved controls:**
- The delegator must have active authority covering the specific action and scope being delegated.
- A delegation must explicitly identify the delegator, delegate, tenant, transaction (where applicable), permitted action/scope, effective date/time, expiry, and reason.
- Delegated authority must not exceed the delegator's authority or override applicable law, governance rules, or the signed contract snapshot.
- Sub-delegation is prohibited unless explicitly permitted by the governing authority and recorded as a separate authorized delegation.
- Delegation must be revocable by an authority entitled to revoke it; revocation invalidates the delegated access for subsequent authorization checks.
- Actions performed under delegation must record both the delegate and delegator, the delegation reference, action, scope, timestamp, and relevant audit/correlation reference.
- Delegation does not replace or waive bilateral approval requirements, contract lifecycle conditions, or shipment release conditions established by the signed contract snapshot or applicable law.

**Decision note:** User approval (“Ya”) accepts the recommendation as stated; no additional qualification was supplied.

**Decision authority:** User approval recorded in this conversation.  
**Implementation status:** NOT AUTHORIZED. This is an architecture/governance decision only; it does not authorize code changes, schema/DDL, migrations, tests against shared/live systems, PR, merge, or deployment.

**Follow-on evidence required:** Delegator-authority validation, scope/expiry enforcement, revocation propagation, prohibited sub-delegation, contract-condition non-bypass, and audit attribution tests.

### OD-006 — Emergency access (break-glass)

**Status:** APPROVED  
**Decision:** Emergency break-glass access is permitted only for defined critical incidents, under narrowly scoped, time-limited, strongly authenticated, and independently reviewable controls.

**Approved controls:**
- Emergency access may be invoked only for a documented critical incident meeting a defined break-glass criterion; the actor must provide a reason and incident/reference ID.
- Access must be limited to the minimum tenant, resources, actions, and duration necessary to address the incident.
- Step-up authentication, including MFA where supported, is required before activation.
- Emergency access must not bypass contractual approval conditions, financial controls, Syariah governance boundaries, or server-side goods-release authorization.
- All activation, access, actions, attempted actions, and termination events must be recorded in tamper-resistant audit records with actor, scope, timestamps, reason, and incident reference.
- The emergency-access holder must not be able to alter or suppress the corresponding audit records.
- Access must expire automatically at the end of its approved duration and be revocable earlier by an authorized independent authority.
- Every use requires a post-incident review by an independent reviewer, with findings and remediation tracked to closure.

**Decision note:** User approval (“Ya”) accepts the recommendation as stated; no additional qualification was supplied.

**Decision authority:** User approval recorded in this conversation.  
**Implementation status:** NOT AUTHORIZED. This is an architecture/security governance decision only; it does not authorize code changes, schema/DDL, migrations, tests against shared/live systems, PR, merge, or deployment.

**Follow-on evidence required:** Break-glass eligibility criteria, minimum-scope enforcement, step-up authentication, automatic expiry, independent revocation, immutable audit evidence, and post-incident review tests/process records.

### OD-007 — Supplier hybrid tenant and operational access semantics

**Status:** APPROVED — CLARIFICATION OF THE PREVIOUSLY APPROVED SUPPLIER HYBRID ARCHITECTURE  
**Decision:** Supplier retains an independent tenant identity. Operational access to Buyer/Seller transaction and site resources is granted only through explicit, active transaction-participant and site-assignment relationships. This clarification does not reopen or reverse the previously approved hybrid architecture.

**Approved controls:**
- Supplier retains its own tenant, memberships, and tenant administration boundary.
- Supplier participates in a transaction only through an explicit transaction-participant relationship.
- Access to a Buyer/Seller site or operational resource requires an explicit, active assignment identifying the relevant supplier identity, transaction, site, permitted scope, and validity period.
- A site assignment grants access only to the assigned operational scope; it does not grant general access to the site-owning tenant or its unrelated data.
- Revoking or expiring an assignment terminates the corresponding operational access without deleting the Supplier tenant identity, membership history, transaction history, or audit evidence.
- Cross-tenant access is authorized server-side, fail-closed, and checked against current participant and assignment relationships on each protected operation.
- Creation, modification, activation, expiry, and revocation of participant/assignment relationships must be attributable and auditable.

**Decision note:** User approval (“Ya”) accepts this clarification as stated. The previously approved Supplier hybrid architecture remains the governing domain decision.

**Decision authority:** User approval recorded in this conversation.  
**Implementation status:** NOT AUTHORIZED. This is an architecture decision only; it does not authorize code changes, schema/DDL, migrations, tests against shared/live systems, PR, merge, or deployment.

**Follow-on evidence required:** Supplier tenant isolation, participant relationship validation, site/transaction scope enforcement, assignment expiry/revocation, denial of unrelated tenant data access, and audit attribution tests.

### OD-008 — Assignment revocation during active handover

**Status:** APPROVED  
**Decision:** Revocation or expiry of an operational assignment immediately removes the affected actor's authority for new protected actions. Any active handover dependent on that assignment must be placed into a controlled suspended state until an authorized reassignment or other approved resolution is completed.

**Approved controls:**
- Revocation/expiry must deny new protected actions under the revoked assignment from the point the server recognizes the change.
- An affected active handover must transition to `SUSPENDED_PENDING_REASSIGNMENT` (or an explicitly governed equivalent) and must not silently continue under stale authorization.
- The system must not automatically transfer responsibility, custody, or authority to another Supplier or actor.
- Existing evidence, completed activity, custody events, and audit history must be preserved; revocation must not erase or rewrite prior accountability.
- Reassignment requires an authorized decision and a new explicit assignment with its own scope, effective period, and audit trail.
- Goods, documents, and samples in custody must follow a controlled handover/chain-of-custody procedure identifying releasing and receiving parties, condition, timestamps, and evidence.
- A new assignment alone does not authorize goods release. Release remains subject to the signed contract snapshot, applicable release conditions, and server-side release authorization.
- Any emergency exception must follow the separately approved break-glass policy and cannot waive contractual, financial, legal, or Syariah controls.

**Decision note:** User approval (“Ya”) accepts the recommendation as stated; no additional qualification was supplied.

**Decision authority:** User approval recorded in this conversation.  
**Implementation status:** NOT AUTHORIZED. This is an architecture/operations decision only; it does not authorize code changes, schema/DDL, migrations, tests against shared/live systems, PR, merge, or deployment.

**Follow-on evidence required:** Immediate authorization denial after revocation, suspended handover state transition, no automatic responsibility transfer, custody/evidence preservation, authorized reassignment, and release-condition non-bypass tests.


### OD-009 — Assignment lifecycle metadata and governance

**Status:** APPROVED  
**Decision:** Every operational assignment must be explicit, bounded in scope and time, attributable to its creator and authorizer, and traceable through activation, suspension, expiry, amendment, and revocation.

**Approved controls:**
- Each assignment has a stable identifier and explicit Supplier identity, transaction, site, permitted resource/action scope, and validity period.
- Lifecycle metadata includes `effective_at`, `expires_at`, `status`, `created_by`, `approved_by`, and, when revoked, `revoked_at`, `revoked_by`, and `revocation_reason`.
- Assignment states must distinguish at minimum draft, active, suspended, expired, and revoked; state transitions must be governed and auditable.
- An assignment is not effective before `effective_at` and is no longer valid after `expires_at`; authorization must fail closed when validity cannot be established.
- Scope amendments require the appropriate authorization and an attributable version/history record; silent in-place privilege expansion is prohibited.
- Overlapping assignments must not combine into broader privileges than each explicitly authorized scope. Conflicts and deny precedence must be deterministic.
- Expiry and revocation preserve historical records and evidence.

**Rationale and implications:** Explicit lifecycle metadata supports least privilege, accountable custody, predictable operational handover, and reliable cross-tenant authorization. It introduces lifecycle and conflict-resolution rules that must be validated before implementation.

**Decision note:** User selected `review_all`, approving the complete master-review recommendations without additional notes.

**Decision owner / required review:** Architecture and Operations; Legal/Security review where assignment creates contractual or sensitive-data access.  
**Implementation status:** NOT AUTHORIZED.  
**Follow-on evidence required:** Lifecycle transition matrix, effective/expiry boundary tests, revocation propagation, amendment history, overlapping-scope conflict tests, and complete audit attribution.

### OD-010 — Cross-party document visibility and access policy

**Status:** APPROVED  
**Decision:** Document visibility is governed by explicit classification, ownership, transaction/site relationship, purpose, and server-side authorization. A user's role, uploader identity, or participation in one transaction does not grant blanket access to all documents of another party.

**Approved controls:**
- Document metadata identifies its owner/controlling tenant, transaction and site relationships where applicable, classification, sensitivity, permitted purposes, and applicable retention/legal restrictions.
- Access policy distinguishes at minimum tenant-private, transaction-shared, site-operational, contract-restricted, financial-restricted, and Syariah-review-restricted material.
- Buyer, Seller, Supplier, and other participants receive only the documents and operations explicitly authorized for their current relationship and scope.
- Preview, download, export, sharing, replacement, and permission changes are separately authorized and auditable.
- Contractual confidentiality, applicable law, privacy, and Syariah governance restrictions take precedence over convenience or generic role grants.
- Document versions, signatures, provenance, and audit history are preserved; a signed contract snapshot cannot be silently replaced.
- Reviewer access is purpose-limited and does not confer transaction approval, ledger mutation, or release authority.

**Rationale and implications:** Classification-based access reduces accidental disclosure across parties and keeps document permissions aligned with contract, transaction, site, and governance boundaries.

**Decision owner / required review:** Legal, Product, Security, and Syariah Governance for Syariah-restricted material.  
**Implementation status:** NOT AUTHORIZED.  
**Follow-on evidence required:** Document classification catalogue, ownership/relationship matrix, preview/download/export authorization tests, cross-tenant negative tests, signed-document immutability, and access audit evidence.

### OD-011 — Scope approval and reactivation in contract lifecycle

**Status:** APPROVED  
**Decision:** Transaction-scope activation and reactivation require bilateral approval. Before contract signing, either party may unilaterally suspend or withdraw its consent to a scope as a protective measure. This follows the approved domain principle “Bilateral Approval with Unilateral Protective Suspension.”

**Approved controls:**
- Scope states and transitions distinguish draft, pending bilateral approval, active, suspended, withdrawn, and closed (or governed equivalents).
- Activation and reactivation require attributable approval from authorized Buyer and Seller representatives.
- Before contract signing, either party may unilaterally suspend or withdraw its consent for the affected scope; the other party's approval is not required for that protective action.
- Suspension/withdrawal blocks new actions within the affected scope according to policy, while preserving prior events, evidence, and obligations.
- A signed contract snapshot remains the source of contractual agreement. Post-signature changes must follow the applicable formal contract amendment process and cannot be treated as an informal scope toggle.
- Scope transitions, approvers, reasons, timestamps, and relevant contract version are auditable.

**Rationale and implications:** The model preserves bilateral consent for activation while allowing unilateral protective suspension without silently changing signed contractual obligations.

**Decision owner / required review:** Legal and Architecture.  
**Implementation status:** NOT AUTHORIZED.  
**Follow-on evidence required:** State-transition specification, bilateral activation/reactivation tests, unilateral pre-signature suspension tests, post-signature amendment controls, and audit linkage to contract snapshots.

### OD-012 — Delegated signer authority validation

**Status:** APPROVED  
**Decision:** A signer's authority must be validated for the specific legal entity, tenant, transaction, document, action, and signing time. A user account or role label alone is insufficient evidence of signing authority.

**Approved controls:**
- Validate signer identity and the represented legal entity/organization.
- Validate the source and scope of authority, including board/organizational authority or explicit delegation as applicable.
- Delegation must be active, unrevoked, time-valid, and cover the specific contract/document and action.
- Authority must be checked at signing time and linked to the exact document/contract snapshot being signed.
- Preserve signer identity, authority evidence/reference, delegation reference, signing timestamp, document hash/version, and audit/correlation evidence.
- A signer cannot delegate more authority than they possess; sub-delegation remains subject to OD-005.
- Legal requirements and qualified legal review govern the acceptability of authority evidence and electronic-signature method.

**Rationale and implications:** This prevents unauthorized execution and provides evidence of who bound each party to a particular contract version.

**Decision owner / required review:** Legal and Governance.  
**Implementation status:** NOT AUTHORIZED.  
**Follow-on evidence required:** Authority-source catalogue, scope and expiry validation, revoked-delegation denial, exact-snapshot binding, signer audit evidence, and legal review of signature requirements.

### OD-013 — Contract release conditions mapped to shipment

**Status:** APPROVED  
**Decision:** Shipment release conditions must be derived from the applicable signed contract snapshot and applicable law, represented as explicit verifiable conditions, and enforced exclusively by server-side release authorization.

**Approved controls:**
- The signed contract snapshot is the source of truth for contractual release conditions.
- Each shipment/release request is linked to the applicable contract snapshot and the conditions relevant to that shipment.
- Conditions identify required evidence, responsible verifier/authority, validation result, timestamp, and provenance.
- Seller Authorized Representative issues or confirms the release instruction.
- Buyer Authorized Representative approval is mandatory only when the signed contract snapshot or applicable law explicitly requires it; there is no blanket bilateral approval requirement for every shipment.
- Payment status is determined from the payment ledger; fulfillment status is determined from the evidence register. Neither a client assertion nor a manually edited status can replace those sources.
- Only server-side authorization may authorize goods release; UI state, local database state, or a new Supplier assignment cannot grant release.
- Contract/legal conditions, financial controls, and Syariah governance controls cannot be bypassed by emergency access.

**Rationale and implications:** This creates traceability from contractual obligations to shipment-level evidence and preserves the separation of contract, settlement, fulfillment, and release authority.

**Decision owner / required review:** Operations, Legal, Security, and relevant Financial/Syariah Governance authorities.  
**Implementation status:** NOT AUTHORIZED.  
**Follow-on evidence required:** Contract-to-shipment condition mapping, missing/invalid evidence denial, payment-ledger reconciliation, authorized instruction validation, conditional Buyer-approval tests, and server-only release negative tests.

### OD-014 — Disputes and conflicting evidence impact on release

**Status:** APPROVED  
**Decision:** A material dispute or unresolved conflict in evidence affecting a shipment obligation must trigger a controlled hold on the affected scope until an authorized, documented resolution is reached. A dispute or evidence conflict must not be silently treated as fulfillment or as release approval.

**Approved controls:**
- Disputes identify the affected transaction, scope, shipment, obligation, evidence items, submitting parties, reason, and time.
- Conflicting evidence is preserved with provenance and version history; originals must not be overwritten or deleted to resolve a conflict.
- The system applies a governed hold to the affected release scope where the dispute is material under contract, law, or policy.
- Hold placement and removal require authorized actors, reasons, supporting evidence, and audit records.
- Resolution must identify the deciding authority, findings, accepted/rejected evidence, rationale, and any required corrective action.
- A dispute does not itself mutate the payment ledger, prove non-fulfillment, or authorize release; those determinations follow their respective sources of truth and governing rules.
- Emergency access cannot bypass the hold or the applicable contractual, legal, financial, or Syariah controls.

**Rationale and implications:** The policy protects parties against premature release while avoiding an unsupported assumption that every disagreement automatically invalidates all transaction activity.

**Decision owner / required review:** Legal and Operations, with Security and Syariah review where relevant.  
**Implementation status:** NOT AUTHORIZED.  
**Follow-on evidence required:** Materiality/hold criteria, conflicting-evidence preservation, unauthorized hold-removal denial, documented resolution workflow, and release-denial tests while a blocking dispute remains unresolved.

### OD-015 — Syariah Reviewer access boundary

**Status:** APPROVED  
**Decision:** Syariah Reviewer authority is limited to review, comment, and recommendation. Access to sensitive documents and evidence is purpose-limited, least-privilege, and scoped to the assigned review. The role does not confer transaction approval, ledger mutation, or goods-release authority.

**Approved controls:**
- Access is granted only for an explicitly assigned review purpose and relevant tenant/transaction scope.
- Sensitive financial, personal, commercial, and confidential documents require classification-aware access and minimum necessary disclosure.
- Access to view, download, export, annotate, and share evidence is separately governed and auditable.
- Reviewer findings and recommendations are recorded as review artifacts, not as business approvals or authoritative transaction-state changes.
- Syariah Reviewer cannot approve a transaction, alter payment/settlement records, alter evidence provenance, or authorize shipment/goods release.
- Any recommendation requiring business action must be routed to the authorized business/legal/financial authority.
- Confidentiality, applicable law, and Syariah governance restrictions remain binding.

**Rationale and implications:** This preserves independence of review and prevents review authority from being conflated with operational or financial authority.

**Decision owner / required review:** Syariah Governance and Security.  
**Implementation status:** NOT AUTHORIZED.  
**Follow-on evidence required:** Reviewer permission matrix, sensitive-document access tests, prohibited mutation/release tests, review-scope enforcement, and access audit records.

### OD-016 — Review findings and recommendations closure

**Status:** APPROVED  
**Decision:** Each review finding must have a traceable lifecycle, accountable owner, evidence-backed response, and independently appropriate closure verification. A reviewer recommendation is not automatically an approved business action.

**Approved controls:**
- Findings record a stable identifier, originating review, severity, scope, evidence references, description, recommendation, owner, due date, and status.
- The governed lifecycle distinguishes open, under review, finding raised, response submitted, verification, and closed (or formally deferred/rejected with rationale).
- The responsible owner records a response and supporting evidence for each finding.
- Closure requires verification by an authorized reviewer/authority appropriate to the finding; a subject cannot self-certify closure where independent review is required.
- Critical findings cannot be closed solely by the party responsible for the affected control.
- Rejected or deferred recommendations require rationale, risk acceptance authority, interim controls, and review date.
- Findings, responses, status changes, and closure evidence remain auditable and linked to source review records.

**Rationale and implications:** The lifecycle converts review outcomes into accountable remediation without granting reviewers operational authority.

**Decision owner / required review:** Syariah Governance for Syariah findings; the relevant control owner and independent reviewer for other findings.  
**Implementation status:** NOT AUTHORIZED.  
**Follow-on evidence required:** Finding lifecycle/state-transition matrix, ownership and segregation-of-duties controls, evidence-backed closure tests, critical-finding independent review, and overdue/deferred tracking.

### OD-017 — SQLite role across Web, Mobile, and Desktop

**Status:** APPROVED  
**Decision:** Per-platform SQLite databases are local persistence mechanisms for permitted cache, drafts, and offline/outbox operations; they are not authoritative shared databases for enterprise, cross-tenant, contractual, financial, fulfillment, or release state.

**Approved controls:**
- SQLite may store permitted local cache, offline drafts, pending commands, and synchronization metadata.
- Local records are untrusted input when synchronized and must be revalidated by the server for identity, tenant, membership, transaction, site, assignment, and permission scope.
- Local state cannot authorize contract signing, payment settlement, fulfillment completion, or goods release.
- Sensitive data stored locally requires appropriate minimization, protection, retention, and logout/account-switch cleanup.
- Offline commands must be distinguishable from server-confirmed state and must not be presented as authoritative completion.
- Cross-platform shared state is reconciled through the authoritative backend, not direct peer-to-peer database authority.

**Rationale and implications:** This supports offline usability without fragmenting the system's source of truth or weakening server-side authorization.

**Decision owner / required review:** Architecture, Security, and Product.  
**Implementation status:** NOT AUTHORIZED.  
**Follow-on evidence required:** Local-data classification, cache invalidation, logout/tenant-switch isolation, offline command validation, and proof that local state cannot authorize protected actions.

### OD-018 — Authoritative shared backend direction

**Status:** APPROVED — GATED TARGET  
**Decision:** Supabase is the selected target direction for the authoritative shared backend, subject to completion and approval of security, tenancy/RLS, integrity, operational, backup/recovery, legal, and Syariah governance gates. This decision does not assert that any existing Supabase project is production-ready or authorize project mutation or migration.

**Approved controls:**
- The authoritative backend must centralize shared enterprise/transaction state and enforce server-side authorization.
- Supabase is the target platform direction, conditional on demonstrated tenant isolation, RLS correctness, server-side permission enforcement, referential integrity, auditability, backup/recovery, monitoring, and operational readiness.
- RLS is defense in depth and does not replace application/server authorization checks.
- No client may receive service-role credentials or bypass protected server workflows.
- Financial ledger, signed contract snapshots, evidence register, and release authorization retain their separately defined sources of truth.
- Environment separation, secrets management, migration review, backup/recovery validation, and incident response must be approved before any production use.
- Existing staging/production projects must not be modified under this architecture decision alone.

**Rationale and implications:** A shared authoritative backend reduces cross-platform state divergence, but introduces centralized security and operational responsibilities that must be evidenced before go-live.

**Decision owner / required review:** Architecture, Infrastructure, Security, Legal, and Syariah Governance as applicable.  
**Implementation status:** NOT AUTHORIZED. No project changes, migrations, data writes, or deployment are authorized.  
**Follow-on evidence required:** RLS/tenant-isolation review, authorization negative tests, schema integrity, audit, secrets, backup/restore, monitoring, disaster recovery, environment separation, and formal operational readiness approval.

### OD-019 — Canonical schema and migration version governance

**Status:** APPROVED  
**Decision:** Web, Mobile, Desktop, and backend must align to one canonical logical schema and one governed migration history. Platform-specific persistence may differ physically but must preserve the approved domain model, constraints, and contract semantics.

**Approved controls:**
- Canonical schema defines entities, identifiers, tenant and transaction relationships, composite keys, foreign keys, constraints, indexes, enumerations/statuses, and data invariants.
- Migrations are versioned, ordered, reviewable, and traceable to a canonical schema release.
- Each platform must declare the schema/API compatibility version it supports.
- Schema changes require impact analysis across all three clients and backend consumers.
- Migration execution must be controlled, repeatable, observable, and have a documented recovery/rollback or forward-fix strategy.
- No platform may silently introduce divergent authoritative semantics or weaken integrity constraints.
- Migration approval and execution are separate from this architecture decision and require explicit authorization.

**Rationale and implications:** A canonical model prevents platform drift and makes schema/API parity objectively reviewable.

**Decision owner / required review:** Data Architecture and Architecture, with Security/Legal review for sensitive domain changes.  
**Implementation status:** NOT AUTHORIZED.  
**Follow-on evidence required:** Canonical schema ownership, versioning policy, migration registry, cross-platform parity matrix, migration safety review, and reproducible schema-diff evidence.

### OD-020 — Offline conflict resolution and replay ordering

**Status:** APPROVED  
**Decision:** Offline operations are submitted as idempotent commands and reconciled by the authoritative server. The server determines accepted ordering and final state; client timestamps or last-write-wins must not resolve protected business conflicts.

**Approved controls:**
- Each offline command carries a stable command/event identifier and idempotency key, authenticated actor context, intended tenant/transaction/site scope, and relevant causal/version metadata.
- Replay is retry-safe and duplicate delivery must not duplicate business effects.
- The server revalidates current session, membership, tenant context, transaction participant, site assignment, permissions, and business preconditions at replay time.
- Server-confirmed ordering/version is authoritative; client clock and arrival order alone do not establish business precedence.
- Conflicts involving contracts, financial ledger, custody, fulfillment evidence, or release are routed to explicit reconciliation; they must not be silently resolved with last-write-wins.
- Rejected or conflicted commands retain their reason and traceability and can be reconciled through an authorized workflow.
- Offline UI distinguishes queued, submitted, accepted, rejected, and reconciled states; queued is not represented as completed.

**Rationale and implications:** This supports unreliable connectivity while protecting financial, contractual, custody, and release invariants against duplicate or stale replay.

**Decision owner / required review:** Architecture and Operations, with Finance/Security/Legal review for protected workflows.  
**Implementation status:** NOT AUTHORIZED.  
**Follow-on evidence required:** Idempotency/retry tests, duplicate delivery, out-of-order replay, stale membership/assignment denial, concurrency conflicts, client clock skew, and protected-domain reconciliation tests.

### OD-021 — OpenAPI source of truth

**Status:** APPROVED  
**Decision:** A single governed OpenAPI contract is the source of truth for externally consumed HTTP API definitions across backend, Web, Mobile, and Desktop clients.

**Approved controls:**
- The contract defines routes, methods, request/response schemas, error formats, authentication requirements, authorization scope metadata, and version/deprecation policy.
- Backend implementation and all client integrations must be checked for contract parity.
- Generated clients or validators may be used, but generated artifacts must be reproducible from the governed contract.
- Contract changes require compatibility analysis and review of all platform consumers.
- Undocumented or implementation-only routes are not treated as approved public API contracts.
- OpenAPI documentation does not replace runtime authorization enforcement or negative-access testing.
- Contract validation and runtime test evidence must identify the exact candidate commit/SHA.

**Rationale and implications:** One API contract reduces drift and makes parity, compatibility, and authorization requirements testable across platforms.

**Decision owner / required review:** Architecture and API owners, with Security review of authorization definitions.  
**Implementation status:** NOT AUTHORIZED.  
**Follow-on evidence required:** Contract ownership/location, route coverage, generated-client reproducibility, schema parity, breaking-change checks, and runtime authorization evidence pinned to exact SHAs.

### OD-022 — Backward compatibility for older clients

**Status:** APPROVED  
**Decision:** API and client compatibility must be explicitly versioned and governed through supported-version policy, deprecation windows, and controlled retirement. Security- or governance-critical operations may require a minimum supported client version and must fail closed when an old client cannot enforce required controls.

**Approved controls:**
- API versions and client compatibility ranges are explicit and machine-verifiable.
- Each release publishes minimum supported client versions and deprecation/retirement dates.
- Breaking changes require impact analysis, migration guidance, and a reasonable transition window unless an urgent security/legal control requires faster restriction.
- Backend must not assume that all users update clients simultaneously.
- Contract signing, payment, sensitive document access, and goods release may require a minimum client capability/version when older clients cannot safely enforce current requirements.
- Unsupported or insecure clients are denied protected operations with a clear, auditable error; they must not silently fall back to weaker authorization.
- Compatibility tests cover supported client/API combinations and identify the exact release/build and backend contract version.

**Rationale and implications:** This balances gradual rollout with the need to enforce current security, legal, financial, and Syariah controls across an uneven client upgrade landscape.

**Decision owner / required review:** Architecture and Product, with Security/Legal/Syariah Governance review for protected capabilities.  
**Implementation status:** NOT AUTHORIZED.  
**Follow-on evidence required:** Supported-version matrix, deprecation policy, compatibility test matrix, minimum-version enforcement, emergency security retirement process, and audit evidence for blocked legacy clients.

## 7. Master review disposition and governance

The user approved the recommendations for OD-009–OD-022 through the `review_all` selection, with no additional notes. Combined with the previously recorded approvals for OD-001–OD-008, all 22 OD recommendations are now approved as domain/architecture baselines.

**Approval boundaries:**
- Approved: domain rules, architecture direction, and required controls described in OD-001–OD-022.
- Not approved: implementation, code edits, schema/DDL changes, migrations, test execution against shared/live systems, PR creation, merge, deployment, or production/staging mutation.
- OD-018 selects Supabase as a gated target direction only; it does not approve or certify an existing project as production-ready.
- Follow-on evidence requirements remain outstanding until verified against identified candidate SHAs and appropriate test environments.
- R0 implementation readiness remains NOT ASSESSED until the separately defined readiness gates and evidence are completed and reviewed.
- Any material change to an approved decision requires a recorded amendment/review rather than silent implementation interpretation.

