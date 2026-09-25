"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { money, type Snapshot } from "@/lib/baile/types";
import { base, rolePath, Heading, Form, Field, exportCsv, type Run, type Result } from "./ui";
import { Register, Participant } from "./Participant";
import { Admin } from "./Admin";
import { Judge } from "./Judge";
export type View = "home" | "registro" | "acceso" | "participante" | "admin" | "jurado";
export function DanceApp({ view }: { view: View }) {
  const router = useRouter(); const [s, setS] = useState<Snapshot | null>(null); const [error, setError] = useState(""); const [message, setMessage] = useState(""); const [access, setAccess] = useState<Result["access"]>();
  const refresh = useCallback(async () => { const res = await fetch("/api/baile/snapshot", { cache: "no-store" }); const data = await res.json(); if (!res.ok) throw new Error(data.error); setS(data); }, []);
  useEffect(() => { refresh().catch(e => setError(e.message || "No se pudo conectar al evento.")); }, [refresh, view]);
  const run: Run = async (action, data) => {
    setError(""); setMessage("");
    try {
      const res = await fetch(`/api/baile/${action}`, { method: "POST", body: data }); const out = await res.json();
      if (!res.ok) throw new Error(out.error || "No se pudo guardar.");
      if (out.access) setAccess(out.access);
      if (action === "login" || action === "register") router.push(`${base}/${rolePath[out.role]}`);
      if (action === "logout") router.push(base);
      await refresh(); setMessage(action === "score" ? "Calificación enviada y bloqueada." : action === "example" ? "Recorrido de ejemplo creado. Los accesos aparecen a continuación." : "Cambios guardados correctamente.");
      return out;
    } catch (e) { setError(e instanceof Error ? e.message : "Error de conexión. Vuelve a intentarlo."); return null; }
  };
  const allowed = view === "participante" ? s?.user?.role === "participant" : view === "admin" ? s?.user?.role === "admin" : view === "jurado" ? s?.user?.role === "judge" : true;
  return <div className="dance-app">
    <header className="dance-header"><Link className="dance-brand" href={base}><span className="dance-brand-symbol" aria-hidden="true">r.</span><span>{s?.settings.name || "Ritmo Caribe"}<small>PLATAFORMA DE COMPETENCIA</small></span></Link><nav aria-label="Navegación del evento"><Link href={base}>El evento</Link>{s?.user ? <><Link href={`${base}/${rolePath[s.user.role]}`}>Mi panel</Link><button onClick={() => run("logout", new FormData())}>Salir</button></> : <><Link href={`${base}/acceso`}>Ingresar</Link><Link className="dance-btn small" href={`${base}/registro`}>Inscribirme <span aria-hidden="true">↗</span></Link></>}</nav></header>
    {s?.settings.demo && <div className="dance-demo"><span className="dance-dot" />EVENTO DE EJEMPLO <span>Tarifas y datos de muestra. No realices pagos reales.</span></div>}
    <main>
      {(error || message) && <div className={`dance-notice ${error ? "error" : "success"}`} role={error ? "alert" : "status"}>{error || message}<button onClick={() => { setError(""); setMessage(""); }} aria-label="Cerrar aviso">×</button></div>}
      {access && <section className="dance-access-list dance-container"><h2>Accesos del recorrido de ejemplo</h2><p>Estas contraseñas se muestran una sola vez. Descárgalas para hacer las pruebas.</p><button className="dance-btn secondary" onClick={() => exportCsv("accesos-ejemplo.csv", [["Nombre", "Correo", "Contraseña"], ...access.map(a => [a.name, a.email, a.password])])}>Descargar accesos</button>{access.map(a => <p key={a.email}><strong>{a.name}</strong> · {a.email} · <code>{a.password}</code></p>)}<button onClick={() => setAccess(undefined)}>Cerrar</button></section>}
      {!s ? <div className="dance-container dance-loading">{error ? <button className="dance-btn" onClick={() => refresh().catch(e => setError(e.message))}>Reintentar conexión</button> : "Preparando el escenario…"}</div> : !allowed ? <section className="dance-container dance-auth"><Heading eyebrow="Tu acceso" title="Ingresa a tu espacio" detail="Usa la cuenta correspondiente a participante, organización o jurado." /><Link className="dance-btn" href={`${base}/acceso`}>Iniciar sesión ↗</Link></section> : <>
        {view === "home" && <Home s={s} />}
        {view === "registro" && <Register s={s} run={run} />}
        {view === "acceso" && <section className="dance-container dance-auth"><div><Heading eyebrow="Bienvenido de nuevo" title="Nos vemos en la pista." detail="Participantes, organización y jurados ingresan con su propio correo y contraseña." /><div className="dance-callout">Tu cuenta te lleva directamente al espacio que te corresponde.</div></div><div className="dance-panel"><h2>Ingresa a tu cuenta</h2><Form action="login" run={run} label="Entrar"><Field label="Correo electrónico" name="email" type="email" autoComplete="username" /><Field label="Contraseña" name="password" type="password" autoComplete="current-password" maxLength={160} /></Form><p className="dance-muted">¿Es tu primera vez? <Link href={`${base}/registro`}>Crea tu registro</Link></p><p className="dance-muted">Si olvidaste tu contraseña, solicita a la organización que la restablezca.</p></div></section>}
        {view === "participante" && <Participant s={s} run={run} />}
        {view === "admin" && <Admin s={s} run={run} refresh={refresh} />}
        {view === "jurado" && <Judge s={s} run={run} />}
      </>}
    </main>
    <footer className="dance-footer"><span>{s?.settings.name || "Ritmo Caribe"} <small>{s?.settings.tagline || "Movimiento. Talento. Encuentro."}</small></span><div><Link href={`${base}/acceso`}>Acceso organización</Link><Link href={`${base}/jurado`}>Acceso jurados</Link><span>Hora de Colombia · UTC−5</span></div></footer>
  </div>;
}
function Home({ s }: { s: Snapshot }) {
  return <><section className="dance-hero dance-container"><div className="dance-hero-copy"><p className="dance-eyebrow"><span className="dance-dot" /> SALSA / BACHATA / URBANA</p><h1>Tu talento.<br />Tu ritmo.<br /><em>Tu escenario.</em></h1><p>Haz parte de {s.settings.name}. Inscríbete, elige tus categorías y prepárate para compartir lo que te mueve.</p><div className="dance-actions"><Link className="dance-btn" href={s.user ? `${base}/${rolePath[s.user.role]}` : `${base}/registro`}>{s.user ? "Ir a mi panel" : "Quiero participar"}<span>↗</span></Link><a className="dance-text-link" href="#como-funciona">Así funciona <span>↓</span></a></div><div className="dance-hero-meta"><span><strong>{s.categories.length}</strong> categorías de ejemplo</span><span><strong>01</strong> pasión por bailar</span></div></div><div className="dance-poster" aria-label="Ritmo Caribe. El escenario te espera."><div className="dance-poster-top"><span>RITMO<br />EN MOVIMIENTO</span><span>RC / 01</span></div><div className="dance-orbit o1" /><div className="dance-orbit o2" /><div className="dance-orbit o3" /><div className="dance-poster-word">BAI<br /><i>LA.</i></div><div className="dance-poster-bottom"><span>El escenario<br />te espera.</span><span className="dance-big-arrow">↗</span></div></div></section>
    <div className="dance-rhythm-bar" aria-hidden="true"><span>SALSA</span><i>✳</i><span>BACHATA</span><i>✳</i><span>URBANA</span><i>✳</i><span>MUCHO TALENTO</span></div>
    <section id="como-funciona" className="dance-container dance-section"><div className="dance-section-title"><div><p className="dance-eyebrow">DEL REGISTRO AL ESCENARIO</p><h2>El camino empieza contigo.</h2></div><p>Un solo perfil para seguir tus inscripciones, comprobantes y pistas.</p></div><div className="dance-steps">{[["01", "Crea tu perfil", "Registra tus datos y recibe tu código único de participante."], ["02", "Activa tu Full Pass", "Carga el comprobante y espera la validación de la organización."], ["03", "Elige tu competencia", "Inscríbete y paga cada categoría. Luego, sube su pista musical."], ["04", "Sal a la pista", "Consulta tu número. Los jurados califican y se calculan los resultados."]].map(([n, title, copy]) => <article key={n}><span>{n}</span><h3>{title}</h3><p>{copy}</p></article>)}</div></section>
    <section className="dance-category-section"><div className="dance-container dance-section"><div className="dance-section-title"><div><p className="dance-eyebrow">ENCUENTRA TU LUGAR</p><h2>Una pista. Muchos estilos.</h2></div><p>Full Pass: <strong>{money(s.settings.fullPassFee)}</strong><br />La inscripción a cada categoría se paga por separado.</p></div><div className="dance-categories">{s.categories.map((c, i) => <article className="dance-category" key={c.id}><span className="dance-category-number">0{i + 1}</span><div><p className="dance-eyebrow">{c.rhythm} · {c.division}</p><h3>{c.name}</h3><p>{c.modality}</p></div><div className="dance-category-foot"><strong>{money(c.fee)}</strong><Link href={`${base}/${s.user?.role === "participant" ? "participante" : "registro"}`} aria-label={`Inscribirme en ${c.name}`}>↗</Link></div></article>)}</div></div></section>
    <section className="dance-container dance-section"><div className="dance-bottom-cta"><div><p className="dance-eyebrow">EL PRIMER PASO ES TUYO</p><h2>Lo que te mueve,<br /><em>merece un escenario.</em></h2></div><Link className="dance-btn" href={`${base}/registro`}>Crear mi registro ↗</Link></div></section></>;
}
