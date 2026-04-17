import type { Metadata } from "next";

import { SeoLandingPage } from "@/components/SeoLandingPage";
import { getSeoSolutionBySlug } from "@/lib/seoSolutions";
import { DEFAULT_OG_IMAGE, absoluteUrl } from "@/lib/seo";

const solution = getSeoSolutionBySlug("compresor")!;

export const metadata: Metadata = {
  title: "Compresor Cummins 350",
  description: solution.summary,
  keywords: [...solution.searchTerms, ...solution.relatedSearches],
  alternates: { canonical: "/compresor" },
  openGraph: {
    type: "article",
    url: absoluteUrl("/compresor"),
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
