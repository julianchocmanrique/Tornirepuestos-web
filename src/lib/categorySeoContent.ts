type CategorySeoBlock = {
  relatedTerms: string[];
  inventoryHighlights: string[];
  commonSearches: string[];
};

export const categorySeoContent: Record<string, CategorySeoBlock> = {
  frenos: {
    relatedTerms: ["bandas 4515", "bandas 4707", "bloques de freno perforados", "componentes de freno pesado"],
    inventoryHighlights: [
      "Bloque 4515X perforado",
      "Bloque 4707X perforado",
      "Bloque 4720 STD perforado",
      "Bloque 4515 STD perforado",
      "Bloque 4719 STD perforado",
    ],
    commonSearches: ["repuestos frenos para tractomula", "bandas freno 4515", "frenos para bus pesado"],
  },
  filtracion: {
    relatedTerms: ["filtro de aceite", "filtro ACPM", "filtro separador de agua", "filtro de aire pesado"],
    inventoryHighlights: [
      "Filtro aceite LF14000",
      "Filtro ACPM A-23",
      "Filtro trampa FS19765",
      "Filtro combustible gasolina/ACPM GF-81",
      "Filtro aire Donaldson P613336",
    ],
    commonSearches: ["filtro aceite cummins", "filtro separador agua diesel", "filtros para camión"],
  },
  suspension: {
    relatedTerms: ["buje tensor", "buje balancín", "componentes de suspensión pesada", "soportería de carga"],
    inventoryHighlights: [
      "Buje tensor 0018NAL",
      "Buje tensor TRB6326",
      "Rin disco 22.5 SHT224H",
      "Buje balancín 0026NAL",
      "Buje leva estriado BUJE-0002NAL",
    ],
    commonSearches: ["buje tensor para tractocamión", "suspensión para bus", "soportes de suspensión pesada"],
  },
  motor: {
    relatedTerms: ["orings de inyector", "sellos de válvula", "guías de válvula", "repuestos motor diésel"],
    inventoryHighlights: [
      "Cono arandela inyector INYEC-2",
      "Oring inyector FP-193736",
      "Sellos válvula 23523930",
      "Válvula escape VS4305",
      "Guía válvula 3006456",
    ],
    commonSearches: ["orings inyector cummins", "sellos de válvula detroit", "repuestos motor N14"],
  },
  "electricos-y-luces": {
    relatedTerms: ["bombillos 12V", "stops 4 pulgadas", "conectividad eléctrica pesada", "cableado automotriz"],
    inventoryHighlights: [
      "Bombillo 12V 158",
      "Bombillo 12V 1034",
      "Stop 4 pulgadas pasta roja S405A-PR",
      "Lámpara lateral L106PA",
      "Cable #16 procable",
    ],
    commonSearches: ["stops para bus 12v 24v", "bombillos para camión", "cable eléctrico automotriz pesado"],
  },
  transmision: {
    relatedTerms: ["crucetas y cardanes", "planetarios", "orings divisor", "componentes de caja pesada"],
    inventoryHighlights: [
      "Arandela bronce divisor 1229S4985",
      "Planetario 2234H1438",
      "Filtro divisor A-3380W1687",
      "Oring divisor 5X1343",
      "Arandela satélite 1229K3001",
    ],
    commonSearches: ["repuestos transmisión meritor", "crucetas para tractomula", "repuestos divisor rokwell"],
  },
  "rodamientos-y-retenedores": {
    relatedTerms: ["balineras", "retenedores de rueda", "reten trailer", "kits de rodamiento"],
    inventoryHighlights: [
      "Balinera 6203",
      "Balinera 6303",
      "Retenedor rueda trasera 370003",
      "Reten trailer 370065",
      "Retenedor viga 476424",
    ],
    commonSearches: ["rodamientos para carga pesada", "retenedor rueda trailer", "balinera 6203 para camión"],
  },
  "mangueras-y-racoreria": {
    relatedTerms: ["manguera sinflex", "manguera caucho lona", "racores y punteras", "abrazaderas inoxidables"],
    inventoryHighlights: [
      "Manguera sinflex 1/4",
      "Manguera caucho lona 3/8",
      "Puntera/inserto 1/4",
      "Anillo 1/4 B60",
      "Abrazadera sencilla 5/8",
    ],
    commonSearches: ["manguera sinflex para aire", "racores para freno de aire", "abrazaderas para manguera pesada"],
  },
  "lubricantes-y-grasas": {
    relatedTerms: ["aceite 15W40", "grasa de litio", "hidráulico ISO 68", "aditivos para motor diésel"],
    inventoryHighlights: [
      "Aceite 15W40 pimpiná",
      "Aceite 15W40 galón",
      "Grasa fibra verde 330g",
      "Hidráulico ISO 68",
      "Grasa de litio 370g",
    ],
    commonSearches: ["aceite 15w40 para flota", "grasa para rodamientos pesados", "hidráulico iso 68 camión"],
  },
  tornilleria: {
    relatedTerms: ["arandela plana", "varilla roscada", "tornillería industrial", "tornillería automotriz pesada"],
    inventoryHighlights: [
      "Arandela plana 5/16",
      "Arandela plana 3/8",
      "Arandela plana 1/4",
      "Varilla roscada 5/16",
      "Varilla roscada 1/2",
    ],
    commonSearches: ["tornillería para chasis", "arandelas industriales", "varilla roscada para taller"],
  },
  herramientas: {
    relatedTerms: ["cinta teflón", "boquilla engrasadora", "consumibles de taller", "herramienta para mantenimiento"],
    inventoryHighlights: [
      "Cable duplex 2x16",
      "Cinta teflón 1/2",
      "Guantes tipo ingeniero",
      "Boquilla engrasadora industrial",
      "Cepillo de acero",
    ],
    commonSearches: ["herramientas para taller diésel", "consumibles para mecánica pesada", "cinta teflón industrial"],
  },
  diferenciales: {
    relatedTerms: ["componentes de diferencial", "planetarios y satélites", "retenedores y orings", "tracción pesada"],
    inventoryHighlights: [
      "Arandelas de transmisión y diferencial",
      "Orings divisor rokwell",
      "Componentes planetarios",
      "Kits para mantenimiento de diferencial",
      "Sellos para aplicaciones de carga pesada",
    ],
    commonSearches: ["repuestos diferencial camión", "partes rokwell meritor", "kit diferencial tractomula"],
  },
};

export function getCategorySeoContent(slug: string): CategorySeoBlock {
  return (
    categorySeoContent[slug] || {
      relatedTerms: ["repuestos pesados", "buses y maquinaria", "compatibilidad por referencia"],
      inventoryHighlights: ["Asesoría por referencia", "Disponibilidad por inventario", "Cotización rápida por WhatsApp"],
      commonSearches: ["repuestos para vehículo pesado", "cotizar repuestos por WhatsApp", "repuestos en Santa Marta"],
    }
  );
}
