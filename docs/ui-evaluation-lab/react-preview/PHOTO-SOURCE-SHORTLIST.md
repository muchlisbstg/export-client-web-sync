# Australian Halal Beef — Real Photography Shortlist

## Decision

The website direction is moving from original SVG artwork to real photography. This shortlist records public stock-photo candidates for a **temporary corporate preview only**. A stock image must never be presented as evidence of Australian origin, a named farm, company inventory, a processing establishment, halal certification, or an actual shipment.

**Integration status: PARTIAL — PREVIEW ONLY.** AHB-PHOTO-001 is used in the landing hero and AHB-PHOTO-002 in the origin section through official Pexels CDN URLs; neither is self-hosted. Both are explicitly disclosed as illustrative editorial stock, not AHB inventory, supplier or production evidence. Other candidates remain unintegrated.

## Candidate register

| Asset ID | Candidate / intended placement | Creator | Source page | Direct image URL (provider CDN) | Licence evidence / status |
|---|---|---|---|---|---|
| AHB-PHOTO-001 | Raw marbled Wagyu steak — hero/product editorial | Sydney Sang | https://www.pexels.com/photo/marbled-wagyu-beef-on-wooden-cutting-board-31406830/ | https://images.pexels.com/photos/31406830/pexels-photo-31406830.jpeg?auto=compress&w=1200 | Pexels photo page says Free; Pexels licence allows website use. Proposed; Japanese Wagyu context, never imply Australian origin or AHB inventory. |
| AHB-PHOTO-002 | Marbled Wagyu cut detail — product editorial | Sydney Sang | https://www.pexels.com/photo/close-up-of-marbled-wagyu-beef-on-cutting-board-31406832/ | https://images.pexels.com/photos/31406832/pexels-photo-31406832.jpeg?auto=compress&w=1200 | Pexels photo page labels it Free; proposed. Same photographer/collection; not evidence of a specific AHB SKU. |
| AHB-PHOTO-003 | Sliced marbled Wagyu — product detail | Sydney Sang | https://www.pexels.com/photo/close-up-of-sliced-marbled-wagyu-beef-on-wooden-board-31406812/ | https://images.pexels.com/photos/31406812/pexels-photo-31406812.jpeg?auto=compress&w=1200 | Pexels photo page labels it Free; proposed, illustrative stock only. |
| AHB-PHOTO-004 | Raw beef marbling macro — catalogue texture | Jonathan Borba | https://www.pexels.com/photo/close-up-of-raw-beef-texture-for-culinary-use-36319690/ | Pexels page labels it “Free to use” | Proposed. Generic raw beef texture; no grade, breed, cut, or origin claim. |
| AHB-PHOTO-005 | Vacuum-sealed raw marbled steak — packaging detail | Toxic Smoker | https://unsplash.com/photos/raw-marbled-steak-vacuum-sealed-in-plastic-TDwxg8i8lfE | — | Unverified: page fetch returned HTTP 401 in this review. Excluded from integration until source/licence and direct asset can be independently verified. |
| AHB-PHOTO-006 | Australian cattle pasture — origin context | Richard Pan | https://www.pexels.com/photo/cows-grazing-on-pasture-in-sunlight-17863792/ | https://images.pexels.com/photos/17863792/pexels-photo-17863792.jpeg?cs=srgb&fm=jpg | Pexels page labels it Free; captured in Wonthaggi, Victoria. Never caption as NSW or as an AHB supplier property. |
| AHB-PHOTO-007 | Generic stainless industrial equipment — operations context | Policarpo Brito | https://www.pexels.com/photo/stainless-steel-industrial-equipment-in-a-factory-33514501/ | Pexels page labels it free stock photo | Proposed. Not identified as a meat-processing establishment; use only as generic industrial context or omit. |
| AHB-PHOTO-008 | Generic cargo port — export logistics context | Diego F. Parra | https://www.pexels.com/photo/aerial-view-of-containers-and-machinery-in-a-port-24244234/ | Pexels page labels it free stock photo | Proposed. Port location/operator not established; use only as generic global-logistics stock imagery. |

## Rejected / restricted candidates

| Candidate | Reason |
|---|---|
| NSW cattle photograph with people visible | Excluded from current shortlist because the visible person may be identifiable and conflicts with the no-identifiable-faces creative rule. |
| Meat-processing photographs showing workers' faces | Do not use unless the crop removes identity without misrepresenting the scene, or a valid model release is documented. |
| Commercial supplier/competitor product photographs | Not used as source assets; brand ownership and permission are not established. |
| AI-generated stock images | Not classified as documentary photography; exclude from any factual or evidentiary use. |

## Pexels licence reference

Official licence: https://www.pexels.com/license/. At review time, Pexels states that photos are free to use on websites, attribution is not required, and modification is allowed. It prohibits implying endorsement by people/brands, selling unaltered copies, and redistributing stock files on stock/wallpaper platforms. Re-check the current licence before release. This does not remove privacy, trademark, misleading-caption, or factual-claim obligations.

## First preview integrations — AHB-PHOTO-001 and AHB-PHOTO-002

### AHB-PHOTO-002 — Gloucester, NSW cattle landscape

- Official Pexels page: https://www.pexels.com/photo/cattle-grazing-on-misty-morning-in-gloucester-29531064/
- Photographer: Diana Nguyen.
- Location stated on source page: Gloucester, New South Wales, Australia.
- Pexels source page marks the photo free to use; terms should be rechecked before production release.
- Direct image used: `https://images.pexels.com/photos/29531063/pexels-photo-29531063.jpeg?auto=compress&w=1600`.
- Integrated into the origin section with visible disclosure: regional editorial image only, not an AHB supplier farm or verified supply location.
- Browser test checks source, alt text, disclosure and successful decoding.
- Remote CDN dependency; not self-hosted. Do not imply AHB sourcing, farm relationship, certification or export approval.

### AHB-PHOTO-001 — hero editorial photo

- Integrated in `src/App.tsx` as the hero editorial photograph using the official Pexels CDN URL above.
- Visible caption and alt text disclose that this is illustrative stock photography, not AHB inventory or Australian origin.
- Browser test asserts the source, disclaimer, and successful image decoding. CI evidence is pending for the new commit.
- This is a remote CDN dependency, not a self-hosted asset. A locally optimized WebP derivative remains the preferred release approach.

## Required integration steps

1. Download the original image from the creator's official stock-photo page; do not use search thumbnails.
2. Verify the current licence terms at download time and retain a dated licence/source record.
3. Record the creator, source page, original file name, download date, licence, and intended preview use.
4. Check the photo for visible faces, third-party trademarks, confidential information, misleading context, and unsuitable subject matter.
5. Create optimized local WebP derivatives while retaining the source master and provenance record.
6. Add descriptive alt text and use captions that clearly identify stock imagery as illustrative where needed.
7. Replace the matching SVG only after the local photo file is present and visually reviewed.
8. Run image-load, responsive viewport, accessibility, TypeScript, browser, and production-build checks.
9. Update `IMAGE-ASSET-REGISTER.md` with file path, source, creator, licence, and approval status.

## Current release boundary

- The 18 original SVG illustrations remain in place for product cards and supporting sections; the hero now uses one illustrative stock photograph.
- The candidates above are not yet copied into the repository. The direct CDN URLs are recorded for traceability only; no remote hotlink has been integrated into the website.
- This shortlist does not establish any farm, supplier, establishment, halal certificate, product specification, or export approval.
- Any public factual caption requires separate company evidence and approval.
