"use client";
import { useDanceScope } from "./DanceScope";
import { useEffect, useId, useRef, useState } from "react";

export function ReceiptViewer({ receiptId, label = "Visualizar", description = "Comprobante de pago" }: { receiptId: string; label?: string; description?: string }) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  function close() { setOpen(false); requestAnimationFrame(() => trigger.current?.focus()); }
  return <><button ref={trigger} type="button" className="dance-receipt-trigger" aria-haspopup="dialog" onClick={() => setOpen(true)}>{label}</button>
    {open && <ReceiptModal receiptId={receiptId} description={description} onClose={close} />}
  </>;
}

function ReceiptModal({ receiptId, description, onClose }: { receiptId: string; description: string; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [file, setFile] = useState<{ url: string; mime: string } | null>(null);
  const [error, setError] = useState("");
  const [smallImage, setSmallImage] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const { fileUrl } = useDanceScope();
  const endpoint = fileUrl(receiptId);
  useEffect(() => {
    const el = dialog.current, overflow = document.body.style.overflow;
    el?.showModal(); document.body.style.overflow = "hidden";
    return () => { el?.close(); document.body.style.overflow = overflow; };
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    let objectUrl: string | undefined;
    setFile(null); setError(""); setSmallImage(false);
    async function load() {
      try {
        const response = await fetch(endpoint, { cache: "no-store", credentials: "same-origin", signal: controller.signal });
        if (!response.ok) throw new Error(response.status === 401 ? "Tu sesión terminó. Cierra el visor e inicia sesión nuevamente." : response.status === 403 ? "Tu perfil no tiene acceso a este comprobante." : "No se pudo cargar el comprobante. Intenta nuevamente.");
        const blob = await response.blob();
        if (controller.signal.aborted) return;
        if (!["image/png", "image/jpeg", "image/webp", "application/pdf"].includes(blob.type)) throw new Error("Este formato no admite vista previa. Puedes descargar el archivo.");
        objectUrl = URL.createObjectURL(blob); setFile({ url: objectUrl, mime: blob.type });
      } catch (e) { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : "No se pudo cargar el comprobante."); }
    }
    load();
    // La vista previa privada se libera al cerrar; no se conserva en almacenamiento local.
    return () => { controller.abort(); if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [endpoint, attempt]);
  return <dialog ref={dialog} className="dance-receipt-modal" aria-labelledby={titleId} onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target !== event.currentTarget) return; const r = event.currentTarget.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) onClose(); }}>
    <header className="dance-receipt-header"><div><p className="dance-eyebrow">VISTA PREVIA</p><h2 id={titleId}>{description}</h2></div><button type="button" autoFocus className="dance-receipt-close" aria-label="Cerrar comprobante" onClick={onClose}>×</button></header>
    <div className="dance-receipt-content" aria-busy={!file && !error}>
      {!file && !error && <p role="status">Cargando comprobante…</p>}
      {error && <div className="dance-receipt-error" role="alert"><p>{error}</p><button type="button" className="dance-btn secondary small" onClick={() => setAttempt(n => n + 1)}>Reintentar</button></div>}
      {file && !error && (file.mime === "application/pdf" ? <iframe title="Comprobante PDF" src={file.url} /> : <img src={file.url} alt={description} onLoad={event => setSmallImage(event.currentTarget.naturalWidth < 10 || event.currentTarget.naturalHeight < 10)} onError={() => setError("La imagen no se puede mostrar. Descárgala para revisar el archivo original.")} />)}
    </div>
    <footer className="dance-receipt-footer"><p>{smallImage ? "La imagen cargada es muy pequeña y puede no contener información legible." : file?.mime === "application/pdf" ? "Si tu navegador no muestra el PDF, puedes descargarlo." : "Cierra con la X o presiona Esc para volver a la tabla."}</p><a className="dance-btn secondary small" href={`${endpoint}?download=1`}>Descargar comprobante</a></footer>
  </dialog>;
}
