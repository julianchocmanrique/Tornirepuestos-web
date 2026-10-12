"use client";
import Link from "next/link";
import { useEffect, useRef, useState, type InputHTMLAttributes } from "react";
import { EVENT_CATEGORIES, eventHref, type EventListing } from "@/lib/baile/event-catalog";
import { EVENT_COVERS, emptyCategory, emptyPass, newEventDraft, type EventDraft } from "@/lib/baile/event-draft";
import { scoringCriteria, money } from "@/lib/baile/types";
import type { Run } from "./ui";
import "./create-event.css";

const steps = ["Evento", "Fecha y portada", "Pases y pagos", "Categorías", "Calificación", "Equipo", "Revisar"];
function Input({ label, value, onValue, multiline, required = true, ...props }: Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> & { label: string; value: string; onValue: (value: string) => void; multiline?: boolean }) {
  return <label className="dance-field"><span>{label}{!required && " (opcional)"}</span>{multiline ? <textarea value={value} onChange={e => onValue(e.target.value)} required={required} maxLength={props.maxLength} rows={4} /> : <input {...props} value={value} onChange={e => onValue(e.target.value)} required={required} />}</label>;
}
function Check({ label, value, onValue }: { label: string; value: boolean; onValue: (value: boolean) => void }) {
  return <label className="dance-check"><input type="checkbox" checked={value} onChange={e => onValue(e.target.checked)} />{label}</label>;
}

export function CreateEvent({ run, events = [], demoEnabled }: { run: Run; events?: EventListing[]; demoEnabled: boolean }) {
  const [draft, setDraft] = useState<EventDraft>(() => ({ ...newEventDraft(), demo: demoEnabled }));
  const [step, setStep] = useState(0), [busy, setBusy] = useState(false), [error, setError] = useState("");
  const [cover, setCover] = useState<File | null>(null), [preview, setPreview] = useState("");
  const [confirm, setConfirm] = useState(false), [created, setCreated] = useState("");
  const form = useRef<HTMLFormElement>(null), title = useRef<HTMLHeadingElement>(null);
  useEffect(() => { title.current?.focus(); }, [step, created]);
  useEffect(() => {
    if (!cover) { setPreview(""); return; }
    const url = URL.createObjectURL(cover); setPreview(url); return () => URL.revokeObjectURL(url);
  }, [cover]);
  function change<K extends keyof EventDraft>(key: K, value: EventDraft[K]) { setDraft(d => ({ ...d, [key]: value })); setConfirm(false); }
  const criteria = scoringCriteria({ scoringScheme: draft.scoring === "sunfest-v1" ? "sunfest-v1" : undefined });
  function next() {
    setError("");
    if (!form.current?.reportValidity()) return;
    if (step === 0 && events.some(e => e.id === draft.id)) { setError("Ese enlace ya pertenece a otro evento. Elige otro identificador."); return; }
    if (step === 1 && draft.end < draft.start) { setError("La fecha final no puede ser anterior al inicio."); return; }
    if (step === 2 && !draft.passes.some(p => p.canCompete)) { setError("Incluye un pase con derecho de competidor."); return; }
    if (step === 5 && draft.judges.some(j => !j.categories.length)) { setError("Selecciona al menos una categoría para cada jurado."); return; }
    setStep(i => Math.min(i + 1, steps.length - 1));
  }
  async function publish() {
    if (busy || !confirm) return;
    setBusy(true); setError("");
    try {
      const data = new FormData(); data.set("event", JSON.stringify(draft)); data.set("confirm", "publish"); if (cover) data.set("cover", cover);
      const result = await run("create-event", data, setError);
      if (result?.eventUrl) {
        setCreated(result.eventUrl);
        setDraft(d => ({ ...d, contractor: null, judges: [] }));
        setCover(null);
      }
    } finally { setBusy(false); }
  }
  function reset() { setCreated(""); setDraft({ ...newEventDraft(), demo: demoEnabled }); setConfirm(false); setStep(0); setError(""); }
  return <div className="event-builder">
    {created ? <section className="dance-panel"><p className="dance-eyebrow">EVENTO PUBLICADO</p><h2 ref={title} tabIndex={-1}>{draft.name} ya tiene su espacio</h2><p>La página pública, los pases y las categorías están listos. Los registros están {draft.registrationOpen ? "abiertos" : "cerrados"}.</p><p>Ingresa al nuevo panel con tu cuenta de superadministración. Los accesos del equipo solo funcionan en este evento.</p><div className="dance-actions"><Link className="dance-btn" href={created}>Ver página del evento</Link><Link className="dance-btn secondary" href={`${created}/acceso`}>Administrar evento</Link><button className="dance-btn secondary" onClick={reset}>Crear otro evento</button></div><p className="dance-muted">Desde el nuevo panel puedes completar el minuto a minuto, añadir jurados y ajustar las tarifas antes de recibir inscripciones.</p></section> : <>
      <div className="dance-callout">Cada evento tendrá su propia página, participantes, inscripciones, comprobantes, pistas y resultados. No se copiarán registros de otros eventos.</div>
      <ol className="event-builder-steps" aria-label="Pasos para crear el evento">{steps.map((label, i) => <li key={label} aria-current={step === i ? "step" : undefined}><span>{String(i + 1).padStart(2, "0")}</span>{label}</li>)}</ol>
      <form ref={form} className="dance-form dance-panel" onSubmit={e => { e.preventDefault(); if (step === steps.length - 1) void publish(); else next(); }}>
        <fieldset disabled={busy}><p className="dance-eyebrow">PASO {step + 1} DE {steps.length}</p><h2 ref={title} tabIndex={-1}>{steps[step]}</h2>
          {error && <p className="dance-notice error" role="alert">{error}</p>}
          {step === 0 && <>
            <div className="dance-form-grid"><Input label="Nombre del evento" value={draft.name} onValue={v => change("name", v)} maxLength={100} /><Input label="Identificador del enlace" value={draft.id} onValue={v => change("id", v)} pattern="[a-z0-9][a-z0-9-]{2,59}" minLength={3} maxLength={60} placeholder="festival-caribe-2027" /></div>
            <p className="dance-muted event-builder-url">Página: /prueba-baile/eventos/{draft.id || "tu-evento"}. Este identificador es único y no se cambia después.</p>
            <div className="dance-form-grid"><label className="dance-field"><span>Tipo de evento</span><select value={draft.category} onChange={e => change("category", e.target.value as EventDraft["category"])}>{EVENT_CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></label><Input label="Ritmos o disciplinas" value={draft.genre} onValue={v => change("genre", v)} maxLength={80} placeholder="Salsa y bachata" /></div>
            <Input label="Frase del evento" value={draft.tagline} onValue={v => change("tagline", v)} maxLength={200} />
            <Input label="Resumen para la página de inicio" value={draft.description} onValue={v => change("description", v)} multiline maxLength={2000} />
            {demoEnabled && <Check label="Evento de prueba: mostrar que no se deben realizar pagos reales" value={draft.demo} onValue={v => change("demo", v)} />}
            <p className="dance-muted">La clasificación organiza la agenda. Este asistente usa el sistema actual de competencia: pases, modalidades solista/pareja/grupo y calificación por jurados.</p>
          </>}
          {step === 1 && <>
            <div className="dance-form-grid"><Input label="Fecha inicial" type="date" value={draft.start} onValue={v => change("start", v)} /><Input label="Fecha final" type="date" min={draft.start} value={draft.end} onValue={v => change("end", v)} /><Input label="Ciudad" value={draft.city} onValue={v => change("city", v)} maxLength={100} /><Input label="Sede y dirección" value={draft.venue} onValue={v => change("venue", v)} maxLength={200} /></div>
            <label className="dance-field"><span>Portada ilustrativa</span><select value={draft.image} onChange={e => change("image", e.target.value)}>{EVENT_COVERS.map(c => <option key={c.src} value={c.src}>{c.label}</option>)}</select></label>
            <label className="dance-field"><span>O subir la portada del evento (JPG o PNG, máximo 5 MB)</span><input type="file" accept="image/jpeg,image/png" onChange={e => { const file = e.target.files?.[0] || null; if (file && (file.size > 5 * 1024 ** 2 || !["image/jpeg", "image/png"].includes(file.type))) { setError("Usa una imagen JPG o PNG de máximo 5 MB."); e.target.value = ""; return; } setCover(file); setError(""); }} /></label>
            {cover && <p>{cover.name} <button type="button" className="dance-text-link" onClick={() => setCover(null)}>Usar portada ilustrativa</button></p>}
            <img className="event-builder-cover" src={preview || draft.image} alt={draft.imageAlt} />
            <Input label="Descripción de la imagen" value={draft.imageAlt} onValue={v => change("imageAlt", v)} maxLength={200} />
            <p className="dance-muted">La portada y su descripción serán públicas. No subas documentos ni comprobantes personales.</p>
          </>}
          {step === 2 && <>
            <p>Precios en pesos colombianos (COP). Cada pase es por persona; las categorías se cobran por separado. Los pagos se validan con comprobante, no hay cobro automático.</p>
            {draft.passes.map((p, i) => <section className="event-builder-item" key={i}><div className="dance-panel-title"><h3>Pase {i + 1}</h3>{draft.passes.length > 1 && <button type="button" className="dance-text-link" onClick={() => change("passes", draft.passes.filter((_, n) => i !== n))}>Quitar pase {i + 1}</button>}</div>
              <div className="dance-form-grid"><Input label={`Nombre del pase ${i + 1}`} value={p.name} onValue={v => change("passes", draft.passes.map((x, n) => n === i ? { ...x, name: v } : x))} maxLength={100} /><Input label={`Precio del pase ${i + 1} (COP)`} type="number" min={1} max={100000000} step={1} value={p.fee} onValue={v => change("passes", draft.passes.map((x, n) => n === i ? { ...x, fee: v } : x))} /><Input label={`Vigencia del pase ${i + 1}`} type="date" max={draft.end} required={false} value={p.validUntil} onValue={v => change("passes", draft.passes.map((x, n) => n === i ? { ...x, validUntil: v } : x))} /></div>
              <Input label={`Beneficios del pase ${i + 1}, uno por línea`} multiline maxLength={1600} value={p.benefits} onValue={v => change("passes", draft.passes.map((x, n) => n === i ? { ...x, benefits: v } : x))} />
              <Check label={`El pase ${i + 1} permite competir`} value={p.canCompete} onValue={v => change("passes", draft.passes.map((x, n) => n === i ? { ...x, canCompete: v } : x))} />
            </section>)}
            <button type="button" className="dance-btn secondary small" disabled={draft.passes.length >= 12} onClick={() => change("passes", [...draft.passes, { ...emptyPass(), name: "" }])}>Añadir pase</button>
            <Input label="Instrucciones y medios de pago" multiline maxLength={3000} value={draft.paymentInstructions} onValue={v => change("paymentInstructions", v)} />
          </>}
          {step === 3 && <>
            <p>Define las modalidades y tarifas de inscripción. Los plazos de pistas usan la hora de Colombia (UTC−5).</p>
            {draft.categories.map((c, i) => {
              const update = (key: keyof typeof c, value: string) => change("categories", draft.categories.map((x, n) => n === i ? { ...x, [key]: value } : x));
              return <section className="event-builder-item" key={i}><div className="dance-panel-title"><h3>Categoría {i + 1}</h3>{draft.categories.length > 1 && <button type="button" className="dance-text-link" onClick={() => { change("categories", draft.categories.filter((_, n) => n !== i)); change("judges", draft.judges.map(j => ({ ...j, categories: j.categories.filter(n => n !== i).map(n => n > i ? n - 1 : n) }))); }}>Quitar categoría {i + 1}</button>}</div>
                <div className="dance-form-grid"><Input label={`Nombre de categoría ${i + 1}`} value={c.name} onValue={v => update("name", v)} maxLength={120} /><label className="dance-field"><span>Modalidad de categoría {i + 1}</span><select value={c.modality} onChange={e => update("modality", e.target.value)}>{["Solista", "Pareja", "Grupo"].map(m => <option key={m}>{m}</option>)}</select></label><Input label={`Ritmo o disciplina ${i + 1}`} value={c.rhythm} onValue={v => update("rhythm", v)} maxLength={80} /><Input label={`División o nivel ${i + 1}`} value={c.division} onValue={v => update("division", v)} maxLength={80} /><Input label={`Tarifa de categoría ${i + 1} (COP)`} type="number" min={1} max={100000000} step={1} value={c.fee} onValue={v => update("fee", v)} /><Input label={`Vigencia de categoría ${i + 1}`} type="date" max={draft.end} required={false} value={c.validUntil} onValue={v => update("validUntil", v)} /><Input label={`Plazo de pistas ${i + 1}`} type="datetime-local" max={`${draft.end}T23:59`} required={false} value={c.deadline} onValue={v => update("deadline", v)} /></div>
              </section>;
            })}
            <button type="button" className="dance-btn secondary small" disabled={draft.categories.length >= 60} onClick={() => change("categories", [...draft.categories, emptyCategory()])}>Añadir categoría</button>
          </>}
          {step === 4 && <>
            <label className="dance-field"><span>Sistema de calificación</span><select value={draft.scoring} onChange={e => change("scoring", e.target.value as EventDraft["scoring"])}><option value="average">Promedio de seis criterios (1 a 10)</option><option value="sum">Suma de seis criterios y todos los jurados</option><option value="sunfest-v1">Modelo The Sun Fest: cinco criterios ponderados (1 a 10)</option></select></label>
            <div className="event-builder-item"><h3>Parámetros de calificación</h3>{criteria.map(c => <div className="dance-list-row" key={c.name}><span>{c.name}</span><strong>{draft.scoring === "sum" ? "1 a 10 puntos" : `${Number(c.weight.toFixed(2))}%`}</strong></div>)}</div>
            <p>Las notas se bloquean cuando el jurado las envía. Las posiciones finales requieren todas las calificaciones y el cierre de la categoría por la organización.</p>
            <p className="dance-muted">El modelo elegido no cambia las notas ni la configuración de los eventos existentes. El envío automático por WhatsApp todavía no está activado.</p>
          </>}
          {step === 5 && <>
            <p>Tu cuenta global de superadministración podrá gestionar el nuevo evento. Estos accesos son opcionales y exclusivos del evento; también puedes crearlos después desde Ajustes y Jurados.</p>
            <Check label="Crear acceso para el contratista" value={!!draft.contractor} onValue={v => change("contractor", v ? { name: "", email: "", password: "" } : null)} />
            {draft.contractor && <section className="event-builder-item"><h3>Contratista del evento</h3><p>Visualiza registros e inscripciones y valida los comprobantes de pago.</p><div className="dance-form-grid">{(["name", "email", "password"] as const).map(key => <Input key={key} label={{ name: "Nombre del contratista", email: "Correo del contratista", password: "Contraseña del contratista" }[key]} value={draft.contractor![key]} type={key === "name" ? "text" : key} minLength={key === "password" ? 10 : undefined} maxLength={key === "password" ? 160 : 200} autoComplete={key === "password" ? "new-password" : "off"} onValue={v => change("contractor", { ...draft.contractor!, [key]: v })} />)}</div></section>}
            {draft.judges.map((j, i) => <section className="event-builder-item" key={i}><div className="dance-panel-title"><h3>Jurado {i + 1}</h3><button type="button" className="dance-text-link" onClick={() => change("judges", draft.judges.filter((_, n) => n !== i))}>Quitar jurado {i + 1}</button></div><div className="dance-form-grid">{(["name", "email", "password"] as const).map(key => <Input key={key} label={`${{ name: "Nombre", email: "Correo", password: "Contraseña" }[key]} del jurado ${i + 1}`} type={key === "name" ? "text" : key} value={j[key]} minLength={key === "password" ? 10 : undefined} maxLength={key === "password" ? 160 : 200} autoComplete={key === "password" ? "new-password" : "off"} onValue={v => change("judges", draft.judges.map((x, n) => n === i ? { ...x, [key]: v } : x))} />)}</div><p>Categorías que calificará:</p>{draft.categories.map((c, n) => <Check key={n} label={`Jurado ${i + 1}: ${c.name}`} value={j.categories.includes(n)} onValue={v => change("judges", draft.judges.map((x, index) => index === i ? { ...x, categories: v ? [...x.categories, n] : x.categories.filter(k => k !== n) } : x))} />)}</section>)}
            <button type="button" className="dance-btn secondary small" disabled={draft.judges.length >= 20} onClick={() => change("judges", [...draft.judges, { name: "", email: "", password: "", categories: [] }])}>Añadir jurado</button>
            <p className="dance-muted">Contraseñas de al menos 10 caracteres. No se envían por correo ni se publican. Compártelas de forma privada con cada integrante.</p>
          </>}
          {step === 6 && <>
            <img className="event-builder-cover" src={preview || draft.image} alt={draft.imageAlt} />
            <h3>{draft.name}</h3><p>{draft.description}</p><div className="event-builder-summary"><p><b>Tipo</b>{draft.category} / {draft.genre}</p><p><b>Fechas</b>{draft.start} al {draft.end}</p><p><b>Ubicación</b>{draft.city}: {draft.venue}</p><p><b>Modo</b>{draft.demo ? "Ejemplo de prueba, sin pagos reales" : "Evento real"}</p><p><b>Equipo inicial</b>{draft.contractor ? "1 contratista" : "Sin contratista"} · {draft.judges.length} jurados</p><p><b>Calificación</b>{draft.scoring === "sunfest-v1" ? "Promedio ponderado The Sun Fest" : draft.scoring === "sum" ? "Suma de criterios" : "Promedio de criterios"}</p></div>
            <h3>Pases</h3>{draft.passes.map((p, i) => <div className="dance-list-row" key={i}><span>{p.name} · {p.canCompete ? "Puede competir" : "Acompañante"}</span><strong>{money(Number(p.fee))}</strong></div>)}
            <h3>Categorías</h3>{draft.categories.map((c, i) => <div className="dance-list-row" key={i}><span>{c.name} · {c.modality} · {c.division}</span><strong>{money(Number(c.fee))}</strong></div>)}
            <h3>Instrucciones de pago</h3><p className="event-builder-payment">{draft.paymentInstructions}</p>
            <Check label="Abrir registros generales al publicar" value={draft.registrationOpen} onValue={v => change("registrationOpen", v)} /><Check label="Abrir inscripciones a categorías al publicar" value={draft.categoryRegistrationOpen} onValue={v => change("categoryRegistrationOpen", v)} />
            <p>La página aparecerá en el inicio de RANKIA. Puedes mantener los registros cerrados mientras completas los horarios y asignaciones de jurados.</p>
            <label className="dance-check"><input type="checkbox" checked={confirm} required onChange={e => setConfirm(e.target.checked)} />He revisado los datos y quiero crear y publicar este evento.</label>
          </>}
          <div className="event-builder-actions">{step > 0 && <button type="button" className="dance-btn secondary" onClick={() => { setStep(n => n - 1); setError(""); }}>Anterior</button>}<button className="dance-btn" type="submit" disabled={busy || (step === 6 && !confirm)}>{busy ? "Creando evento…" : step === 6 ? "Crear y publicar evento" : "Continuar"}</button></div>
        </fieldset>
      </form>
    </>}
    <section className="dance-panel"><h2>Eventos disponibles</h2><p>Cada evento tiene un acceso y un panel propios.</p>{events.map(e => <div className="event-builder-existing" key={e.id}><div><strong>{e.name}</strong><small>{e.city} · {e.date}{e.demo ? " · Prueba" : ""}</small></div><div className="dance-actions"><Link className="dance-text-link" href={eventHref(e.id)}>Ver evento</Link><Link className="dance-text-link" href={`${eventHref(e.id)}/acceso`}>Administrar</Link></div></div>)}</section>
  </div>;
}
