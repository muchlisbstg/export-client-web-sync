# Australian Halal Beef — Visual Asset Register

## Scope

These are original, locally hosted SVG illustrations for the isolated public website preview. They are not documentary photographs and do not verify actual farms, suppliers, processing establishments, certification, product grades, or export eligibility.

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

## Implementation

- Assets are stored in `public/images/` and referenced by root-relative paths.
- Hero image uses eager loading priority; product and origin images use lazy loading.
- Product images have distinct files and descriptive alt text.
- SVG is used to keep these first-phase visuals crisp and lightweight.
- Browser tests verify all eight images load with non-zero natural dimensions.

## Remaining photography phase

Replace or complement these illustrations with licensed, rights-cleared, authentic photography when the company can provide evidence and permissions for:
1. Premium beef cuts and marbling.
2. NSW landscapes and actual supply regions.
3. Processing and quality-control facilities.
4. Packaging, cold storage and export logistics.

Do not publish an image as evidence of a named facility, halal process, supplier relationship or origin unless its provenance and usage rights are verified.
