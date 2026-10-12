import type { Settings, State } from './types';

export type PassPlan = { id: string; name: string; fee: number; benefits: string[]; canCompete: boolean; active: boolean; validUntil: string };
export type PurchasedPass = Pick<PassPlan, 'id' | 'name' | 'canCompete' | 'benefits'>;
export function passPlans(settings: Settings): PassPlan[] {
  return settings.passPlans ?? [{ id: 'fullpass', name: 'Full Pass', fee: settings.fullPassFee, benefits: ['Derecho de competidor; categorías por separado'], canCompete: true, active: true, validUntil: '' }];
}
export function passAvailable(plan: PassPlan, settings: Settings, today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' })) {
  return plan.active && (settings.demo || !plan.validUntil || plan.validUntil >= today);
}
// This preset only initializes a new event. Existing purchases retain their snapshots.
export function seedSunFest(s: State) {
  s.settings.fullPassFee = 70000;
  s.settings.eventEnd = '2026-08-23';
  s.settings.pricingNote = 'Ejemplo de prueba basado en The Sun Fest 2026. Fechas de referencia: 22 y 23 de agosto de 2026. Las tarifas del competidor y las categorías correspondían al segundo corte, hasta el 31 de julio de 2026. No realices pagos reales.';
  s.settings.passPlans = [
    { id: 'competidor', name: 'Pase de competidor', fee: 70000, benefits: ['Talleres', 'Pool party', 'Derecho de competidor'], canCompete: true, active: true, validUntil: '2026-07-31' },
    { id: 'congreso', name: 'Pase de congreso', fee: 95000, benefits: ['Talleres', 'Pool party', 'Ver competencia', 'Derecho de competidor'], canCompete: true, active: true, validUntil: '' },
    { id: 'acompanante', name: 'Acompañante', fee: 20000, benefits: ['Ingreso para ver la competencia'], canCompete: false, active: true, validUntil: '' },
  ];
  s.categories = [
    { id: 'solista', name: 'Solista', modality: 'Solista', rhythm: 'Por definir', division: 'Ejemplo', fee: 80000, active: true, deadline: '', validUntil: '2026-07-31' },
    { id: 'pareja', name: 'Parejas / Dúo', modality: 'Pareja', rhythm: 'Por definir', division: 'Ejemplo', fee: 105000, active: true, deadline: '', validUntil: '2026-07-31' },
    { id: 'grupo', name: 'Grupo', modality: 'Grupo', rhythm: 'Por definir', division: 'Ejemplo', fee: 250000, active: true, deadline: '', validUntil: '2026-07-31' },
  ];
}
