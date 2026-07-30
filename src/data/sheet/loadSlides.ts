import { Slide } from '../../types';
import { ALL_TABS, TABS } from './schema';
import { fetchSheetTab } from './googleSheets';
import { buildSlides } from './transform';
import { SheetData } from './types';
import { SheetRow } from './csv';

export interface LoadSlidesResult {
  slides: Slide[];
  mesAbrev?: string;
}

export async function loadSlidesFromGoogleSheet(sheetId: string, staticSlides: Slide[]): Promise<LoadSlidesResult> {
  const entries = await Promise.all(
    ALL_TABS.map(async (tab): Promise<[string, SheetRow[]]> => {
      try {
        return [tab, await fetchSheetTab(sheetId, tab)];
      } catch (err) {
        console.warn(`[planilha] Não foi possível carregar a aba "${tab}":`, err);
        return [tab, []];
      }
    })
  );

  const data: SheetData = Object.fromEntries(entries);

  const globalMeta = (data[TABS.META] || []).filter((r) => (r.slide || '').trim() === 'global');
  const mesAbrev = globalMeta.find((r) => (r.key || '').trim() === 'mesAbrev')?.value;

  const slides = buildSlides(staticSlides, data);
  return { slides, mesAbrev };
}
