export type Role = "participant" | "admin" | "judge";
export type Status = "pending" | "approved" | "rejected";
export const CRITERIA = ["Técnica", "Musicalidad", "Interpretación", "Conexión / trabajo en equipo", "Creatividad", "Presentación escénica"];
export type User = { id: string; name: string; email: string; passwordHash: string; role: Role; categories: string[] };
export type PublicUser = Omit<User, "passwordHash">;
export type Participant = { id: string; code: string; name: string; document: string; birthDate: string; city: string; phone: string; email: string; academy: string; extra: string; createdAt: string; fullPassFee?: number };
export type Payment = { id: string; participantId: string; enrollmentId: string | null; kind: "fullpass" | "category"; amount: number; date: string; receiptId: string; status: Status; note: string; reviewedBy: string | null; reviewedAt: string | null; createdAt: string };
export type Category = { id: string; name: string; modality: string; rhythm: string; division: string; fee: number; deadline: string; active: boolean };
export type Enrollment = { id: string; code: string; participantId: string; categoryId: string; team: string; members: string; fee: number; musicId: string | null; musicName: string; musicUpdatedAt: string | null; competitionNumber: number | null; createdAt: string };
export type Score = { id: string; enrollmentId: string; judgeId: string; values: number[]; locked: boolean; submittedAt: string };
export type Audit = { id: string; actor: string; action: string; target: string; at: string };
export type Accreditation = { id: string; participantId: string; code: string; at: string; by: string; revokedAt: string | null };
export type ParticipantNote = { participantId: string; text: string; at: string; by: string };
export type StageStatus = "planned" | "backstage" | "live" | "finished" | "cancelled";
export const stageLabels: Record<StageStatus, string> = { planned: "Programado", backstage: "En camerino", live: "En tarima", finished: "Finalizado", cancelled: "Cancelado" };
export type ScheduleSlot = { id: string; categoryId: string; startAt: string; duration: number; stage: string; status: StageStatus; note: string };
export type Settings = { name: string; tagline: string; fullPassFee: number; paymentInstructions: string; formula: "average" | "sum"; registrationOpen: boolean; categoryRegistrationOpen: boolean; demo: boolean };
export type State = { version: number; settings: Settings; users: User[]; participants: Participant[]; payments: Payment[]; categories: Category[]; enrollments: Enrollment[]; scores: Score[]; audit: Audit[]; accreditations: Accreditation[]; notes: ParticipantNote[]; schedule: ScheduleSlot[] };
export type Snapshot = { settings: Settings; user: PublicUser | null; participants: Participant[]; payments: Payment[]; categories: Category[]; enrollments: Enrollment[]; scores: Score[]; judges: PublicUser[]; audit: Audit[]; accreditations: Accreditation[]; notes: ParticipantNote[]; schedule: ScheduleSlot[]; exampleCreated: boolean };
export const statusLabels: Record<Status, string> = { pending: "Pendiente", approved: "Aprobado", rejected: "Rechazado" };
export function initialState(): State {
  return {
    version: 2,
    settings: { name: "Ritmo Caribe", tagline: "Tu talento tiene escenario.", fullPassFee: 180000, paymentInstructions: "Evento de ejemplo. Usa comprobantes ficticios para probar el proceso. La organización puede editar aquí sus instrucciones y medios de pago.", formula: "average", registrationOpen: true, categoryRegistrationOpen: true, demo: true },
    users: [], participants: [], payments: [], enrollments: [], scores: [], audit: [], accreditations: [], notes: [], schedule: [],
    categories: [
      { id: "salsa-solista", name: "Salsa solista", modality: "Solista", rhythm: "Salsa", division: "Abierta", fee: 60000, deadline: "", active: true },
      { id: "salsa-parejas", name: "Salsa parejas", modality: "Pareja", rhythm: "Salsa", division: "Abierta", fee: 90000, deadline: "", active: true },
      { id: "bachata-parejas", name: "Bachata parejas", modality: "Pareja", rhythm: "Bachata", division: "Abierta", fee: 90000, deadline: "", active: true },
      { id: "urbana-grupal", name: "Urbana grupal", modality: "Grupo", rhythm: "Urbana", division: "Abierta", fee: 150000, deadline: "", active: true },
    ],
  };
}
// Completa los campos nuevos sin reemplazar cuentas, comprobantes ni notas existentes.
export function migrateState(s: State): State {
  s.accreditations ??= []; s.notes ??= []; s.schedule ??= [];
  s.settings.categoryRegistrationOpen ??= s.settings.registrationOpen;
  for (const p of s.participants) p.fullPassFee ??= s.settings.fullPassFee;
  s.version = 2;
  return s;
}
export const money = (value: number) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value);
export const dateTime = (value: string) => new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Bogota" }).format(new Date(value));
