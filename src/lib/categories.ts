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
    img: "https://images.unsplash.com/photo-1613214150384-14921ff659b2?auto=format&fit=crop&w=1800&q=75",
    whatYouCanAsk: [
      "Discos, bandas y pastillas",
      "Cámaras, válvulas y accesorios",
      "Sensores y componentes de freno",
    ],
    productsExample: [
      { name: "Disco de freno", note: "Según eje, medida y referencia" },
      { name: "Banda / pastillas", note: "Por tipo de sistema y aplicación" },
      { name: "Válvula y accesorios", note: "Según sistema neumático" },
    ],
  },
  {
    slug: "filtracion",
    title: "Filtración",
    kicker: "ACEITE · AIRE · COMBUSTIBLE",
    desc: "Filtros y separadores para proteger el motor y mejorar eficiencia.",
    img: "https://images.unsplash.com/photo-1527383418406-f85a3b146499?auto=format&fit=crop&w=1600&q=75",
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
    img: "https://images.unsplash.com/photo-1669136048337-5daa3adef7b2?auto=format&fit=crop&w=1600&q=75",
    whatYouCanAsk: [
      "Amortiguadores",
      "Bolsas de aire (neumática)",
      "Bujes y componentes de suspensión",
    ],
    productsExample: [
      { name: "Amortiguador", note: "Por eje y medida" },
      { name: "Bolsa de aire", note: "Por placa o referencia" },
      { name: "Bujes / kits", note: "Según brazo y aplicación" },
    ],
  },
  {
    slug: "motor",
    title: "Motor",
    kicker: "SELLOS · EMPAQUES",
    desc: "Consumibles y repuestos para mantenimiento preventivo.",
    img: "https://images.unsplash.com/photo-1429772011165-0c2e054367b8?auto=format&fit=crop&w=1600&q=75",
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
    img: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=1600&q=75",
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
    img: "https://images.unsplash.com/photo-1711199694531-e982a79ea381?auto=format&fit=crop&w=1600&q=75",
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
    img: "https://images.unsplash.com/photo-1589391349202-900abe66462a?auto=format&fit=crop&w=1600&q=75",
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
    title: "Mangueras y racorería",
    kicker: "AIRE · ABRAZADERAS",
    desc: "Conexiones seguras para sistemas de aire y servicio.",
    img: "https://images.unsplash.com/photo-1718824331840-399943ff5c1e?auto=format&fit=crop&w=1600&q=75",
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
    img: "https://images.unsplash.com/photo-1607603750909-408e193868c7?auto=format&fit=crop&w=1600&q=75",
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
    img: "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&w=1600&q=75",
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
    img: "https://images.unsplash.com/photo-1756888195232-69ee9c041965?auto=format&fit=crop&w=1600&q=75",
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
