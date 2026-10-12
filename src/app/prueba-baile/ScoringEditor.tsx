"use client";
import "./scoring-editor.css";
import { useState } from "react";
import { scoringCriteria, type ScoringCriterion, type Snapshot } from "@/lib/baile/types";
import type { EventDraft } from "@/lib/baile/event-draft";
import { Form, type Run } from "./ui";
type Model = EventDraft["scoring"];
export function editableCriteria(model: Model, custom: ScoringCriterion[] | null) {
  if (model === "custom-v1" && custom) return custom;
  return scoringCriteria({ scoringScheme: model === "sunfest-v1" ? model : undefined }).map((c, i) => ({ ...c, weight: model === "sunfest-v1" ? c.weight : i === 5 ? 16.65 : 16.67 }));
}
export function ScoringEditor({ model, criteria, onChange }: { model: Model; criteria: ScoringCriterion[] | null; onChange: (model: Model, criteria: ScoringCriterion[] | null) => void }) {
  const rows = editableCriteria(model, criteria), total = rows.reduce((sum, c) => sum + c.weight, 0);
  function update(index: number, change: Partial<ScoringCriterion>) { onChange("custom-v1", rows.map((c, i) => i === index ? { ...c, ...change } : c)); }
  return <div className="dance-form dance-scoring-editor">
    <label className="dance-field"><span>Sistema de calificación</span><select value={model} onChange={e => { const m = e.target.value as Model; onChange(m, m === "custom-v1" ? rows : null); }}><option value="average">Promedio de seis criterios (1 a 10)</option><option value="sum">Suma de seis criterios y todos los jurados</option><option value="sunfest-v1">The Sun Fest: cinco criterios ponderados</option><option value="custom-v1">Personalizado: nombres y porcentajes</option></select></label>
    <h3>Parámetros de calificación</h3><p>Modifica un nombre o porcentaje para personalizar este evento. Las notas se ingresan de 1 a 10.</p>
    {model !== "custom-v1" && model !== "sunfest-v1" && <p className="dance-muted">El modelo predeterminado usa seis criterios con igual peso. Al personalizar, los porcentajes iniciales se ajustan a dos decimales para sumar 100%.</p>}
    {rows.map((c, i) => <div className="dance-criterion-row" key={i}><label className="dance-field"><span>Criterio {i + 1}</span><input required maxLength={120} value={c.name} onChange={e => update(i, { name: e.target.value })} /></label><label className="dance-field"><span>Porcentaje {i + 1}</span><input type="number" required min={0.01} max={100} step={0.01} value={c.weight || ""} onChange={e => update(i, { weight: Number(e.target.value) })} /></label><button type="button" className="dance-btn secondary small" disabled={rows.length === 1} onClick={() => onChange("custom-v1", rows.filter((_, n) => n !== i))}>Quitar criterio {i + 1}</button></div>)}
    <div className="dance-actions"><button type="button" className="dance-btn secondary small" disabled={rows.length >= 12} onClick={() => onChange("custom-v1", [...rows, { name: "", weight: 0 }])}>Añadir criterio</button><strong role="status">Total: {total.toFixed(2)}%{Math.abs(total - 100) > 0.000001 ? " · Debe sumar 100%" : ""}</strong></div>
    {model === "custom-v1" && <p>Resultado: suma de cada nota × su porcentaje, dividida entre 100. La puntuación final promedia los totales de todos los jurados.</p>}
  </div>;
}
export function ScoringSettings({ s, run }: { s: Snapshot; run: Run }) {
  const [model, setModel] = useState<Model>(s.settings.scoringScheme || s.settings.formula);
  const [criteria, setCriteria] = useState<ScoringCriterion[] | null>(s.settings.criteria || null);
  const locked = !!s.scores.length || s.schedule.some(x => ["live", "finished"].includes(x.status));
  return <section className="dance-panel"><h2>Calificación del evento</h2>{locked ? <><p>La calificación ya comenzó. Conservamos estos parámetros para no alterar las notas ni los resultados.</p>{scoringCriteria(s.settings).map(c => <p key={c.name}>{c.name}: {s.settings.formula === "sum" ? "1 a 10 puntos" : `${Number(c.weight.toFixed(2))}%`}</p>)}</> : <Form action="scoring-settings" run={run} label="Guardar parámetros"><input type="hidden" name="model" value={model} /><input type="hidden" name="criteria" value={JSON.stringify(criteria)} /><ScoringEditor model={model} criteria={criteria} onChange={(m, c) => { setModel(m); setCriteria(c); }} /><p className="dance-muted">Puedes modificarlos antes de iniciar la competencia o recibir la primera nota. Los demás eventos no cambian.</p></Form>}</section>;
}
