import { useState } from "react";

type View = "overview" | "products" | "rfqs" | "orders" | "documents" | "shipments";

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
  products: { eyebrow: "DISCOVER OUR RANGE", title: "Product catalogue", description: "Explore specifications and request an export quotation." },
  rfqs: { eyebrow: "COMMERCIAL ENQUIRIES", title: "My RFQs", description: "Track requests and review quotation progress." },
  orders: { eyebrow: "ORDER MANAGEMENT", title: "Purchase orders", description: "Review confirmed orders and commercial milestones." },
  documents: { eyebrow: "CONTRACT & TRADE RECORDS", title: "Documents", description: "Access buyer-authorized commercial documents." },
  shipments: { eyebrow: "LOGISTICS VISIBILITY", title: "Shipments", description: "Follow shipment milestones shared with your buyer account." },
};

function Overview() {
  return (
    <>
      <div className="metric-grid">
        <Metric label="Open quotations" value="3" foot="2 awaiting your review" />
        <Metric label="Active purchase orders" value="2" foot="Across 2 product lines" />
        <Metric label="Shipments in transit" value="1" foot="Latest update · 2 days ago" />
        <Metric label="Documents requiring action" value="1" foot="Buyer review requested" />
      </div>
      <div className="content-grid">
        <section className="panel">
          <div className="panel-heading"><h2>Recent purchase orders</h2><span className="subtle">View all →</span></div>
          <div className="table-scroll"><table><thead><tr><th>PO NUMBER</th><th>PRODUCT</th><th>STATUS</th><th>UPDATED</th></tr></thead><tbody>
            <tr><td>AHB-PO-2026-014</td><td>Wagyu Ribeye</td><td><Status>Confirmed</Status></td><td>24 Nov 2026</td></tr>
            <tr><td>AHB-PO-2026-011</td><td>Angus Striploin</td><td><Status tone="blue">In transit</Status></td><td>22 Nov 2026</td></tr>
          </tbody></table></div>
        </section>
        <section className="panel">
          <div className="panel-heading"><h2>Recent activity</h2><span className="subtle">Demo</span></div>
          <Activity title="Quotation received" detail="RFQ-026 · Wagyu Ribeye" />
          <Activity title="Shipment milestone updated" detail="SH-2026-011 · Vessel departed" />
          <Activity title="Document uploaded" detail="PO-014 · Draft contract" />
        </section>
      </div>
    </>
  );
}

function Metric({ label, value, foot }: { label: string; value: string; foot: string }) {
  return <section className="metric-card"><div className="metric-label">{label}</div><div className="metric-value">{value}</div><div className="metric-foot">{foot}</div></section>;
}
function Status({ children, tone = "green" }: { children: string; tone?: "green" | "blue" | "amber" }) {
  return <span className={`status status-${tone}`}>{children}</span>;
}
function Activity({ title, detail }: { title: string; detail: string }) {
  return <div className="activity"><span className="activity-dot" /><div><strong>{title}</strong><div className="subtle">{detail}</div></div></div>;
}

function Placeholder({ view }: { view: Exclude<View, "overview"> }) {
  const messages: Record<Exclude<View, "overview">, string> = {
    products: "Product search, category filters, specification detail and RFQ entry will be implemented in the buyer journey stage.",
    rfqs: "RFQ submission, quotation review and commercial status tracking will be implemented in the buyer journey stage.",
    orders: "Confirmed purchase orders, contract references and buyer-visible payment status will be implemented in the buyer journey stage.",
    documents: "Buyer-authorized contract and trade document access will be implemented in the buyer journey stage.",
    shipments: "Buyer-visible shipment milestones and tracking references will be implemented in the buyer journey stage.",
  };
  return <section className="panel placeholder"><div className="placeholder-mark">◇</div><h2>{pageCopy[view].title} module</h2><p>{messages[view]}</p><span className="subtle">Stage 3 · Planned screen implementation</span></section>;
}

export default function App() {
  const [view, setView] = useState<View>("overview");
  const current = pageCopy[view];
  return (
    <div className="app-shell">
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
          <div className="page-heading"><div><div className="eyebrow">{current.eyebrow}</div><h1>{current.title}</h1><p>{current.description}</p></div>{view === "overview" && <button className="primary-button" onClick={() => setView("rfqs")}>＋ New RFQ</button>}</div>
          {view === "overview" ? <Overview /> : <Placeholder view={view} />}
          <div className="disclaimer">Illustrative account only. All buyer, quotation, order, payment and shipment records are synthetic. No live supplier, certification, financial or logistics data is connected.</div>
        </div>
      </main>
    </div>
  );
}