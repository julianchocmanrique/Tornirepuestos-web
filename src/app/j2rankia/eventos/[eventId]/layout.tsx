import { notFound } from "next/navigation";
import { findRegisteredEvent as findEvent } from "@/lib/baile/event-registry";
import { readState } from "@/lib/baile/store";
import { withEvent } from "@/lib/baile/event-scope";
import "../../event-pages.css";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function EventLayout({ children, params }: { children: React.ReactNode; params: Promise<{ eventId: string }> }) {
  const event = findEvent((await params).eventId);
  if (!event || (event.demo && !withEvent(undefined, () => readState().settings.demo))) notFound();
  return children;
}
