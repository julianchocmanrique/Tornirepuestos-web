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
      CREATE TABLE IF NOT EXISTS events (id TEXT PRIMARY KEY, listing TEXT NOT NULL, seed TEXT NOT NULL, cover BLOB, mime TEXT);`);
    connections.set(root, conn);
  }
  return conn;
}

export function listEvents(): EventListing[] {
  return [...eventCatalog, ...registry().prepare("SELECT listing FROM events ORDER BY rowid DESC").all().map(r => JSON.parse(String(r.listing)) as EventListing)];
}
export function findRegisteredEvent(id: string): EventListing | undefined {
  if (!/^[a-z0-9][a-z0-9-]{2,59}$/.test(id)) return undefined;
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
export function insertEvent(listing: EventListing, seed: State, cover?: { buffer: Buffer; mime: string }) {
  const conn = registry();
  conn.exec("BEGIN IMMEDIATE");
  try {
    ensure(!findRegisteredEvent(listing.id), "Ese enlace ya pertenece a otro evento. Elige otro identificador.", 409);
    // The listing, initial configuration and public cover are committed together.
    // The event database initializes lazily with this seed and never replaces existing data.
    conn.prepare("INSERT INTO events VALUES (?,?,?,?,?)").run(listing.id, JSON.stringify(listing), JSON.stringify(seed), cover?.buffer || null, cover?.mime || null);
    conn.exec("COMMIT");
  } catch (error) { conn.exec("ROLLBACK"); throw error; }
}
