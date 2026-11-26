# UI Evaluation Lab — Prototype Notes

Open `index.html` directly in a modern browser. It has no build step and no third-party dependencies.

## What this prototype proves
- A shared Australian Halal Beef visual direction.
- Responsive public buyer website shell.
- Synthetic product catalogue with search and category filtering.
- RFQ modal with client-side-only demo submission.
- Three colour-direction toggles for visual exploration.

## What this prototype does NOT prove
- It does not import or run shadcn/ui, Radix UI, HeroUI, or Mantine.
- The A/B/C tabs are visual direction toggles, not implementations of those component libraries.
- It has no backend, buyer authentication, persistence, real RFQ submission, contract, payment, or shipment integration.
- Product information, origin, and certification are placeholders; they are not supplier or product claims.

## Next evaluation gate
Create three isolated Vite prototypes (one per candidate) using the same screens and synthetic fixtures. Before installing dependencies, verify exact package versions, peer dependencies for React 19, Vite 8 and TypeScript 7, license identifiers, transitive dependency health, and build compatibility. Then run identical responsive, keyboard/accessibility, and performance checks.

## Manual smoke-check checklist
- [ ] Open at desktop width and inspect navigation, hero, catalogue, and footer.
- [ ] Resize to tablet and mobile; verify no horizontal overflow.
- [ ] Search for "Wagyu"; verify filtering.
- [ ] Select "Angus"; verify category filtering.
- [ ] Open RFQ from a product card; verify product is prefilled.
- [ ] Submit the demo form; verify the local-only confirmation text.
- [ ] Close the dialog with the close button and backdrop.
- [ ] Switch A/B/C visual directions.
- [ ] Keyboard navigate tabs, buttons, filters, and dialog.
- [ ] Run automated accessibility and browser tests before any PASS claim.

This is an isolated visual prototype, not a production-ready buyer portal.
