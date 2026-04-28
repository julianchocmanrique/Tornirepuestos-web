import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getCookieName, verifySessionToken } from "@/lib/adminAuth";
import { importStockFromExcel } from "@/lib/stockImport";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(getCookieName())?.value;

  if (!verifySessionToken(token)) {
    return NextResponse.json({ ok: false, error: "No autorizado." }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "Debes adjuntar un archivo Excel." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const result = await importStockFromExcel({
      fileBuffer: buffer,
    });

    return NextResponse.json({ ok: true, result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al procesar el archivo.";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
