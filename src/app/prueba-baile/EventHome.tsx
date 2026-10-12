"use client";
import { useEffect, useRef, useState } from "react";
import { colombiaDay, eventCatalog, eventDate, latestEvents, upcomingEvents, type EventListing } from "@/lib/baile/event-catalog";
import "./event-home.css";

function EventDialog({ event, close }: { event: EventListing; close: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current!;
    const previousFocus = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    dialog.showModal(); document.body.style.overflow = "hidden";
    return () => { dialog.close(); document.body.style.overflow = overflow; previousFocus?.focus(); };
  }, []);
  return <dialog ref={ref} className="event-dialog" aria-labelledby="event-detail-title" onCancel={e => { e.preventDefault(); close(); }}>
    <button type="button" className="event-dialog-close" aria-label="Cerrar evento" onClick={close} autoFocus>×</button>
    <img src={event.image} alt={event.imageAlt} width={720} height={400} />
    <div className="event-dialog-copy"><p className="dance-eyebrow">{event.genre} · {event.city}</p><h2 id="event-detail-title">{event.name}</h2><time dateTime={event.date}>{eventDate(event.date)}</time><p>{event.description}</p>{event.demo && <p className="dance-callout">Evento de ejemplo. Nombre, ciudad, fecha e imagen son ilustrativos. No hay inscripciones ni pagos habilitados para este evento.</p>}<button type="button" className="dance-btn secondary" onClick={close}>Volver a la agenda</button></div>
  </dialog>;
}

export function EventHome({ demo }: { demo: boolean }) {
  const events = eventCatalog.filter(e => demo || !e.demo);
  const slides = latestEvents(events);
  const [index, setIndex] = useState(0), [paused, setPaused] = useState(false), [hover, setHover] = useState(false);
  const [reduced, setReduced] = useState(true), [hidden, setHidden] = useState(false), [today, setToday] = useState("");
  const [selected, setSelected] = useState<EventListing | null>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const [genre, setGenre] = useState("Todos");
  const active = slides.length ? index % slides.length : 0;
  const running = slides.length > 1 && !paused && !hover && !reduced && !hidden && !selected;
  const upcoming = upcomingEvents(events, today).filter(e => genre === "Todos" || e.genre === genre);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const motion = () => setReduced(media.matches);
    const visibility = () => { setHidden(document.hidden); setToday(colombiaDay()); };
    motion(); visibility(); media.addEventListener("change", motion); document.addEventListener("visibilitychange", visibility);
    const clock = window.setInterval(() => setToday(colombiaDay()), 60000);
    return () => { media.removeEventListener("change", motion); document.removeEventListener("visibilitychange", visibility); window.clearInterval(clock); };
  }, []);
  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => setIndex(i => (i + 1) % slides.length), 6500);
    return () => window.clearInterval(timer);
  }, [running, slides.length]);
  function go(step: number) { setPaused(true); setIndex(i => (i + step + slides.length) % slides.length); }
  return <div className="event-home">
    <section className="event-intro dance-container"><div><p className="dance-eyebrow"><span className="dance-dot" /> LA DANZA NOS ENCUENTRA</p><h1>Tu próximo <em>escenario.</em></h1></div><p>Descubre los encuentros que nos mueven.<br />{" "}Elige tu fecha. Vive el ritmo.</p></section>
    {slides.length > 0 ? <section className="event-showcase" aria-roledescription="carrusel" aria-label="Últimos eventos publicados" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} onFocusCapture={e => { if (!(e.target as HTMLElement).classList.contains("event-pause")) setPaused(true); }}>
      <div className="event-window" onTouchStart={e => { touch.current = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY }; }} onTouchEnd={e => { if (!touch.current) return; const dx = e.changedTouches[0].clientX - touch.current.x, dy = e.changedTouches[0].clientY - touch.current.y; if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1); touch.current = null; }}>
        <div className="event-track" style={{ transform: `translateX(-${active * 100}%)` }} aria-live={running ? "off" : "polite"}>
          {slides.map((e, i) => <article key={e.id} className="event-slide" aria-roledescription="diapositiva" aria-label={`${i + 1} de ${slides.length}: ${e.name}`} aria-hidden={i !== active} inert={i !== active}>
            <img className="event-photo" src={e.image} alt={e.imageAlt} width={1440} height={960} loading={i === 0 ? "eager" : "lazy"} fetchPriority={i === 0 ? "high" : "auto"} />
            <div className="event-shade" /><div className="event-slide-copy"><p className="event-label">ÚLTIMOS EVENTOS <span>{e.genre}</span></p><h2>{e.name}</h2><p className="event-place">{e.city} <span aria-hidden="true">/</span> <time dateTime={e.date}>{eventDate(e.date)}</time></p><p className="event-description">{e.description}</p><button type="button" className="dance-btn" onClick={() => setSelected(e)}>Conocer el evento <span aria-hidden="true">↗</span></button></div>
            {e.demo && <span className="event-sample">EVENTO DE EJEMPLO</span>}
          </article>)}
        </div>
      </div>
      <div className="event-controls"><div className="event-current"><span>{String(active + 1).padStart(2, "0")}</span><span className="event-control-rule" /><span>{String(slides.length).padStart(2, "0")}</span></div><div className="event-dots" aria-label="Elegir evento">{slides.map((e, i) => <button type="button" key={e.id} aria-label={`Mostrar ${e.name}`} aria-current={i === active ? "true" : undefined} onClick={() => { setPaused(true); setIndex(i); }}><span /></button>)}</div><div className="event-arrows">{!reduced && <button type="button" className="event-pause" aria-label={paused ? "Reanudar carrusel" : "Pausar carrusel"} onClick={() => setPaused(v => !v)}>{paused ? "Reproducir" : "Pausar"}</button>}<button type="button" aria-label="Evento anterior" disabled={slides.length < 2} onClick={() => go(-1)}>←</button><button type="button" aria-label="Evento siguiente" disabled={slides.length < 2} onClick={() => go(1)}>→</button></div></div>
    </section> : <div className="dance-container dance-empty">Pronto publicaremos nuevos eventos. Mientras tanto, conoce la plataforma de competencia.</div>}
    <section id="proximos-eventos" className="event-agenda dance-container" aria-labelledby="event-agenda-title"><header className="event-agenda-header"><div><p className="dance-eyebrow">RESERVA LA FECHA</p><h2 id="event-agenda-title">Lo que viene.</h2><p>Próximos eventos, del más cercano al más lejano.</p></div><a className="dance-text-link" href="#como-funciona">¿Cómo participar? <span aria-hidden="true">↗</span></a></header>
      <div className="event-filters" aria-label="Filtrar eventos por estilo">{["Todos", ...new Set(events.map(e => e.genre))].map(g => <button key={g} type="button" aria-pressed={g === genre} onClick={() => setGenre(g)}>{g}</button>)}<span role="status">{upcoming.length} {upcoming.length === 1 ? "evento" : "eventos"}</span></div>
      {demo && events.some(e => e.demo) && <p className="event-demo-note">Agenda de demostración · Fechas, ciudades y fotografías ilustrativas. No son eventos anunciados.</p>}
      <div className="event-list">{upcoming.map((e, i) => <div key={e.id}>{(i === 0 || upcoming[i - 1].date.slice(0, 7) !== e.date.slice(0, 7)) && <h3 className="event-month">{eventDate(e.date, { month: "long", year: "numeric" })}</h3>}<article className="event-row"><time className="event-date-block" dateTime={e.date}><strong>{e.date.slice(8)}</strong><span>{eventDate(e.date, { month: "short" })}</span></time><img src={e.image} alt={e.imageAlt} width={260} height={174} loading="lazy" /><div className="event-row-copy"><p className="event-row-tag">{e.genre}{e.demo && <span>Ejemplo</span>}</p><h3>{e.name}</h3><p>{e.city} <span aria-hidden="true">·</span> {eventDate(e.date, { weekday: "long", day: "numeric", month: "long" })}</p></div><button type="button" className="event-row-link" aria-label={`Ver evento ${e.name}`} onClick={() => setSelected(e)}>Ver evento <span aria-hidden="true">↗</span></button></article></div>)}</div>
      {!upcoming.length && <div className="dance-empty">{genre === "Todos" ? "No hay próximos eventos publicados por ahora." : "No hay próximos eventos de este estilo. Prueba otro filtro."}</div>}
    </section>{selected && <EventDialog event={selected} close={() => setSelected(null)} />}
  </div>;
}
