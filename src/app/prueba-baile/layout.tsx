import type { Metadata } from "next";
import "./baile.css";
export const metadata: Metadata = {
  title: { absolute: "Ritmo Caribe | Inscripciones y competencia", template: "%s | Ritmo Caribe" },
  description: "Inscripciones, categorías y competencia de baile. Evento de ejemplo.",
  alternates: { canonical: "/prueba-baile" },
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
  openGraph: { title: "Ritmo Caribe", description: "Tu talento tiene escenario. Plataforma de competencia de baile.", url: "/prueba-baile", images: [] },
  twitter: { card: "summary", title: "Ritmo Caribe", description: "Plataforma de competencia de baile.", images: [] },
};
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
