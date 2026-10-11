# Web platform readiness review — 2026-10-11

## Scope
This repository contains the web client, API, and a local SQLite database. The mobile and desktop services are separate peers, not a central production database.

## Verification checklist
- [ ] Run npm ci, npm test, npm run typecheck, and npm run build.
- [ ] Run the interoperability tests against the corresponding Mobile and Desktop revisions.
- [ ] Verify authentication and authorization for business-data endpoints.
- [ ] Require TLS for remote traffic; keep secrets in server-side environment configuration.
- [ ] Confirm backup/restore, monitoring, rollback, data retention, and incident-response procedures.
- [ ] Ensure local databases and customer data are excluded from source control and test artifacts.

## Release gate
Replication is append-only and conflicting payloads are not automatically resolved. Document how to inspect stalled outbox items and conflicts. This checklist is not a security audit or production-readiness certification. Do not use real customer data until the applicable controls have been reviewed.
