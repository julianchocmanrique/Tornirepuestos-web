import { ensure } from "./domain";
import { type ScoringCriterion } from "./types";

export function validateCriteria(value: unknown): ScoringCriterion[] {
  ensure(Array.isArray(value) && value.length >= 1 && value.length <= 12, "Usa entre uno y doce criterios.");
  const criteria = value.map(c => {
    ensure(c && typeof c.name === "string" && c.name.trim().length > 0 && c.name.length <= 120, "Cada criterio necesita un nombre de máximo 120 caracteres.");
    ensure(typeof c.weight === "number" && Number.isFinite(c.weight) && c.weight > 0 && c.weight <= 100, "Cada porcentaje debe ser mayor que 0 y máximo 100.");
    return { name: c.name.trim(), weight: c.weight };
  });
  ensure(new Set(criteria.map(c => c.name.toLocaleLowerCase("es"))).size === criteria.length, "No repitas nombres de criterios.");
  ensure(Math.abs(criteria.reduce((sum, c) => sum + c.weight, 0) - 100) < 0.000001, "Los porcentajes deben sumar 100%.");
  return criteria;
}
export function scoringConfiguration(model: unknown, criteria?: unknown) {
  ensure(["average", "sum", "sunfest-v1", "custom-v1"].includes(String(model)), "Selecciona un sistema de calificación válido.");
  if (model === "custom-v1") return { scoringConfigured: true, formula: "average" as const, scoringScheme: "custom-v1" as const, criteria: validateCriteria(criteria) };
  return { scoringConfigured: true, formula: model === "sum" ? "sum" as const : "average" as const, scoringScheme: model === "sunfest-v1" ? "sunfest-v1" as const : undefined, criteria: undefined };
}
