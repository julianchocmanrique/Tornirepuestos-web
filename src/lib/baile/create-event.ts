import { audit, ensure, validDate } from "./domain";
import { EVENT_CATEGORIES, colombiaDay, type EventListing } from "./event-catalog";
import { initialState } from "./types";
import type { User } from "./types";
import { scoringConfiguration } from "./scoring-config";
import { categoryIdentity } from "./category-identity";

function record(value: unknown): Record<string, unknown> {
  ensure(value && typeof value === "object" && !Array.isArray(value), "Revisa los datos del evento.");
  return value as Record<string, unknown>;
}
function str(value: unknown, label: string, max = 200, optional = false) {
  ensure(typeof value === "string" && value.length <= max && (optional || value.trim()), `Revisa ${label}.`);
  return value.trim();
}
function bool(value: unknown) { ensure(typeof value === "boolean", "Revisa las opciones del evento."); return value; }
function date(value: unknown, label: string, optional = false) {
  const out = str(value, label, 10, optional);
  ensure((optional && !out) || validDate(out), `Revisa ${label}.`); return out;
}
function fee(value: unknown) {
  ensure(typeof value === "string" || typeof value === "number", "Revisa las tarifas.");
  const n = Number(value); ensure(Number.isSafeInteger(n) && n >= 1 && n <= 100000000, "Las tarifas deben ser pesos enteros entre 1 y 100.000.000."); return n;
}
function list(value: unknown, label: string, min: number, max: number) {
  ensure(Array.isArray(value) && value.length >= min && value.length <= max, `${label}: usa entre ${min} y ${max} elementos.`); return value;
}

export function prepareEvent(input: unknown, actor: string, customCover: boolean) {
  const d = record(input), state = initialState();
  const id = str(d.id, "el identificador", 60);
  ensure(/^[a-z0-9][a-z0-9-]{2,59}$/.test(id), "El enlace debe tener de 3 a 60 letras minúsculas, números o guiones.");
  const start = date(d.start, "la fecha inicial"), end = date(d.end, "la fecha final");
  ensure(end >= start, "La fecha final no puede ser anterior al inicio.");
  const demo = bool(d.demo), today = colombiaDay();
  ensure(demo || end >= today, "Para un evento real, la fecha final no puede estar en el pasado.");
  const category = str(d.category, "el tipo de evento");
  ensure(EVENT_CATEGORIES.some(c => c === category), "Selecciona un tipo de evento válido.");
  ensure(customCover, "Sube la fotografía o el afiche del evento en JPG o PNG.");
  const listing: EventListing = { id, name: str(d.name, "el nombre", 100), date: start, publishedAt: new Date().toISOString(), city: str(d.city, "la ciudad", 100), category: category as EventListing["category"], genre: str(d.genre, "la disciplina", 80), image: `/api/baile/event-cover/${id}`, imageAlt: str(d.imageAlt, "la descripción de la portada", 200), description: str(d.description, "el resumen", 2000), demo };
  function validity(value: unknown) {
    const until = date(value, "la vigencia", true);
    ensure(!until || until <= end, "Las tarifas no pueden vencer después del evento.");
    ensure(demo || !until || until >= today, "No uses tarifas vencidas para un evento real."); return until;
  }
  const passes = list(d.passes, "Pases", 1, 12).map((item, i) => {
    const p = record(item), benefits = str(p.benefits, "los beneficios", 1600).split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    ensure(benefits.length > 0 && benefits.length <= 8 && benefits.every(s => s.length <= 200), "Cada pase admite de uno a ocho beneficios, de máximo 200 caracteres.");
    return { id: `pase-${i + 1}`, name: str(p.name, "el nombre del pase", 100), fee: fee(p.fee), benefits, canCompete: bool(p.canCompete), active: true, validUntil: validity(p.validUntil) };
  });
  state.categories = list(d.categories, "Categorías", 1, 60).map((item, i) => {
    const c = record(item), modality = str(c.modality, "la modalidad", 30);
    ensure(["Solista", "Pareja", "Grupo"].includes(modality), "Modalidad inválida.");
    const deadline = str(c.deadline, "el plazo de pistas", 16, true);
    ensure(!deadline || (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(deadline) && validDate(deadline.slice(0, 10)) && Number.isFinite(Date.parse(`${deadline}:00-05:00`)) && deadline.slice(11, 16) <= "23:59" && Number(deadline.slice(14)) <= 59), "Revisa el plazo de pistas (hora de Colombia).");
    ensure(!deadline || deadline.slice(0, 10) <= end, "El plazo de pistas no puede ser posterior al evento.");
    return { id: `categoria-${i + 1}`, name: str(c.name, "el nombre de categoría", 120), modality, rhythm: str(c.rhythm, "el ritmo o disciplina", 80), division: str(c.division, "la división", 80), fee: fee(c.fee), active: true, deadline: deadline ? new Date(`${deadline}:00-05:00`).toISOString() : "", validUntil: validity(c.validUntil) };
  });
  ensure(passes.some(p => p.canCompete), "Incluye al menos un pase con derecho de competidor.");
  ensure(new Set(passes.map(p => p.name.toLowerCase())).size === passes.length, "No repitas nombres de pases.");
  ensure(new Set(state.categories.map(categoryIdentity)).size === state.categories.length, "No repitas categorías con el mismo nombre, modalidad, disciplina y división.");
  const scoring = scoringConfiguration(d.scoring, d.criteria);
  state.settings = { name: listing.name, tagline: str(d.tagline, "la frase del evento", 200), demo, eventStart: start, eventEnd: end, eventLocation: str(d.venue, "la sede y dirección", 200), fullPassFee: passes[0].fee, passPlans: passes, paymentInstructions: str(d.paymentInstructions, "las instrucciones de pago", 3000), ...scoring, registrationOpen: bool(d.registrationOpen), categoryRegistrationOpen: bool(d.categoryRegistrationOpen) };
  const accounts: { name: string; email: string; password: string; role: User["role"]; categories: string[] }[] = [];
  function account(value: unknown, role: "contractor" | "judge") {
    const a = record(value), email = str(a.email, "el correo del equipo").toLowerCase(), password = str(a.password, "la contraseña", 160);
    ensure(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), "Revisa el correo del equipo.");
    ensure(password.length >= 10, "Cada contraseña debe tener al menos 10 caracteres.");
    accounts.push({ name: str(a.name, "el nombre del integrante"), email, password, role, categories: role === "judge" ? state.categories.map(c => c.id) : [] });
  }
  if (d.contractor !== null) account(d.contractor, "contractor");
  list(d.judges, "Jurados iniciales", 0, 20).forEach(a => account(a, "judge"));
  ensure(new Set(accounts.map(a => a.email)).size === accounts.length, "Usa un correo diferente para cada integrante del equipo.");
  audit(state, actor, "Evento creado desde superadministración", id);
  return { listing, state, accounts };
}
