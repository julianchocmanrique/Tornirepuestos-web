import fs from "node:fs/promises";

import { read, utils } from "xlsx";
import { PERSONALIZED_FEATURED_CODES } from "@/lib/featuredCodes";
import { resolveCatalogPath } from "@/lib/catalogStore";

function normalizeKey(key: string) {
  return key
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function parseStockValue(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return NaN;

  const raw = value.trim();
  if (!raw) return NaN;

  const keep = raw.replace(/[^0-9,.-]/g, "");

  if (keep.includes(",") && keep.includes(".")) {
    const lastComma = keep.lastIndexOf(",");
    const lastDot = keep.lastIndexOf(".");
    if (lastComma > lastDot) {
      return Number(keep.replace(/\./g, "").replace(",", "."));
    }
    return Number(keep.replace(/,/g, ""));
  }

  if (keep.includes(",")) {
    return Number(keep.replace(/\./g, "").replace(",", "."));
  }

  return Number(keep);
}

function pickColumn(row: Record<string, unknown>, candidates: string[]) {
  const entries = Object.entries(row);
  for (const [key, value] of entries) {
    const normalized = normalizeKey(key);
    if (candidates.includes(normalized)) return value;
  }
  return undefined;
}

export async function importStockFromExcel(params: {
  fileBuffer: Buffer;
}) {
  const workbook = read(params.fileBuffer, { type: "buffer" });
  const firstSheet = workbook.SheetNames[0];
  if (!firstSheet) {
    throw new Error("El archivo no tiene hojas.");
  }

  const rows = utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[firstSheet], {
    defval: "",
  });

  if (!rows.length) {
    throw new Error("El archivo no tiene filas de datos.");
  }

  const codeCandidates = ["codigo", "code", "referencia", "sku", "item", "cod"];
  const stockCandidates = ["stock", "existencia", "cantidad", "saldo", "inventario", "disponible"];

  const stockByCode = new Map<string, number>();
  let invalidRows = 0;

  for (const row of rows) {
    const codeVal = pickColumn(row, codeCandidates);
    const stockVal = pickColumn(row, stockCandidates);

    const code = String(codeVal || "").trim();
    const stock = parseStockValue(stockVal);

    if (!code || !Number.isFinite(stock)) {
      invalidRows += 1;
      continue;
    }

    stockByCode.set(code.toUpperCase(), stock);
  }

  const catalogPath = await resolveCatalogPath();
  const catalog = JSON.parse(await fs.readFile(catalogPath, "utf8")) as Array<Record<string, unknown>>;

  let matched = 0;
  let updated = 0;
  let skippedFeatured = 0;

  for (const item of catalog) {
    const code = String(item.code || "").trim().toUpperCase();
    if (!code) continue;

    if (PERSONALIZED_FEATURED_CODES.has(code)) {
      skippedFeatured += 1;
      continue;
    }

    if (!stockByCode.has(code)) continue;

    matched += 1;
    const nextStock = stockByCode.get(code) as number;
    const prevStock = Number(item.stock || 0);

    if (prevStock !== nextStock) {
      item.stock = nextStock;
      updated += 1;
    }
  }

  await fs.writeFile(catalogPath, JSON.stringify(catalog), "utf8");

  return {
    totalRows: rows.length,
    usableRows: stockByCode.size,
    invalidRows,
    matched,
    updated,
    skippedFeatured,
    mode: "compare",
    skipFeatured: true,
  };
}
