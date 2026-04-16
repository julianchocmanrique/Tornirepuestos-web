import type { Metadata } from "next";

import { SeoLandingPage } from "@/components/SeoLandingPage";
import { getSeoSolutionBySlug } from "@/lib/seoSolutions";
import { DEFAULT_OG_IMAGE, absoluteUrl } from "@/lib/seo";

const solution = getSeoSolutionBySlug("tornillos-para-carros")!;

export const metadata: Metadata = {
  title: "Tornillos para carros",
  description: solution.summary,
  alternates: { canonical: "/tornillos-para-carros" },
  openGraph: {
    type: "article",
    url: absoluteUrl("/tornillos-para-carros"),
    title: `${solution.title} | Tornirepuestos`,
    description: solution.summary,
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: `${solution.title} | Tornirepuestos`,
    description: solution.summary,
    images: [DEFAULT_OG_IMAGE],
  },
};

export default function Page() {
  return <SeoLandingPage solution={solution} />;
}
