# Australian Halal Beef — Buyer Portal UI Evaluation Lab

Status: Evaluation plan / documentation-only foundation.
Base: `main` at `44b73b9d57f13f04b558999dedb834cae9a6be5b`.
Scope: Global B2B buyer website only. This is not the internal farm, abattoir, processing, ERP, or workforce application.

## 1. Objective

Evaluate UI systems for a premium, accessible, responsive B2B buyer portal without changing the existing production application, API contracts, dependency graph, or lockfile.

The evaluation must compare:
- shadcn/ui + Radix primitives
- HeroUI
- Mantine

No candidate is approved for production integration until compatibility, licensing, accessibility, runtime, and maintenance evidence is recorded.

## 2. Buyer portal scope

Public:
- Corporate home and company profile
- Product catalogue and product details
- Australian origin / provenance information
- Quality and halal assurance information
- Business inquiry and buyer registration

Authenticated buyer:
- Buyer dashboard
- RFQ creation and submission
- Quotation review and comparison
- Purchase order request / confirmation
- Contract and document access
- Payment status (read-only status display unless separately authorized)
- Shipment milestones and tracking
- Order history and reorder eligibility

Commercial policy:
- New / non-contracted buyers use RFQ -> seller quotation -> buyer acceptance -> contract/order confirmation.
- Contracted and verified buyers may reorder only against valid agreed pricing, specification, and contract terms.
- Custom specifications and non-contract items remain RFQ-based.
- The website is a buyer channel only; internal farm, abattoir, production, staff, supplier procurement, and internal finance workflows are out of scope.

## 3. Brand and visual constraints

- Brand: Australian Halal Beef
- Primary tagline: Integrity in Every Cut.
- Palette: Brand Green #123D32; Ocean Navy #17324D; Premium Gold #C49A55; Heritage Terracotta #A64B32; Natural Ivory #F4EFE4; Charcoal Grey #343C3A.
- Typography direction: Montserrat / Playfair Display / Inter, subject to font licensing and performance review.
- Premium, restrained, export-oriented corporate presentation.
- Do not use animal heads or human faces. Animal or human imagery, if used, must be faceless / silhouette / from-behind. Prioritize premium beef cuts, marbling, Australian landscapes, facilities, packaging, and traceability visuals.
- Never imply halal certification, export eligibility, supplier approval, or product provenance without verified evidence. Use explicit pending / verified / expired / suspended / not verified states.

## 4. Evaluation candidates

| Candidate | Intended evaluation focus | Risk / consideration |
|---|---|---|
| shadcn/ui + Radix | Source-owned custom premium design, composability, accessibility | More implementation ownership and maintenance |
| HeroUI | Rapid polished buyer-facing components | Verify current React / Tailwind compatibility and component fit |
| Mantine | Complete forms, overlays, data display, buyer workspace | Visual customization and bundle/dependency footprint |

Supporting libraries to evaluate separately:
- TanStack Table for sortable/filterable RFQ, quotation, order, and shipment tables.
- React Hook Form + Zod for buyer registration and RFQ validation.
- Lucide for consistent iconography.
- MapLibre only if a real buyer-facing origin map materially improves provenance communication.

Do not add AG Grid Enterprise or other paid components without an explicit cost and license decision.

## 5. Evaluation screens

Build the same synthetic-data prototype in each candidate:
1. Product catalogue with search, category, cut, grade, chilled/frozen, and origin filters.
2. Product detail with pack size, specification, origin, verified claims, and RFQ action.
3. RFQ form with destination, quantity, packaging, delivery terms, and validation.
4. Quotation comparison with currency, validity, Incoterms, quantity breaks, and specification.
5. Buyer dashboard with order states and shipment timeline.
6. Responsive navigation and accessible account menu.

Use synthetic/demo data only. No live buyer information, real supplier data, real pricing, or payment credentials.

## 6. Scorecard

Score each criterion from 1 (poor) to 5 (strong), with evidence:
- React 19 and TypeScript 7 compatibility
- Vite 8 compatibility
- Accessibility: keyboard, focus, labels, contrast, screen reader semantics
- Responsive behavior at mobile, tablet, and desktop breakpoints
- Visual fidelity to Australian Halal Beef brand
- Form ergonomics and validation
- Data table usability
- Bundle size and runtime performance
- Dependency health and upgrade path
- Documentation and contributor activity
- License suitability for commercial use
- Ease of maintenance and customization

Suggested weighting:
- Accessibility and correctness: 20%
- React/Vite/TypeScript compatibility: 15%
- Brand fidelity and UX quality: 15%
- Responsive behavior: 10%
- Performance and bundle size: 10%
- Forms and data-heavy workflows: 10%
- Maintenance and ecosystem health: 10%
- License and commercial cost: 10%

A score without a reproducible test or source evidence must be marked "not assessed", not guessed.

## 7. Technical isolation and safety gates

- Keep this evaluation isolated from the main application and its lockfile.
- Do not install candidate UI dependencies in the production app during evaluation.
- Do not change API, authentication, authorization, tenant isolation, schema, payment, contract, or shipment business logic.
- Do not connect to production services or real customer data.
- Do not deploy or change staging.
- Keep prototypes non-functional for real transactions; interactions must use mock handlers and synthetic fixtures.
- Review package licenses, transitive dependencies, security advisories, peer dependencies, and React/Vite compatibility before install.
- Preserve the existing app's buyer RFQ/catalog/tracking behavior.
- No merge or deployment is authorized by this evaluation plan.

## 8. Acceptance evidence

For each candidate, record:
- exact package versions and license identifiers
- install/build/typecheck/test output
- browser runtime screenshots at mobile/tablet/desktop sizes
- accessibility test results and known exceptions
- bundle analysis
- dependency audit summary
- scorecard with evidence links

No candidate receives PASS until the corresponding checks are actually run.

## 9. Current baseline observations

Repository: `muchlisbstg/export-client-web-sync`
Main SHA: `44b73b9d57f13f04b558999dedb834cae9a6be5b`
Stack in package manifest: React 19.3.1, React DOM 19.3.1, Vite 8.3.4, TypeScript 7.0.2, Express 5.3.0.
Current app includes catalogue, filtering, comparison, RFQ/inquiry, tracking, and an admin authentication panel. Current package manifest does not list shadcn/ui, HeroUI, Mantine, TanStack Table, React Hook Form, or Lucide.
Existing `docs/ui-design-system-dark-v1.md` is a draft cross-platform design specification; it explicitly requires a separate dependency review before introducing UI dependencies or changing lockfiles.

This document establishes the evaluation plan only. It does not represent a completed prototype, runtime test, production UI approval, halal certification, legal approval, or export-market clearance.
