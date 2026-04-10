import type { Category } from "@/lib/categories";

const infoByCategory: Record<string, string> = {
  frenos:
    "Cotiza frenos para vehículos pesados, buses y maquinaria: bandas, bloques perforados, discos, cámaras y componentes neumáticos. Te ayudamos a validar compatibilidad por referencia, placa o foto de la pieza. También te orientamos sobre disponibilidad inmediata y opciones de envío a todo Colombia.",
  filtracion:
    "En filtración manejamos filtros de aceite, aire, combustible y separadores de agua para motores diésel de trabajo pesado. Si nos compartes referencia o aplicación, te ayudamos a escoger la opción correcta para mantenimiento preventivo y mejor rendimiento. Cotiza por WhatsApp con disponibilidad, precio y tiempos de entrega.",
  suspension:
    "En suspensión cotizas bujes, tensores, soportes, componentes de balancín y repuestos de carga para operación pesada. Te asesoramos para identificar la referencia adecuada según eje, aplicación y tipo de vehículo. Escríbenos con foto o referencia para confirmar compatibilidad antes de comprar.",
  motor:
    "En motor cotizas orings, sellos, guías, empaques y componentes para mantenimiento y reparación de motores diésel. Te ayudamos a identificar equivalencias por referencia técnica para reducir errores de compra. Enviamos a todo Colombia con atención rápida por WhatsApp.",
  "electricos-y-luces":
    "En eléctricos y luces encuentras bombillos, stops, conectores, cableado y accesorios de señalización para transporte pesado. Validamos voltaje, tipo de conexión y aplicación para que compres el repuesto correcto. Pide tu cotización con referencia o foto y te respondemos con opciones disponibles.",
  transmision:
    "En transmisión cotizas crucetas, cardanes, planetarios, orings y componentes de caja/divisor para trabajo pesado. Te apoyamos con compatibilidad por referencia de conjunto para evitar reprocesos en taller. Escríbenos y te compartimos disponibilidad, precio y tiempos de despacho.",
  "rodamientos-y-retenedores":
    "Cotiza rodamientos, balineras y retenedores para ruedas, ejes y conjuntos de carga pesada. Te asesoramos por medida y referencia para asegurar ajuste y duración en operación. Envíanos datos de la pieza actual y te ayudamos a elegir la opción correcta.",
  "mangueras-y-racoreria":
    "En mangueras y racorería manejamos manguera sinflex, caucho lona, punteras, anillos, abrazaderas y accesorios de conexión. Te guiamos según diámetro, presión y uso para sistemas de aire y servicio. Cotiza por WhatsApp con respuesta rápida y envío nacional.",
  "lubricantes-y-grasas":
    "En lubricantes y grasas cotizas aceites para diésel pesado, hidráulicos, grasas multipropósito y aditivos de mantenimiento. Te orientamos según especificación técnica y tipo de operación para proteger motor y transmisión. Consulta disponibilidad de presentaciones por galón, pimpiná y otras.",
  tornilleria:
    "En tornillería encuentras arandelas, varilla roscada, fijación industrial y piezas para montaje y mantenimiento de flota. Te ayudamos a validar medida, rosca y aplicación para asegurar un cierre confiable. Escríbenos para cotizar cantidades y referencias específicas.",
  herramientas:
    "En herramientas cotizas consumibles y accesorios de taller como cinta teflón, boquillas, cepillos y elementos de apoyo para mantenimiento pesado. Te ayudamos a escoger la referencia según tu operación diaria. Solicita tu cotización con atención ágil por WhatsApp.",
  diferenciales:
    "En diferenciales cotizas componentes de tracción, sellado y mantenimiento para servicio pesado. Te apoyamos con identificación por referencia para asegurar compatibilidad del conjunto. Envíanos datos de aplicación y te compartimos opciones disponibles con entrega nacional.",
};

type CategoryInfoDetail = {
  overview: string;
  technicalGuide: string;
  applications: string[];
  purchaseTips: string[];
};

const detailByCategory: Record<string, CategoryInfoDetail> = {
  frenos: {
    overview:
      "Esta categoría incluye repuestos de frenado para operación de carga, buses intermunicipales y maquinaria de trabajo continuo. Trabajamos referencias comerciales y equivalencias para sistemas neumáticos y de servicio pesado.",
    technicalGuide:
      "Para una recomendación precisa validamos tipo de eje, medida del conjunto y referencia actual. Si compartes foto de la pieza y datos del vehículo, reducimos errores de compra y aceleramos despacho.",
    applications: [
      "Mantenimiento preventivo de tractocamión y remolque.",
      "Cambio de consumibles de frenado en buses de ruta.",
      "Reposición de cámaras, válvulas y componentes neumáticos.",
      "Atención de desgaste irregular o pérdida de eficacia de frenado.",
    ],
    purchaseTips: [
      "Incluye referencia grabada o etiqueta del repuesto actual.",
      "Indica si el eje es delantero, trasero o auxiliar.",
      "Confirma ciudad de entrega para calcular tiempos de envío.",
    ],
  },
  filtracion: {
    overview:
      "En filtración cotizas elementos de aceite, aire y combustible para proteger inyectores y alargar vida útil del motor. También manejamos filtros separadores para control de agua en diésel.",
    technicalGuide:
      "La selección correcta depende de referencia del motor, tipo de servicio y frecuencia de mantenimiento. Te ayudamos a identificar reemplazos compatibles para evitar restricciones de flujo o fallas prematuras.",
    applications: [
      "Planes de mantenimiento de flota de carga y pasajeros.",
      "Reposición de filtro de combustible y trampa de agua.",
      "Optimización de consumo y desempeño del motor diésel.",
      "Control de contaminación en sistemas de admisión y lubricación.",
    ],
    purchaseTips: [
      "Comparte código del filtro anterior o manual técnico.",
      "Indica horas de operación o kilometraje del equipo.",
      "Pregunta por kits para hacer el servicio completo en una sola compra.",
    ],
  },
  suspension: {
    overview:
      "La categoría de suspensión reúne repuestos para estabilidad, confort y distribución adecuada de carga en ruta. Incluye bujes, tensores, soportes y componentes para trabajo pesado continuo.",
    technicalGuide:
      "Validamos aplicación por eje, tipo de suspensión y referencia física para evitar holguras o desajustes. Una selección adecuada mejora comportamiento del vehículo y reduce desgaste en llantas y dirección.",
    applications: [
      "Corrección de vibraciones y ruidos en suspensión.",
      "Cambio de bujes y elementos de soporte por fatiga.",
      "Mantenimiento de sistemas neumáticos y rígidos.",
      "Preparación de unidades para trayectos largos con carga.",
    ],
    purchaseTips: [
      "Indica si tu sistema es neumático, mixto o rígido.",
      "Comparte medida o foto del buje/tensor instalado.",
      "Consulta disponibilidad por kit para ahorrar tiempo en taller.",
    ],
  },
  motor: {
    overview:
      "En motor encuentras sellos, empaques, guías, orings y piezas de apoyo para reparaciones parciales o preventivas. Son componentes clave para conservar compresión, lubricación y funcionamiento estable.",
    technicalGuide:
      "Te asesoramos por referencia técnica y aplicación del motor para que el repuesto encaje correctamente. Esto ayuda a evitar fugas, reprocesos y paradas no programadas en operación.",
    applications: [
      "Mantenimiento preventivo en motores diésel de flota.",
      "Corrección de fugas en tapa, válvulas e inyección.",
      "Reposición de consumibles durante ajuste de motor.",
      "Intervenciones de taller con validación por referencia.",
    ],
    purchaseTips: [
      "Envía modelo del motor y número de referencia disponible.",
      "Adjunta fotos de empaque o sello retirado.",
      "Pregunta por equivalencias cuando la referencia esté descontinuada.",
    ],
  },
  "electricos-y-luces": {
    overview:
      "Esta línea incluye iluminación, señalización y conectividad eléctrica para seguridad operativa en carretera y ciudad. Cotizas bombillos, stops, conectores y accesorios para sistemas de 12V y 24V.",
    technicalGuide:
      "Revisamos voltaje, tipo de terminal y aplicación del componente para garantizar compatibilidad. Una elección correcta mejora visibilidad, reduce fallas intermitentes y evita retrabajos eléctricos.",
    applications: [
      "Reposición de luces de posición, freno y direccionales.",
      "Mantenimiento de cableado y conectores en flota.",
      "Mejora de señalización para operación nocturna.",
      "Corrección de fallas eléctricas por humedad o desgaste.",
    ],
    purchaseTips: [
      "Indica si tu sistema opera en 12V o 24V.",
      "Comparte foto del conector y base del bombillo.",
      "Confirma lado de instalación cuando aplique (izq./der.).",
    ],
  },
  transmision: {
    overview:
      "En transmisión cotizas repuestos para sistemas de fuerza y tracción como crucetas, cardanes y componentes de caja/divisor. Son piezas críticas para continuidad de operación en carga pesada.",
    technicalGuide:
      "La compatibilidad se valida por referencia de conjunto, medida y tipo de acople. Nuestro apoyo técnico busca evitar vibraciones, holguras y fallas prematuras por selección incorrecta.",
    applications: [
      "Mantenimiento de caja y divisor en tractocamión.",
      "Reposición de crucetas y elementos de cardán.",
      "Corrección de juego excesivo en transmisión.",
      "Atención de ruido o vibración en línea de potencia.",
    ],
    purchaseTips: [
      "Comparte código de caja o diferencial relacionado.",
      "Indica tipo de uso: ruta, urbano o mixto.",
      "Solicita opciones de reemplazo por disponibilidad inmediata.",
    ],
  },
  "rodamientos-y-retenedores": {
    overview:
      "Esta categoría agrupa rodamientos, balineras y retenedores para ejes, ruedas y conjuntos rotativos. Su correcta selección reduce temperatura, fricción y desgaste en servicio continuo.",
    technicalGuide:
      "Trabajamos por medida interna/externa, espesor y referencia para asegurar ajuste exacto. También te orientamos sobre sellado y aplicación para condiciones de carga o polvo.",
    applications: [
      "Cambio de rodamientos de rueda y ejes de carga.",
      "Reposición de retenedores por fuga o desgaste.",
      "Mantenimiento preventivo en conjuntos rotativos.",
      "Corrección de ruido y juego por fatiga de balineras.",
    ],
    purchaseTips: [
      "Comparte medidas exactas o referencia visible de la pieza.",
      "Indica ubicación del repuesto en el vehículo/equipo.",
      "Consulta kits completos para intervenir el conjunto.",
    ],
  },
  "mangueras-y-racoreria": {
    overview:
      "En mangueras y racorería encuentras soluciones de conducción y conexión para aire y servicio. Incluye manguera sinflex, caucho lona, punteras, anillos y abrazaderas.",
    technicalGuide:
      "La selección depende de diámetro, presión de trabajo y tipo de conexión. Te ayudamos a elegir la combinación correcta para minimizar fugas y mantener la seguridad del sistema.",
    applications: [
      "Reposición de líneas de aire en freno neumático.",
      "Conexiones para circuitos de servicio y taller.",
      "Mantenimiento de uniones con abrazaderas y racores.",
      "Corrección de fugas por fatiga o corte de manguera.",
    ],
    purchaseTips: [
      "Indica diámetro interno/externo y longitud requerida.",
      "Comparte foto de racor o puntera actual.",
      "Especifica si la aplicación es aire, aceite o uso mixto.",
    ],
  },
  "lubricantes-y-grasas": {
    overview:
      "La línea de lubricantes y grasas está enfocada en protección del motor, transmisión y componentes sometidos a alta carga. Manejamos aceites, hidráulicos, grasas y aditivos de uso profesional.",
    technicalGuide:
      "Te orientamos por viscosidad, norma técnica y tipo de operación para elegir la formulación adecuada. Una selección correcta extiende vida útil y mejora rendimiento del equipo.",
    applications: [
      "Servicios periódicos de motor diésel y tren motriz.",
      "Lubricación de puntos de alta fricción en chasis.",
      "Atención de operación en clima cálido y trabajo continuo.",
      "Reposición de fluidos hidráulicos y grasas de mantenimiento.",
    ],
    purchaseTips: [
      "Comparte especificación recomendada por fabricante.",
      "Indica presentación deseada: galón, pimpiná u otra.",
      "Consulta productos equivalentes para tu tipo de operación.",
    ],
  },
  tornilleria: {
    overview:
      "En tornillería cotizas fijación para montaje, mantenimiento y reparación de sistemas de carga pesada. Incluye arandelas, varilla roscada, tornillos y elementos de ajuste industrial.",
    technicalGuide:
      "Validamos medida, paso de rosca y aplicación para lograr un ensamble confiable. Esto reduce aflojamientos, reprocesos de taller y tiempos muertos por fallas de fijación.",
    applications: [
      "Reposición de fijación en chasis y soportes.",
      "Mantenimiento de estructuras y accesorios metálicos.",
      "Atención de montaje en taller de servicio pesado.",
      "Ajustes preventivos en flota de operación continua.",
    ],
    purchaseTips: [
      "Indica medida exacta, largo y tipo de rosca.",
      "Confirma si necesitas grado o resistencia específica.",
      "Pregunta por opciones en cantidad para mantenimiento masivo.",
    ],
  },
  herramientas: {
    overview:
      "La categoría de herramientas incluye consumibles y accesorios de apoyo para operaciones de taller y mantenimiento pesado. Es ideal para complementar servicios preventivos y correctivos.",
    technicalGuide:
      "Te ayudamos a elegir cada elemento según tarea, frecuencia de uso y tipo de intervención. Con eso optimizas tiempos de trabajo y mejoras resultados en campo o taller.",
    applications: [
      "Dotación de consumibles para mecánica diésel.",
      "Apoyo en instalación y ajuste de repuestos.",
      "Reposición de elementos de uso frecuente en taller.",
      "Operaciones de limpieza, sellado y lubricación básica.",
    ],
    purchaseTips: [
      "Cuéntanos el trabajo específico que vas a realizar.",
      "Indica si el uso es ocasional o intensivo.",
      "Solicita recomendación de productos complementarios.",
    ],
  },
  diferenciales: {
    overview:
      "En diferenciales encuentras repuestos para transmisión final, tracción y sellado en vehículos de carga. Son componentes clave para mantener entrega de fuerza y operación estable.",
    technicalGuide:
      "La selección correcta se define por referencia del conjunto, tipo de eje y aplicación real del vehículo. Te apoyamos para reducir incompatibilidades y mejorar durabilidad del sistema.",
    applications: [
      "Mantenimiento preventivo de diferencial y tracción.",
      "Reposición de sellos y componentes de ajuste.",
      "Corrección de juego, ruido o fuga en conjunto final.",
      "Soporte técnico para reparaciones de servicio pesado.",
    ],
    purchaseTips: [
      "Comparte referencia del diferencial o eje.",
      "Adjunta foto de pieza desmontada cuando sea posible.",
      "Consulta tiempos de entrega según ciudad destino.",
    ],
  },
};

export function seoParagraph(cat: Category) {
  return (
    infoByCategory[cat.slug] ||
    `En Tornirepuestos cotizas ${cat.title.toLowerCase()} para vehículos pesados, buses y maquinaria. Te asesoramos para validar compatibilidad y referencia, y coordinamos envío a todo Colombia. Escríbenos por WhatsApp con placa, referencia o una foto para recibir disponibilidad y precio.`
  );
}

export function seoDetail(cat: Category): CategoryInfoDetail {
  return (
    detailByCategory[cat.slug] || {
      overview: `Cotiza ${cat.title.toLowerCase()} para vehículos pesados, buses y maquinaria con asesoría técnica por referencia.`,
      technicalGuide:
        "Te apoyamos en validación de compatibilidad, alternativas disponibles y tiempos de entrega para tu ciudad.",
      applications: [
        "Mantenimiento preventivo y correctivo.",
        "Reposición por desgaste natural de operación.",
        "Soporte técnico para compra por WhatsApp.",
      ],
      purchaseTips: [
        "Comparte referencia o foto clara de la pieza.",
        "Indica aplicación y datos del vehículo.",
        "Confirma ciudad de entrega para despacho.",
      ],
    }
  );
}
