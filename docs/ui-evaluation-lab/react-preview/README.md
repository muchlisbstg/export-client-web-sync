# React Buyer Portal Preview — Stage 2 Scaffold

This folder is a self-contained Vite + React + TypeScript application scaffold. It is intentionally isolated under the UI evaluation lab and does not alter the production app's package manifest or lockfile.

## Current implementation
- React application entry point and strict TypeScript configuration.
- Responsive buyer workspace shell.
- Buyer navigation: Overview, Product Catalogue, My RFQs, Purchase Orders, Documents, Shipments.
- Overview metrics, recent purchase orders and activity using synthetic fixture values.
- Responsive brand tokens and layout based on Australian Halal Beef identity.
- Non-overview destinations are clearly marked as Stage 3 placeholders.

## Run locally (when a Node/npm environment is available)
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

No lockfile is committed yet. A clean dependency install and generated lockfile are required before this scaffold can be considered reproducible or runtime-verified. Do not use `--force` or `--legacy-peer-deps`.

## Scope
- Synthetic data only.
- No backend calls, persistence, authentication, tenant enforcement, or live transactions.
- No payment processing, contract execution, supplier integration, or logistics provider integration.
- No production dependency, API, schema, staging or deployment changes.

## Status
Scaffold source has been committed to the evaluation branch. Build, typecheck, browser, accessibility and responsive runtime tests are pending.
