import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { eventCatalog, type EventListing } from "./event-catalog";
import type { State } from "./types";
import { ensure } from "./domain";

const connections = new Map<string, DatabaseSync>();
function registry() {
  const root = process.env.BAILE_DATA_DIR || path.join(process.cwd(), "data", "baile");
  let conn = connections.get(root);
  if (!conn) {
    mkdirSync(root, { recursive: true, mode: 0o700 });
    conn = new DatabaseSync(path.join(root, "events-index.sqlite"));
    conn.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
      CREATE TABLE IF NOT EXISTS events (id TEXT PRIMARY KEY, listing TEXT NOT NULL, seed TEXT NOT NULL, cover BLOB, mime TEXT);
      CREATE TABLE IF NOT EXISTS event_judge_photos (eventId TEXT NOT NULL, id TEXT NOT NULL, owner TEXT NOT NULL, content BLOB NOT NULL, PRIMARY KEY(eventId,id));
      CREATE TABLE IF NOT EXISTS archived_events (id TEXT PRIMARY KEY, actor TEXT NOT NULL, archivedAt TEXT NOT NULL, replacementId TEXT NOT NULL);`);
    connections.set(root, conn);
  }
  return conn;
}

export function listEvents(): EventListing[] {
  const archived = new Set(registry().prepare("SELECT id FROM archived_events").all().map(r => String(r.id)));
  return [...eventCatalog, ...registry().prepare("SELECT listing FROM events ORDER BY rowid DESC").all().map(r => JSON.parse(String(r.listing)) as EventListing)].filter(e => !archived.has(e.id));
}
export function findRegisteredEvent(id: string): EventListing | undefined {
  if (!/^[a-z0-9][a-z0-9-]{2,59}$/.test(id)) return undefined;
  if (registry().prepare("SELECT id FROM archived_events WHERE id=?").get(id)) return undefined;
  const builtin = eventCatalog.find(e => e.id === id);
  if (builtin) return builtin;
  const row = registry().prepare("SELECT listing FROM events WHERE id=?").get(id);
  return row ? JSON.parse(String(row.listing)) : undefined;
}
export function eventSeed(id: string): State | undefined {
  const row = registry().prepare("SELECT seed FROM events WHERE id=?").get(id);
  return row ? JSON.parse(String(row.seed)) : undefined;
}
export function eventCover(id: string) {
  return registry().prepare("SELECT cover,mime FROM events WHERE id=? AND cover IS NOT NULL").get(id);
}
export type InitialJudgePhoto = { id: string; owner: string; buffer: Buffer };
export function initialJudgePhoto(eventId: string | undefined, id: string, owner: string) {
  return eventId ? registry().prepare("SELECT content FROM event_judge_photos WHERE eventId=? AND id=? AND owner=?").get(eventId, id, owner) : undefined;
}
export function insertEvent(listing: EventListing, seed: State, cover?: { buffer: Buffer; mime: string }, photos: InitialJudgePhoto[] = []) {
  const conn = registry();
  conn.exec("BEGIN IMMEDIATE");
  try {
    ensure(!eventCatalog.some(e => e.id === listing.id) && !conn.prepare("SELECT id FROM events WHERE id=?").get(listing.id), "Ese enlace ya pertenece a otro evento. Elige otro identificador.", 409);
    // The listing, initial configuration and public cover are committed together.
    // The event database initializes lazily with this seed and never replaces existing data.
    conn.prepare("INSERT INTO events VALUES (?,?,?,?,?)").run(listing.id, JSON.stringify(listing), JSON.stringify(seed), cover?.buffer || null, cover?.mime || null);
    for (const photo of photos) conn.prepare("INSERT INTO event_judge_photos VALUES (?,?,?,?)").run(listing.id, photo.id, photo.owner, photo.buffer);
    conn.exec("COMMIT");
  } catch (error) { conn.exec("ROLLBACK"); throw error; }
}

// Retire only explicitly selected examples, retaining their database, files and
// original seed. Reserving their IDs prevents old data leaking into a new event.
export function archiveDemoEvents(ids: string[], replacementId: string, actor: string) {
  const conn = registry();
  conn.exec("BEGIN IMMEDIATE");
  try {
    ensure(ids.length > 0 && ids.length <= 50 && new Set(ids).size === ids.length, "Selecciona los eventos de ejemplo sin repetirlos.");
    ensure(findRegisteredEvent(replacementId)?.demo, "El evento de prueba que se conservará debe estar publicado.");
    for (const id of ids) {
      ensure(id !== replacementId, "No puedes retirar el evento que se conservará.");
      ensure(findRegisteredEvent(id)?.demo, "Solo se pueden retirar eventos de ejemplo publicados. Revisa la selección.", 409);
    }
    const insert = conn.prepare("INSERT INTO archived_events VALUES (?,?,?,?)");
    const at = new Date().toISOString();
    for (const id of ids) insert.run(id, actor, at, replacementId);
    conn.exec("COMMIT");
  } catch (error) { conn.exec("ROLLBACK"); throw error; }
}
