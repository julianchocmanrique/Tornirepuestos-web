import type { PaymentMethod } from "./payment-method";
import type { ScoringCriterion } from "./types";
import type { EventCategory } from "./event-catalog";

export type EventDraft = {
  id: string; name: string; category: EventCategory; genre: string; tagline: string; description: string;
  start: string; end: string; city: string; venue: string; imageAlt: string;
  demo: boolean; registrationOpen: boolean; categoryRegistrationOpen: boolean; paymentInstructions: string; paymentMethod: PaymentMethod | null;
  scoring: "average" | "sum" | "sunfest-v1" | "custom-v1";
  criteria: ScoringCriterion[] | null;
  passes: { name: string; fee: string; benefits: string; canCompete: boolean; validUntil: string }[];
  categories: { name: string; modality: string; rhythm: string; division: string; fee: string; deadline: string; validUntil: string }[];
  contractor: { name: string; email: string; password: string } | null;
  judges: { name: string; email: string; password: string; categories: number[] }[];
};
export const emptyPass = () => ({ name: "Pase de competidor", fee: "", benefits: "Derecho de competidor; categorías por separado", canCompete: true, validUntil: "" });
export const emptyCategory = () => ({ name: "", modality: "Solista", rhythm: "", division: "Abierta", fee: "", deadline: "", validUntil: "" });
export function newEventDraft(): EventDraft {
  return { id: "", name: "", category: "Danza", genre: "", tagline: "", description: "", start: "", end: "", city: "", venue: "", imageAlt: "", demo: true, registrationOpen: false, categoryRegistrationOpen: false, paymentInstructions: "", paymentMethod: null, scoring: "average", criteria: null, passes: [emptyPass()], categories: [emptyCategory()], contractor: null, judges: [] };
}
