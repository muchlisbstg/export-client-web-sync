# Australian Halal Beef — Visual Asset Register

## Scope

The 18 assets are original, locally hosted SVG illustrations for the isolated public website preview. They are not documentary photographs and do not verify actual farms, suppliers, processing establishments, certification, product grades, or export eligibility.

## Assets

| Asset | Intended placement | Evidence status |
|---|---|---|
| `hero-premium-cut.svg` | Landing hero | Original illustrative artwork |
| `wagyu-ribeye.svg` | Product catalogue | Illustrative product visual |
| `wagyu-striploin.svg` | Product catalogue | Illustrative product visual |
| `angus-tenderloin.svg` | Product catalogue | Illustrative product visual |
| `angus-striploin.svg` | Product catalogue | Illustrative product visual |
| `beef-short-ribs.svg` | Product catalogue | Illustrative product visual |
| `premium-beef-mince.svg` | Product catalogue | Illustrative product visual |
| `nsw-landscape-illustrative.svg` | Australian origin section | Regional illustration, not a farm location |


| `nsw-pasture-detail.svg` | Origin supporting visual | Regional illustration, not a supplier location |
| `quality-grading.svg` | Product quality assurance card | Process illustration, not a grading record |
| `halal-assurance-illustration.svg` | Halal assurance card | Document illustration, not a halal certificate |
| `export-compliance-illustration.svg` | Export compliance card | Document illustration, not export approval |
| `processing-facility-illustration.svg` | Buyer journey / processing visual | Generic facility illustration, not an actual establishment |
| `vacuum-packaging-illustration.svg` | Buyer journey / packaging visual | Generic packaging illustration |
| `export-carton-illustration.svg` | Buyer journey / order visual | Generic export carton illustration |
| `cold-storage-illustration.svg` | Origin supporting visual | Generic cold-storage illustration |
| `reefer-container-illustration.svg` | Buyer journey / shipment visual | Generic refrigerated container illustration |
| `global-shipping-port-illustration.svg` | Closing CTA / logistics visual | Generic shipping-port illustration |

## Implementation

- Assets are stored in `public/images/` and referenced by root-relative paths.
- Hero image uses eager loading priority; product and origin images use lazy loading.
- Product images have distinct files and descriptive alt text.
- SVG is used to keep these first-phase visuals crisp and lightweight.
- Browser tests verify all 18 images load with non-zero natural dimensions.

## Remaining photography phase

Replace or complement these illustrations with licensed, rights-cleared, authentic photography when the company can provide evidence and permissions for:
1. Premium beef cuts and marbling.
2. NSW landscapes and actual supply regions.
3. Processing and quality-control facilities.
4. Packaging, cold storage and export logistics.

Do not publish an image as evidence of a named facility, halal process, supplier relationship or origin unless its provenance and usage rights are verified.

## External temporary illustration candidates — not integrated

The following assets were identified during the temporary-asset review. They are **proposed candidates only**; none is included in the website bundle by this record.

| Candidate | Source | Published licence / terms | Intended use | Status / limitation |
|---|---|---|---|---|
| Fresh Raw Beef Steaks | https://freesvg.org/fresh-raw-beef-steaks | FreeSVG page states Public Domain / CC0, commercial use permitted, no attribution required | Catalogue editorial accent | Proposed; visual style must be reviewed against the premium brand direction; downloaded file and SVG safety inspection are still pending |
| Beef Cuts | https://freesvg.org/beef-cuts | FreeSVG page states Public Domain / CC0, commercial use permitted, no attribution required | Educational cut reference | Proposed; verify diagram accuracy and visual legibility before use; downloaded file and SVG safety inspection are pending |
| Pallet stretch wrap stack | https://liniqo.com/packs/logistics-and-supply-chain/ | Liniqo states free for commercial use without attribution; standalone redistribution is prohibited | Packaging / dispatch | Proposed; exact SVG file has not been obtained or inspected |
| Semi truck with trailer | https://liniqo.com/packs/logistics-and-supply-chain/ | Liniqo states free for commercial use without attribution; standalone redistribution is prohibited | Ground logistics | Proposed; exact SVG file has not been obtained or inspected |
| Loading dock bay doors | https://liniqo.com/packs/logistics-and-supply-chain/ | Liniqo states free for commercial use without attribution; standalone redistribution is prohibited | Processing / dispatch context | Proposed; exact SVG file has not been obtained or inspected |
| Cold chain reefer container | https://liniqo.com/packs/logistics-and-supply-chain/ | Liniqo states free for commercial use without attribution; standalone redistribution is prohibited | Cold-chain / export logistics | Proposed; exact SVG file has not been obtained or inspected |

### Integration gate for external candidates

Before any candidate is copied into `public/images/`:
- Obtain the actual source file from the official provider page.
- Inspect SVG markup for scripts, event handlers, external references, embedded raster payloads, and excessive complexity.
- Confirm that the downloaded file corresponds to the reviewed asset and preserve the provider's licence/terms reference.
- Recolour only where permitted and preserve product colour fidelity.
- Add descriptive alt text and a browser image-load test.
- Change status to **Approved for preview** only after rights, file integrity, visual quality, accessibility, and build checks pass.

These candidates are not evidence of Australian origin, a company facility, product grade, supplier relationship, halal certification, or an actual shipment. Existing 18 original SVG illustrations remain the current website baseline.
