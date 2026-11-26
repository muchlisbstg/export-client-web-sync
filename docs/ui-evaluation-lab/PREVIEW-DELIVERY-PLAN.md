# Australian Halal Beef — Web Preview Delivery Plan

## Scope decision

This delivery is the **public Australian Halal Beef website preview**. The buyer workspace / internal operations prototype is not the current focus. The site is a B2B public-facing experience for global importers and distributors.

Included in this preview:
- Corporate landing page and brand positioning.
- Premium beef product catalogue with search and category filters.
- Product-specific quotation enquiry modal.
- Australian / New South Wales origin storytelling with explicit illustrative-data disclosure.
- Halal assurance, quality and export compliance content with unverified status disclosed.
- Buyer enquiry process and responsive navigation.

Excluded from this preview:
- Buyer authentication and private portal.
- Backend, CRM or database integration.
- Real RFQ transmission, quotations, contracts, payments or shipments.
- Live inventory, price, product origin, certification or establishment data.
- Internal farm, abattoir, production, warehouse or supplier management.

## Stage tracker

| Stage | Deliverable | Status | Evidence / remaining exit criteria |
|---|---|---|---|
| 1. Brand and website direction | Australian Halal Beef identity, premium cuts, global B2B message | <badge color="success">Implemented in prototype</badge> | Visual and copy review remains |
| 2. Public website experience | Landing, catalogue, origin, assurance, enquiry journey | <badge color="success">Implemented in branch</badge> | Manual visual review on desktop and mobile remains |
| 3. Automated verification | TypeScript, Playwright, responsive overflow and production build | <badge color="success">PASS — 6/6 tests</badge> | Dedicated run #45821463280 on SHA `81da9b90b737476709f593f89aeb7ac162dc1509` |
| 4. Reproducible dependency install | Commit lockfile and switch CI to `npm ci` | <badge color="warning">Pending</badge> | Current workflow uses `npm install`; no lockfile is committed |
| 5. Security and accessibility | Dependency audit, automated WCAG scan, keyboard/dialog review | <badge color="warning">Pending</badge> | Not yet run against the latest public-site implementation |
| 6. Hosted preview | Publish a preview URL and verify it in a real browser | <badge color="warning">Pending authorization</badge> | No hosted URL exists; deployment must be explicitly authorized |

## Latest CI evidence

- Repository: `muchlisbstg/export-client-web-sync`
- Pull request: [#68 — UI evaluation lab](https://github.com/muchlisbstg/export-client-web-sync/pull/68)
- Branch: `ui/ahb-buyer-portal-evaluation-lab`
- Latest validated SHA: `81da9b90b737476709f593f89aeb7ac162dc1509`
- Dedicated preview workflow: [run #45821463280](https://github.com/muchlisbstg/export-client-web-sync/actions/runs/45821463280)
- Result: dependency installation, TypeScript typecheck, six Playwright tests, Vite production build and artifact upload all passed.
- Test coverage: public-site navigation, catalogue filtering/search, product-specific RFQ prefill, local-only enquiry submission, disclosure of unverified Halal/origin status, and no horizontal overflow at 360, 390, 768, 1024 and 1440 CSS pixels.
- Artifact: `ahb-buyer-portal-react-preview`, ID `15117493086`, SHA-256 `9cc2af977ee6f26100fb9dff6947930f1a75d8dc5b05140abb52f914e270a54f`.
- Artifact retention expires 3 December 2026.

The separate repository-wide Web/API CI has an interoperability failure in the mobile dependency workspace. It is not the dedicated website preview workflow and is not evidence that this isolated website build failed.

## Preview integrity and content controls

- The RFQ form is a local demonstration only; it does not send or persist data.
- Product cuts, grades, formats and availability are illustrative.
- The NSW landscape is regional illustration, not proof of a specific farm or supply relationship.
- Halal certification status is explicitly marked not verified.
- Export eligibility and establishment approval remain subject to destination-specific verification.
- No certification, provenance, price or supply-capacity claim may be published as fact without supporting evidence.

## Remaining work to reach a shareable hosted preview

1. Make dependency installation reproducible with a committed lockfile and `npm ci`.
2. Complete dependency vulnerability and automated accessibility checks; resolve material findings.
3. Conduct visual QA at mobile, tablet and desktop sizes.
4. Obtain explicit authorization to publish a preview environment, then deploy and verify the public URL.

## Governance

- All changes remain on the feature branch and Draft PR #68.
- No merge to `main`, production deployment, backend integration or live customer data.
- Preview deployment is a separate action and requires explicit approval.
