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
- TypeScript typecheck: PASS.
- Vite production build: PASS.
- Chromium browser smoke tests: PASS (4 scenarios) on SHA `dff772a966552f7a03775fd6c87426a5265bc85c`; [workflow run #23](https://github.com/muchlisbstg/export-client-web-sync/actions/runs/45817928445).\n- Mobile viewport overflow check at 390px: PASS.\n- Keyboard/focus audit, automated accessibility scan and broader device matrix: pending.\n- Build artifact `ahb-buyer-portal-react-preview` uploaded by the same workflow; expires 3 Dec 2026.
- No committed lockfile yet; reproducible `npm ci` remains a follow-up. Dependency security review and automated WCAG scan also remain pending.

## Governance
No production dependency, API, schema, staging or deployment changes. No main-branch write or merge authorization.
