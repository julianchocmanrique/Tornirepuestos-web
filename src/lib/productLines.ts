import { categories, getCategoryBySlug } from "@/lib/categories";

export type ProductLine = {
  slug: string;
  title: string;
  kicker: string;
  summary: string;
  catalogQuery: string;
  categorySlug: string;
  applications: string[];
  includes: string[];
  compatibility: string[];
  quoteData: string[];
  seoIntro: string;
};

const extraBySlug: Record<string, Omit<ProductLine, "slug" | "title" | "kicker" | "categorySlug">> = {
  frenos: {
    summary:
      "Repuestos para sistemas de freno en camiones, buses y maquinaria: piezas neumáticas, componentes de desgaste y accesorios para mantenimiento correctivo o preventivo.",
    catalogQuery: "freno",
    applications: ["Camiones de carga", "Buses urbanos e intermunicipales", "Tractocamiones", "Maquinaria de trabajo pesado"],
    includes: ["Válvulas de freno", "Cámaras y diafragmas", "Discos, bandas y pastillas", "Sensores, racores y accesorios"],
    compatibility: ["Tipo de sistema neumático", "Medida o referencia de la pieza", "Eje delantero o trasero", "Aplicación del vehículo"],
    quoteData: ["Foto de la pieza instalada", "Referencia visible", "Placa o modelo del vehículo", "Ciudad destino"],
    seoIntro:
      "En frenos trabajamos referencias para vehículos pesados que necesitan seguridad, respuesta y disponibilidad. Te ayudamos a validar medidas, aplicación y compatibilidad antes de cotizar.",
  },
  filtracion: {
    summary:
      "Filtros para mantenimiento de motor y protección de sistemas: aceite, aire, combustible y separadores para operación diaria.",
    catalogQuery: "filtro",
    applications: ["Motores diésel", "Camiones de reparto", "Buses", "Equipos de ruta y taller"],
    includes: ["Filtro de aceite", "Filtro de aire", "Filtro de combustible", "Separadores y kits de mantenimiento"],
    compatibility: ["Referencia del filtro", "Modelo del motor", "Medidas del elemento", "Intervalo o tipo de mantenimiento"],
    quoteData: ["Código del filtro", "Foto de la referencia", "Marca o motor", "Cantidad requerida"],
    seoIntro:
      "La filtración correcta protege el motor, reduce contaminación interna y ayuda a mantener el rendimiento. Cotizamos por referencia, medidas o aplicación.",
  },
  suspension: {
    summary:
      "Componentes de suspensión rígida y neumática para estabilidad, carga, confort y control del vehículo.",
    catalogQuery: "suspension",
    applications: ["Suspensión rígida", "Suspensión neumática", "Vehículos de carga", "Buses y maquinaria"],
    includes: ["Amortiguadores", "Bolsas de aire", "Bujes", "Hojas de muelle y accesorios"],
    compatibility: ["Tipo de suspensión", "Eje o posición", "Medida de la pieza", "Capacidad de carga"],
    quoteData: ["Foto del montaje", "Medida o referencia", "Tipo de vehículo", "Uso: ruta, ciudad o carga"],
    seoIntro:
      "En suspensión revisamos aplicación y posición para evitar piezas incompatibles. La idea es cotizar el repuesto correcto para carga, estabilidad y durabilidad.",
  },
  motor: {
    summary:
      "Repuestos y consumibles de motor para mantenimiento preventivo, sellado, reparación y soporte técnico de compatibilidad.",
    catalogQuery: "motor",
    applications: ["Motores diésel", "Camiones", "Buses", "Maquinaria amarilla y agrícola"],
    includes: ["Sellos", "Empaques", "Sensores", "Consumibles y accesorios"],
    compatibility: ["Modelo del motor", "Referencia técnica", "Medida del sello o empaque", "Aplicación del repuesto"],
    quoteData: ["Referencia", "Foto de la pieza", "Modelo de motor", "Cantidad"],
    seoIntro:
      "Para motor es clave validar referencia y aplicación. Ayudamos a identificar sellos, empaques, sensores y consumibles según la información disponible.",
  },
  "electricos-y-luces": {
    summary:
      "Iluminación, conectores, cableado y componentes eléctricos para seguridad, señalización y mantenimiento.",
    catalogQuery: "luz electrico conector sensor",
    applications: ["Camiones", "Buses", "Remolques", "Instalaciones de taller"],
    includes: ["Stops y farolas", "Bombillos", "Conectores", "Sensores y relés"],
    compatibility: ["Voltaje", "Tipo de conector", "Posición de instalación", "Referencia o forma"],
    quoteData: ["Foto frontal y trasera", "Voltaje", "Cantidad", "Ubicación de instalación"],
    seoIntro:
      "Los repuestos eléctricos deben coincidir en voltaje, conexión y forma. Cotizamos iluminación y accesorios para operación segura en ruta.",
  },
  transmision: {
    summary:
      "Componentes de transmisión para torque, fuerza y movimiento: crucetas, cardanes, caja, acoples y accesorios.",
    catalogQuery: "cruceta cardan transmision",
    applications: ["Tractocamiones", "Camiones rígidos", "Buses", "Sistemas de transmisión pesada"],
    includes: ["Crucetas", "Cardanes", "Componentes de caja", "Acoples y kits"],
    compatibility: ["Medida de cruceta", "Largo o acople del cardán", "Referencia de caja", "Aplicación del vehículo"],
    quoteData: ["Medidas", "Foto de la pieza", "Referencia", "Tipo de transmisión"],
    seoIntro:
      "En transmisión priorizamos medidas y aplicación. La validación correcta evita vibraciones, desgaste prematuro y paradas por repuesto incorrecto.",
  },
  "rodamientos-y-retenedores": {
    summary:
      "Rodamientos, retenes y kits para reducir desgaste, vibración y fugas en conjuntos de trabajo pesado.",
    catalogQuery: "rodamiento reten",
    applications: ["Ejes", "Mazas", "Diferenciales", "Conjuntos mecánicos"],
    includes: ["Rodamientos", "Retenes", "Kits por eje", "Accesorios de montaje"],
    compatibility: ["Diámetro interno y externo", "Ancho", "Referencia grabada", "Aplicación"],
    quoteData: ["Medidas", "Referencia", "Foto", "Cantidad"],
    seoIntro:
      "Los rodamientos y retenedores requieren precisión en medida y referencia. Te ayudamos a confirmar el repuesto antes de comprar.",
  },
  "mangueras-y-racoreria": {
    summary:
      "Mangueras, racores, abrazaderas y conexiones para aire, servicio y mantenimiento de sistemas auxiliares.",
    catalogQuery: "manguera racor abrazadera",
    applications: ["Sistemas de aire", "Taller", "Camiones", "Buses y maquinaria"],
    includes: ["Mangueras", "Racores", "Abrazaderas", "Conectores y tubos"],
    compatibility: ["Diámetro", "Presión", "Tipo de conexión", "Material"],
    quoteData: ["Medida", "Foto", "Tipo de conexión", "Cantidad"],
    seoIntro:
      "En conexiones es importante validar diámetro, presión y tipo de racor. Cotizamos opciones para reparaciones rápidas y seguras.",
  },
  "lubricantes-y-grasas": {
    summary:
      "Aceites, grasas y aditivos para protección de motor, transmisión, sistemas hidráulicos y componentes de trabajo pesado.",
    catalogQuery: "aceite grasa lubricante aditivo",
    applications: ["Motor", "Transmisión", "Sistemas hidráulicos", "Mantenimiento de taller"],
    includes: ["Aceites", "Grasas", "Aditivos", "Refrigerantes y fluidos"],
    compatibility: ["Especificación", "Viscosidad", "Uso del equipo", "Marca o recomendación técnica"],
    quoteData: ["Especificación", "Cantidad", "Aplicación", "Ciudad destino"],
    seoIntro:
      "La lubricación correcta ayuda a proteger componentes de alto desgaste. Te orientamos por especificación, aplicación y disponibilidad.",
  },
  tornilleria: {
    summary:
      "Tornillos, tuercas, arandelas y fijación para vehículos, taller, carrocería, montaje y mantenimiento automotriz.",
    catalogQuery: "tornillo tuerca arandela perno",
    applications: ["Taller automotriz", "Camiones", "Carrocería", "Montaje y fijación"],
    includes: ["Tornillos", "Tuercas", "Arandelas", "Pernos y fijaciones"],
    compatibility: ["Medida", "Paso de rosca", "Grado o resistencia", "Largo"],
    quoteData: ["Muestra o foto", "Medida", "Cantidad", "Uso"],
    seoIntro:
      "En tornillería el detalle manda: medida, paso, largo y resistencia. Cotizamos piezas para uso real de taller y vehículos.",
  },
  herramientas: {
    summary:
      "Herramientas y consumibles para soporte de taller, mantenimiento, montaje y servicio de vehículos pesados.",
    catalogQuery: "herramienta llave dado",
    applications: ["Taller", "Mantenimiento preventivo", "Montaje", "Servicio en ruta"],
    includes: ["Herramienta manual", "Dados", "Accesorios", "Consumibles de taller"],
    compatibility: ["Tipo de trabajo", "Medida", "Uso frecuente", "Disponibilidad"],
    quoteData: ["Nombre de herramienta", "Medida", "Cantidad", "Uso esperado"],
    seoIntro:
      "También apoyamos necesidades de taller con herramientas y consumibles para mantenimiento rápido y trabajo diario.",
  },
  diferenciales: {
    summary:
      "Repuestos para diferencial y transmisión final, enfocados en carga, tracción, torque y durabilidad.",
    catalogQuery: "diferencial",
    applications: ["Transmisión final", "Ejes de carga", "Camiones", "Tractocamiones"],
    includes: ["Componentes de diferencial", "Kits", "Retenes", "Accesorios"],
    compatibility: ["Referencia", "Tipo de eje", "Aplicación", "Medida"],
    quoteData: ["Foto", "Referencia", "Vehículo", "Cantidad"],
    seoIntro:
      "En diferenciales validamos aplicación y referencia para cotizar componentes compatibles con carga y tracción.",
  },
};

export const productLines: ProductLine[] = categories.map((category) => {
  const extra = extraBySlug[category.slug];
  return {
    slug: category.slug,
    title: category.title,
    kicker: category.kicker,
    categorySlug: category.slug,
    ...extra,
  };
});

export function getProductLineBySlug(slug: string) {
  return productLines.find((line) => line.slug === slug) || null;
}

export function getProductLineImage(slug: string) {
  return getCategoryBySlug(slug)?.img || "/categories/motor-bg-lab.png";
}
