# UI Stack Decision — Australian Halal Beef Buyer Portal

**Decision:** Adopt **shadcn/ui + Radix UI primitives** as the preferred implementation direction for the isolated buyer-portal preview. This is a scoped technical decision for the evaluation branch, not approval to alter production dependencies or merge.

## Rationale
- Source-owned components support the brand's premium visual system without locking the product into a rigid prebuilt theme.
- Radix primitives provide composable interaction foundations for dialogs, menus, tabs, popovers and accessible controls.
- The official shadcn Vite guidance documents a React + TypeScript + Vite setup and Tailwind CSS v4 integration. Its current Vite starter documentation explicitly references Vite 8 and React 19.
- The current repository already uses React 19.3.1, React DOM 19.3.1, Vite 8.3.4 and TypeScript 7.0.2. Keeping the preview aligned with these existing versions reduces unnecessary framework divergence.

## Supporting libraries — proposed, not installed
- TanStack Table: complex buyer-facing RFQ, quotation, PO and shipment tables.
- React Hook Form + Zod: form state and validation. Zod already exists in the repository's runtime dependencies.
- Lucide React: consistent iconography.
- Tailwind CSS v4: utility styling for copied/source-owned shadcn components.

## Why not select HeroUI or Mantine as the primary stack now?
- HeroUI is a credible alternative with React Aria foundations and Tailwind CSS v4, but its compound component system gives less direct source-level control than the shadcn source-owned approach for this highly branded portal.
- Mantine is a strong integrated component suite, but it adds a more opinionated styling/component layer than needed for a custom premium buyer experience.
- They remain valid alternatives if the proof-of-compatibility, accessibility or implementation cost gate fails.

## Mandatory technical gates before production adoption
1. Confirm exact package versions and peer dependencies against React 19.3.1, React DOM 19.3.1, Vite 8.3.4 and TypeScript 7.0.2.
2. Run a clean isolated install without `--force` or `--legacy-peer-deps`.
3. Record package licenses and transitive dependency/security status.
4. Verify keyboard interaction, focus management, screen-reader labels and responsive behavior.
5. Compare bundle impact and maintainability against the existing repository baseline.

## Scope and governance
- The implementation preview lives under `docs/ui-evaluation-lab/react-preview/` and is isolated from the production app root.
- No production package manifest or lockfile is modified by this decision.
- No backend, authentication, tenant authorization, schema, payment, contract or logistics behavior is changed.
- No deployment or merge is authorized.

## References
- shadcn/ui Vite installation: https://ui.shadcn.com/docs/installation/vite
- shadcn/ui React 19 compatibility notes: https://ui.shadcn.com/docs/react-19
- HeroUI package overview: https://www.npmjs.com/package/@heroui/react

**Decision status:** preferred candidate; dependency/security validation still pending.
