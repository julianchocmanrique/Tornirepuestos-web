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
      "https://www.google.com/maps?q=Calle%2030%20N%2060-250,%20Santa%20Marta,%20Colombia&output=embed",
    maps: "https://www.google.com/maps/search/?api=1&query=Calle%2030%20N%2060-250,%20Santa%20Marta,%20Colombia",
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
      "https://www.google.com/maps?q=11.1772915,-74.1921815&z=15&output=embed",
    maps: "https://www.google.com/maps/dir/?api=1&destination=11.1772915,-74.1921815",
    waText: "Quiero llegar a la sede alterna de Torni Repuestos en Sector Puerto Mosquito, Vía Alterna. ¿Me ayudas con la ubicación?",
  },
];
