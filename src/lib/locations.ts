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
    name: "Tornirepuestos Bomba Zuca",
    address: "Troncal del Caribe, diagonal a la Bomba Zuca, Santa Marta",
    streetAddress: "Troncal del Caribe, diagonal a la Bomba Zuca",
    locality: "Santa Marta",
    latitude: 11.183433,
    longitude: -74.194969,
    embed:
      "https://www.google.com/maps?q=Tornirepuestos%2C%20Troncal%20del%20Caribe%20diagonal%20a%20la%20Bomba%20Zuca%2C%20Santa%20Marta%2C%20Magdalena&output=embed",
    maps:
      "https://www.google.com/maps/search/?api=1&query=Tornirepuestos%2C%20Troncal%20del%20Caribe%20diagonal%20a%20la%20Bomba%20Zuca%2C%20Santa%20Marta%2C%20Magdalena",
    waText: "Quiero llegar a Tornirepuestos Bomba Zuca. ¿Me ayudas con la ubicación?",
  },
];
