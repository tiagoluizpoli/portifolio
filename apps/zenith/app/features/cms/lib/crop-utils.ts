import type { Area } from 'react-easy-crop';

/**
 * createImage: Utility to load an image from a URL.
 */
export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous'); // Needed to avoid cross-origin issues on canvas
    image.src = url;
  });

/**
 * getCroppedImg: Extract the cropped area from an image and return a DataURL.
 */
export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
): Promise<string | null> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return null;
  }

  // Set canvas size to the cropped area dimensions
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // Draw the cropped portion of the source image onto the canvas
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );

  // Return as DataURL
  return canvas.toDataURL('image/jpeg');
}
