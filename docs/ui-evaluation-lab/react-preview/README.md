# Australian Halal Beef — React Buyer Portal Preview

This is a self-contained Vite + React + TypeScript application isolated under the UI evaluation lab. It does not alter the production app package manifest or lockfile.

## Implemented screens
- Overview with sample procurement metrics, recent purchase orders and activity.
- Product catalogue with search and category filters.
- RFQ workspace with a local demonstration form, selected-product prefill and in-memory demo record.
- Purchase order register with illustrative payment status.
- Document register with explicit verification state labels.
- Shipment detail with illustrative milestone timeline.

## Run locally
```sh
cd docs/ui-evaluation-lab/react-preview
npm install
npm run dev
```

Build and type-check:
```sh
npm run typecheck
npm run build
```

Do not use `--force` or `--legacy-peer-deps`. The isolated workflow installs dependencies and runs typecheck/build. A successful run is recorded at [Actions run #7](https://github.com/muchlisbstg/export-client-web-sync/actions/runs/45817441793), commit `b732eaedf1431822eb75105979021757dcaefedd`.

## Demo behavior and limits
- Product search and category filters run client-side.
- Request quote opens the RFQ workspace with the selected product prefilled.
- RFQ form submission adds a synthetic record to in-memory page state only; refresh discards it.
- Orders, payment statuses, documents and shipment events are fictional fixtures.
- No file downloads, external tracking, bank/payment actions, contract execution or seller communication.
- No backend calls, persistence, authentication, tenant enforcement, supplier integration or logistics provider integration.
- No real product, origin, certification, buyer, price or shipment claim is verified. Halal assurance sample is marked not verified.

## Validation status
- Dependency installation: PASS in dedicated GitHub Actions workflow.
- TypeScript typecheck: PASS on commit `f2442f15d17dae88fc55199fb332758522528a7d`.
- Chromium browser tests: PASS (6/6 scenarios) on commit `f2442f15d17dae88fc55199fb332758522528a7d`; [workflow run #36](https://github.com/muchlisbstg/export-client-web-sync/actions/runs/45818648050).
- Keyboard focus visibility smoke test: PASS. This is not a complete WCAG audit.
- Horizontal overflow checks: PASS at 360, 390, 768 and 1024 CSS px.
- Vite production build: PASS.
- Artifact `ahb-buyer-portal-react-preview`: uploaded by run #36; [artifact](https://github.com/muchlisbstg/export-client-web-sync/actions/runs/45818648050/artifacts/15117255770), artifact ID `15117255770`, retention configured for 7 days.
- No committed lockfile yet; reproducible `npm ci` remains a follow-up. Dependency security review and automated WCAG scan also remain pending.

## Governance
No production dependency, API, schema, staging or deployment changes. No main-branch write or merge authorization.
## Professional product catalogue experience

- Search by product name, cut, category or product ID.
- Filter by product family and chilled / frozen handling format.
- Sort by product name or category, with result counts and a clear-filter empty state.
- Open an accessible product specification dialog with product family, cut, handling, grade, packaging and buyer-channel fields.
- Compare up to three product ranges side by side.
- Configure a product-specific preview enquiry with destination, estimated quantity, handling preference and packaging notes.
- Product detail and comparison dialogs support Escape, focus placement, keyboard focus trapping and trigger-focus restoration.

## Product-data integrity

All product records remain synthetic. Grade, marbling, origin, halal certification, establishment eligibility, price, live availability, shelf life, minimum order quantity, lead time and destination market access are not asserted as verified facts. These attributes require documentary verification and written confirmation before commercial publication.

The product-specific enquiry is browser-local demonstration only. It does not transmit, persist, or create an RFQ or quotation.

## Australian origin & provenance experience

- Jurisdiction explorer for all six states and two mainland territories, with searchable contextual profiles and a clear "not to scale" reference-index disclosure.
- Regional context is explicitly separated from supplier, farm, processor, livestock consignment and product-lot origin claims.
- Property-to-export traceability framework covering property identity, NLIS animal identification and movement records, processing establishment approval/scope, product and carton lot linkage, and export consignment.
- Buyer evidence dossier covering property/PIC identity, livestock traceability, establishment eligibility, product/lot reconciliation, country-of-origin substantiation, halal certificate scope/validity, quality and cold-chain records.
- Destination-market evidence checklist with selectable document categories. The checklist is browser-session UI only and does not contact suppliers or transmit/store data.
- Keyboard-accessible dialog with focus management, focus trapping, Escape dismissal and trigger-focus restoration.

## Origin and provenance integrity controls

- All jurisdiction profiles are contextual reference content, not AHB sourcing locations or supplier commitments.
- No farm, supplier, abattoir, export establishment, NLIS, government registry, certificate issuer, shipment or live traceability data is connected.
- All evidence categories are labelled NOT CONNECTED; origin and halal statuses must not be represented as verified in this preview.
- An Australian business address, regional illustration or state profile is not proof of country of origin for a specific animal, product or shipment.
- Actual origin claims and labelling must be substantiated against the relevant product lot and destination-market rules. Property, livestock, processing, halal and export records must reconcile to the same consignment.
- No internal farm/abattoir operational information is exposed. No production, inventory, supplier or facility data is invented.

## Quality & halal assurance evaluation

- Buyer-facing assurance workspace with separate Halal, Quality, Cold chain and Traceability evidence domains.
- Evidence controls include certificate issuer recognition and scope, slaughter-process assurance, segregation controls, product cut specification, grading/eating-quality evidence, food-safety records, cold-chain monitoring and lot-to-consignment reconciliation.
- Search, domain filters and expandable acceptance criteria expose required evidence scope and linkage.
- Local-only buyer review scenario accepts a synthetic lot reference and destination; no data is transmitted or persisted.
- All controls are explicitly NOT CONNECTED or NOT PROVIDED. Zero verified records are represented. No halal certification, product grade, food-safety status, establishment approval or destination eligibility is claimed.
- This is a buyer due-diligence evaluation UI, not a regulatory decision engine or certification verifier. Actual evidence requires competent independent review against current destination-market rules and the exact product lot.


## B2B order lifecycle experience

- Replaces the original four-step process teaser with an interactive 12-stage buyer journey: buyer verification, product specification, RFQ, feasibility and quotation, contract approval, order preparation, quality and halal review, payment milestones, goods release authorisation, export documentation, shipment/delivery, and acceptance/reorder.
- Each stage exposes the buyer action, expected evidence and a control gate; stage navigation is keyboard-operable and boundary controls are disabled.
- Includes a synthetic buyer-preparation checklist with local progress, destination selector and a local-only brief confirmation.
- Presents the illustrative 30/30/40 payment milestone allocation with an explicit distinction between a UI indicator and authoritative settlement evidence.
- Explicitly states that goods release requires server-side authorisation and that the preview cannot authorise or release goods.
- All interactions remain in browser memory. No RFQ transmission, buyer verification, quotation, contract signing, payment, settlement, goods release, export filing, carrier tracking or delivery acceptance is connected.
- Added Playwright scenarios for lifecycle navigation, payment and release guardrails, local buyer readiness and preview-only disclosures.

## B2B order lifecycle integrity constraints

The 12 stages are a buyer education and workflow-evaluation model, not an operational commitment or legal process specification. Actual approval requirements, documentary evidence, payment conditions, Incoterms, destination-market eligibility and release authority must be defined in the executed contract and verified by authorised parties. The 30/30/40 split is illustrative only. Legal and Syariah review is required before real financial or contract workflows are implemented.
