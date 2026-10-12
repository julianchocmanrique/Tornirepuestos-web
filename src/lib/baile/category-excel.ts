import * as XLSX from "xlsx";
import { DanceError, ensure } from "./domain";
import type { EventDraft } from "./event-draft";

import { categoryIdentity } from "./category-identity";
export { categoryIdentity } from "./category-identity";

export type ImportedCategory = EventDraft["categories"][number];
const normalize = (v: unknown) => String(v ?? "").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ");
function modality(value: unknown, where: string) {
  const key = normalize(value), names: Record<string, string> = { solista: "Solista", pareja: "Pareja", parejas: "Pareja", duo: "Pareja", grupo: "Grupo", grupos: "Grupo" };
  ensure(names[key], `${where}: modalidad inválida. Usa solista, pareja o grupo.`); return names[key];
}
function price(value: unknown, where: string) {
  const str = String(value ?? "").replace(/COP|\$|\s/gi, "");
  const n = typeof value === "number" ? value : /^\d{1,3}(\.\d{3})+$/.test(str) ? Number(str.replace(/\./g, "")) : Number(str);
  ensure(Number.isSafeInteger(n) && n >= 1 && n <= 100000000, `${where}: indica un precio entero entre 1 y 100.000.000 COP.`); return n;
}
export function parseCategoryWorkbook(bytes: Uint8Array): ImportedCategory[] {
  ensure(bytes.length > 0 && bytes.length <= 5 * 1024 ** 2, "Usa un Excel de máximo 5 MB.");
  let book: XLSX.WorkBook;
  try { book = XLSX.read(bytes, { type: "array", dense: true, sheetRows: 1002, cellFormula: true, cellHTML: false }); }
  catch { throw new DanceError("No se pudo leer el Excel. Revisa el archivo y vuelve a guardarlo como .xlsx."); }
  ensure(book.SheetNames.length <= 10, "El archivo admite hasta diez hojas.");
  const prices = new Map<string, number>();
  const rows: { data: unknown[]; header: string[]; where: string }[] = [];
  for (const name of book.SheetNames) {
    const sheet = book.Sheets[name];
    const range = XLSX.utils.decode_range(sheet["!fullref"] || sheet["!ref"] || "A1");
    ensure(range.e.r < 1000 && range.e.c < 30, "Usa un archivo de máximo 1000 filas y 30 columnas por hoja.");
    let header: string[] = [], section = "";
    const data = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, range: 0, defval: "", raw: true });
    for (let i = 0; i < data.length; i++) {
      const row = data[i], normalized = row.map(normalize), where = `${name}, fila ${i + 1}`;
      if (normalized.every(x => !x)) continue;
      if (normalized.includes("nombre") && normalized.includes("modalidad") && normalized.some(x => ["categoria", "ritmo", "disciplina"].includes(x))) { header = normalized; section = "categories"; continue; }
      if (normalized.some(x => ["precios modalidades", "modalidad"].includes(x)) && normalized.includes("precio") && !normalized.includes("nombre")) { header = normalized; section = "prices"; continue; }
      if (!section) continue;
      for (let col = 0; col < row.length; col++) {
        const cell = (sheet as unknown as XLSX.CellObject[][])[i]?.[col] || sheet[XLSX.utils.encode_cell({ r: i, c: col })];
        ensure(!cell?.f, `${where}: usa valores, no fórmulas, en el archivo de importación.`);
      }
      if (section === "prices") {
        const mode = modality(row[header.findIndex(x => ["precios modalidades", "modalidad"].includes(x))], where), fee = price(row[header.indexOf("precio")], where);
        ensure(!prices.has(mode) || prices.get(mode) === fee, `${where}: hay dos precios diferentes para ${mode}.`); prices.set(mode, fee);
      } else rows.push({ data: row, header, where });
    }
  }
  ensure(rows.length > 0 && rows.length <= 60, "Incluye de una a sesenta categorías con encabezados nombre, modalidad y categoria.");
  const categories = rows.map(({ data, header, where }) => {
    const get = (...keys: string[]) => data[header.findIndex(h => keys.includes(h))];
    const name = String(get("nombre") ?? "").trim(), rhythm = String(get("categoria", "ritmo", "disciplina") ?? "").trim();
    const mode = modality(get("modalidad"), where), division = String(get("division", "nivel") || "Abierta").trim();
    ensure(name && name.length <= 120 && rhythm && rhythm.length <= 80 && division.length <= 80, `${where}: revisa nombre, categoría y división.`);
    const ownPrice = get("precio", "tarifa"), fee = ownPrice !== undefined && String(ownPrice).trim() !== "" ? price(ownPrice, where) : prices.get(mode);
    ensure(fee !== undefined, `${where}: falta el precio de ${mode}. Añádelo a la tabla de precios por modalidad o a la columna precio.`);
    return { name, modality: mode, rhythm, division, fee: String(fee), deadline: "", validUntil: "" };
  });
  ensure(new Set(categories.map(categoryIdentity)).size === categories.length, "Hay categorías repetidas con el mismo nombre, modalidad, disciplina y división.");
  return categories;
}
