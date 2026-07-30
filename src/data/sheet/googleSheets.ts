import { csvToObjects, SheetRow } from './csv';

// Uses Google's "gviz" CSV export, which works for any sheet shared as
// "Anyone with the link" (Viewer) without needing an API key or OAuth.
export async function fetchSheetTab(sheetId: string, tabName: string): Promise<SheetRow[]> {
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

  return csvToObjects(text);
}
