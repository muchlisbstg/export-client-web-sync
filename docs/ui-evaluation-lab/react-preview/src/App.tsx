import { useMemo, useState, type FormEvent } from "react";

type View = "overview" | "products" | "rfqs" | "orders" | "documents" | "shipments";
type Product = { id: string; name: string; category: string; cut: string; description: string; availability: string };
type Rfq = { id: string; product: string; volume: string; destination: string; status: string; date: string; notes?: string };

const navigation: { id: View; label: string; icon: string }[] = [
  { id: "overview", label: "Overview", icon: "▦" },
  { id: "products", label: "Product catalogue", icon: "◈" },
  { id: "rfqs", label: "My RFQs", icon: "⇄" },
  { id: "orders", label: "Purchase orders", icon: "▤" },
  { id: "documents", label: "Documents", icon: "▧" },
  { id: "shipments", label: "Shipments", icon: "⌁" },
];

const pageCopy: Record<View, { eyebrow: string; title: string; description: string }> = {
  overview: { eyebrow: "BUYER ACCOUNT · DEMO", title: "Good afternoon, Pacific Gourmet.", description: "Your export procurement workspace at a glance." },
  products: { eyebrow: "DISCOVER OUR RANGE", title: "Product catalogue", description: "Explore illustrative product specifications and request an export quotation." },
  rfqs: { eyebrow: "COMMERCIAL ENQUIRIES", title: "My RFQs", description: "Create a demonstration request and review its local preview status." },
  orders: { eyebrow: "ORDER MANAGEMENT", title: "Purchase orders", description: "Review sample confirmed orders and buyer-visible commercial milestones." },
  documents: { eyebrow: "CONTRACT & TRADE RECORDS", title: "Documents", description: "Illustrative document register for buyer-authorized records." },
  shipments: { eyebrow: "LOGISTICS VISIBILITY", title: "Shipments", description: "Explore sample shipment milestones and tracking references." },
};

const products: Product[] = [
  { id: "AHB-P-001", name: "Wagyu Ribeye", category: "Wagyu", cut: "Ribeye · chilled / frozen", description: "Premium ribeye cut. Marble score and specification to be confirmed by quotation.", availability: "RFQ required" },
  { id: "AHB-P-002", name: "Wagyu Striploin", category: "Wagyu", cut: "Striploin · chilled / frozen", description: "Striploin portioning and pack format configurable to buyer requirements.", availability: "RFQ required" },
  { id: "AHB-P-003", name: "Angus Tenderloin", category: "Angus", cut: "Tenderloin · chilled / frozen", description: "Premium tenderloin cut. Final grade and weight range subject to offer.", availability: "RFQ required" },
  { id: "AHB-P-004", name: "Angus Striploin", category: "Angus", cut: "Striploin · chilled / frozen", description: "Export specification, carton weight and delivery window confirmed in quotation.", availability: "RFQ required" },
  { id: "AHB-P-005", name: "Beef Short Ribs", category: "Beef cuts", cut: "Short ribs · frozen", description: "Cut style, trimming and pack configuration specified per buyer RFQ.", availability: "RFQ required" },
  { id: "AHB-P-006", name: "Beef Mince", category: "Beef cuts", cut: "Mince · frozen", description: "Fat percentage, grind and pack size to be agreed before order confirmation.", availability: "RFQ required" },
];

const initialRfqs: Rfq[] = [
  { id: "AHB-RFQ-026", product: "Wagyu Ribeye", volume: "500 kg", destination: "Singapore", status: "Quotation received", date: "24 Nov 2026" },
  { id: "AHB-RFQ-024", product: "Angus Striploin", volume: "1,000 kg", destination: "UAE", status: "Under review", date: "21 Nov 2026" },
  { id: "AHB-RFQ-021", product: "Beef Short Ribs", volume: "750 kg", destination: "Japan", status: "Information required", date: "18 Nov 2026" },
];

function Metric({ label, value, foot }: { label: string; value: string; foot: string }) {
  return <section className="metric-card"><div className="metric-label">{label}</div><div className="metric-value">{value}</div><div className="metric-foot">{foot}</div></section>;
}
function Status({ children, tone = "green" }: { children: string; tone?: "green" | "blue" | "amber" }) {
  return <span className={`status status-${tone}`}>{children}</span>;
}
function Activity({ title, detail }: { title: string; detail: string }) {
  return <div className="activity"><span className="activity-dot" /><div><strong>{title}</strong><div className="subtle">{detail}</div></div></div>;
}
function PanelTitle({ title, meta }: { title: string; meta?: string }) {
  return <div className="panel-heading"><h2>{title}</h2>{meta && <span className="subtle">{meta}</span>}</div>;
}
function EmptyState({ title, description }: { title: string; description: string }) {
  return <div className="empty-state"><strong>{title}</strong><p>{description}</p></div>;
}

function Overview({ setView, rfqs }: { setView: (view: View) => void; rfqs: Rfq[] }) {
  return <>
    <div className="metric-grid">
      <Metric label="Open quotations" value="3" foot="2 awaiting buyer review" />
      <Metric label="Active purchase orders" value="2" foot="Across 2 product lines" />
      <Metric label="Shipments in transit" value="1" foot="Sample update · 2 days ago" />
      <Metric label="Documents requiring action" value="1" foot="Sample buyer review" />
    </div>
    <div className="content-grid">
      <section className="panel"><PanelTitle title="Recent purchase orders" meta="View all →" />
        <div className="table-scroll"><table><thead><tr><th>PO NUMBER</th><th>PRODUCT</th><th>STATUS</th><th>UPDATED</th></tr></thead><tbody>
          <tr><td>AHB-PO-2026-014</td><td>Wagyu Ribeye</td><td><Status>Confirmed</Status></td><td>24 Nov 2026</td></tr>
          <tr><td>AHB-PO-2026-011</td><td>Angus Striploin</td><td><Status tone="blue">In transit</Status></td><td>22 Nov 2026</td></tr>
        </tbody></table></div>
      </section>
      <section className="panel"><PanelTitle title="Recent activity" meta="Demo" />
        <Activity title="Quotation received" detail="RFQ-026 · Wagyu Ribeye" />
        <Activity title="Shipment milestone updated" detail="SH-2026-011 · Vessel departed" />
        <Activity title="Document uploaded" detail="PO-014 · Draft contract" />
      </section>
    </div>
    <section className="panel section-gap"><PanelTitle title="Latest RFQ activity" meta={`${rfqs.length} sample / demo records`} />
      <div className="table-scroll"><table><thead><tr><th>REFERENCE</th><th>PRODUCT</th><th>VOLUME</th><th>STATUS</th></tr></thead><tbody>
        {rfqs.slice(0, 3).map((rfq) => <tr key={rfq.id}><td>{rfq.id}</td><td>{rfq.product}</td><td>{rfq.volume}</td><td><Status tone={rfq.status === "Quotation received" ? "green" : "amber"}>{rfq.status}</Status></td></tr>)}
      </tbody></table></div>
      <div className="inline-actions"><button className="secondary-button" onClick={() => setView("rfqs")}>Open RFQs</button><button className="secondary-button" onClick={() => setView("products")}>Browse catalogue</button></div>
    </section>
  </>;
}

function ProductCatalogue({ onRequest }: { onRequest: (product: string) => void }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const categories = ["All", "Wagyu", "Angus", "Beef cuts"];
  const filtered = useMemo(() => products.filter((product) =>
    (category === "All" || product.category === category) &&
    `${product.name} ${product.cut} ${product.description}`.toLowerCase().includes(search.toLowerCase())
  ), [category, search]);
  return <section className="panel">
    <PanelTitle title="Export product range" meta={`${filtered.length} products shown · illustrative`} />
    <div className="toolbar"><label className="search-field"><span aria-hidden="true">⌕</span><input aria-label="Search products" placeholder="Search cut or product..." value={search} onChange={(event) => setSearch(event.target.value)} /></label>
      <div className="filter-group" aria-label="Filter product category">{categories.map((item) => <button key={item} className={category === item ? "filter-chip selected" : "filter-chip"} onClick={() => setCategory(item)}>{item}</button>)}</div>
    </div>
    {filtered.length === 0 ? <EmptyState title="No matching products" description="Try another product name or category." /> :
      <div className="product-grid">{filtered.map((product) => <article className="product-card" key={product.id}>
        <div className="product-art" aria-hidden="true"><span>AHB</span><strong>{product.category.toUpperCase()}</strong></div>
        <div className="product-card-body"><div className="product-id">{product.id} · {product.category}</div><h3>{product.name}</h3><div className="product-cut">{product.cut}</div><p>{product.description}</p><div className="product-card-footer"><Status tone="amber">{product.availability}</Status><button className="text-button" onClick={() => onRequest(product.name)}>Request quote →</button></div></div>
      </article>)}</div>}
    <p className="small-note">Product descriptions are illustrative only. No grade, marble score, certification, origin claim, price or export eligibility is represented as verified.</p>
  </section>;
}

function RfqWorkspace({ rfqs, onAdd }: { rfqs: Rfq[]; onAdd: (rfq: Rfq) => void }) {
  const [product, setProduct] = useState("Wagyu Ribeye");
  const [volume, setVolume] = useState("");
  const [destination, setDestination] = useState("");
  const [message, setMessage] = useState("");
  const [notice, setNotice] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!volume.trim() || !destination.trim()) { setNotice("Enter a target volume and destination to create a local demo request."); return; }
    onAdd({ id: `DEMO-RFQ-${String(rfqs.length + 1).padStart(3, "0")}`, product, volume, destination, status: "Local draft", date: "Today · demo", notes: message });
    setNotice("Demo RFQ added to this page state only. It has not been sent to Australian Halal Beef.");
    setVolume(""); setDestination(""); setMessage("");
  }
  return <div className="content-grid rfq-layout">
    <section className="panel"><PanelTitle title="Create a request for quotation" meta="Local demonstration" />
      <form className="rfq-form" onSubmit={submit}>
        <label>Product<select value={product} onChange={(event) => setProduct(event.target.value)}>{products.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}</select></label>
        <label>Target volume<input required value={volume} onChange={(event) => setVolume(event.target.value)} placeholder="e.g. 500 kg / 2,000 cartons" /></label>
        <label>Destination market<input required value={destination} onChange={(event) => setDestination(event.target.value)} placeholder="Country / port of destination" /></label>
        <label>Specification notes <span className="subtle">(optional)</span><textarea rows={3} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Cut, grade, chilled/frozen, packing, delivery window..." /></label>
        <button className="primary-button" type="submit">＋ Add demo RFQ</button>
        {notice && <p className="form-notice" role="status">{notice}</p>}
      </form>
      <p className="small-note">The form stores no data. Submission only updates the current browser session state and does not contact a seller.</p>
    </section>
    <section className="panel"><PanelTitle title="RFQ process" />
      <ol className="process-list"><li><strong>Request submitted</strong><span>Buyer shares product, volume and destination requirements.</span></li><li><strong>Commercial review</strong><span>Seller reviews specification, capacity and export requirements.</span></li><li><strong>Quotation issued</strong><span>Price, validity, Incoterms and delivery assumptions are proposed.</span></li><li><strong>Contract / order confirmation</strong><span>Order proceeds only after required bilateral agreement.</span></li></ol>
      <div className="callout-note">Illustrative workflow only. No quotation, contract, payment obligation or order is created by this preview.</div>
    </section>
    <section className="panel full-span"><PanelTitle title="RFQ register" meta={`${rfqs.length} records · synthetic / local`} />
      <div className="table-scroll"><table><thead><tr><th>REFERENCE</th><th>PRODUCT</th><th>VOLUME</th><th>DESTINATION</th><th>STATUS</th><th>DATE</th></tr></thead><tbody>
        {rfqs.map((rfq) => <tr key={rfq.id}><td>{rfq.id}</td><td>{rfq.product}</td><td>{rfq.volume}</td><td>{rfq.destination}</td><td><Status tone={rfq.status === "Quotation received" ? "green" : "amber"}>{rfq.status}</Status></td><td>{rfq.date}</td></tr>)}
      </tbody></table></div>
    </section>
  </div>;
}

function Orders() {
  return <section className="panel"><PanelTitle title="Purchase order register" meta="Synthetic sample records" />
    <div className="table-scroll"><table><thead><tr><th>PO REFERENCE</th><th>PRODUCT</th><th>QUANTITY</th><th>CONTRACT</th><th>ORDER STATUS</th><th>PAYMENT STATUS</th></tr></thead><tbody>
      <tr><td>AHB-PO-2026-014</td><td>Wagyu Ribeye</td><td>500 kg</td><td>AHB-C-2026-008</td><td><Status>Confirmed</Status></td><td><Status tone="amber">Deposit pending</Status></td></tr>
      <tr><td>AHB-PO-2026-011</td><td>Angus Striploin</td><td>1,000 kg</td><td>AHB-C-2026-005</td><td><Status tone="blue">In transit</Status></td><td><Status>Milestone 2 received</Status></td></tr>
    </tbody></table></div>
    <p className="small-note">Payment labels are fictional display examples, not bank confirmations, ledger entries or payment instructions. Actual payment terms must follow the executed contract.</p>
  </section>;
}

function Documents() {
  const docs = [
    ["AHB-C-2026-008", "Sales contract · Wagyu order", "Buyer review", "24 Nov 2026"],
    ["AHB-INV-2026-014", "Commercial invoice · sample", "Available", "23 Nov 2026"],
    ["AHB-SPEC-2026-003", "Product specification sheet", "Available", "20 Nov 2026"],
    ["AHB-HALAL-REF-001", "Halal assurance reference", "Not verified", "—"],
  ];
  return <section className="panel"><PanelTitle title="Document register" meta="Synthetic document index" />
    <div className="table-scroll"><table><thead><tr><th>DOCUMENT REFERENCE</th><th>DESCRIPTION</th><th>ACCESS STATUS</th><th>UPDATED</th><th>ACTION</th></tr></thead><tbody>
      {docs.map((doc) => <tr key={doc[0]}><td>{doc[0]}</td><td>{doc[1]}</td><td><Status tone={doc[2] === "Available" ? "green" : "amber"}>{doc[2]}</Status></td><td>{doc[3]}</td><td><span className="subtle">Preview only</span></td></tr>)}
    </tbody></table></div>
    <p className="small-note">No downloadable documents are attached. Halal assurance is explicitly marked not verified; certification scope and validity must be independently checked before making claims.</p>
  </section>;
}

function Shipments() {
  const steps = ["Order confirmed", "Processing & packing", "Export documentation", "Departed origin port", "Arrived destination"];
  return <div className="content-grid">
    <section className="panel"><PanelTitle title="Shipment SH-2026-011" meta="Synthetic tracking example" />
      <div className="shipment-summary"><div><span className="subtle">RELATED ORDER</span><strong>AHB-PO-2026-011</strong></div><div><span className="subtle">CARGO</span><strong>Angus Striploin · 1,000 kg</strong></div><div><span className="subtle">DESTINATION</span><strong>Jebel Ali · UAE</strong></div><div><span className="subtle">CURRENT STATUS</span><Status tone="blue">In transit · demo</Status></div></div>
      <ol className="shipment-timeline">{steps.map((step, index) => <li className={index < 4 ? "complete" : ""} key={step}><span className="timeline-dot" /><div><strong>{step}</strong><span className="subtle">{index < 4 ? ["18 Nov 2026", "20 Nov 2026", "21 Nov 2026", "22 Nov 2026"][index] : "Pending sample milestone"}</span></div></li>)}</ol>
    </section>
    <section className="panel"><PanelTitle title="Shipment documents" />
      <Activity title="Packing list" detail="Sample reference · preview only" />
      <Activity title="Bill of lading" detail="Not attached · sample record" />
      <Activity title="Health / export documents" detail="Not attached · subject to destination approval" />
      <div className="callout-note">No carrier connection, vessel position, ETA or customs clearance data is live or verified.</div>
    </section>
  </div>;
}

export default function App() {
  const [view, setView] = useState<View>("overview");
  const [rfqs, setRfqs] = useState<Rfq[]>(initialRfqs);
  const current = pageCopy[view];
  function addRfq(rfq: Rfq) { setRfqs((previous) => [rfq, ...previous]); }
  function requestProduct(product: string) { setView("rfqs"); setSelectedProduct(product); }
  const [selectedProduct, setSelectedProduct] = useState("Wagyu Ribeye");
  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand">AUSTRALIAN HALAL BEEF<span>BUYER WORKSPACE</span></div>
      <div className="nav-caption">WORKSPACE</div>
      <nav aria-label="Buyer workspace navigation">
        {navigation.map((item) => <button key={item.id} className={view === item.id ? "nav-item active" : "nav-item"} aria-current={view === item.id ? "page" : undefined} onClick={() => setView(item.id)}><span className="nav-icon" aria-hidden="true">{item.icon}</span>{item.label}</button>)}
      </nav>
      <div className="account-block">DEMO BUYER ACCOUNT<strong>Pacific Gourmet Imports</strong><span>Synthetic preview data</span></div>
    </aside>
    <main className="main-area">
      <header className="topbar"><div className="breadcrumb">Buyer Workspace / <strong>{current.title}</strong></div><div className="account-chip"><span>Pacific Gourmet Imports</span><span className="avatar" aria-hidden="true">PG</span></div></header>
      <div className="page-content">
        <div className="page-heading"><div><div className="eyebrow">{current.eyebrow}</div><h1>{current.title}</h1><p>{current.description}</p></div>{(view === "overview" || view === "products") && <button className="primary-button" onClick={() => setView("rfqs")}>＋ New RFQ</button>}</div>
        {view === "overview" && <Overview setView={setView} rfqs={rfqs} />}
        {view === "products" && <ProductCatalogue onRequest={requestProduct} />}
        {view === "rfqs" && <RfqWorkspace rfqs={rfqs} onAdd={addRfq} initialProduct={selectedProduct} />}
        {view === "orders" && <Orders />}
        {view === "documents" && <Documents />}
        {view === "shipments" && <Shipments />}
        <div className="disclaimer">DEMO ENVIRONMENT · All buyer, product, quotation, order, payment, document and shipment records are synthetic. No backend, certification registry, financial institution, carrier or export authority is connected.</div>
      </div>
    </main>
  </div>;
}
