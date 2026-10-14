import { passPlans, passAvailable, type PassPlan } from "@/lib/baile/pricing";
import { parsePaymentMethod } from "@/lib/baile/payment-method";
import { scoringConfiguration } from "@/lib/baile/scoring-config";
import { parseCategoryWorkbook, categoryIdentity } from "@/lib/baile/category-excel";
import { protectedJudgeCategories } from "@/lib/baile/types";
import { withEvent, sessionCookieName } from "@/lib/baile/event-scope";
import { findRegisteredEvent as findEvent, listEvents, insertEvent, eventCover, archiveDemoEvents } from "@/lib/baile/event-registry";
import { prepareEvent } from "@/lib/baile/create-event";
import { eventHref } from "@/lib/baile/event-catalog";
import { DOCUMENT_TYPES, LEVELS, WAIVER_VERSION, colombiaDate, isMinor, validSignature, waiverText, type Registration } from "@/lib/baile/registration";
import { NextRequest, NextResponse } from "next/server";
import { randomUUID, randomBytes } from "node:crypto";
import { db, readState, transaction, hashPassword, verifyPassword, createSession, sessionUser, tokenHash, rateLimit, globalAdminFor } from "@/lib/baile/store";
import { DanceError, ensure, scope, enroll, review, recordPayment, saveScore, audit, eligible, validDate } from "@/lib/baile/domain";
import { publicResults } from "@/lib/baile/results";
import { judgeDeletionBlock } from "@/lib/baile/judge-policy";
import { editableEnrollment, editEnrollment, moveEnrollment } from "@/lib/baile/enrollment-admin";
import type { User, State, Status, Category, StageStatus } from "@/lib/baile/types";
import { accredit, revokeAccreditation, saveSchedule } from "@/lib/baile/operations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const cookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/", maxAge: 86400 };
const json = (value: unknown, status = 200) => NextResponse.json(value, { status, headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } });
type Context = { params: Promise<{ path: string[] }> };
function text(f: FormData, key: string, max = 200, required = true) {
  const value = f.get(key);
  ensure(typeof value === "string" && value.length <= max && (!required || value.trim()), `Revisa el campo ${key}.`);
  return value.trim();
}
function actor(req: NextRequest) { const u = sessionUser(req.cookies.get(sessionCookieName())?.value); ensure(u, "Inicia sesión para continuar.", 401); return u; }
function admin(user: User) { ensure(user.role === "superadmin", "Acceso reservado a organización.", 403); }
function email(f: FormData) { const v = text(f, "email").toLowerCase(); ensure(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "Revisa el correo electrónico."); return v; }
function numeric(f: FormData, key: string, min = 0, max = 100000000) { const n = Number(text(f, key)); ensure(Number.isFinite(n) && n >= min && n <= max, `Revisa el valor de ${key}.`); return n; }
function errorResponse(error: unknown) {
  if (error instanceof DanceError) return json({ error: error.message }, error.status);
  console.error("[baile]", error instanceof Error ? error.message : "Error interno");
  return json({ error: "No se pudo completar la operación. Intenta de nuevo." }, 500);
}
type Upload = { id: string; name: string; mime: string; buffer: Buffer; kind: string };
async function upload(f: FormData, kind: "receipt" | "music" | "photo", key = "file"): Promise<Upload> {
  const file = f.get(key);
  ensure(file instanceof File && file.size > 0, "Selecciona un archivo.");
  ensure(file.size <= (kind === "music" ? 20 : 5) * 1024 * 1024, kind === "music" ? "La pista debe pesar máximo 20 MB." : "El comprobante debe pesar máximo 5 MB.");
  const buffer = Buffer.from(await file.arrayBuffer());
  const ascii = (start: number, end: number) => buffer.subarray(start, end).toString("ascii");
  let mime = "";
  if (kind !== "music") {
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
  ensure(kind !== "photo" || ["image/png", "image/jpeg"].includes(mime), "La foto debe ser JPG o PNG.");
  return { id: randomUUID(), name: file.name.replace(/[^\p{L}\p{N}._ -]/gu, "_").slice(0, 120), mime, buffer, kind };
}
function putFile(file: Upload, owner: string) {
  const size = Number(db().prepare("SELECT COALESCE(SUM(length(content)),0) AS size FROM files").get()!.size);
  ensure(size + file.buffer.length <= 5 * 1024 ** 3, "El almacenamiento del evento está lleno. Contacta a la organización.", 507);
  db().prepare("INSERT INTO files VALUES (?,?,?,?,?,?)").run(file.id, owner, file.kind, file.name, file.mime, file.buffer);
}
async function handleGET(req: NextRequest, ctx: Context) {
  try {
    const parts = (await ctx.params).path;
    if (parts[0] === "snapshot" || parts[0] === "public") {
      const data = scope(readState(), sessionUser(req.cookies.get(sessionCookieName())?.value));
      const demo = withEvent(undefined, () => readState().settings.demo);
      return json({ ...data, events: listEvents().filter(e => demo || !e.demo) });
    }
    if (parts[0] === "event-cover" && parts[1]) {
      const event = findEvent(parts[1]);
      ensure(event && (!event.demo || withEvent(undefined, () => readState().settings.demo)), "Evento no encontrado.", 404);
      const cover = eventCover(event.id);
      ensure(cover, "Portada no encontrada.", 404);
      return new NextResponse(new Uint8Array(cover.cover as Uint8Array), { headers: { "Content-Type": String(cover.mime), "Cache-Control": "public, max-age=3600", "X-Content-Type-Options": "nosniff" } });
    }
    if (parts[0] === "results") return json(publicResults(readState()));
    if (parts[0] === "users") {
      admin(actor(req));
      return json({ users: readState().users.map(({ id, name, username, email, role, demoOnly, disabledAt }) => ({ id, name, username, email, role, demoOnly: !!demoOnly, disabledAt })) });
    }
    if (parts[0] === "profiles") {
      actor(req);
      const state = readState();
      ensure(state.settings.demo, "El selector solo está disponible durante las pruebas.", 403);
      return json({ profiles: state.users.filter(u => !u.disabledAt).map(({ id, name, role }) => ({ id, name, role })).sort((a, b) => a.name.localeCompare(b.name, "es")) });
    }
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
      const contractorFile = user.role === "contractor" && (file.kind === "receipt" || file.kind === "photo" || (file.kind === "music" && readState().enrollments.some(e => e.musicId === file.id && e.participantId === file.owner)));
      ensure(user.role === "superadmin" || contractorFile || (user.role === "participant" && file.owner === user.id), "No tienes acceso a este archivo.", 403);
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
async function handlePOST(req: NextRequest, ctx: Context) {
  try {
    const origin = req.headers.get("origin");
    ensure(origin && new URL(origin).host === req.headers.get("host"), "Origen de solicitud inválido.", 403);
    ensure(Number(req.headers.get("content-length") || 0) <= 22 * 1024 * 1024, "Archivo demasiado grande.", 413);
    const action = (await ctx.params).path[0];
    const f = await req.formData();
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    if (action === "switch-profile") {
      const previous = actor(req); const state = readState();
      ensure(state.settings.demo, "El selector solo está disponible durante las pruebas.", 403);
      const profileId = text(f, "profileId", 80);
      const target = state.users.find(u => !u.disabledAt && u.id === profileId);
      rateLimit(`switch-profile:${previous.id}`, 240); rateLimit(`switch-profile-ip:${ip}`, 480);
      ensure(target, "Este perfil ya no está disponible.", 401);
      const token = transaction(s => {
        ensure(s.settings.demo, "El selector solo está disponible durante las pruebas.", 403);
        const current = actor(req); const selected = s.users.find(u => !u.disabledAt && u.id === target.id);
        ensure(current.id === previous.id && selected?.passwordHash === target.passwordHash, "La cuenta cambió. Vuelve a intentarlo.", 401);
        const token = createSession(target.id);
        db().prepare("DELETE FROM sessions WHERE token=?").run(tokenHash(req.cookies.get(sessionCookieName())!.value));
        audit(s, previous.id, "Cambio de perfil de prueba", target.id);
        return token;
      });
      const res = json({ role: target.role }); res.cookies.set(sessionCookieName(), token, cookieOptions); return res;
    }
    if (action === "login") {
      const address = text(f, "email").toLowerCase();
      const state = readState();
      const globalAdmin = globalAdminFor(address);
      const user = globalAdmin || state.users.find(u => !u.disabledAt && (!u.demoOnly || state.settings.demo) && (u.email === address || u.username?.toLowerCase() === address || (u.role === "participant" && state.participants.some(p => p.id === u.id && p.document === address.toUpperCase().replace(/[\s.-]/g, "")))));
      rateLimit(`login-ip:${ip}`, 80); rateLimit(`login:${user?.email || address}`);
      const fallback = "00000000000000000000000000000000:" + "0".repeat(128);
      const valid = await verifyPassword(text(f, "password", 160), user?.passwordHash || fallback);
      ensure(user && valid, "Usuario o contraseña incorrectos.", 401);
      const current = globalAdmin ? globalAdminFor(address) : readState().users.find(u => u.id === user.id && !u.disabledAt);
      ensure(current && current.passwordHash === user.passwordHash, "La cuenta cambió. Vuelve a intentarlo.", 401);
      const res = json({ role: user.role }); res.cookies.set(sessionCookieName(), createSession(user.id, globalAdmin), cookieOptions); return res;
    }
    if (action === "register" || action === "admin-register") {
      const creator = action === "admin-register" ? actor(req) : null;
      if (creator) { admin(creator); rateLimit(`mutation:${creator.id}`, 240); }
      else rateLimit(`register:${ip}`, 12);
      const address = email(f); const name = text(f, "name"); const document = text(f, "document", 30).toUpperCase().replace(/[\s.-]/g, "");
      ensure(/^[A-Z0-9]{5,30}$/.test(document), "Revisa el número de documento.");
      const birthDate = text(f, "birthDate", 10);
      ensure(validDate(birthDate) && birthDate > "1900-01-01" && birthDate <= new Date().toLocaleDateString("en-CA", { timeZone: "America/Bogota" }), "Revisa tu fecha de nacimiento.");
      const phone = text(f, "phone", 30); ensure(/^[+\d ()-]{7,30}$/.test(phone), "Revisa el teléfono.");
      const city = text(f, "city"); const academy = text(f, "academy", 200, false); const extra = text(f, "extra", 2000, false);
      ensure(f.get("consent") === "on", "Debes autorizar el uso de los datos para tu inscripción.");
      let registration: Registration | undefined; let receipt: Upload | undefined; let photo: Upload | undefined;
      let reference = "";
      if (!creator) {
        const firstName = text(f, "firstName", 100), lastName = text(f, "lastName", 100);
        ensure(name === firstName + " " + lastName, "Revisa los nombres y apellidos.");
        ensure(document === text(f, "documentConfirm", 30).toUpperCase().replace(/[\s.-]/g, ""), "Los números de documento no coinciden.");
        ensure(text(f, "password", 160) === text(f, "passwordConfirm", 160), "Las contraseñas no coinciden.");
        const sex = text(f, "sex", 30), country = text(f, "country", 100), callingCode = text(f, "callingCode", 5);
        const salsa = text(f, "salsa", 30), bachata = text(f, "bachata", 30), documentType = text(f, "documentType", 30);
        ensure(["Femenino", "Masculino", "Otro", "Prefiero no indicar"].includes(sex) && /^\+\d{1,4}$/.test(callingCode), "Revisa tus datos personales.");
        ensure(LEVELS.includes(salsa) && LEVELS.includes(bachata) && DOCUMENT_TYPES.includes(documentType), "Revisa el nivel y el tipo de documento.");
        ensure(f.get("waiverAccepted") === "on", "Debes leer y aceptar la carta de exoneración.");
        let signature: unknown;
        try { signature = JSON.parse(text(f, "signature", 150000)); } catch { throw new DanceError("Dibuja tu firma antes de continuar."); }
        ensure(validSignature(signature), "Dibuja una firma completa antes de continuar.");
        const guardianName = text(f, "guardianName", 200, false), guardianDocument = text(f, "guardianDocument", 30, false);
        if (isMinor(birthDate)) ensure(guardianName && guardianDocument && f.get("guardianConsent") === "on", "El representante del menor debe identificarse, firmar y autorizar el registro.");
        registration = { firstName, lastName, sex, country, callingCode, salsa, bachata, documentType, photoId: "", waiver: { version: WAIVER_VERSION, text: text(f, "waiverText", 12000).replace(/\r\n/g, "\n"), acceptedAt: "", signature, guardianName: isMinor(birthDate) ? guardianName : "", guardianDocument: isMinor(birthDate) ? guardianDocument : "" } };
        reference = text(f, "reference", 100);
        receipt = await upload(f, "receipt", "receipt"); photo = await upload(f, "photo", "photo");
        registration.photoId = photo.id;
      }
      const passwordHash = await hashPassword(text(f, "password", 160)); const id = randomUUID();
      const participant = transaction(s => {
        ensure(creator || s.settings.registrationOpen, "Las inscripciones están cerradas.");
        const plan = passPlans(s.settings).find(p => p.id === (f.get("passId") || (!s.settings.passPlans ? "fullpass" : "")));
        ensure(plan && passAvailable(plan, s.settings), "Selecciona un pase disponible para este evento.");
        const purchased = s.settings.passPlans ? { id: plan.id, name: plan.name, benefits: [...plan.benefits], canCompete: plan.canCompete } : undefined;
        if (registration) {
          ensure(s.settings.demo || (s.settings.eventStart && s.settings.eventEnd && s.settings.eventLocation), "La organización debe configurar las fechas y la sede antes de recibir registros reales.");
          ensure(registration.waiver.text === waiverText(s.settings, name, document, purchased), "Los datos del evento cambiaron. Actualiza la página y revisa la carta nuevamente.", 409);
          ensure(Number(f.get("fullPassFee")) === plan.fee, "La tarifa cambió. Actualiza la página antes de enviar.", 409);
          registration.waiver.acceptedAt = new Date().toISOString();
        }
        ensure(!globalAdminFor(address) && !s.users.some(u => u.email === address || u.username?.toUpperCase() === document) && !s.participants.some(p => p.document === document), creator ? "Ya existe un registro con ese correo o documento. Búscalo en Registros." : "Ya existe un registro con ese correo o documento. Ingresa con tu cuenta.", 409);
        const p = { id, code: `PAR-${String(s.participants.length + 1).padStart(4, "0")}`, name, document, birthDate, city, phone, email: address, academy, extra, createdAt: new Date().toISOString(), fullPassFee: plan.fee, ...(purchased ? { pass: purchased } : {}), ...(registration ? { registration } : {}) };
        s.users.push({ id, name, email: address, passwordHash, role: "participant", categories: [] }); s.participants.push(p);
        if (registration && receipt && photo) {
          putFile(receipt, id); putFile(photo, id);
          s.payments.push({ id: randomUUID(), participantId: id, enrollmentId: null, kind: "fullpass", amount: plan.fee, date: colombiaDate(), receiptId: receipt.id, reference, status: "pending", note: "", reviewedBy: null, reviewedAt: null, createdAt: p.createdAt });
          audit(s, id, "Carta aceptada y documentos de registro recibidos", id);
        }
        audit(s, creator?.id || id, creator ? "Participante registrado por organización" : "Registro creado", id); return p;
      });
      // Crear desde administración no inicia sesión como el nuevo participante.
      if (creator) return json({ participantId: participant.id, code: participant.code }, 201);
      const res = json({ role: "participant", code: participant.code }, 201); res.cookies.set(sessionCookieName(), createSession(id), cookieOptions); return res;
    }
    const user = actor(req); rateLimit(`mutation:${user.id}`, 240);
    if (action === "logout") {
      db().prepare("DELETE FROM sessions WHERE token=?").run(tokenHash(req.cookies.get(sessionCookieName())!.value));
      const res = json({ ok: true }); res.cookies.set(sessionCookieName(), "", { ...cookieOptions, maxAge: 0 }); return res;
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
    if (action === "review") {
      transaction(s => review(s, user, text(f, "paymentId"), text(f, "status") as Status, text(f, "note", 1000, false))); return json({ ok: true });
    }
    if (action === "payment-settings") {
      ensure(user.role === "superadmin" || user.role === "contractor", "Solo la organización puede configurar los medios de pago.", 403);
      let method;
      try { method = parsePaymentMethod(JSON.parse(text(f, "paymentMethod", 2000))); }
      catch (e) { throw new DanceError(e instanceof Error ? e.message : "Revisa el medio de pago."); }
      const instructions = text(f, "paymentInstructions", 3000, false);
      ensure(method || instructions, "Configura un medio de pago o escribe las instrucciones.");
      const previous = text(f, "previousPaymentConfig", 6000);
      transaction(s => {
        ensure(previous === JSON.stringify({ paymentMethod: s.settings.paymentMethod || null, paymentInstructions: s.settings.paymentInstructions }), "Otro integrante cambió los medios de pago. Actualiza la página antes de guardar.", 409);
        s.settings.paymentMethod = method; s.settings.paymentInstructions = instructions;
        audit(s, user.id, "Medio de pago del evento actualizado", "evento");
      });
      return json({ ok: true });
    }
    admin(user);
    if (action === "archive-demo-events") {
      const global = withEvent(undefined, () => readState().users.some(u => u.id === user.id && u.role === "superadmin" && !u.disabledAt && u.passwordHash === user.passwordHash));
      ensure(global, "Solo superadministración global puede retirar eventos.", 403);
      ensure(f.get("confirm") === "archive-examples", "Confirma el retiro de los eventos de ejemplo.");
      let ids: unknown;
      try { ids = JSON.parse(text(f, "eventIds", 4000)); } catch { throw new DanceError("Revisa los eventos seleccionados."); }
      ensure(Array.isArray(ids) && ids.every(id => typeof id === "string"), "Revisa los eventos seleccionados.");
      archiveDemoEvents(ids as string[], text(f, "keepEventId", 60), user.id);
      return json({ ok: true, archived: ids, dataRetained: true });
    }
    if (action === "create-event") {
      const rootAdmin = () => withEvent(undefined, () => {
        const state = readState();
        return state.users.find(u => u.id === user.id && u.role === "superadmin" && !u.disabledAt && u.passwordHash === user.passwordHash && (!u.demoOnly || state.settings.demo));
      });
      ensure(rootAdmin(), "Solo superadministración global puede crear eventos.", 403);
      ensure(f.get("confirm") === "publish", "Confirma la creación y publicación del evento.");
      let input: unknown;
      try { input = JSON.parse(text(f, "event", 100000)); } catch { throw new DanceError("No se pudo leer la configuración del evento."); }
      const file = f.get("cover");
      const cover = file instanceof File && file.size ? await upload(f, "photo", "cover") : undefined;
      const { listing, state, accounts } = prepareEvent(input, user.id, !!cover);
      ensure(!listing.demo || withEvent(undefined, () => readState().settings.demo), "La plataforma tiene desactivados los eventos de prueba.");
      ensure(!findEvent(listing.id), "Ese enlace ya pertenece a otro evento. Elige otro identificador.", 409);
      for (const a of accounts) {
        const reserved = withEvent(undefined, () => readState().users.some(u => u.role === "superadmin" && (u.email === a.email || u.username?.toLowerCase() === a.email)));
        ensure(!reserved, "El correo del equipo no puede pertenecer a superadministración.", 409);
        state.users.push({ id: randomUUID(), name: a.name, email: a.email, passwordHash: await hashPassword(a.password), role: a.role, categories: a.categories });
      }
      ensure(rootAdmin(), "Tu sesión cambió. Vuelve a iniciar sesión.", 401);
      insertEvent(listing, state, cover);
      return json({ ok: true, eventId: listing.id, eventUrl: eventHref(listing.id) }, 201);
    }
    if (action === "enrollment-edit") {
      const data = { team: text(f, "team", 120, false), members: text(f, "members", 2000, false), school: text(f, "school", 200, false), contactEmail: text(f, "contactEmail", 200, false).toLowerCase() };
      transaction(s => editEnrollment(s, user, text(f, "enrollmentId"), data)); return json({ ok: true });
    }
    if (action === "enrollment-category") {
      transaction(s => moveEnrollment(s, user, text(f, "enrollmentId"), text(f, "categoryId"), text(f, "reason", 500))); return json({ ok: true });
    }
    if (action === "enrollment-note") {
      const id = text(f, "enrollmentId"), note = text(f, "note", 1500, false);
      transaction(s => { const e = s.enrollments.find(e => e.id === id); ensure(e, "Inscripción no encontrada.", 404); e.note = note; audit(s, user.id, "Observación interna de inscripción actualizada", id); }); return json({ ok: true });
    }
    if (action === "enrollment-music") {
      const id = text(f, "enrollmentId"), file = await upload(f, "music");
      transaction(s => {
        const e = editableEnrollment(s, user, id), c = s.categories.find(c => c.id === e.categoryId)!;
        ensure(eligible(s, e), "Primero deben aprobarse el Full Pass y el pago de categoría.", 409);
        ensure(!c.deadline || Date.now() <= Date.parse(c.deadline), "El plazo de música terminó. Revisa la fecha límite en Categorías.", 409);
        putFile(file, e.participantId); e.musicId = file.id; e.musicName = file.name; e.musicUpdatedAt = new Date().toISOString();
        audit(s, user.id, "Pista reemplazada por organización", id);
      }); return json({ ok: true });
    }
    if (action === "enrollment-receipt") {
      const id = text(f, "enrollmentId"), reason = text(f, "reason", 500), file = await upload(f, "receipt");
      transaction(s => {
        const e = editableEnrollment(s, user, id), payment = s.payments.find(p => p.enrollmentId === id);
        ensure(payment, "El participante todavía no ha enviado un pago de esta categoría.", 409);
        review(s, user, payment.id, "review", `Comprobante reemplazado: ${reason}`);
        putFile(file, e.participantId); payment.receiptId = file.id;
        audit(s, user.id, "Comprobante reemplazado; requiere nueva revisión", id);
      }); return json({ ok: true });
    }
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
    if (action === "pass-plan") {
      const id = text(f, "id", 60);
      ensure(/^[a-z0-9][a-z0-9-]{0,59}$/.test(id), "Usa un identificador sin espacios ni acentos.");
      const validUntil = text(f, "validUntil", 10, false);
      ensure(!validUntil || validDate(validUntil), "Revisa la vigencia del pase.");
      const benefits = text(f, "benefits", 1600).split(/\r?\n/).map(x => x.trim()).filter(Boolean);
      ensure(benefits.length <= 8 && benefits.every(x => x.length <= 200), "Usa hasta ocho beneficios de máximo 200 caracteres.");
      const plan: PassPlan = { id, name: text(f, "name", 100), fee: numeric(f, "fee", 1), benefits, validUntil, active: f.get("active") === "on", canCompete: f.get("canCompete") === "on" };
      ensure(Number.isInteger(plan.fee), "Usa un precio en pesos enteros.");
      transaction(s => {
        const plans = passPlans(s.settings);
        const old = plans.find(p => p.id === id);
        ensure(old || plans.length < 12, "Este evento admite hasta doce pases.");
        if (old) Object.assign(old, plan); else plans.push(plan);
        s.settings.passPlans = plans;
        audit(s, user.id, "Plan de pase actualizado", id);
      });
      return json({ ok: true });
    }
    if (action === "settings") {
      const name = text(f, "name", 100); const tagline = text(f, "tagline", 200); const fullPassFee = numeric(f, "fullPassFee", 1); const paymentInstructions = f.has("paymentInstructions") ? text(f, "paymentInstructions", 3000, false) : undefined;
      const eventStart = f.has("eventStart") ? text(f, "eventStart", 10, false) : undefined;
      const eventEnd = f.has("eventEnd") ? text(f, "eventEnd", 10, false) : undefined;
      const eventLocation = f.has("eventLocation") ? text(f, "eventLocation", 200, false) : undefined;
      ensure(!eventStart || validDate(eventStart), "Revisa la fecha inicial del evento.");
      ensure(!eventEnd || validDate(eventEnd), "Revisa la fecha final del evento.");
      ensure(!eventStart || !eventEnd || eventEnd >= eventStart, "La fecha final no puede ser anterior al inicio.");
      const formula = text(f, "formula"); ensure(formula === "average" || formula === "sum", "Fórmula inválida.");
      transaction(s => { ensure((paymentInstructions ?? s.settings.paymentInstructions).trim() || s.settings.paymentMethod, "Configura el medio de pago o sus instrucciones."); ensure(!s.settings.scoringScheme || formula === "average", "Este evento usa promedio ponderado sobre 10."); ensure(formula === s.settings.formula || (!s.scores.length && !s.schedule.some(x => ["live", "finished"].includes(x.status))), "No cambies la fórmula cuando hay calificaciones o competencias iniciadas.", 409); s.settings = { ...s.settings, ...(eventStart !== undefined ? { eventStart } : {}), ...(eventEnd !== undefined ? { eventEnd } : {}), ...(eventLocation !== undefined ? { eventLocation } : {}), name, tagline, fullPassFee, ...(paymentInstructions !== undefined ? { paymentInstructions } : {}), formula, registrationOpen: f.get("registrationOpen") === "on", categoryRegistrationOpen: f.get("categoryRegistrationOpen") === "on" }; audit(s, user.id, "Configuración actualizada", "evento"); }); return json({ ok: true });
    }
    if (action === "contractor") {
      const address = email(f), name = text(f, "name");
      const passwordHash = await hashPassword(text(f, "password", 160));
      transaction(s => {
        ensure(!globalAdminFor(address), "Ese correo pertenece a superadministración.", 409);
        const old = s.users.find(u => u.email === address);
        ensure(!old || old.role === "contractor", "Ese correo ya tiene otro perfil en este evento.", 409);
        if (old) {
          old.name = name; old.passwordHash = passwordHash;
          db().prepare("DELETE FROM sessions WHERE userId=?").run(old.id);
        } else s.users.push({ id: randomUUID(), email: address, name, passwordHash, role: "contractor", categories: [] });
        audit(s, user.id, "Acceso de contratista actualizado", address);
      });
      return json({ ok: true });
    }
    if (action === "categories-preview" || action === "categories-import") {
      const file = f.get("file");
      ensure(file instanceof File && /\.xlsx?$/i.test(file.name) && file.size <= 5 * 1024 ** 2, "Selecciona un archivo .xlsx o .xls de máximo 5 MB.");
      const categories = parseCategoryWorkbook(new Uint8Array(await file.arrayBuffer()));
      if (action === "categories-preview") return json({ categories });
      ensure(f.get("confirm") === "import", "Confirma las categorías de la vista previa.");
      const counts = transaction(s => {
        let added = 0, skipped = 0;
        for (const c of categories) {
          const old = s.categories.find(x => categoryIdentity(x) === categoryIdentity(c));
          if (old) { ensure(old.fee === Number(c.fee), `La categoría ${c.name} ya existe con otra tarifa. Edítala desde su ficha antes de importar.`, 409); skipped++; continue; }
          ensure(s.categories.length < 300, "El evento admite hasta 300 categorías.");
          s.categories.push({ ...c, id: randomUUID(), fee: Number(c.fee), active: true }); added++;
        }
        if (added) audit(s, user.id, `Categorías importadas desde Excel: ${added}`, "categorias");
        return { added, skipped };
      });
      return json({ ok: true, ...counts });
    }
    if (action === "scoring-settings") {
      let criteria: unknown; try { criteria = JSON.parse(text(f, "criteria", 12000)); } catch { throw new DanceError("Revisa los parámetros de calificación."); }
      const config = scoringConfiguration(text(f, "model", 30), criteria);
      transaction(s => {
        ensure(!s.scores.length && !s.schedule.some(x => ["live", "finished"].includes(x.status)), "No se pueden cambiar los criterios cuando ya hay notas o competencias iniciadas. Crea otro evento para usar una fórmula diferente.", 409);
        Object.assign(s.settings, config); audit(s, user.id, "Parámetros de calificación actualizados", "evento");
      }); return json({ ok: true });
    }
    if (action === "category") {
      const id = text(f, "id", 100, false) || randomUUID(); const deadline = text(f, "deadline", 100, false);
      ensure(!deadline || Number.isFinite(Date.parse(deadline)), "Fecha límite inválida.");
      const validUntil = f.has("validUntil") ? text(f, "validUntil", 10, false) : undefined;
      ensure(!validUntil || validDate(validUntil), "Revisa la vigencia de la tarifa.");
      const c: Category = { id, ...(validUntil !== undefined ? { validUntil } : {}), name: text(f, "name", 120), rhythm: text(f, "rhythm", 80), modality: text(f, "modality", 30), division: text(f, "division", 80), fee: numeric(f, "fee", 1), active: f.get("active") === "on", deadline: deadline ? new Date(deadline).toISOString() : "" };
      ensure(["Solista", "Pareja", "Grupo"].includes(c.modality), "Modalidad inválida.");
      transaction(s => { ensure(!c.active || !s.schedule.some(x => x.categoryId === id && x.status === "finished"), "La categoría ya finalizó. Crea otra categoría para una nueva competencia.", 409); const old = s.categories.find(x => x.id === id); if (old) { ensure(!s.enrollments.some(e => e.categoryId === id) || (old.modality === c.modality && old.rhythm === c.rhythm && old.division === c.division), "No cambies modalidad, ritmo o división de una categoría con inscritos."); Object.assign(old, c); } else s.categories.push(c); audit(s, user.id, "Categoría actualizada", id); }); return json({ ok: true });
    }
    if (action === "disable-accounts") {
      ensure(f.get("confirm") === "disable", "Confirma la desactivación de cuentas.");
      const ids = [...new Set(f.getAll("userId"))];
      ensure(ids.length > 0 && ids.length <= 50 && ids.every(id => typeof id === "string" && id.length <= 100), "Selecciona entre una y cincuenta cuentas.");
      const reason = text(f, "reason", 500);
      transaction(s => {
        admin(actor(req));
        const targets = ids.map(id => s.users.find(u => u.id === id));
        ensure(targets.every(Boolean), "Una de las cuentas ya no existe. Actualiza el listado.", 409);
        ensure(!ids.includes(user.id), "No puedes desactivar tu propia sesión.", 409);
        ensure(s.users.some(u => u.role === "superadmin" && !u.disabledAt && !ids.includes(u.id)), "Conserva al menos un superadministrador activo.", 409);
        const at = new Date().toISOString();
        for (const target of targets) {
          if (!target || target.disabledAt) continue;
          // Retain references used by payments, signed records and score calculations.
          target.disabledAt = at;
          db().prepare("DELETE FROM sessions WHERE userId=?").run(target.id);
          audit(s, user.id, `Cuenta desactivada: ${reason}`, target.id);
        }
      });
      return json({ ok: true });
    }
    if (action === "judge-delete") {
      const id = text(f, "judgeId", 100);
      ensure(text(f, "confirmId", 100) === id, "Confirma el jurado que deseas eliminar.");
      transaction(s => {
        const judge = s.users.find(u => u.id === id && u.role === "judge");
        ensure(judge, "Jurado no encontrado.", 404);
        const blocked = judgeDeletionBlock(s, judge);
        ensure(!blocked, blocked, 409);
        s.users = s.users.filter(u => u.id !== id);
        db().prepare("DELETE FROM sessions WHERE userId=?").run(id);
        audit(s, user.id, `Jurado eliminado: ${judge.name}`, id);
      });
      return json({ ok: true });
    }
    if (action === "judge") {
      const id = text(f, "id", 100, false);
      const name = text(f, "name", 120); const address = email(f); const password = text(f, "password", 160, false);
      const passwordHash = password ? await hashPassword(password) : null;
      transaction(s => {
        const old = s.users.find(x => x.id === id && x.role === "judge");
        const protectedIds = protectedJudgeCategories(s);
        const categories = s.categories.filter(c => !protectedIds.has(c.id) || old?.categories.includes(c.id)).map(c => c.id);
        ensure(!globalAdminFor(address) && !s.users.some(x => x.email === address && x.id !== old?.id), "Ese correo ya está en uso.", 409);
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
      const id = text(f, "userId"); const password = text(f, "password", 160);
      const passwordHash = await hashPassword(password, true);
      transaction(s => {
        const target = s.users.find(x => x.id === id); ensure(target, "Cuenta no encontrada.", 404);
        if (password.length < 10) {
          ensure(s.settings.demo && target.role !== "superadmin", "Las claves cortas son solo para perfiles de eventos de prueba.");
          target.demoOnly = true;
        }
        target.passwordHash = passwordHash;
        db().prepare("DELETE FROM sessions WHERE userId=?").run(id);
        audit(s, user.id, "Contraseña restablecida", id);
      }); return json({ ok: true });
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

async function dispatch(req: NextRequest, ctx: Context, handler: typeof handleGET) {
  try {
    const parts = (await ctx.params).path;
    if (parts[0] !== "eventos") return await withEvent(undefined, () => handler(req, ctx));
    const event = findEvent(parts[1]);
    ensure(event && parts.length >= 3, "Evento no encontrado.", 404);
    ensure(!event.demo || withEvent(undefined, () => readState().settings.demo), "Evento no disponible.", 404);
    return await withEvent(event.id, () => handler(req, { params: Promise.resolve({ path: parts.slice(2) }) }));
  } catch (error) { return errorResponse(error); }
}
export async function GET(req: NextRequest, ctx: Context) { return dispatch(req, ctx, handleGET); }
export async function POST(req: NextRequest, ctx: Context) { return dispatch(req, ctx, handlePOST); }
