export interface Slide {
  id: string;
  number: number;
  title: string;
  subtitle?: string;
  category: 'cover' | 'expeditions' | 'financials' | 'operations' | 'insurance' | 'contact' | 'divider';
  content: any;
}

export interface ProjectCost {
  project: string;
  cost: number;
  shipments?: number;
  equipments?: number;
  averageCost?: number;
}

export interface InsuranceItem {
  name: string;
  value: number;
  monthlyCost: number;
  rate?: string;
  description?: string;
}
