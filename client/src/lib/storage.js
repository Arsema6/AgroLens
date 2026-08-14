const STORAGE_KEY = 'agrolens.scans.v1';
const MAX_SCANS = 50;

/** Reads the scan history, newest first. Returns [] when storage is unavailable or corrupt. */
export function listScans() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getScan(scanId) {
  return listScans().find((scan) => scan.scanId === scanId) ?? null;
}

/**
 * Prepends a scan and trims the log. `thumbnail` is a small JPEG data URL so history stays
 * browsable offline without blowing the ~5 MB localStorage budget.
 */
export function saveScan(scan) {
  const scans = [scan, ...listScans().filter((existing) => existing.scanId !== scan.scanId)];
  persist(scans.slice(0, MAX_SCANS));
  return scan;
}

export function deleteScan(scanId) {
  persist(listScans().filter((scan) => scan.scanId !== scanId));
}

export function clearScans() {
  persist([]);
}

function persist(scans) {
  // Quota exceeded: drop the oldest half rather than losing the newest scan, but give up once
  // even a single scan will not fit so a failing localStorage is reported instead of masked.
  let candidate = scans;
  for (;;) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(candidate));
      return;
    } catch (error) {
      if (candidate.length <= 1) {
        console.warn('AgroLens: could not save scan history', error);
        return;
      }
      candidate = candidate.slice(0, Math.floor(candidate.length / 2));
    }
  }
}
