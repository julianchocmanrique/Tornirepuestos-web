import { AsyncLocalStorage } from "node:async_hooks";
import { findEvent } from "./event-catalog";

const context = new AsyncLocalStorage<string | undefined>();
export const currentEventId = () => context.getStore();
export const sessionCookieName = () => currentEventId() ? `baile_session_${currentEventId()}` : "baile_session";
export function withEvent<T>(eventId: string | undefined, fn: () => T): T {
  if (eventId && !findEvent(eventId)) throw new Error("Evento desconocido");
  return context.run(eventId, fn);
}
