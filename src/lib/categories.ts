export type Category = {
  slug: string;
  title: string;
  kicker: string;
  desc: string;
  img: string;
  whatYouCanAsk: string[];
  productsExample: { name: string; note: string }[];
};

export const categories: Category[] = [
  {
    slug: "frenos",
    title: "Frenos",
    kicker: "DISCOS · BANDAS · VÁLVULAS",
    desc: "Componentes de freno para trabajo pesado y alto rendimiento.",
    img: "/categories/frenos-bg-lab.png",
    whatYouCanAsk: [
      "Discos, bandas y pastillas",
      "Cámaras, válvulas y accesorios",
      "Sensores y componentes de freno",
    ],
    productsExample: [
      { name: "Disco de freno", note: "Según eje, medida y referencia" },
      { name: "Banda / pastillas", note: "Por tipo de sistema y aplicación" },
      { name: "Válvula y accesorios", note: "Según sistema neumático" },
      { name: "Cámara / diafragma", note: "Según tamaño y aplicación" },
      { name: "Sensores / cableado", note: "Según sistema" },
      { name: "Kit de mantenimiento", note: "Para intervención completa" },
    ],
  },
  {
    slug: "filtracion",
    title: "Filtración",
    kicker: "ACEITE · AIRE · COMBUSTIBLE",
    desc: "Filtros y separadores para proteger el motor y mejorar eficiencia.",
    img: "/categories/filtracion-bg-lab.jpeg",
    whatYouCanAsk: [
      "Filtro de aceite / aire / combustible",
      "Separador de agua",
      "Kits de filtración por mantenimiento",
    ],
    productsExample: [
      { name: "Filtro de aceite", note: "Por referencia del motor" },
      { name: "Filtro de aire", note: "Por medida y aplicación" },
      { name: "Filtro de combustible", note: "Con o sin separador" },
    ],
  },
  {
    slug: "suspension",
    title: "Suspensión",
    kicker: "NEUMÁTICA · RÍGIDA",
    desc: "Confort, estabilidad y control de carga para ruta y ciudad.",
    img: "/categories/suspension-bg-lab.png",
    whatYouCanAsk: [
      "Amortiguadores",
      "Bolsas de aire (neumática)",
      "Hojas de muelle",
      "Bujes y componentes de suspensión",
    ],
    productsExample: [
      { name: "Amortiguador", note: "Por eje y medida" },
      { name: "Bolsa de aire", note: "Por placa o referencia" },
      { name: "Hojas de muelle", note: "Por arco, largo y capacidad de carga" },
      { name: "Bujes / kits", note: "Según brazo y aplicación" },
    ],
  },
  {
    slug: "motor",
    title: "Motor",
    kicker: "SELLOS · EMPAQUES",
    desc: "Consumibles y repuestos para mantenimiento preventivo.",
    img: "/categories/motor-bg-lab.png",
    whatYouCanAsk: [
      "Sellos y empaques",
      "Componentes de mantenimiento",
      "Sensores y consumibles",
    ],
    productsExample: [
      { name: "Empaques", note: "Según motor y referencia" },
      { name: "Sellos", note: "Por medida y aplicación" },
      { name: "Consumibles", note: "Por plan de mantenimiento" },
    ],
  },
  {
    slug: "electricos-y-luces",
    title: "Eléctricos y luces",
    kicker: "LUCES · CONECTORES",
    desc: "Iluminación y eléctricos para seguridad y señalización.",
    img: "/categories/luces-bg-lab.png",
    whatYouCanAsk: [
      "Stops, farolas y exploradoras",
      "Bombillos y conectores",
      "Accesorios eléctricos",
    ],
    productsExample: [
      { name: "Stop / farola", note: "Por modelo y tipo" },
      { name: "Conectores", note: "Según instalación" },
      { name: "Bombillería", note: "Por voltaje y referencia" },
    ],
  },
  {
    slug: "transmision",
    title: "Transmisión",
    kicker: "FULLER · CRUCETAS",
    desc: "Componentes para torque, fuerza y durabilidad.",
    img: "/categories/transmision-bg-lab.png",
    whatYouCanAsk: [
      "Crucetas y cardanes",
      "Componentes de caja",
      "Kits y accesorios",
    ],
    productsExample: [
      { name: "Cruceta", note: "Por medida y aplicación" },
      { name: "Componentes de caja", note: "Según referencia" },
      { name: "Cardán", note: "Por largo y acople" },
    ],
  },
  {
    slug: "rodamientos-y-retenedores",
    title: "Rodamientos y retenedores",
    kicker: "KITS · RETENES",
    desc: "Repuestos de precisión para reducir desgaste y vibración.",
    img: "/categories/rodamientos-bg-lab.png",
    whatYouCanAsk: [
      "Rodamientos",
      "Retenes",
      "Kits por eje",
    ],
    productsExample: [
      { name: "Rodamiento", note: "Por medida y referencia" },
      { name: "Retén", note: "Por diámetro" },
      { name: "Kit", note: "Según aplicación" },
    ],
  },
  {
    slug: "mangueras-y-racoreria",
    title: "Mangueras",
    kicker: "AIRE · ABRAZADERAS",
    desc: "Conexiones seguras para sistemas de aire y servicio.",
    img: "/categories/mangueras-bg-lab.png",
    whatYouCanAsk: [
      "Mangueras de aire y servicio",
      "Abrazaderas",
      "Racores y accesorios",
    ],
    productsExample: [
      { name: "Manguera", note: "Por presión y diámetro" },
      { name: "Abrazadera", note: "Por medida" },
      { name: "Racor", note: "Según conexión" },
    ],
  },
  {
    slug: "lubricantes-y-grasas",
    title: "Lubricantes y grasas",
    kicker: "ACEITES · ADITIVOS",
    desc: "Lubricación para trabajo pesado y protección del tren motriz.",
    img: "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=1600&q=80",
    whatYouCanAsk: [
      "Aceites",
      "Grasas",
      "Aditivos",
    ],
    productsExample: [
      { name: "Aceite", note: "Según especificación" },
      { name: "Grasa", note: "Por aplicación" },
      { name: "Aditivo", note: "Según necesidad" },
    ],
  },
  {
    slug: "tornilleria",
    title: "Tornillería",
    kicker: "ANCLAJES · FIJACIÓN",
    desc: "Tornillería y fijación para mantenimiento y montaje.",
    img: "https://images.unsplash.com/photo-1605701249987-f0bb9b505d06?auto=format&fit=crop&w=1600&q=75",
    whatYouCanAsk: [
      "Tornillos y tuercas",
      "Arandelas",
      "Fijación en general",
    ],
    productsExample: [
      { name: "Tornillo", note: "Por medida y grado" },
      { name: "Tuerca", note: "Por rosca" },
      { name: "Arandela", note: "Por medida" },
    ],
  },
  {
    slug: "herramientas",
    title: "Herramientas",
    kicker: "TALLER · SOPORTE",
    desc: "Herramientas y apoyo para taller y servicio.",
    img: "https://images.unsplash.com/photo-1708716334127-251478e5ff37?auto=format&fit=crop&w=1600&q=80",
    whatYouCanAsk: [
      "Herramienta manual",
      "Consumibles de taller",
      "Accesorios",
    ],
    productsExample: [
      { name: "Herramienta", note: "Según necesidad" },
      { name: "Consumible", note: "Por tipo" },
      { name: "Accesorio", note: "Según uso" },
    ],
  },
  {
    slug: "diferenciales",
    title: "Diferenciales",
    kicker: "TRACCIÓN · CARGA",
    desc: "Componentes y repuestos para transmisión final.",
    img: "https://images.unsplash.com/photo-1736161999520-0a20fa297a89?auto=format&fit=crop&w=1600&q=80",
    whatYouCanAsk: [
      "Componentes de diferencial",
      "Kits",
      "Accesorios",
    ],
    productsExample: [
      { name: "Componentes", note: "Por referencia" },
      { name: "Kit", note: "Según aplicación" },
      { name: "Accesorios", note: "Por compatibilidad" },
    ],
  },
];

export function getCategoryBySlug(slug: string) {
  return categories.find((c) => c.slug === slug) || null;
}
