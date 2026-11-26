# Australian Halal Beef — Preview Delivery Plan

## Current preview assets
1. `index.html`: public brand and product catalogue visual prototype.
2. `buyer-workspace-preview.html`: synthetic HTML buyer workspace.
3. `react-preview/`: isolated Vite + React + TypeScript application scaffold.

The HTML prototypes are dependency-free and are not hosted. The React scaffold has a buyer workspace shell and Overview screen; other destinations remain explicit Stage 3 placeholders. No live backend or transaction behavior exists.

## Stage tracker

| Stage | Deliverable | Status | Exit criteria |
|---|---|---|---|
| 1. UI stack decision | Preferred direction: shadcn/ui + Radix | <b>Preferred candidate recorded</b> | Exact package peer/dependency, license, security and runtime verification remains a gate before adopting those packages |
| 2. React application shell | Isolated Vite + React + TypeScript shell, responsive navigation, brand tokens and Overview | <b>Scaffold committed; validation pending</b> | Clean install, lockfile, typecheck, production build, browser and responsive smoke checks |
| 3. Buyer journey screens | Catalogue/detail, RFQ, quotations, purchase orders, documents, payment status and shipments | Not started | Synthetic fixtures; buyer-only scope; accessible forms/tables; no live transactions |
| 4. Preview verification | Browser preview and evidence pack | Not started | Build + browser smoke tests + responsive checks + accessibility checks; preview URL or reproducible preview instructions |

**Planning estimate: 3 stages remain** to a React application preview. Stage 1 has a preferred candidate decision, but its dependency/security validation is not yet complete. Stage 2 source exists, but it is not yet build- or runtime-verified. This estimate may increase if compatibility or CI blockers are found.

## Explicit non-goals
- No backend integration, authentication, tenant authorization, payment processing, contract execution, or shipment provider integration.
- No real customer, supplier, product, certification, origin, price, or shipment data.
- No production app dependency or lockfile changes.
- No main-branch write, PR merge, staging mutation, or deployment.

## Important CI finding
The cross-repository interoperability workflow on the evaluation branch reported a mobile dependency installation failure: `react@19.3.0` conflicts with `react-dom@19.3.1`, whose peer requirement is `react@^19.3.1`. This is a mobile workspace dependency issue and must be handled in the mobile repository's own scoped branch/PR. Do not mask it with `--force` or `--legacy-peer-deps`.

## React scaffold instructions
See `react-preview/README.md`. No lockfile has been committed yet. A clean dependency install and generated lockfile are required before reproducibility or runtime readiness can be claimed.
