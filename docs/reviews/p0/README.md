# IRP-P0-001 — Integrated Review Package

**Version:** 1.0-draft  
**Status:** PENDING REVIEW & APPROVAL  
**Review baseline:** 2026-11-10  
**Execution mode:** Read-only evidence package  
**Implementation authorization:** NOT GRANTED

This directory is the cross-platform review package for:

- Web: `muchlisbstg/export-client-web-sync`
- Mobile: `muchlisbstg/export-client-mobile-sync`
- Desktop: `muchlisbstg/export-client-desktop-sync`

## Package documents

1. [Integrated review and evidence register](./IRP-P0-001.md)
2. [UI screen specification](./UI-SCREEN-SPECIFICATION-001.md)
3. [UI/API contract matrix](./UI-API-CONTRACT-MATRIX-001.md)
4. [Negative-access test specification](./UI-NEGATIVE-ACCESS-TEST-001.md)
5. [Schema/API parity review](./SCHEMA-API-PARITY-REVIEW-001.md)
6. [Open architecture decisions](./OPEN-ARCHITECTURE-DECISIONS-001.md)
7. [Implementation readiness gates](./IMPLEMENTATION-READINESS-GATES-001.md)
8. [Source and test evidence reconciliation](./EVIDENCE-RECONCILIATION-001.md)

## Review sequence

1. Review screen responsibilities and target behavior.
2. Validate screen-to-API mappings against actual endpoint evidence.
3. Approve negative-access scenarios and expected security outcomes.
4. Review schema, referential integrity, migrations, and database topology.
5. Resolve or formally defer open architecture decisions with named owners.
6. Reconcile source-pinned evidence and cross-document test identifiers.
7. Complete or formally defer per-screen API traceability.
8. Approve the integrated package.
9. Only then assess implementation readiness against measured blockers.

## Governance boundary

Approval of this documentation package does not authorize code changes, schema changes, migrations, PR creation, merge, deployment, or production activity. Those actions require separate explicit authorization.

## Baseline repository SHAs

| Platform | Repository | Branch | SHA |
|---|---|---|---|
| Web | export-client-web-sync | main | `836821995c58293edadc982ae89f5519e1d4076b` |
| Mobile | export-client-mobile-sync | main | `0a3c595c6697f56d0cef8536b3c93c3886cc5ab1` |
| Desktop | export-client-desktop-sync | main | `3cb71f658712ee6c2b60d33b339a9600c09f15d6` |

These are the 2026-11-10 audit baselines, not a claim that the branches have not changed since that audit.
