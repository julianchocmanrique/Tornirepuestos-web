import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { createSessionToken, getCookieName, validateCredentials } from "@/lib/adminAuth";

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") || "";

  let username = "";
  let password = "";

  if (contentType.includes("application/json")) {
    const body = await request.json();
    username = String(body?.username || "").trim();
    password = String(body?.password || "");
  } else {
    const form = await request.formData();
    username = String(form.get("username") || "").trim();
    password = String(form.get("password") || "");
  }

  if (!validateCredentials(username, password)) {
    return NextResponse.json({ ok: false, error: "Credenciales invalidas." }, { status: 401 });
  }

  const token = createSessionToken(username);
  const cookieStore = await cookies();
  cookieStore.set(getCookieName(), token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return NextResponse.json({ ok: true });
}
