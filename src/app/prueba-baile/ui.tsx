"use client";
import { useState, type ReactNode, type FormEvent } from "react";
import { statusLabels, money, type Status, type Payment, type Enrollment } from "@/lib/baile/types";
export type Result = { access?: { name: string; email: string; password: string }[]; role?: string; error?: string };
export type Run = (action: string, data: FormData) => Promise<Result | null>;
export const base = "/prueba-baile";
export const rolePath: Record<string, string> = { participant: "participante", admin: "admin", judge: "jurado" };
export const fileUrl = (id: string) => `/api/baile/files/${id}`;
export const today = () => new Date().toLocaleDateString("en-CA", { timeZone: "America/Bogota" });
export function Badge({ status }: { status?: Status }) { return <span className={`dance-badge ${status || "missing"}`}>{status ? statusLabels[status] : "Por enviar"}</span>; }
export function Field({ label, name, type = "text", value, required = true, children, ...props }: { label: string; name: string; type?: string; value?: string | number; required?: boolean; children?: ReactNode; min?: string | number; max?: string | number; minLength?: number; maxLength?: number; accept?: string; placeholder?: string; autoComplete?: string; step?: number; readOnly?: boolean }) {
  return <label className="dance-field"><span>{label}{!required && <small> (opcional)</small>}</span>{children || <input name={name} type={type} defaultValue={value} required={required} {...props} />}</label>;
}
export function Form({ action, run, children, label = "Guardar", className = "", after }: { action: string; run: Run; children: ReactNode; label?: string; className?: string; after?: () => void }) {
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) { e.preventDefault(); setBusy(true); try { const ok = await run(action, new FormData(e.currentTarget)); if (ok) after?.(); } finally { setBusy(false); } }
  return <form onSubmit={submit} className={`dance-form ${className}`}><fieldset disabled={busy}>{children}<button className="dance-btn" type="submit">{busy ? "Guardando…" : label}<span aria-hidden="true">↗</span></button></fieldset></form>;
}
export function Heading({ eyebrow, title, detail }: { eyebrow: string; title: string; detail?: string }) { return <div className="dance-heading"><p className="dance-eyebrow">{eyebrow}</p><h1>{title}</h1>{detail && <p>{detail}</p>}</div>; }
export function Empty({ children }: { children: ReactNode }) { return <div className="dance-empty">{children}</div>; }
export function Stat({ label, value }: { label: string; value: string | number }) { return <div className="dance-stat"><span>{label}</span><strong>{value}</strong></div>; }
export function Receipt({ payment }: { payment?: Payment }) { return payment ? <div className="dance-payment-meta"><Badge status={payment.status} /><span>{money(payment.amount)} · {payment.date}</span><a href={fileUrl(payment.receiptId)} target="_blank" rel="noreferrer">Descargar comprobante ↗</a>{payment.note && <p>{payment.note}</p>}</div> : <Badge />; }
export function Music({ e }: { e: Enrollment }) { return e.musicId ? <div className="dance-music"><span>{e.musicName}</span><audio controls preload="none" src={fileUrl(e.musicId)} aria-label={`Pista ${e.code}`} /><a href={`${fileUrl(e.musicId)}?download=1`}>Descargar pista</a></div> : <span className="dance-muted">Pista pendiente</span>; }
export function exportCsv(filename: string, rows: (string | number | null)[][]) {
  const csv = "\uFEFF" + rows.map(row => row.map(value => { let str = String(value ?? ""); if (/^[=+@\-\t\r]/.test(str)) str = "'" + str; return `"${str.replace(/"/g, '""')}"`; }).join(";")).join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" })); const a = document.createElement("a"); a.href = url; a.download = filename; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
