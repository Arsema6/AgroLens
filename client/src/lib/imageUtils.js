const UPLOAD_MAX_EDGE = 1024;
const THUMBNAIL_MAX_EDGE = 320;

/** Downscales a picked/captured file to a JPEG blob small enough for a slow field connection. */
export async function prepareUpload(file) {
  const bitmap = await readBitmap(file);
  return canvasToBlob(drawScaled(bitmap, UPLOAD_MAX_EDGE), 0.82);
}

/** Produces a small JPEG data URL for the history list. */
export async function makeThumbnail(file) {
  const bitmap = await readBitmap(file);
  return drawScaled(bitmap, THUMBNAIL_MAX_EDGE).toDataURL('image/jpeg', 0.7);
}

async function readBitmap(file) {
  if ('createImageBitmap' in window) {
    return createImageBitmap(file);
  }
  const url = URL.createObjectURL(file);
  try {
    return await new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('That file is not a readable image.'));
      image.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

function drawScaled(bitmap, maxEdge) {
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas;
}

function canvasToBlob(canvas, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Could not process the photo.'))),
      'image/jpeg',
      quality,
    );
  });
}
