"use client";
import Link from "next/link";
import { useEffect, useRef, useState, type InputHTMLAttributes } from "react";
import { EVENT_CATEGORIES, eventHref, type EventListing } from "@/lib/baile/event-catalog";
import { emptyCategory, emptyPass, type EventDraft } from "@/lib/baile/event-draft";
import { useSavedEventDraft } from "./useSavedEventDraft";
import { useDanceScope } from "./DanceScope";
import { money } from "@/lib/baile/types";
import { categoryIdentity } from "@/lib/baile/category-identity";
import { CategoryExcel } from "./CategoryExcel";
import { ScoringEditor } from "./ScoringEditor";
import type { Run } from "./ui";
import "./create-event.css";

const steps = ["Evento", "Fecha y portada", "Pases y pagos", "Categorías", "Calificación", "Equipo", "Revisar"];
function Input({ label, value, onValue, multiline, required = true, ...props }: Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> & { label: string; value: string; onValue: (value: string) => void; multiline?: boolean }) {
  return <label className="dance-field"><span>{label}{!required && " (opcional)"}</span>{multiline ? <textarea value={value} onChange={e => onValue(e.target.value)} required={required} maxLength={props.maxLength} rows={4} /> : <input {...props} value={value} onChange={e => onValue(e.target.value)} required={required} />}</label>;
}
function Check({ label, value, onValue }: { label: string; value: boolean; onValue: (value: boolean) => void }) {
  return <label className="dance-check"><input type="checkbox" checked={value} onChange={e => onValue(e.target.checked)} />{label}</label>;
}

export function CreateEvent({ run, events = [], demoEnabled, userId }: { run: Run; events?: EventListing[]; demoEnabled: boolean; userId: string }) {
  const { eventId } = useDanceScope();
  const saved = useSavedEventDraft(JSON.stringify([userId, eventId || "root"]), demoEnabled);
  const { draft, setDraft, step, setStep, cover, setCover, ready } = saved;
  const [busy, setBusy] = useState(false), [error, setError] = useState("");
  const [preview, setPreview] = useState("");
  const [confirm, setConfirm] = useState(false), [created, setCreated] = useState("");
  const form = useRef<HTMLFormElement>(null), title = useRef<HTMLHeadingElement>(null);
  const coverInput = useRef<HTMLInputElement>(null);
  useEffect(() => { title.current?.focus(); }, [step, created, ready]);
  useEffect(() => {
    if (!cover) { setPreview(""); return; }
    const url = URL.createObjectURL(cover); setPreview(url); return () => URL.revokeObjectURL(url);
  }, [cover]);
  function change<K extends keyof EventDraft>(key: K, value: EventDraft[K]) { setDraft(d => ({ ...d, [key]: value })); setConfirm(false); }
  async function importCategories(rows: EventDraft["categories"]) {
    const existing = draft.categories.filter(c => c.name.trim());
    const keys = new Map(existing.map(c => [categoryIdentity(c), c]));
    for (const c of rows) {
      const old = keys.get(categoryIdentity(c));
      if (old && Number(old.fee) !== Number(c.fee)) throw Error(`La categoría ${c.name} ya está en el borrador con otro precio. Revísala antes de importar.`);
    }
    const added = rows.filter(c => !keys.has(categoryIdentity(c)));
    if (existing.length + added.length > 60) throw Error("El evento admite hasta 60 categorías.");
    change("categories", [...existing, ...added]);
    return `${added.length} categorías añadidas al borrador. Revisa los datos antes de publicar.`;
  }
  function next() {
    setError("");
    if (!form.current?.reportValidity()) return;
    if (step === 1 && !cover) { setError("Sube la fotografía o el afiche del evento."); return; }
    if (step === 0 && events.some(e => e.id === draft.id)) { setError("Ese enlace ya pertenece a otro evento. Elige otro identificador."); return; }
    if (step === 1 && draft.end < draft.start) { setError("La fecha final no puede ser anterior al inicio."); return; }
    if (step === 2 && !draft.passes.some(p => p.canCompete)) { setError("Incluye un pase con derecho de competidor."); return; }
    if (step === 4 && draft.scoring === "custom-v1" && Math.abs((draft.criteria || []).reduce((sum, c) => sum + c.weight, 0) - 100) > 0.000001) { setError("Los porcentajes deben sumar 100%."); return; }
    setStep(i => Math.min(i + 1, steps.length - 1));
  }
  async function publish() {
    if (busy || !confirm) return;
    if (!cover) { setError("Sube la fotografía o el afiche del evento."); setStep(1); return; }
    if ((draft.contractor && draft.contractor.password.length < 10) || draft.judges.some(j => j.password.length < 10)) { setError("Por seguridad, las contraseñas no se guardan en el borrador. Escríbelas de nuevo antes de publicar."); setConfirm(false); setStep(5); return; }
    setBusy(true); setError("");
    try {
      const data = new FormData(); data.set("event", JSON.stringify(draft)); data.set("confirm", "publish"); if (cover) data.set("cover", cover);
      const result = await run("create-event", data, setError);
      if (result?.eventUrl) {
        await saved.clear();
        setCreated(result.eventUrl);
        setDraft(d => ({ ...d, contractor: null, judges: [] }));
        setCover(null);
      }
    } finally { setBusy(false); }
  }
  async function reset() { setBusy(true); try { if (await saved.reset()) { setCreated(""); setConfirm(false); setError(""); if (coverInput.current) coverInput.current.value = ""; } } finally { setBusy(false); } }
  if (!ready) return <div className="dance-panel" role="status">Recuperando tu borrador…</div>;
  return <div className="event-builder">
    {saved.status === "error" && <p className="dance-notice error" role="alert">No se pudo acceder al borrador en este navegador. No cierres ni recargues si tienes cambios pendientes; comprueba que el almacenamiento del navegador esté disponible.</p>}
    {created ? <section className="dance-panel"><p className="dance-eyebrow">EVENTO PUBLICADO</p><h2 ref={title} tabIndex={-1}>{draft.name} ya tiene su espacio</h2><p>La página pública, los pases y las categorías están listos. Los registros están {draft.registrationOpen ? "abiertos" : "cerrados"}.</p><p>Ingresa al nuevo panel con tu cuenta de superadministración. Los accesos del equipo solo funcionan en este evento.</p><div className="dance-actions"><Link className="dance-btn" href={created}>Ver página del evento</Link><Link className="dance-btn secondary" href={`${created}/acceso`}>Administrar evento</Link><button className="dance-btn secondary" onClick={reset}>Crear otro evento</button></div><p className="dance-muted">Desde el nuevo panel puedes completar el minuto a minuto, añadir jurados y ajustar las tarifas antes de recibir inscripciones.</p></section> : <>
      <div className="dance-callout">Cada evento tendrá su propia página, participantes, inscripciones, comprobantes, pistas y resultados. No se copiarán registros de otros eventos.</div>
      <div className="event-draft-status"><div><p role="status" aria-live="polite">{saved.status === "saving" ? "Guardando borrador…" : saved.status === "saved" ? "Borrador guardado en este navegador." : saved.status === "error" ? "Borrador sin guardar." : "Guardado automático activado."}</p><small>{saved.restored ? "Recuperamos tus datos y fotografía. " : "Puedes recargar después de que termine el guardado. "}Las contraseñas no se guardan. El borrador no se publica ni se sincroniza con otros dispositivos.</small></div><button type="button" className="dance-btn secondary small" disabled={busy} onClick={() => { if (window.confirm("¿Descartar los datos y la fotografía de este borrador? Los eventos publicados no se modificarán.")) void reset(); }}>Descartar borrador</button></div>
      <ol className="event-builder-steps" aria-label="Pasos para crear el evento">{steps.map((label, i) => <li key={label} aria-current={step === i ? "step" : undefined}><span>{String(i + 1).padStart(2, "0")}</span>{label}</li>)}</ol>
      <form ref={form} className="dance-form dance-panel" onSubmit={e => { e.preventDefault(); if (step === steps.length - 1) void publish(); else next(); }}>
        <fieldset disabled={busy}><p className="dance-eyebrow">PASO {step + 1} DE {steps.length}</p><h2 ref={title} tabIndex={-1}>{steps[step]}</h2>
          {error && <p className="dance-notice error" role="alert">{error}</p>}
          {step === 0 && <>
            <div className="dance-form-grid"><Input label="Nombre del evento" value={draft.name} onValue={v => change("name", v)} maxLength={100} /><Input label="Identificador del enlace" value={draft.id} onValue={v => change("id", v)} pattern="[a-z0-9][a-z0-9-]{2,59}" minLength={3} maxLength={60} placeholder="festival-caribe-2027" /></div>
            <p className="dance-muted event-builder-url">Página: /j2rankia/eventos/{draft.id || "tu-evento"}. Este identificador es único y no se cambia después.</p>
            <div className="dance-form-grid"><label className="dance-field"><span>Tipo de evento</span><select value={draft.category} onChange={e => change("category", e.target.value as EventDraft["category"])}>{EVENT_CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></label><Input label="Ritmos o disciplinas" value={draft.genre} onValue={v => change("genre", v)} maxLength={80} placeholder="Salsa y bachata" /></div>
            <Input label="Frase del evento" value={draft.tagline} onValue={v => change("tagline", v)} maxLength={200} />
            <Input label="Resumen para la página de inicio" value={draft.description} onValue={v => change("description", v)} multiline maxLength={2000} />
            {demoEnabled && <Check label="Evento de prueba: mostrar que no se deben realizar pagos reales" value={draft.demo} onValue={v => change("demo", v)} />}
            <p className="dance-muted">La clasificación organiza la agenda. Este asistente usa el sistema actual de competencia: pases, modalidades solista/pareja/grupo y calificación por jurados.</p>
          </>}
          {step === 1 && <>
            <div className="dance-form-grid"><Input label="Fecha inicial" type="date" value={draft.start} onValue={v => change("start", v)} /><Input label="Fecha final" type="date" min={draft.start} value={draft.end} onValue={v => change("end", v)} /><Input label="Ciudad" value={draft.city} onValue={v => change("city", v)} maxLength={100} /><Input label="Sede y dirección" value={draft.venue} onValue={v => change("venue", v)} maxLength={200} /></div>
            <label className="dance-field"><span>Fotografía o afiche del evento (JPG o PNG, máximo 5 MB)</span><input ref={coverInput} type="file" accept="image/jpeg,image/png" required={!cover} onChange={e => { const file = e.target.files?.[0] || null; setConfirm(false); if (file && (file.size > 5 * 1024 ** 2 || !["image/jpeg", "image/png"].includes(file.type))) { setCover(null); setError("Usa una imagen JPG o PNG de máximo 5 MB."); e.target.value = ""; return; } setCover(file); setError(""); }} /></label>
            {cover && <p>{cover.name} <button type="button" className="dance-text-link" onClick={() => { setCover(null); setConfirm(false); if (coverInput.current) coverInput.current.value = ""; }}>Quitar fotografía</button></p>}
            {preview && <img className="event-builder-cover" src={preview} alt={draft.imageAlt} />}
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
            <CategoryExcel onApply={importCategories} />
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
            <ScoringEditor model={draft.scoring} criteria={draft.criteria} onChange={(model, criteria) => { setDraft(d => ({ ...d, scoring: model, criteria })); setConfirm(false); }} />
            <p>Las notas se bloquean cuando el jurado las envía. Las posiciones finales requieren todas las calificaciones y el cierre de la categoría por la organización.</p>
            <p className="dance-muted">El modelo elegido no cambia las notas ni la configuración de los eventos existentes. El envío automático por WhatsApp todavía no está activado.</p>
          </>}
          {step === 5 && <>
            <p>Tu cuenta global de superadministración podrá gestionar el nuevo evento. Estos accesos son opcionales y exclusivos del evento; también puedes crearlos después desde Ajustes y Jurados.</p>
            <Check label="Crear acceso para el contratista" value={!!draft.contractor} onValue={v => change("contractor", v ? { name: "", email: "", password: "" } : null)} />
            {draft.contractor && <section className="event-builder-item"><h3>Contratista del evento</h3><p>Visualiza registros e inscripciones y valida los comprobantes de pago.</p><div className="dance-form-grid">{(["name", "email", "password"] as const).map(key => <Input key={key} label={{ name: "Nombre del contratista", email: "Correo del contratista", password: "Contraseña del contratista" }[key]} value={draft.contractor![key]} type={key === "name" ? "text" : key} minLength={key === "password" ? 10 : undefined} maxLength={key === "password" ? 160 : 200} autoComplete={key === "password" ? "new-password" : "off"} onValue={v => change("contractor", { ...draft.contractor!, [key]: v })} />)}</div></section>}
            {draft.judges.map((j, i) => <section className="event-builder-item" key={i}><div className="dance-panel-title"><h3>Jurado {i + 1}</h3><button type="button" className="dance-text-link" onClick={() => change("judges", draft.judges.filter((_, n) => n !== i))}>Quitar jurado {i + 1}</button></div><div className="dance-form-grid">{(["name", "email", "password"] as const).map(key => <Input key={key} label={`${{ name: "Nombre", email: "Correo", password: "Contraseña" }[key]} del jurado ${i + 1}`} type={key === "name" ? "text" : key} value={j[key]} minLength={key === "password" ? 10 : undefined} maxLength={key === "password" ? 160 : 200} autoComplete={key === "password" ? "new-password" : "off"} onValue={v => change("judges", draft.judges.map((x, n) => n === i ? { ...x, [key]: v } : x))} />)}</div><p>Calificará todas las categorías de este evento, incluidas las que añadas después.</p></section>)}
            <button type="button" className="dance-btn secondary small" disabled={draft.judges.length >= 20} onClick={() => change("judges", [...draft.judges, { name: "", email: "", password: "", categories: [] }])}>Añadir jurado</button>
            <p className="dance-muted">Contraseñas de al menos 10 caracteres. No se envían por correo ni se publican. Compártelas de forma privada con cada integrante.</p>
          </>}
          {step === 6 && <>
            {preview && <img className="event-builder-cover" src={preview} alt={draft.imageAlt} />}
            <h3>{draft.name}</h3><p>{draft.description}</p><div className="event-builder-summary"><p><b>Tipo</b>{draft.category} / {draft.genre}</p><p><b>Fechas</b>{draft.start} al {draft.end}</p><p><b>Ubicación</b>{draft.city}: {draft.venue}</p><p><b>Modo</b>{draft.demo ? "Ejemplo de prueba, sin pagos reales" : "Evento real"}</p><p><b>Equipo inicial</b>{draft.contractor ? "1 contratista" : "Sin contratista"} · {draft.judges.length} jurados</p><p><b>Calificación</b>{draft.scoring === "custom-v1" ? "Criterios y porcentajes personalizados" : draft.scoring === "sunfest-v1" ? "Promedio ponderado The Sun Fest" : draft.scoring === "sum" ? "Suma de criterios" : "Promedio de criterios"}</p></div>
            <h3>Pases</h3>{draft.passes.map((p, i) => <div className="dance-list-row" key={i}><span>{p.name} · {p.canCompete ? "Puede competir" : "Acompañante"}</span><strong>{money(Number(p.fee))}</strong></div>)}
            <h3>Categorías</h3>{draft.categories.map((c, i) => <div className="dance-list-row" key={i}><span>{c.name} · {c.modality} · {c.division}</span><strong>{money(Number(c.fee))}</strong></div>)}
            <h3>Instrucciones de pago</h3><p className="event-builder-payment">{draft.paymentInstructions}</p>
            <Check label="Abrir registros generales al publicar" value={draft.registrationOpen} onValue={v => change("registrationOpen", v)} /><Check label="Abrir inscripciones a categorías al publicar" value={draft.categoryRegistrationOpen} onValue={v => change("categoryRegistrationOpen", v)} />
            <p>La página aparecerá en el inicio de RANKIA. Puedes mantener los registros cerrados mientras completas los horarios y el equipo de jurados.</p>
            <label className="dance-check"><input type="checkbox" checked={confirm} required onChange={e => setConfirm(e.target.checked)} />He revisado los datos y quiero crear y publicar este evento.</label>
          </>}
          <div className="event-builder-actions">{step > 0 && <button type="button" className="dance-btn secondary" onClick={() => { setStep(n => n - 1); setError(""); }}>Anterior</button>}<button className="dance-btn" type="submit" disabled={busy || (step === 6 && !confirm)}>{busy ? "Creando evento…" : step === 6 ? "Crear y publicar evento" : "Continuar"}</button></div>
        </fieldset>
      </form>
    </>}
    <section className="dance-panel"><h2>Eventos disponibles</h2><p>Cada evento tiene un acceso y un panel propios.</p>{events.map(e => <div className="event-builder-existing" key={e.id}><div><strong>{e.name}</strong><small>{e.city} · {e.date}{e.demo ? " · Prueba" : ""}</small></div><div className="dance-actions"><Link className="dance-text-link" href={eventHref(e.id)}>Ver evento</Link><Link className="dance-text-link" href={`${eventHref(e.id)}/acceso`}>Administrar</Link></div></div>)}</section>
  </div>;
}
