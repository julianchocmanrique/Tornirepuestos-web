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

export function seoParagraph(cat: Category) {
  return (
    infoByCategory[cat.slug] ||
    `En Tornirepuestos cotizas ${cat.title.toLowerCase()} para vehículos pesados, buses y maquinaria. Te asesoramos para validar compatibilidad y referencia, y coordinamos envío a todo Colombia. Escríbenos por WhatsApp con placa, referencia o una foto para recibir disponibilidad y precio.`
  );
}
