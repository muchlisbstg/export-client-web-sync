# Australian Halal Beef — Public Website Preview

This directory contains an isolated public-facing website prototype for Australian Halal Beef, a premium Australian beef brand targeting global B2B buyers.

## Open the React preview

The current implementation is in `react-preview/` (Vite + React + TypeScript).

From this directory:

```bash
npm install
npm run typecheck
npm run test:e2e
npm run build
npm run dev
```

The development server prints a local URL. The production output is generated in `react-preview/dist/`.

## Website sections

- Corporate landing page: Australian origin, Halal integrity and global B2B positioning.
- Product catalogue: Wagyu, Angus and beef cuts, search and category filtering.
- Product enquiry: RFQ demonstration with the selected product prefilled.
- Australian origin: New South Wales landscape illustration and provenance disclosure.
- Halal and quality assurance: transparent status messaging, without unsupported certification claims.
- Buyer journey: enquiry, quotation, contract/order and export/shipment stages.
- Responsive navigation and layouts for mobile, tablet and desktop.

## Automated checks

Dedicated GitHub Actions workflow: [AHB Buyer Portal Preview](https://github.com/muchlisbstg/export-client-web-sync/actions/workflows/ahb-buyer-portal-preview.yml).

Latest successful run: [#45821463280](https://github.com/muchlisbstg/export-client-web-sync/actions/runs/45821463280), commit `81da9b90b737476709f593f89aeb7ac162dc1509`.

- TypeScript typecheck: PASS.
- Playwright: 6/6 PASS.
- Vite production build: PASS.
- Responsive overflow checks: 360, 390, 768, 1024 and 1440 CSS pixels.
- Build artifact: `ahb-buyer-portal-react-preview`.

## Demo-only boundaries

- Enquiry submission is local to the browser and is not transmitted or persisted.
- Product descriptions, grades, pack formats and availability are illustrative.
- New South Wales artwork is regional illustration, not verified farm provenance.
- Halal certification is marked **not verified in this preview**.
- Export eligibility, establishment approval and destination access are not asserted.
- There is no authentication, backend, database, live RFQ, contract, payment, shipment or customer data.

## Not production-ready

This preview demonstrates the public website's visual direction and selected browser interactions. It is not a live ordering platform. A committed npm lockfile, dependency security review, accessibility audit, visual QA and authorized hosted-preview deployment remain outstanding.

## Related files

- `react-preview/src/App.tsx`: public website sections and interactions.
- `react-preview/src/styles.css`: responsive brand styling.
- `react-preview/tests/buyer-journey.spec.ts`: browser coverage.
- `PREVIEW-DELIVERY-PLAN.md`: stage tracker and evidence.
