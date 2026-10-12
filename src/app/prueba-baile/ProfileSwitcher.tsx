"use client";
import { useEffect, useRef, useState } from "react";
import type { User } from "@/lib/baile/types";
import { Field, Form, type Run } from "./ui";

type Profile = Pick<User, "id" | "name" | "role">;
const labels = { superadmin: "Superadministrador", contractor: "Contratista del evento", participant: "Participante", judge: "Jurado" };
const initials = (name: string) => name.trim().split(/\s+/).slice(0, 2).map(word => word[0]).join("").toUpperCase();

export function ProfileSwitcher({ currentId, run, onCancel }: { currentId: string; run: Run; onCancel: () => void }) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selected, setSelected] = useState<Profile | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [busy, setBusy] = useState(false);
  const title = useRef<HTMLHeadingElement>(null);
  useEffect(() => { title.current?.focus(); }, [selected]);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError("");
    fetch("/api/baile/profiles", { cache: "no-store", signal: controller.signal }).then(async res => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudieron cargar los perfiles.");
      setProfiles(data.profiles);
    }).catch(e => { if (!controller.signal.aborted) setError(e.message || "Revisa tu conexión."); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [retry]);
  const submit: Run = async (action, data) => {
    setBusy(true);
    try { return await run(action, data); } finally { setBusy(false); }
  };
  const visible = profiles.filter(p => `${p.name} ${labels[p.role]}`.toLocaleLowerCase("es").includes(query.toLocaleLowerCase("es")));
  return <section className="dance-profiles dance-container">
    <p className="dance-eyebrow">UN EVENTO. DISTINTOS ESPACIOS.</p>
    <h1 ref={title} tabIndex={-1}>{selected ? `Hola, ${selected.name}` : "¿Quién va a entrar?"}</h1>
    <p className="dance-muted">{selected ? "Escribe la contraseña de este perfil. No necesitas ingresar el correo." : "Elige un perfil para continuar. Cada persona conserva su propio panel y sus permisos."}</p>
    {selected ? <div className="dance-profile-login dance-panel">
      <div className={`dance-profile-avatar ${selected.role}`} aria-hidden="true">{initials(selected.name)}</div>
      <p className="dance-eyebrow">{labels[selected.role]}</p>
      <Form action="switch-profile" run={submit} label="Entrar a este perfil">
        <input type="hidden" name="profileId" value={selected.id} />
        <Field label="Contraseña" name="password" type="password" autoComplete="current-password" maxLength={160} />
      </Form>
      <button className="dance-btn secondary small" disabled={busy} onClick={() => setSelected(null)}>Elegir otro perfil</button>
    </div> : <>
      {loading ? <p role="status">Cargando perfiles…</p> : error ? <div role="alert"><p>{error}</p><button className="dance-btn secondary small" onClick={() => setRetry(n => n + 1)}>Reintentar</button></div> : <>
        {profiles.length > 6 && <label className="dance-field dance-profile-search"><span>Buscar perfil</span><input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Nombre o rol" /></label>}
        <div className="dance-profile-grid">{visible.map(p => <button className="dance-profile-card" key={p.id} onClick={() => setSelected(p)} aria-label={`Entrar como ${p.name}, ${labels[p.role]}`}>
          <span className={`dance-profile-avatar ${p.role}`} aria-hidden="true">{initials(p.name)}<span className="dance-profile-lock">↗</span></span>
          <strong>{p.name}</strong><span>{labels[p.role]}</span><small>{p.id === currentId ? "Tu sesión actual" : "Acceso con contraseña"}</small>
        </button>)}</div>
        {!visible.length && <p>No hay perfiles con ese nombre.</p>}
      </>}
    </>}
    <p className="dance-muted">Sin cuenta: <a className="dance-text-link" href="/prueba-baile/resultados">ver información y resultados públicos</a></p>
    <div className="dance-profile-controls"><button className="dance-btn secondary small" disabled={busy} onClick={onCancel}>Volver a mi panel</button><button className="dance-btn secondary small" disabled={busy} onClick={() => submit("logout", new FormData())}>Cerrar sesión por completo</button></div>
    <p className="dance-profile-hint">Selector temporal de pruebas. Tu sesión solo cambia al confirmar una contraseña válida.</p>
  </section>;
}
