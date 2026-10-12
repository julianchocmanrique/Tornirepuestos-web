"use client";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { statusLabels, type Payment, type Status } from "@/lib/baile/types";
import { Badge, type Run } from "./ui";

export function StatusEditor({ payment, label, run }: { payment?: Payment; label: string; run: Run }) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  if (!payment) return <span className="dance-status-missing"><Badge /><small>Primero debe enviar el comprobante.</small></span>;
  function close() { setOpen(false); requestAnimationFrame(() => trigger.current?.focus()); }
  return <>
    <button ref={trigger} type="button" className="dance-status-trigger" aria-haspopup="dialog" aria-label={`Cambiar estado de ${label}: ${statusLabels[payment.status]}`} onClick={() => setOpen(true)}><Badge status={payment.status} /><span aria-hidden="true">⌄</span></button>
    {open && <StatusDialog payment={payment} label={label} run={run} onClose={close} />}
  </>;
}

function StatusDialog({ payment, label, run, onClose }: { payment: Payment; label: string; run: Run; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null), titleId = useId();
  const [status, setStatus] = useState<Status>(payment.status);
  const [note, setNote] = useState(payment.note);
  const [busy, setBusy] = useState(false), [error, setError] = useState("");
  useEffect(() => {
    const dialog = ref.current!;
    dialog.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { dialog.close(); document.body.style.overflow = overflow; };
  }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setError("");
    const data = new FormData();
    data.set("paymentId", payment.id); data.set("status", status); data.set("note", note.trim());
    try {
      let failure = "";
      const result = await run("review", data, message => { failure = message; });
      if (result && !result.error) onClose();
      else setError(failure || result?.error || "No se pudo guardar. Vuelve a intentarlo.");
    } catch { setError("No se pudo guardar. Comprueba tu conexión e inténtalo de nuevo."); }
    finally { setBusy(false); }
  }
  return <dialog ref={ref} className="dance-status-dialog" aria-labelledby={titleId} onCancel={event => { event.preventDefault(); if (!busy) onClose(); }}>
    <header><div><p className="dance-eyebrow">VALIDACIÓN</p><h2 id={titleId}>Cambiar estado</h2></div><button type="button" className="dance-btn secondary small" aria-label="Cerrar editor de estado" disabled={busy} onClick={onClose}>×</button></header>
    <p>{label}</p><p className="dance-muted">{payment.kind === "fullpass" ? "Este cambio corresponde al Full Pass. No modifica los pagos de categorías." : "Este cambio corresponde solo a esta inscripción. No modifica el Full Pass ni las otras categorías."}</p>
    <form onSubmit={submit}><fieldset disabled={busy}>
      <label className="dance-field"><span>Estado</span><select autoFocus value={status} onChange={event => setStatus(event.target.value as Status)}>{Object.entries(statusLabels).map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select></label>
      <label className="dance-field"><span>{status === "rejected" ? "Motivo del rechazo (obligatorio)" : "Observación (opcional)"}</span><textarea value={note} onChange={event => setNote(event.target.value)} required={status === "rejected"} maxLength={1000} rows={3} /></label>
      {error && <p className="dance-status-error" role="alert">{error}</p>}
      <div className="dance-actions"><button type="submit" className="dance-btn">{busy ? "Guardando…" : "Guardar estado"}</button><button type="button" className="dance-btn secondary" onClick={onClose}>Cancelar</button></div>
    </fieldset></form>
  </dialog>;
}
