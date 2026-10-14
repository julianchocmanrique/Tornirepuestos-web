"use client";
import { useId, useState } from "react";
import { dateTime, usesWeightedScoring, scoringCriteria, SUNFEST_CRITERIA, weightedScore, SCORE_SCALE, validScore, type Snapshot, type Enrollment } from "@/lib/baile/types";
import { Empty, Form, type Run } from "./ui";
import { judgeQueue, searchText } from "@/lib/baile/judge-workspace";
import "./judge.css";
import { CompetitorAvatar } from "./CompetitorAvatar";
import { JudgeAvatar, JudgePhotoEditor } from "./JudgeAvatar";

type Criteria = ReturnType<typeof scoringCriteria>;
type Values = (number | "")[];
// Historical scores may predate the two-decimal input rule; keep their totals visible.
function validValues(values: Values) { return values.every(v => typeof v === "number" && Number.isFinite(v) && v >= SCORE_SCALE.min && v <= SCORE_SCALE.max); }
function ScoreInput({ name, weight, value, onChange }: { name: string; weight?: number; value: number | ""; onChange: (value: number | "") => void }) {
  const id = useId(), [error, setError] = useState("");
  return <label><span>{name}{weight !== undefined && <strong className="dance-score-weight">{weight}%</strong>}</span><input aria-label={name} aria-describedby={`${id}-hint`} aria-invalid={!!error} type="number" inputMode="decimal" min={SCORE_SCALE.min} max={SCORE_SCALE.max} step={SCORE_SCALE.step} value={value} required onChange={event => {
    const raw = event.currentTarget.value, next = raw === "" ? "" : Number(raw);
    const message = next !== "" && !validScore(next) ? `Valor no aplicado. Usa una nota de ${SCORE_SCALE.min} a ${SCORE_SCALE.max}, con máximo ${SCORE_SCALE.decimals} decimales.` : "";
    event.currentTarget.setCustomValidity(message);
    setError(message);
    if (!message) onChange(next);
  }} /><small id={`${id}-hint`} className={error ? "judge-score-error" : "judge-score-hint"} role={error ? "alert" : undefined}>{error || `${SCORE_SCALE.min} a ${SCORE_SCALE.max} · Hasta ${SCORE_SCALE.decimals} decimales`}</small></label>;
}
function ScoreInputs({ criteria, values, setValues, weighted }: { criteria: Criteria; values: Values; setValues: (values: Values) => void; weighted: boolean }) {
  return <div className="dance-score-grid">{criteria.map((c, i) => <ScoreInput key={c.name} name={c.name} weight={weighted ? c.weight : undefined} value={values[i]} onChange={value => { const next = [...values]; next[i] = value; setValues(next); }} />)}</div>;
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
  const queue = judgeQueue(s);
  const [cat, setCat] = useState(() => queue.initialCategory);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState("");
  const [drafts, setDrafts] = useState<Record<string, Values>>({});
  const categories = s.categories.filter(c => searchText(`${c.name} ${c.modality} ${c.rhythm} ${c.division}`).includes(searchText(search)));
  const category = categories.find(c => c.id === cat) || categories[0];
  const entries = queue.entries.filter(e => e.categoryId === category?.id);
  const visible = entries.filter(e => status === "all" || (status === "sent" ? queue.submitted.has(e.id) : !queue.submitted.has(e.id)));
  const entry = visible.find(e => e.id === selected) || visible.find(e => !queue.submitted.has(e.id)) || visible[0];
  const score = queue.scores.find(x => x.enrollmentId === entry?.id);
  const weighted = usesWeightedScoring(s.settings);
  const nextPending = queue.pending.find(e => e.id !== entry?.id);
  return <section className="dance-container judge-workspace">
    <header className="judge-heading"><div className="judge-identity"><JudgeAvatar name={s.user?.name || "Jurado"} photoId={s.user?.photoId} demo={s.settings.demo} size="large" /><div><p className="dance-eyebrow">MESA DE JURADOS / {s.user?.name}</p><h1>Panel de calificación</h1><p>{s.settings.name}</p></div></div><div className="judge-progress"><span><strong>{queue.completed}</strong> de {queue.entries.length} presentaciones calificadas</span><progress aria-label="Progreso de calificación" value={queue.completed} max={queue.entries.length || 1} /><small>{queue.pending.length} pendientes · {s.categories.length} categorías</small></div></header>
    {s.user && <JudgePhotoEditor judge={s.user} demo={s.settings.demo} run={run} />}
    <details className="judge-help"><summary>Criterios y guía de calificación <span>Notas de 1 a 10</span></summary><div className="judge-criteria">{scoringCriteria(s.settings).map(c => <span key={c.name}>{c.name}<strong>{weighted ? `${c.weight}%` : "Igual peso"}</strong></span>)}</div><p>Califica con hasta dos decimales. {weighted ? "El total de cada jurado es ponderado sobre 10." : "El total se calcula como el promedio de los criterios."} Las notas quedan bloqueadas al enviarlas.</p></details>
    <div className="judge-layout"><aside className="judge-sidebar" aria-label="Seleccionar presentación">
      <div className="judge-sidebar-controls"><p className="dance-eyebrow">01 / SELECCIONA</p><h2>Categoría y competidor</h2>
        <label className="dance-field"><span>Buscar categoría</span><input type="search" placeholder="Salsa, pareja, principiante…" value={search} onChange={e => setSearch(e.target.value)} /></label>
        <label className="dance-field"><span>Categoría <small>({categories.length})</small></span><select value={category?.id || ""} disabled={!categories.length} onChange={e => { setCat(e.target.value); setSelected(""); }}>{!categories.length && <option value="">Sin coincidencias</option>}{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
        <label className="dance-field"><span>Mostrar presentaciones</span><select value={status} onChange={e => setStatus(e.target.value)}><option value="all">Todas ({entries.length})</option><option value="pending">Por calificar ({entries.filter(e => !queue.submitted.has(e.id)).length})</option><option value="sent">Enviadas ({entries.filter(e => queue.submitted.has(e.id)).length})</option></select></label>
      </div>
      <div className="judge-entry-list" aria-label="Competidores" aria-live="polite">{visible.map(e => <button key={e.id} aria-pressed={e.id === entry?.id} onClick={() => setSelected(e.id)}><strong>{String(e.competitionNumber).padStart(3, "0")}</strong><span>Competidor<small>{queue.submitted.has(e.id) ? "Calificación enviada" : "Por calificar"}</small></span><span aria-hidden="true">{e.id === entry?.id ? "→" : ""}</span></button>)}{!visible.length && <p className="judge-list-empty">{!categories.length ? "No encontramos esa categoría. Prueba otra búsqueda." : !entries.length ? "Aún no hay competidores habilitados." : "No hay presentaciones con este estado."}</p>}</div>
      {search && <button className="dance-btn secondary small judge-clear" onClick={() => setSearch("")}>Limpiar búsqueda</button>}
    </aside><div className="judge-main">
      {category && <div className="judge-category"><p className="dance-eyebrow">02 / CALIFICA LA PRESENTACIÓN</p><h2>{category.name}</h2><p>{[category.modality, category.rhythm, category.division].filter(Boolean).join(" · ")}</p></div>}
      {entry ? <ScoreForm key={`${entry.id}:${score?.submittedAt || ""}:${!!score?.locked}`} e={entry} s={s} run={run} draft={drafts[`${entry.id}:${score?.submittedAt || ""}`]} onDraft={values => setDrafts(previous => ({ ...previous, [`${entry.id}:${score?.submittedAt || ""}`]: values }))} /> : <Empty>{!categories.length ? "Busca una categoría para continuar." : entries.length ? "No hay calificaciones para mostrar con este filtro." : "Las presentaciones aparecerán cuando la organización las habilite."}</Empty>}
      <div className="judge-workspace-footer"><p>Los cambios sin enviar se conservan al cambiar de competidor. No cierres ni recargues la página antes de enviarlos.</p>{nextPending && <button className="dance-btn secondary small" onClick={() => { setSearch(""); setStatus("all"); setCat(nextPending.categoryId); setSelected(nextPending.id); }}>Ir a otra pendiente</button>}</div>
    </div></div>
    {s.settings.demo && s.user?.username === "jurado1" && <details className="judge-help"><summary>Ejercicio de práctica <span>No afecta resultados</span></summary><SunFestPractice /></details>}
  </section>;
}
function ScoreForm({ e, s, run, draft, onDraft }: { e: Enrollment; s: Snapshot; run: Run; draft?: Values; onDraft: (values: Values) => void }) {
  const criteria = scoringCriteria(s.settings), weighted = usesWeightedScoring(s.settings);
  const existing = s.scores.find(x => x.enrollmentId === e.id && x.judgeId === s.user?.id);
  const [values, updateValues] = useState<Values>(existing?.locked ? existing.values : draft || existing?.values || criteria.map(() => ""));
  const setValues = (next: Values) => { updateValues(next); onDraft(next); };
  const locked = existing?.locked;
  return <div className="dance-panel"><div className="dance-panel-title"><div className="competitor-identity"><CompetitorAvatar entry={e} group={s.categories.find(c => c.id === e.categoryId)?.modality !== "Solista"} /><div><p className="dance-eyebrow">{s.categories.find(c => c.id === e.categoryId)?.name}</p><h2>Competidor {String(e.competitionNumber).padStart(3, "0")}</h2></div></div><span className={`dance-badge ${locked ? "approved" : "pending"}`}>{locked ? "Enviada y bloqueada" : "Por calificar"}</span></div>{locked ? <><div className="dance-score-grid">{criteria.map((c, i) => <div key={c.name}><span>{c.name}{weighted && ` · ${c.weight}%`}</span><strong>{Number(values[i]).toFixed(2)}</strong></div>)}</div><ScoreTotal values={values} criteria={criteria} weighted={weighted} /><p className="dance-muted">Enviada {dateTime(existing!.submittedAt)}. Para corregirla, solicita autorización a la organización.</p></> : <Form action="score" run={run} label="Enviar y bloquear calificación"><input type="hidden" name="enrollmentId" value={e.id} /><input type="hidden" name="values" value={JSON.stringify(values)} /><ScoreInputs criteria={criteria} values={values} setValues={setValues} weighted={weighted} /><ScoreTotal values={values} criteria={criteria} weighted={weighted} /><label className="dance-check"><input type="checkbox" required /> Confirmo que estas notas corresponden a este número de competencia.</label></Form>}</div>;
}
