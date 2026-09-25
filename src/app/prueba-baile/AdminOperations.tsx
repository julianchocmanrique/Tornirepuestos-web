"use client";
import { useState } from "react";
import { dateTime, money, statusLabels, type Snapshot } from "@/lib/baile/types";
import { charges, matchesPerson, normalize, passFor, paymentFor, readyEntry } from "@/lib/baile/reporting";
import { Badge, Empty, Stat, Form, Field, Music, exportCsv, type Run } from "./ui";
import { CategoryFilter, ModuleHeading, SearchBar, usePage } from "./AdminShared";

export function EnrollmentsDesk({ s, onPerson }: { s: Snapshot; onPerson: (id: string) => void }) {
  const [query, setQuery] = useState(""), [cat, setCat] = useState(""), [status, setStatus] = useState("");
  const rows = s.enrollments.filter(e => {
    const p = s.participants.find(p => p.id === e.participantId)!;
    return (!cat || e.categoryId === cat) && (!status || (paymentFor(s, e.id)?.status || "missing") === status) && (matchesPerson(p, query) || normalize(`${e.code} ${e.team} ${e.members}`).includes(normalize(query)));
  }).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const page = usePage(rows, `${query}|${cat}|${status}`);
  return <><div className="dance-stats"><Stat label="Inscripciones" value={s.enrollments.length} /><Stat label="Habilitadas" value={s.enrollments.filter(e => readyEntry(s, e)).length} /><Stat label="Sin comprobante" value={s.enrollments.filter(e => !paymentFor(s, e.id)).length} /><Stat label="Pagos en revisión" value={s.payments.filter(p => p.kind === "category" && p.status === "pending").length} /></div><div className="dance-panel">
    <ModuleHeading title="Inscripciones a categorías" detail="Cada fila corresponde a una categoría, con pago, número y pista independientes."><button className="dance-btn secondary small" onClick={() => exportCsv("inscripciones.csv", [["Inscripción", "Participante", "Equipo", "Categoría", "División", "Tarifa", "Pago", "Habilitada", "Número", "Pista"], ...rows.map(e => [e.code, s.participants.find(p => p.id === e.participantId)!.name, e.team, s.categories.find(c => c.id === e.categoryId)!.name, s.categories.find(c => c.id === e.categoryId)!.division, e.fee, paymentFor(s, e.id) ? statusLabels[paymentFor(s, e.id)!.status] : "Por enviar", readyEntry(s, e) ? "Sí" : "No", readyEntry(s, e) ? e.competitionNumber : null, e.musicName || "Pendiente"])])}>Exportar inscripciones</button></ModuleHeading>
    <SearchBar query={query} onQuery={setQuery}><CategoryFilter s={s} value={cat} onChange={setCat} /><select aria-label="Estado del pago de categoría" value={status} onChange={e => setStatus(e.target.value)}><option value="">Todos los pagos</option><option value="missing">Sin comprobante</option>{Object.entries(statusLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></SearchBar>
    <div className="dance-table-wrap"><table><thead><tr><th>Inscripción / titular</th><th>Categoría</th><th>Valor</th><th>Pago categoría</th><th>Competencia</th><th>Pista</th><th>Ficha</th></tr></thead><tbody>{page.rows.map(e => { const p = s.participants.find(p => p.id === e.participantId)!, c = s.categories.find(c => c.id === e.categoryId)!; return <tr key={e.id}><td><strong>{e.team || p.name}</strong><small>{e.code} · {p.name}</small></td><td>{c.name}<small>{c.modality} · {c.division}</small></td><td>{money(e.fee)}</td><td><Badge status={paymentFor(s, e.id)?.status} /></td><td>{readyEntry(s, e) ? `N.º ${String(e.competitionNumber).padStart(3, "0")}` : passFor(s, p.id)?.status !== "approved" ? "Falta Full Pass" : "Pago pendiente"}</td><td>{e.musicId ? "Cargada" : "Pendiente"}</td><td><button className="dance-btn secondary small" onClick={() => onPerson(p.id)}>Ver ficha</button></td></tr>; })}</tbody></table></div>{!rows.length && <Empty>No hay inscripciones con estos filtros.</Empty>}{page.pager}
  </div></>;
}

export function MusicDesk({ s }: { s: Snapshot }) {
  const [query, setQuery] = useState(""), [cat, setCat] = useState(""), [status, setStatus] = useState(""), [busy, setBusy] = useState(false), [error, setError] = useState("");
  const eligible = s.enrollments.filter(e => readyEntry(s, e));
  const rows = eligible.filter(e => (!cat || e.categoryId === cat) && (!status || Boolean(e.musicId) === (status === "uploaded")) && (matchesPerson(s.participants.find(p => p.id === e.participantId)!, query) || normalize(`${e.code} ${e.team} ${e.competitionNumber}`).includes(normalize(query))));
  const page = usePage(rows, `${query}|${cat}|${status}`);
  const downloadable = eligible.filter(e => e.musicId && (!cat || e.categoryId === cat));
  async function download() {
    setBusy(true); setError("");
    try {
      const response = await fetch(`/api/baile/music-export?category=${encodeURIComponent(cat)}`);
      if (!response.ok) throw new Error((await response.json()).error || "No se pudo descargar.");
      const url = URL.createObjectURL(await response.blob()), link = document.createElement("a");
      link.href = url; link.download = "pistas-competencia.zip"; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) { setError(e instanceof Error ? e.message : "Error al descargar las pistas."); } finally { setBusy(false); }
  }
  return <><div className="dance-stats"><Stat label="Competidores habilitados" value={eligible.length} /><Stat label="Pistas recibidas" value={eligible.filter(e => e.musicId).length} /><Stat label="Pistas pendientes" value={eligible.filter(e => !e.musicId).length} /></div><div className="dance-panel">
    <ModuleHeading title="Cabina de música" detail="Escuchar una pista no cambia estados de competencia ni calificaciones."><button className="dance-btn secondary small" disabled={busy || !downloadable.length} onClick={download}>{busy ? "Preparando ZIP…" : `ZIP ${cat ? "de la categoría" : "del evento"} (${downloadable.length})`}</button></ModuleHeading>
    <p className="dance-muted">El ZIP contiene todas las pistas habilitadas de la categoría seleccionada, sin el filtro de búsqueda. Máximo 100 MB por descarga.</p>
    {error && <p className="dance-inline-error" role="alert">{error}</p>}
    <SearchBar query={query} onQuery={setQuery}><CategoryFilter s={s} value={cat} onChange={setCat} /><select aria-label="Estado de pista" value={status} onChange={e => setStatus(e.target.value)}><option value="">Todas las pistas</option><option value="uploaded">Recibidas</option><option value="missing">Pendientes</option></select></SearchBar>
    {page.rows.map(e => { const c = s.categories.find(c => c.id === e.categoryId)!, p = s.participants.find(p => p.id === e.participantId)!; return <article className="dance-track" key={e.id}><div className="dance-track-number">{String(e.competitionNumber).padStart(3, "0")}</div><div><h3>{e.team || p.name}</h3><p>{c.name} · {e.code}</p><Music e={e} /><small>{e.musicUpdatedAt ? `Recibida: ${dateTime(e.musicUpdatedAt)}` : "El participante todavía debe cargar su archivo."}{c.deadline ? ` · Plazo: ${dateTime(c.deadline)}` : ""}</small></div></article>; })}
    {!rows.length && <Empty>No hay competidores habilitados con estos filtros. La aprobación de ambos pagos habilita la pista.</Empty>}{page.pager}
  </div></>;
}

export function Ledger({ s }: { s: Snapshot }) {
  const [query, setQuery] = useState(""), [kind, setKind] = useState("");
  const all = charges(s), rows = all.filter(r => matchesPerson(r.participant, query) && (!kind || kind === r.kind));
  const page = usePage(rows, `${query}|${kind}`);
  const approved = s.payments.filter(p => p.status === "approved").reduce((n, p) => n + p.amount, 0), pending = s.payments.filter(p => p.status === "pending").reduce((n, p) => n + p.amount, 0);
  return <><div className="dance-stats"><Stat label="Valor de inscripciones" value={money(all.reduce((n, r) => n + r.expected, 0))} /><Stat label="Pagos aprobados" value={money(approved)} /><Stat label="Comprobantes en revisión" value={money(pending)} /><Stat label="Por validar o cobrar" value={money(all.reduce((n, r) => n + r.balance, 0))} /></div><div className="dance-panel">
    <ModuleHeading title="Resumen de pagos" detail="Control de comprobantes, no conciliación bancaria. Los valores pendientes o rechazados no cuentan como recaudo aprobado."><button className="dance-btn secondary small" onClick={() => exportCsv("resumen-pagos.csv", [["Participante", "Código", "Concepto", "Valor inscripción", "Valor reportado", "Estado", "Saldo por validar o cobrar", "Fecha del pago"], ...rows.map(r => [r.participant.name, r.participant.code, r.label, r.expected, r.payment?.amount || 0, r.payment ? statusLabels[r.payment.status] : "Por enviar", r.balance, r.payment?.date || ""])])}>Exportar resumen</button></ModuleHeading>
    <div className="dance-ledger-split">{["fullpass", "category"].map(k => <div key={k}><span>{k === "fullpass" ? "Full Pass aprobados" : "Categorías aprobadas"}</span><strong>{money(s.payments.filter(p => p.kind === k && p.status === "approved").reduce((n, p) => n + p.amount, 0))}</strong></div>)}</div>
    <SearchBar query={query} onQuery={setQuery}><select aria-label="Concepto contable" value={kind} onChange={e => setKind(e.target.value)}><option value="">Full Pass y categorías</option><option value="fullpass">Full Pass</option><option value="category">Categorías</option></select></SearchBar>
    <div className="dance-table-wrap"><table><thead><tr><th>Participante</th><th>Concepto</th><th>Valor inscripción</th><th>Reportado</th><th>Validación</th><th>Por validar o cobrar</th></tr></thead><tbody>{page.rows.map(r => <tr key={r.id}><td>{r.participant.name}<small>{r.participant.code}</small></td><td>{r.label}</td><td>{money(r.expected)}</td><td>{money(r.payment?.amount || 0)}</td><td><Badge status={r.payment?.status} /></td><td>{money(r.balance)}</td></tr>)}</tbody></table></div>{!rows.length && <Empty>No hay movimientos con estos filtros.</Empty>}{page.pager}
    <p className="dance-muted">La tarifa queda fijada al crear el registro o la inscripción. Un excedente en Full Pass no se aplica automáticamente a categorías. No incluye gastos, devoluciones ni facturación.</p>
  </div></>;
}

export function AccreditationDesk({ s, run }: { s: Snapshot; run: Run }) {
  const [query, setQuery] = useState(""), [status, setStatus] = useState("");
  const active = s.accreditations.filter(a => !a.revokedAt);
  const rows = s.participants.filter(p => {
    const a = active.find(a => a.participantId === p.id), ready = passFor(s, p.id)?.status === "approved";
    return (matchesPerson(p, query) || Boolean(a && normalize(a.code).includes(normalize(query)))) && (!status || (status === "checked" ? Boolean(a) : status === "ready" ? ready && !a : !ready));
  });
  const page = usePage(rows, `${query}|${status}`);
  return <><div className="dance-stats"><Stat label="Personas acreditadas" value={active.length} /><Stat label="Listas para acreditar" value={s.participants.filter(p => passFor(s, p.id)?.status === "approved" && !active.some(a => a.participantId === p.id)).length} /><Stat label="Acreditaciones anuladas" value={s.accreditations.filter(a => a.revokedAt).length} /></div><div className="dance-panel">
    <ModuleHeading title="Acreditación y manillas" detail="Solo se acredita al titular de un Full Pass aprobado. El código no se puede reutilizar, incluso si se anula."><button className="dance-btn secondary small" onClick={() => exportCsv("acreditaciones.csv", [["Código participante", "Nombre", "Documento", "Full Pass", "Manilla", "Fecha acreditación"], ...rows.map(p => { const a = active.find(a => a.participantId === p.id); return [p.code, p.name, p.document, passFor(s, p.id) ? statusLabels[passFor(s, p.id)!.status] : "Por enviar", a?.code || "Pendiente", a ? dateTime(a.at) : ""]; })])}>Exportar acreditaciones</button></ModuleHeading>
    <SearchBar query={query} onQuery={setQuery}><select aria-label="Estado de acreditación" value={status} onChange={e => setStatus(e.target.value)}><option value="">Todos</option><option value="checked">Acreditados</option><option value="ready">Listos para acreditar</option><option value="blocked">Full Pass sin aprobar</option></select></SearchBar>
    {page.rows.map(p => { const a = active.find(a => a.participantId === p.id), approved = passFor(s, p.id)?.status === "approved"; return <article className="dance-inline-card" key={p.id}><div className="dance-panel-title"><div><h3>{p.name}</h3><p>{p.code} · {p.document} · {p.city}</p></div><Badge status={passFor(s, p.id)?.status} /></div>{a ? <><div className="dance-wristband"><span>ACREDITADO</span><strong>{a.code}</strong><small>{dateTime(a.at)}</small></div><details><summary>Anular acreditación</summary><Form action="revoke-accreditation" run={run} label="Confirmar anulación"><input type="hidden" name="id" value={a.id} /><Field name="reason" label="Motivo" maxLength={500} /></Form></details></> : approved ? <Form action="accredit" run={run} label="Registrar acreditación"><input type="hidden" name="participantId" value={p.id} /><Field name="code" label="Código de manilla" placeholder="Ejemplo: RC-001" minLength={3} maxLength={32} /></Form> : <p className="dance-muted">Primero valida el comprobante del Full Pass en Pagos.</p>}</article>; })}
    {!rows.length && <Empty>No hay registros con estos filtros.</Empty>}{page.pager}
  </div></>;
}
