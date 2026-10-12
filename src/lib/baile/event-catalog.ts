export const EVENT_CATEGORIES = ["Danza", "Belleza", "Música", "Teatro", "Otros"] as const;
export type EventCategory = typeof EVENT_CATEGORIES[number];
export type EventListing = {
  id: string;
  name: string;
  date: string;
  publishedAt: string;
  city: string;
  category: EventCategory;
  genre: string;
  image: string;
  imageAlt: string;
  description: string;
  demo: boolean;
};

// Agenda editorial independiente de la competencia y de sus pagos.
export const eventCatalog: EventListing[] = [
  { id: "thesunfest", name: "The Sun Fest", date: "2026-08-22", publishedAt: "2026-10-11", city: "Ciudad por confirmar", category: "Danza", genre: "Salsa y Bachata", image: "/baile/eventos/salsa.webp", imageAlt: "Imagen ilustrativa de salsa, no fotografía oficial del evento", description: "Ejemplo de configuración de The Sun Fest: talleres, pool party y competencias. Elige tu pase y conoce las tarifas de referencia de 2026.", demo: true },
  { id: "encuentro-salsa", name: "Caribe Salsa Festival", date: "2026-11-14", publishedAt: "2026-10-11", city: "Santa Marta", category: "Danza", genre: "Salsa", image: "/baile/eventos/salsa.webp", imageAlt: "Imagen ilustrativa de una pareja de salsa en el escenario", description: "Un encuentro de ritmo, conexión y talento. Una propuesta de festival para reunir a quienes viven la salsa dentro y fuera del escenario.", demo: true },
  { id: "encuentro-urbano", name: "Movimiento Urbano", date: "2026-10-24", publishedAt: "2026-10-10", city: "Barranquilla", category: "Danza", genre: "Urbana", image: "/baile/eventos/urbana.webp", imageAlt: "Imagen ilustrativa de un grupo de danza urbana en escena", description: "La energía de los crews, la expresión individual y el movimiento se encuentran en una misma pista.", demo: true },
  { id: "encuentro-bachata", name: "Bachata al Mar", date: "2026-12-05", publishedAt: "2026-10-09", city: "Cartagena", category: "Danza", genre: "Bachata", image: "/baile/eventos/bachata.webp", imageAlt: "Imagen ilustrativa de una pareja de bachata bajo luces de escenario", description: "Un espacio para conectar a través de la música y compartir la pasión por la bachata.", demo: true },
];

export function colombiaDay(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}
export function latestEvents(events: EventListing[]) {
  return [...events].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt) || a.id.localeCompare(b.id)).slice(0, 5);
}
export function upcomingEvents(events: EventListing[], today: string, category: EventCategory | "Todos" = "Todos") {
  return events.filter(e => e.date >= today && (category === "Todos" || e.category === category)).sort((a, b) => a.date.localeCompare(b.date) || a.name.localeCompare(b.name));
}
export function eventDate(value: string, options: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" }) {
  return new Intl.DateTimeFormat("es-CO", { ...options, timeZone: "America/Bogota" }).format(new Date(`${value}T12:00:00-05:00`));
}

export const eventHref = (id: string) => `/prueba-baile/eventos/${encodeURIComponent(id)}`;
export const findEvent = (id: string) => eventCatalog.find(event => event.id === id);
export function slideOffset(index: number, active: number, count: number) {
  if (count < 2) return 0;
  const offset = (index - active + count) % count;
  return offset > Math.floor(count / 2) ? offset - count : offset;
}
