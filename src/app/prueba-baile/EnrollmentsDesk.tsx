"use client";
import { StatusEditor } from "./StatusEditor";
import Link from "next/link";
import { useState } from "react";
import { dateTime, statusLabels, type Snapshot } from "@/lib/baile/types";
import { matchesPerson, normalize, paymentFor } from "@/lib/baile/reporting";
import { Empty, Stat, exportCsv, type Run } from "./ui";
import { CategoryFilter, ModuleHeading, SearchBar, usePage } from "./AdminShared";
import { ReceiptViewer } from "./ReceiptViewer";

export function EnrollmentsDesk({ s, run }: { s: Snapshot; run: Run }) {
  const [query, setQuery] = useState(""), [cat, setCat] = useState(""), [status, setStatus] = useState("");
  const rows = s.enrollments.filter(e => {
    const p = s.participants.find(p => p.id === e.participantId), c = s.categories.find(c => c.id === e.categoryId);
    return p && (!cat || e.categoryId === cat) && (!status || (paymentFor(s, e.id)?.status || "missing") === status) && (matchesPerson(p, query) || normalize(`${e.code} ${e.team} ${e.members} ${e.school || ""} ${c?.name || ""}`).includes(normalize(query)));
  }).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const page = usePage(rows, `${query}|${cat}|${status}`);
  return <>
    <div className="dance-stats dance-enrollment-stats"><Stat label="Inscripciones" value={s.enrollments.length} /><Stat label="Sin comprobante" value={s.enrollments.filter(e => !paymentFor(s, e.id)).length} />{Object.entries(statusLabels).map(([value, label]) => <Stat key={value} label={label} value={s.enrollments.filter(e => paymentFor(s, e.id)?.status === value).length} />)}</div>
    <div className="dance-panel">
      <ModuleHeading title="Inscripciones a categorías" detail="Consulta participantes, comprobantes y pistas. Abre Ver para conocer todas las inscripciones del titular.">
        <button className="dance-btn secondary small" onClick={() => exportCsv("inscripciones.csv", [["Inscripción", "Nombre artístico", "Categoría", "Modalidad", "División", "Participantes", "Escuela", "Referencia interna del pago", "Observaciones", "Estado", "Fecha", "Pista"], ...rows.map(e => { const p = s.participants.find(p => p.id === e.participantId)!, c = s.categories.find(c => c.id === e.categoryId), payment = paymentFor(s, e.id); return [e.code, e.team || p.name, c?.name || "", c?.modality || "", c?.division || "", e.members || p.name, e.school || p.academy || "Independiente", payment?.id || "", e.note || payment?.note || "", payment ? statusLabels[payment.status] : "Por enviar", dateTime(e.createdAt), e.musicName || "Pendiente"]; })])}>Exportar inscripciones</button>
      </ModuleHeading>
      <SearchBar query={query} onQuery={setQuery}><CategoryFilter s={s} value={cat} onChange={setCat} /><select aria-label="Estado del pago de categoría" value={status} onChange={e => setStatus(e.target.value)}><option value="">Todos los estados</option><option value="missing">Sin comprobante</option>{Object.entries(statusLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></SearchBar>
      <p className="dance-muted">La referencia corresponde al identificador interno del pago. Desliza la tabla para consultar todas las columnas.</p>
      <div className="dance-table-wrap" tabIndex={0} role="region" aria-label="Tabla de inscripciones"><table className="dance-enrollments-table"><thead><tr><th>Nombre artístico</th><th>Categoría</th><th>División / modalidad</th><th>Participantes</th><th>Escuela</th><th>Ref. pago</th><th>Comprobante</th><th>Observaciones</th><th>Estado</th><th>Fecha</th><th>Acción</th></tr></thead>
        <tbody>{page.rows.map(e => { const p = s.participants.find(p => p.id === e.participantId)!, c = s.categories.find(c => c.id === e.categoryId), payment = paymentFor(s, e.id); return <tr key={e.id}>
          <td><strong>{e.team || p.name}</strong><small>{e.code}</small></td><td>{c?.name || "Categoría no disponible"}</td><td>{c?.division || "Sin división"}<small>{c?.modality}</small></td><td>{e.members || p.name}</td><td>{e.school || p.academy || "Independiente"}</td><td>{payment ? <span title={payment.id}>{payment.id.slice(0, 8)}<small>ID interno</small></span> : "Sin referencia"}</td>
          <td>{payment ? <ReceiptViewer receiptId={payment.receiptId} description={`Comprobante · ${e.team || p.name}`} /> : "Por enviar"}</td><td>{e.note || payment?.note || "Sin observaciones"}</td><td><StatusEditor payment={payment} label={`${e.team || p.name} · ${c?.name || e.code}`} run={run} /></td><td>{dateTime(e.createdAt)}</td><td><Link className="dance-btn secondary small" aria-label={`Ver ficha de ${e.team || p.name}, ${c?.name || e.code}`} href={`/prueba-baile/inscripciones/${encodeURIComponent(e.id)}`}>Ver →</Link></td>
        </tr>; })}</tbody></table></div>
      {!rows.length && <Empty>No hay inscripciones con estos filtros.</Empty>}{page.pager}
    </div>
  </>;
}
