import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

type Evidence = { id:string; domain:"Halal"|"Quality"|"Cold chain"|"Traceability"; title:string; required:string; status:"NOT CONNECTED"|"NOT PROVIDED"; scope:string };
const records: Evidence[] = [
 {id:"H-01",domain:"Halal",title:"Halal certificate & scope",required:"Issuer, certificate number, validity, covered establishment, product/process scope and lot linkage.",status:"NOT CONNECTED",scope:"Establishment + product lot + destination"},
 {id:"H-02",domain:"Halal",title:"Recognised Islamic organisation",required:"Verify issuer recognition and destination-market acceptance for the relevant activity and period.",status:"NOT CONNECTED",scope:"Issuer + destination market"},
 {id:"H-03",domain:"Halal",title:"Slaughter process assurance",required:"Applicable approved arrangement, Muslim slaughter personnel, supervision and process records.",status:"NOT PROVIDED",scope:"Establishment + production date + lot"},
 {id:"H-04",domain:"Halal",title:"Segregation & integrity controls",required:"Documented separation, handling, storage, cleaning, transport and non-conformance controls.",status:"NOT PROVIDED",scope:"Process + facility + consignment"},
 {id:"Q-01",domain:"Quality",title:"Cut & product specification",required:"AUS-MEAT description/code where applicable, trim, bone status, pack style and agreed tolerances.",status:"NOT PROVIDED",scope:"SKU + buyer specification"},
 {id:"Q-02",domain:"Quality",title:"Grade & eating-quality evidence",required:"Declared grading system and supporting records; MSA status only where the product is eligible and verified.",status:"NOT CONNECTED",scope:"Carcase / product lot"},
 {id:"Q-03",domain:"Quality",title:"Inspection & food-safety records",required:"Applicable inspection, hygiene, HACCP and test records with dates, methods and results.",status:"NOT PROVIDED",scope:"Establishment + production lot"},
 {id:"C-01",domain:"Cold chain",title:"Temperature & shelf-life dossier",required:"Defined product limits, calibrated readings, logger evidence, shelf-life basis and excursion actions.",status:"NOT PROVIDED",scope:"Carton + storage + shipment"},
 {id:"T-01",domain:"Traceability",title:"Lot-to-consignment reconciliation",required:"Reconcile animal/property, processing batch, carton labels, certificates and export consignment identifiers.",status:"NOT CONNECTED",scope:"End-to-end chain"},
];
const domains = ["All evidence","Halal","Quality","Cold chain","Traceability"] as const;
function QualityHalalExperience(){
 const [mount,setMount]=useState<HTMLElement|null>(null);
 const [domain,setDomain]=useState<(typeof domains)[number]>("All evidence");
 const [query,setQuery]=useState("");
 const [expanded,setExpanded]=useState<string|null>(null);
 const [destination,setDestination]=useState("Indonesia");
 const [lot,setLot]=useState("DEMO-LOT-001");
 const [notice,setNotice]=useState("");
 useEffect(()=>{
  const origin=document.querySelector<HTMLElement>("#origin");
  if(!origin)return;
  const root=document.createElement("div");root.className="ahb-assurance-root";
  origin.parentElement?.insertBefore(root,origin);setMount(root);
  return()=>root.remove();
 },[]);
 const filtered=useMemo(()=>records.filter(r=>(domain==="All evidence"||r.domain===domain)&&((r.title+" "+r.required+" "+r.id).toLowerCase().includes(query.trim().toLowerCase()))),[domain,query]);
 if(!mount)return null;
 return createPortal(<section className="ahb-assurance" aria-labelledby="ahb-assurance-title">
  <div className="ahb-assurance-head"><div><span className="ahb-assurance-eyebrow">QUALITY, HALAL & PRODUCT INTEGRITY</span><h2 id="ahb-assurance-title">Evidence-led assurance.<br/><em>Lot by lot.</em></h2></div><p>Review the documentary controls expected before a buyer accepts a product offer. This evaluation module contains illustrative requirements only, not verified supplier or certification records.</p></div>
  <div className="ahb-assurance-warning" role="note"><strong>DEMONSTRATION · NO LIVE VERIFICATION</strong><span>No certificate issuer, establishment, laboratory, product lot, temperature logger or government system is connected. No product is represented as halal-certified or quality-approved.</span></div>
  <div className="ahb-assurance-metrics" aria-label="Evidence status summary"><div><strong>{records.length}</strong><span>Evidence controls</span></div><div><strong>{records.filter(r=>r.domain==="Halal").length}</strong><span>Halal controls</span></div><div><strong>0</strong><span>Verified records</span></div><div><strong>0</strong><span>Connected sources</span></div></div>
  <div className="ahb-assurance-toolbar"><label>Search evidence<input aria-label="Search assurance evidence" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search certificate, grading, cold chain…"/></label><label>Evidence domain<select aria-label="Filter evidence domain" value={domain} onChange={e=>setDomain(e.target.value as (typeof domains)[number])}>{domains.map(d=><option key={d}>{d}</option>)}</select></label></div>
  <div className="ahb-assurance-list" aria-live="polite">{filtered.map(r=><article className="ahb-assurance-item" key={r.id}><button type="button" aria-expanded={expanded===r.id} onClick={()=>setExpanded(expanded===r.id?null:r.id)}><span className="ahb-assurance-id">{r.id}</span><span className="ahb-assurance-item-main"><strong>{r.title}</strong><small>{r.domain} · {r.scope}</small></span><span className="ahb-assurance-status">{r.status}</span><span aria-hidden="true">{expanded===r.id?"−":"+"}</span></button>{expanded===r.id&&<div className="ahb-assurance-detail"><strong>Evidence acceptance criteria</strong><p>{r.required}</p><p><b>Required linkage:</b> {r.scope}. A document without matching scope and identifiers must not be treated as proof for another lot or destination.</p></div>}</article>)}{filtered.length===0&&<p className="ahb-assurance-empty">No matching evidence controls. Try another search or domain.</p>}</div>
  <div className="ahb-assurance-review"><div><span className="ahb-assurance-eyebrow">BUYER REVIEW SCENARIO</span><h3>Build a lot-specific review brief.</h3><p>Use a synthetic lot reference and destination to preview the evidence scope. Nothing is transmitted or saved.</p></div><form onSubmit={e=>{e.preventDefault();setNotice("Demo review brief prepared in this browser only. No certificate, lot, supplier or destination eligibility was verified.");}}><label>Destination market<input required value={destination} onChange={e=>setDestination(e.target.value)}/></label><label>Demo lot reference<input required value={lot} onChange={e=>setLot(e.target.value)}/></label><button type="submit">Prepare review brief ↗</button>{notice&&<p role="status">{notice}</p>}</form></div>
  <p className="ahb-assurance-footnote">Decision boundary: evidence completeness is not regulatory approval. Halal status, food safety, export eligibility, product grade and destination-market compliance require competent independent review against current rules and actual records.</p>
 </section>,mount);
}
export default QualityHalalExperience;
