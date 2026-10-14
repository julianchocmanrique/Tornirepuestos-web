import { notFound } from "next/navigation";
import { DanceApp, type View } from "../../../DanceApp";
export default async function Page({ params }: { params: Promise<{ eventId: string; view: string }> }) {
  const { eventId, view } = await params;
  if (!["registro", "acceso", "participante", "admin", "contratista", "resultados", "jurado"].includes(view)) notFound();
  return <DanceApp eventId={eventId} view={view as View} />;
}
