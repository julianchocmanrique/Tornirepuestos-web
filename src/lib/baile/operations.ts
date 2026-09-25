import { randomUUID } from "node:crypto";
import { ensure, fullPass, eligible, audit } from "./domain";
import { stageLabels, type State, type User, type ScheduleSlot } from "./types";

export function accredit(s: State, actor: User, participantId: string, code: string) {
  ensure(actor.role === "admin", "Acceso reservado a organización.", 403);
  ensure(s.participants.some(p => p.id === participantId), "Participante no encontrado.", 404);
  ensure(fullPass(s, participantId)?.status === "approved", "El Full Pass debe estar aprobado para acreditar.", 409);
  code = code.trim().toUpperCase();
  ensure(/^[A-Z0-9-]{3,32}$/.test(code), "Usa un código de manilla de 3 a 32 letras, números o guiones.");
  ensure(!s.accreditations.some(a => a.participantId === participantId && !a.revokedAt), "Ya está acreditado. Anula primero la acreditación anterior.", 409);
  ensure(!s.accreditations.some(a => a.code === code), "Este código de manilla ya fue utilizado.", 409);
  s.accreditations.push({ id: randomUUID(), participantId, code, at: new Date().toISOString(), by: actor.id, revokedAt: null });
  audit(s, actor.id, `Acreditación registrada: ${code}`, participantId);
}
export function revokeAccreditation(s: State, actor: User, id: string, reason: string) {
  ensure(actor.role === "admin", "Acceso reservado a organización.", 403);
  const record = s.accreditations.find(a => a.id === id && !a.revokedAt);
  ensure(record, "Acreditación activa no encontrada.", 404);
  ensure(reason.trim(), "Indica el motivo de anulación.");
  record.revokedAt = new Date().toISOString();
  audit(s, actor.id, `Acreditación anulada (${record.code}): ${reason}`, record.participantId);
}
export function saveSchedule(s: State, actor: User, input: ScheduleSlot) {
  ensure(actor.role === "admin", "Acceso reservado a organización.", 403);
  const category = s.categories.find(c => c.id === input.categoryId);
  ensure(category, "Categoría no encontrada.", 404);
  ensure(Object.hasOwn(stageLabels, input.status), "Estado de tarima inválido.");
  const start = Date.parse(input.startAt), end = start + input.duration * 60000;
  ensure(Number.isFinite(start) && Number.isInteger(input.duration) && input.duration >= 1 && input.duration <= 240, "Revisa la fecha y duración (1 a 240 minutos).");
  ensure(input.stage.trim(), "Indica el escenario.");
  const old = s.schedule.find(x => x.id === input.id);
  ensure(!old || old.categoryId === input.categoryId, "No cambies la categoría de un bloque existente.");
  const transitions = { planned: ["planned", "backstage", "live", "cancelled"], backstage: ["backstage", "planned", "live", "cancelled"], live: ["live", "finished"], finished: ["finished"], cancelled: ["cancelled"] };
  ensure(old ? transitions[old.status].includes(input.status) : input.status === "planned", "Cambio de estado no permitido. Los bloques nuevos comienzan como programados.", 409);
  if (old && ["live", "finished", "cancelled"].includes(old.status)) ensure(old.startAt === input.startAt && old.duration === input.duration && old.stage === input.stage, "No cambies horario o escenario de un bloque iniciado o cerrado.", 409);
  if (input.status !== "cancelled") {
    ensure(!s.schedule.some(x => x.id !== input.id && x.categoryId === input.categoryId && x.status !== "cancelled"), "La categoría ya tiene un bloque en el programa.", 409);
    ensure(!s.schedule.some(x => x.id !== input.id && x.status !== "cancelled" && x.stage.trim().toLowerCase() === input.stage.trim().toLowerCase() && start < Date.parse(x.startAt) + x.duration * 60000 && end > Date.parse(x.startAt)), "Este horario se cruza con otro bloque del mismo escenario.", 409);
  }
  if (input.status === "live" || input.status === "finished") {
    const entries = s.enrollments.filter(e => e.categoryId === input.categoryId && eligible(s, e));
    const judges = s.users.filter(u => u.role === "judge" && u.categories.includes(input.categoryId));
    ensure(entries.length > 0 && judges.length > 0, "Necesitas competidores habilitados y jurados asignados.");
    ensure(entries.every(e => e.musicId), "Faltan pistas en las inscripciones habilitadas.");
    ensure(!s.schedule.some(x => x.id !== input.id && x.status === "live" && x.stage.trim().toLowerCase() === input.stage.trim().toLowerCase()), "Ya hay otra categoría en tarima en este escenario.", 409);
    if (input.status === "finished") {
      ensure(entries.every(e => judges.every(j => s.scores.some(score => score.enrollmentId === e.id && score.judgeId === j.id && score.locked))), "Todavía faltan calificaciones para finalizar la categoría.", 409);
      category.active = false;
    }
  }
  if (old) Object.assign(old, input); else s.schedule.push(input);
  audit(s, actor.id, `Programa: ${category.name} / ${stageLabels[input.status]}`, input.id);
}
