"use client";
import type { Participant } from "@/lib/baile/types";
import { dateTime } from "@/lib/baile/types";
import { SignatureDrawing } from "./RegistrationWizard";
import { fileUrl } from "./ui";
export function RegistrationRecord({ p }: { p: Participant }) {
  const r = p.registration;
  if (!r) return <p className="dance-muted">Registro anterior o creado por organización: no tiene carta firmada ni foto cargadas mediante el registro de cinco pasos.</p>;
  return <section className="registration-record"><h3>Datos del registro</h3><div className="dance-detail-grid"><p><b>País / sexo</b>{r.country} · {r.sex}</p><p><b>Tipo de documento</b>{r.documentType}</p><p><b>Nivel de salsa</b>{r.salsa}</p><p><b>Nivel de bachata</b>{r.bachata}</p></div><a href={fileUrl(r.photoId)} target="_blank" rel="noreferrer"><img className="registration-photo" src={fileUrl(r.photoId)} alt={`Foto de ${p.name}`} />Ver foto de registro</a><details className="dance-inline-card"><summary>Carta aceptada y firma</summary><p>Aceptada el {dateTime(r.waiver.acceptedAt)} · Versión {r.waiver.version}</p>{r.waiver.guardianName && <p>Representante: {r.waiver.guardianName} · Documento: {r.waiver.guardianDocument}</p>}<div className="registration-letter">{r.waiver.text}</div><svg viewBox="0 0 800 200" aria-label="Firma guardada del registro"><SignatureDrawing strokes={r.waiver.signature} /></svg></details></section>;
}
