import { NextRequest, NextResponse } from "next/server";
import { randomUUID, randomBytes } from "node:crypto";
import { db, readState, transaction, hashPassword, verifyPassword, createSession, sessionUser, tokenHash, rateLimit } from "@/lib/baile/store";
import { DanceError, ensure, scope, enroll, review, recordPayment, saveScore, audit, eligible, validDate } from "@/lib/baile/domain";
import type { User, State, Status, Category, StageStatus } from "@/lib/baile/types";
import { accredit, revokeAccreditation, saveSchedule } from "@/lib/baile/operations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const COOKIE = "baile_session";
const cookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/", maxAge: 86400 };
const json = (value: unknown, status = 200) => NextResponse.json(value, { status, headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } });
type Context = { params: Promise<{ path: string[] }> };
function text(f: FormData, key: string, max = 200, required = true) {
  const value = f.get(key);
  ensure(typeof value === "string" && value.length <= max && (!required || value.trim()), `Revisa el campo ${key}.`);
  return value.trim();
}
function actor(req: NextRequest) { const u = sessionUser(req.cookies.get(COOKIE)?.value); ensure(u, "Inicia sesión para continuar.", 401); return u; }
function admin(user: User) { ensure(user.role === "admin", "Acceso reservado a organización.", 403); }
function email(f: FormData) { const v = text(f, "email").toLowerCase(); ensure(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "Revisa el correo electrónico."); return v; }
function numeric(f: FormData, key: string, min = 0, max = 100000000) { const n = Number(text(f, key)); ensure(Number.isFinite(n) && n >= min && n <= max, `Revisa el valor de ${key}.`); return n; }
function errorResponse(error: unknown) {
  if (error instanceof DanceError) return json({ error: error.message }, error.status);
  console.error("[baile]", error instanceof Error ? error.message : "Error interno");
  return json({ error: "No se pudo completar la operación. Intenta de nuevo." }, 500);
}
type Upload = { id: string; name: string; mime: string; buffer: Buffer; kind: string };
async function upload(f: FormData, kind: "receipt" | "music"): Promise<Upload> {
  const file = f.get("file");
  ensure(file instanceof File && file.size > 0, "Selecciona un archivo.");
  ensure(file.size <= (kind === "music" ? 20 : 5) * 1024 * 1024, kind === "music" ? "La pista debe pesar máximo 20 MB." : "El comprobante debe pesar máximo 5 MB.");
  const buffer = Buffer.from(await file.arrayBuffer());
  const ascii = (start: number, end: number) => buffer.subarray(start, end).toString("ascii");
  let mime = "";
  if (kind === "receipt") {
    if (ascii(0, 5) === "%PDF-") mime = "application/pdf";
    else if (buffer.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) mime = "image/png";
    else if (buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255) mime = "image/jpeg";
    else if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") mime = "image/webp";
  } else {
    if (ascii(0, 3) === "ID3" || (buffer[0] === 255 && (buffer[1] & 224) === 224)) mime = "audio/mpeg";
    else if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WAVE") mime = "audio/wav";
    else if (ascii(0, 4) === "OggS") mime = "audio/ogg";
    else if (ascii(4, 8) === "ftyp" && /M4A|isom|mp42/.test(ascii(8, 28))) mime = "audio/mp4";
  }
  ensure(mime, kind === "music" ? "Usa un audio MP3, WAV, OGG o M4A válido." : "Usa un comprobante PDF, JPG, PNG o WebP válido.");
  return { id: randomUUID(), name: file.name.replace(/[^\p{L}\p{N}._ -]/gu, "_").slice(0, 120), mime, buffer, kind };
}
function putFile(file: Upload, owner: string) {
  const size = Number(db().prepare("SELECT COALESCE(SUM(length(content)),0) AS size FROM files").get()!.size);
  ensure(size + file.buffer.length <= 5 * 1024 ** 3, "El almacenamiento del evento está lleno. Contacta a la organización.", 507);
  db().prepare("INSERT INTO files VALUES (?,?,?,?,?,?)").run(file.id, owner, file.kind, file.name, file.mime, file.buffer);
}
export async function GET(req: NextRequest, ctx: Context) {
  try {
    const parts = (await ctx.params).path;
    if (parts[0] === "snapshot" || parts[0] === "public") return json(scope(readState(), sessionUser(req.cookies.get(COOKIE)?.value)));
    if (parts[0] === "music-export") {
      admin(actor(req));
      const state = readState(); const categoryId = req.nextUrl.searchParams.get("category") || "";
      const entries = state.enrollments.filter(e => e.musicId && eligible(state, e) && (!categoryId || e.categoryId === categoryId));
      ensure(entries.length, "No hay pistas de competidores habilitados en esta selección.", 404);
      const bytes = entries.reduce((n, e) => n + Number(db().prepare("SELECT length(content) AS size FROM files WHERE id=?").get(e.musicId!)?.size || 0), 0);
      ensure(bytes <= 100 * 1024 * 1024, "La descarga supera 100 MB. Selecciona una categoría más pequeña.", 413);
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      const safeName = (name: string) => name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 100);
      for (const e of entries) {
        const file = db().prepare("SELECT name,content FROM files WHERE id=?").get(e.musicId!);
        ensure(file, "Una pista no está disponible. Revisa la inscripción antes de exportar.", 409);
        zip.file(`${safeName(state.categories.find(c => c.id === e.categoryId)!.name)}/${String(e.competitionNumber).padStart(3, "0")}-${e.code}-${safeName(String(file.name))}`, Buffer.from(file.content as Uint8Array));
      }
      const output = await zip.generateAsync({ type: "uint8array", compression: "STORE" });
      return new NextResponse(output, { headers: { "Content-Type": "application/zip", "Content-Disposition": 'attachment; filename="pistas-competencia.zip"', "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } });
    }
    if (parts[0] === "files" && parts[1]) {
      const user = actor(req);
      const file = db().prepare("SELECT * FROM files WHERE id=?").get(parts[1]);
      ensure(file, "Archivo no encontrado.", 404);
      ensure(user.role === "admin" || (user.role === "participant" && file.owner === user.id), "No tienes acceso a este archivo.", 403);
      const data = Buffer.from(file.content as Uint8Array);
      const headers: Record<string, string> = { "Content-Type": file.mime as string, "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff", "Content-Security-Policy": "sandbox", "Accept-Ranges": "bytes", "Content-Disposition": `${req.nextUrl.searchParams.has("download") || file.kind === "receipt" ? "attachment" : "inline"}; filename*=UTF-8''${encodeURIComponent(file.name as string)}` };
      const range = req.headers.get("range");
      if (range) {
        const match = /^bytes=(\d+)-(\d*)$/.exec(range);
        ensure(match, "Rango no válido.", 416);
        const start = Number(match[1]); const end = match[2] ? Math.min(Number(match[2]), data.length - 1) : data.length - 1;
        ensure(start <= end && start < data.length, "Rango no válido.", 416);
        return new NextResponse(new Uint8Array(data.subarray(start, end + 1)), { status: 206, headers: { ...headers, "Content-Range": `bytes ${start}-${end}/${data.length}`, "Content-Length": String(end - start + 1) } });
      }
      return new NextResponse(new Uint8Array(data), { headers: { ...headers, "Content-Length": String(data.length) } });
    }
    return json({ error: "Ruta no encontrada." }, 404);
  } catch (error) { return errorResponse(error); }
}
export async function POST(req: NextRequest, ctx: Context) {
  try {
    const origin = req.headers.get("origin");
    ensure(origin && new URL(origin).host === req.headers.get("host"), "Origen de solicitud inválido.", 403);
    ensure(Number(req.headers.get("content-length") || 0) <= 22 * 1024 * 1024, "Archivo demasiado grande.", 413);
    const action = (await ctx.params).path[0];
    const f = await req.formData();
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    if (action === "login") {
      const address = email(f);
      rateLimit(`login-ip:${ip}`, 80); rateLimit(`login:${address}`);
      const user = readState().users.find(u => u.email === address);
      const fallback = "00000000000000000000000000000000:" + "0".repeat(128);
      const valid = await verifyPassword(text(f, "password", 160), user?.passwordHash || fallback);
      ensure(user && valid, "Correo o contraseña incorrectos.", 401);
      const res = json({ role: user.role }); res.cookies.set(COOKIE, createSession(user.id), cookieOptions); return res;
    }
    if (action === "register") {
      rateLimit(`register:${ip}`, 12);
      const address = email(f); const name = text(f, "name"); const document = text(f, "document", 30).toUpperCase().replace(/[\s.-]/g, "");
      ensure(/^[A-Z0-9]{5,30}$/.test(document), "Revisa el número de documento.");
      const birthDate = text(f, "birthDate", 10);
      ensure(validDate(birthDate) && birthDate > "1900-01-01" && birthDate <= new Date().toLocaleDateString("en-CA", { timeZone: "America/Bogota" }), "Revisa tu fecha de nacimiento.");
      const phone = text(f, "phone", 30); ensure(/^[+\d ()-]{7,30}$/.test(phone), "Revisa el teléfono.");
      const city = text(f, "city"); const academy = text(f, "academy", 200, false); const extra = text(f, "extra", 2000, false);
      ensure(f.get("consent") === "on", "Debes autorizar el uso de los datos para tu inscripción.");
      const passwordHash = await hashPassword(text(f, "password", 160)); const id = randomUUID();
      const participant = transaction(s => {
        ensure(s.settings.registrationOpen, "Las inscripciones están cerradas.");
        ensure(!s.users.some(u => u.email === address) && !s.participants.some(p => p.document === document), "Ya existe un registro con ese correo o documento. Ingresa con tu cuenta.", 409);
        const p = { id, code: `PAR-${String(s.participants.length + 1).padStart(4, "0")}`, name, document, birthDate, city, phone, email: address, academy, extra, createdAt: new Date().toISOString(), fullPassFee: s.settings.fullPassFee };
        s.users.push({ id, name, email: address, passwordHash, role: "participant", categories: [] }); s.participants.push(p); audit(s, id, "Registro creado", id); return p;
      });
      const res = json({ role: "participant", code: participant.code }, 201); res.cookies.set(COOKIE, createSession(id), cookieOptions); return res;
    }
    const user = actor(req); rateLimit(`mutation:${user.id}`, 240);
    if (action === "logout") {
      db().prepare("DELETE FROM sessions WHERE token=?").run(tokenHash(req.cookies.get(COOKIE)!.value));
      const res = json({ ok: true }); res.cookies.set(COOKIE, "", { ...cookieOptions, maxAge: 0 }); return res;
    }
    if (action === "enroll") {
      const category = text(f, "categoryId"); const team = text(f, "team", 120, false); const members = text(f, "members", 2000, false);
      return json(transaction(s => enroll(s, user, category, team, members)), 201);
    }
    if (action === "payment") {
      ensure(user.role === "participant", "Acceso reservado a participantes.", 403);
      const file = await upload(f, "receipt"); const enrollmentId = text(f, "enrollmentId", 80, false) || null;
      const amount = numeric(f, "amount", 1); const date = text(f, "date", 10);
      transaction(s => { recordPayment(s, user, enrollmentId, amount, date, file.id); putFile(file, user.id); });
      return json({ ok: true });
    }
    if (action === "music") {
      ensure(user.role === "participant", "Acceso reservado a participantes.", 403);
      const file = await upload(f, "music"); const id = text(f, "enrollmentId");
      transaction(s => {
        const e = s.enrollments.find(e => e.id === id && e.participantId === user.id); ensure(e, "Inscripción no encontrada.", 404);
        const c = s.categories.find(c => c.id === e.categoryId)!;
        ensure(eligible(s, e), "Primero debe aprobarse el pago de la categoría.");
        ensure(!s.schedule.some(x => x.categoryId === e.categoryId && ["live", "finished"].includes(x.status)), "La competencia ya comenzó y la pista está bloqueada.", 409);
        ensure(!c.deadline || Date.now() <= Date.parse(c.deadline), "El plazo para reemplazar la pista ya terminó.");
        ensure(!s.scores.some(x => x.enrollmentId === e.id), "La competencia ya fue calificada y la pista está bloqueada.");
        putFile(file, user.id); e.musicId = file.id; e.musicName = file.name; e.musicUpdatedAt = new Date().toISOString(); audit(s, user.id, "Pista actualizada", e.id);
      }); return json({ ok: true });
    }
    if (action === "score") {
      let values: number[]; try { values = JSON.parse(text(f, "values", 400)); } catch { throw new DanceError("Notas inválidas."); }
      ensure(Array.isArray(values), "Notas inválidas.");
      transaction(s => saveScore(s, user, text(f, "enrollmentId"), values)); return json({ ok: true });
    }
    admin(user);
    if (action === "accredit") {
      transaction(s => accredit(s, user, text(f, "participantId"), text(f, "code", 32))); return json({ ok: true });
    }
    if (action === "revoke-accreditation") {
      transaction(s => revokeAccreditation(s, user, text(f, "id"), text(f, "reason", 500))); return json({ ok: true });
    }
    if (action === "participant-note") {
      const participantId = text(f, "participantId"), note = text(f, "note", 1500, false);
      transaction(s => {
        ensure(s.participants.some(p => p.id === participantId), "Participante no encontrado.", 404);
        const old = s.notes.find(n => n.participantId === participantId);
        const value = { participantId, text: note, by: user.id, at: new Date().toISOString() };
        if (old) Object.assign(old, value); else s.notes.push(value);
        audit(s, user.id, "Observación interna actualizada", participantId);
      }); return json({ ok: true });
    }
    if (action === "schedule") {
      const startAt = text(f, "startAt", 40); ensure(Number.isFinite(Date.parse(startAt)), "Fecha de programación inválida.");
      transaction(s => saveSchedule(s, user, { id: text(f, "id", 100, false) || randomUUID(), categoryId: text(f, "categoryId"), startAt: new Date(startAt).toISOString(), duration: numeric(f, "duration", 1, 240), stage: text(f, "stage", 80), status: text(f, "status", 20) as StageStatus, note: text(f, "note", 1000, false) }));
      return json({ ok: true });
    }
    if (action === "review") {
      transaction(s => review(s, user, text(f, "paymentId"), text(f, "status") as Status, text(f, "note", 1000, false))); return json({ ok: true });
    }
    if (action === "settings") {
      const name = text(f, "name", 100); const tagline = text(f, "tagline", 200); const fullPassFee = numeric(f, "fullPassFee", 1); const paymentInstructions = text(f, "paymentInstructions", 3000);
      const formula = text(f, "formula"); ensure(formula === "average" || formula === "sum", "Fórmula inválida.");
      transaction(s => { ensure(formula === s.settings.formula || !s.schedule.some(x => x.status === "finished"), "No cambies la fórmula cuando hay resultados definitivos.", 409); s.settings = { ...s.settings, name, tagline, fullPassFee, paymentInstructions, formula, registrationOpen: f.get("registrationOpen") === "on", categoryRegistrationOpen: f.get("categoryRegistrationOpen") === "on" }; audit(s, user.id, "Configuración actualizada", "evento"); }); return json({ ok: true });
    }
    if (action === "category") {
      const id = text(f, "id", 100, false) || randomUUID(); const deadline = text(f, "deadline", 100, false);
      ensure(!deadline || Number.isFinite(Date.parse(deadline)), "Fecha límite inválida.");
      const c: Category = { id, name: text(f, "name", 120), rhythm: text(f, "rhythm", 80), modality: text(f, "modality", 30), division: text(f, "division", 80), fee: numeric(f, "fee", 1), active: f.get("active") === "on", deadline: deadline ? new Date(deadline).toISOString() : "" };
      ensure(["Solista", "Pareja", "Grupo"].includes(c.modality), "Modalidad inválida.");
      transaction(s => { ensure(!c.active || !s.schedule.some(x => x.categoryId === id && x.status === "finished"), "La categoría ya finalizó. Crea otra categoría para una nueva competencia.", 409); const old = s.categories.find(x => x.id === id); if (old) { ensure(!s.enrollments.some(e => e.categoryId === id) || (old.modality === c.modality && old.rhythm === c.rhythm && old.division === c.division), "No cambies modalidad, ritmo o división de una categoría con inscritos."); Object.assign(old, c); } else s.categories.push(c); audit(s, user.id, "Categoría actualizada", id); }); return json({ ok: true });
    }
    if (action === "judge") {
      const id = text(f, "id", 100, false); const categories = f.getAll("categories").map(String);
      const name = text(f, "name", 120); const address = email(f); const password = text(f, "password", 160, false);
      const passwordHash = password ? await hashPassword(password) : null;
      transaction(s => {
        ensure(categories.length > 0 && categories.every(c => s.categories.some(x => x.id === c)), "Asigna al menos una categoría válida.");
        const old = s.users.find(x => x.id === id && x.role === "judge");
        ensure(!s.schedule.some(x => ["live", "finished"].includes(x.status) && categories.includes(x.categoryId) !== Boolean(old?.categories.includes(x.categoryId))), "No cambies los jurados de una competencia iniciada o finalizada.", 409);
        ensure(!s.users.some(x => x.email === address && x.id !== old?.id), "Ese correo ya está en uso.", 409);
        if (old) {
          ensure(!s.scores.some(x => x.judgeId === old.id && !categories.includes(s.enrollments.find(e => e.id === x.enrollmentId)!.categoryId)), "Este jurado ya calificó una categoría que intentas quitar.");
          Object.assign(old, { name, email: address, categories, ...(passwordHash ? { passwordHash } : {}) });
          if (passwordHash) db().prepare("DELETE FROM sessions WHERE userId=?").run(old.id);
        } else { ensure(passwordHash, "Define una contraseña para el nuevo jurado."); s.users.push({ id: randomUUID(), name, email: address, categories, passwordHash, role: "judge" }); }
        audit(s, user.id, "Acceso de jurado actualizado", address);
      }); return json({ ok: true });
    }
    if (action === "unlock") {
      const id = text(f, "scoreId"); const note = text(f, "note", 500);
      transaction(s => { const score = s.scores.find(x => x.id === id); ensure(score, "Calificación no encontrada.", 404); const entry = s.enrollments.find(e => e.id === score.enrollmentId)!; ensure(!s.schedule.some(x => x.categoryId === entry.categoryId && x.status === "finished"), "No se pueden reabrir notas de una categoría finalizada.", 409); score.locked = false; audit(s, user.id, `Edición autorizada: ${note}`, id); }); return json({ ok: true });
    }
    if (action === "reset-password") {
      const id = text(f, "userId"); const passwordHash = await hashPassword(text(f, "password", 160));
      transaction(s => { const target = s.users.find(x => x.id === id); ensure(target, "Cuenta no encontrada.", 404); target.passwordHash = passwordHash; db().prepare("DELETE FROM sessions WHERE userId=?").run(id); audit(s, user.id, "Contraseña restablecida", id); }); return json({ ok: true });
    }
    if (action === "example") {
      const access = await Promise.all(["Valentina Demo", "Mateo Demo", "Jurado 1 Demo", "Jurado 2 Demo", "Jurado 3 Demo"].map(async (name, i) => {
        const password = randomBytes(10).toString("base64url"); return { name, email: `ejemplo${i + 1}@ritmocaribe.test`, password, passwordHash: await hashPassword(password), id: randomUUID() };
      }));
      transaction(s => {
        ensure(s.settings.demo && !s.audit.some(x => x.action === "Ejemplo creado"), "El recorrido de ejemplo ya fue creado.", 409);
        ensure(!s.users.some(u => access.some(a => a.email === u.email)), "Ya existen correos reservados para los ejemplos. Usa cuentas nuevas desde administración.", 409);
        const category = s.categories.find(c => c.active); ensure(category, "Crea una categoría primero.");
        access.forEach((a, i) => {
          const u: User = { id: a.id, name: a.name, email: a.email, passwordHash: a.passwordHash, role: i < 2 ? "participant" : "judge", categories: i < 2 ? [] : s.categories.map(c => c.id) }; s.users.push(u);
          if (i < 2) {
            s.participants.push({ id: a.id, name: a.name, email: a.email, code: `PAR-${String(s.participants.length + 1).padStart(4, "0")}`, document: `DEMO${i + 1}`, birthDate: "2000-01-01", city: i === 0 ? "Santa Marta" : "Barranquilla", phone: "0000000000", academy: "Academia de ejemplo", extra: "Registro ficticio para demostración", createdAt: new Date().toISOString() });
            const fileId = randomUUID();
            const buffer = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aWQAAAABJRU5ErkJggg==", "base64");
            putFile({ id: fileId, name: "comprobante-ejemplo.png", kind: "receipt", mime: "image/png", buffer }, u.id);
            const date = new Date().toLocaleDateString("en-CA", { timeZone: "America/Bogota" });
            const payment = recordPayment(s, u, null, s.settings.fullPassFee, date, fileId);
            if (i === 0) { review(s, user, payment.id, "approved", "Ejemplo aprobado"); const e = enroll(s, u, category.id, "Equipo ejemplo", "Participante de ejemplo"); const cp = recordPayment(s, u, e.id, e.fee, date, fileId); review(s, user, cp.id, "approved", "Ejemplo aprobado"); }
          }
        });
        audit(s, user.id, "Ejemplo creado", "demo");
      });
      return json({ access: access.map(({ passwordHash: _ignored, id: _id, ...a }) => a) });
    }
    return json({ error: "Operación no encontrada." }, 404);
  } catch (error) { return errorResponse(error); }
}
