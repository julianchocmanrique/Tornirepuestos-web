"use client";
import { useEffect, useId, useRef, useState } from "react";
import type { ResultBreakdown } from "@/lib/baile/results";

type Props = { category: string; name: string; value: number | null; breakdown: ResultBreakdown | null; final?: boolean };

export function ResultViewer(props: Props) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  function close() { setOpen(false); requestAnimationFrame(() => trigger.current?.focus()); }
  return <><button ref={trigger} type="button" className="dance-btn secondary small" aria-haspopup="dialog" aria-label={`Ver detalle de ${props.name}`} disabled={!props.breakdown || props.value === null} onClick={() => setOpen(true)}>Ver detalle</button>
    {open && props.breakdown && props.value !== null && <ResultModal {...props} breakdown={props.breakdown} value={props.value} onClose={close} />}
  </>;
}

function ResultModal({ category, name, value, breakdown, final = true, onClose }: Props & { breakdown: ResultBreakdown; value: number; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId(), helpId = useId();
  useEffect(() => {
    const el = dialog.current, overflow = document.body.style.overflow;
    el?.showModal(); document.body.style.overflow = "hidden";
    return () => { el?.close(); document.body.style.overflow = overflow; };
  }, []);
  const { criteria, judges, contributions, mode } = breakdown;
  const footer = mode === "weighted" ? "Promedio ponderado" : mode === "sum" ? "Suma por criterio" : "Aporte al promedio";
  return <dialog ref={dialog} className="dance-result-modal" aria-labelledby={titleId} aria-describedby={helpId}
    onCancel={event => { event.preventDefault(); onClose(); }}
    onClick={event => { if (event.target !== event.currentTarget) return; const r = event.currentTarget.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) onClose(); }}>
    <button type="button" autoFocus className="dance-receipt-close dance-result-close" aria-label="Cerrar resultado" onClick={onClose}>×</button>
    <header className="dance-result-heading"><p className="dance-eyebrow">{final ? "RESULTADO DEFINITIVO" : "RESULTADO PROVISIONAL"}</p><h2 id={titleId}>{category}</h2><h3>{name}</h3><p className="dance-result-score"><strong>{value.toFixed(2)}</strong> <span>pts</span></p></header>
    <p id={helpId} className="dance-muted">{final ? "Calificaciones finales de todos los jurados." : "La categoría aún no ha finalizado; este resultado es provisional."} Desliza la tabla para consultar todos los criterios.</p>
    <div className="dance-table-wrap dance-result-table" role="region" aria-label="Desglose de calificaciones" tabIndex={0}><table>
      <caption className="dance-sr-only">Notas por jurado y aportes al resultado de {name}</caption>
      <thead><tr><th scope="col">Jurado</th>{criteria.map((c, i) => <th scope="col" key={i}>{c.name}{mode !== "sum" && <small>{Number(c.weight.toFixed(2))}%</small>}</th>)}<th scope="col">{mode === "average" ? "Promedio" : "Total"}</th></tr></thead>
      <tbody>{judges.map((j, i) => <tr key={i}><th scope="row">{j.name}</th>{j.values.map((v, n) => <td key={n}>{v.toFixed(2)}</td>)}<td className="dance-result-judge-total">{j.total.toFixed(2)}</td></tr>)}</tbody>
      <tfoot><tr><th scope="row">{footer}</th>{contributions.map((v, i) => <td key={i}>{v.toFixed(2)}</td>)}<td className="dance-result-final-total">{value.toFixed(2)}</td></tr></tfoot>
    </table></div>
    <p className="dance-result-note">{mode === "sum" ? "El resultado suma las notas de todos los criterios y jurados." : "Cada aporte corresponde al promedio del criterio multiplicado por su porcentaje. El total se calcula sin redondeos intermedios."} Se muestran dos decimales.</p>
  </dialog>;
}
