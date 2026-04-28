import fs from "node:fs/promises";
import path from "node:path";

import type { CatalogItem } from "@/components/CatalogSearchGrid";

const PUBLIC_CATALOG_RELATIVE = path.join("public", "data", "inventory-catalog.json");
const SRC_CATALOG_RELATIVE = path.join("src", "data", "inventory-catalog.json");

async function fileExists(filePath: string) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function resolveCatalogPath() {
  const cwd = process.cwd();
  const publicPath = path.join(cwd, PUBLIC_CATALOG_RELATIVE);
  const srcPath = path.join(cwd, SRC_CATALOG_RELATIVE);

  if (await fileExists(publicPath)) return publicPath;

  if (await fileExists(srcPath)) {
    await fs.mkdir(path.dirname(publicPath), { recursive: true });
    await fs.copyFile(srcPath, publicPath);
    return publicPath;
  }

  throw new Error(
    `No se encontro inventario-catalog.json en rutas esperadas: ${publicPath} o ${srcPath}`
  );
}

export async function readCatalogItems(): Promise<CatalogItem[]> {
  const catalogPath = await resolveCatalogPath();
  const raw = await fs.readFile(catalogPath, "utf8");
  return JSON.parse(raw) as CatalogItem[];
}

export async function writeCatalogItems(items: CatalogItem[]) {
  const catalogPath = await resolveCatalogPath();
  await fs.writeFile(catalogPath, JSON.stringify(items), "utf8");
}
