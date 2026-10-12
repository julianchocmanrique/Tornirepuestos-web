import type { Snapshot } from "./types";

export function registrationRhythm(s: Snapshot, participantId: string, rhythm: string) {
  const categoryIds = new Set(s.enrollments.filter(e => e.participantId === participantId).map(e => e.categoryId));
  const divisions = s.categories.filter(c => categoryIds.has(c.id) && c.rhythm.trim().toLowerCase() === rhythm.toLowerCase()).map(c => c.division.trim() || "Sin definir");
  return [...new Set(divisions)].join(", ") || "Sin inscripción";
}
