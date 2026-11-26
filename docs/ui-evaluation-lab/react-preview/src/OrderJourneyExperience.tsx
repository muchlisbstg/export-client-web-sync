import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

type Stage = { id: string; phase: string; title: string; summary: string; buyerAction: string; evidence: string[]; gate: string };
const stages: Stage[] = [
  { id: "01", phase: "DISCOVER", title: "Buyer verification", summary: "Establish the importing company's identity, authorised contacts and destination-market context.", buyerAction: "Provide company details, business registration and relevant import credentials for review.", evidence: ["Company legal name and registered address", "Authorised buyer contact", "Destination market and importer requirements"], gate: "Buyer status must be reviewed before access to contract-based purchasing." },
  { id: "02", phase: "DISCOVER", title: "Product specification", summary: "Define the exact cut, grade, handling, pack format and destination requirements.", buyerAction: "Select product range, chilled or frozen handling, cut/trim, pack size and target volume.", evidence: ["Product and cut specification", "Grade / quality requirements", "Packaging, quantity and delivery window"], gate: "A product name alone is not a complete commercial specification." },
  { id: "03", phase: "COMMERCIAL", title: "Request for quotation", summary: "Submit a structured RFQ for commercial and operational feasibility review.", buyerAction: "Confirm destination port, estimated volume, target schedule and supporting requirements.", evidence: ["RFQ reference and submitted scope", "Destination and target delivery", "Buyer-specific product requirements"], gate: "Preview RFQ is local-only; no seller receives or processes this request." },
  { id: "04", phase: "COMMERCIAL", title: "Feasibility & quotation", summary: "Review supply feasibility, destination eligibility and the proposed commercial offer.", buyerAction: "Review price, currency, MOQ, validity, Incoterms, lead-time assumptions and exclusions.", evidence: ["Written quotation and validity", "Destination-specific feasibility", "Agreed product and logistics assumptions"], gate: "Availability, price and export eligibility require written confirmation; none is live in this preview." },
  { id: "05", phase: "CONTRACT", title: "Contract approval", summary: "Agree the final contract, itemised schedule, obligations and approval record.", buyerAction: "Review contract version, product schedule, delivery terms, payment milestones and dispute terms.", evidence: ["Approved contract snapshot", "Item-level specification schedule", "Bilateral approval and signature evidence"], gate: "No contract is created, signed or legally approved by this demonstration." },
  { id: "06", phase: "CONTRACT", title: "Order preparation", summary: "Prepare the contracted order and link each obligation to its product and lot evidence.", buyerAction: "Confirm order details and review preparation milestones against the agreed specification.", evidence: ["Contract and order identifiers", "Item / lot allocation evidence", "Preparation and inspection plan"], gate: "No live inventory, supplier allocation or production data is connected." },
  { id: "07", phase: "ASSURANCE", title: "Quality & halal review", summary: "Review halal and quality evidence independently and reconcile it to the relevant lot.", buyerAction: "Review certificate scope, establishment, process, product specification and lot linkage.", evidence: ["Halal issuer, scope and validity", "Quality / food-safety inspection records", "Lot-to-carton and consignment linkage"], gate: "Halal and quality decisions are separate; all evidence is NOT CONNECTED in this preview." },
  { id: "08", phase: "ASSURANCE", title: "Payment milestones", summary: "Track contractual payment obligations against verified settlement records.", buyerAction: "Follow the agreed 30 / 30 / 40 schedule and review payment evidence with the authorised finance team.", evidence: ["Contractual milestone schedule", "Payment reference and bank evidence", "Reconciled settlement ledger"], gate: "Illustrative 30/30/40 only. No payment instruction, bank connection or settlement occurs." },
  { id: "09", phase: "RELEASE", title: "Goods release authorisation", summary: "Apply a server-side release decision only after contractual and evidence obligations are satisfied.", buyerAction: "Review release status and any outstanding contractual or documentary conditions.", evidence: ["Contract / item / obligation references", "Settlement and evidence status", "Authoritative release authorisation"], gate: "Goods release is NOT AVAILABLE. UI state cannot authorise or release goods." },
  { id: "10", phase: "RELEASE", title: "Export documentation", summary: "Prepare and reconcile destination-specific export and shipment documentation.", buyerAction: "Review the document index, consignee details and destination-specific requirements.", evidence: ["Commercial and packing documents", "Applicable health / halal documents", "Export and destination clearance records"], gate: "Document requirements vary by market; no government or certification registry is connected." },
  { id: "11", phase: "DELIVERY", title: "Shipment & delivery", summary: "Follow carrier-confirmed milestones and cold-chain handovers through delivery.", buyerAction: "Monitor verified dispatch, transit, arrival and delivery confirmations.", evidence: ["Carrier and consignment reference", "Temperature / handover records", "Proof of delivery and exceptions"], gate: "No carrier, vessel, container or live tracking data is connected." },
  { id: "12", phase: "DELIVERY", title: "Acceptance & repeat order", summary: "Reconcile delivered quantities, claims, outstanding obligations and future orders.", buyerAction: "Confirm receipt, record discrepancies and initiate a contract-based reorder when eligible.", evidence: ["Buyer receipt / acceptance record", "Claims and corrective-action evidence", "Reconciled order close-out"], gate: "No actual delivery acceptance, claims case or reorder is created in this preview." },
];

const groups = ["DISCOVER", "COMMERCIAL", "CONTRACT", "ASSURANCE", "RELEASE", "DELIVERY"];
const milestones = [
  { label: "Initial", share: "30%", detail: "Contract-defined initial payment milestone" },
  { label: "Progress", share: "30%", detail: "Contract-defined progress milestone" },
  { label: "Final", share: "40%", detail: "Final settlement milestone before any applicable release decision" },
];

function OrderJourneyExperience() {
  const [mount, setMount] = useState<HTMLElement | null>(null);
  const [active, setActive] = useState("01");
  const [checked, setChecked] = useState<string[]>([]);
  const [destination, setDestination] = useState("Singapore");
  const [notice, setNotice] = useState("");
  const selected = stages.find((stage) => stage.id === active) ?? stages[0];
  const readiness = useMemo(() => Math.round((checked.length / 5) * 100), [checked]);

  useEffect(() => {
    const section = document.querySelector<HTMLElement>("#process");
    if (!section) return;
    const root = document.createElement("div");
    root.className = "ahb-order-journey-root";
    section.insertBefore(root, section.firstChild);
    section.classList.add("ahb-enhanced-order");
    setMount(root);
    return () => {
      section.classList.remove("ahb-enhanced-order");
      root.remove();
    };
  }, []);

  function toggleRequirement(item: string) {
    setChecked((current) => current.includes(item) ? current.filter((value) => value !== item) : [...current, item]);
  }

  if (!mount) return null;
  return createPortal(
    <div className="ahb-order-journey">
      <div className="ahb-order-heading">
        <div>
          <div className="eyebrow">A CLEAR COMMERCIAL JOURNEY</div>
          <h2>From first enquiry<br/><em>to confirmed delivery.</em></h2>
        </div>
        <p>A buyer-led export lifecycle with clear evidence, approvals and control gates. Explore each stage to understand the buyer action and the records expected before progressing.</p>
      </div>

      <div className="ahb-order-disclaimer" role="note"><strong>DEMONSTRATION WORKFLOW</strong><span>All records are synthetic. No buyer verification, RFQ transmission, quotation, contract, payment, goods release or shipment operation is connected.</span></div>

      <div className="ahb-order-layout">
        <div className="ahb-stage-navigation" aria-label="B2B order lifecycle stages">
          {groups.map((group) => <div className="ahb-stage-group" key={group}>
            <span className="ahb-stage-group-label">{group}</span>
            {stages.filter((stage) => stage.phase === group).map((stage) => <button key={stage.id} type="button" className={active === stage.id ? "ahb-stage-button is-active" : "ahb-stage-button"} aria-pressed={active === stage.id} onClick={() => setActive(stage.id)}>
              <span>{stage.id}</span><strong>{stage.title}</strong>
            </button>)}
          </div>)}
        </div>

        <article className="ahb-stage-detail" aria-live="polite">
          <div className="ahb-stage-detail-top"><span>STAGE {selected.id} / 12</span><span>{selected.phase}</span></div>
          <h3>{selected.title}</h3>
          <p className="ahb-stage-summary">{selected.summary}</p>
          <div className="ahb-stage-detail-grid">
            <div><h4>Buyer action</h4><p>{selected.buyerAction}</p></div>
            <div><h4>Expected evidence</h4><ul>{selected.evidence.map((item) => <li key={item}>{item}</li>)}</ul></div>
          </div>
          <div className="ahb-stage-gate"><strong>CONTROL GATE</strong><p>{selected.gate}</p></div>
          <div className="ahb-stage-controls">
            <button type="button" className="ahb-stage-prev" disabled={selected.id === "01"} onClick={() => setActive(String(Number(selected.id) - 1).padStart(2, "0"))}>Previous stage</button>
            <button type="button" className="ahb-stage-next" disabled={selected.id === "12"} onClick={() => setActive(String(Number(selected.id) + 1).padStart(2, "0"))}>Next stage <span>→</span></button>
          </div>
        </article>
      </div>

      <div className="ahb-order-support-grid">
        <section className="ahb-payment-panel">
          <div className="ahb-support-kicker">ILLUSTRATIVE CONTRACT STRUCTURE</div>
          <h3>Payment milestones</h3>
          <p>Example allocation only. The executed contract defines the actual due dates, evidence and settlement conditions.</p>
          <div className="ahb-payment-bars">{milestones.map((item) => <div className="ahb-payment-row" key={item.label}><div className="ahb-payment-bar"><span style={{ width: item.share }}/></div><strong>{item.share}</strong><div><b>{item.label}</b><small>{item.detail}</small></div></div>)}</div>
          <div className="ahb-payment-rule">Payment ledger = settlement truth. A UI payment indicator is not proof of cleared funds.</div>
        </section>

        <section className="ahb-buyer-readiness">
          <div className="ahb-support-kicker">BUYER PREPARATION</div>
          <h3>Before you submit an RFQ</h3>
          <p>Use this local checklist to prepare a more complete buyer brief.</p>
          <div className="ahb-readiness-progress"><span style={{ width: readiness + "%" }}/></div>
          <small>{checked.length} of 5 preparation items selected · {readiness}%</small>
          {["Company and authorised contact details", "Product cut, grade and handling requirements", "Estimated quantity and target delivery window", "Destination market and receiving port", "Packaging, labelling and document requirements"].map((item) => <label key={item}><input type="checkbox" checked={checked.includes(item)} onChange={() => toggleRequirement(item)}/><span>{item}</span></label>)}
          <label className="ahb-destination-label">Destination market
            <select value={destination} onChange={(event) => setDestination(event.target.value)}>
              {["Singapore", "United Arab Emirates", "Malaysia", "Japan", "South Korea", "Other / to be confirmed"].map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <button type="button" className="ahb-readiness-button" onClick={() => setNotice("Buyer brief prepared locally for " + destination + ". No RFQ was sent or stored.")}>Prepare local buyer brief</button>
          {notice && <p className="ahb-local-notice" role="status">{notice}</p>}
          <p className="ahb-local-disclaimer">Browser-session demonstration only. No personal or company information is transmitted or persisted.</p>
        </section>
      </div>

      <div className="ahb-release-principle"><span>NON-NEGOTIABLE CONTROL</span><strong>Goods release requires authoritative server-side authorisation.</strong><p>Contract snapshot, payment ledger, evidence register and release authorisation must reconcile to the same contract, item and obligation. This preview does not grant release authority.</p></div>
    </div>,
    mount
  );
}

export default OrderJourneyExperience;
