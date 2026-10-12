import { DanceApp } from "../../../../DanceApp";
export default async function Page({ params }: { params: Promise<{ eventId: string; id: string }> }) {
  const { eventId, id } = await params;
  return <DanceApp eventId={eventId} view="inscripcion" enrollmentId={id} />;
}
