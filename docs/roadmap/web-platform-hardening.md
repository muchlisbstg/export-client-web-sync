# Web platform hardening roadmap

Status: planning document for the existing Web + API MVP. This is not a statement of production readiness.

## Current boundary
- React/Vite web client and Express API are maintained in this repository.
- SQLite is local/persistent for the current MVP; peer synchronization is append-only.
- The current README explicitly says user authentication, admin authorization, retention/deletion policy, and production deployment controls are not complete.

## Priority 0 — before real customer data
- [ ] Add server-side authentication and role/tenant authorization; default-deny administrative and inquiry access.
- [ ] Replace public bearer tracking access with an explicit, rate-limited access policy; avoid exposing sensitive inquiry fields.
- [ ] Define data classification, consent/notice, retention periods, export, and deletion workflow.
- [ ] Require HTTPS at the deployment edge; validate trusted proxy settings and security headers.
- [ ] Add request-size limits, schema validation, abuse controls, structured redacted logs, and audit events.
- [ ] Document SQLite backup/restore, migration, recovery-point objective, and recovery-time objective.
- [ ] Keep sync secrets server-only; rotate secrets and fail closed when peer authentication is misconfigured.

## Priority 1 — enterprise usability
- [ ] Add tenant-aware product catalog and RFQ workflows without cross-tenant data leakage.
- [ ] Add pagination/filtering and explicit loading, empty, error, and retry states.
- [ ] Add keyboard navigation, accessible labels, focus management, and automated accessibility checks.
- [ ] Add API contract compatibility tests and versioning policy for Web/Mobile/Desktop.
- [ ] Add observability: health/readiness distinction, request correlation IDs, latency/error metrics, and redaction checks.

## Priority 2 — delivery
- [ ] Pin and review dependency updates; run dependency, secret, and static-analysis scans in CI.
- [ ] Build immutable artifacts with provenance/SBOM where supported.
- [ ] Deploy to staging, run smoke tests, and require human approval for production promotion.
- [ ] Document rollback, incident response, and release ownership.

## Release gates
Do not use real customer data or claim enterprise/regulatory compliance until security review, privacy/retention decisions, backup recovery testing, and production deployment checks are complete. CI passing only demonstrates the checks configured in CI.
