"use client";
import { useState } from "react";
import { dateTime, stageLabels, type Snapshot, type ScheduleSlot } from "@/lib/baile/types";
import { readyEntry } from "@/lib/baile/reporting";
import { Empty, Form, Field, Stat, exportCsv, type Run } from "./ui";
import { ModuleHeading } from "./AdminShared";

export function ScheduleDesk({ s, run }: { s: Snapshot; run: Run }) {
  const [day, setDay] = useState("");
  const date = (iso: string) => new Date(Date.parse(iso) - 5 * 3600000).toISOString().slice(0, 10);
  const days = [...new Set(s.schedule.map(x => date(x.startAt)))].sort();
  const rows = [...s.schedule].filter(x => !day || date(x.startAt) === day).sort((a, b) => a.startAt.localeCompare(b.startAt) || a.stage.localeCompare(b.stage));
  return <>
    <div className="dance-stats"><Stat label="Bloques programados" value={s.schedule.filter(x => x.status !== "cancelled").length} /><Stat label="En tarima" value={s.schedule.filter(x => x.status === "live").length} /><Stat label="Finalizados" value={s.schedule.filter(x => x.status === "finished").length} /></div>
    <div className="dance-panel"><ModuleHeading title="Minuto a minuto" detail="Programación en hora de Colombia. La reproducción de audio nunca cambia estos estados."><button className="dance-btn secondary small" onClick={() => exportCsv("programacion.csv", [["Categoría", "Inicio Colombia", "Duración minutos", "Escenario", "Estado", "Observación"], ...rows.map(x => [s.categories.find(c => c.id === x.categoryId)!.name, dateTime(x.startAt), x.duration, x.stage, stageLabels[x.status], x.note])])}>Exportar programa</button></ModuleHeading>
      <div className="dance-callout">Para pasar a tarima se requieren competidores habilitados, pistas y jurados. Para finalizar, todas las calificaciones deben estar enviadas. Finalizar cierra la categoría y bloquea los resultados de forma definitiva: revisa las notas antes de hacerlo.</div>
      <details className="dance-inline-card"><summary>Agregar bloque de competencia</summary><ScheduleForm s={s} run={run} /></details>
      <div className="dance-filters"><select aria-label="Día del programa" value={day} onChange={e => setDay(e.target.value)}><option value="">Todos los días</option>{days.map(d => <option key={d}>{d}</option>)}</select></div>
      {rows.map((x, i) => { const entries = s.enrollments.filter(e => e.categoryId === x.categoryId && readyEntry(s, e)), judges = s.judges.filter(j => j.categories.includes(x.categoryId)); return <article className="dance-schedule-card" key={x.id}><div className="dance-schedule-time"><span>{String(i + 1).padStart(2, "0")}</span><strong>{dateTime(x.startAt)}</strong><small>{x.duration} min · {x.stage}</small></div><div><div className="dance-panel-title"><h3>{s.categories.find(c => c.id === x.categoryId)!.name}</h3><span className={`dance-badge stage-${x.status}`}>{stageLabels[x.status]}</span></div><p>{entries.length} competidores habilitados · {entries.filter(e => e.musicId).length} pistas · {judges.length} jurados</p>{x.note && <p>{x.note}</p>}<details><summary>Horario y estado</summary><ScheduleForm s={s} run={run} slot={x} /></details></div></article>; })}
      {!rows.length && <Empty>Agrega el primer bloque indicando categoría, horario y escenario.</Empty>}
    </div>
  </>;
}
function ScheduleForm({ s, run, slot }: { s: Snapshot; run: Run; slot?: ScheduleSlot }) {
  const locked = Boolean(slot && ["live", "finished", "cancelled"].includes(slot.status));
  const date = slot ? new Date(Date.parse(slot.startAt) - 5 * 3600000).toISOString().slice(0, 16) : "";
  const options = slot ? ({ planned: ["planned", "backstage", "live", "cancelled"], backstage: ["backstage", "planned", "live", "cancelled"], live: ["live", "finished"], finished: ["finished"], cancelled: ["cancelled"] } as const)[slot.status] : ["planned"] as const;
  const adjustedRun: Run = (action, form) => { form.set("startAt", locked ? slot!.startAt : `${form.get("startInput")}:00-05:00`); return run(action, form); };
  return <Form action="schedule" run={adjustedRun} label={slot ? "Guardar bloque" : "Crear bloque"}><input type="hidden" name="id" value={slot?.id || ""} />
    {slot ? <input type="hidden" name="categoryId" value={slot.categoryId} /> : <Field label="Categoría" name="categoryId"><select name="categoryId" required><option value="">Selecciona una categoría</option>{s.categories.filter(c => !s.schedule.some(x => x.categoryId === c.id && x.status !== "cancelled")).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>}
    <div className="dance-form-grid"><Field name="startInput" label="Inicio (hora de Colombia)" type="datetime-local" value={date} readOnly={locked} /><Field name="duration" label="Duración del bloque en minutos" type="number" min={1} max={240} value={slot?.duration || 15} readOnly={locked} /><Field name="stage" label="Escenario" value={slot?.stage || "Principal"} maxLength={80} readOnly={locked} /><Field name="status" label="Estado"><select name="status" defaultValue={slot?.status || "planned"}>{options.map(v => <option key={v} value={v}>{stageLabels[v]}</option>)}</select></Field></div>
    <Field name="note" label="Observación interna del bloque" required={false}><textarea name="note" rows={2} maxLength={1000} defaultValue={slot?.note || ""} /></Field>
    {locked && <p className="dance-muted">El horario y escenario quedan bloqueados al iniciar o cerrar el bloque.</p>}
  </Form>;
}
