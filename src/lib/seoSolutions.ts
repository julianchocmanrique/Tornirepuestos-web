export type SeoSolution = {
  slug: "compresor-cummins-350" | "crucetas-cardanes" | "tornillos-para-carros";
  title: string;
  h1: string;
  summary: string;
  intro: string;
  heroImage?: {
    src: string;
    alt: string;
  };
  useCases: string[];
  buyingTips: string[];
  faqs: { q: string; a: string }[];
  relatedCategorySlug: string;
  searchTerms: string[];
};

export const SEO_SOLUTIONS: SeoSolution[] = [
  {
    slug: "compresor-cummins-350",
    title: "Compresor Cummins 350",
    h1: "Compresor Cummins 350: cotización y compatibilidad",
    summary:
      "Asesoría y cotización de compresor para motores Cummins 350 en aplicaciones de vehículo pesado.",
    intro:
      "En Tornirepuestos te ayudamos a cotizar compresor Cummins 350 con validación de referencia, aplicación y tiempos de entrega. Si tienes la pieza usada, una foto o la placa, te guiamos para confirmar compatibilidad antes de comprar.",
    heroImage: {
      src: "/compresor.jpeg",
      alt: "Diagrama y corte técnico de compresor de aire Bendix Tu-Flo 750 para referencia de compresor Cummins 350.",
    },
    useCases: [
      "Reposición de compresor en camión con pérdida de presión de aire.",
      "Mantenimiento preventivo de sistema neumático en flotas.",
      "Cambio por desgaste, fuga o bajo rendimiento del compresor.",
    ],
    buyingTips: [
      "Comparte código de motor y foto de la pieza actual.",
      "Confirma conexiones, medidas y posición de montaje.",
      "Indica ciudad de destino para tiempo real de entrega.",
    ],
    faqs: [
      {
        q: "¿Cómo saber si el compresor aplica para mi Cummins 350?",
        a: "Validamos por referencia, foto y configuración de montaje para confirmar compatibilidad.",
      },
      {
        q: "¿Tienen envío a otras ciudades?",
        a: "Sí, hacemos envíos a nivel nacional según disponibilidad y transportadora.",
      },
    ],
    relatedCategorySlug: "motor",
    searchTerms: ["compresor cummins 350", "compresor de aire cummins", "repuesto cummins 350"],
  },
  {
    slug: "crucetas-cardanes",
    title: "Crucetas y cardanes",
    h1: "Crucetas y cardanes para camión y bus",
    summary:
      "Cotiza crucetas y cardanes con asesoría de medidas, referencia y aplicación por tipo de transmisión.",
    intro:
      "Manejamos crucetas y componentes de cardán para trabajo pesado. Te apoyamos a identificar el repuesto correcto por medida, referencia o muestra física para evitar vibración y desgaste prematuro.",
    useCases: [
      "Reposición por juego excesivo en transmisión.",
      "Mantenimiento por vibración en carretera.",
      "Cambio por desgaste en flotas de carga y buses.",
    ],
    buyingTips: [
      "Envía medida exacta de copa y ancho total.",
      "Comparte foto de la cruceta o cardán retirado.",
      "Indica modelo y configuración del vehículo.",
    ],
    faqs: [
      {
        q: "¿Qué datos necesitan para cotizar una cruceta?",
        a: "Medidas, foto y aplicación del vehículo. Con eso te damos opción compatible.",
      },
      {
        q: "¿Pueden ayudar con equivalencias?",
        a: "Sí, trabajamos equivalencias por marca y referencia para acelerar la compra.",
      },
    ],
    relatedCategorySlug: "transmision",
    searchTerms: ["crucetas y cardanes", "cruceta cardan camión", "repuestos transmisión pesada"],
  },
  {
    slug: "tornillos-para-carros",
    title: "Tornillos para carros",
    h1: "Tornillos para carros: medidas y tipos de fijación",
    summary:
      "Cotiza tornillos para carros y aplicaciones automotrices con guía por medida, paso y resistencia.",
    intro:
      "Te ayudamos a seleccionar tornillos para carros según tipo de rosca, longitud y uso. Si no tienes referencia, puedes enviar foto y medidas para proponer una opción adecuada para tu aplicación.",
    useCases: [
      "Fijación de piezas de carrocería y estructura.",
      "Reposición de tornillería en mantenimiento general.",
      "Aplicaciones de taller en frenos, suspensión y montaje.",
    ],
    buyingTips: [
      "Confirma diámetro, largo y paso de rosca.",
      "Indica grado de resistencia requerido.",
      "Valida si la aplicación necesita tratamiento anticorrosión.",
    ],
    faqs: [
      {
        q: "¿Venden tornillos por unidad o por paquete?",
        a: "Manejamos disponibilidad según referencia y presentación de inventario.",
      },
      {
        q: "¿Cómo identifico la medida correcta?",
        a: "Con diámetro, largo y paso de rosca podemos ayudarte a definir el tornillo adecuado.",
      },
    ],
    relatedCategorySlug: "tornilleria",
    searchTerms: ["tornillos para carros", "tornillería automotriz", "pernos para vehículo"],
  },
];

export function getSeoSolutionBySlug(slug: string) {
  return SEO_SOLUTIONS.find((item) => item.slug === slug) || null;
}
