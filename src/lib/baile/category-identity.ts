const normalize = (v: string) => v.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ");
export const categoryIdentity = (c: { name: string; modality: string; rhythm: string; division: string }) => [c.name, c.modality, c.rhythm, c.division].map(normalize).join("|");
