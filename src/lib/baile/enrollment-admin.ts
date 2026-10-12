import { audit, categoryPayment, ensure, fullPass } from "./domain";
import type { State, User } from "./types";

export function editableEnrollment(s: State, actor: User, id: string) {
  ensure(actor.role === "superadmin", "Solo superadministración puede editar inscripciones.", 403);
  const entry = s.enrollments.find(e => e.id === id);
  ensure(entry, "Inscripción no encontrada.", 404);
  ensure(!s.schedule.some(x => x.categoryId === entry.categoryId && ["live", "finished"].includes(x.status)), "La competencia ya comenzó o finalizó; la inscripción está bloqueada.", 409);
  ensure(!s.scores.some(x => x.enrollmentId === id), "La inscripción ya tiene calificaciones y no puede modificarse.", 409);
  return entry;
}

export function editEnrollment(s: State, actor: User, id: string, data: { team: string; members: string; school: string; contactEmail: string }) {
  const e = editableEnrollment(s, actor, id);
  const c = s.categories.find(c => c.id === e.categoryId);
  ensure(c, "Categoría no encontrada.", 404);
  ensure(c.modality === "Solista" || (data.team.trim() && data.members.trim()), "Indica el nombre y los integrantes de la pareja o grupo.");
  ensure(!data.contactEmail || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contactEmail), "Revisa el correo de contacto.");
  Object.assign(e, data);
  audit(s, actor.id, "Datos de inscripción actualizados", id);
}

export function moveEnrollment(s: State, actor: User, id: string, categoryId: string, reason: string) {
  const e = editableEnrollment(s, actor, id);
  const c = s.categories.find(c => c.id === categoryId && c.active);
  ensure(c, "Selecciona una categoría activa.");
  ensure(e.categoryId !== c.id, "La inscripción ya pertenece a esa categoría.");
  ensure(reason.trim(), "Indica el motivo del cambio.");
  ensure(!s.schedule.some(x => x.categoryId === c.id && ["live", "finished"].includes(x.status)), "La categoría de destino ya comenzó o finalizó.", 409);
  ensure(!s.enrollments.some(x => x.id !== id && x.participantId === e.participantId && x.categoryId === c.id), "El titular ya está inscrito en esa categoría.", 409);
  ensure(c.modality === "Solista" || (e.team.trim() && e.members.trim()), "Completa el nombre artístico y los integrantes antes de cambiar a pareja o grupo.");
  const payment = categoryPayment(s, id);
  // No reinterpretar dinero ya reportado ni modificar una tarifa histórica pagada.
  ensure(!payment || c.fee === e.fee, "Hay un pago registrado. Solo puedes cambiar a una categoría con la misma tarifa; resuelve la diferencia con organización.", 409);
  const previous = e.categoryId;
  e.categoryId = c.id;
  if (!payment) e.fee = c.fee;
  e.competitionNumber = payment?.status === "approved" && fullPass(s, e.participantId)?.status === "approved" ? Math.max(0, ...s.enrollments.filter(x => x.id !== id && x.categoryId === c.id).map(x => x.competitionNumber || 0)) + 1 : null;
  audit(s, actor.id, `Cambio de categoría ${previous} -> ${c.id}: ${reason}`, id);
}
