"use client";
import { useState } from "react";
import { type Snapshot, money, dateTime, statusLabels } from "@/lib/baile/types";
import { ageAt, matchesPerson, passFor, paymentFor, whatsapp, readyEntry } from "@/lib/baile/reporting";
import { Badge, Stat, Empty, Form, Field, Receipt, Music, exportCsv, type Run } from "./ui";
import { ParticipantResults } from "./Competition";
import { SearchBar, CategoryFilter, usePage, ModuleHeading } from "./AdminShared";

export function Registers({ s, run, selectedId, onSelect }: { s: Snapshot; run: Run; selectedId: string | null; onSelect: (id: string | null) => void }) {
  const [query, setQuery] = useState(""), [category, setCategory] = useState(""), [status, setStatus] = useState(""), [order, setOrder] = useState("recent");
  const rows = s.participants.filter(p => matchesPerson(p, query) && (!category || s.enrollments.some(e => e.participantId === p.id && e.categoryId === category)) && (!status || (passFor(s, p.id)?.status || "missing") === status)).sort((a, b) => order === "name" ? a.name.localeCompare(b.name, "es") : b.createdAt.localeCompare(a.createdAt));
  const page = usePage(rows, `${query}|${category}|${status}|${order}`);
  const selected = s.participants.find(p => p.id === selectedId);
  if (selected) return <ParticipantDetail s={s} run={run} id={selected.id} onBack={() => onSelect(null)} />;
  function download() {
    exportCsv("registros.csv", [["Código", "Nombre", "Documento", "Ciudad", "Academia", "WhatsApp", "Correo", "Edad", "Full Pass", "Tarifa", "Inscripciones", "Registro"], ...rows.map(p => [p.code, p.name, p.document, p.city, p.academy, p.phone, p.email, ageAt(p.birthDate), passFor(s, p.id) ? statusLabels[passFor(s, p.id)!.status] : "Por enviar", p.fullPassFee ?? s.settings.fullPassFee, s.enrollments.filter(e => e.participantId === p.id).length, dateTime(p.createdAt)])]);
  }
  return <>
    <div className="dance-stats"><Stat label="Registrados" value={s.participants.length} /><Stat label="Full Pass aprobados" value={s.participants.filter(p => passFor(s, p.id)?.status === "approved").length} /><Stat label="Comprobantes por enviar" value={s.participants.filter(p => !passFor(s, p.id)).length} /><Stat label="En revisión" value={s.payments.filter(p => p.kind === "fullpass" && p.status === "pending").length} /></div>
    <div className="dance-panel">
      <ModuleHeading title="Registro general" detail="Un perfil por persona. El Full Pass se valida por separado de sus categorías."><button className="dance-btn secondary small" onClick={download}>Exportar registros</button></ModuleHeading>
      <SearchBar query={query} onQuery={setQuery}><CategoryFilter s={s} value={category} onChange={setCategory} /><select aria-label="Estado de registro" value={status} onChange={e => setStatus(e.target.value)}><option value="">Todos los estados</option><option value="missing">Sin comprobante</option>{Object.entries(statusLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select><select aria-label="Orden de registros" value={order} onChange={e => setOrder(e.target.value)}><option value="recent">Más recientes</option><option value="name">Nombre A–Z</option></select></SearchBar>
      <div className="dance-table-wrap"><table><thead><tr><th>Participante</th><th>Documento / edad</th><th>Ciudad / academia</th><th>Inscripciones</th><th>Full Pass</th><th>Contacto</th><th>Ficha</th></tr></thead><tbody>{page.rows.map(p => { const wa = whatsapp(p.phone); return <tr key={p.id}><td><strong>{p.name}</strong><small>{p.code} · {dateTime(p.createdAt)}</small></td><td>{p.document}<small>{ageAt(p.birthDate)} años</small></td><td>{p.city}<small>{p.academy || "Independiente"}</small></td><td>{s.enrollments.filter(e => e.participantId === p.id).length}</td><td><Badge status={passFor(s, p.id)?.status} /></td><td>{wa ? <a className="dance-link" href={wa} target="_blank" rel="noreferrer">WhatsApp ↗</a> : p.phone}</td><td><button className="dance-btn secondary small" onClick={() => onSelect(p.id)} aria-label={`Ver ficha de ${p.name}`}>Ver ficha</button></td></tr>; })}</tbody></table></div>
      {!rows.length && <Empty>No hay registros con estos filtros.</Empty>}{page.pager}
    </div>
  </>;
}

function ParticipantDetail({ s, run, id, onBack }: { s: Snapshot; run: Run; id: string; onBack: () => void }) {
  const p = s.participants.find(p => p.id === id)!;
  const pass = passFor(s, id), entries = s.enrollments.filter(e => e.participantId === id), note = s.notes.find(n => n.participantId === id);
  const accreditation = s.accreditations.find(a => a.participantId === id && !a.revokedAt);
  const wa = whatsapp(p.phone);
  return <>
    <button className="dance-btn secondary small" onClick={onBack}>← Todos los registros</button>
    <div className="dance-panel dance-profile"><ModuleHeading title={p.name} detail={`${p.code} · Registrado el ${dateTime(p.createdAt)}`}><Badge status={pass?.status} /></ModuleHeading>
      <div className="dance-detail-grid"><p><b>Documento</b>{p.document}</p><p><b>Nacimiento / edad actual</b>{p.birthDate} · {ageAt(p.birthDate)} años</p><p><b>Ciudad</b>{p.city}</p><p><b>Academia</b>{p.academy || "Independiente"}</p><p><b>WhatsApp</b>{wa ? <a className="dance-link" href={wa} target="_blank" rel="noreferrer">{p.phone} ↗</a> : p.phone}</p><p><b>Correo</b><a href={`mailto:${p.email}`}>{p.email}</a></p><p><b>Datos adicionales</b>{p.extra || "Sin información adicional"}</p><p><b>Acreditación</b>{accreditation ? `${accreditation.code} · ${dateTime(accreditation.at)}` : "Pendiente"}</p></div>
      <h3>Full Pass · {money(p.fullPassFee ?? s.settings.fullPassFee)}</h3><Receipt payment={pass} />
      <h3>Inscripciones independientes</h3>{!entries.length && <Empty>Todavía no tiene categorías inscritas.</Empty>}{entries.map(e => <div className="dance-inline-card" key={e.id}><h4>{s.categories.find(c => c.id === e.categoryId)?.name}</h4><p>{e.code} · {readyEntry(s, e) ? `Competidor ${String(e.competitionNumber).padStart(3, "0")}` : "No habilitado todavía"} · {money(e.fee)}</p>{e.team && <p>{e.team} · {e.members}</p>}<Receipt payment={paymentFor(s, e.id)} /><Music e={e} /></div>)}
      <ParticipantResults s={s} participantId={id} />
      <details className="dance-inline-card"><summary>Observaciones internas</summary><p className="dance-muted">Solo la organización puede verlas.</p><Form action="participant-note" run={run} label="Guardar observación"><input type="hidden" name="participantId" value={id} /><Field name="note" label="Observación interna" required={false}><textarea name="note" maxLength={1500} rows={3} defaultValue={note?.text || ""} /></Field></Form>{note && <small>Actualizada el {dateTime(note.at)}</small>}</details>
      <details><summary>Restablecer acceso del participante</summary><Form action="reset-password" run={run} label="Restablecer contraseña"><input name="userId" type="hidden" value={id} /><Field name="password" label="Nueva contraseña" type="password" minLength={10} maxLength={160} /></Form></details>
    </div>
  </>;
}
