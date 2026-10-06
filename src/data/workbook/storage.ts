// Keeps the last imported workbook in this browser so the presentation survives a
// page reload. The raw .xlsx is stored (not the generated slides), so the import is
// recomputed with the current code every time — new slides or fixes in the app
// apply automatically to the stored workbook.

const KEY = 'faiston-apresentacao:planilha-importada:v1';

export interface StoredWorkbook {
  fileName: string;
  monthLabel: string;
  importedAt: string;
  base64: string;
}

function toBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}

export function fromBase64(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/** Returns false when the browser refused to store it (private mode, quota...). */
export function saveWorkbook(data: Uint8Array, fileName: string, monthLabel: string): boolean {
  try {
    const value: StoredWorkbook = { fileName, monthLabel, importedAt: new Date().toISOString(), base64: toBase64(data) };
    localStorage.setItem(KEY, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function loadStoredWorkbook(): StoredWorkbook | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as StoredWorkbook) : null;
  } catch {
    return null;
  }
}

export function clearStoredWorkbook() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* nothing stored */
  }
}
