"use client";

import { FormEvent, useState } from "react";

type ApiResult = {
  ok: boolean;
  error?: string;
  result?: {
    totalRows: number;
    usableRows: number;
    invalidRows: number;
    matched: number;
    updated: number;
    skippedFeatured: number;
    mode: "compare" | "force";
    skipFeatured: boolean;
  };
};

export function StockUploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();

    if (!file) {
      setError("Selecciona un archivo Excel primero.");
      return;
    }

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const form = new FormData();
      form.append("file", file);

      const res = await fetch("/api/admin/upload-stock", {
        method: "POST",
        body: form,
      });

      const data = (await res.json()) as ApiResult;

      if (!res.ok || !data.ok || !data.result) {
        setError(data.error || "No se pudo actualizar el stock.");
        return;
      }

      const r = data.result;
      setMessage(
        `OK. Filas: ${r.totalRows}, utiles: ${r.usableRows}, invalidas: ${r.invalidRows}, coincidencias: ${r.matched}, actualizados: ${r.updated}, destacados omitidos automaticamente: ${r.skippedFeatured}.`
      );
    } catch {
      setError("Error de red al subir el archivo.");
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  return (
    <form className="mt-6 space-y-4" onSubmit={onSubmit}>
      <div>
        <label className="mb-1 block text-sm font-semibold text-slate-700">Archivo Excel (.xlsx, .xls)</label>
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
          required
        />
      </div>

      {message ? <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">{message}</p> : null}
      {error ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p> : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
        >
          {loading ? "Procesando..." : "Subir y actualizar stock"}
        </button>

        <button
          type="button"
          onClick={logout}
          className="rounded-xl border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-100"
        >
          Cerrar sesión
        </button>
      </div>
    </form>
  );
}
