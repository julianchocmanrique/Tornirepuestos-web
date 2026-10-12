import type { PublicUser, Snapshot } from "./types";

export function judgeDeletionBlock(s: Pick<Snapshot, "scores" | "enrollments" | "schedule">, judge: Pick<PublicUser, "id" | "categories">): string {
  if (s.scores.some(score => score.judgeId === judge.id)) return "No se puede eliminar: este jurado ya tiene calificaciones registradas.";
  if (s.schedule.some(slot => judge.categories.includes(slot.categoryId) && ["live", "finished"].includes(slot.status))) return "No se puede eliminar: tiene una competencia iniciada o finalizada.";
  const entries = new Set(s.enrollments.filter(entry => judge.categories.includes(entry.categoryId)).map(entry => entry.id));
  if (s.scores.some(score => entries.has(score.enrollmentId))) return "No se puede eliminar: sus categorías ya tienen calificaciones de otros jurados. Se deben conservar los resultados.";
  return "";
}
