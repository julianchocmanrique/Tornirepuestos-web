import type { Metadata } from "next";

import { SeoLandingPage } from "@/components/SeoLandingPage";
import { getSeoSolutionBySlug } from "@/lib/seoSolutions";
import { DEFAULT_OG_IMAGE, absoluteUrl } from "@/lib/seo";

const solution = getSeoSolutionBySlug("crucetas-cardanes")!;

export const metadata: Metadata = {
  title: "Crucetas y cardanes",
  description: solution.summary,
  keywords: [...solution.searchTerms, ...solution.relatedSearches],
  alternates: { canonical: "/crucetas-cardanes" },
  openGraph: {
    type: "article",
    url: absoluteUrl("/crucetas-cardanes"),
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
