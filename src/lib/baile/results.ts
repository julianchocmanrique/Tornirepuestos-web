import type { Snapshot } from "./types";
import { CRITERIA } from "./types";

export function ranking(s: Snapshot, categoryId: string) {
  const judges = s.judges.filter(j => j.categories.includes(categoryId));
  const rows = s.enrollments.filter(e => e.categoryId === categoryId && e.competitionNumber !== null && s.payments.some(p => p.enrollmentId === e.id && p.status === "approved") && s.payments.some(p => p.participantId === e.participantId && p.kind === "fullpass" && p.status === "approved")).map(e => {
    const scores = judges.map(j => s.scores.find(x => x.enrollmentId === e.id && x.judgeId === j.id && x.locked));
    const totals = scores.map(x => x ? x.values.reduce((a, b) => a + b, 0) : null);
    const total = totals.reduce<number>((a, b) => a + (b || 0), 0);
    const complete = judges.length > 0 && scores.every(Boolean);
    const average = complete ? total / (judges.length * CRITERIA.length) : null;
    return { enrollment: e, totals, total, average, complete, received: scores.filter(Boolean).length, expected: judges.length, value: complete ? (s.settings.formula === "sum" ? total : average!) : null, position: null as number | null };
  }).sort((a, b) => Number(b.complete) - Number(a.complete) || (b.value || 0) - (a.value || 0) || a.enrollment.competitionNumber! - b.enrollment.competitionNumber!);
  let position = 0;
  rows.forEach((r, i) => { if (r.complete) { if (i === 0 || Math.abs(r.value! - rows[i - 1].value!) > 1e-9) position = i + 1; r.position = position; } });
  return rows;
}
