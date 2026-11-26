import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Jurisdiction = { code: string; name: string; capital: string; context: string; productionContext: string; buyerNote: string };
const jurisdictions: Jurisdiction[] = [
  { code: "NSW", name: "New South Wales", capital: "Sydney", context: "A major eastern Australian state with diverse inland and coastal agricultural regions.", productionContext: "Regional production context only; no AHB property, supplier or processor is linked in this preview.", buyerNote: "Request property-level origin evidence and establishment details for the offered lot." },
  { code: "VIC", name: "Victoria", capital: "Melbourne", context: "A south-eastern state with established livestock, processing and food supply-chain sectors.", productionContext: "Illustrative jurisdiction profile; no current AHB sourcing relationship is represented.", buyerNote: "Confirm the actual property, processing establishment and lot-level chain of custody." },
  { code: "QLD", name: "Queensland", capital: "Brisbane", context: "A large north-eastern state spanning tropical, subtropical and inland production environments.", productionContext: "Geographic context only; this does not identify a source property or supply commitment.", buyerNote: "Verify property identity, animal movement history and destination-market establishment eligibility." },
  { code: "SA", name: "South Australia", capital: "Adelaide", context: "A southern state with livestock and food production across varied climatic zones.", productionContext: "No AHB supplier, farm or processing site is connected to this illustrative profile.", buyerNote: "Obtain documentary linkage from the declared property through processing to the export lot." },
  { code: "WA", name: "Western Australia", capital: "Perth", context: "A western state with extensive agricultural and livestock regions.", productionContext: "Regional reference only; no operational sourcing location is disclosed or verified.", buyerNote: "Confirm the route, establishment approvals and destination-specific export conditions." },
  { code: "TAS", name: "Tasmania", capital: "Hobart", context: "An island state south of mainland Australia with a distinct agricultural geography.", productionContext: "This is not a claim that AHB products originate in Tasmania.", buyerNote: "Request evidence naming the actual property and the lot-specific processing pathway." },
  { code: "NT", name: "Northern Territory", capital: "Darwin", context: "A northern territory with extensive pastoral landscapes and long-distance logistics considerations.", productionContext: "Contextual profile only; no supplier or product provenance is asserted.", buyerNote: "Check animal movement records, processing location and transport/cold-chain evidence." },
  { code: "ACT", name: "Australian Capital Territory", capital: "Canberra", context: "Australia's federal capital territory and a distinct administrative jurisdiction.", productionContext: "Included for jurisdiction completeness, not presented as an AHB livestock source.", buyerNote: "Do not infer production origin from a company address or administrative location." },
];

const evidence = [
  { id: "property", title: "Property identity", detail: "Declared property name, location and relevant Property Identification Code (PIC), where applicable." },
  { id: "livestock", title: "Livestock traceability", detail: "NLIS identification and movement records linked to the relevant animals and supply lot." },
  { id: "processing", title: "Processing establishment", detail: "Establishment identity, approval scope and export eligibility for the destination market." },
  { id: "lot", title: "Product & lot linkage", detail: "Documented chain from eligible animals through processing, carton/lot identification and dispatch." },
  { id: "origin", title: "Country-of-origin substantiation", detail: "Evidence supporting the exact origin statement and any destination-market labelling requirement." },
  { id: "halal", title: "Halal certification scope", detail: "Current issuer, certificate validity, covered establishment, process and product scope." },
  { id: "quality", title: "Quality & cold chain", detail: "Applicable grading/specification records, temperature controls and shipment handover evidence." },
];

function OriginExperience() {
  const [mount, setMount] = useState<HTMLElement | null>(null);
  const [selected, setSelected] = useState("NSW");
  const [query, setQuery] = useState("");
  const [destination, setDestination] = useState("");
  const [selectedEvidence, setSelectedEvidence] = useState<string[]>(evidence.map((item) => item.id));
  const [showChecklist, setShowChecklist] = useState(false);
  const [notice, setNotice] = useState("");
  const triggerRef = useRef<HTMLElement | null>(null);
  const region = jurisdictions.find((item) => item.code === selected) ?? jurisdictions[0];
  const visible = useMemo(() => jurisdictions.filter((item) => (item.name + " " + item.code + " " + item.capital).toLowerCase().includes(query.trim().toLowerCase())), [query]);

  useEffect(() => {
    const section = document.querySelector<HTMLElement>("#origin");
    if (!section) return;
    const root = document.createElement("div");
    root.className = "ahb-origin-experience-root";
    section.prepend(root);
    section.classList.add("ahb-enhanced-origin");
    setMount(root);
    return () => { section.classList.remove("ahb-enhanced-origin"); root.remove(); };
  }, []);

  useEffect(() => {
    if (!showChecklist) return;
    const dialog = document.querySelector<HTMLElement>(".ahb-origin-dialog");
    const focusable = dialog?.querySelectorAll<HTMLElement>('button:not([disabled]),input:not([disabled]),[tabindex]:not([tabindex="-1"])');
    focusable?.[0]?.focus();
    function keys(event: KeyboardEvent) {
      if (event.key === "Escape") { setShowChecklist(false); return; }
      if (event.key !== "Tab" || !focusable?.length) return;
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
    window.addEventListener("keydown", keys);
    return () => { window.removeEventListener("keydown", keys); triggerRef.current?.focus(); };
  }, [showChecklist]);

  function openChecklist() {
    triggerRef.current = document.activeElement as HTMLElement | null;
    setNotice("");
    setShowChecklist(true);
  }

  if (!mount) return null;
  return createPortal(
    <section className="ahb-origin-experience" aria-labelledby="ahb-origin-title">
      <div className="ahb-origin-heading">
        <div><span className="ahb-origin-eyebrow">AUSTRALIAN ORIGIN & PROVENANCE</span><h2 id="ahb-origin-title">Know the origin.<br/><em>See the evidence.</em></h2></div>
        <p>Explore Australia's state and territory context, then review the evidence required to substantiate a specific product's origin. A regional profile is not proof of supply origin.</p>
      </div>
      <figure className="ahb-origin-photo">
        <img src="https://images.pexels.com/photos/29531063/pexels-photo-29531063.jpeg?auto=compress&w=1600" alt="Editorial stock photograph of cattle grazing on misty hills in Gloucester, New South Wales; not an AHB supplier farm or verified supply location" loading="eager" decoding="async"/>
        <figcaption><span>GLOUCESTER, NSW · EDITORIAL STOCK PHOTOGRAPH</span><strong className="ahb-origin-photo-disclaimer">Regional editorial image only · Not an AHB supplier farm or verified supply location</strong></figcaption>
      </figure>
      <div className="ahb-origin-trustline"><span><b>01</b> Jurisdiction context</span><span><b>02</b> Property & livestock traceability</span><span><b>03</b> Processing & lot linkage</span><span><b>04</b> Buyer-ready evidence</span></div>
      <div className="ahb-origin-workspace">
        <aside className="ahb-origin-region-panel">
          <div className="ahb-origin-panel-top"><div><span>AUSTRALIA</span><strong>Explore jurisdictions</strong></div><span className="ahb-origin-scale">REFERENCE INDEX · NOT TO SCALE</span></div>
          <label className="ahb-origin-search"><span aria-hidden="true">⌕</span><input aria-label="Search Australian jurisdictions" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search state or territory"/></label>
          <div className="ahb-origin-jurisdictions" role="group" aria-label="Australian states and territories">
            {visible.map((item) => <button type="button" key={item.code} className={selected === item.code ? "ahb-origin-jurisdiction is-active" : "ahb-origin-jurisdiction"} aria-pressed={selected === item.code} onClick={() => setSelected(item.code)}><span>{item.code}</span><strong>{item.name}</strong><small>{item.capital}</small></button>)}
            {visible.length === 0 && <p className="ahb-origin-no-results">No matching jurisdiction. Try a state abbreviation.</p>}
          </div>
          <div className="ahb-origin-map-note"><span aria-hidden="true">◎</span><p>Jurisdiction selector only. It does not show supplier farms, abattoirs, animal movements or live sourcing locations.</p></div>
        </aside>
        <article className="ahb-origin-region-detail" aria-live="polite">
          <div className="ahb-origin-region-banner"><div><span>SELECTED JURISDICTION · {region.code}</span><h3>{region.name}</h3><p>{region.context}</p></div><div className="ahb-origin-capital"><span>CAPITAL</span><strong>{region.capital}</strong></div></div>
          <div className="ahb-origin-detail-grid"><div><span className="ahb-origin-field-label">Production context</span><p>{region.productionContext}</p></div><div><span className="ahb-origin-field-label">Buyer due diligence</span><p>{region.buyerNote}</p></div></div>
          <div className="ahb-origin-evidence-alert"><span aria-hidden="true">!</span><div><strong>Origin evidence not connected</strong><p>No farm, supplier, establishment, livestock consignment or product lot has been verified in this demonstration.</p></div><span className="ahb-origin-status">NOT VERIFIED</span></div>
        </article>
      </div>
      <div className="ahb-origin-chain-section">
        <div className="ahb-origin-subheading"><div><span className="ahb-origin-eyebrow">TRACEABILITY FRAMEWORK</span><h3>From property to export lot.</h3></div><p>Each handover must be supported by records that reconcile to the same consignment and product lot.</p></div>
        <div className="ahb-origin-chain">
          {[
            ["01","Property of origin","Property identity and location"],
            ["02","Livestock identity","NLIS identification & movements"],
            ["03","Processing establishment","Approval and export scope"],
            ["04","Product & carton lot","Batch, carton and production records"],
            ["05","Export consignment","Export documents and shipment linkage"],
          ].map(([number,title,detail], index) => <div className="ahb-origin-chain-step" key={number}><span>{number}</span><strong>{title}</strong><small>{detail}</small>{index < 4 && <i aria-hidden="true">→</i>}</div>)}
        </div>
        <p className="ahb-origin-chain-disclaimer">Framework illustration only. No live NLIS, supplier, establishment, government or logistics data is connected.</p>
      </div>
      <div className="ahb-origin-evidence-section">
        <div className="ahb-origin-subheading"><div><span className="ahb-origin-eyebrow">DOCUMENT CONTROL</span><h3>Evidence before origin claims.</h3></div><p>Review the documentary categories expected for a defensible buyer-facing provenance dossier.</p></div>
        <div className="ahb-origin-evidence-grid">{evidence.map((item) => <article key={item.id}><span className="ahb-origin-evidence-icon">◇</span><div><strong>{item.title}</strong><p>{item.detail}</p><small><i/> NOT CONNECTED</small></div></article>)}</div>
        <div className="ahb-origin-disclosure"><strong>Important distinction</strong><p>Australian geography, an Australian business address, a stock photograph or a regional profile does not establish that a particular animal, product or shipment is of Australian origin. Claims must be substantiated against the actual lot and the rules of the destination market.</p></div>
        <button type="button" className="ahb-origin-checklist-button" onClick={openChecklist}>Build buyer evidence checklist <span>↗</span></button>
      </div>
      {showChecklist && <div className="ahb-origin-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowChecklist(false); }}><section className="ahb-origin-dialog" role="dialog" aria-modal="true" aria-labelledby="ahb-origin-dialog-title"><div className="ahb-origin-dialog-head"><div><span className="ahb-origin-eyebrow">BUYER DUE-DILIGENCE WORKSPACE</span><h3 id="ahb-origin-dialog-title">Origin evidence checklist</h3><p>Select the records you want to request from the exporter for a specific offer.</p></div><button type="button" aria-label="Close origin checklist" onClick={() => setShowChecklist(false)}>×</button></div><form onSubmit={(event) => { event.preventDefault(); setNotice("Checklist prepared in this browser session only. No supplier was contacted and no records were requested."); }}><label className="ahb-origin-destination">Destination market<input required value={destination} onChange={(event) => setDestination(event.target.value)} placeholder="Country / destination market"/></label><div className="ahb-origin-check-options">{evidence.map((item) => <label key={item.id}><input type="checkbox" checked={selectedEvidence.includes(item.id)} onChange={(event) => setSelectedEvidence((current) => event.target.checked ? [...current,item.id] : current.filter((id) => id !== item.id))}/><span><strong>{item.title}</strong><small>{item.detail}</small></span></label>)}</div><button className="ahb-origin-checklist-button" type="submit">Prepare evidence request <span>↗</span></button>{notice && <p className="ahb-origin-notice" role="status">{notice}</p>}<p className="ahb-origin-dialog-disclaimer">Preview only. This checklist is not sent, stored, or treated as a regulatory determination. Actual evidence requirements depend on product, establishment and destination.</p></form></section></div>}
    </section>,
    mount,
  );
}

export default OriginExperience;
