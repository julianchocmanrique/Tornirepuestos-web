import { notFound } from "next/navigation";
import { DanceApp, type View } from "../DanceApp";
export function generateStaticParams() { return ["registro", "acceso", "participante", "admin", "jurado"].map(view => ({ view })); }
export default async function Page({ params }: { params: Promise<{ view: string }> }) {
  const { view } = await params;
  if (!["registro", "acceso", "participante", "admin", "jurado"].includes(view)) notFound();
  return <DanceApp view={view as View} />;
}
