export const PAYMENT_METHOD_TYPES = ["Llave", "Transferencia bancaria", "Nequi", "Daviplata", "Efectivo", "Otro"] as const;
export type PaymentMethod = { type: typeof PAYMENT_METHOD_TYPES[number]; entity: string; holder: string; destination: string; accountType: string };
export const emptyPaymentMethod = (type: PaymentMethod["type"]): PaymentMethod => ({ type, entity: "", holder: "", destination: "", accountType: "" });

export function parsePaymentMethod(value: unknown, incomplete = false): PaymentMethod | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== "object" || Array.isArray(value)) throw Error("Revisa el medio de pago.");
  const p = value as PaymentMethod;
  if (!PAYMENT_METHOD_TYPES.includes(p.type)) throw Error("Selecciona un medio de pago válido.");
  if (![p.entity, p.holder, p.destination, p.accountType].every(v => typeof v === "string" && v.length <= 200)) throw Error("Los datos de pago admiten hasta 200 caracteres por campo.");
  if (!incomplete && (!p.holder.trim() || !p.destination.trim())) throw Error("Completa el titular y el destino del pago.");
  if (!incomplete && p.type === "Transferencia bancaria" && (!p.entity.trim() || !["Ahorros", "Corriente"].includes(p.accountType))) throw Error("Completa el banco y el tipo de cuenta.");
  return { type: p.type, entity: p.entity.trim(), holder: p.holder.trim(), destination: p.destination.trim(), accountType: p.type === "Transferencia bancaria" ? p.accountType : "" };
}

export function paymentDestinationLabel(type: PaymentMethod["type"]) {
  return type === "Llave" ? "Llave de pago" : type === "Transferencia bancaria" ? "Número de cuenta" : ["Nequi", "Daviplata"].includes(type) ? "Número de celular" : "Destino o punto de pago";
}
