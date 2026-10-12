"use client";
import { StatusEditor } from "./StatusEditor";
import { useEffect, useState } from "react";
import { money, statusLabels, type Snapshot } from "@/lib/baile/types";
import { matchesPerson } from "@/lib/baile/reporting";
import { contractorModules } from "./admin-navigation";
import { EnrollmentsDesk } from "./EnrollmentsDesk";
import { Badge, Empty, Field, Form, Receipt, Stat, type Run } from "./ui";

export function Contractor({ s, run }: { s: Snapshot; run: Run }) {
  const [tab, setTab] = useState("Participantes");
  useEffect(() => { const sync = () => setTab(contractorModules.find(m => m.id === window.location.hash.slice(1))?.name || "Participantes"); sync(); window.addEventListener("hashchange", sync); return () => window.removeEventListener("hashchange", sync); }, []);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [kind, setKind] = useState("");
  const [category, setCategory] = useState("");
  const people = s.participants.filter(p => matchesPerson(p, query));
  const payments = s.payments.filter(p => {
    const person = s.participants.find(x => x.id === p.participantId);
    const entry = s.enrollments.find(e => e.id === p.enrollmentId);
    return person && matchesPerson(person, query) && (!status || status === p.status) && (!kind || p.kind === kind) && (!category || entry?.categoryId === category);
  });
  return <section className="dance-admin-shell">
    <aside className="dance-admin-nav"><div className="dance-admin-nav-title"><span className="dance-eyebrow">CONTRATISTA DEL EVENTO</span><strong>Gestión del evento</strong><small>{s.settings.name}</small></div><nav aria-label="Módulos del contratista">{["Participantes", "Inscripciones", "Pagos"].map((name, i) => <button key={name} className={`dance-contractor-tab ${tab === name ? "active" : ""}`} aria-current={tab === name ? "page" : undefined} onClick={() => { setTab(name); setQuery(""); window.location.hash = contractorModules.find(m => m.name === name)!.id; }}><span className="dance-nav-number">0{i + 1}</span>{name}</button>)}</nav><p className="dance-muted">Consulta los registros y valida comprobantes. La configuración y las calificaciones pertenecen a superadministración y jurados.</p></aside>
    <div className="dance-admin-workspace"><div className="dance-admin-title"><div><p className="dance-eyebrow">GESTIÓN / {tab}</p><h1>{tab}</h1><p>Consulta de participantes, inscripciones por categoría y aprobación de transacciones.</p></div></div>
      <div className="dance-stats"><Stat label="Participantes" value={s.participants.length} /><Stat label="Inscripciones" value={s.enrollments.length} /><Stat label="Pagos por revisar" value={s.payments.filter(p => ["pending", "review"].includes(p.status)).length} /></div>
      {tab === "Participantes" && <div className="dance-panel"><h2>Participantes registrados</h2><label className="dance-field"><span>Buscar participante</span><input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Nombre, documento, código o ciudad" /></label><div className="dance-table-wrap"><table><thead><tr><th>Participante</th><th>Ciudad / academia</th><th>Contacto</th><th>Full Pass</th></tr></thead><tbody>{people.map(p => <tr key={p.id}><td><strong>{p.name}</strong><small>{p.code} · {p.document}</small></td><td>{p.city}<small>{p.academy || "Independiente"}</small></td><td>{p.email}<small>{p.phone}</small></td><td><StatusEditor payment={s.payments.find(x => x.participantId === p.id && x.kind === "fullpass")} label={`${p.name} · Full Pass`} run={run} /></td></tr>)}</tbody></table></div>{!people.length && <Empty>No hay participantes en esta búsqueda.</Empty>}</div>}
      {tab === "Inscripciones" && <EnrollmentsDesk s={s} run={run} />}
      {tab === "Pagos" && <><div className="dance-filters"><input aria-label="Buscar pago por participante" value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar participante" /><select aria-label="Estado del pago" value={status} onChange={e => setStatus(e.target.value)}><option value="">Todos los estados</option>{Object.entries(statusLabels).map(([v, label]) => <option value={v} key={v}>{label}</option>)}</select><select aria-label="Tipo de pago" value={kind} onChange={e => setKind(e.target.value)}><option value="">Todos los pagos</option><option value="fullpass">Full Pass</option><option value="category">Categorías</option></select><select aria-label="Categoría del pago" value={category} onChange={e => setCategory(e.target.value)}><option value="">Todas las categorías</option>{s.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
        {!payments.length && <Empty>No hay comprobantes en esta selección.</Empty>}{payments.map(p => <article className="dance-panel" key={p.id}><p className="dance-eyebrow">{p.kind === "fullpass" ? "FULL PASS" : s.categories.find(c => c.id === s.enrollments.find(e => e.id === p.enrollmentId)?.categoryId)?.name}</p><h2>{s.participants.find(x => x.id === p.participantId)?.name}</h2><p>{money(p.amount)}</p><Receipt payment={p} /><Form action="review" run={run} label="Guardar validación"><input name="paymentId" type="hidden" value={p.id} /><div className="dance-form-grid"><Field label="Resultado de revisión" name="status"><select name="status" defaultValue={p.status}>{Object.entries(statusLabels).map(([v, label]) => <option value={v} key={v}>{label}</option>)}</select></Field><Field label="Observación (obligatoria si se rechaza)" name="note" required={false} value={p.note} maxLength={1000} /></div></Form></article>)}</>}
    </div>
  </section>;
}
