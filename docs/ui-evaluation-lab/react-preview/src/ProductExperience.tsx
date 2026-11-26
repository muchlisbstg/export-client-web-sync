import { useEffect, useMemo, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";

type Product = {
  id: string;
  name: string;
  category: "Wagyu" | "Angus" | "Beef cuts";
  cut: string;
  description: string;
  storage: ("Chilled" | "Frozen")[];
  grade: string;
  pack: string;
  buyerUse: string;
  image: string;
};

const catalogue: Product[] = [
  { id: "AHB-P-001", name: "Wagyu Ribeye", category: "Wagyu", cut: "Ribeye", description: "A premium centrepiece cut with trimming, portioning and final grade agreed in the buyer specification.", storage: ["Chilled", "Frozen"], grade: "To be confirmed by written specification", pack: "Vacuum pack / carton configuration by agreement", buyerUse: "Food service · premium retail", image: "wagyu-ribeye.svg" },
  { id: "AHB-P-002", name: "Wagyu Striploin", category: "Wagyu", cut: "Striploin", description: "A versatile loin cut with buyer-defined trimming, portioning and carton configuration.", storage: ["Chilled", "Frozen"], grade: "To be confirmed by written specification", pack: "Whole muscle / portioned by agreement", buyerUse: "Food service · premium retail", image: "wagyu-striploin.svg" },
  { id: "AHB-P-003", name: "Angus Tenderloin", category: "Angus", cut: "Tenderloin", description: "A tender loin cut with export specification, trim level and pack format agreed by quotation.", storage: ["Chilled", "Frozen"], grade: "To be confirmed by written specification", pack: "Whole / portioned by agreement", buyerUse: "Food service · premium retail", image: "angus-tenderloin.svg" },
  { id: "AHB-P-004", name: "Angus Striploin", category: "Angus", cut: "Striploin", description: "A loin cut with grade, chilled or frozen handling and delivery requirements confirmed per order.", storage: ["Chilled", "Frozen"], grade: "To be confirmed by written specification", pack: "Whole muscle / portioned by agreement", buyerUse: "Food service · retail", image: "angus-striploin.svg" },
  { id: "AHB-P-005", name: "Beef Short Ribs", category: "Beef cuts", cut: "Short ribs", description: "Bone-in or boneless style, rib count, trimming and pack size configured to buyer requirements.", storage: ["Frozen"], grade: "Product standard to be agreed", pack: "Bulk carton / food-service pack by agreement", buyerUse: "Food service · manufacturing", image: "beef-short-ribs.svg" },
  { id: "AHB-P-006", name: "Premium Beef Mince", category: "Beef cuts", cut: "Mince", description: "Fat percentage, grind profile and retail or food-service packaging specified in the offer.", storage: ["Frozen"], grade: "Lean point / fat ratio to be agreed", pack: "Bulk / retail-ready format by agreement", buyerUse: "Retail · food service · manufacturing", image: "premium-beef-mince.svg" },
];

const asset = (file: string) => `${import.meta.env.BASE_URL}images/${file}`;
const categories = ["All products", "Wagyu", "Angus", "Beef cuts"] as const;

function ProductExperience() {
  const [mount, setMount] = useState<HTMLElement | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof categories)[number]>("All products");
  const [storage, setStorage] = useState("All formats");
  const [sort, setSort] = useState("featured");
  const [selected, setSelected] = useState<string[]>([]);
  const [detail, setDetail] = useState<Product | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [showEnquiry, setShowEnquiry] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const section = document.querySelector<HTMLElement>("#products");
    if (!section) return;
    const root = document.createElement("div");
    root.className = "ahb-product-experience-root";
    const footnote = section.querySelector(".catalogue-footnote");
    section.insertBefore(root, footnote);
    section.classList.add("ahb-enhanced-products");
    setMount(root);
    return () => {
      section.classList.remove("ahb-enhanced-products");
      root.remove();
    };
  }, []);

  const visibleProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const result = catalogue.filter((product) =>
      (category === "All products" || product.category === category) &&
      (storage === "All formats" || product.storage.includes(storage as "Chilled" | "Frozen")) &&
      (!normalized || [product.id, product.name, product.category, product.cut, product.description, product.buyerUse].join(" ").toLowerCase().includes(normalized))
    );
    if (sort === "name") result.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "category") result.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
    return result;
  }, [category, query, sort, storage]);

  function toggleCompare(id: string) {
    setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : current.length < 3 ? [...current, id] : current);
  }

  function openDetails(product: Product) {
    setDetail(product);
    setShowEnquiry(false);
    setNotice("");
  }

  function submitEnquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("Preview enquiry captured in this browser session only. No data was transmitted, stored or converted into a quotation.");
  }

  const comparison = catalogue.filter((product) => selected.includes(product.id));

  if (!mount) return null;
  return createPortal(
    <div className="ahb-product-experience">
      <div className="ahb-catalogue-controls">
        <label className="ahb-search"><span aria-hidden="true">⌕</span><input aria-label="Search product catalogue" placeholder="Search product, cut or use" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
        <label className="ahb-filter"><span>Category</span><select aria-label="Filter by category" value={category} onChange={(event) => setCategory(event.target.value as (typeof categories)[number])}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="ahb-filter"><span>Handling</span><select aria-label="Filter by handling" value={storage} onChange={(event) => setStorage(event.target.value)}><option>All formats</option><option>Chilled</option><option>Frozen</option></select></label>
        <label className="ahb-filter"><span>Sort</span><select aria-label="Sort products" value={sort} onChange={(event) => setSort(event.target.value)}><option value="featured">Featured</option><option value="name">Name A–Z</option><option value="category">Category</option></select></label>
      </div>
      <div className="ahb-catalogue-summary" aria-live="polite"><span><strong>{visibleProducts.length}</strong> product ranges</span><span>Illustrative catalogue · specifications confirmed by quotation</span></div>
      <div className="ahb-product-grid">
        {visibleProducts.map((product) => (
          <article className="ahb-product-card" key={product.id}>
            <div className="ahb-product-image"><img src={asset(product.image)} alt={`${product.name} illustrative product visual`} loading="lazy" decoding="async" /><span>ILLUSTRATIVE VISUAL</span></div>
            <div className="ahb-product-card-content">
              <div className="ahb-product-meta"><span>{product.id}</span><span>{product.category.toUpperCase()}</span></div>
              <h3>{product.name}</h3>
              <p>{product.description}</p>
              <div className="ahb-product-tags">{product.storage.map((format) => <span key={format}>{format}</span>)}<span>{product.cut}</span></div>
              <div className="ahb-product-actions"><button type="button" className="ahb-detail-button" onClick={() => openDetails(product)}>View specifications <span>↗</span></button><label className="ahb-compare-check"><input type="checkbox" checked={selected.includes(product.id)} onChange={() => toggleCompare(product.id)} disabled={!selected.includes(product.id) && selected.length >= 3} /> Compare</label></div>
            </div>
          </article>
        ))}
      </div>
      {visibleProducts.length === 0 && <div className="ahb-empty-state"><strong>No matching product ranges</strong><p>Adjust your search or filters to broaden the catalogue results.</p><button type="button" onClick={() => { setQuery(""); setCategory("All products"); setStorage("All formats"); }}>Clear filters</button></div>}
      <div className="ahb-catalogue-disclosure">All product records, specifications and visuals in this preview are illustrative. Origin, grade, halal certification, establishment eligibility, availability, price and export market access require current documentary verification before commercial use.</div>

      {selected.length > 0 && <div className="ahb-compare-bar" role="region" aria-label="Product comparison selection"><span><strong>{selected.length}</strong> of 3 selected for comparison</span><button type="button" onClick={() => setShowComparison(true)} disabled={selected.length < 2}>Compare products</button><button type="button" className="ahb-clear-compare" onClick={() => setSelected([])}>Clear</button></div>}

      {detail && <div className="ahb-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setDetail(null); }}>
        <section className="ahb-product-dialog" role="dialog" aria-modal="true" aria-labelledby="ahb-detail-title">
          <div className="ahb-dialog-heading"><div><span className="ahb-dialog-kicker">PRODUCT SPECIFICATION · {detail.id}</span><h2 id="ahb-detail-title">{detail.name}</h2><p>{detail.description}</p></div><button type="button" aria-label="Close product details" onClick={() => setDetail(null)}>×</button></div>
          {!showEnquiry ? <>
            <div className="ahb-spec-grid">
              <div><span>Product family</span><strong>{detail.category}</strong></div><div><span>Primary cut</span><strong>{detail.cut}</strong></div>
              <div><span>Handling options</span><strong>{detail.storage.join(" / ")}</strong></div><div><span>Grade / marbling</span><strong>{detail.grade}</strong></div>
              <div><span>Packaging</span><strong>{detail.pack}</strong></div><div><span>Buyer channel</span><strong>{detail.buyerUse}</strong></div>
              <div><span>Origin & provenance</span><strong>Documentary evidence required</strong></div><div><span>Halal assurance</span><strong>Certificate and scope verification required</strong></div>
            </div>
            <div className="ahb-spec-note"><strong>Commercial control</strong><p>Final product grade, weight tolerance, temperature range, shelf life, packaging, minimum order quantity, lead time and destination eligibility must be agreed in a written offer. No live stock or price is represented here.</p></div>
            <div className="ahb-dialog-actions"><button type="button" className="ahb-secondary-action" onClick={() => { toggleCompare(detail.id); }}> {selected.includes(detail.id) ? "Remove from comparison" : "Add to comparison"}</button><button type="button" className="ahb-primary-action" onClick={() => setShowEnquiry(true)}>Configure buyer enquiry ↗</button></div>
          </> : <>
            <form className="ahb-enquiry-form" onSubmit={submitEnquiry}>
              <p className="ahb-form-intro">Configure a non-binding product enquiry. This preview does not send or retain the information.</p>
              <label>Destination market <input required placeholder="Country / destination port" /></label>
              <div className="ahb-form-row"><label>Estimated quantity <input required placeholder="e.g. 2,000 kg" /></label><label>Preferred handling <select defaultValue=""><option value="" disabled>Select format</option>{detail.storage.map((item) => <option key={item}>{item}</option>)}</select></label></div>
              <label>Packaging and cut requirements <textarea rows={3} placeholder="Portion size, trim, carton configuration, target delivery window" /></label>
              <button className="ahb-primary-action" type="submit">Save preview enquiry</button>
              {notice && <p className="ahb-enquiry-notice" role="status">{notice}</p>}
            </form>
          </>}
          <p className="ahb-modal-disclaimer">Illustrative product information only · Not a commercial offer or certification statement.</p>
        </section>
      </div>}

      {showComparison && <div className="ahb-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowComparison(false); }}><section className="ahb-compare-dialog" role="dialog" aria-modal="true" aria-labelledby="ahb-compare-title"><div className="ahb-dialog-heading"><div><span className="ahb-dialog-kicker">BUYER DECISION SUPPORT</span><h2 id="ahb-compare-title">Compare product ranges</h2><p>Compare indicative attributes before submitting a specification-led enquiry.</p></div><button type="button" aria-label="Close comparison" onClick={() => setShowComparison(false)}>×</button></div><div className="ahb-comparison-scroll"><table className="ahb-comparison-table"><thead><tr><th scope="col">Attribute</th>{comparison.map((product) => <th scope="col" key={product.id}>{product.name}</th>)}</tr></thead><tbody>{[["Product ID", (p: Product) => p.id], ["Category", (p: Product) => p.category], ["Cut", (p: Product) => p.cut], ["Handling", (p: Product) => p.storage.join(" / ")], ["Grade", (p: Product) => p.grade], ["Packaging", (p: Product) => p.pack], ["Buyer channel", (p: Product) => p.buyerUse], ["Origin evidence", () => "Required before commercial claim"], ["Halal evidence", () => "Certificate and scope verification required"]].map(([label, value]) => <tr key={label as string}><th scope="row">{label as string}</th>{comparison.map((product) => <td key={product.id}>{(value as (p: Product) => string)(product)}</td>)}</tr>)}</tbody></table></div><div className="ahb-dialog-actions"><button type="button" className="ahb-secondary-action" onClick={() => setShowComparison(false)}>Back to catalogue</button><button type="button" className="ahb-primary-action" onClick={() => { setShowComparison(false); openDetails(comparison[0]); }}>Review selected product ↗</button></div><p className="ahb-modal-disclaimer">Comparison uses illustrative product attributes. Final specifications are subject to written confirmation.</p></section></div>}
    </div>,
    mount,
  );
}

export default ProductExperience;
