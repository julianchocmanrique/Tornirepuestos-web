import { randomUUID } from "node:crypto";
import type { State, User, Snapshot, Status, Payment, Enrollment } from "./types";
import { CRITERIA } from "./types";

export class DanceError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}
export function ensure(condition: unknown, message: string, status = 400): asserts condition {
  if (!condition) throw new DanceError(message, status);
}
export function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
export function audit(s: State, actor: string, action: string, target: string) {
  s.audit.push({ id: randomUUID(), actor, action, target, at: new Date().toISOString() });
}
export function fullPass(s: Pick<State, "payments">, participantId: string) {
  return s.payments.find(p => p.participantId === participantId && p.kind === "fullpass");
}
export function categoryPayment(s: Pick<State, "payments">, enrollmentId: string) {
  return s.payments.find(p => p.enrollmentId === enrollmentId);
}
export function eligible(s: Pick<State, "payments">, e: Enrollment) {
  return fullPass(s, e.participantId)?.status === "approved" && categoryPayment(s, e.id)?.status === "approved";
}
export function enroll(s: State, user: User, categoryId: string, team: string, members: string) {
  ensure(user.role === "participant", "Solo los participantes pueden inscribirse.", 403);
  ensure(s.settings.registrationOpen, "Las inscripciones están cerradas.");
  ensure(fullPass(s, user.id)?.status === "approved", "Primero debe aprobarse tu Full Pass.", 403);
  const c = s.categories.find(c => c.id === categoryId && c.active);
  ensure(c, "La categoría no está disponible.");
  ensure(!s.enrollments.some(e => e.participantId === user.id && e.categoryId === c.id), "Ya tienes una inscripción en esta categoría.", 409);
  ensure(c.modality === "Solista" || (team.trim() && members.trim()), "Indica el nombre de la pareja o grupo y sus integrantes.");
  const e: Enrollment = { id: randomUUID(), code: `INS-${String(s.enrollments.length + 1).padStart(4, "0")}`, participantId: user.id, categoryId: c.id, team, members, fee: c.fee, musicId: null, musicName: "", musicUpdatedAt: null, competitionNumber: null, createdAt: new Date().toISOString() };
  s.enrollments.push(e);
  audit(s, user.id, "Inscripción creada", e.id);
  return e;
}
export function review(s: State, admin: User, paymentId: string, status: Status, note: string) {
  ensure(admin.role === "admin", "Acceso reservado a organización.", 403);
  const p = s.payments.find(p => p.id === paymentId);
  ensure(p, "Pago no encontrado.", 404);
  ensure(["approved", "rejected", "pending"].includes(status), "Estado inválido.");
  ensure(status !== "rejected" || note.trim(), "Indica el motivo del rechazo.");
  const affected = s.enrollments.filter(e => p.enrollmentId ? e.id === p.enrollmentId : e.participantId === p.participantId);
  ensure(!s.scores.some(x => affected.some(e => e.id === x.enrollmentId)), "Este competidor ya tiene calificaciones. No se puede cambiar su pago.", 409);
  if (p.kind === "category" && status === "approved") ensure(fullPass(s, p.participantId)?.status === "approved", "El Full Pass aún no está aprobado.");
  p.status = status; p.note = note; p.reviewedBy = admin.id; p.reviewedAt = new Date().toISOString();
  if (p.enrollmentId && status === "approved") {
    const e = s.enrollments.find(x => x.id === p.enrollmentId)!;
    if (e.competitionNumber === null) e.competitionNumber = Math.max(0, ...s.enrollments.filter(x => x.categoryId === e.categoryId).map(x => x.competitionNumber || 0)) + 1;
  }
  const label = { approved: "aprobado", rejected: "rechazado", pending: "pendiente" }[status];
  audit(s, admin.id, `Pago ${label}: ${note}`, p.id);
}
export function saveScore(s: State, judge: User, enrollmentId: string, values: number[]) {
  ensure(judge.role === "judge", "Acceso reservado a jurados.", 403);
  const e = s.enrollments.find(x => x.id === enrollmentId);
  ensure(e && judge.categories.includes(e.categoryId), "Competidor no asignado a este jurado.", 403);
  ensure(eligible(s, e) && e.competitionNumber !== null, "El competidor aún no está habilitado.");
  ensure(values.length === CRITERIA.length && values.every(v => Number.isFinite(v) && v >= 1 && v <= 10), "Cada criterio debe tener una nota entre 1 y 10.");
  const old = s.scores.find(x => x.enrollmentId === e.id && x.judgeId === judge.id);
  ensure(!old?.locked, "La calificación está bloqueada. La organización debe autorizar su edición.", 409);
  const score = { id: old?.id || randomUUID(), enrollmentId: e.id, judgeId: judge.id, values, locked: true, submittedAt: new Date().toISOString() };
  if (old) Object.assign(old, score); else s.scores.push(score);
  audit(s, judge.id, "Calificación enviada", score.id);
}
export function scope(s: State, user: User | null): Snapshot {
  const publicUser = user ? (({ passwordHash: _ignored, ...rest }) => rest)(user) : null;
  const base: Snapshot = { settings: s.settings, user: publicUser, participants: [], payments: [], categories: s.categories.filter(c => c.active), enrollments: [], scores: [], judges: [], audit: [] };
  if (!user) return base;
  if (user.role === "admin") return { ...base, categories: s.categories, participants: s.participants, payments: s.payments, enrollments: s.enrollments, scores: s.scores, audit: s.audit.slice(-150).reverse(), judges: s.users.filter(u => u.role === "judge").map(({ passwordHash: _ignored, ...u }) => u) };
  if (user.role === "participant") return { ...base, categories: s.categories.filter(c => c.active || s.enrollments.some(e => e.categoryId === c.id && e.participantId === user.id)), participants: s.participants.filter(p => p.id === user.id), payments: s.payments.filter(p => p.participantId === user.id), enrollments: s.enrollments.filter(e => e.participantId === user.id) };
  // Jurados reciben solo identificadores de competencia y sus propias notas.
  return { ...base, categories: s.categories.filter(c => user.categories.includes(c.id)), enrollments: s.enrollments.filter(e => user.categories.includes(e.categoryId) && eligible(s, e)).map(e => ({ ...e, participantId: "", team: "", members: "", musicId: null, musicName: "", fee: 0 })), scores: s.scores.filter(x => x.judgeId === user.id) };
}
export function recordPayment(s: State, user: User, enrollmentId: string | null, amount: number, date: string, receiptId: string): Payment {
  ensure(user.role === "participant", "Acceso reservado a participantes.", 403);
  const e = enrollmentId ? s.enrollments.find(e => e.id === enrollmentId && e.participantId === user.id) : undefined;
  ensure(!enrollmentId || e, "Inscripción no encontrada.", 404);
  ensure(!e || fullPass(s, user.id)?.status === "approved", "Primero debe aprobarse tu Full Pass.");
  const old = e ? categoryPayment(s, e.id) : fullPass(s, user.id);
  ensure(old?.status !== "approved", "El pago ya fue aprobado.", 409);
  ensure(Number.isFinite(amount) && amount > 0 && amount <= 100000000, "Indica un valor válido.");
  ensure(amount >= (e ? e.fee : s.settings.fullPassFee), "El valor reportado es menor al valor de inscripción.");
  ensure(validDate(date) && date <= new Date().toLocaleDateString("en-CA", { timeZone: "America/Bogota" }), "Indica una fecha de pago válida, no futura.");
  const p: Payment = { id: old?.id || randomUUID(), participantId: user.id, enrollmentId, kind: e ? "category" : "fullpass", amount, date, receiptId, status: "pending", note: "", reviewedBy: null, reviewedAt: null, createdAt: new Date().toISOString() };
  if (old) Object.assign(old, p); else s.payments.push(p);
  audit(s, user.id, "Comprobante enviado", p.id);
  return p;
}
