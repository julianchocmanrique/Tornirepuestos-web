"use client";
import { useDanceScope } from "./DanceScope";
import { DanceScope } from "./DanceScope";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { money, type Snapshot } from "@/lib/baile/types";
import { rolePath, Heading, Form, Field, exportCsv, type Run, type Result } from "./ui";
import { Register, Participant } from "./Participant";
import { Admin } from "./Admin";
import { Contractor } from "./Contractor";
import { PublicResults } from "./PublicResults";
import { Judge } from "./Judge";
import { EnrollmentDetail } from "./EnrollmentDetail";
import { EventHome } from "./EventHome";
import { RankiaBrand } from "./RankiaBrand";
import { ProfileSwitcher } from "./ProfileSwitcher";
export type View = "home" | "registro" | "acceso" | "participante" | "admin" | "contratista" | "resultados" | "jurado" | "inscripcion";
export function DanceApp({ view, enrollmentId, eventId }: { view: View; enrollmentId?: string; eventId?: string }) {
  return <DanceScope eventId={eventId}><DanceAppBody key={eventId || "legacy"} view={view} enrollmentId={enrollmentId} /></DanceScope>;
}
function DanceAppBody({ view, enrollmentId }: { view: View; enrollmentId?: string }) {
  const { base, apiBase, eventId } = useDanceScope();
  const [switching, setSwitching] = useState(false);
  const router = useRouter(); const [s, setS] = useState<Snapshot | null>(null); const [error, setError] = useState(""); const [message, setMessage] = useState(""); const [access, setAccess] = useState<Result["access"]>();
  const refresh = useCallback(async () => { const res = await fetch(`${apiBase}/snapshot`, { cache: "no-store" }); const data = await res.json(); if (!res.ok) throw new Error(data.error); setS(data); }, [apiBase]);
  useEffect(() => { refresh().catch(e => setError(e.message || "No se pudo conectar al evento.")); }, [refresh, view]);
  const run: Run = async (action, data, onError) => {
    setError(""); setMessage("");
    try {
      const res = await fetch(`${apiBase}/${action}`, { method: "POST", body: data }); const out = await res.json();
      if (!res.ok) throw new Error(out.error || "No se pudo guardar.");
      if (out.access) setAccess(out.access);
      if (action === "login" || action === "register") router.push(`${base}/${rolePath[out.role]}`);
      if (action === "switch-profile" || action === "logout") {
        setS(null); setAccess(undefined); setSwitching(false);
        router.replace(action === "logout" ? base : `${base}/${rolePath[out.role]}`);
      }
      await refresh(); setMessage(action === "score" ? "Calificación enviada y bloqueada." : action === "example" ? "Recorrido de ejemplo creado. Los accesos aparecen a continuación." : "Cambios guardados correctamente.");
      return out;
    } catch (e) { const message = e instanceof Error ? e.message : "Error de conexión. Vuelve a intentarlo."; setError(message); onError?.(message); return null; }
  };
  const allowed = view === "inscripcion" ? ["superadmin", "contractor"].includes(s?.user?.role || "") : view === "participante" ? s?.user?.role === "participant" : view === "admin" ? s?.user?.role === "superadmin" : view === "contratista" ? s?.user?.role === "contractor" : view === "jurado" ? s?.user?.role === "judge" : true;
  return <div className="dance-app">
    <header className="dance-header"><Link className="dance-brand" href={base} onClick={() => setSwitching(false)}><RankiaBrand /></Link><nav aria-label="Navegación del evento">
      <Link href={`${base}/resultados`} onClick={() => setSwitching(false)}>Resultados</Link>
      {s?.user ? <>
        <Link href={base} onClick={() => setSwitching(false)}>El evento</Link>
        <Link href={`${base}/${rolePath[s.user.role]}`} onClick={() => setSwitching(false)}>Mi panel</Link>
        <button onClick={() => { if (s.settings.demo) { setError(""); setMessage(""); setAccess(undefined); setSwitching(true); } else { run("logout", new FormData()); } }}>{s.settings.demo ? "Cambiar usuario" : "Salir"}</button>
      </> : <>
        <Link href={`${base}/acceso`}>Ingresar</Link>
        <Link className="dance-btn small" href={`${base}/registro`}>{eventId ? "Registrarse" : "Inscribirme"} <span aria-hidden="true">↗</span></Link>
      </>}
    </nav></header>
    <main>
      {(error || message) && <div className={`dance-notice ${error ? "error" : "success"}`} role={error ? "alert" : "status"}>{error || message}<button onClick={() => { setError(""); setMessage(""); }} aria-label="Cerrar aviso">×</button></div>}
      {access && <section className="dance-access-list dance-container"><h2>Accesos del recorrido de ejemplo</h2><p>Estas contraseñas se muestran una sola vez. Descárgalas para hacer las pruebas.</p><button className="dance-btn secondary" onClick={() => exportCsv("accesos-ejemplo.csv", [["Nombre", "Correo", "Contraseña"], ...access.map(a => [a.name, a.email, a.password])])}>Descargar accesos</button>{access.map(a => <p key={a.email}><strong>{a.name}</strong> · {a.email} · <code>{a.password}</code></p>)}<button onClick={() => setAccess(undefined)}>Cerrar</button></section>}
      {!s ? <div className="dance-container dance-loading">{error ? <button className="dance-btn" onClick={() => refresh().catch(e => setError(e.message))}>Reintentar conexión</button> : "Preparando el escenario…"}</div> : switching && s.user && s.settings.demo ? <ProfileSwitcher currentId={s.user.id} run={run} onCancel={() => { setSwitching(false); setError(""); setMessage(""); router.push(`${base}/${rolePath[s.user!.role]}`); }} /> : !allowed ? <section className="dance-container dance-auth"><Heading eyebrow="Tu acceso" title="Ingresa a tu espacio" detail="Usa la cuenta correspondiente a participante, organización o jurado." /><Link className="dance-btn" href={`${base}/acceso`}>Iniciar sesión ↗</Link></section> : <>
        {view === "home" && <Home s={s} />}
        {view === "registro" && <Register s={s} run={run} />}
        {view === "acceso" && <section className="dance-container dance-auth"><div><Heading eyebrow="Bienvenido de nuevo" title="Tu lugar está aquí." detail="Superadministradores, contratistas, participantes y jurados ingresan con su usuario o correo y contraseña." /><div className="dance-callout">Tu cuenta te lleva directamente al espacio que te corresponde.</div></div><div className="dance-panel"><h2>Ingresa a tu cuenta</h2><Form action="login" run={run} label="Entrar"><Field label="Usuario o correo" name="email" type="text" autoComplete="username" /><Field label="Contraseña" name="password" type="password" autoComplete="current-password" maxLength={160} /></Form><p className="dance-muted">¿Es tu primera vez? <Link href={`${base}/registro`}>Crea tu registro</Link></p><p className="dance-muted">Si olvidaste tu contraseña, solicita a la organización que la restablezca.</p></div></section>}
        {view === "participante" && <Participant s={s} run={run} />}
        {view === "resultados" && <PublicResults />}
        {view === "contratista" && <Contractor s={s} run={run} />}
        {view === "inscripcion" && <EnrollmentDetail key={enrollmentId} s={s} enrollmentId={enrollmentId || ""} run={run} />}
        {view === "admin" && <Admin s={s} run={run} refresh={refresh} />}
        {view === "jurado" && <Judge s={s} run={run} />}
      </>}
    </main>
    <footer className="dance-footer"><Link className="dance-brand" href="/prueba-baile"><RankiaBrand /></Link><div><Link href={`${base}/acceso`}>Acceso organización</Link><Link href={`${base}/jurado`}>Acceso jurados</Link><span>Hora de Colombia · UTC−5</span></div></footer>
  </div>;
}
function Home({ s }: { s: Snapshot }) {
  const { base } = useDanceScope();
  return <><EventHome demo={s.settings.demo} />
    <section id="como-funciona" className="dance-container dance-section"><div className="dance-section-title"><div><p className="dance-eyebrow">DEL REGISTRO AL ESCENARIO</p><h2>El camino empieza contigo.</h2></div><p>Un solo perfil para seguir tus inscripciones, comprobantes y pistas.</p></div><div className="dance-steps">{[["01", "Crea tu perfil", "Registra tus datos y recibe tu código único de participante."], ["02", "Activa tu Full Pass", "Carga el comprobante y espera la validación de la organización."], ["03", "Elige tu competencia", "Inscríbete y paga cada categoría. Luego, sube su pista musical."], ["04", "Sal a la pista", "Consulta tu número. Los jurados califican y se calculan los resultados."]].map(([n, title, copy]) => <article key={n}><span>{n}</span><h3>{title}</h3><p>{copy}</p></article>)}</div></section>
    <section className="dance-category-section"><div className="dance-container dance-section"><div className="dance-section-title"><div><p className="dance-eyebrow">ENCUENTRA TU LUGAR</p><h2>Una pista. Muchos estilos.</h2></div><p>Full Pass: <strong>{money(s.settings.fullPassFee)}</strong><br />La inscripción a cada categoría se paga por separado.</p></div><div className="dance-categories">{s.categories.map((c, i) => <article className="dance-category" key={c.id}><span className="dance-category-number">0{i + 1}</span><div><p className="dance-eyebrow">{c.rhythm} · {c.division}</p><h3>{c.name}</h3><p>{c.modality}</p></div><div className="dance-category-foot"><strong>{money(c.fee)}</strong><Link href={`${base}/${s.user?.role === "participant" ? "participante" : "registro"}`} aria-label={`Inscribirme en ${c.name}`}>↗</Link></div></article>)}</div></div></section>
    <section className="dance-container dance-section"><div className="dance-bottom-cta"><div><p className="dance-eyebrow">EL PRIMER PASO ES TUYO</p><h2>Lo que te mueve,<br /><em>merece un escenario.</em></h2></div><Link className="dance-btn" href={`${base}/registro`}>Crear mi registro ↗</Link></div></section></>;
}
