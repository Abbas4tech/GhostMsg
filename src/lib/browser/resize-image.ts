/** Longest side of a stored avatar, in px. */
export const AVATAR_SIZE = 256;
const AVATAR_QUALITY = 0.85;

/** Scales (w, h) to fit inside a `max`×`max` square, never upscaling. */
export function fitWithin(
  width: number,
  height: number,
  max: number
): { height: number; width: number } {
  const scale = Math.min(1, max / Math.max(width, height));
  return {
    height: Math.max(1, Math.round(height * scale)),
    width: Math.max(1, Math.round(width * scale)),
  };
}

/**
 * Reads an image file, center-crops it square and resizes it to
 * `AVATAR_SIZE`, returning a WebP data URL (JPEG where WebP is unsupported).
 */
export async function resizeImageToDataUrl(
  file: File,
  size = AVATAR_SIZE
): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const target = fitWithin(side, side, size);

  const canvas = document.createElement("canvas");
  canvas.width = target.width;
  canvas.height = target.height;
  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    throw new Error("Couldn't read that image");
  }
  context.drawImage(
    bitmap,
    (bitmap.width - side) / 2,
    (bitmap.height - side) / 2,
    side,
    side,
    0,
    0,
    target.width,
    target.height
  );
  bitmap.close();

  const webp = canvas.toDataURL("image/webp", AVATAR_QUALITY);
  return webp.startsWith("data:image/webp")
    ? webp
    : canvas.toDataURL("image/jpeg", AVATAR_QUALITY);
}
