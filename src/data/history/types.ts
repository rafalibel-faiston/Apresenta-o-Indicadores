import { Slide } from '../../types';

export interface HistorySnapshot {
  mesAbrev: string;
  archivedAt: string;
  slides: Slide[];
}

export interface HistoryMonth extends HistorySnapshot {
  slug: string;
}
