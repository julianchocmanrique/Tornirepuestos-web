import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { initialState, migrateState } from "./types";
import type { State, User } from "./types";
import { ensure } from "./domain";
import { currentEventId, withEvent } from "./event-scope";
import { findEvent } from "./event-catalog";

const connections = new Map<string, DatabaseSync>();
export function db() {
  const eventId = currentEventId();
  const root = process.env.BAILE_DATA_DIR || path.join(process.cwd(), "data", "baile");
  const dir = eventId ? path.join(root, "events", eventId) : root;
  let connection = connections.get(dir);
  if (!connection) {
    mkdirSync(dir, { recursive: true, mode: 0o700 });
    connection = new DatabaseSync(path.join(dir, "event.sqlite"));
    connection.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
      CREATE TABLE IF NOT EXISTS state (id INTEGER PRIMARY KEY CHECK(id=1), data TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, userId TEXT NOT NULL, expires INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS files (id TEXT PRIMARY KEY, owner TEXT NOT NULL, kind TEXT NOT NULL, name TEXT NOT NULL, mime TEXT NOT NULL, content BLOB NOT NULL);
      CREATE TABLE IF NOT EXISTS attempts (id TEXT PRIMARY KEY, count INTEGER NOT NULL, reset INTEGER NOT NULL);`);
    const state = initialState(), event = eventId ? findEvent(eventId) : undefined;
    if (event) {
      state.settings.name = event.name;
      state.settings.tagline = event.description;
      state.settings.demo = event.demo;
      state.settings.eventStart = event.date;
      state.settings.eventEnd = event.date;
      state.settings.eventLocation = `${event.city}, sede por confirmar`;
      state.categories = state.categories.filter(c => c.rhythm === event.genre);
    }
    connection.prepare("INSERT OR IGNORE INTO state (id,data) VALUES (1,?)").run(JSON.stringify(state));
    connections.set(dir, connection);
  }
  return connection;
}
export function readState(): State {
  return migrateState(JSON.parse(db().prepare("SELECT data FROM state WHERE id=1").get()!.data as string));
}
// La transacción incluye las validaciones para evitar números o inscripciones duplicados.
export function transaction<T>(fn: (state: State) => T): T {
  const conn = db();
  conn.exec("BEGIN IMMEDIATE");
  try {
    const state = readState(); const result = fn(state);
    conn.prepare("UPDATE state SET data=? WHERE id=1").run(JSON.stringify(state));
    conn.exec("COMMIT"); return result;
  } catch (error) { conn.exec("ROLLBACK"); throw error; }
}
const scrypt = promisify(scryptCallback);
export async function hashPassword(password: string) {
  ensure(password.length >= 10 && password.length <= 160, "Usa una contraseña de entre 10 y 160 caracteres.");
  const salt = randomBytes(16).toString("hex");
  const key = await scrypt(password, salt, 64) as Buffer;
  return `${salt}:${key.toString("hex")}`;
}
export async function verifyPassword(password: string, hash: string) {
  if (password.length > 160) return false;
  const [salt, digest] = hash.split(":");
  const actual = await scrypt(password, salt, 64) as Buffer;
  const expected = Buffer.from(digest, "hex");
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
export const tokenHash = (value: string) => createHash("sha256").update(value).digest("hex");
export function globalAdminFor(address: string): User | undefined {
  if (!currentEventId()) return undefined;
  return withEvent(undefined, () => {
    const state = readState();
    return state.users.find(u => u.role === "superadmin" && (!u.demoOnly || state.settings.demo) && (u.email === address || u.username?.toLowerCase() === address));
  });
}
export function createSession(userId: string, globalAdmin?: User) {
  const token = randomBytes(32).toString("hex");
  // Root administrators are referenced, never copied into another event's accounts.
  if (globalAdmin && currentEventId()) userId = `global:${globalAdmin.id}:${tokenHash(globalAdmin.passwordHash)}`;
  db().prepare("DELETE FROM sessions WHERE expires < ?").run(Date.now());
  db().prepare("INSERT INTO sessions VALUES (?,?,?)").run(tokenHash(token), userId, Date.now() + 86400000);
  return token;
}
export function sessionUser(token: string | undefined): User | null {
  if (!token) return null;
  const row = db().prepare("SELECT userId FROM sessions WHERE token=? AND expires>?").get(tokenHash(token), Date.now());
  if (row && currentEventId() && String(row.userId).startsWith("global:")) {
    const [, id, digest] = String(row.userId).split(":");
    return withEvent(undefined, () => {
      const root = readState();
      return root.users.find(u => u.id === id && u.role === "superadmin" && tokenHash(u.passwordHash) === digest && (!u.demoOnly || root.settings.demo)) || null;
    });
  }
  const state = readState();
  return row ? state.users.find(u => u.id === row.userId && (!u.demoOnly || state.settings.demo)) || null : null;
}
export function rateLimit(key: string, max = 15) {
  const id = tokenHash(key); const now = Date.now();
  db().prepare("DELETE FROM attempts WHERE reset < ?").run(now);
  db().prepare("INSERT INTO attempts VALUES (?,1,?) ON CONFLICT(id) DO UPDATE SET count=count+1").run(id, now + 900000);
  const row = db().prepare("SELECT count FROM attempts WHERE id=?").get(id)!;
  ensure(Number(row.count) <= max, "Demasiados intentos. Vuelve a intentar en 15 minutos.", 429);
}
