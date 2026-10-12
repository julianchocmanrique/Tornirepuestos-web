"use client";
import { useEffect, useRef } from "react";
import { dateTime, type Snapshot } from "@/lib/baile/types";
import { passFor, paymentFor, readyEntry } from "@/lib/baile/reporting";
import { Badge, Music } from "./ui";

export function EnrollmentSummary({ s, participantId, enrollmentId, onClose }: { s: Snapshot; participantId: string; enrollmentId?: string; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const person = s.participants.find(p => p.id === participantId);
  const entries = s.enrollments.filter(e => e.participantId === participantId).sort((a, b) => Number(b.id === enrollmentId) - Number(a.id === enrollmentId));
  useEffect(() => {
    const el = dialog.current;
    el?.showModal();
    return () => { el?.close(); };
  }, []);
  if (!person) return null;
  return <dialog ref={dialog} className="dance-enrollment-summary" aria-labelledby="enrollment-summary-title" onCancel={onClose}>
    <header className="dance-summary-header"><div><p className="dance-eyebrow">RESUMEN DEL PARTICIPANTE</p><h2 id="enrollment-summary-title">{person.name}</h2><p>{person.code}</p></div><button autoFocus className="dance-btn secondary small" onClick={onClose}>Cerrar resumen</button></header>
    <div className="dance-summary-body">
      <section aria-label="Datos del participante"><h3>Datos del participante</h3><dl className="dance-summary-data">
        <div><dt>Documento</dt><dd>{person.document}</dd></div><div><dt>Fecha de nacimiento</dt><dd>{person.birthDate.split("-").reverse().join("/")}</dd></div>
        <div><dt>Ciudad</dt><dd>{person.city}</dd></div><div><dt>Escuela / academia</dt><dd>{person.academy || "Independiente"}</dd></div>
        <div><dt>Correo</dt><dd>{person.email}</dd></div><div><dt>Teléfono / WhatsApp</dt><dd>{person.phone}</dd></div>
        <div><dt>Full Pass</dt><dd><Badge status={passFor(s, person.id)?.status} /></dd></div><div><dt>Registrado</dt><dd>{dateTime(person.createdAt)}</dd></div>
      </dl></section>
      <section aria-label="Categorías y pistas"><h3>Inscripciones y pistas ({entries.length})</h3>
        {!entries.length && <p className="dance-muted">Todavía no tiene inscripciones a categorías.</p>}
        {entries.map(e => { const category = s.categories.find(c => c.id === e.categoryId); return <article className={`dance-summary-entry ${e.id === enrollmentId ? "selected" : ""}`} key={e.id}>
          <div className="dance-panel-title"><div><p className="dance-eyebrow">{e.code}{e.id === enrollmentId ? " · INSCRIPCIÓN SELECCIONADA" : ""}</p><h4>{category?.name || "Categoría no disponible"}</h4><p>{category?.modality} · {category?.division}</p></div><Badge status={paymentFor(s, e.id)?.status} /></div>
          <p><strong>Nombre artístico:</strong> {e.team || person.name}</p><p><strong>Participantes:</strong> {e.members || person.name}</p>
          <p><strong>Competencia:</strong> {readyEntry(s, e) && e.competitionNumber !== null ? `N.º ${String(e.competitionNumber).padStart(3, "0")}` : "Pendiente de habilitación"}</p>
          <div className="dance-summary-music"><strong>Pista musical</strong><Music e={e} />{e.musicUpdatedAt && <small>Actualizada: {dateTime(e.musicUpdatedAt)}</small>}</div>
        </article>; })}
      </section>
    </div>
  </dialog>;
}
