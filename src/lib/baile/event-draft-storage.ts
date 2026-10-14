import { parsePaymentMethod } from "./payment-method";
import { newEventDraft, type EventDraft } from "./event-draft";

const DATABASE = "rankia-event-drafts";
type StoredDraft = Omit<EventDraft, "contractor" | "judges"> & {
  contractor: Omit<NonNullable<EventDraft["contractor"]>, "password"> | null;
  judges: Omit<EventDraft["judges"][number], "password">[];
};
export function withoutPasswords(draft: EventDraft): StoredDraft {
  return {
    ...draft,
    contractor: draft.contractor ? { name: draft.contractor.name, email: draft.contractor.email } : null,
    judges: draft.judges.map(j => ({ name: j.name, email: j.email, categories: [...j.categories] })),
  };
}

// Drafts can be incomplete, but malformed browser data must not break the form.
export function restoreDraft(value: unknown): { draft: EventDraft; step: number } {
  const row = value as { version?: number; draft?: StoredDraft; step?: number } | null;
  if (!row || row.version !== 1 || !row.draft || typeof row.draft !== "object") throw new Error("Invalid draft");
  const d = row.draft, base = newEventDraft();
  const text = (v: unknown) => typeof v === "string" && v.length <= 5000;
  for (const key of Object.keys(base) as (keyof EventDraft)[]) {
    if (typeof base[key] === "string" && !text(d[key])) throw new Error("Invalid field");
    if (typeof base[key] === "boolean" && typeof d[key] !== "boolean") throw new Error("Invalid option");
  }
  if (!Array.isArray(d.passes) || d.passes.length < 1 || d.passes.length > 12 || d.passes.some(p => !p || ![p.name, p.fee, p.benefits, p.validUntil].every(text) || typeof p.canCompete !== "boolean")) throw new Error("Invalid passes");
  if (!Array.isArray(d.categories) || d.categories.length < 1 || d.categories.length > 60 || d.categories.some(c => !c || ![c.name, c.modality, c.rhythm, c.division, c.fee, c.deadline, c.validUntil].every(text))) throw new Error("Invalid categories");
  if (d.contractor !== null && (!d.contractor || !text(d.contractor.name) || !text(d.contractor.email))) throw new Error("Invalid contractor");
  if (!Array.isArray(d.judges) || d.judges.length > 20 || d.judges.some(j => !j || !text(j.name) || !text(j.email) || !Array.isArray(j.categories) || j.categories.some(n => !Number.isInteger(n) || n < 0 || n >= d.categories.length))) throw new Error("Invalid judges");
  // Copy only known fields and never restore credentials, even from an older record.
  const restored = Object.fromEntries(Object.keys(base).map(key => [key, d[key as keyof StoredDraft]])) as EventDraft;
  restored.paymentMethod = parsePaymentMethod(d.paymentMethod, true);
  restored.criteria = Array.isArray(d.criteria) && d.criteria.length <= 12 && d.criteria.every(c => c && typeof c.name === "string" && typeof c.weight === "number") ? d.criteria : null;
  restored.contractor = d.contractor ? { name: d.contractor.name, email: d.contractor.email, password: "" } : null;
  restored.judges = d.judges.map(j => ({ name: j.name, email: j.email, categories: j.categories, password: "" }));
  return { draft: restored, step: Number.isInteger(row.step) ? Math.max(0, Math.min(6, row.step!)) : 0 };
}

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE, 1);
    request.onupgradeneeded = () => {
      for (const name of ["drafts", "photos"]) if (!request.result.objectStoreNames.contains(name)) request.result.createObjectStore(name);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error("Browser storage blocked"));
  });
}

export async function readEventDraft(key: string) {
  const db = await open();
  return new Promise<{ draft: EventDraft; step: number; cover: File | null } | null>((resolve, reject) => {
    const tx = db.transaction(["drafts", "photos"], "readonly");
    const data = tx.objectStore("drafts").get(key), photo = tx.objectStore("photos").get(key);
    tx.oncomplete = () => {
      db.close();
      try {
        if (!data.result) return resolve(null);
        const restored = restoreDraft(data.result);
        const cover = photo.result;
        if (cover != null && (!(cover instanceof File) || cover.size > 5 * 1024 ** 2 || !["image/png", "image/jpeg"].includes(cover.type))) throw new Error("Invalid photo");
        resolve({ ...restored, cover: cover || null });
      } catch (error) { reject(error); }
    };
    tx.onabort = () => { db.close(); reject(tx.error); };
  });
}

export async function writeEventDraft(key: string, draft: EventDraft, step: number, cover: File | null, updatePhoto: boolean) {
  const db = await open();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(["drafts", "photos"], "readwrite");
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onabort = () => { db.close(); reject(tx.error); };
    try {
      tx.objectStore("drafts").put({ version: 1, draft: withoutPasswords(draft), step }, key);
      // Save the photo only when it changes, in the same transaction as its draft.
      if (updatePhoto) {
        if (cover) tx.objectStore("photos").put(cover, key);
        else tx.objectStore("photos").delete(key);
      }
    } catch (error) { tx.abort(); reject(error); }
  });
}

export async function deleteEventDraft(key: string) {
  const db = await open();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(["drafts", "photos"], "readwrite");
    tx.objectStore("drafts").delete(key); tx.objectStore("photos").delete(key);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onabort = () => { db.close(); reject(tx.error); };
  });
}
