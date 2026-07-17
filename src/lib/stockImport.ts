import fs from "node:fs/promises";
import path from "node:path";

import JSZip from "jszip";
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

function cleanText(value: unknown) {
  if (value === null || value === undefined) return "";
  return String(value).replace(/\s+/g, " ").trim();
}

function normalizeCode(value: unknown) {
  return cleanText(value).toUpperCase();
}

function normalizePhotoUrl(value: unknown) {
  const text = cleanText(value);
  if (!text) return "";
  if (text.startsWith("http://") || text.startsWith("https://") || text.startsWith("/")) {
    return text;
  }
  return "";
}

function buildProductName(code: string, description: string) {
  if (!description) return code;
  if (description.toUpperCase().startsWith(code.toUpperCase())) return description;
  return `${code} ${description}`;
}

function safeFileName(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function getExtension(mediaPath: string) {
  const ext = path.posix.extname(mediaPath).toLowerCase();
  if ([ ".png", ".jpg", ".jpeg", ".webp" ].includes(ext)) return ext;
  return ".png";
}

function inferKind(description: string, group: string) {
  const source = description || group || "Producto";
  return source.split(/\s+/).slice(0, 3).join(" ").toUpperCase();
}

async function extractEmbeddedImagesByRow(fileBuffer: Buffer) {
  const zip = await JSZip.loadAsync(fileBuffer);
  const result = new Map<number, { mediaPath: string; buffer: Buffer }>();
  const drawingPaths = Object.keys(zip.files)
    .filter((filePath) => /^xl\/drawings\/drawing\d+\.xml$/.test(filePath))
    .sort();

  for (const drawingPath of drawingPaths) {
    const drawingFile = zip.file(drawingPath);
    if (!drawingFile) continue;

    const relsPath = drawingPath.replace("xl/drawings/", "xl/drawings/_rels/") + ".rels";
    const relsFile = zip.file(relsPath);
    if (!relsFile) continue;

    const [drawingXml, relsXml] = await Promise.all([
      drawingFile.async("string"),
      relsFile.async("string"),
    ]);

    const rels = new Map<string, string>();
    for (const match of relsXml.matchAll(/<Relationship\b[^>]*Id="([^"]+)"[^>]*Target="([^"]+)"[^>]*>/g)) {
      const [, id, target] = match;
      const normalizedTarget = path.posix.normalize(path.posix.join(path.posix.dirname(drawingPath), target));
      rels.set(id, normalizedTarget);
    }

    for (const anchor of drawingXml.matchAll(/<xdr:oneCellAnchor\b[\s\S]*?<\/xdr:oneCellAnchor>/g)) {
      const xml = anchor[0];
      const rowMatch = xml.match(/<xdr:row>(\d+)<\/xdr:row>/);
      const embedMatch = xml.match(/r:embed="([^"]+)"/);
      if (!rowMatch || !embedMatch) continue;

      const row = Number(rowMatch[1]);
      const mediaPath = rels.get(embedMatch[1]);
      if (!mediaPath) continue;

      const mediaFile = zip.file(mediaPath);
      if (!mediaFile) continue;

      const buffer = await mediaFile.async("nodebuffer");
      result.set(row, { mediaPath, buffer });
    }
  }

  return result;
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

  const codeCandidates = [
    "codigo",
    "codigoproducto",
    "code",
    "referencia",
    "sku",
    "item",
    "cod",
  ];
  const stockCandidates = [
    "stock",
    "existencia",
    "existencias",
    "cantidad",
    "saldo",
    "inventario",
    "disponible",
  ];
  const descriptionCandidates = [
    "descripcionpagina",
    "descripcion",
    "descripcionproducto",
    "producto",
    "nombre",
    "nombreproducto",
  ];
  const brandCandidates = ["marca", "brand", "fabricante"];
  const groupCandidates = ["grupo", "categoria", "linea", "familia"];
  const equivalenceCandidates = [
    "equivalencias",
    "equivalencia",
    "referenciascruzadas",
    "referenciaequivalente",
    "equivalent",
  ];
  const photoCandidates = ["foto", "imagen", "urlfoto", "fotourl", "urlimagen", "image"];

  type ImportRow = {
    code: string;
    stock?: number;
    descriptionPage: string;
    brand: string;
    group: string;
    equivalences: string;
    photoUrl: string;
  };

  const rowsByCode = new Map<string, ImportRow>();
  const imagesByRow = await extractEmbeddedImagesByRow(params.fileBuffer);
  const imageOutputDir = path.join(process.cwd(), "public", "productos", "catalogo");
  let invalidRows = 0;
  let rowsWithProductInfo = 0;
  let extractedImages = 0;

  await fs.mkdir(imageOutputDir, { recursive: true });

  for (const [idx, row] of rows.entries()) {
    const codeVal = pickColumn(row, codeCandidates);
    const stockVal = pickColumn(row, stockCandidates);
    const descriptionPage = cleanText(pickColumn(row, descriptionCandidates));
    const brand = cleanText(pickColumn(row, brandCandidates));
    const group = cleanText(pickColumn(row, groupCandidates));
    const equivalences = cleanText(pickColumn(row, equivalenceCandidates));
    const photoUrl = normalizePhotoUrl(pickColumn(row, photoCandidates));

    const code = normalizeCode(codeVal);
    const stock = parseStockValue(stockVal);
    const hasStock = Number.isFinite(stock);
    const sheetRow = Number((row as Record<string, unknown>).__rowNum__);
    const drawingRow = Number.isFinite(sheetRow) ? sheetRow : idx + 1;
    const embeddedImage = imagesByRow.get(drawingRow);
    let finalPhotoUrl = photoUrl;

    if (code && embeddedImage) {
      const ext = getExtension(embeddedImage.mediaPath);
      const fileName = `${safeFileName(code)}${ext}`;
      await fs.writeFile(path.join(imageOutputDir, fileName), embeddedImage.buffer);
      finalPhotoUrl = `/productos/catalogo/${fileName}`;
      extractedImages += 1;
    }

    const hasProductInfo = Boolean(descriptionPage || brand || group || equivalences || finalPhotoUrl);

    if (!code || (!hasStock && !hasProductInfo)) {
      invalidRows += 1;
      continue;
    }

    if (hasProductInfo) rowsWithProductInfo += 1;

    rowsByCode.set(code, {
      code,
      stock: hasStock ? stock : undefined,
      descriptionPage,
      brand,
      group,
      equivalences,
      photoUrl: finalPhotoUrl,
    });
  }

  const catalogPath = await resolveCatalogPath();
  const catalog = JSON.parse(await fs.readFile(catalogPath, "utf8")) as Array<Record<string, unknown>>;
  const catalogByCode = new Map<string, Array<Record<string, unknown>>>();

  catalog.forEach((item) => {
    const code = normalizeCode(item.code);
    if (!code) return;
    const list = catalogByCode.get(code) || [];
    list.push(item);
    catalogByCode.set(code, list);
  });

  let matched = 0;
  let updated = 0;
  let infoUpdated = 0;
  let created = 0;
  let skippedFeatured = 0;

  for (const row of rowsByCode.values()) {
    const matchingItems = catalogByCode.get(row.code) || [];

    if (PERSONALIZED_FEATURED_CODES.has(row.code)) {
      skippedFeatured += 1;
      continue;
    }

    if (!matchingItems.length) {
      catalog.push({
        id: `spec-${row.code.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${catalog.length + 1}`,
        code: row.code,
        name: buildProductName(row.code, row.descriptionPage),
        description: row.brand
          ? `${row.brand} · ${row.group || "Producto"} · Consultar disponibilidad para cotización.`
          : `${row.group || "Producto"} · Consultar disponibilidad para cotización.`,
        groupSup: "CATALOGO PAGINA",
        groupInf: row.group ? row.group.toUpperCase() : "GENERAL",
        kind: inferKind(row.descriptionPage, row.group),
        brand: row.brand,
        equivalences: row.equivalences,
        photoUrl: row.photoUrl,
        stock: row.stock ?? 0,
        totalSales: 0,
        lastSaleDate: "",
      });
      created += 1;
      continue;
    }

    matched += 1;
    for (const item of matchingItems) {
      let changedInfo = false;

      if (row.descriptionPage) {
        const nextName = buildProductName(row.code, row.descriptionPage);
        if (item.name !== nextName) {
          item.name = nextName;
          changedInfo = true;
        }
        const nextKind = inferKind(row.descriptionPage, row.group);
        if (item.kind !== nextKind) {
          item.kind = nextKind;
          changedInfo = true;
        }
      }

      if (row.group && item.groupInf !== row.group.toUpperCase()) {
        item.groupInf = row.group.toUpperCase();
        item.groupSup = "CATALOGO PAGINA";
        changedInfo = true;
      }

      if (row.brand && item.brand !== row.brand) {
        item.brand = row.brand;
        changedInfo = true;
      }

      if (row.equivalences && item.equivalences !== row.equivalences) {
        item.equivalences = row.equivalences;
        changedInfo = true;
      }

      if (row.photoUrl && item.photoUrl !== row.photoUrl) {
        item.photoUrl = row.photoUrl;
        changedInfo = true;
      }

      if (row.brand || row.group || row.equivalences) {
        const nextDescription = [
          row.brand || cleanText(item.brand) || "",
          row.group || cleanText(item.groupInf) || "Producto",
          row.equivalences ? `Equivalencias: ${row.equivalences}` : "Inventario disponible para cotización.",
        ]
          .filter(Boolean)
          .join(" · ");
        if (item.description !== nextDescription) {
          item.description = nextDescription;
          changedInfo = true;
        }
      }

      if (row.stock !== undefined) {
        const prevStock = Number(item.stock || 0);
        if (prevStock !== row.stock) {
          item.stock = row.stock;
          updated += 1;
        }
      }

      if (changedInfo) infoUpdated += 1;
    }
  }

  await fs.writeFile(catalogPath, JSON.stringify(catalog), "utf8");

  return {
    totalRows: rows.length,
    usableRows: rowsByCode.size,
    invalidRows,
    matched,
    updated,
    infoUpdated,
    created,
    rowsWithProductInfo,
    skippedFeatured,
    extractedImages,
    mode: "compare",
    skipFeatured: true,
  };
}
