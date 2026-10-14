"use client";
import { useEffect, useId, useRef, useState, type ReactNode, type FormEvent } from "react";
import { dateTime, type PublicUser, type Snapshot } from "@/lib/baile/types";
import { judgeDeletionBlock } from "@/lib/baile/judge-policy";
import { JudgeAvatar, JudgePhotoEditor } from "./JudgeAvatar";
import { JudgeForm } from "./Competition";
import { Empty, type Run } from "./ui";

function JudgeDialog({ title, onClose, busy = false, children }: { title: string; onClose: () => void; busy?: boolean; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null), titleId = useId();
  useEffect(() => {
    const dialog = ref.current!, overflow = document.body.style.overflow;
    const trigger = document.activeElement as HTMLElement | null;
    dialog.showModal(); document.body.style.overflow = "hidden";
    return () => { dialog.close(); document.body.style.overflow = overflow; trigger?.focus(); };
  }, []);
  return <dialog ref={ref} className="dance-status-dialog dance-judge-modal" aria-labelledby={titleId} onCancel={event => { event.preventDefault(); if (!busy) onClose(); }}>
    <header><h2 id={titleId}>{title}</h2><button autoFocus type="button" className="dance-receipt-close" aria-label="Cerrar ficha de jurado" disabled={busy} onClick={onClose}>×</button></header>
    {children}
  </dialog>;
}

function DeleteJudge({ s, judge, run, onClose }: { s: Snapshot; judge: PublicUser; run: Run; onClose: () => void }) {
  const [busy, setBusy] = useState(false), [error, setError] = useState("");
  const blocked = judgeDeletionBlock(s, judge);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || blocked) return;
    const data = new FormData(event.currentTarget);
    setBusy(true); setError("");
    try {
      let failure = "";
      const result = await run("judge-delete", data, message => { failure = message; });
      if (result && !result.error) onClose();
      else setError(failure || result?.error || "No se pudo eliminar el jurado. Intenta nuevamente.");
    } catch { setError("No se pudo conectar. Intenta nuevamente."); }
    finally { setBusy(false); }
  }
  return <JudgeDialog title="Eliminar jurado" onClose={onClose} busy={busy}>
    <p><strong>{judge.name}</strong><br />{judge.email}</p>
    <p>Se eliminarán su cuenta y sus asignaciones. Sus sesiones se cerrarán y no podrá ingresar. Esta acción no se puede deshacer.</p>
    {blocked ? <p role="alert" className="dance-callout">{blocked}</p> : <form onSubmit={submit}><fieldset disabled={busy}>
      <input type="hidden" name="judgeId" value={judge.id} />
      <label className="dance-check"><input type="checkbox" name="confirmId" value={judge.id} required />Confirmo que deseo eliminar a este jurado.</label>
      {error && <p role="alert" className="dance-status-error">{error}</p>}
      <div className="dance-actions"><button type="submit" className="dance-btn dance-danger">{busy ? "Eliminando…" : "Eliminar definitivamente"}</button><button type="button" className="dance-btn secondary" onClick={onClose}>Cancelar</button></div>
    </fieldset></form>}
  </JudgeDialog>;
}

export function JudgesDesk({ s, run }: { s: Snapshot; run: Run }) {
  const [viewId, setViewId] = useState<string | null>(null), [deleteId, setDeleteId] = useState<string | null>(null);
  const viewed = s.judges.find(judge => judge.id === viewId), deleting = s.judges.find(judge => judge.id === deleteId);
  return <>
    <details className="dance-panel"><summary>Crear acceso de jurado</summary><JudgeForm s={s} run={run} /></details>
    {!s.judges.length && <Empty>Todavía no hay jurados registrados.</Empty>}
    <div className="dance-judges-grid">{s.judges.map(judge => {
      const blocked = judgeDeletionBlock(s, judge);
      return <article className="dance-panel dance-judge-card" key={judge.id}>
        <JudgeAvatar name={judge.name} photoId={judge.photoId} demo={s.settings.demo} size="large" /><h2>{judge.name}</h2><p>{judge.email}</p>
        <p className="dance-muted">{judge.categories.length} categorías asignadas · {s.scores.filter(score => score.judgeId === judge.id).length} calificaciones</p>
        <div className="dance-actions"><button className="dance-btn secondary small" onClick={() => setViewId(judge.id)} aria-label={`Visualizar a ${judge.name}`}>Visualizar</button><button className="dance-btn dance-danger small" disabled={Boolean(blocked)} aria-label={`Eliminar a ${judge.name}`} aria-describedby={blocked ? `judge-block-${judge.id}` : undefined} onClick={() => setDeleteId(judge.id)}>Eliminar</button></div>
        {blocked && <p className="dance-muted" id={`judge-block-${judge.id}`}>{blocked}</p>}
      </article>;
    })}</div>
    {viewed && <JudgeDialog title="Ficha del jurado" onClose={() => setViewId(null)}>
      <JudgeAvatar name={viewed.name} photoId={viewed.photoId} demo={s.settings.demo} size="large" /><JudgePhotoEditor judge={viewed} demo={s.settings.demo} run={run} /><dl className="dance-entry-facts"><div><dt>Nombre</dt><dd>{viewed.name}</dd></div><div><dt>Correo</dt><dd>{viewed.email}</dd></div>{viewed.username && <div><dt>Usuario</dt><dd>{viewed.username}</dd></div>}</dl>
      <h3>Categorías asignadas</h3><ul>{viewed.categories.map(id => <li key={id}>{s.categories.find(category => category.id === id)?.name || "Categoría no disponible"}</li>)}</ul>
      <h3>Calificaciones del jurado</h3>
      {!s.scores.some(score => score.judgeId === viewed.id) && <p className="dance-muted">Todavía no ha enviado calificaciones.</p>}
      {s.scores.filter(score => score.judgeId === viewed.id).map(score => { const entry = s.enrollments.find(e => e.id === score.enrollmentId); return <div className="dance-inline-card" key={score.id}><strong>{s.categories.find(c => c.id === entry?.categoryId)?.name || "Categoría no disponible"} · {entry?.code || "Inscripción no disponible"}</strong><p>{score.values.join(" / ")} · Total: {score.values.reduce((a, b) => a + b, 0).toFixed(2)}</p><small>{dateTime(score.submittedAt)} · {score.locked ? "Bloqueada" : "Edición autorizada"}</small></div>; })}
      <details className="dance-entry-editor"><summary>Editar datos y categorías del jurado</summary><JudgeForm key={viewed.id} s={s} run={run} judge={viewed} /></details>
    </JudgeDialog>}
    {deleting && <DeleteJudge key={deleting.id} s={s} judge={deleting} run={run} onClose={() => setDeleteId(null)} />}
  </>;
}
