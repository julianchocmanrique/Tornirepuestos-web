"use client";
import { useState } from "react";
import { PAYMENT_METHOD_TYPES, emptyPaymentMethod, paymentDestinationLabel, type PaymentMethod } from "@/lib/baile/payment-method";
import type { Settings } from "@/lib/baile/types";
import { Form, type Run } from "./ui";

export function PaymentMethodFields({ value, onChange }: { value: PaymentMethod | null; onChange: (v: PaymentMethod | null) => void }) {
  const update = (key: keyof PaymentMethod, text: string) => value && onChange({ ...value, [key]: text });
  return <section className="dance-inline-card"><h3>Medio de pago predeterminado</h3><label className="dance-field"><span>Tipo de medio de pago</span><select value={value?.type || ""} onChange={e => onChange(e.target.value ? emptyPaymentMethod(e.target.value as PaymentMethod["type"]) : null)}><option value="">Usar instrucciones de pago escritas</option>{PAYMENT_METHOD_TYPES.map(type => <option key={type}>{type}</option>)}</select></label>
    {value && <div className="dance-form-grid">
      <label className="dance-field"><span>Banco o entidad{value.type !== "Transferencia bancaria" && " (opcional)"}</span><input value={value.entity} required={value.type === "Transferencia bancaria"} maxLength={200} onChange={e => update("entity", e.target.value)} /></label>
      <label className="dance-field"><span>Titular o beneficiario</span><input value={value.holder} required maxLength={200} onChange={e => update("holder", e.target.value)} /></label>
      <label className="dance-field"><span>{paymentDestinationLabel(value.type)}</span><input value={value.destination} required maxLength={200} autoComplete="off" onChange={e => update("destination", e.target.value)} /></label>
      {value.type === "Transferencia bancaria" && <label className="dance-field"><span>Tipo de cuenta</span><select required value={value.accountType} onChange={e => update("accountType", e.target.value)}><option value="">Selecciona</option><option>Ahorros</option><option>Corriente</option></select></label>}
    </div>}
    <p className="dance-muted">Estos datos se mostrarán a los participantes. Verifica la cuenta o llave con el organizador antes de guardar. Nunca escribas claves de acceso bancario.</p>
  </section>;
}

export function PaymentInstructions({ settings }: { settings: Pick<Settings, "paymentMethod" | "paymentInstructions"> }) {
  const p = settings.paymentMethod;
  return <div className="dance-payment-instructions">{p && <section className="dance-inline-card"><p className="dance-eyebrow">MEDIO DE PAGO DEL EVENTO</p><h3>{p.type}</h3><dl className="dance-entry-facts">{p.entity && <div><dt>Entidad</dt><dd>{p.entity}</dd></div>}<div><dt>Titular</dt><dd>{p.holder}</dd></div>{p.accountType && <div><dt>Tipo de cuenta</dt><dd>{p.accountType}</dd></div>}<div><dt>{paymentDestinationLabel(p.type)}</dt><dd>{p.destination}</dd></div></dl></section>}{settings.paymentInstructions && <p className="dance-instructions">{settings.paymentInstructions}</p>}</div>;
}

export function PaymentSettings({ settings, run }: { settings: Settings; run: Run }) {
  const [method, setMethod] = useState(settings.paymentMethod || null);
  return <section className="dance-panel"><h2>Medios de pago</h2><p>Configuración compartida por el organizador y superadministración para este evento. No cambia tarifas ni pagos ya registrados.</p>
    <Form action="payment-settings" run={run} label="Guardar medio de pago">
      <input type="hidden" name="paymentMethod" value={JSON.stringify(method)} />
      <input type="hidden" name="previousPaymentConfig" value={JSON.stringify({ paymentMethod: settings.paymentMethod || null, paymentInstructions: settings.paymentInstructions })} />
      <PaymentMethodFields value={method} onChange={setMethod} />
      <label className="dance-field"><span>{method ? "Instrucciones adicionales (opcional)" : "Instrucciones de pago"}</span><textarea name="paymentInstructions" defaultValue={settings.paymentInstructions} required={!method} maxLength={3000} rows={4} /></label>
    </Form>
  </section>;
}
