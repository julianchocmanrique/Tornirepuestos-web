"use client";

import { useMemo, useState } from "react";

import { waWholesale } from "@/lib/wa";

const businessTypes = [
  "Almacén de repuestos",
  "Taller",
  "Empresa transportadora",
  "Flota",
  "Comercializador",
  "Distribuidor",
  "Otro",
];

const monthlyRanges = [
  "Menos de $5 millones",
  "$5 a $15 millones",
  "$15 a $40 millones",
  "$40 a $80 millones",
  "Más de $80 millones",
];

export function MayoristaForm() {
  const [empresa, setEmpresa] = useState("");
  const [nit, setNit] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [departamento, setDepartamento] = useState("");
  const [contacto, setContacto] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [correo, setCorreo] = useState("");
  const [tipoNegocio, setTipoNegocio] = useState(businessTypes[0]);
  const [compraMensual, setCompraMensual] = useState(monthlyRanges[0]);
  const [marcas, setMarcas] = useState("");

  const mensajeCompuesto = useMemo(
    () =>
      [
        "Solicitud cliente mayorista Tornirepuestos",
        `Empresa: ${empresa || "No informado"}`,
        `NIT: ${nit || "No informado"}`,
        `Ciudad: ${ciudad || "No informado"}`,
        `Departamento: ${departamento || "No informado"}`,
        `Persona de contacto: ${contacto || "No informado"}`,
        `WhatsApp: ${whatsapp || "No informado"}`,
        `Correo: ${correo || "No informado"}`,
        `Tipo de negocio: ${tipoNegocio || "No informado"}`,
        `Compra mensual aproximada en repuestos: ${compraMensual || "No informado"}`,
        `Marcas que comercializa: ${marcas || "No informado"}`,
      ].join("\n"),
    [compraMensual, contacto, correo, ciudad, departamento, empresa, marcas, nit, tipoNegocio, whatsapp]
  );

  const waLink = waWholesale(mensajeCompuesto);
  const mailLink = `mailto:ventas@tornirepuestos.com?subject=${encodeURIComponent(
    `Cliente mayorista: ${empresa || "Nueva solicitud"}`
  )}&body=${encodeURIComponent(mensajeCompuesto)}`;

  const inputClass =
    "mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-red-300 focus:ring-4 focus:ring-red-100";

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_20px_70px_rgba(15,23,42,0.10)] md:p-8">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-semibold text-slate-700">
          Nombre de la empresa
          <input className={inputClass} value={empresa} onChange={(e) => setEmpresa(e.target.value)} placeholder="Ej. Repuestos del Caribe SAS" />
        </label>
        <label className="text-sm font-semibold text-slate-700">
          NIT
          <input className={inputClass} value={nit} onChange={(e) => setNit(e.target.value)} placeholder="900.000.000-0" />
        </label>
        <label className="text-sm font-semibold text-slate-700">
          Ciudad
          <input className={inputClass} value={ciudad} onChange={(e) => setCiudad(e.target.value)} placeholder="Barranquilla, Cartagena, Santa Marta..." />
        </label>
        <label className="text-sm font-semibold text-slate-700">
          Departamento
          <input className={inputClass} value={departamento} onChange={(e) => setDepartamento(e.target.value)} placeholder="Atlántico, Magdalena, Bolívar..." />
        </label>
        <label className="text-sm font-semibold text-slate-700">
          Persona de contacto
          <input className={inputClass} value={contacto} onChange={(e) => setContacto(e.target.value)} placeholder="Nombre del comprador o encargado" />
        </label>
        <label className="text-sm font-semibold text-slate-700">
          WhatsApp
          <input className={inputClass} value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+57 300 000 0000" />
        </label>
        <label className="text-sm font-semibold text-slate-700">
          Correo
          <input className={inputClass} value={correo} onChange={(e) => setCorreo(e.target.value)} placeholder="compras@empresa.com" />
        </label>
        <label className="text-sm font-semibold text-slate-700">
          Tipo de negocio
          <select className={inputClass} value={tipoNegocio} onChange={(e) => setTipoNegocio(e.target.value)}>
            {businessTypes.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        </label>
        <label className="text-sm font-semibold text-slate-700 md:col-span-2">
          ¿Cuánto compra al mes en repuestos?
          <select className={inputClass} value={compraMensual} onChange={(e) => setCompraMensual(e.target.value)}>
            {monthlyRanges.map((range) => (
              <option key={range}>{range}</option>
            ))}
          </select>
        </label>
        <label className="text-sm font-semibold text-slate-700 md:col-span-2">
          ¿Qué marcas comercializa?
          <textarea
            className={`${inputClass} min-h-28 resize-y`}
            value={marcas}
            onChange={(e) => setMarcas(e.target.value)}
            placeholder="Ej. Cummins, Eaton, Fuller, Meritor, Spicer, Timken..."
          />
        </label>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <a
          href={waLink}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center rounded-2xl px-6 py-4 text-sm font-extrabold uppercase tracking-wide text-white shadow-sm transition hover:opacity-90"
          style={{ background: "var(--tp-action-primary)" }}
        >
          Quiero ser cliente mayorista
        </a>
        <a
          href={mailLink}
          className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
        >
          Enviar por correo
        </a>
      </div>
    </div>
  );
}
