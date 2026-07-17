import fs from "node:fs/promises";
import path from "node:path";

import { NextRequest, NextResponse } from "next/server";

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ file: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  const { file } = await context.params;
  const safeFile = path.basename(file || "");
  const ext = path.extname(safeFile).toLowerCase();

  if (!safeFile || safeFile !== file || !CONTENT_TYPES[ext]) {
    return new NextResponse("Imagen no valida", { status: 400 });
  }

  const imagePath = path.join(process.cwd(), "public", "productos", "catalogo", safeFile);

  try {
    const image = await fs.readFile(imagePath);
    return new NextResponse(image, {
      status: 200,
      headers: {
        "Content-Type": CONTENT_TYPES[ext],
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Imagen no encontrada", { status: 404 });
  }
}
