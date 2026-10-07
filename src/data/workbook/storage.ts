// Monthly closing workbooks stored on the server (Postgres, see server/): one
// per competência, so every browser sees the same months and the comparative
// slides can read them all. The raw .xlsx is stored (not the generated slides),
// so each month is recomputed with the current code — new slides or fixes in the
// importer apply automatically to months uploaded before them.

const API = '/api/planilhas';
const TOKEN_KEY = 'faiston-apresentacao:senha-importacao';
// Where the workbook used to live before the server existed — cleared on load.
const LEGACY_KEY = 'faiston-apresentacao:planilha-importada:v1';

export interface StoredMonth {
  /** Version id — a new upload of the same month gets a new id. */
  id: number;
  /** Canonical `AAAA-MM`. */
  competencia: string;
  monthLabel: string;
  fileName: string;
  importedAt: string;
}

function toBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
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
async function writeRequest(url: string, method: 'PUT' | 'DELETE', body?: unknown): Promise<Response> {
  const send = (token: string) =>
    fetch(url, {
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

async function errorOf(res: Response): Promise<string> {
  const { error } = await res.json().catch(() => ({ error: '' }));
  return error || `HTTP ${res.status}`;
}

export async function listStoredMonths(): Promise<StoredMonth[]> {
  try {
    localStorage.removeItem(LEGACY_KEY);
  } catch {
    /* nothing stored */
  }
  const res = await fetch(API, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Servidor respondeu HTTP ${res.status}`);
  return (await res.json()) as StoredMonth[];
}

/** Each version id never changes, so the browser caches the file after the first download. */
export async function fetchMonthFile(id: number): Promise<Uint8Array> {
  const res = await fetch(`${API}/arquivo/${id}`);
  if (!res.ok) throw new Error(`Servidor respondeu HTTP ${res.status}`);
  return new Uint8Array(await res.arrayBuffer());
}

export async function saveMonth(
  competencia: string,
  data: Uint8Array,
  fileName: string,
  monthLabel: string
): Promise<{ saved: StoredMonth } | { error: string }> {
  try {
    const res = await writeRequest(`${API}/${competencia}`, 'PUT', { fileName, monthLabel, base64: toBase64(data) });
    if (res.ok) return { saved: (await res.json()) as StoredMonth };
    return { error: await errorOf(res) };
  } catch {
    return { error: 'Servidor indisponível.' };
  }
}

/** Deletes every stored version of the month. Returns an error message, or null on success. */
export async function removeMonth(competencia: string): Promise<string | null> {
  try {
    const res = await writeRequest(`${API}/${competencia}`, 'DELETE');
    return res.ok ? null : await errorOf(res);
  } catch {
    return 'Servidor indisponível.';
  }
}
