"use client";
import { useEffect, useRef, useState } from "react";
import "./judge-avatar.css";

export function JudgePhotoInput({ name = "photo", label = "Foto del jurado", file, onChange }: { name?: string; label?: string; file?: File | null; onChange?: (file: File | null) => void }) {
  const [selected, setSelected] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const current = file === undefined ? selected : file;
  useEffect(() => {
    if (!current) { setPreview(""); return; }
    const url = URL.createObjectURL(current); setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [current]);
  function choose(value: File | null) {
    if (value && (!['image/jpeg', 'image/png', 'image/webp'].includes(value.type) || value.size > 5 * 1024 ** 2 || !value.size)) {
      setError("Elige una foto JPG, PNG o WebP de máximo 5 MB.");
      if (input.current) input.current.value = "";
      setSelected(null); onChange?.(null); return;
    }
    setError(""); setSelected(value); onChange?.(value);
  }
  return <div className="judge-photo-input">
    <label className="dance-field"><span>{label} (opcional)</span><input ref={input} type="file" name={name} accept="image/jpeg,image/png,image/webp" onChange={e => choose(e.target.files?.[0] || null)} /></label>
    {error && <p role="alert" className="dance-notice error">{error}</p>}
    {preview && <div className="judge-name-photo"><span className="judge-avatar judge-avatar-large"><img src={preview} alt="Vista previa de la foto del jurado" /></span><span>{current?.name}<br /><button className="dance-text-link" type="button" onClick={() => { if (input.current) input.current.value = ""; choose(null); }}>Quitar selección</button></span></div>}
    <p className="dance-muted">Puedes añadirla o cambiarla después en el panel del jurado, en «Cambiar foto del jurado». Se mostrará en su perfil y en los resultados. Utiliza una foto autorizada. JPG, PNG o WebP, máximo 5 MB.</p>
  </div>;
}
