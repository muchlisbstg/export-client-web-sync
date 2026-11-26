# Australian Halal Beef — Preview Delivery Plan

## Current preview assets
1. `index.html`: public brand and product catalogue HTML prototype.
2. `buyer-workspace-preview.html`: synthetic buyer workspace HTML prototype.
3. `react-preview/`: isolated Vite + React + TypeScript application.

The React application now contains Overview, Product Catalogue, RFQ workspace, Purchase Orders, Documents and Shipments screens. Interactions use synthetic data and browser memory only. No live backend or transaction behavior exists.

## Stage tracker

| Stage | Deliverable | Status | Exit criteria |
|---|---|---|---|
| 1. UI stack decision | Preferred direction: shadcn/ui + Radix | <b>Preferred candidate recorded</b> | Exact package peer/dependency, license, security and runtime verification remains a gate before adopting those packages |
| 2. React application shell | Isolated Vite + React + TypeScript shell, responsive navigation and brand tokens | <badge color="success">Dedicated CI PASS</badge> | npm install, TypeScript typecheck and production build passed on SHA `b732eaedf1431822eb75105979021757dcaefedd`; committed lockfile and browser checks still pending |
| 3. Buyer journey screens | Overview, catalogue/search/filter, RFQ demo form, purchase order/payment status, document register, shipment timeline | <badge color="success">Source + build verified</badge> | Screens compile and build; browser interaction, accessibility, responsive and content review still required |
| 4. Preview verification | Browser preview and evidence pack | Not started | Build + browser smoke tests + responsive checks + accessibility checks; preview URL or reproducible preview instructions |

**Planning estimate: 2 stages remain** to a React application preview. Stage 1's preferred candidate still needs dependency/security validation; Stage 2/3 source has been committed but must pass dedicated CI and runtime verification. The estimate may increase if compatibility or CI blockers are found.

## Preview interaction boundaries
- Product search and category filtering are client-side.
- Product "Request quote" opens the RFQ form with the selected product prefilled.
- RFQ form adds a local in-memory demo record only; refreshing the page discards it.
- Purchase orders, payment status, documents and shipment timeline are fictional fixture records.
- No document download, external tracking, payment, contract or seller communication is performed.

## Explicit non-goals
- No backend integration, authentication, tenant authorization, payment processing, contract execution, or shipment provider integration.
- No real customer, supplier, product, certification, origin, price, or shipment data.
- No production app dependency or lockfile changes.
- No main-branch write, PR merge, staging mutation, or deployment.

## CI evidence
- Existing Web/API verification passed on commit `709a77688c9d45e875c159ad8a77ce25dc810288`.
- Interoperability failed on the same commit because the mobile workspace resolves `react@19.3.0` while `react-dom@19.3.1` requires peer `react@^19.3.1`. This is a separate mobile dependency blocker.
- New workflow `.github/workflows/ahb-buyer-portal-preview.yml` runs install, TypeScript typecheck and production build for changes under this isolated preview directory. Run #7 completed successfully on SHA `b732eaedf1431822eb75105979021757dcaefedd`: `npm install`, `tsc --noEmit` and `vite build` all passed. [Workflow evidence](https://github.com/muchlisbstg/export-client-web-sync/actions/runs/45817441793).
- React dependency installation, TypeScript typecheck and production build are PASS from the dedicated workflow. Browser runtime, accessibility and responsive checks remain unexecuted; no browser/runtime PASS is claimed.

## React scaffold instructions
See `react-preview/README.md`. The isolated preview currently has no committed lockfile; npm install is exercised by the dedicated workflow. A committed lockfile is still needed for fully reproducible installs.
