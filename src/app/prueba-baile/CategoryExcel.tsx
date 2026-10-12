"use client";
import { useEffect, useRef, useState } from "react";
import type { EventDraft } from "@/lib/baile/event-draft";
import { money } from "@/lib/baile/types";
import { useDanceScope } from "./DanceScope";
import type { Run } from "./ui";
type Category = EventDraft["categories"][number];
export function CategoryExcel({ onApply }: { onApply: (categories: Category[], file: File) => Promise<string> }) {
  const { apiBase } = useDanceScope();
  const [file, setFile] = useState<File | null>(null), [rows, setRows] = useState<Category[]>([]);
  const [busy, setBusy] = useState(false), [error, setError] = useState(""), [message, setMessage] = useState("");
  const request = useRef<AbortController | null>(null), input = useRef<HTMLInputElement>(null);
  useEffect(() => () => request.current?.abort(), []);
  async function preview(file: File | null) {
    request.current?.abort(); const controller = new AbortController(); request.current = controller;
    setFile(file); setRows([]); setError(""); setMessage(""); setBusy(false);
    if (!file) return;
    if (!/\.xlsx?$/i.test(file.name) || file.size > 5 * 1024 ** 2) { setError("Sube un archivo .xlsx o .xls de máximo 5 MB."); return; }
    setBusy(true);
    try {
      const data = new FormData(); data.set("file", file);
      const response = await fetch(`${apiBase}/categories-preview`, { method: "POST", body: data, signal: controller.signal });
      const result = await response.json(); if (!response.ok) throw Error(result.error || "No se pudo leer el Excel.");
      if (!controller.signal.aborted) setRows(result.categories);
    } catch (e) { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : "No se pudo leer el Excel."); }
    finally { if (!controller.signal.aborted) setBusy(false); }
  }
  async function apply() {
    if (!file || busy || !rows.length) return; setBusy(true); setError("");
    try { const message = await onApply(rows, file); setMessage(message); setRows([]); setFile(null); if (input.current) input.current.value = ""; }
    catch (e) { setError(e instanceof Error ? e.message : "No se pudieron importar las categorías."); }
    finally { setBusy(false); }
  }
  return <section className="dance-inline-card"><h3>Importar categorías desde Excel</h3><p>Usa las columnas <b>nombre, modalidad, categoria</b>. Puedes incluir <b>precio</b> en cada fila o añadir otra tabla con <b>precios modalidades, precio</b>, en la misma hoja o en otra.</p><p className="dance-muted">Modalidades: solista, pareja y grupo. Precios en COP. Hasta 60 categorías por archivo; no uses fórmulas. La columna opcional «división» indica el nivel. Solo afecta a este evento y no borra categorías existentes.</p>
    <label className="dance-field"><span>Archivo de categorías (.xlsx o .xls)</span><input ref={input} type="file" accept=".xlsx,.xls" disabled={busy} onChange={e => void preview(e.target.files?.[0] || null)} /></label>
    {error && <p className="dance-notice error" role="alert">{error}</p>}{message && <p role="status">{message}</p>}{busy && <p role="status">Procesando Excel…</p>}
    {!!rows.length && <><h4>Vista previa: {rows.length} categorías</h4><div className="dance-table-wrap"><table><thead><tr><th>Nombre</th><th>Modalidad</th><th>Categoría / disciplina</th><th>División</th><th>Precio COP</th></tr></thead><tbody>{rows.map((c, i) => <tr key={i}><td>{c.name}</td><td>{c.modality}</td><td>{c.rhythm}</td><td>{c.division}</td><td>{money(Number(c.fee))}</td></tr>)}</tbody></table></div><button type="button" className="dance-btn" disabled={busy} onClick={() => void apply()}>Confirmar e incorporar categorías</button></>}
  </section>;
}
export function CategoryImport({ run }: { run: Run }) {
  return <div className="dance-panel"><CategoryExcel onApply={async (_, file) => {
    const data = new FormData(); data.set("file", file); data.set("confirm", "import"); let error = "No se pudo importar el archivo.";
    const result = await run("categories-import", data, message => { error = message; }); if (!result) throw Error(error);
    return `${result.added} categorías creadas. ${result.skipped} ya existían y se conservaron.`;
  }} /></div>;
}
