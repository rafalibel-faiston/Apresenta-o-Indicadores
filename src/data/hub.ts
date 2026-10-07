import { Slide } from '../types';
import { CompetenciaOption, Workbook as SheetWorkbook } from './sheet/loadSlides';
import { competenciaLabel, normalizeCompetencia } from './sheet/competencia';
import { BackedPredicate, buildSnapshots } from './sheet/series';
import { withComparativeSlides } from './sheet/comparativeSlides';
import { Workbook as XlsxWorkbook } from './workbook/readXlsx';
import { importWorkbook } from './workbook/importWorkbook';

// The presentation hub: every competência the presentation knows about, from
// two sources merged into one history —
//   - the Google Sheets workbook (data/sheet), when VITE_GOOGLE_SHEET_ID is set;
//   - the closing workbooks (.xlsx) uploaded month by month and stored on the
//     server (data/workbook/storage.ts).
// An uploaded month wins over the same month in Google Sheets. All months feed
// the comparative slides (evolution and consolidated table).

export interface ImportedMonth {
  competencia: string;
  monthLabel: string;
  fileName: string;
  wb: XlsxWorkbook;
  importedAt?: string;
  /** 'saving' while the upload is in flight; an error message when the server refused it. */
  saveState: 'saving' | 'saved' | { error: string };
}

export interface Hub {
  /** Every competência, oldest first. Empty when there is no history at all. */
  competencias: CompetenciaOption[];
  /**
   * Ready-to-present deck, including the comparative slides unless `comparativos`
   * is false. `recorte` limits the comparison to the picked competências (the
   * presented month always joins).
   */
  slidesFor(competencia: string, recorte?: string[] | null, comparativos?: boolean): Slide[];
  /** Deck an uploaded workbook of this month is applied on top of. */
  baseFor(competencia: string | null): Slide[];
  /** Deck when no competência is selected. */
  fallbackSlides: Slide[];
  fallbackMesAbrev?: string;
}

export function buildHub(sheet: SheetWorkbook | null, imports: ImportedMonth[], staticSlides: Slide[]): Hub {
  const decks = new Map<string, Slide[]>(sheet?.decks ?? []);
  const backed = new Map<string, BackedPredicate>(sheet?.backed ?? []);
  const options = new Map<string, CompetenciaOption>((sheet?.competencias ?? []).map((o) => [o.competencia, o]));

  // A sheet with no `mes` column is a single snapshot (today's presentation).
  // Once months are uploaded, it joins the history as the month of its badge,
  // so it can be compared with them — unless that month was uploaded too.
  const legacySheet = sheet && sheet.competencias.length === 0 ? sheet : null;
  const legacyCompetencia = legacySheet ? normalizeCompetencia(legacySheet.fallbackMesAbrev) : null;
  if (imports.length && legacySheet && legacyCompetencia) {
    decks.set(legacyCompetencia, legacySheet.fallbackSlides);
    options.set(legacyCompetencia, {
      competencia: legacyCompetencia,
      abbr: legacySheet.fallbackMesAbrev!,
      label: competenciaLabel(legacyCompetencia),
      source: 'sheets',
    });
  }

  const baseFor = (competencia: string | null): Slide[] =>
    (competencia && sheet?.decks.get(competencia)) || legacySheet?.fallbackSlides || staticSlides;

  imports.forEach((month) => {
    const { slides, report } = importWorkbook(month.wb, baseFor(month.competencia), month.monthLabel);
    // Slides the workbook did not fill keep the base deck's numbers — those must
    // not show up in the comparison as this month's data.
    const filled = new Set(report.filter((r) => r.status !== 'kept').map((r) => r.id));
    decks.set(month.competencia, slides);
    backed.set(month.competencia, (_tab, slideId) => filled.has(slideId));
    options.set(month.competencia, {
      competencia: month.competencia,
      abbr: month.monthLabel,
      label: competenciaLabel(month.competencia),
      source: 'importada',
    });
  });

  const snapshots = buildSnapshots(decks, backed);
  const fallbackSlides = sheet?.fallbackSlides ?? staticSlides;

  return {
    competencias: Array.from(options.values()).sort((a, b) => (a.competencia < b.competencia ? -1 : 1)),
    slidesFor(competencia, recorte, comparativos = true) {
      const deck = decks.get(competencia);
      if (!deck) return fallbackSlides;
      return comparativos ? withComparativeSlides(deck, snapshots, competencia, recorte) : deck;
    },
    baseFor,
    fallbackSlides,
    fallbackMesAbrev: sheet?.fallbackMesAbrev,
  };
}
