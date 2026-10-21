export type ImageCompressionOptions = {
  maxDimension: number;
  maxBytes: number;
};

function encodeWebP(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob || blob.type !== "image/webp") {
        reject(new Error("Your browser could not compress this image to WebP."));
      } else {
        resolve(blob);
      }
    }, "image/webp", quality);
  });
}

// Keep the original aspect ratio and transparency; never upscale small images.
export async function compressImage(file: File, options: ImageCompressionOptions): Promise<File> {
  const bitmap = await createImageBitmap(file).catch(() => {
    throw new Error("This image could not be opened. Please choose another image.");
  });

  try {
    if (!bitmap.width || !bitmap.height || bitmap.width * bitmap.height > 40_000_000) {
      throw new Error("Image dimensions are too large. Please choose a smaller image.");
    }
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Image compression is unavailable in your browser.");

    let scale = Math.min(1, options.maxDimension / Math.max(bitmap.width, bitmap.height));
    for (let resize = 0; resize < 4; resize += 1) {
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

      for (const quality of [0.86, 0.76, 0.66, 0.56]) {
        const blob = await encodeWebP(canvas, quality);
        if (blob.size <= options.maxBytes) {
          const name = file.name.replace(/\.[^.]+$/, "");
          return new File([blob], `${name}.webp`, { type: "image/webp" });
        }
      }
      scale *= 0.75;
    }
    throw new Error("This image could not be compressed enough. Please choose a simpler image.");
  } finally {
    bitmap.close();
  }
}
