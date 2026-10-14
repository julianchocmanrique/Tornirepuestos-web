import { RankiaBrand } from "../../RankiaBrand";
import { passPlans, passAvailable } from "@/lib/baile/pricing";
import "../../pricing.css";
import { readState } from "@/lib/baile/store";
import { withEvent } from "@/lib/baile/event-scope";
import { money } from "@/lib/baile/types";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eventHref, eventDate } from "@/lib/baile/event-catalog";
import { findRegisteredEvent as findEvent } from "@/lib/baile/event-registry";

export async function generateMetadata({ params }: { params: Promise<{ eventId: string }> }) {
  const event = findEvent((await params).eventId);
  return event ? { title: event.name, description: event.description, alternates: { canonical: eventHref(event.id) } } : {};
}
export default async function EventPage({ params }: { params: Promise<{ eventId: string }> }) {
  const event = findEvent((await params).eventId);
  if (!event || (event.demo && !withEvent(undefined, () => readState().settings.demo))) notFound();
  const state = withEvent(event.id, () => readState());
  const base = eventHref(event.id);
  return <div className="dance-app dance-event">
    <header className="dance-header event-page-header"><Link className="dance-brand" href="/j2rankia"><RankiaBrand /></Link><nav aria-label="Navegación del evento"><Link href="/j2rankia">Todos los eventos</Link><Link href={base + "/resultados"}>Resultados</Link><Link href={base + "/acceso"}>Ingresar</Link><Link className="dance-btn small" href={base + "/registro"}>Registrarse <span aria-hidden="true">↗</span></Link></nav></header>
    <main><section className="event-page-hero dance-container">
      <div className="event-page-copy"><Link className="event-back" href="/j2rankia">← Explorar eventos</Link><p className="dance-eyebrow">{event.genre} / {event.city}</p><h1>{state.settings.name}</h1><p className="event-page-lead">{event.description}</p><div className="event-page-facts"><div><span>{state.settings.demo && state.settings.passPlans ? "FECHAS DE REFERENCIA" : "CUÁNDO"}</span><strong><time dateTime={event.date}>{eventDate(state.settings.eventStart || event.date)}</time>{state.settings.eventEnd && state.settings.eventEnd !== state.settings.eventStart && <> al {eventDate(state.settings.eventEnd)}</>}</strong></div><div><span>DÓNDE</span><strong>{event.city}</strong><small>{state.settings.eventLocation || "Sede por confirmar"}</small></div></div><Link className="dance-btn" href={`${eventHref(event.id)}/registro`}>Quiero registrarme <span aria-hidden="true">↗</span></Link></div>
      <figure className="event-page-photo"><img src={event.image} alt={event.imageAlt} width={1440} height={960} fetchPriority="high" /><figcaption>{event.genre}<span>EL ENCUENTRO EMPIEZA CONTIGO</span></figcaption></figure>
    </section>
    <section className="event-page-about dance-container"><div><p className="dance-eyebrow">CONOCE EL ENCUENTRO</p><h2>Tu ritmo tiene un lugar.</h2></div><div><p>{event.description}</p><p>Consulta aquí la información de {event.name} y completa el formulario desde el botón Registrarse. Tu cuenta, tus inscripciones, pagos y pistas pertenecen únicamente a este evento.</p>{event.demo && <p className="dance-muted">La información de este evento es ilustrativa. La fecha y la sede deben confirmarse antes de realizar planes o pagos.</p>}</div></section>
    {state.settings.passPlans && <section className="dance-container event-pass-section" id="pases"><p className="dance-eyebrow">TU EXPERIENCIA, A TU MEDIDA</p><h2>Elige cómo vivir el evento.</h2><p>Pases por persona. Las categorías se pagan por separado.</p>{state.settings.pricingNote && <p className="dance-callout">{state.settings.pricingNote}</p>}<div className="pass-grid">{passPlans(state.settings).filter(p => p.active).map(p => <article className="pass-card" key={p.id}><p className="dance-eyebrow">{p.canCompete ? "VIVE Y COMPITE" : "ACOMPAÑA EL TALENTO"}</p><h3>{p.name}</h3><div className="pass-price">{money(p.fee)} <small>COP / persona</small></div><ul>{p.benefits.map(b => <li key={b}>{b}</li>)}</ul><small>{p.canCompete ? "Derecho de competidor. No incluye el pago de categorías." : "Ingreso para ver competencia. No permite competir."}</small><small>{p.validUntil ? `${state.settings.demo ? 'Vigencia de referencia' : 'Vigente hasta'}: ${eventDate(p.validUntil)}` : "Tarifa única"}</small>{passAvailable(p, state.settings) && state.settings.registrationOpen ? <Link className="dance-btn" href={base + "/registro?pase=" + p.id}>{state.settings.demo ? "Probar este pase" : "Elegir este pase"}</Link> : <p>Registro no disponible</p>}</article>)}</div></section>}
    <section className="dance-container event-page-categories"><div><p className="dance-eyebrow">ELIGE TU ESCENARIO</p><h2>Categorías de este evento</h2>{state.settings.passPlans ? <p>Requiere un pase con derecho de competidor aprobado. Valores por inscripción, no por integrante. Consulta las modalidades, los ritmos y las divisiones disponibles.</p> : <p>Full Pass: <strong>{money(state.settings.fullPassFee)}</strong>. Cada categoría tiene su propio pago.</p>}</div><div className="event-category-grid">{state.categories.filter(c => c.active).map(c => <article className="dance-panel" key={c.id}><p className="dance-eyebrow">{c.rhythm} / {c.modality}</p><h3>{c.name}</h3><p>{c.division}</p><strong>{money(c.fee)} COP</strong>{c.validUntil && <p className="dance-muted">{state.settings.demo ? "Vigencia de referencia" : "Vigente hasta"}: {eventDate(c.validUntil)}</p>}</article>)}</div><p className="dance-callout">{state.settings.registrationOpen ? "Registra tus datos, adjunta el comprobante de tu pase y espera la aprobación. Los pases con derecho de competidor habilitan la inscripción a categorías." : "Los registros de este evento están cerrados por ahora."}</p></section>
    <section className="event-page-cta dance-container"><div><p className="dance-eyebrow">DA EL SIGUIENTE PASO</p><h2>Tu próximo encuentro empieza aquí.</h2></div><Link className="dance-btn" href={`${eventHref(event.id)}/registro`}>Registrarse en este evento <span aria-hidden="true">↗</span></Link></section>
    </main><footer className="dance-footer"><Link className="dance-brand" href="/j2rankia"><RankiaBrand /></Link><div><Link href="/j2rankia">Todos los eventos</Link><Link href={base + "/acceso"}>Acceso organización</Link></div></footer>
  </div>;
}
