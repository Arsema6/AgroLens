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
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(scans));
  } catch {
    // Quota exceeded: drop the oldest half rather than losing the newest scan.
    if (scans.length > 1) {
      persist(scans.slice(0, Math.floor(scans.length / 2)));
    }
  }
}
