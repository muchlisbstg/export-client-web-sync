import { useMemo, useState, type FormEvent } from "react";

type Product = { id: string; name: string; category: string; cut: string; description: string; format: string };
const products: Product[] = [
  { id: "AHB-P-001", name: "Wagyu Ribeye", category: "Wagyu", cut: "Ribeye", description: "A premium centrepiece cut. Marble score, grade and weight range are confirmed in the formal specification.", format: "Chilled / frozen" },
  { id: "AHB-P-002", name: "Wagyu Striploin", category: "Wagyu", cut: "Striploin", description: "A versatile premium cut with buyer-defined portioning, trimming and carton configuration.", format: "Chilled / frozen" },
  { id: "AHB-P-003", name: "Angus Tenderloin", category: "Angus", cut: "Tenderloin", description: "A refined tender cut with export specifications and pack formats agreed by quotation.", format: "Chilled / frozen" },
  { id: "AHB-P-004", name: "Angus Striploin", category: "Angus", cut: "Striploin", description: "A premium loin cut with product grade, chilled/frozen handling and delivery terms confirmed per order.", format: "Chilled / frozen" },
  { id: "AHB-P-005", name: "Beef Short Ribs", category: "Beef cuts", cut: "Short ribs", description: "Cut style, bone-in specification, trimming and pack size configured to buyer requirements.", format: "Frozen" },
  { id: "AHB-P-006", name: "Premium Beef Mince", category: "Beef cuts", cut: "Mince", description: "Fat percentage, grind profile and retail or food-service packaging specified in the offer.", format: "Frozen" },
];
const categories = ["All cuts", "Wagyu", "Angus", "Beef cuts"];

function BrandMark() {
  return <a className="brand-mark" href="#home" aria-label="Australian Halal Beef home"><span className="brand-symbol">AHB</span><span className="brand-name">AUSTRALIAN<br/>HALAL BEEF</span></a>;
}
function CutArtwork({ index }: { index: number }) {
  return <div className={`cut-art cut-art-${index % 4}`} role="img" aria-label="Stylised premium beef cut and marbling illustration"><span className="cut-art-label">PREMIUM CUT</span><span className="cut-art-stamp">AHB</span></div>;
}
function App() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All cuts");
  const [selectedProduct, setSelectedProduct] = useState("General export enquiry");
  const [modalOpen, setModalOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);
  const filtered = useMemo(() => products.filter((p) =>
    (category === "All cuts" || p.category === category) &&
    `${p.name} ${p.cut} ${p.description}`.toLowerCase().includes(search.toLowerCase())
  ), [category, search]);
  function openRfq(product: string) { setSelectedProduct(product); setNotice(""); setModalOpen(true); }
  function submitRfq(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("Preview request captured locally. No information was transmitted and no quotation has been created.");
  }
  return <div className="site-shell">
    <div className="announcement"><span>AUSTRALIAN ORIGIN</span><i/> <span>HALAL INTEGRITY</span><i/> <span>GLOBAL B2B SUPPLY</span><span className="announcement-right">Trade enquiries welcome</span></div>
    <header className="site-header" id="home">
      <BrandMark />
      <button className="menu-toggle" aria-label="Toggle navigation" aria-expanded={mobileMenu} onClick={() => setMobileMenu(!mobileMenu)}>☰</button>
      <nav className={mobileMenu ? "main-nav nav-open" : "main-nav"} aria-label="Main navigation">
        <a href="#products" onClick={() => setMobileMenu(false)}>Our products</a>
        <a href="#origin" onClick={() => setMobileMenu(false)}>Australian origin</a>
        <a href="#assurance" onClick={() => setMobileMenu(false)}>Quality & halal</a>
        <a href="#process" onClick={() => setMobileMenu(false)}>How to order</a>
      </nav>
      <button className="header-cta" onClick={() => openRfq("General export enquiry")}>Request a quotation <span>↗</span></button>
    </header>

    <main>
      <section className="hero-section">
        <div className="hero-copy">
          <div className="eyebrow"><span/> PREMIUM AUSTRALIAN BEEF · GLOBAL MARKETS</div>
          <h1>Integrity in<br/><em>every cut.</em></h1>
          <p className="hero-lede">Premium beef cuts for discerning importers, distributors and food-service partners around the world.</p>
          <p className="hero-support">Australian origin. Halal integrity. Global excellence.</p>
          <div className="hero-actions"><a className="button-primary" href="#products">Explore our range <span>↓</span></a><button className="button-outline" onClick={() => openRfq("General export enquiry")}>Talk to our export team <span>↗</span></button></div>
          <div className="hero-proof"><span>01</span><div><strong>Built around buyer requirements</strong><small>Product, specification and destination-led quotations</small></div></div>
        </div>
        <div className="hero-visual">
          <div className="hero-image-art"><div className="hero-cut-shape"><span/></div><div className="hero-image-caption">SELECTED CUTS <b>·</b> PREMIUM MARBLING</div></div>
          <div className="hero-side-note">AUSTRALIA <span>—</span> THE SOURCE</div>
          <div className="hero-index">01 / 04</div>
        </div>
      </section>

      <section className="trust-strip" aria-label="Brand commitments"><div><span>01</span><strong>Australian provenance</strong><small>Evidence-led origin information</small></div><div><span>02</span><strong>Halal integrity</strong><small>Certification status disclosed transparently</small></div><div><span>03</span><strong>Export-ready approach</strong><small>Destination-specific requirements</small></div><div><span>04</span><strong>Buyer-led specification</strong><small>Commercial terms by quotation</small></div></section>

      <section className="products-section section-wrap" id="products">
        <div className="section-intro"><div><div className="eyebrow">THE PRODUCT COLLECTION</div><h2>Considered cuts.<br/><em>Exceptional standards.</em></h2></div><p>Explore our illustrative product range. Final grades, availability, pack formats and export eligibility are confirmed in a formal quotation for your destination market.</p></div>
        <div className="catalogue-toolbar"><label className="catalogue-search"><span>⌕</span><input aria-label="Search products" placeholder="Search cuts or products" value={search} onChange={e => setSearch(e.target.value)}/></label><div className="category-filters" aria-label="Product category">{categories.map(c=><button key={c} className={category===c?"category-chip active":"category-chip"} onClick={()=>setCategory(c)}>{c}</button>)}</div></div>
        <div className="catalogue-grid">{filtered.map((p,i)=><article className="catalogue-card" key={p.id}><CutArtwork index={products.indexOf(p)}/><div className="catalogue-card-body"><div className="product-kicker">{p.id} <span>·</span> {p.category.toUpperCase()}</div><h3>{p.name}</h3><div className="product-meta">{p.cut} <span>·</span> {p.format}</div><p>{p.description}</p><button className="product-cta" onClick={()=>openRfq(p.name)}>Request product quotation <span>↗</span></button></div></article>)}</div>
        {filtered.length===0&&<div className="no-results">No products match your search. Try another cut or category.</div>}
        <div className="catalogue-footnote">Product imagery and descriptions are illustrative. Commercial specifications and availability are subject to written confirmation.</div>
      </section>

      <section className="origin-section" id="origin"><div className="origin-image"><div className="landscape-sun"/><div className="landscape-ridge ridge-back"/><div className="landscape-ridge ridge-front"/><div className="origin-image-label">NEW SOUTH WALES <span>·</span> AUSTRALIA</div></div><div className="origin-copy"><div className="eyebrow">ROOTED IN AUSTRALIA</div><h2>From Australian landscapes<br/>to global tables.</h2><p>Our origin story is built around responsible production, careful processing and transparent export documentation. Regional context is presented separately from verified farm, facility and product provenance.</p><p className="origin-disclaimer">New South Wales regional illustration. Specific farm locations, establishment approvals and supply-chain relationships must be verified before publication as operational claims.</p><a className="text-link" href="#assurance">Discover our standards <span>→</span></a></div></section>

      <section className="assurance-section section-wrap" id="assurance"><div className="assurance-heading"><div className="eyebrow">CONFIDENCE THROUGH TRANSPARENCY</div><h2>Integrity is not a claim.<br/><em>It is demonstrated.</em></h2><p>Quality, halal and export information must be supported by current documents and verified against the relevant product, establishment and destination market.</p></div><div className="assurance-cards"><article><span className="assurance-number">A / 01</span><div className="assurance-icon">✳</div><h3>Halal assurance</h3><p>Certification body, scope, validity and establishment coverage are disclosed only after verification.</p><small>STATUS · NOT VERIFIED IN THIS PREVIEW</small></article><article><span className="assurance-number">A / 02</span><div className="assurance-icon">◇</div><h3>Product quality</h3><p>Grade, cut, weight, temperature and packing specifications are confirmed in the product offer.</p><small>STATUS · SAMPLE SPECIFICATIONS</small></article><article><span className="assurance-number">A / 03</span><div className="assurance-icon">◎</div><h3>Export compliance</h3><p>Market access, establishment eligibility and documentation depend on destination-specific approval.</p><small>STATUS · SUBJECT TO VERIFICATION</small></article></div></section>

      <section className="process-section" id="process"><div className="process-top"><div><div className="eyebrow">A CLEAR COMMERCIAL JOURNEY</div><h2>From first enquiry<br/><em>to confirmed order.</em></h2></div><p>A structured B2B process keeps specifications, commercial terms and buyer approvals clear at every stage.</p></div><div className="process-steps"><div><span>01</span><strong>Buyer enquiry</strong><p>Share product, volume, destination and specification requirements.</p></div><div><span>02</span><strong>Formal quotation</strong><p>Review pricing, validity, Incoterms and delivery assumptions.</p></div><div><span>03</span><strong>Contract & order</strong><p>Confirm agreed terms and documented order requirements.</p></div><div><span>04</span><strong>Export & shipment</strong><p>Follow verified documentation and shipment milestones.</p></div></div><button className="button-light" onClick={()=>openRfq("General export enquiry")}>Start a buyer enquiry <span>↗</span></button></section>

      <section className="closing-cta"><div><div className="eyebrow">LET'S BUILD A SUPPLY RELATIONSHIP</div><h2>Your market.<br/><em>Our commitment.</em></h2></div><div><p>Tell us what your business needs. Our export enquiry process starts with your product specification and destination market.</p><button className="button-primary" onClick={()=>openRfq("General export enquiry")}>Request a quotation <span>↗</span></button></div></section>
    </main>
    <footer className="site-footer"><BrandMark/><div className="footer-tagline">AUSTRALIAN ORIGIN.<br/>HALAL INTEGRITY.<br/>GLOBAL EXCELLENCE.</div><div className="footer-meta"><span>GLOBAL B2B ENQUIRIES</span><span>© 2026 AUSTRALIAN HALAL BEEF</span><small>Preview concept · No live ordering or certification registry connected</small></div></footer>

    {modalOpen&&<div className="rfq-overlay" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setModalOpen(false)}}><section className="rfq-dialog" role="dialog" aria-modal="true" aria-labelledby="rfq-title"><div className="dialog-top"><div><div className="eyebrow">GLOBAL TRADE ENQUIRY</div><h2 id="rfq-title">Request a quotation</h2></div><button className="dialog-close" aria-label="Close enquiry" onClick={()=>setModalOpen(false)}>×</button></div><form onSubmit={submitRfq}><label>Product of interest<input value={selectedProduct} readOnly/></label><label>Business email<input type="email" required placeholder="name@company.com"/></label><label>Destination market<input required placeholder="Country / destination port"/></label><label>Estimated volume<input required placeholder="e.g. 2,000 kg per month"/></label><label>Product requirements<textarea rows={3} placeholder="Cut, grade, chilled/frozen, packaging and delivery window"/></label><button className="button-primary submit-rfq" type="submit">Submit preview enquiry <span>↗</span></button>{notice&&<p className="rfq-notice" role="status">{notice}</p>}<p className="dialog-disclaimer">Demonstration only. This form does not transmit or store personal information, create an RFQ, or constitute a commercial offer.</p></form></section></div>}
  </div>;
}
export default App;
