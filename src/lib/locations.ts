export type StoreLocation = {
  id: string;
  name: string;
  address: string;
  streetAddress: string;
  locality: string;
  latitude: number;
  longitude: number;
  embed: string;
  maps: string;
  waText: string;
};

export const STORE_LOCATIONS: StoreLocation[] = [
  {
    id: "sede-principal",
    name: "Sede Principal",
    address: "Calle 30 N 60-250, Santa Marta, Colombia",
    streetAddress: "Calle 30 N 60-250",
    locality: "Santa Marta",
    latitude: 11.18341,
    longitude: -74.1950117,
    embed:
      "https://www.google.com/maps?q=TORNIREPUESTOS%2C%20Cl.%2030%20%2360-250%2C%20Santa%20Marta%2C%20Magdalena&output=embed",
    maps: "https://maps.app.goo.gl/78M1UoDuRUNRFYtW6?g_st=iw",
    waText: "Quiero llegar a la sede principal (Calle 30 N 60-250). ¿Me compartes ubicación y referencia?",
  },
  {
    id: "sede-2",
    name: "Sede Alterna",
    address: "Torni Repuestos - Sector Puerto Mosquito, Vía Alterna, Santa Marta",
    streetAddress: "Sector Puerto Mosquito, Vía Alterna",
    locality: "Santa Marta",
    latitude: 11.1772915,
    longitude: -74.1921815,
    embed:
      "https://www.google.com/maps?q=Torni%20Repuestos%2C%20Sector%20Puerto%20Mosquito%2C%20V%C3%ADa%20Alterna%2C%20Santa%20Marta%2C%20Magdalena&output=embed",
    maps: "https://maps.app.goo.gl/xB61MyAsFJmJYQ428?g_st=iw",
    waText: "Quiero llegar a la sede alterna de Torni Repuestos en Sector Puerto Mosquito, Vía Alterna. ¿Me ayudas con la ubicación?",
  },
];
