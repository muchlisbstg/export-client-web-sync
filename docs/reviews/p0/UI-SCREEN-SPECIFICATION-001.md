# UI-SCREEN-SPECIFICATION-001 — Cross-Platform Screen Baseline

**Version:** 1.0  
**Status:** FROZEN — FUNCTIONAL DESIGN BASELINE  
**Freeze context:** Review dated 2026-11-10  
**Implementation status:** Not implied or approved

## 1. Scope

This specification freezes the target screen inventory and platform responsibility boundaries for Web, Mobile, and Desktop. It does not assert that all screens exist in source code.

## 2. Inventory

| Platform | Screen ID range | Count |
|---|---|---:|
| Web | WEB-001–WEB-015 | 15 |
| Mobile | MOB-001–MOB-013 | 13 |
| Desktop | DES-001–DES-010 | 10 |
| **Total** | | **38** |

The 38 screen identifiers are the frozen inventory. Detailed visual layout, component behavior, and API dependency must be reviewed against the corresponding UI/API contract matrix before implementation.

## 3. Platform responsibilities

### Web — Buyer/Seller Portal and Admin Console

Observed baseline screens include:
- Home and admin login.
- Sync status.
- Catalog, search/filter, comparison.
- Export/sharing.
- RFQ, submission result, inquiry tracking.

Target responsibilities:
- Buyer and Seller portal workspaces.
- Transaction and contract workspace.
- Admin console and tenant/membership administration.
- Payment and guarantee visibility.
- Audit, compliance, and Syariah governance review surfaces.

Gaps observed: distinct Buyer/Seller workspaces, full contract/transaction workspace, complete tenant administration, payment/guarantee, audit/compliance, and Syariah governance.

### Mobile — Operational Workflow

Observed baseline screens include:
- Home and enterprise login.
- Partial role summary.
- API availability.
- Catalog, search/filter, comparison, sharing.
- RFQ, submission result, inquiry tracking.

Target responsibilities:
- Operational workflow.
- Approval tasks.
- QC and inspection.
- Warehouse receiving and movement.
- Shipment dispatch and handover.
- Notifications.
- Offline work queue and synchronization.
- Operational settings.

Gaps observed: Buyer/Seller operational workspace, approval center, complete QC/warehouse/handover workflows, notification center, robust offline queue, and settings. Existing source still reflects single-enterprise concepts.

### Desktop — Business Operations and Monitoring

Observed baseline screens include:
- Overview dashboard.
- Catalog, search, comparison.
- New request/RFQ and inquiry tracking.
- API settings and sync monitoring.
- Partial admin login/data management.

Target responsibilities:
- Business operations.
- Transaction management and monitoring.
- Data management and administration.
- Evidence/compliance monitoring.
- Financial and Syariah governance monitoring.

Gaps observed: complete transaction/contract management, tenant administration, audit/compliance, financial monitoring, Syariah governance, and supply-chain monitoring.

## 4. Frozen design policy

- Supplier architecture: hybrid.
- Platform Administrator boundary: broad, subject to explicit permission and complete audit.
- Syariah Reviewer authority: review/comment/recommend only.
- Tenant, transaction participant, and site scope must be explicit.
- Backend authorization is authoritative; hiding navigation items is not an access-control mechanism.
- Proposed permission keys remain proposals until a canonical backend permission registry is approved.

## 5. Screen-to-contract linkage

Every screen must map to:
- Actor and active tenant context.
- Required membership, role, permission, and resource scope.
- API endpoint(s) and contract status.
- Data entities and ownership.
- Loading, empty, error, and unauthorized states.
- Audit requirements for sensitive actions.
- Offline behavior where applicable.

See [UI-API-CONTRACT-MATRIX-001](./UI-API-CONTRACT-MATRIX-001.md) and [UI-NEGATIVE-ACCESS-TEST-001](./UI-NEGATIVE-ACCESS-TEST-001.md).

## 6. Freeze boundary

Frozen: screen identifiers, platform responsibilities, Supplier hybrid model, broad-but-permissioned Platform Administrator boundary, Syariah Reviewer review-only authority, and tenant/transaction/site scoping principles.

Not frozen: detailed component implementation, final permission registry, unapproved API contracts, schema changes, migrations, code, or deployment.

**Acceptance:** Any proposed change to frozen responsibilities or actor authority requires an explicit design decision and revision record.
