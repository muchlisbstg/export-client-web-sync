# WEB-GAP-AUDIT-001 — Australian Halal Beef Buyer Portal

**Status:** Baseline audit / remediation backlog  
**Audit date:** 2026-11-26  
**Repository:** `muchlisbstg/export-client-web-sync`  
**Audit base:** `ui/ahb-buyer-portal-evaluation-lab`  
**Scope:** Public-facing B2B buyer portal and isolated React evaluation preview  
**Decision:** Suitable for controlled UI evaluation only; not production-ready

## 1. Executive assessment

The repository contains a substantial buyer-portal evaluation experience: product discovery, Australian jurisdiction context, provenance due-diligence, quality and halal evidence review, and a 12-stage buyer order journey. These capabilities are currently an isolated Vite + React + TypeScript application under `docs/ui-evaluation-lab/react-preview/`, not the root production web application.

The implementation is explicitly demo-only. Product, origin, supplier, facility, halal, quality, price, inventory, buyer, payment and shipment data are synthetic or unverified. RFQ and buyer-preparation interactions are browser-local. There is no connected backend, authentication, tenant enforcement, persistence, payment processing, authoritative goods-release service, export filing or carrier integration.

**Release posture:** Do not present this preview as an operational export-commerce platform. Do not publish commercial, halal, country-of-origin, facility approval or destination eligibility claims without documentary substantiation and competent review.

## 2. Evidence baseline

| Evidence | Observed state |
|---|---|
| Evaluation app | Isolated at `docs/ui-evaluation-lab/react-preview/` |
| Preview workflow | Run [45838124625](https://github.com/muchlisbstg/export-client-web-sync/actions/runs/45838124625); dependency install, Chromium setup, typecheck, Playwright 32/32, Vite build and artifact upload reported PASS |
| Preview artifact | `ahb-buyer-portal-react-preview`, artifact ID `15127167310`; SHA-256 `57c78a1b4f9d69d35e076323dd5faa85d7dfdd2ecd57b1776a2077fb4984e2ca`; expires 2026-12-03 |
| Repository interoperability | Run [45838124678](https://github.com/muchlisbstg/export-client-web-sync/actions/runs/45838124678): verify job passed; interoperability failed during mobile dependency installation due React `19.3.0` versus `react-dom@19.3.1` peer requirement; downstream desktop/interoperability tests skipped |
| Hosting | No current hosted preview URL is confirmed for the latest evaluation branch. A prior Vercel URL is stale and must not be represented as current |
| PR | [#68](https://github.com/muchlisbstg/export-client-web-sync/pull/68), isolated evaluation work; unmerged |
| Production integration | Not established; root application remains separate from the evaluation app |

This is a point-in-time record. Re-check the branch SHA, workflow run and artifact before relying on this evidence later. A green isolated preview workflow does not establish production readiness or cross-platform interoperability.

## 3. Findings register

Severity definitions: **P0** release blocker; **P1** required before a credible buyer-facing pilot; **P2** quality and scale improvement.

| ID | Priority | Domain | Finding / impact | Required closure evidence |
|---|---|---|---|---|
| GAP-001 | P0 | Application architecture | Buyer portal is isolated under documentation/evaluation path and is not integrated into the root web application. | Approved target architecture; production app route/component integration on a feature branch; build and route-level browser tests. |
| GAP-002 | P0 | Backend/API | No production API contract or connected backend for catalogue, RFQ, quote, order, documents or shipment. | Versioned API contract, server implementation, integration tests and error/timeout handling evidence. |
| GAP-003 | P0 | Identity & access | No buyer authentication, session lifecycle, MFA policy or server-side authorization in the preview. | Threat model; auth design; positive and negative endpoint tests; session expiry/revocation evidence. |
| GAP-004 | P0 | Multi-tenancy | No buyer-tenant isolation or object-level authorization; private buyer workspace must not rely on client-side state. | Tenant isolation model, tenant-scoped queries, cross-tenant negative tests and independent security review. |
| GAP-005 | P0 | RFQ workflow | RFQ enquiry is local-only and does not create a durable, auditable request or notify the seller. | Persisted RFQ lifecycle, idempotency, validation, audit trail, notification evidence and end-to-end tests. |
| GAP-006 | P0 | Commercial workflow | Quote, contract negotiation, execution, amendments and signed contract snapshot are not implemented. | Approved legal workflow; immutable signed contract snapshot; versioning and authorization tests. |
| GAP-007 | P0 | Payment & settlement | Payment panel is illustrative 30/30/40 UI only; no payment provider, ledger or reconciliation exists. | Legal/Syariah-approved payment design, authoritative ledger, reconciliation controls and sandbox evidence. No real-money test without approval. |
| GAP-008 | P0 | Goods release | No authoritative server-side release authorization is connected. Browser UI cannot safely control physical goods release. | Server-side policy and authorization record linked to contract, item, obligation and evidence; negative release tests. |
| GAP-009 | P0 | Origin & provenance | Jurisdiction explorer is contextual reference content; no verified property, PIC, livestock/NLIS, processor, lot or consignment source is connected. | Documentary evidence mapped to the exact product lot and consignment; reconciliation and independent review. |
| GAP-010 | P0 | Halal assurance | Evidence UI is not a certification verifier; no issuer, certificate scope, slaughter-process evidence or live validation is connected. | Competent halal review of current certificate, issuer recognition, scope, establishment, product and lot; explicit status lifecycle. |
| GAP-011 | P0 | Quality & food safety | No verified product specification, food-safety program, grading, temperature record or cold-chain telemetry is connected. | Approved specifications and lot-linked QC/HACCP/cold-chain evidence with exception handling and audit trail. |
| GAP-012 | P0 | Export eligibility | No authoritative establishment approval, product eligibility or destination-market rule integration. | Current official-source checks and documented competent-party sign-off for establishment, product and destination. |
| GAP-013 | P1 | Catalogue data | Six sample product ranges do not constitute a verified commercial catalogue; SKU, grade, cut specs, packaging, MOQ, tolerances, lead time and pricing need validation. | Approved product master, versioned specifications, controlled publication workflow and data-owner sign-off. |
| GAP-014 | P1 | Export documents & logistics | Document register and shipment timeline are synthetic; no export document generation, customs filing, carrier or milestone feed exists. | Document ownership/status model, secure file handling, provider/API integration tests and consignment reconciliation. |
| GAP-015 | P1 | Privacy & data governance | No demonstrated privacy notice/consent, retention/deletion, data-subject request, secure upload or buyer-data governance implementation. | Data inventory, privacy/legal review, retention schedule, consent records, access logs and secure upload controls. |
| GAP-016 | P1 | Accessibility & responsive QA | Some keyboard behaviors and viewport overflow checks exist, but a complete WCAG audit and broad manual device/browser matrix are not evidenced. | Automated accessibility scan, manual keyboard/screen-reader review, WCAG 2.2 AA issue log and browser/device test matrix. |
| GAP-017 | P1 | Delivery & dependency governance | No confirmed current hosted preview URL; isolated preview lockfile/reproducibility and dependency security review remain outstanding. Repository interoperability also has a React peer-version blocker. | Committed lockfile and clean `npm ci`; dependency/security report; corrected React peer alignment; green required CI; verified preview URL and deployment SHA. |

## 4. Cross-cutting acceptance criteria

A finding is not closed by UI appearance alone. Closure must include:

1. **Implementation:** change exists on a dedicated feature branch and is scoped to the approved domain.
2. **Security:** server-side authorization, tenant isolation, validation and negative-path tests where applicable.
3. **Evidence integrity:** source, issuer, scope, validity, entity/lot linkage, timestamps and reviewer are traceable.
4. **Testing:** reproducible automated tests plus manual verification for user-critical workflows.
5. **Auditability:** commit SHA, workflow run, artifact or test report, reviewer and decision are recorded.
6. **Governance:** legal, regulatory, halal and Syariah review is obtained where the domain requires it.
7. **Release control:** no merge, production deployment, staging mutation or real-money action without explicit approval.

## 5. Recommended remediation sequence

### Gate A — Establish a real web preview
- Decide whether the evaluation app becomes the public buyer portal or remains a disposable design lab.
- Define root application routing, build ownership, deployment target and environment boundaries.
- Fix lockfile reproducibility and the React / react-dom peer mismatch in the appropriate scoped branch.
- Run the dedicated preview workflow and verify the deployed URL resolves to the exact tested commit SHA.
- Complete visual QA at mobile, tablet and desktop breakpoints.

**Exit evidence:** architecture decision, clean install, passing typecheck/build/browser tests, cross-platform CI status, screenshots and verified non-production preview URL.

### Gate B — Verify buyer-facing content
- Approve company identity, legal entity, business contact and public claims.
- Approve product master data, commercial specifications, imagery rights and product disclosures.
- Obtain origin, establishment, halal and quality evidence before any verified badge or claim appears.
- Keep all unverified evidence states explicit and non-promotional.

**Exit evidence:** signed content/data-owner approvals and a traceable evidence register.

### Gate C — Implement secure buyer transactions
- Establish identity, MFA, buyer organization membership and tenant-scoped authorization.
- Implement RFQ, quotation, contract and immutable contract snapshot workflows.
- Implement evidence obligations and an authoritative payment ledger.
- Implement server-side goods-release authorization; UI must only display the server decision.
- Complete security and database reviews before schema or authorization changes are approved.

**Exit evidence:** API contract, threat model, tenant-negative tests, audit events, reviewer sign-off and end-to-end tests.

### Gate D — Export execution and operational visibility
- Implement controlled document management and destination-specific export checklist.
- Integrate approved logistics and cold-chain data sources.
- Reconcile contract, product lot, evidence, export documents and consignment.
- Implement delivery acceptance, claims and reorder controls.

**Exit evidence:** end-to-end consignment trace, exception tests, access audit and operational sign-off.

## 6. Explicit non-goals and integrity constraints

- No assertion that stock photography depicts AHB farms, suppliers, abattoirs, staff, facilities, inventory or shipments.
- No country-of-origin, halal, food-safety, grade, establishment eligibility or destination access claim without evidence for the relevant product/lot/consignment.
- No inferred supplier relationship from Australian state/territory context.
- Halal and quality assurance remain separate evidence domains.
- No real customer data or production credentials in the evaluation lab.
- No real-money payment or goods release during UI evaluation.
- Internal farm, abattoir, warehouse and ERP operations remain outside the public buyer portal unless separately authorized and architected.

## 7. Audit disposition

**Overall: NOT PRODUCTION READY.**  
**Evaluation UI: suitable for controlled design review, subject to current artifact/branch verification.**  
**Operational transaction capability: NOT IMPLEMENTED.**  
**Legal, halal, origin and export claims: NOT VERIFIED.**

The next executable unit should be Gate A only. Do not start backend, database, payment or production work as a side effect of this audit. Each P0 item requires its own scoped design and review before implementation.
