export type SeoSolution = {
  slug: "compresor" | "crucetas-cardanes" | "tornillos-para-carros";
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
  longIntro: string[];
  symptoms: string[];
  compatibilityChecklist: string[];
  processSteps: { title: string; description: string }[];
  serviceCoverage: string[];
  contentBlocks: { title: string; paragraphs: string[]; bullets: string[] }[];
  faqs: { q: string; a: string }[];
  relatedCategorySlug: string;
  searchTerms: string[];
  relatedSearches: string[];
};

export const SEO_SOLUTIONS: SeoSolution[] = [
  {
    slug: "compresor",
    title: "Compresor Cummins 350",
    h1: "Compresor Cummins 350: cotización, diagnóstico y compatibilidad",
    summary:
      "Asesoría y cotización de compresor para motores Cummins 350 en camiones, buses y maquinaria con validación de referencia y aplicación real.",
    intro:
      "En Tornirepuestos te ayudamos a cotizar compresor Cummins 350 con validación de referencia, aplicación y tiempos de entrega. Si tienes la pieza usada, una foto o la placa, te guiamos para confirmar compatibilidad antes de comprar.",
    heroImage: {
      src: "/compresor.jpeg",
      alt: "Diagrama técnico de compresor de aire Bendix Tu-Flo 750, usado como referencia para compatibilidad en motores Cummins 350.",
    },
    useCases: [
      "Reposición de compresor en camión con baja presión de aire en el sistema neumático.",
      "Mantenimiento preventivo de flotas que requieren disponibilidad continua.",
      "Cambio de compresor por fuga interna, desgaste o rendimiento inestable.",
      "Intervención en sistema de frenos de aire y accesorios neumáticos.",
    ],
    buyingTips: [
      "Comparte código de motor, referencia de compresor y foto de la pieza actual.",
      "Confirma conexiones de aire y agua para evitar devoluciones por diferencia de versión.",
      "Valida posición de montaje, tipo de polea y sentido de trabajo.",
      "Indica ciudad destino y urgencia para coordinar envío y disponibilidad.",
    ],
    longIntro: [
      "Buscar compresor Cummins 350 no es solo comprar una pieza por nombre. En campo, muchos equipos comparten denominación comercial, pero cambian en conexiones, configuración de descarga y medidas de montaje. Por eso en Tornirepuestos trabajamos con un proceso de validación técnica que reduce errores y acelera la instalación.",
      "Esta página está pensada para talleres, transportadores y encargados de mantenimiento que necesitan una decisión rápida y segura. Si tu unidad presenta pérdida de presión de aire, tiempos largos de llenado o consumo de aceite en el sistema neumático, una revisión del compresor y sus accesorios suele ser parte clave del diagnóstico.",
      "Nuestro enfoque combina inventario real, revisión por referencia y apoyo por WhatsApp para confirmar que el repuesto sí corresponde a tu aplicación. Así evitas compras por ensayo y error y minimizas tiempo detenido del vehículo.",
    ],
    symptoms: [
      "El sistema tarda más de lo normal en recuperar presión de trabajo.",
      "Baja presión recurrente en frenos de aire durante operación continua.",
      "Presencia de aceite o humedad excesiva en líneas neumáticas.",
      "Ruidos mecánicos en zona de compresor, polea o acople.",
      "Incremento de temperatura o fugas en conexiones de agua del cabezote.",
      "Activación frecuente de alarmas neumáticas en tablero.",
    ],
    compatibilityChecklist: [
      "Referencia visible en la placa del compresor o en documentación del motor.",
      "Fotos claras de frente, lateral, base y conexiones.",
      "Tipo de aplicación: camión, tractomula, bus o maquinaria.",
      "Configuración de entrada/salida de aire y paso de refrigeración.",
      "Confirmación de kit de instalación: empaques, sellos y tornillería.",
      "Verificación de accesorios asociados: gobernador, líneas y secador.",
    ],
    processSteps: [
      {
        title: "Envío de datos por WhatsApp",
        description:
          "Nos compartes referencia, foto, placa o síntoma principal para abrir la validación técnica.",
      },
      {
        title: "Cruce de compatibilidad",
        description:
          "Revisamos versión del compresor, conexiones y aplicación real para confirmar equivalencia correcta.",
      },
      {
        title: "Cotización clara",
        description:
          "Te enviamos disponibilidad, alternativas y tiempos estimados de entrega según ciudad.",
      },
      {
        title: "Despacho y seguimiento",
        description:
          "Coordinamos envío y te acompañamos con recomendaciones básicas de montaje y revisión posterior.",
      },
    ],
    serviceCoverage: [
      "Atención técnica para Santa Marta y despacho a nivel nacional.",
      "Soporte para talleres independientes, flotas y empresas de transporte.",
      "Cotización prioritaria para unidades detenidas por falla neumática.",
      "Acompañamiento para equivalencias cuando la referencia no es legible.",
      "Orientación sobre cambio preventivo para reducir paradas no programadas.",
      "Canal directo de WhatsApp para seguimiento de cotización.",
    ],
    contentBlocks: [
      {
        title: "Qué revisar junto al compresor en una intervención completa",
        paragraphs: [
          "Cuando se reemplaza un compresor en Cummins 350, no siempre el problema termina en la pieza principal. Es recomendable revisar condición de líneas, estado del secador de aire y comportamiento del gobernador. Si estos componentes quedan fuera de revisión, la falla puede regresar en poco tiempo.",
          "También es importante validar calidad del aceite, condición de enfriamiento y limpieza del sistema neumático. Un compresor nuevo trabajando con contaminación previa puede perder rendimiento prematuramente. Por eso insistimos en una intervención integral orientada a confiabilidad y no solo a reemplazo puntual.",
        ],
        bullets: [
          "Revisión de secador y purga del sistema.",
          "Inspección de líneas de aire, fugas y mangueras críticas.",
          "Verificación de presión de corte y carga del gobernador.",
          "Chequeo de temperatura y flujo de refrigeración en cabezote.",
        ],
      },
      {
        title: "Cuándo conviene mantenimiento preventivo y no correctivo",
        paragraphs: [
          "Esperar la falla total del compresor suele generar costos más altos por inmovilización del vehículo. En operación de carga o pasajeros, una parada no programada impacta producción y cumplimiento. Por eso recomendamos revisar síntomas tempranos y planear reemplazo antes de una avería mayor.",
          "Si tu operación es de alta exigencia, llevar historial de horas, rutas y consumo del sistema neumático ayuda a anticipar mantenimiento. Con esta información podemos orientarte mejor sobre la opción de repuesto y el momento más conveniente para intervenir.",
        ],
        bullets: [
          "Menor riesgo de inmovilización en carretera.",
          "Mejor control de costos por mantenimiento programado.",
          "Mayor vida útil de componentes neumáticos asociados.",
        ],
      },
    ],
    faqs: [
      {
        q: "¿Cómo saber si el compresor aplica para mi Cummins 350?",
        a: "Validamos por referencia, foto y configuración de montaje para confirmar compatibilidad antes de facturar.",
      },
      {
        q: "¿Necesitan la pieza desmontada para cotizar?",
        a: "No siempre. Con fotos claras y datos del motor podemos avanzar en la mayoría de casos.",
      },
      {
        q: "¿Manejan envío fuera de Santa Marta?",
        a: "Sí, despachamos a diferentes ciudades de Colombia según transportadora y disponibilidad.",
      },
      {
        q: "¿Pueden cotizar con número de parte incompleto?",
        a: "Sí. Si la referencia está parcial, usamos fotos y aplicación para buscar equivalentes compatibles.",
      },
      {
        q: "¿También venden kits de instalación?",
        a: "Según referencia, podemos incluir recomendaciones de sellos, empaques y accesorios para montaje seguro.",
      },
      {
        q: "¿Cuánto tarda una cotización técnica?",
        a: "Normalmente se responde por WhatsApp en el menor tiempo posible con opciones y disponibilidad real.",
      },
    ],
    relatedCategorySlug: "motor",
    searchTerms: [
      "compresor cummins 350",
      "compresor de aire cummins",
      "repuesto cummins 350",
      "compresor bendix tu flo 750",
      "compresor para camión cummins",
    ],
    relatedSearches: [
      "falla compresor de aire cummins 350",
      "precio compresor de aire para camión",
      "compresor bendix tu flo 750 compatibilidad",
      "repuesto sistema neumático camión",
      "compresor de frenos de aire cummins",
      "cotizar compresor cummins por whatsapp",
      "compresor para tractomula en colombia",
      "mantenimiento compresor neumático pesado",
    ],
  },
  {
    slug: "crucetas-cardanes",
    title: "Crucetas y cardanes",
    h1: "Crucetas y cardanes para camión y bus: medidas, diagnóstico y cotización",
    summary:
      "Cotiza crucetas y cardanes con asesoría de medidas, referencia y aplicación por tipo de transmisión para trabajo pesado.",
    intro:
      "Manejamos crucetas y componentes de cardán para trabajo pesado. Te apoyamos a identificar el repuesto correcto por medida, referencia o muestra física para evitar vibración y desgaste prematuro en la transmisión.",
    useCases: [
      "Reposición por juego excesivo en crucetas de transmisión.",
      "Mantenimiento por vibración en ruta a diferentes velocidades.",
      "Cambio de componentes de cardán en flotas de carga y buses.",
      "Corrección por ruido mecánico en salida de caja o diferencial.",
    ],
    buyingTips: [
      "Envía medida exacta de copa y ancho total de la cruceta.",
      "Comparte foto de la pieza retirada y del alojamiento.",
      "Indica modelo del vehículo y tipo de trabajo que realiza.",
      "Confirma si requiere grasera, sello especial o versión reforzada.",
    ],
    longIntro: [
      "Las crucetas y cardanes trabajan bajo carga, vibración y cambios constantes de torque. Una selección incorrecta puede generar desgaste acelerado en transmisión, soporte central y diferencial. Por eso la validación por medida y aplicación es clave para evitar costos repetidos.",
      "En Tornirepuestos atendemos casos de mantenimiento preventivo y correctivo para transporte pesado. Si detectas vibración, ruido o holgura, podemos ayudarte a identificar la referencia más conveniente para tu vehículo y condiciones de uso.",
      "Nuestro proceso está orientado a taller y flota: recibimos información técnica, confirmamos compatibilidad y enviamos cotización con opciones disponibles. El objetivo es que montes la pieza correcta desde la primera intervención.",
    ],
    symptoms: [
      "Vibración en cabina o chasis al acelerar o desacelerar.",
      "Golpeteo metálico al hacer cambios de carga en transmisión.",
      "Holgura detectable en cruceta al inspeccionar cardán.",
      "Ruido continuo en trayectos largos o bajo carga alta.",
      "Desgaste irregular en componentes asociados de la línea de transmisión.",
      "Fugas o pérdida de grasa en puntos críticos.",
    ],
    compatibilityChecklist: [
      "Diámetro de copa y ancho de cruceta tomados con precisión.",
      "Tipo de retenedor y sistema de fijación del vehículo.",
      "Confirmación de posición: delantera, intermedia o trasera.",
      "Revisión de estado del yugo y alineación del cardán.",
      "Datos de vehículo: marca, línea, modelo y configuración de eje.",
      "Validación de uso: carga urbana, carretera o mixto.",
    ],
    processSteps: [
      {
        title: "Toma de medidas y evidencia",
        description:
          "Recibimos medidas, fotos y contexto de falla para empezar diagnóstico de compatibilidad.",
      },
      {
        title: "Selección técnica",
        description:
          "Filtramos referencias por medida real, aplicación y condición de trabajo de la unidad.",
      },
      {
        title: "Cotización con opciones",
        description:
          "Te enviamos alternativas disponibles y recomendaciones para intervención completa.",
      },
      {
        title: "Despacho y soporte",
        description:
          "Coordinamos envío y acompañamos con sugerencias para montaje y revisión posterior.",
      },
    ],
    serviceCoverage: [
      "Asesoría para buses, camiones y tractomulas de trabajo pesado.",
      "Apoyo a talleres con consultas por medida y referencia.",
      "Atención para flotas que requieren continuidad operativa.",
      "Despachos nacionales según disponibilidad de inventario.",
      "Soporte por WhatsApp para cotización y seguimiento.",
      "Recomendaciones para prevenir repetición de fallas por desalineación.",
    ],
    contentBlocks: [
      {
        title: "Errores comunes al comprar crucetas y cardanes",
        paragraphs: [
          "Uno de los errores más frecuentes es pedir la pieza solo por nombre comercial sin confirmar dimensiones reales. En transmisión pesada, pequeñas diferencias en copa o ancho generan montaje forzado, desgaste rápido y nuevas vibraciones.",
          "Otro error común es reemplazar únicamente la cruceta sin revisar el estado del yugo, soporte y alineación del cardán. Cuando los componentes trabajan desfasados, la cruceta nueva se deteriora antes de lo esperado y el costo se repite.",
        ],
        bullets: [
          "No omitir medición física antes de comprar.",
          "Verificar estado general de la línea de transmisión.",
          "Confirmar torque y procedimiento de montaje en taller.",
          "Usar lubricación recomendada según aplicación.",
        ],
      },
      {
        title: "Cómo reducir vibraciones después del cambio",
        paragraphs: [
          "Después de instalar crucetas o cardán, es importante validar prueba dinámica y reapriete inicial según criterio del taller. Esto ayuda a detectar a tiempo cualquier desalineación residual o juego inesperado.",
          "También recomendamos llevar registro básico de síntomas posteriores al montaje, como vibración a determinada velocidad o en carga específica. Con esa información, el ajuste fino del sistema se hace más rápido y preciso.",
        ],
        bullets: [
          "Realizar inspección de soporte y alineación.",
          "Comprobar ausencia de juego en pruebas iniciales.",
          "Revisar lubricación y sellado luego de primeros recorridos.",
        ],
      },
    ],
    faqs: [
      {
        q: "¿Qué datos necesitan para cotizar una cruceta?",
        a: "Medidas, foto y aplicación del vehículo. Con eso te damos una opción compatible.",
      },
      {
        q: "¿Pueden ayudar con equivalencias por marca?",
        a: "Sí, revisamos equivalencias por referencia cuando la medida coincide con la aplicación.",
      },
      {
        q: "¿Cotizan cardán completo o solo componentes?",
        a: "Dependiendo del caso, podemos orientar tanto componentes como solución integral de transmisión.",
      },
      {
        q: "¿Qué pasa si no tengo la referencia original?",
        a: "No hay problema. Con medidas y fotos podemos construir una alternativa técnica viable.",
      },
      {
        q: "¿Atienden vehículos de trabajo continuo?",
        a: "Sí, atendemos flotas y operaciones de alta exigencia con enfoque en disponibilidad.",
      },
      {
        q: "¿Manejan envíos nacionales?",
        a: "Sí, enviamos a Colombia según disponibilidad y tiempos logísticos de transportadora.",
      },
    ],
    relatedCategorySlug: "transmision",
    searchTerms: [
      "crucetas y cardanes",
      "cruceta cardan camión",
      "repuestos transmisión pesada",
      "cardan para bus",
      "cruceta para tractomula",
    ],
    relatedSearches: [
      "cruceta cardan precio colombia",
      "vibracion en cardan de camion",
      "medidas de cruceta para bus",
      "cardan transmisión pesada",
      "repuestos cardan santa marta",
      "cotizar crucetas por whatsapp",
      "juego en cruceta de diferencial",
      "mantenimiento de cardan en flotas",
    ],
  },
  {
    slug: "tornillos-para-carros",
    title: "Tornillos para carros",
    h1: "Tornillos para carros: tipos, medidas y selección correcta",
    summary:
      "Cotiza tornillos para carros y aplicaciones automotrices con guía por medida, paso de rosca, resistencia y uso real en taller.",
    intro:
      "Te ayudamos a seleccionar tornillos para carros según tipo de rosca, longitud y aplicación. Si no tienes referencia exacta, puedes enviar foto y medidas para proponer una opción adecuada para tu trabajo.",
    useCases: [
      "Fijación de piezas de carrocería y estructura.",
      "Reposición de tornillería en mantenimiento general.",
      "Aplicaciones de taller en frenos, suspensión y montaje.",
      "Sustitución de pernos y tornillos deteriorados por corrosión.",
    ],
    buyingTips: [
      "Confirma diámetro, largo y paso de rosca antes de comprar.",
      "Indica grado de resistencia o dureza requerido.",
      "Valida si necesitas acabado anticorrosivo o galvanizado.",
      "Comparte foto del punto de montaje para evitar error de aplicación.",
    ],
    longIntro: [
      "La tornillería automotriz parece un detalle menor, pero define seguridad y durabilidad de muchas intervenciones. Un tornillo con rosca o resistencia incorrecta puede provocar aflojamiento, deformación o daño en componentes cercanos.",
      "En Tornirepuestos apoyamos la selección de tornillos para carros con criterios técnicos simples pero efectivos: medida real, tipo de rosca, aplicación y condición de trabajo. Esto ayuda a taller y cliente final a evitar compras repetidas.",
      "Si no conoces la referencia exacta, podemos trabajar con medidas, muestra física o fotografía para orientar una alternativa compatible. El objetivo es que resuelvas rápido sin comprometer calidad del montaje.",
    ],
    symptoms: [
      "Rosca barrida o falso apriete en punto de montaje.",
      "Aflojamiento repetitivo después de vibración o uso continuo.",
      "Corrosión avanzada en tornillos expuestos a humedad.",
      "Diferencia visible entre tornillo actual y especificación requerida.",
      "Deformación de cabeza o cuerpo por torque inadecuado.",
      "Pérdida de sujeción en piezas de carrocería o soporte.",
    ],
    compatibilityChecklist: [
      "Medición de diámetro con herramienta adecuada.",
      "Confirmación de longitud útil del tornillo.",
      "Validación del paso de rosca (métrico o estándar).",
      "Definición de grado de resistencia según aplicación.",
      "Tipo de cabeza y herramienta de apriete necesaria.",
      "Ambiente de trabajo: interior, exterior, humedad o temperatura.",
    ],
    processSteps: [
      {
        title: "Identificación de requerimiento",
        description:
          "Nos indicas aplicación, medida estimada o foto para iniciar la selección del tornillo correcto.",
      },
      {
        title: "Validación técnica",
        description:
          "Confirmamos diámetro, paso, largo y resistencia para asegurar montaje confiable.",
      },
      {
        title: "Cotización por opción",
        description:
          "Compartimos disponibilidad y alternativas según stock real y prioridad de uso.",
      },
      {
        title: "Entrega y soporte",
        description:
          "Coordinamos despacho y recomendaciones de instalación para reducir fallas posteriores.",
      },
    ],
    serviceCoverage: [
      "Atención para talleres mecánicos, latonería y mantenimiento general.",
      "Opciones para aplicaciones ligeras y de trabajo pesado.",
      "Despacho a diferentes ciudades de Colombia.",
      "Asesoría por WhatsApp para dudas de medida y tipo de rosca.",
      "Apoyo en selección de tornillería por equivalencia física.",
      "Respuesta rápida para cotizaciones urgentes de taller.",
    ],
    contentBlocks: [
      {
        title: "Cómo evitar errores de rosca y torque",
        paragraphs: [
          "Muchos problemas de sujeción aparecen cuando se instala un tornillo con paso diferente al alojamiento. Aunque entre parcialmente, el daño progresivo de la rosca termina en reparación más costosa. Por eso siempre recomendamos validar paso y diámetro antes de instalar.",
          "Otro punto crítico es el torque. Incluso un tornillo correcto puede fallar si se sobreaprieta o queda por debajo del ajuste requerido. Definir herramienta, secuencia y criterio de apriete mejora la durabilidad de la intervención.",
        ],
        bullets: [
          "Comparar rosca nueva contra muestra original.",
          "No forzar entrada cuando existe resistencia anormal.",
          "Aplicar torque adecuado según aplicación.",
          "Revisar reapriete en zonas de alta vibración.",
        ],
      },
      {
        title: "Selección por aplicación: frenos, suspensión y carrocería",
        paragraphs: [
          "No todos los puntos del vehículo exigen el mismo tipo de tornillo. En sistemas de freno o suspensión, la exigencia mecánica suele ser mayor y requiere especificaciones de resistencia superiores frente a una fijación de carrocería liviana.",
          "Por eso nuestra recomendación es cotizar indicando exactamente dónde se instalará la pieza. Con ese contexto podemos orientar mejor el tipo de tornillo y evitar que un repuesto genérico comprometa seguridad o vida útil del conjunto.",
        ],
        bullets: [
          "Aplicaciones críticas requieren mayor control de especificación.",
          "Carrocería y accesorios pueden usar configuraciones diferentes.",
          "La corrosión del entorno define acabado y protección necesaria.",
        ],
      },
    ],
    faqs: [
      {
        q: "¿Venden tornillos por unidad o por paquete?",
        a: "Manejamos disponibilidad según referencia y presentación de inventario.",
      },
      {
        q: "¿Cómo identifico la medida correcta?",
        a: "Con diámetro, largo y paso de rosca podemos ayudarte a definir la opción adecuada.",
      },
      {
        q: "¿Puedo cotizar enviando solo una foto?",
        a: "Sí, una foto ayuda bastante. Si puedes agregar medidas, la validación es más precisa.",
      },
      {
        q: "¿Manejan tornillería para aplicaciones pesadas?",
        a: "Sí, orientamos opciones según exigencia de la aplicación y condición de trabajo.",
      },
      {
        q: "¿Qué recomiendan para zonas con corrosión?",
        a: "Evaluar acabado y protección según ambiente para prolongar vida útil del montaje.",
      },
      {
        q: "¿Hacen envíos nacionales?",
        a: "Sí, enviamos a diferentes ciudades de Colombia según disponibilidad y logística.",
      },
    ],
    relatedCategorySlug: "tornilleria",
    searchTerms: [
      "tornillos para carros",
      "tornillería automotriz",
      "pernos para vehículo",
      "tornillos de alta resistencia",
      "tornillos para taller mecánico",
    ],
    relatedSearches: [
      "tornillos automotrices medidas",
      "pernos para suspension de carro",
      "tornilleria para frenos",
      "tornillos anticorrosivos para vehiculos",
      "cotizar tornillos por whatsapp",
      "tornillos para carroceria",
      "paso de rosca automotriz",
      "repuestos de fijacion vehicular",
    ],
  },
];

export function getSeoSolutionBySlug(slug: string) {
  return SEO_SOLUTIONS.find((item) => item.slug === slug) || null;
}
