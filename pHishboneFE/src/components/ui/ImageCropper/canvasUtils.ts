/**
 * canvasUtils.ts
 * Core canvas drawing logic for the ImageCropper.
 * Takes a source image URL, crop area (pixels), and rotation, then exports
 * a compressed File or Blob suitable for upload.
 */

export interface PixelCrop {
    x: number;
    y: number;
    width: number;
    height: number;
}

/**
 * Creates a rotated/flipped canvas element from a source image.
 * Used internally before applying the crop.
 */
function createImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', (err) => reject(err));
        image.setAttribute('crossOrigin', 'anonymous');
        image.src = url;
    });
}

function getRadianAngle(angleDegrees: number): number {
    return (angleDegrees * Math.PI) / 180;
}

/**
 * Rotates an image on a canvas and returns the canvas.
 */
function rotateSize(width: number, height: number, rotation: number) {
    const rotRad = getRadianAngle(rotation);
    return {
        width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
        height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
    };
}

/**
 * Crops and optionally resizes an image into a Blob.
 *
 * @param imageSrc   - Object URL or data URL of the original image
 * @param pixelCrop  - Pixel-space crop area from react-easy-crop
 * @param rotation   - Rotation in degrees (default 0)
 * @param outputSize - Target resize dimensions (default: crop dimensions)
 * @param quality    - JPEG quality 0–1 (default 0.85)
 * @param mimeType   - Output MIME type (default image/jpeg)
 */
export async function getCroppedImg(
    imageSrc: string,
    pixelCrop: PixelCrop,
    rotation = 0,
    outputSize?: { width: number; height: number },
    quality = 0.85,
    mimeType: 'image/jpeg' | 'image/png' | 'image/webp' = 'image/jpeg',
): Promise<File> {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) throw new Error('Canvas 2D context not available');

    const rotRad = getRadianAngle(rotation);
    const { width: bBoxWidth, height: bBoxHeight } = rotateSize(image.width, image.height, rotation);

    // Set canvas size to the bounding box of the rotated image
    canvas.width = bBoxWidth;
    canvas.height = bBoxHeight;

    // Translate to center, rotate, then translate back
    ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
    ctx.rotate(rotRad);
    ctx.translate(-image.width / 2, -image.height / 2);

    // Draw the source image
    ctx.drawImage(image, 0, 0);

    // Extract the crop region into a second canvas
    const cropCanvas = document.createElement('canvas');
    const targetW = outputSize?.width ?? pixelCrop.width;
    const targetH = outputSize?.height ?? pixelCrop.height;
    cropCanvas.width = targetW;
    cropCanvas.height = targetH;

    const cropCtx = cropCanvas.getContext('2d');
    if (!cropCtx) throw new Error('Crop canvas 2D context not available');

    cropCtx.drawImage(
        canvas,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        targetW,
        targetH,
    );

    return new Promise<File>((resolve, reject) => {
        cropCanvas.toBlob(
            (blob) => {
                if (!blob) {
                    reject(new Error('Canvas toBlob failed'));
                    return;
                }
                const extension = mimeType === 'image/png' ? 'png' : mimeType === 'image/webp' ? 'webp' : 'jpg';
                resolve(new File([blob], `cropped.${extension}`, { type: mimeType }));
            },
            mimeType,
            quality,
        );
    });
}
