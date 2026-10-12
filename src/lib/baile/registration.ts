import type { Settings } from './types';

export const LEVELS = ['No aplica', 'Principiante', 'Amateur', 'Semiprofesional', 'Profesional'];
export const DOCUMENT_TYPES = ['CC', 'TI', 'CE', 'Pasaporte', 'Registro civil'];
export type Signature = number[][][];
export type Registration = {
  firstName: string; lastName: string; sex: string; country: string; callingCode: string;
  salsa: string; bachata: string; documentType: string; photoId: string;
  waiver: { version: string; text: string; acceptedAt: string; signature: Signature; guardianName: string; guardianDocument: string };
};
export const WAIVER_VERSION = '2026-10-v1';
export const colombiaDate = (now = new Date()) => now.toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
export function isMinor(birthDate: string, at = colombiaDate()) {
  const cutoff = `${Number(at.slice(0, 4)) - 18}${at.slice(4)}`;
  return birthDate > cutoff;
}
export function waiverText(settings: Settings, name: string, document: string) {
  const event = settings.name;
  const date = (value: string) => new Intl.DateTimeFormat('es-CO', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(`${value}T12:00:00Z`));
  const when = settings.eventStart ? `del ${date(settings.eventStart)} al ${date(settings.eventEnd || settings.eventStart)}` : 'en las fechas que publique la organización';
  const where = settings.eventLocation ? `en ${settings.eventLocation}` : 'en la sede que publique la organización';
  return [
    `El suscrito COMPETIDOR, ${name.toUpperCase()} identificado con número de identificación ${document}, declaro que conozco y acepto el reglamento de ${event}, que se llevará a cabo ${when}, ${where}, y que en razón a lo anteriormente expuesto acepto expresamente lo siguiente:`,
    `1. Que participo en la competencia voluntariamente y a título personal, por mi cuenta y riesgo, exonerando a ${event}, a sus organizadores y equipo de trabajo, de toda responsabilidad por cualquier clase de accidente o incidente de salud que ponga en riesgo mi integridad y que se pueda presentar antes y durante el desarrollo del mismo.`,
    '2. Que toda la información proporcionada, consignada y por mí diligenciada, es verídica.',
    '3. Que me encuentro afiliado como cotizante o beneficiario a un servicio nacional o convenio internacional de salud (EPS, SISBEN, SEGURO MÉDICO, PÓLIZA MÉDICA O DE ACCIDENTES, etc.).',
    `4. Que autorizo el uso de mi nombre e imagen, permitiendo que ${event} y sus afiliados, el organizador, staff, patrocinadores y agentes, reproduzcan videos y/o grabaciones de mi participación. Así mismo utilizarlos en todas las plataformas tales como: televisión, películas, internet, redes sociales, radio, publicaciones de prensa, medios, relaciones públicas y otros medios de promoción mediáticos ya conocidos o que se anuncien posteriormente.`,
    `5. Que renuncio de manera voluntaria a cualquier demanda, acción, reclamo, requerimiento o denuncia que inicie cualquier autoridad o tercero con ocasión de la coordinación, organización, logística, desarrollo y ejecución de la mencionada actividad y en especial a la realizada y en la que participe dentro del marco de ${event}, e igualmente contra sus organizadores y equipo de trabajo.`,
  ].join('\n\n');
}
// Store bounded vector strokes, not executable SVG or a client-provided acceptance date.
export function validSignature(value: unknown): value is Signature {
  if (!Array.isArray(value) || !value.length || value.length > 80) return false;
  let distance = 0, count = 0;
  for (const stroke of value) {
    if (!Array.isArray(stroke) || !stroke.length) return false;
    for (let i = 0; i < stroke.length; i++) {
      const point = stroke[i];
      if (!Array.isArray(point) || point.length !== 2 || !point.every(Number.isFinite) || point[0] < 0 || point[0] > 800 || point[1] < 0 || point[1] > 200 || ++count > 6000) return false;
      if (i) distance += Math.hypot(point[0] - stroke[i - 1][0], point[1] - stroke[i - 1][1]);
    }
  }
  return count >= 3 && distance >= 30;
}
