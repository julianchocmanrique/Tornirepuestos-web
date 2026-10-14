import type { Snapshot } from "./types";

export const searchText = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

export function judgeQueue(s: Snapshot) {
  const scores = s.scores.filter(score => score.judgeId === s.user?.id);
  const submitted = new Set(scores.filter(score => score.locked).map(score => score.enrollmentId));
  const entries = s.enrollments.filter(entry => s.categories.some(category => category.id === entry.categoryId))
    .slice().sort((a, b) => (a.competitionNumber ?? Infinity) - (b.competitionNumber ?? Infinity) || a.id.localeCompare(b.id));
  const pending = entries.filter(entry => !submitted.has(entry.id));
  return { scores, submitted, entries, pending, completed: entries.length - pending.length,
    initialCategory: pending[0]?.categoryId || entries[0]?.categoryId || s.categories[0]?.id || "" };
}
