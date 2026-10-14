"use client";
import { useState } from "react";
import { dateTime, usesWeightedScoring, scoringCriteria, SUNFEST_CRITERIA, weightedScore, type Snapshot, type Enrollment } from "@/lib/baile/types";
import { Heading, Empty, Stat, Form, type Run } from "./ui";

type Criteria = ReturnType<typeof scoringCriteria>;
type Values = (number | "")[];
function validValues(values: Values) { return values.every(v => typeof v === "number" && Number.isFinite(v) && v >= 1 && v <= 10); }
function ScoreInputs({ criteria, values, setValues, weighted }: { criteria: Criteria; values: Values; setValues: (values: Values) => void; weighted: boolean }) {
  return <div className="dance-score-grid">{criteria.map((c, i) => <label key={c.name}><span>{c.name}{weighted && <strong className="dance-score-weight">{c.weight}%</strong>}</span><input aria-label={c.name} type="number" inputMode="decimal" min={1} max={10} step={0.01} value={values[i]} required onChange={event => { const next = [...values]; next[i] = event.target.value === "" ? "" : Number(event.target.value); setValues(next); }} /><small>De 1 a 10 · admite dos decimales</small></label>)}</div>;
}
function ScoreTotal({ values, criteria, weighted }: { values: Values; criteria: Criteria; weighted: boolean }) {
  const complete = validValues(values), numbers = values.map(Number), total = numbers.reduce((a, b) => a + b, 0);
  return <div className="dance-score-total" aria-live="polite">{weighted ? <span>Total ponderado <strong>{complete ? weightedScore(numbers, criteria).toFixed(2) : "—"} / 10</strong></span> : <><span>Total <strong>{complete ? total.toFixed(2) : "—"} / {criteria.length * 10}</strong></span><span>Promedio <strong>{complete ? (total / criteria.length).toFixed(2) : "—"} / 10</strong></span></>}</div>;
}
function SunFestPractice() {
  const [values, setValues] = useState<Values>([7.50, 7.52, 7.52, 7.67, 7.48]);
  return <section className="dance-panel" aria-label="Ejercicio de calificación The Sun Fest"><p className="dance-eyebrow">THE SUN FEST · PRÁCTICA DEL JURADO</p><h2>Prueba las cinco áreas de calificación.</h2><p>Modifica las notas para ver el total ponderado. Este ejercicio no guarda ni envía calificaciones y no afecta participantes o resultados.</p><ScoreInputs criteria={SUNFEST_CRITERIA} values={values} setValues={setValues} weighted /><ScoreTotal values={values} criteria={SUNFEST_CRITERIA} weighted /><button className="dance-btn secondary small" onClick={() => setValues([7.50, 7.52, 7.52, 7.67, 7.48])}>Restablecer ejemplo</button></section>;
}
export function Judge({ s, run }: { s: Snapshot; run: Run }) {
  const [cat, setCat] = useState(() => s.categories.find(c => s.enrollments.some(e => e.categoryId === c.id))?.id || s.categories[0]?.id || ""); const entries = s.enrollments.filter(e => e.categoryId === cat); const ownScores = s.scores.filter(x => x.locked);
  const weighted = usesWeightedScoring(s.settings);
  return <section className="dance-container dance-section"><Heading eyebrow={`MESA DE JURADOS / ${s.user?.name}`} title="Tu criterio hace la diferencia." detail="Evalúa cada presentación de forma independiente. Cada criterio se califica de 1 a 10, con dos decimales." />
    {weighted && <div className="dance-callout"><strong>Áreas de calificación del evento</strong><ul>{scoringCriteria(s.settings).map(c => <li key={c.name}>{c.name}: {c.weight}%</li>)}</ul><p>El total de cada jurado es ponderado sobre 10. El resultado final es el promedio de los totales de los jurados asignados.</p></div>}
    {s.settings.demo && s.user?.username === "jurado1" && <SunFestPractice />}
    <div className="dance-stats"><Stat label="Mis categorías" value={s.categories.length} /><Stat label="Notas enviadas" value={ownScores.length} /><Stat label="Por calificar" value={s.enrollments.filter(e => !ownScores.some(x => x.enrollmentId === e.id)).length} /></div><div className="dance-tabs" role="tablist" aria-label="Categorías del evento">{s.categories.map(c => <button key={c.id} role="tab" aria-selected={c.id === cat} className={c.id === cat ? "active" : ""} onClick={() => setCat(c.id)}>{c.name} · {c.modality} · {c.rhythm} · {c.division}</button>)}</div>{!entries.length && <Empty>No hay competidores habilitados en esta categoría todavía.</Empty>}{entries.map(e => <ScoreForm key={e.id + (s.scores.find(x => x.enrollmentId === e.id)?.submittedAt || "")} e={e} s={s} run={run} />)}</section>;
}
function ScoreForm({ e, s, run }: { e: Enrollment; s: Snapshot; run: Run }) {
  const criteria = scoringCriteria(s.settings), weighted = usesWeightedScoring(s.settings);
  const existing = s.scores.find(x => x.enrollmentId === e.id); const [values, setValues] = useState<Values>(existing?.values || criteria.map(() => ""));
  const locked = existing?.locked;
  return <div className="dance-panel"><div className="dance-panel-title"><div><p className="dance-eyebrow">{s.categories.find(c => c.id === e.categoryId)?.name}</p><h2>Competidor {String(e.competitionNumber).padStart(3, "0")}</h2></div><span className={`dance-badge ${locked ? "approved" : "pending"}`}>{locked ? "Enviada y bloqueada" : "Por calificar"}</span></div>{locked ? <><div className="dance-score-grid">{criteria.map((c, i) => <div key={c.name}><span>{c.name}{weighted && ` · ${c.weight}%`}</span><strong>{Number(values[i]).toFixed(2)}</strong></div>)}</div><ScoreTotal values={values} criteria={criteria} weighted={weighted} /><p className="dance-muted">Enviada {dateTime(existing!.submittedAt)}. Para corregirla, solicita autorización a la organización.</p></> : <Form action="score" run={run} label="Enviar y bloquear calificación"><input type="hidden" name="enrollmentId" value={e.id} /><input type="hidden" name="values" value={JSON.stringify(values)} /><ScoreInputs criteria={criteria} values={values} setValues={setValues} weighted={weighted} /><ScoreTotal values={values} criteria={criteria} weighted={weighted} /><label className="dance-check"><input type="checkbox" required /> Confirmo que estas notas corresponden a este número de competencia.</label></Form>}</div>;
}
