"use client";
import { useState } from "react";
import type { Enrollment } from "@/lib/baile/types";
import { useDanceScope } from "./DanceScope";

export function CompetitorAvatar({ entry, group = false }: { entry: Enrollment; group?: boolean }) {
  const { apiBase } = useDanceScope();
  const [failed, setFailed] = useState("");
  const src = entry.hasParticipantPhoto ? `${apiBase}/competitor-photo/${encodeURIComponent(entry.id)}` : "";
  const label = group ? "Foto del participante responsable de la inscripción" : `Foto del competidor ${String(entry.competitionNumber).padStart(3, "0")}`;
  return <span className="competitor-avatar" title={src && failed !== src ? label : "Sin foto registrada"}>
    {src && failed !== src ? <img src={src} alt={label} onError={() => setFailed(src)} /> : <svg viewBox="0 0 48 48" role="img" aria-label="Participante sin foto"><circle cx="24" cy="17" r="8" /><path d="M9 41c0-9 6-14 15-14s15 5 15 14" /></svg>}
  </span>;
}
