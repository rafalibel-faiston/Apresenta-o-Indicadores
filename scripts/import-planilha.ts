// Importa a planilha do Google Sheets e regenera `src/data/slidesData.ts`.
//
// Antes de sobrescrever, arquiva o mês atualmente salvo em `src/data/history/`
// (um snapshot em JSON por mês), para que os dados de meses anteriores nunca se
// percam quando a planilha do mês novo for importada.
//
// Uso:
//   npm run importar-planilha                       (usa VITE_GOOGLE_SHEET_ID do .env)
//   npm run importar-planilha -- <ID_DA_PLANILHA>    (ou passa o ID direto)
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { slidesData as currentSlides } from '../src/data/slidesData';
import { currentMesAbrev } from '../src/data/meta';
import { ALL_TABS, TABS } from '../src/data/sheet/schema';
import { fetchSheetTab } from '../src/data/sheet/googleSheets';
import { buildSlides } from '../src/data/sheet/transform';
import { SheetData } from '../src/data/sheet/types';
import { SheetRow } from '../src/data/sheet/csv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SLIDES_DATA_PATH = path.join(ROOT, 'src/data/slidesData.ts');
const META_PATH = path.join(ROOT, 'src/data/meta.ts');
const HISTORY_DIR = path.join(ROOT, 'src/data/history');

const MESES_PT: Record<string, string> = {
  JAN: '01', FEV: '02', MAR: '03', ABR: '04', MAI: '05', JUN: '06',
  JUL: '07', AGO: '08', SET: '09', OUT: '10', NOV: '11', DEZ: '12',
};

// "JUN.26" -> "2026-06" (ordenável). Se o formato não bater, cai para um slug
// simples a partir do texto — perde a ordenação cronológica, mas não quebra.
function slugForMesAbrev(mesAbrev: string): string {
  const match = /^([A-ZÇ]{3})\.(\d{2})$/i.exec(mesAbrev.trim());
  if (match) {
    const mes = MESES_PT[match[1].toUpperCase()];
    if (mes) return `20${match[2]}-${mes}`;
  }
  return mesAbrev.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function serializeSlidesData(slides: unknown): string {
  return `import { Slide } from '../types';\n\nexport const slidesData: Slide[] = ${JSON.stringify(slides, null, 2)};\n`;
}

async function main() {
  const sheetId = process.argv[2] || process.env.VITE_GOOGLE_SHEET_ID;
  if (!sheetId) {
    console.error(
      '[importar-planilha] Nenhum ID de planilha informado. Configure VITE_GOOGLE_SHEET_ID no .env ou passe como argumento:\n' +
      '  npm run importar-planilha -- <ID_DA_PLANILHA>'
    );
    process.exit(1);
  }

  console.log(`[importar-planilha] Buscando abas da planilha ${sheetId}...`);
  const entries = await Promise.all(
    ALL_TABS.map(async (tab): Promise<[string, SheetRow[]]> => {
      try {
        return [tab, await fetchSheetTab(sheetId, tab)];
      } catch (err) {
        console.warn(`[importar-planilha] Não foi possível carregar a aba "${tab}": ${(err as Error).message}`);
        return [tab, []];
      }
    })
  );
  const data: SheetData = Object.fromEntries(entries);

  const globalMeta = (data[TABS.META] || []).filter((r) => (r.slide || '').trim() === 'global');
  const newMesAbrev = globalMeta.find((r) => (r.key || '').trim() === 'mesAbrev')?.value?.trim();

  if (!newMesAbrev) {
    console.error(
      '[importar-planilha] A aba "Meta" não tem uma linha "global" / "mesAbrev" preenchida — não dá pra saber ' +
      'a qual mês os dados importados pertencem, então nada foi alterado. Preencha essa célula na planilha e tente de novo.'
    );
    process.exit(1);
  }

  mkdirSync(HISTORY_DIR, { recursive: true });

  if (newMesAbrev !== currentMesAbrev) {
    const slug = slugForMesAbrev(currentMesAbrev);
    const archivePath = path.join(HISTORY_DIR, `${slug}.json`);
    const snapshot = {
      mesAbrev: currentMesAbrev,
      archivedAt: new Date().toISOString(),
      slides: currentSlides,
    };
    writeFileSync(archivePath, JSON.stringify(snapshot, null, 2) + '\n', 'utf-8');
    console.log(`[importar-planilha] Mês anterior (${currentMesAbrev}) arquivado em src/data/history/${slug}.json`);
  } else {
    console.log(`[importar-planilha] Planilha ainda é do mês atual (${currentMesAbrev}) — nada para arquivar, só atualizando os dados.`);
  }

  const newSlides = buildSlides(currentSlides, data);

  writeFileSync(SLIDES_DATA_PATH, serializeSlidesData(newSlides), 'utf-8');
  console.log(`[importar-planilha] src/data/slidesData.ts atualizado com os dados de ${newMesAbrev}.`);

  const metaContent = readFileSync(META_PATH, 'utf-8').replace(
    /export const currentMesAbrev = '.*?';/,
    `export const currentMesAbrev = '${newMesAbrev}';`
  );
  writeFileSync(META_PATH, metaContent, 'utf-8');
  console.log(`[importar-planilha] src/data/meta.ts atualizado (currentMesAbrev = "${newMesAbrev}").`);

  console.log('[importar-planilha] Concluído. Confira o diff (git diff) antes de commitar.');
}

main().catch((err) => {
  console.error('[importar-planilha] Falha ao importar a planilha:', err);
  process.exit(1);
});
