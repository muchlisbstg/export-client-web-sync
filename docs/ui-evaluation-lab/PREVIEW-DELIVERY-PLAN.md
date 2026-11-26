# Australian Halal Beef — Preview Delivery Plan

## Current preview assets
1. `index.html`: public brand and product catalogue visual prototype.
2. `buyer-workspace-preview.html`: synthetic buyer portal workspace with Overview, Product Catalogue, RFQs, Purchase Orders, Documents, and Shipments navigation.

Both are dependency-free HTML prototypes. They can be opened locally in a browser from the repository source, but are not deployed or hosted as a live preview. All data is fictional and interactions are limited to client-side demonstration.

## Remaining stages to a React application preview

| Stage | Deliverable | Exit criteria |
|---|---|---|
| 1. UI stack decision | Select one candidate: shadcn/ui + Radix, HeroUI, or Mantine | Exact versions, React 19/Vite 8 compatibility, license, accessibility and maintenance evidence recorded |
| 2. React application shell | Vite + React + TypeScript buyer portal shell | CI install/build passes; responsive navigation and design tokens |
| 3. Buyer journey screens | Overview, catalogue/detail, RFQ, quotations, purchase orders, documents, payment status and shipments | Synthetic fixtures; buyer-only scope; accessible forms/tables; no live transactions |
| 4. Preview verification | Browser preview and evidence pack | Build + browser smoke tests + responsive checks + accessibility checks; preview URL or reproducible preview instructions |

**Estimate: 4 stages remain to a React application preview.** The HTML prototypes are already available for early visual review; they do not count as the React application preview.

## Explicit non-goals
- No backend integration, authentication, tenant authorization, payment processing, contracts execution, or shipment provider integration in this preview.
- No real customer, supplier, product, certification, origin, price, or shipment data.
- No production dependencies or lockfile changes until the isolated candidate evaluation is approved.
- No main-branch write, PR merge, staging mutation, or deployment.

## Important CI finding
The cross-repository interoperability workflow on the evaluation branch reported a mobile dependency installation failure: `react@19.3.0` conflicts with `react-dom@19.3.1`, whose peer requirement is `react@^19.3.1`. This is a mobile workspace dependency issue and must be handled in the mobile repository's own scoped branch/PR. Do not mask it with `--force` or `--legacy-peer-deps`.
