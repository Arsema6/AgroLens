/**
 * Sends a captured image to the backend for diagnosis.
 * Returns the scan result payload described in server/src/routes/analyze.js.
 */
export async function analyzeImage(blob, { signal } = {}) {
  const body = new FormData();
  body.append('image', blob, 'scan.jpg');

  const response = await fetch('/api/analyze', { method: 'POST', body, signal });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error ?? 'Could not analyse the photo. Try again.');
  }

  return response.json();
}
