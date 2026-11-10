# EVIDENCE-RECONCILIATION-001 — Source and Test Evidence Register

**Version:** 1.0  
**Status:** READ-ONLY SOURCE RECONCILIATION COMPLETE — REVIEW LIMITATIONS OPEN  
**Audit date:** 2026-11-10  
**Execution target:** GitHub Connector only  
**Code/database mutation:** NONE

## 1. Purpose and evidence standard

This register replaces unqualified summaries with source-pinned references for IRP-P0-001, UI-API-CONTRACT-MATRIX-001, UI-NEGATIVE-ACCESS-TEST-001, and SCHEMA-API-PARITY-REVIEW-001.

Evidence classes:
- **SOURCE:** direct repository content at the stated commit.
- **TEST-SOURCE:** test definition and assertions exist; this does not prove that the test ran.
- **CI-RUN:** execution evidence tied to its exact branch and SHA.
- **LIVE/DB:** runtime or physical database evidence. Source code alone cannot establish this class.

A Git blob SHA identifies the exact file content. Line anchors refer to the repository commit stated in the same row.

## 2. Repository baselines

| Platform | Repository | Branch | Commit SHA | Scope |
|---|---|---|---|---|
| Web | muchlisbstg/export-client-web-sync | main | `836821995c58293edadc982ae89f5519e1d4076b` | Audited source baseline |
| Mobile | muchlisbstg/export-client-mobile-sync | main | `0a3c595c6697f56d0cef8536c3b93c3886cc5ab1` | Audited source baseline |
| Desktop | muchlisbstg/export-client-desktop-sync | main | `3cb71f658712ee6c2b60d33b339a9600c09f15d6` | Audited source baseline |
| Mobile authorization target | muchlisbstg/export-client-mobile-sync | docs/p0-mobile-auth-reconciliation | `df929720ecec6e8eade19a532287c222b8e54945` | Approved architecture document; not implementation |

These baselines were re-read from GitHub branch references during this reconciliation. They are snapshots, not a claim that branches cannot advance afterward.

## 3. Mobile source evidence

| Evidence ID | Source and exact reference | Blob SHA | Finding supported |
|---|---|---|---|
| EV-MOB-001 | [server/index.mjs#L99-L100](https://github.com/muchlisbstg/export-client-mobile-sync/blob/0a3c595c6697f56d0cef8536c3b93c3886cc5ab1/server/index.mjs#L99-L100), [#L296-L307](https://github.com/muchlisbstg/export-client-mobile-sync/blob/0a3c595c6697f56d0cef8536c3b93c3886cc5ab1/server/index.mjs#L296-L307), [#L322-L340](https://github.com/muchlisbstg/export-client-mobile-sync/blob/0a3c595c6697f56d0cef8536c3b93c3886cc5ab1/server/index.mjs#L322-L340), [#L385-L408](https://github.com/muchlisbstg/export-client-mobile-sync/blob/0a3c595c6697f56d0cef8536c3b93c3886cc5ab1/server/index.mjs#L385-L408) | `e22751d4c976935f8ab5bb29decb6f1043868a53` | Mobile config still reads `SINGLE_ENTERPRISE_ID`; exposes `/api/v1/enterprise/session`; delegates active tenant enforcement to `requireActiveEnterprise`; tenant sync returns 410; transaction create and status update return 410. |
| EV-MOB-002 | [server/authorization.mjs#L17-L78](https://github.com/muchlisbstg/export-client-mobile-sync/blob/0a3c595c6697f56d0cef8536c3b93c3886cc5ab1/server/authorization.mjs#L17-L78) | `2996a3fe928d699c61ddbb13d0fec88f377ffa6f` | Current Mobile authorization helper remains enterprise/single-enterprise-oriented; it is not evidence of the approved identity + tenant membership + transaction participant architecture being implemented. |
| EV-MOB-003 | [server/index.mjs#L340](https://github.com/muchlisbstg/export-client-mobile-sync/blob/0a3c595c6697f56d0cef8536c3b93c3886cc5ab1/server/index.mjs#L340), [server/supply-chain-routes.mjs#L299-L300](https://github.com/muchlisbstg/export-client-mobile-sync/blob/0a3c595c6697f56d0cef8536c3b93c3886cc5ab1/server/supply-chain-routes.mjs#L299-L300), [server/index.mjs#L388-L408](https://github.com/muchlisbstg/export-client-mobile-sync/blob/0a3c595c6697f56d0cef8536c3b93c3886cc5ab1/server/index.mjs#L388-L408) | `ae4ccb7f54bb59aed4fb62e13f00e4c19a81bd85` and `e22751d4c976935f8ab5bb29decb6f1043868a53` | Duplicate GET transaction list/detail registrations are present. `registerSupplyChainRoutes` is called before the later registrations in `server/index.mjs`; the supply-chain handlers respond directly. Route-order/handler ownership must be covered by a deterministic test. |
| EV-MOB-004 | [scripts/migrate-tenant-isolation.mjs#L7-L9](https://github.com/muchlisbstg/export-client-mobile-sync/blob/0a3c595c6697f56d0cef8536c3b93c3886cc5ab1/scripts/migrate-tenant-isolation.mjs#L7-L9), [#L85-L160](https://github.com/muchlisbstg/export-client-mobile-sync/blob/0a3c595c6697f56d0cef8536c3b93c3886cc5ab1/scripts/migrate-tenant-isolation.mjs#L85-L160), [package.json](https://github.com/muchlisbstg/export-client-mobile-sync/blob/0a3c595c6697f56d0cef8536c3b93c3886cc5ab1/package.json) | `6d75a9501a5741e46f585343fd47593aecb19c58`; package blob `bcfae9e438c701576b19b831fece71048c53f9a4` | Migration script exists and has an explicit CLI path. Package startup uses `node server/index.mjs` for `dev:api`; no migration invocation is evidenced in that startup path. This is a source-path finding, not proof of a deployed runtime's entrypoint. |
| EV-MOB-005 | [docs/p0-source-schema-reconciliation-2026-11-04.md#L41-L45](https://github.com/muchlisbstg/export-client-mobile-sync/blob/0a3c595c6697f56d0cef8536c3b93c3886cc5ab1/docs/p0-source-schema-reconciliation-2026-11-04.md#L41-L45), [#L74-L80](https://github.com/muchlisbstg/export-client-mobile-sync/blob/0a3c595c6697f56d0cef8536c3b93c3886cc5ab1/docs/p0-source-schema-reconciliation-2026-11-04.md#L74-L80) | `0f8045310c105c4b571f48e7bdb1a128d30714c6` | Source reconciliation records missing transaction-party bridge and four composite tenant/transaction/site integrity constraints. |
| EV-MOB-006 | [test/schema-reconciliation-contract.test.mjs#L1-L37](https://github.com/muchlisbstg/export-client-mobile-sync/blob/0a3c595c6697f56d0cef8536c3b93c3886cc5ab1/test/schema-reconciliation-contract.test.mjs#L1-L37) | `4e9ccbecff425864d3fe4ba967c565b0909be6ad` | Test source asserts a read-only schema inspector reports exactly five findings. It does not, by itself, prove execution on this main SHA. |
| EV-MOB-007 | [docs/p0-api-endpoint-authorization-matrix.md#L1-L27](https://github.com/muchlisbstg/export-client-mobile-sync/blob/0a3c595c6697f56d0cef8536c3b93c3886cc5ab1/docs/p0-api-endpoint-authorization-matrix.md#L1-L27) | `7e8e886ca24ff6d32a7f36357f251ebeede0b9e7` | Historical route inventory says duplicate transaction GET handlers were removed, but the source files at the audited main SHA still contain both registrations (EV-MOB-003). The source-pinned finding takes precedence; this inventory must be refreshed. |

### 3.1 Mobile authorization target

[AUTH-MOBILE-RECONCILIATION-001](https://github.com/muchlisbstg/export-client-mobile-sync/blob/docs/p0-mobile-auth-reconciliation/docs/architecture/AUTH-MOBILE-RECONCILIATION-001.md) is approved as an architecture baseline at commit `df929720ecec6e8eade19a532287c222b8e54945` (blob `b71aef6e5d85f8bc043a72145cd7d76a6a3fd029`). Its metadata explicitly says implementation authorization is not granted. Its NEG-001–NEG-030 and POS-001–POS-012 are architecture-level test contracts, not execution results.

## 4. Web and Desktop source evidence

| Evidence ID | Source and exact reference | Blob SHA | Finding supported |
|---|---|---|---|
| EV-WEB-001 | [server/index.ts#L116-L123](https://github.com/muchlisbstg/export-client-web-sync/blob/836821995c58293edadc982ae89f5519e1d4076b/server/index.ts#L116-L123), [#L186-L245](https://github.com/muchlisbstg/export-client-web-sync/blob/836821995c58293edadc982ae89f5519e1d4076b/server/index.ts#L186-L245) | `0b58322906b79c7a9f318e01b9f77670daac28bb` | Web has tenant readiness checks and tenant/transaction routes in source; source presence is not proof of runtime schema readiness or full authorization parity. |
| EV-WEB-002 | [docs/openapi.yaml#L12-L116](https://github.com/muchlisbstg/export-client-web-sync/blob/836821995c58293edadc982ae89f5519e1d4076b/docs/openapi.yaml#L12-L116) | `cf1853fc66519974581fe87c72a62a23e2ca19c0` | OpenAPI lists health, products, inquiries, tracking, and inquiry sync; it does not describe tenant/transaction routes visible in server source. |
| EV-WEB-003 | [scripts/migrate-tenant-isolation.mjs](https://github.com/muchlisbstg/export-client-web-sync/blob/836821995c58293edadc982ae89f5519e1d4076b/scripts/migrate-tenant-isolation.mjs), [package.json](https://github.com/muchlisbstg/export-client-web-sync/blob/836821995c58293edadc982ae89f5519e1d4076b/package.json) | `1bcf7a78fc57e8b8632975613a5bb4308a176dd5`; package blob `9b16f2f2ddb14f6629d9e866b5d2c8520dd1254b` | Migration script and API start scripts exist; package scripts do not establish automatic invocation of tenant migration on API startup. |
| EV-DESK-001 | [electron/main.ts#L126](https://github.com/muchlisbstg/export-client-desktop-sync/blob/3cb71f658712ee6c2b60d33b339a9600c09f15d6/electron/main.ts#L126), [scripts/migrate-tenant-isolation.mjs](https://github.com/muchlisbstg/export-client-desktop-sync/blob/3cb71f658712ee6c2b60d33b339a9600c09f15d6/scripts/migrate-tenant-isolation.mjs), [package.json](https://github.com/muchlisbstg/export-client-desktop-sync/blob/3cb71f658712ee6c2b60d33b339a9600c09f15d6/package.json) | `ec60fdae53413bf555cb971c1bd40adf2b27c016`; migration blob `1bcf7a78fc57e8b8632975613a5bb4308a176dd5`; package blob `c73aaf127b468ce4b0e0eef2008872596905097b` | Desktop uses an Electron userData SQLite path and has migration/test scripts. Package scripts do not prove an application startup migration path. |

## 5. Test-suite crosswalk reconciliation

Two distinct test namespaces must remain distinguishable:

- Architecture baseline: NEG-001–NEG-030 and POS-001–POS-012 in AUTH-MOBILE-RECONCILIATION-001.
- Integrated cross-platform suite: NAX-001–NAX-042 and PAX-001–PAX-012 in UI-NEGATIVE-ACCESS-TEST-001 after this reconciliation.

The NAX suite is an expanded integrated suite, not a renumbering or replacement of the architecture NEG suite. The crosswalk is maintained in UI-NEGATIVE-ACCESS-TEST-001. No test is marked passed solely because its scenario appears in either document.

## 6. Confirmed review findings and severity

| Finding | Severity | Evidence | Review disposition |
|---|---|---|---|
| Mobile remains single-enterprise-oriented, not aligned to approved multi-tenant target | Critical | EV-MOB-001, EV-MOB-002, EV-ARCH target | Confirmed source blocker |
| Mobile transaction create/status and tenant sync return 410 | Critical / High | EV-MOB-001 | Confirmed endpoint status |
| Duplicate Mobile transaction GET route registrations | High | EV-MOB-003 | Confirmed source discrepancy; route-order test required |
| Five composite integrity gaps | Critical | EV-MOB-005, EV-MOB-006 | Confirmed source-level gaps |
| Runtime migration invocation is not evidenced in Mobile startup scripts | Critical | EV-MOB-004 | Startup-path proof required |
| Web OpenAPI omits source-visible tenant/transaction endpoints | High | EV-WEB-001, EV-WEB-002 | Contract documentation drift confirmed |
| Physical deployed schema, migration history, and RLS are not established by these source references | Critical if the DB is the authoritative backend | EV-MOB-005; prior staging inspection | Runtime/DB evidence remains unavailable |
| Per-screen API traceability is only grouped by platform/range in current matrix | High | UI-API-CONTRACT-MATRIX-001 §7 | 38 individual screen-to-endpoint mappings remain a review gap |

## 7. Evidence limits

- Source evidence proves what is present in the pinned repository files, not what is deployed.
- Test-source evidence proves assertions are defined, not that they passed.
- Candidate-branch CI runs remain candidate-branch evidence and must not be attributed to main.
- The Mobile API matrix document contains a historical route-count statement inconsistent with the current pinned source; it is not authoritative for that discrepancy.
- Supabase status, physical schema, RLS, live login, and production E2E require fresh authorized runtime evidence. They are not certified by this source-only reconciliation.
- No local checkout, terminal, code edit, database inspection, migration, PR, merge, or deployment was performed.

## 8. Next review gate

IRP-P0-001 may be submitted for human package approval only after the screen-to-API traceability gap is either completed or explicitly accepted as a deferred documentation item with an owner and scope boundary. OD-001–OD-010 and BLK-001–BLK-010 remain subsequent workstreams; this evidence register does not resolve them or authorize implementation.
