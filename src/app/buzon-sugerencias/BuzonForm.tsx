"use client";

import { useMemo, useState } from "react";

import { wa } from "@/lib/wa";

export function BuzonForm() {
  const [nombre, setNombre] = useState("");
  const [contacto, setContacto] = useState("");
  const [asunto, setAsunto] = useState("");
  const [mensaje, setMensaje] = useState("");

  const mensajeCompuesto = useMemo(
    () =>
      [
        "Buzón de sugerencias Tornirepuestos",
        `Nombre: ${nombre || "No informado"}`,
        `Contacto: ${contacto || "No informado"}`,
        `Asunto: ${asunto || "No informado"}`,
        `Mensaje: ${mensaje || "No informado"}`,
      ].join("\n"),
    [asunto, contacto, mensaje, nombre]
  );

  const waLink = wa(mensajeCompuesto);
  const mailLink = `mailto:ventas@tornirepuestos.com?subject=${encodeURIComponent(
    `Buzón de sugerencias: ${asunto || "Nueva sugerencia"}`
  )}&body=${encodeURIComponent(mensajeCompuesto)}`;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm text-slate-700">
          Nombre
          <input
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-slate-400"
            placeholder="Tu nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </label>

        <label className="text-sm text-slate-700">
          Correo o teléfono
          <input
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-slate-400"
            placeholder="ejemplo@correo.com / +57..."
            value={contacto}
            onChange={(e) => setContacto(e.target.value)}
          />
        </label>
      </div>

      <label className="mt-4 block text-sm text-slate-700">
        Asunto
        <input
          className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-slate-400"
          placeholder="Sugerencia sobre atención, catálogo, web..."
          value={asunto}
          onChange={(e) => setAsunto(e.target.value)}
        />
      </label>

      <label className="mt-4 block text-sm text-slate-700">
        Mensaje
        <textarea
          className="mt-1 min-h-32 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-0 transition focus:border-slate-400"
          placeholder="Cuéntanos tu sugerencia..."
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
        />
      </label>

      <div className="mt-5 flex flex-wrap gap-3">
        <a
          href={waLink}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold text-white"
          style={{ background: "var(--tp-action-primary)" }}
        >
          Enviar por WhatsApp
        </a>
        <a
          href={mailLink}
          className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Enviar por correo
        </a>
      </div>
    </div>
  );
}
