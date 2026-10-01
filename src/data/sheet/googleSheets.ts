import { csvToObjects, parseCsv, SheetRow } from './csv';

// Uses Google's "gviz" CSV export, which works for any sheet shared as
// "Anyone with the link" (Viewer) without needing an API key or OAuth.
async function fetchSheetCsv(sheetId: string, tabName: string): Promise<string> {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tabName)}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(
      `Aba "${tabName}" indisponível (HTTP ${res.status}). Verifique se ela existe e se a planilha está compartilhada como "Qualquer pessoa com o link".`
    );
  }

  const text = await res.text();
  if (text.trim().toLowerCase().startsWith('<')) {
    throw new Error(
      `Aba "${tabName}" não encontrada ou a planilha não está pública. Confira o nome da aba e o compartilhamento.`
    );
  }

  return text;
}

export async function fetchSheetTab(sheetId: string, tabName: string): Promise<SheetRow[]> {
  return csvToObjects(await fetchSheetCsv(sheetId, tabName));
}

// Raw grid (header included) — used for control sheets whose header row is not
// necessarily the first one.
export async function fetchSheetGrid(sheetId: string, tabName: string): Promise<string[][]> {
  return parseCsv(await fetchSheetCsv(sheetId, tabName));
}
