import type { Snapshot, State } from "./types";
import { CRITERIA } from "./types";

export function ranking(s: Pick<Snapshot, "settings" | "judges" | "enrollments" | "payments" | "scores" | "schedule">, categoryId: string) {
  const judges = s.judges.filter(j => j.categories.includes(categoryId));
  const rows = s.enrollments.filter(e => e.categoryId === categoryId && e.competitionNumber !== null && s.payments.some(p => p.enrollmentId === e.id && p.status === "approved") && s.payments.some(p => p.participantId === e.participantId && p.kind === "fullpass" && p.status === "approved")).map(e => {
    const scores = judges.map(j => s.scores.find(x => x.enrollmentId === e.id && x.judgeId === j.id && x.locked));
    const totals = scores.map(x => x ? x.values.reduce((a, b) => a + b, 0) : null);
    const total = totals.reduce<number>((a, b) => a + (b || 0), 0);
    const complete = judges.length > 0 && scores.every(Boolean);
    const average = complete ? total / (judges.length * CRITERIA.length) : null;
    return { enrollment: e, totals, total, average, complete, final: false, received: scores.filter(Boolean).length, expected: judges.length, value: complete ? (s.settings.formula === "sum" ? total : average!) : null, position: null as number | null };
  }).sort((a, b) => Number(b.complete) - Number(a.complete) || (b.value || 0) - (a.value || 0) || a.enrollment.competitionNumber! - b.enrollment.competitionNumber!);
  let position = 0;
  const final = rows.length > 0 && rows.every(r => r.complete) && s.schedule.some(x => x.categoryId === categoryId && x.status === "finished");
  rows.forEach((r, i) => { r.final = final; if (r.complete) { if (i === 0 || Math.abs(r.value! - rows[i - 1].value!) > 1e-9) position = i + 1; r.position = position; } });
  return rows;
}

// Publica una proyección mínima, nunca el estado interno usado para calcularla.
export function publicResults(s: State) {
  const source = { ...s, judges: s.users.filter(u => u.role === "judge") };
  return { formula: s.settings.formula, categories: s.categories.flatMap(c => {
    const rows = ranking(source, c.id);
    if (!rows.length || !rows.every(r => r.final)) return [];
    return [{ id: c.id, name: c.name, rows: rows.map(r => ({ position: r.position, number: r.enrollment.competitionNumber, name: r.enrollment.team || s.participants.find(p => p.id === r.enrollment.participantId)?.name || "Participante", value: r.value })) }];
  }) };
}
