"use client";
import { useDanceScope } from "./DanceScope";
import { useEffect, useRef, useState } from "react";
import type { User } from "@/lib/baile/types";
import type { Run } from "./ui";

import { JudgeAvatar } from "./JudgeAvatar";
type Profile = Pick<User, "id" | "name" | "role" | "photoId"> & { demo?: boolean };
const labels = { superadmin: "Superadministrador", contractor: "Contratista del evento", participant: "Participante", judge: "Jurado" };
const initials = (name: string) => name.trim().split(/\s+/).slice(0, 2).map(word => word[0]).join("").toUpperCase();

export function ProfileSwitcher({ currentId, run, onCancel }: { currentId: string; run: Run; onCancel: () => void }) {
  const { base, apiBase } = useDanceScope();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const title = useRef<HTMLHeadingElement>(null);
  useEffect(() => { title.current?.focus(); }, []);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError("");
    fetch(`${apiBase}/profiles`, { cache: "no-store", signal: controller.signal }).then(async res => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudieron cargar los perfiles.");
      setProfiles(data.profiles);
    }).catch(e => { if (!controller.signal.aborted) setError(e.message || "Revisa tu conexión."); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [retry, apiBase]);
  const submit: Run = async (action, data) => {
    if (pending.current) return null;
    pending.current = true;
    setBusy(true);
    try { return await run(action, data); } finally { pending.current = false; setBusy(false); }
  };
  const enter = (profile: Profile) => {
    const data = new FormData(); data.set("profileId", profile.id);
    void submit("switch-profile", data);
  };
  const visible = profiles.filter(p => `${p.name} ${labels[p.role]}`.toLocaleLowerCase("es").includes(query.toLocaleLowerCase("es")));
  return <section className="dance-profiles dance-container">
    <p className="dance-eyebrow">UN EVENTO. DISTINTOS ESPACIOS.</p>
    <h1 ref={title} tabIndex={-1}>¿Quién va a entrar?</h1>
    <p className="dance-muted">Elige un perfil y entra directamente, sin clave durante las pruebas. Cada perfil conserva su panel y sus permisos.</p>
    {busy && <p role="status">Entrando al perfil…</p>}
      {loading ? <p role="status">Cargando perfiles…</p> : error ? <div role="alert"><p>{error}</p><button className="dance-btn secondary small" onClick={() => setRetry(n => n + 1)}>Reintentar</button></div> : <>
        {profiles.length > 6 && <label className="dance-field dance-profile-search"><span>Buscar perfil</span><input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Nombre o rol" /></label>}
        <div className="dance-profile-grid" aria-busy={busy}>{visible.map(p => <button className="dance-profile-card" key={p.id} disabled={busy} onClick={() => enter(p)} aria-label={`Entrar como ${p.name}, ${labels[p.role]}`}>
          {p.role === "judge" ? <JudgeAvatar name={p.name} photoId={p.photoId} demo={p.demo} size="profile" /> : <span className={`dance-profile-avatar ${p.role}`} aria-hidden="true">{initials(p.name)}<span className="dance-profile-lock">↗</span></span>}
          <strong>{p.name}</strong><span>{labels[p.role]}</span><small>{p.id === currentId ? "Tu sesión actual" : "Entrar con un clic"}</small>
        </button>)}</div>
        {!visible.length && <p>No hay perfiles con ese nombre.</p>}
      </>}
    <p className="dance-muted">Sin cuenta: <a className="dance-text-link" href={`${base}/resultados`}>ver información y resultados públicos</a></p>
    <div className="dance-profile-controls"><button className="dance-btn secondary small" disabled={busy} onClick={onCancel}>Volver a mi panel</button><button className="dance-btn secondary small" disabled={busy} onClick={() => submit("logout", new FormData())}>Cerrar sesión por completo</button></div>
    <p className="dance-profile-hint">Acceso rápido temporal para pruebas. Si cierras sesión por completo, necesitarás tu clave para volver a ingresar.</p>
  </section>;
}
