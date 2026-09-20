export const TOTAL_FRAMES = 192;
export const INITIAL_BATCH_SIZE = 30;
export const BATCH_SIZE = 30;

/**
 * Returns the public URL for a given frame index (1 to TOTAL_FRAMES).
 */
export function getFrameUrl(index: number): string {
  const clampedIndex = Math.min(Math.max(Math.round(index), 1), TOTAL_FRAMES);
  const padded = clampedIndex.toString().padStart(4, "0");
  return `/frames/frame_${padded}.webp`;
}

/**
 * Preload a single frame into memory using HTML5 Image object.
 * Checks naturalWidth to ensure image is truly decoded and ready to draw.
 */
export function preloadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve) => {
    const img = new Image();

    let resolved = false;
    const done = () => {
      if (!resolved) {
        resolved = true;
        resolve(img);
      }
    };

    img.onload = done;
    img.onerror = () => {
      console.warn(`[preloadImage] Frame unavailable: ${url}`);
      done();
    };

    img.src = url;

    // Only resolve immediately if it's already decoded with valid dimensions
    if (img.complete && img.naturalWidth > 0) {
      done();
    }
  });
}
