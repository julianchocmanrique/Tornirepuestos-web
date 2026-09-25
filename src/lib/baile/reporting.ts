import { type Snapshot, type Participant, type Enrollment, type Payment } from "./types";

export const normalize = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
export const passFor = (s: Snapshot, id: string) => s.payments.find(p => p.participantId === id && p.kind === "fullpass");
export const paymentFor = (s: Snapshot, id: string) => s.payments.find(p => p.enrollmentId === id);
export const readyEntry = (s: Snapshot, e: Enrollment) => passFor(s, e.participantId)?.status === "approved" && paymentFor(s, e.id)?.status === "approved";
export const matchesPerson = (p: Participant, query: string) => normalize(`${p.name} ${p.document} ${p.city} ${p.academy} ${p.code}`).includes(normalize(query));
export function whatsapp(phone: string) {
  const digits = phone.replace(/\D/g, "");
  const international = digits.length === 10 && digits.startsWith("3") ? `57${digits}` : digits;
  return /^[1-9]\d{9,14}$/.test(international) ? `https://wa.me/${international}` : null;
}
export function ageAt(birthDate: string, day = new Date().toLocaleDateString("en-CA", { timeZone: "America/Bogota" })) {
  return Number(day.slice(0, 4)) - Number(birthDate.slice(0, 4)) - Number(day.slice(5) < birthDate.slice(5));
}
export function charges(s: Snapshot) {
  const rows: { id: string; participant: Participant; label: string; kind: string; expected: number; payment?: Payment; balance: number }[] = [];
  for (const p of s.participants) {
    const payment = passFor(s, p.id), expected = p.fullPassFee ?? s.settings.fullPassFee;
    rows.push({ id: p.id, participant: p, label: "Full Pass", kind: "fullpass", expected, payment, balance: Math.max(0, expected - (payment?.status === "approved" ? payment.amount : 0)) });
  }
  for (const e of s.enrollments) {
    const participant = s.participants.find(p => p.id === e.participantId);
    if (!participant) continue;
    const payment = paymentFor(s, e.id);
    rows.push({ id: e.id, participant, label: s.categories.find(c => c.id === e.categoryId)?.name || e.code, kind: "category", expected: e.fee, payment, balance: Math.max(0, e.fee - (payment?.status === "approved" ? payment.amount : 0)) });
  }
  return rows;
}
