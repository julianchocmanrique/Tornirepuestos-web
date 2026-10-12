"use client";
import { ReceiptViewer } from "./ReceiptViewer";
import { registrationRhythm } from "@/lib/baile/registration-report";
import { StatusEditor } from "./StatusEditor";
import { useState } from "react";
import { type Snapshot, money, dateTime, statusLabels } from "@/lib/baile/types";
import { ageAt, matchesPerson, normalize, passFor, paymentFor, whatsapp, readyEntry } from "@/lib/baile/reporting";
import { Badge, Stat, Empty, Form, Field, Receipt, Music, exportCsv, today, type Run } from "./ui";
import { ParticipantResults } from "./Competition";
import { SearchBar, CategoryFilter, usePage, ModuleHeading } from "./AdminShared";

export function Registers({ s, run, selectedId, onSelect }: { s: Snapshot; run: Run; selectedId?: string | null; onSelect?: (id: string | null) => void }) {
  const [query, setQuery] = useState(""), [category, setCategory] = useState(""), [status, setStatus] = useState(""), [order, setOrder] = useState("recent");
  const canManage = s.user?.role === "superadmin";
  const [creating, setCreating] = useState(false);
  const rows = s.participants.filter(p => (matchesPerson(p, query) || normalize(p.email).includes(normalize(query))) && (!category || s.enrollments.some(e => e.participantId === p.id && e.categoryId === category)) && (!status || (status === "missing" ? !passFor(s, p.id) : (passFor(s, p.id)?.status || "pending") === status))).sort((a, b) => order === "name" ? a.name.localeCompare(b.name, "es") : b.createdAt.localeCompare(a.createdAt));
  const page = usePage(rows, `${query}|${category}|${status}|${order}`);
  const selected = s.participants.find(p => p.id === selectedId);
  if (creating && canManage) return <NewParticipant s={s} run={run} onCancel={() => setCreating(false)} onCreated={id => { setCreating(false); onSelect?.(id); }} />;
  if (selected && canManage) return <ParticipantDetail s={s} run={run} id={selected.id} onBack={() => onSelect?.(null)} />;
  function download() {
    exportCsv("registros.csv", [["Nombre", "Documento", "Inscripciones", "WhatsApp", "Edad", "Rango", "Salsa", "Bachata", "Comprobante", "Estado", "Fecha"], ...rows.map(p => { const pass = passFor(s, p.id); return [p.name, p.document, s.enrollments.filter(e => e.participantId === p.id).length, p.phone, ageAt(p.birthDate), "Sin definir", registrationRhythm(s, p.id, "Salsa"), registrationRhythm(s, p.id, "Bachata"), pass ? "Recibido" : "Por enviar", pass ? statusLabels[pass.status] : "Pendiente", dateTime(p.createdAt)]; })]);
  }
  return <>
    <div className="dance-stats"><Stat label="Registrados" value={s.participants.length} />{Object.entries(statusLabels).map(([value, label]) => <Stat key={value} label={label} value={s.participants.filter(p => (passFor(s, p.id)?.status || "pending") === value).length} />)}</div>
    <div className="dance-panel">
      <ModuleHeading title="Registro general" detail="Un perfil por persona. El Full Pass se valida por separado de sus categorías."><div className="dance-actions">{canManage && <button className="dance-btn small" onClick={() => setCreating(true)}>Nuevo participante</button>}<button className="dance-btn secondary small" onClick={download}>Exportar registros</button></div></ModuleHeading>
      <SearchBar query={query} onQuery={setQuery}><CategoryFilter s={s} value={category} onChange={setCategory} /><select aria-label="Estado de registro" value={status} onChange={e => setStatus(e.target.value)}><option value="">Todos los estados</option><option value="missing">Sin comprobante</option>{Object.entries(statusLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select><select aria-label="Orden de registros" value={order} onChange={e => setOrder(e.target.value)}><option value="recent">Más recientes</option><option value="name">Nombre A–Z</option></select></SearchBar>
      <p className="dance-muted">El estado corresponde al Full Pass. Salsa y Bachata muestran las divisiones de sus categorías inscritas. El rango de edad no está definido en los registros actuales.</p>
      <div className="dance-table-wrap" tabIndex={0} role="region" aria-label="Tabla de registro"><table><thead><tr>{["Nombre", "Documento", "Inscripciones", "WhatsApp", "Edad", "Rango", "Salsa", "Bachata", "Comprobante", "Estado", "Fecha"].map(label => <th key={label}>{label}</th>)}</tr></thead><tbody>{page.rows.map(p => { const wa = whatsapp(p.phone), pass = passFor(s, p.id); return <tr key={p.id}>
        <td><strong>{p.name}</strong></td><td>{p.document}</td><td>{s.enrollments.filter(e => e.participantId === p.id).length}</td><td>{wa ? <a className="dance-link" href={wa} target="_blank" rel="noreferrer" aria-label={`WhatsApp de ${p.name}`}>WhatsApp ↗</a> : <span title={p.phone}>No disponible</span>}</td><td>{ageAt(p.birthDate)} años</td><td>Sin definir</td><td>{registrationRhythm(s, p.id, "Salsa")}</td><td>{registrationRhythm(s, p.id, "Bachata")}</td><td>{pass ? <ReceiptViewer receiptId={pass.receiptId} description={`Full Pass · ${p.name}`} /> : "Por enviar"}</td><td><StatusEditor payment={pass} label={`${p.name} · Full Pass`} run={run} /></td><td>{dateTime(p.createdAt)}</td>
      </tr>; })}</tbody></table></div>
      {!rows.length && <Empty>No hay registros con estos filtros.</Empty>}{page.pager}
    </div>
  </>;
}

function NewParticipant({ s, run, onCancel, onCreated }: { s: Snapshot; run: Run; onCancel: () => void; onCreated: (id: string) => void }) {
  const create: Run = async (action, data) => {
    const result = await run(action, data);
    if (result?.participantId) onCreated(result.participantId);
    return result;
  };
  return <>
    <button className="dance-btn secondary small" onClick={onCancel}>← Volver a registros</button>
    <div className="dance-panel dance-profile">
      <ModuleHeading title="Nuevo participante" detail="Registra a una persona sin salir de tu cuenta de organización." />
      <div className="dance-callout">Full Pass: {money(s.settings.fullPassFee)}. El nuevo registro quedará sin comprobante; sus pagos y categorías se gestionan por separado. No se envían correos automáticos.</div>
      {!s.settings.registrationOpen && <p className="dance-muted">El registro público está cerrado. Como organización puedes realizar esta inscripción manual.</p>}
      <Form action="admin-register" run={create} label="Crear participante">
        <div className="dance-form-grid">
          <Field name="name" label="Nombre completo" maxLength={200} autoComplete="off" />
          <Field name="document" label="Número de documento" maxLength={30} />
          <Field name="birthDate" label="Fecha de nacimiento" type="date" max={today()} />
          <Field name="city" label="Ciudad / municipio" maxLength={200} />
          <Field name="phone" label="Teléfono / WhatsApp" type="tel" maxLength={30} />
          <Field name="email" label="Correo electrónico del participante" type="email" autoComplete="off" />
          <Field name="academy" label="Academia o grupo" maxLength={200} required={false} />
          <Field name="password" label="Contraseña inicial (mínimo 10 caracteres)" type="password" minLength={10} maxLength={160} autoComplete="new-password" />
        </div>
        <Field name="extra" label="Información adicional" required={false}><textarea name="extra" rows={3} maxLength={2000} /></Field>
        <p className="dance-muted">Entrega el correo y la contraseña inicial al participante por un canal privado para que pueda ingresar a su cuenta.</p>
        <label className="dance-check"><input type="checkbox" name="consent" required /> Confirmo que tengo autorización del participante para registrar sus datos y gestionar su participación en el evento.</label>
      </Form>
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
