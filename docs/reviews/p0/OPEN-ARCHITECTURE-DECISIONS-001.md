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
