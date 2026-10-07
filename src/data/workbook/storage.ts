// Keeps the last imported workbook on the server (Postgres, see server/) so every
// browser opening the presentation sees the same data. The raw .xlsx is stored (not
// the generated slides), so the import is recomputed with the current code every
// time — new slides or fixes in the app apply automatically to the stored workbook.

const API = '/api/planilha';
const TOKEN_KEY = 'faiston-apresentacao:senha-importacao';
// Where the workbook used to live before the server existed — cleared on load.
const LEGACY_KEY = 'faiston-apresentacao:planilha-importada:v1';

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

function readToken(): string {
  try {
    return localStorage.getItem(TOKEN_KEY) || '';
  } catch {
    return '';
  }
}

function writeToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* browser refused — the password is asked again next time */
  }
}

/**
 * PUT/DELETE are protected when the server has IMPORT_TOKEN set. On a 401 the
 * password is asked once and remembered in this browser.
 */
async function writeRequest(method: 'PUT' | 'DELETE', body?: unknown): Promise<Response> {
  const send = (token: string) =>
    fetch(API, {
      method,
      headers: { 'Content-Type': 'application/json', 'X-Import-Token': token },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

  let res = await send(readToken());
  if (res.status === 401) {
    const typed = window.prompt('Senha de importação da apresentação:');
    if (!typed) return res;
    res = await send(typed);
    writeToken(res.status === 401 ? null : typed);
  }
  return res;
}

export async function loadStoredWorkbook(): Promise<StoredWorkbook | null> {
  try {
    localStorage.removeItem(LEGACY_KEY);
  } catch {
    /* nothing stored */
  }
  const res = await fetch(API, { cache: 'no-store' });
  if (res.status === 204) return null;
  if (!res.ok) throw new Error(`Servidor respondeu HTTP ${res.status}`);
  return (await res.json()) as StoredWorkbook;
}

/** Returns an error message, or null when the workbook was saved. */
export async function saveWorkbook(data: Uint8Array, fileName: string, monthLabel: string): Promise<string | null> {
  try {
    const res = await writeRequest('PUT', { fileName, monthLabel, base64: toBase64(data) });
    if (res.ok) return null;
    const { error } = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    return error || `HTTP ${res.status}`;
  } catch {
    return 'Servidor indisponível.';
  }
}

/** Returns an error message, or null when the server went back to the original data. */
export async function clearStoredWorkbook(): Promise<string | null> {
  try {
    const res = await writeRequest('DELETE');
    if (res.ok) return null;
    const { error } = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    return error || `HTTP ${res.status}`;
  } catch {
    return 'Servidor indisponível.';
  }
}
