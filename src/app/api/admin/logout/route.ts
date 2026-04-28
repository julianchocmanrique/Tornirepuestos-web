import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getCookieName } from "@/lib/adminAuth";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(getCookieName());
  return NextResponse.json({ ok: true });
}
