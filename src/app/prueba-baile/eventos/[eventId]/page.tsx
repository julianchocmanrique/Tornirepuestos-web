import { readState } from "@/lib/baile/store";
import { withEvent } from "@/lib/baile/event-scope";
import { money } from "@/lib/baile/types";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eventHref, findEvent, eventDate } from "@/lib/baile/event-catalog";

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
    <header className="dance-header event-page-header"><Link className="dance-brand" href={base}><span className="dance-brand-symbol" aria-hidden="true">r.</span><span>{state.settings.name}<small>UN EVENTO. TU PROPIO ESCENARIO.</small></span></Link><nav aria-label="Navegación del evento"><Link href="/prueba-baile">Todos los eventos</Link><Link href={base + "/resultados"}>Resultados</Link><Link href={base + "/acceso"}>Ingresar</Link><Link className="dance-btn small" href={base + "/registro"}>Registrarse <span aria-hidden="true">↗</span></Link></nav></header>
    <main><section className="event-page-hero dance-container">
      <div className="event-page-copy"><Link className="event-back" href="/prueba-baile">← Explorar eventos</Link><p className="dance-eyebrow">{event.genre} / {event.city}</p><h1>{state.settings.name}</h1><p className="event-page-lead">{event.description}</p><div className="event-page-facts"><div><span>CUÁNDO</span><strong><time dateTime={event.date}>{eventDate(event.date)}</time></strong></div><div><span>DÓNDE</span><strong>{event.city}</strong><small>Sede por confirmar</small></div></div><Link className="dance-btn" href={`${eventHref(event.id)}/registro`}>Quiero registrarme <span aria-hidden="true">↗</span></Link></div>
      <figure className="event-page-photo"><img src={event.image} alt={event.imageAlt} width={1440} height={960} fetchPriority="high" /><figcaption>{event.genre}<span>EL ENCUENTRO EMPIEZA CONTIGO</span></figcaption></figure>
    </section>
    <section className="event-page-about dance-container"><div><p className="dance-eyebrow">CONOCE EL ENCUENTRO</p><h2>Tu ritmo tiene un lugar.</h2></div><div><p>{event.description}</p><p>Consulta aquí la información de {event.name} y completa el formulario desde el botón Registrarse. Tu cuenta, tus inscripciones, pagos y pistas pertenecen únicamente a este evento.</p>{event.demo && <p className="dance-muted">La información de este evento es ilustrativa. La fecha y la sede deben confirmarse antes de realizar planes o pagos.</p>}</div></section>
    <section className="dance-container event-page-categories"><div><p className="dance-eyebrow">ELIGE TU ESCENARIO</p><h2>Categorías de este evento</h2><p>Full Pass: <strong>{money(state.settings.fullPassFee)}</strong>. Cada categoría tiene su propio pago.</p></div><div className="event-category-grid">{state.categories.filter(c => c.active).map(c => <article className="dance-panel" key={c.id}><p className="dance-eyebrow">{c.rhythm} / {c.modality}</p><h3>{c.name}</h3><p>{c.division}</p><strong>{money(c.fee)}</strong></article>)}</div><p className="dance-callout">{state.settings.registrationOpen ? "Registra tus datos, adjunta el comprobante del Full Pass y espera la aprobación para elegir tus categorías." : "Los registros de este evento están cerrados por ahora."}</p></section>
    <section className="event-page-cta dance-container"><div><p className="dance-eyebrow">DA EL SIGUIENTE PASO</p><h2>Nos vemos en {event.city}.</h2></div><Link className="dance-btn" href={`${eventHref(event.id)}/registro`}>Registrarse en este evento <span aria-hidden="true">↗</span></Link></section>
    </main><footer className="dance-footer"><span>{state.settings.name}<small>{event.city} · {eventDate(event.date)}</small></span><div><Link href="/prueba-baile">Todos los eventos</Link><Link href={base + "/acceso"}>Acceso organización</Link></div></footer>
  </div>;
}
