
export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  category: string;
  unit: string;
  lastUpdated: string;
}

export type Category = 'Escrita' | 'Grampeamento' | 'Organização' | 'Papelaria' | 'Outros';

export interface AIInsight {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
}
