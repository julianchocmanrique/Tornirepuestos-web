"use client";
import { useState } from "react";
import { useDanceScope } from "./DanceScope";
import type { PublicUser } from "@/lib/baile/types";
import { Form, type Run } from "./ui";
import "./judge-avatar.css";

export function JudgeAvatar({ name, photoId, demo = false, size = "small" }: { name: string; photoId?: string; demo?: boolean; size?: "small" | "large" | "profile" }) {
  const { apiBase } = useDanceScope();
  const src = photoId ? `${apiBase}/judge-photo/${encodeURIComponent(photoId)}` : demo ? "/baile/jurados/jurado-demo.png" : "";
  const [failed, setFailed] = useState("");
  const example = !photoId && demo;
  return <span className={`judge-avatar judge-avatar-${size}`} title={example ? "Retrato ficticio de ejemplo, no es la foto real del jurado" : `Foto de ${name}`}>
    {src && failed !== src ? <img src={src} alt={example ? "Retrato ficticio de jurado para pruebas" : `Foto de ${name}`} onError={() => setFailed(src)} /> : <span className="judge-avatar-initials" aria-label={`Perfil de ${name}`}>{name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join("").toUpperCase()}</span>}
    {example && <small className="judge-avatar-demo">DEMO</small>}
  </span>;
}

export function JudgePhotoEditor({ judge, demo, run }: { judge: PublicUser; demo: boolean; run: Run }) {
  return <details className="judge-photo-editor"><summary>Cambiar foto del jurado</summary>
    <p>JPG, PNG o WebP, máximo 5 MB. Se mostrará en su perfil, el selector de usuarios y los resultados del evento. Utiliza una foto autorizada.</p>
    <Form action="judge-photo" run={run} label="Guardar foto"><input type="hidden" name="judgeId" value={judge.id} /><label className="dance-field"><span>Foto del jurado</span><input name="file" type="file" accept="image/jpeg,image/png,image/webp" required /></label></Form>
    {judge.photoId && <Form action="judge-photo-remove" run={run} label={demo ? "Volver al retrato de ejemplo" : "Quitar foto"}><input type="hidden" name="judgeId" value={judge.id} /></Form>}
  </details>;
}
