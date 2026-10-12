"use client";
import { MobileModuleSelect } from "./MobileModuleSelect";
import { Registers } from "./Registers";
import { useEffect, useState } from "react";
import { type Snapshot } from "@/lib/baile/types";
import { contractorModules, normalizeModuleHash } from "./admin-navigation";
import { EnrollmentsDesk } from "./EnrollmentsDesk";
import { Stat, type Run } from "./ui";

export function Contractor({ s, run }: { s: Snapshot; run: Run }) {
  const [tab, setTab] = useState("Registro");
  useEffect(() => { const sync = () => { const id = normalizeModuleHash(window.location.hash); if (window.location.hash === "#pagos") window.history.replaceState(null, "", "#inscripciones"); setTab(contractorModules.find(m => m.id === id)?.name || "Registro"); }; sync(); window.addEventListener("hashchange", sync); return () => window.removeEventListener("hashchange", sync); }, []);
  return <section className="dance-admin-shell">
    <aside className="dance-admin-nav"><MobileModuleSelect modules={contractorModules} value={contractorModules.find(m => m.name === tab)!.id} onChange={id => { setTab(contractorModules.find(m => m.id === id)!.name); window.location.hash = id; }} /><div className="dance-admin-nav-title"><span className="dance-eyebrow">CONTRATISTA DEL EVENTO</span><strong>Gestión del evento</strong><small>{s.settings.name}</small></div><nav aria-label="Módulos del contratista">{contractorModules.map(({ name }, i) => <button key={name} className={`dance-contractor-tab ${tab === name ? "active" : ""}`} aria-current={tab === name ? "page" : undefined} onClick={() => { setTab(name); window.location.hash = contractorModules.find(m => m.name === name)!.id; }}><span className="dance-nav-number">0{i + 1}</span>{name}</button>)}</nav><p className="dance-muted">Consulta los registros y valida comprobantes. La configuración y las calificaciones pertenecen a superadministración y jurados.</p></aside>
    <div className="dance-admin-workspace"><div className="dance-admin-title"><div><p className="dance-eyebrow">GESTIÓN / {tab}</p><h1>{tab}</h1><p>Consulta de participantes, inscripciones por categoría y aprobación de transacciones.</p></div></div>
      <div className="dance-stats"><Stat label="Registro" value={s.participants.length} /><Stat label="Inscripciones" value={s.enrollments.length} /><Stat label="Pagos por revisar" value={s.payments.filter(p => ["pending", "review"].includes(p.status)).length} /></div>
      {tab === "Registro" && <Registers s={s} run={run} />}
      {tab === "Inscripciones" && <EnrollmentsDesk s={s} run={run} />}
    </div>
  </section>;
}
