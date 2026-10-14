import sharp from "sharp";
import { DanceError, ensure } from "./domain";

export async function normalizeJudgePhoto(file: FormDataEntryValue | null, optional = false): Promise<Buffer | undefined> {
  if (optional && (file === null || file === "" || (file instanceof File && file.size === 0 && !file.name))) return undefined;
  ensure(file instanceof File && file.size > 0 && file.size <= 5 * 1024 ** 2, "Sube una foto JPG, PNG o WebP de máximo 5 MB.");
  try {
    const photo = sharp(Buffer.from(await file.arrayBuffer()), { limitInputPixels: 25000000 });
    const info = await photo.metadata();
    ensure(["jpeg", "png", "webp"].includes(info.format || "") && (info.pages || 1) === 1, "Usa JPG, PNG o WebP sin animación.");
    // Decode and re-encode so public portraits cannot carry active content or EXIF metadata.
    return await photo.rotate().resize(512, 512, { fit: "cover", position: "attention" }).webp({ quality: 85 }).toBuffer();
  } catch (error) {
    if (error instanceof DanceError) throw error;
    throw new DanceError("No se pudo leer la foto. Usa una imagen JPG, PNG o WebP válida.");
  }
}
