import { HistoryMonth, HistorySnapshot } from './types';

// Cada importação da planilha (scripts/import-planilha.ts) salva o mês que está
// prestes a ser substituído como um arquivo `AAAA-MM.json` aqui dentro, antes de
// sobrescrever `slidesData.ts`. O glob abaixo descobre esses arquivos automaticamente
// — nenhum índice manual precisa ser mantido.
const modules = import.meta.glob('./*.json', { eager: true, import: 'default' }) as Record<string, HistorySnapshot>;

export const historyMonths: HistoryMonth[] = Object.entries(modules)
  .map(([path, snapshot]) => ({
    slug: path.replace('./', '').replace('.json', ''),
    ...snapshot,
  }))
  .sort((a, b) => b.slug.localeCompare(a.slug));
