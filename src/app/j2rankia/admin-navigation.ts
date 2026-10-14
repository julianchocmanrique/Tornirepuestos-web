export const adminModules = [
  { name: "Resumen", id: "resumen", detail: "Una vista general del evento y las tareas pendientes." },
  { name: "Crear evento", id: "crear-evento", detail: "Configura y publica un evento independiente, paso a paso." },
  { name: "Registro", id: "registros", detail: "Perfiles de participantes y estado del Full Pass." },
  { name: "Inscripciones", id: "inscripciones", detail: "Competidores, categorías y pagos independientes." },
  { name: "Jurados", id: "jurados", detail: "Visualiza los jurados, gestiona sus accesos y consulta sus calificaciones." },
  { name: "Contabilidad", id: "contabilidad", detail: "Valores inscritos, comprobantes aprobados y pendientes." },
  { name: "Música", id: "musica", detail: "Pistas organizadas por categoría y número de competencia." },
  { name: "Minuto a minuto", id: "programa", detail: "Horarios, escenarios y estados de la competencia." },
  { name: "Categorías", id: "categorias", detail: "Modalidades, divisiones, tarifas y plazos." },
  { name: "Resultados", id: "resultados", detail: "Puntuaciones, posiciones y resultados por categoría." },
  { name: "Ajustes", id: "ajustes", detail: "Nombre, tarifas, instrucciones y apertura de inscripciones." },
];
export const contractorModules = [{ name: "Registro", id: "registros" }, { name: "Inscripciones", id: "inscripciones" }];

export function normalizeModuleHash(hash: string) {
  const id = hash.replace(/^#/, "");
  if (id === "acreditacion") return "resumen";
  return id === "pagos" ? "inscripciones" : ["participantes", "registro"].includes(id) ? "registros" : id;
}
