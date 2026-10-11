# Web platform hardening roadmap

**Review date:** 2026-10-11  
**Status:** Planning document for review; not a production-readiness attestation.

## Current shape
- React + Vite frontend; Express API; TypeScript; SQLite persistence.
- Local API default port: 4000; frontend dev server default port: 5173.
- Optional append-only peer replication to mobile and desktop backends.
- Existing commands documented in the repository: `npm test`, `npm run typecheck`, `npm run build`, and `npm run test:interop`.

## Priority work

### P0 — Before any real customer data
- Add a documented authentication and authorization design for customer, staff, and administrator roles; do not rely on tracking codes as authorization for sensitive records.
- Review all API routes for input validation, rate limits, object-level access checks, safe errors, and security headers.
- Require HTTPS/TLS for any non-loopback deployment and document trusted proxy configuration.
- Define privacy notice, data minimization, retention/deletion, export, backup, restore, and incident-response procedures.
- Define secret provisioning/rotation and verify secrets never appear in browser bundles, logs, test fixtures, or repository history.
- Review CORS, network binding, and deployment exposure; the development bind address must not imply a safe public production configuration.

### P1 — Reliability and release quality
- Add CI gates for tests, typecheck, production build, dependency/security scanning, and secret scanning.
- Test SQLite backup/restore and behavior under disk-full, process restart, and peer timeout conditions.
- Add structured, redacted logs and health/readiness checks; avoid logging inquiry contact details.
- Define schema migration and rollback policy before changing persistent data.
- Exercise the three-node interoperability harness in CI with synthetic data and temporary databases.

### P2 — Production deployment
- Document environment-specific configuration, TLS termination, firewall rules, health checks, monitoring, backup schedules, and rollback.
- Decide whether SQLite remains appropriate for the intended scale and hosting model; record the decision before migrating.
- Add release versioning and a deployment approval gate. No deployment is performed by this document.

## Acceptance checklist
- [ ] Threat model and data-flow diagram reviewed.
- [ ] Authentication and object-level authorization tests pass.
- [ ] Retention/deletion and backup-restore procedures are tested.
- [ ] CI results are green on the proposed change.
- [ ] Human reviewer approves production use.

## Guardrail
This roadmap does not certify the application as secure or production-ready. Until the P0 items are implemented and verified, use synthetic/demo data only.
