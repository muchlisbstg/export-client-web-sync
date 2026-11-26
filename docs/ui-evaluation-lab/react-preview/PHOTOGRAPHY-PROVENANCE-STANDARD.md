# Australian Halal Beef — Photography & Provenance Standard

## 1. Purpose and release boundary

This standard governs any photographic asset introduced into the public Australian Halal Beef website preview. Photography may improve buyer confidence, but an image is not evidence of origin, halal status, supplier approval, product grade, establishment approval, or export eligibility.

Current baseline: the preview contains 18 original SVG illustrations. They are illustrative assets, not documentary photographs. This document defines the acceptance process for future photographic replacements or additions. It does not assert that any real supplier, farm, abattoir, certification, or export approval has been verified.

## 2. Photography workstreams

| Workstream | Required subjects | Buyer-facing purpose | Evidence required before factual caption |
|---|---|---|---|
| Premium product | Ribeye, striploin, tenderloin, short ribs, mince; visible cut surface and marbling | Product presentation and catalogue differentiation | Product identity, cut specification, grade claim (if any), source batch or approved sample reference |
| Australian origin | NSW pasture, cattle landscape, farm exterior, regional landscape | Explain the intended Australian sourcing context | Exact location, property/supplier relationship, capture date, permission, and confirmation that the image represents the stated region |
| Processing and QA | Establishment exterior/interior, inspection, handling, quality-control activity | Explain operational capability | Establishment identity, operator permission, applicable approval scope, date, and confirmation that the pictured activity is representative |
| Halal assurance | Relevant documented process steps, segregated handling where applicable, audit/document context | Explain the assurance framework without overstating certification | Current certificate or authoritative evidence, issuing body, certificate holder, site, product/scope, validity dates, and approval to publish |
| Packaging and cold chain | Vacuum packaging, cartons, cold room, loading, reefer container | Show packaging and logistics handling | Actual operator/site relationship, date, packaging specification, temperature-control evidence for any temperature claim |
| Export logistics | Port, container handling, freight operations | Explain export workflow | Actual shipment/operator relationship and permission; do not imply a shipment occurred based only on a generic port photo |

## 3. Rights and provenance gate

Every candidate image must have a completed record before it is merged or published. A filename, stock-site listing, or verbal assurance alone is insufficient.

Required metadata:
- Asset ID and proposed repository path.
- Original creator/photographer and source URL or delivery reference.
- Capture date and location (at least state/region; exact coordinates should remain private unless disclosure is approved).
- Rights holder and the party granting permission.
- Licence/contract type, permitted media, territory, term, modification/cropping rights, attribution requirements, and commercial-use permission.
- Model release for identifiable people; property/location release where required.
- Confirmation that no third-party logos, confidential documents, customer details, vehicle registrations, or sensitive facility information are exposed.
- Factual subject description and the evidence supporting any associated caption.
- Reviewer, review date, and approval status.

Acceptable routes:
1. Company-owned photography with written assignment/licence and documented permission from the property or facility owner.
2. Commissioned photography with a signed agreement explicitly covering commercial website use, worldwide territory, duration, edits/crops, and derivative formats.
3. Stock photography only where the licence permits commercial website use and the image is clearly treated as illustrative stock—not as proof of the company’s own farm, facility, product, supplier, or shipment.

Do not use images copied from search results, social media, competitor websites, news articles, or supplier websites without explicit rights clearance. Do not assume that attribution alone grants permission.

## 4. Factual-claim controls

- Do not label a landscape as a company farm or supplier region until the relationship is documented.
- Do not label a facility as the company’s abattoir, processing partner, or approved establishment without current documentary confirmation and permission.
- Do not depict a generic halal-related image as proof of halal certification or a certified process.
- Do not state a product grade, breed, origin, cut specification, or marbling score based solely on visual appearance.
- Do not imply that a stock image depicts actual company inventory, packaging, cold storage, or shipment.
- If evidence is absent, use neutral wording such as “illustrative image” or omit the factual caption.
- Halal status must remain “Not verified in this preview” until valid, in-scope evidence is reviewed and approved for publication.

## 5. Creative and technical direction

Visual direction:
- Premium, editorial, restrained, and credible for global B2B buyers.
- Prioritise detailed premium beef cuts and marbling, clean packaging, landscape context, and operational detail.
- No animal heads and no identifiable human faces. Prefer product-only framing, hands without identifying features, or people photographed from behind.
- Avoid graphic slaughter imagery, distressing animal imagery, staged certification scenes, and misleading composite images.
- Maintain the approved brand palette in surrounding UI; do not force colour overlays that distort product appearance.

Capture/delivery guidance:
- Supply original high-resolution masters plus web derivatives.
- Prefer landscape 16:9 or 3:2 for hero/editorial modules; 4:5 or 1:1 for catalogue cards.
- Keep critical product detail inside a safe crop area.
- Use descriptive filenames and meaningful alt text; decorative images should use empty alt text where appropriate.
- Export responsive WebP/AVIF derivatives where supported, retain an approved source master, and avoid shipping oversized originals to the browser.
- Check image sharpness, colour fidelity, compression artefacts, crop consistency, and mobile rendering.
- Do not place important text inside an image.

## 6. Acceptance checklist

An image can be marked **Approved for preview** only when all applicable checks pass:

- [ ] Source and creator identified.
- [ ] Commercial-use rights and required releases documented.
- [ ] Subject, location, and date recorded.
- [ ] Any factual caption is supported by evidence and approved.
- [ ] No unsupported halal, origin, facility, grade, supplier, or export claim.
- [ ] No prohibited identifiable face or unauthorised third-party material.
- [ ] Image meets quality, crop, accessibility, and performance requirements.
- [ ] Asset register updated with rights/provenance reference and reviewer.
- [ ] Browser test confirms image loads and has appropriate alternative text.

Statuses:
- **Proposed** — candidate identified; not cleared for use.
- **Rights pending** — source known; permission or licence incomplete.
- **Evidence pending** — rights cleared; factual claim not yet substantiated.
- **Approved for preview** — rights and all applicable content checks passed.
- **Rejected/expired** — rights invalid, evidence inadequate, or permission expired.

## 7. Asset register extension

For each future photograph, extend the asset register with:
`asset_id`, `file_path`, `workstream`, `creator`, `source_reference`, `capture_date`, `location_scope`, `rights_holder`, `licence_type`, `commercial_use`, `territory`, `term_end`, `release_reference`, `claim_evidence_reference`, `caption_status`, `reviewer`, `reviewed_at`, and `approval_status`.

Do not store confidential contracts, personal contact details, exact private farm coordinates, or certificate files in a public repository. Store only non-sensitive references and publication-safe status metadata; retain source evidence in an access-controlled company repository.

## 8. Current status and next gate

- Existing 18 SVG assets remain the approved illustrative baseline.
- No documentary photography is asserted as sourced, licensed, or approved by this standard.
- No SVG should be silently relabelled as a real farm, product batch, processing facility, halal operation, or shipment.
- Next gate: obtain company-owned/commissioned photo candidates and rights records; review each candidate against this standard; then integrate only approved assets on a feature branch and run image, accessibility, responsive, and production-build checks.
