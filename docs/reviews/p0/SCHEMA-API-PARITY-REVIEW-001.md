# SCHEMA-API-PARITY-REVIEW-001 — Cross-Platform Data and API Parity

**Version:** 1.0-draft  
**Status:** PARITY NOT ACHIEVED  
**Baseline:** 2026-11-10 read-only audit

## 1. Database topology observed

| Platform | Database |
|---|---|
| Web | `data/export-client.sqlite` |
| Mobile | `server/data/api.sqlite` |
| Desktop | Electron `userData/inquiries.sqlite` |

All three platforms use separate SQLite databases in the audited baseline. Similar table names do not prove shared consistency or a canonical source of truth.

## 2. Shared schema observed

Core tables:
- `products`
- `inquiries`
- `sync_conflicts`
- `sync_outbox`

Web and Desktop migration scripts include:
- `tenants`
- `tenant_memberships`
- `commercial_transactions`
- `tenant_sync_outbox`
- Buyer/Seller ownership columns.

Mobile includes additional enterprise and supply-chain structures:
- `enterprise_role_assignments`
- `enterprise_role_audit`
- `supply_site_assignments`
- `supply_audit_events`
- `transaction_access_assignments`
- `transaction_site_links`
- Supply-chain operational tables.

## 3. Composite integrity gaps

The Mobile source schema reconciliation recorded five gaps:

| ID | Missing constraint/model | Severity | Required acceptance |
|---|---|---|---|
| SG-001 | `transaction_enterprise_parties` bridge | Critical | Explicit transaction-party relationship exists and is constrained |
| SG-002 | Composite `(tenant_id, transaction_id)` FK on transaction access assignment | Critical | Assignment cannot reference transaction from another tenant |
| SG-003 | Composite `(tenant_id, site_id)` FK on transaction access assignment | Critical | Assignment cannot reference site from another tenant |
| SG-004 | Composite `(tenant_id, transaction_id)` FK on transaction site link | Critical | Site link cannot attach to another tenant's transaction |
| SG-005 | Composite `(tenant_id, site_id)` FK on transaction site link | Critical | Site link cannot reference another tenant's site |

These are requirements for integrity enforcement, not a proposed DDL or migration approval.

## 4. Migration/runtime findings

- Migration scripts were observed in source.
- Runtime invocation on the application startup path was not established.
- `tenantSchemaReady()` checks tenant schema readiness.
- A fresh database may return `503 tenant_schema_not_ready`.
- Fresh-install and upgrade behavior have not been proven consistently across all platforms.

## 5. API parity findings

- Common catalog, inquiry, auth/session, health, and sync surfaces exist across the three platforms.
- Web and Desktop expose tenant/transaction capabilities that are not equivalent to Mobile.
- Mobile transaction create/status and tenant-sync endpoints were observed as retired (410).
- Mobile has additional supply-chain endpoints not present as equivalent Web/Desktop APIs.
- Web `docs/openapi.yaml` was observed stale/incomplete relative to source-discovered tenant/transaction APIs.

API parity does not require identical endpoint sets where platform responsibilities differ. It requires consistent domain semantics, identity, ownership, authorization, identifiers, and lifecycle contracts.

## 6. Supabase staging observation

- Project: `export-client-staging`
- Project ref: `utvxuzmtevnmrcpxfpaa`
- Region: `ap-south-1`
- PostgreSQL: 17.11
- Status at inspection: INACTIVE
- Table/migration inspection: unavailable or timed out
- RLS: NOT VERIFIED

An empty security-advisor finding list is not evidence of correct RLS when the database cannot be inspected.

## 7. Acceptance criteria

- Canonical entity definitions exist for tenant, membership, transaction, participant, site, assignment, and evidence.
- Composite keys/FKs enforce tenant/resource ownership.
- Each platform has a verifiable migration inventory and schema version.
- Fresh install and upgrade paths pass.
- Migration responsibility and startup/deployment execution path are explicit.
- Referential-integrity tests reject cross-tenant references.
- API ownership and authorization semantics are consistent across platforms.
- Database topology is explicitly decided: per-platform SQLite, shared backend, or documented hybrid.
- If Supabase is selected as authoritative backend, project health, connectivity, migrations, RLS, backup, and authorization are verified.

## 8. Review conclusion

**PARITY NOT ACHIEVED.** The findings block a claim of cross-platform implementation readiness until the critical ownership, migration, and API-contract gaps are resolved or formally scoped out with an approved architecture decision.
