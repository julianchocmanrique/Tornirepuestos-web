import { NextRequest, NextResponse } from "next/server";

import {
  INTERNAL_WA_MIRROR_PHONE_E164,
  WA_PREFIX,
  WHATSAPP_PHONE_E164,
  waDirect,
} from "@/lib/wa";
import { sendInternalEmailNotification } from "@/lib/internalNotifyEmail";
import { registerWaClick } from "@/lib/waStats";

const WEBHOOK_TIMEOUT_MS = 2500;

export async function GET(req: NextRequest) {
  const text = req.nextUrl.searchParams.get("text") || "";
  const finalText = WA_PREFIX + text;

  const payload = {
    at: new Date().toISOString(),
    source: "web-whatsapp-redirect",
    destinationPublic: WHATSAPP_PHONE_E164,
    destinationInternalMirror: INTERNAL_WA_MIRROR_PHONE_E164,
    path: req.nextUrl.pathname,
    query: req.nextUrl.search,
    userAgent: req.headers.get("user-agent") || "",
    referer: req.headers.get("referer") || "",
    ip:
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "",
    text: finalText,
  };

  // Registro mínimo para auditoría interna en logs del servidor.
  console.info("[WA_INTERNAL_NOTIFY]", JSON.stringify(payload));

  try {
    await registerWaClick({
      at: payload.at,
      ip: payload.ip,
      referer: payload.referer,
      userAgent: payload.userAgent,
      text: payload.text,
    });
  } catch (error) {
    console.error("[WA_STATS_ERROR]", error);
  }

  // Opcional: enviar a webhook interno (Slack, Make, Zapier, etc.)
  const webhookUrl = process.env.INTERNAL_NOTIFY_WEBHOOK_URL;
  if (webhookUrl) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT_MS);
    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
    } catch {
      // No bloqueamos el flujo al cliente si falla el aviso interno.
    } finally {
      clearTimeout(timeout);
    }
  }

  try {
    await sendInternalEmailNotification(payload);
  } catch (error) {
    // No bloqueamos el flujo al cliente si falla el correo interno.
    console.error("[WA_EMAIL_NOTIFY_ERROR]", error);
  }

  return NextResponse.redirect(waDirect(text), { status: 302 });
}
