"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { EVENT_CATEGORIES, type EventCategory, type EventListing, colombiaDay, eventCatalog, eventDate, latestEvents, upcomingEvents, eventHref, slideOffset } from "@/lib/baile/event-catalog";
import "./event-home.css";

export function EventHome({ demo, catalog = eventCatalog }: { demo: boolean; catalog?: EventListing[] }) {
  const events = catalog.filter(e => demo || !e.demo);
  const slides = latestEvents(events);
  const [index, setIndex] = useState(0), [paused, setPaused] = useState(false), [hover, setHover] = useState(false);
  const [keyboardFocus, setKeyboardFocus] = useState(false), [touching, setTouching] = useState(false), [motionOptIn, setMotionOptIn] = useState(false);
  const [reduced, setReduced] = useState(true), [hidden, setHidden] = useState(false), [today, setToday] = useState("");
  const touch = useRef<{ x: number; y: number } | null>(null);
  const [category, setCategory] = useState<EventCategory | "Todos">("Todos");
  const active = slides.length ? index % slides.length : 0;
  const autoplay = !paused && (!reduced || motionOptIn);
  const running = slides.length > 1 && autoplay && !hover && !keyboardFocus && !touching && !hidden;
  const current = slides[active];
  const upcoming = upcomingEvents(events, today, category);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const motion = () => { setReduced(media.matches); setMotionOptIn(false); };
    const visibility = () => { setHidden(document.hidden); setToday(colombiaDay()); };
    motion(); visibility(); media.addEventListener("change", motion); document.addEventListener("visibilitychange", visibility);
    const clock = window.setInterval(() => setToday(colombiaDay()), 60000);
    return () => { media.removeEventListener("change", motion); document.removeEventListener("visibilitychange", visibility); window.clearInterval(clock); };
  }, []);
  useEffect(() => {
    if (!running) return;
    // A manual change starts a fresh reading interval without permanently stopping playback.
    const timer = window.setTimeout(() => setIndex(i => (i + 1) % slides.length), 6500);
    return () => window.clearTimeout(timer);
  }, [running, slides.length, index]);
  function go(step: number) { setIndex(i => (i + step + slides.length) % slides.length); }
  function togglePlayback() {
    if (autoplay) setPaused(true);
    else { setPaused(false); setMotionOptIn(true); setKeyboardFocus(false); }
  }
  return <div className="event-home">
    <section className="event-intro dance-container"><div><p className="dance-eyebrow"><span className="dance-dot" /> BIENVENIDO A RANKIA</p><h1>Tu talento.<br /><em>En el podio.</em></h1></div><p>Grandes eventos. Talento extraordinario.<br />{" "}Elige tu fecha. Vive la experiencia.</p></section>
    {slides.length > 0 ? <section className="event-showcase" aria-roledescription="carrusel" aria-label="Últimos eventos publicados" onPointerDownCapture={() => setKeyboardFocus(false)} onFocusCapture={e => { if (!(e.target as HTMLElement).classList.contains("event-pause")) setKeyboardFocus((e.target as HTMLElement).matches(":focus-visible")); }} onKeyDownCapture={e => { if (!(e.target as HTMLElement).classList.contains("event-pause")) setKeyboardFocus(true); }} onBlurCapture={e => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setKeyboardFocus(false); }}>
      <div onPointerEnter={e => { if (e.pointerType === "mouse") setHover(true); }} onPointerLeave={() => setHover(false)}>
      <div className="event-coverflow" onKeyDown={e => { if (e.key === "ArrowRight" || e.key === "ArrowLeft") { e.preventDefault(); go(e.key === "ArrowRight" ? 1 : -1); } }} onTouchStart={e => { setTouching(true); touch.current = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY }; }} onTouchCancel={() => { setTouching(false); touch.current = null; }} onTouchEnd={e => { setTouching(false); if (!touch.current) return; const dx = e.changedTouches[0].clientX - touch.current.x, dy = e.changedTouches[0].clientY - touch.current.y; if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1); touch.current = null; }}>
        {slides.map((event, i) => { const offset = slideOffset(i, active, slides.length); return <Link key={event.id} href={eventHref(event.id)} className="event-cover-card" data-position={offset === 0 ? "active" : offset === -1 ? "previous" : offset === 1 ? "next" : "hidden"} tabIndex={i === active ? 0 : -1} aria-hidden={i !== active} aria-label={"Conocer el evento " + event.name}>
          <img src={event.image} alt={event.imageAlt} width={1440} height={960} loading={i === 0 ? "eager" : "lazy"} fetchPriority={i === 0 ? "high" : "auto"} />
          <div className="event-cover-caption"><span>{event.genre} / {event.city}</span><h2>{event.name}</h2><time dateTime={event.date}>{eventDate(event.date)}</time></div>
        </Link>; })}
      </div>
      <div className="event-feature-info" aria-live={running ? "off" : "polite"}><div><p className="dance-eyebrow">EL PRÓXIMO ENCUENTRO EMPIEZA AQUÍ</p><h3>{current.name}</h3><p>{current.description}</p></div><Link className="dance-btn" href={eventHref(current.id)}>Conocer el evento <span aria-hidden="true">↗</span></Link></div>
      </div>
      <div className="event-controls"><div className="event-current"><span>{String(active + 1).padStart(2, "0")}</span><span className="event-control-rule" /><span>{String(slides.length).padStart(2, "0")}</span></div><div className="event-dots" aria-label="Elegir evento">{slides.map((e, i) => <button type="button" key={e.id} aria-label={`Mostrar ${e.name}`} aria-current={i === active ? "true" : undefined} onClick={() => setIndex(i)}><span /></button>)}</div><div className="event-arrows">{slides.length > 1 && <button type="button" className="event-pause" aria-label={autoplay ? "Pausar carrusel" : "Reanudar carrusel"} onClick={togglePlayback}>{autoplay ? "Pausar" : "Reproducir"}</button>}<button type="button" aria-label="Evento anterior" disabled={slides.length < 2} onClick={() => go(-1)}>←</button><button type="button" aria-label="Evento siguiente" disabled={slides.length < 2} onClick={() => go(1)}>→</button></div></div>
    </section> : <div className="dance-container dance-empty">Pronto publicaremos nuevos eventos. Mientras tanto, conoce la plataforma de competencia.</div>}
    <section id="proximos-eventos" className="event-agenda dance-container" aria-labelledby="event-agenda-title"><header className="event-agenda-header"><div><p className="dance-eyebrow">RESERVA LA FECHA</p><h2 id="event-agenda-title">Lo que viene.</h2><p>Próximos eventos, del más cercano al más lejano.</p></div><a className="dance-text-link" href="#como-funciona">¿Cómo participar? <span aria-hidden="true">↗</span></a></header>
      <div className="event-filters" role="group" aria-label="Filtrar eventos por categoría">{(["Todos", ...EVENT_CATEGORIES] as const).map(c => <button key={c} type="button" aria-pressed={c === category} onClick={() => setCategory(c)}>{c}</button>)}<span role="status">{upcoming.length} {upcoming.length === 1 ? "evento" : "eventos"}</span></div>
      {demo && events.some(e => e.demo) && <p className="event-demo-note">Los eventos marcados como «Ejemplo» son demostraciones: sus datos y tarifas no deben usarse para pagos reales.</p>}
      <div className="event-list">{upcoming.map((e, i) => <div key={e.id}>{(i === 0 || upcoming[i - 1].date.slice(0, 7) !== e.date.slice(0, 7)) && <h3 className="event-month">{eventDate(e.date, { month: "long", year: "numeric" })}</h3>}<article className="event-row"><time className="event-date-block" dateTime={e.date}><strong>{e.date.slice(8)}</strong><span>{eventDate(e.date, { month: "short" })}</span></time><img src={e.image} alt={e.imageAlt} width={260} height={174} loading="lazy" /><div className="event-row-copy"><p className="event-row-tag">{e.genre}{e.demo && <span>Ejemplo</span>}</p><h3>{e.name}</h3><p>{e.city} <span aria-hidden="true">·</span> {eventDate(e.date, { weekday: "long", day: "numeric", month: "long" })}</p></div><Link className="event-row-link" aria-label={`Ver evento ${e.name}`} href={eventHref(e.id)}>Ver evento <span aria-hidden="true">↗</span></Link></article></div>)}</div>
      {!upcoming.length && <div className="dance-empty">{category === "Todos" ? "No hay próximos eventos publicados por ahora." : `Todavía no hay próximos eventos de ${category.toLowerCase()}. Selecciona otra categoría o vuelve a Todos.`}</div>}
    </section>
  </div>;
}
