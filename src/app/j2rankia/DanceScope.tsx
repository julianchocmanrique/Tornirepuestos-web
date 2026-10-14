"use client";
import { createContext, useContext, type ReactNode } from "react";
import { eventHref } from "@/lib/baile/event-catalog";

const EventContext = createContext<string | undefined>(undefined);
export function DanceScope({ eventId, children }: { eventId?: string; children: ReactNode }) {
  return <EventContext.Provider value={eventId}>{children}</EventContext.Provider>;
}
export function useDanceScope() {
  const eventId = useContext(EventContext);
  const base = eventId ? eventHref(eventId) : "/j2rankia";
  const apiBase = eventId ? `/api/baile/eventos/${encodeURIComponent(eventId)}` : "/api/baile";
  return { eventId, base, apiBase, fileUrl: (id: string) => `${apiBase}/files/${encodeURIComponent(id)}` };
}
