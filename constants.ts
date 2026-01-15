
import { InventoryItem } from './types';

export const INITIAL_ITEMS: InventoryItem[] = [
  { 
    id: '1', 
    name: 'Lapiseiras', 
    quantity: 2, 
    minStock: 5, 
    category: 'Escrita', 
    unit: 'un', 
    lastUpdated: new Date().toISOString() 
  },
  { 
    id: '2', 
    name: 'Carimbos', 
    quantity: 4, 
    minStock: 2, 
    category: 'Escrita', 
    unit: 'un', 
    lastUpdated: new Date().toISOString() 
  },
  { 
    id: '3', 
    name: 'Pincel (Quadro Branco)', 
    quantity: 1, 
    minStock: 3, 
    category: 'Escrita', 
    unit: 'un', 
    lastUpdated: new Date().toISOString() 
  },
  { 
    id: '4', 
    name: 'Blocos Adesivos', 
    quantity: 14, 
    minStock: 5, 
    category: 'Papelaria', 
    unit: 'un', 
    lastUpdated: new Date().toISOString() 
  },
  { 
    id: '5', 
    name: 'Hidrocor', 
    quantity: 1, 
    minStock: 5, 
    category: 'Escrita', 
    unit: 'un', 
    lastUpdated: new Date().toISOString() 
  },
  { 
    id: '6', 
    name: 'Rolos de Fita Dupla Face', 
    quantity: 2, 
    minStock: 2, 
    category: 'Papelaria', 
    unit: 'un', 
    lastUpdated: new Date().toISOString() 
  },
  { 
    id: '7', 
    name: 'Extratores de Grampo', 
    quantity: 5, 
    minStock: 2, 
    category: 'Grampeamento', 
    unit: 'un', 
    lastUpdated: new Date().toISOString() 
  },
  { 
    id: '8', 
    name: 'Molha Dedos', 
    quantity: 1, 
    minStock: 1, 
    category: 'Papelaria', 
    unit: 'un', 
    lastUpdated: new Date().toISOString() 
  },
  { 
    id: '9', 
    name: 'Grampeadores', 
    quantity: 3, 
    minStock: 2, 
    category: 'Grampeamento', 
    unit: 'un', 
    lastUpdated: new Date().toISOString() 
  },
  { 
    id: '10', 
    name: 'Tubos de Grafite 0.9mm', 
    quantity: 11, 
    minStock: 5, 
    category: 'Escrita', 
    unit: 'un', 
    lastUpdated: new Date().toISOString() 
  },
  { 
    id: '11', 
    name: 'Grampos 26/6', 
    quantity: 4, 
    minStock: 5, 
    category: 'Grampeamento', 
    unit: 'cx', 
    lastUpdated: new Date().toISOString() 
  },
  { 
    id: '12', 
    name: 'Grampos 23/10', 
    quantity: 2, 
    minStock: 5, 
    category: 'Grampeamento', 
    unit: 'cx', 
    lastUpdated: new Date().toISOString() 
  },
  { 
    id: '13', 
    name: 'Marca Textos', 
    quantity: 4, 
    minStock: 5, 
    category: 'Escrita', 
    unit: 'un', 
    lastUpdated: new Date().toISOString() 
  },
  { 
    id: '14', 
    name: 'Réguas', 
    quantity: 3, 
    minStock: 3, 
    category: 'Papelaria', 
    unit: 'un', 
    lastUpdated: new Date().toISOString() 
  }
];
