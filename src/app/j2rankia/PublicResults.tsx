"use client";
import { useDanceScope } from "./DanceScope";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Empty, Heading } from "./ui";
import { ResultViewer } from "./ResultViewer";
import type { ResultBreakdown } from "@/lib/baile/results";
type Data = { scoringScheme?: "sunfest-v1" | "custom-v1"; formula: "average" | "sum"; categories: { id: string; name: string; rows: { position: number; number: number; name: string; value: number; breakdown: ResultBreakdown | null }[] }[] };

export function PublicResults() {
  const { base, apiBase } = useDanceScope();
  const [data, setData] = useState<Data | null>(null), [error, setError] = useState(""), [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController(); setError(""); setData(null);
    fetch(`${apiBase}/results`, { cache: "no-store", signal: controller.signal }).then(async r => { if (!r.ok) throw new Error("No se pudieron consultar los resultados."); setData(await r.json()); }).catch(e => { if (!controller.signal.aborted) setError(e.message); });
    return () => controller.abort();
  }, [retry, apiBase]);
  return <section className="dance-container dance-section"><Heading eyebrow="ACCESO PÚBLICO" title="Resultados del evento" detail="Consulta las posiciones definitivas sin crear una cuenta. Las categorías aparecen cuando finalizan y todas sus calificaciones están completas." />
    <Link className="dance-btn secondary small" href={base}>Información del evento</Link>
    {error ? <div role="alert"><p>{error}</p><button className="dance-btn" onClick={() => setRetry(n => n + 1)}>Reintentar</button></div> : !data ? <p role="status">Consultando resultados…</p> : <>
      {!data.categories.length && <Empty>Todavía no hay resultados definitivos. Podrás verlos aquí al finalizar las categorías.</Empty>}
      {data.categories.map(c => <article className="dance-panel" key={c.id}><h2>{c.name}</h2><p>Resultado definitivo · {data.scoringScheme ? "Promedio ponderado de 1 a 10" : data.formula === "average" ? "Promedio de 1 a 10" : "Suma de puntos"} · Los empates comparten posición.</p><div className="dance-table-wrap"><table className="dance-public-results-table"><thead><tr><th>Posición</th><th>Número</th><th>Participante / equipo</th><th>Puntuación</th><th>Detalle</th></tr></thead><tbody>{c.rows.map(r => <tr key={r.number} className={r.position === 1 ? "winner" : ""}><td data-label="Posición">#{r.position}</td><td data-label="Número">{r.number}</td><td data-label="Participante / equipo" className="result-wide">{r.name}</td><td data-label="Puntuación">{r.value.toFixed(2)}</td><td data-label="Detalle" className="result-wide"><ResultViewer category={c.name} name={r.name} value={r.value} breakdown={r.breakdown} /></td></tr>)}</tbody></table></div></article>)}
    </>}
  </section>;
}
