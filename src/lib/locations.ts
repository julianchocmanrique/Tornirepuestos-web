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
    name: "Sede 2",
    address: "Sector Bomba Zuca / Troncal del Caribe, Santa Marta",
    streetAddress: "Sector Bomba Zuca / Troncal del Caribe",
    locality: "Santa Marta",
    latitude: 11.183433,
    longitude: -74.194969,
    embed: "https://www.google.com/maps?q=11.183433,-74.194969&output=embed",
    maps:
      "https://www.google.com/maps/dir/Torni+Repuestos,+Santa+Marta,+Magdalena/11.183433,-74.194969/@11.2231232,-74.1953911,13.17z/data=!4m8!4m7!1m5!1m1!1s0x8ef4f60b4f12e23d:0xf825f5fb9f7f9bbc!2m2!1d-74.1950117!2d11.18341!1m0?entry=ttu&g_ep=EgoyMDI2MDQwOC4wIKXMDSoASAFQAw%3D%3D",
    waText: "Quiero llegar a la sede 2 (11.183433, -74.194969). ¿Me ayudas con la ubicación?",
  },
];
