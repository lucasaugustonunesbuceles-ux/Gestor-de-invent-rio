
import { InventoryItem } from './types';

export const INITIAL_ITEMS: InventoryItem[] = [
  { 
    id: '1', 
    name: '2 Lapiseiras', 
    quantity: 2, 
    minStock: 5, 
    category: 'Escrita', 
    unit: 'un', 
    lastUpdated: new Date().toISOString() 
  },
  { 
    id: '2', 
    name: '4 Carimbos', 
    quantity: 4, 
    minStock: 2, 
    category: 'Escrita', 
    unit: 'un', 
    lastUpdated: new Date().toISOString() 
  },
  { 
    id: '3', 
    name: '1 Pincel', 
    quantity: 1, 
    minStock: 3, 
    category: 'Escrita', 
    unit: 'un', 
    lastUpdated: new Date().toISOString() 
  }
];
