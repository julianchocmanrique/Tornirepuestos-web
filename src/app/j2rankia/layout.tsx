import type { Metadata } from "next";
import "./baile.css";
import "./rankia.css";
export const metadata: Metadata = {
  title: { absolute: "RANKIA | Tu talento en el podio", template: "%s | RANKIA" },
  description: "Descubre eventos, registra tu talento y sigue tus competencias en RANKIA.",
  icons: { icon: "/baile/rankia-mark.svg" },
  alternates: { canonical: "/j2rankia" },
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
  openGraph: { title: "RANKIA", description: "Tu talento en el podio. Eventos, inscripciones y competencias.", url: "/j2rankia", images: [] },
  twitter: { card: "summary", title: "RANKIA", description: "Tu talento en el podio. Eventos, inscripciones y competencias.", images: [] },
};
export default function Layout({ children }: { children: React.ReactNode }) { return children; }
