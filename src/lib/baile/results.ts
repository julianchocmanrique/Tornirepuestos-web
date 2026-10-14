import type { Snapshot, State } from "./types";
import { CRITERIA, weightedScore, scoringCriteria, usesWeightedScoring } from "./types";

export function ranking(s: Pick<Snapshot, "settings" | "judges" | "enrollments" | "payments" | "scores" | "schedule">, categoryId: string) {
  const weighted = usesWeightedScoring(s.settings);
  const judges = s.judges.filter(j => j.categories.includes(categoryId));
  const rows = s.enrollments.filter(e => e.categoryId === categoryId && e.competitionNumber !== null && s.payments.some(p => p.enrollmentId === e.id && p.status === "approved") && s.payments.some(p => p.participantId === e.participantId && p.kind === "fullpass" && p.status === "approved")).map(e => {
    const scores = judges.map(j => s.scores.find(x => x.enrollmentId === e.id && x.judgeId === j.id && x.locked));
    const totals = scores.map(x => x ? weighted ? weightedScore(x.values, scoringCriteria(s.settings)) : x.values.reduce((a, b) => a + b, 0) : null);
    const total = totals.reduce<number>((a, b) => a + (b || 0), 0);
    const complete = judges.length > 0 && scores.every(Boolean);
    const average = complete ? total / (judges.length * (weighted ? 1 : CRITERIA.length)) : null;
    return { enrollment: e, totals, total, average, complete, final: false, received: scores.filter(Boolean).length, expected: judges.length, value: complete ? (!weighted && s.settings.formula === "sum" ? total : average!) : null, position: null as number | null };
  }).sort((a, b) => Number(b.complete) - Number(a.complete) || (b.value || 0) - (a.value || 0) || a.enrollment.competitionNumber! - b.enrollment.competitionNumber!);
  let position = 0;
  const final = rows.length > 0 && rows.every(r => r.complete) && s.schedule.some(x => x.categoryId === categoryId && x.status === "finished");
  rows.forEach((r, i) => { r.final = final; if (r.complete) { if (i === 0 || Math.abs(r.value! - rows[i - 1].value!) > 1e-9) position = i + 1; r.position = position; } });
  return rows;
}

export function resultBreakdown(s: Pick<Snapshot, "settings" | "judges" | "scores">, categoryId: string, enrollmentId: string) {
  const criteria = scoringCriteria(s.settings).map(c => ({ name: c.name, weight: c.weight }));
  const weighted = usesWeightedScoring(s.settings);
  const mode = weighted ? "weighted" : s.settings.formula;
  const judges = s.judges.filter(j => j.categories.includes(categoryId));
  const scores = judges.map(j => s.scores.find(x => x.enrollmentId === enrollmentId && x.judgeId === j.id && x.locked));
  if (!judges.length || scores.some(score => !score)) return null;
  // Exporta solo nombres y notas definitivas, nunca perfiles ni metadatos privados.
  return {
    mode, criteria,
    judges: judges.map((j, i) => ({
      name: j.name, ...(j.photoId ? { photoId: j.photoId } : {}), ...(s.settings.demo ? { demo: true } : {}), values: [...scores[i]!.values],
      total: weighted ? weightedScore(scores[i]!.values, criteria) : scores[i]!.values.reduce((a, b) => a + b, 0) / (mode === "average" ? criteria.length : 1),
    })),
    contributions: criteria.map((c, i) => {
      const sum = scores.reduce((total, score) => total + score!.values[i], 0);
      return mode === "sum" ? sum : sum / judges.length * (weighted ? c.weight / 100 : 1 / criteria.length);
    }),
  };
}

export type ResultBreakdown = NonNullable<ReturnType<typeof resultBreakdown>>;

// Publica una proyección mínima, nunca el estado interno usado para calcularla.
export function publicResults(s: State) {
  const source = { ...s, judges: s.users.filter(u => u.role === "judge") };
  return { formula: usesWeightedScoring(s.settings) ? "average" : s.settings.formula, scoringScheme: s.settings.scoringScheme, categories: s.categories.flatMap(c => {
    const rows = ranking(source, c.id);
    if (!rows.length || !rows.every(r => r.final)) return [];
    return [{ id: c.id, name: c.name, rows: rows.map(r => ({ position: r.position, number: r.enrollment.competitionNumber, name: r.enrollment.team || s.participants.find(p => p.id === r.enrollment.participantId)?.name || "Participante", value: r.value, breakdown: resultBreakdown(source, c.id, r.enrollment.id) })) }];
  }) };
}
