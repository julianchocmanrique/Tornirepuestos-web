import { SITE_URL } from "@/lib/seo";

export function GlobalSeoSchema() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: "Tornirepuestos",
        url: SITE_URL,
        logo: `${SITE_URL}/tornirepuestos.jpeg`,
        contactPoint: [
          {
            "@type": "ContactPoint",
            telephone: "+57 310 653 1208",
            contactType: "customer service",
            availableLanguage: ["Spanish"],
            areaServed: "CO",
          },
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: "Tornirepuestos",
        inLanguage: "es-CO",
        publisher: {
          "@id": `${SITE_URL}/#organization`,
        },
        potentialAction: {
          "@type": "SearchAction",
          target: `${SITE_URL}/catalogo?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "AutoPartsStore",
        "@id": `${SITE_URL}/#store`,
        name: "Tornirepuestos",
        url: SITE_URL,
        image: `${SITE_URL}/tornirepuestos.jpeg`,
        telephone: "+57 310 653 1208",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Calle 30 N 60-250",
          addressLocality: "Santa Marta",
          addressCountry: "CO",
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
