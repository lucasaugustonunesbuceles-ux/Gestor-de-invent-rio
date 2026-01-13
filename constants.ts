
import { InventoryItem } from './types';

export const INITIAL_ITEMS: InventoryItem[] = [
  { 
    id: '1', 
    name: 'Lapiseiras', 
    quantity: 2, 
    category: 'Escrita', 
    unit: 'un', 
    lastUpdated: new Date().toISOString() 
  },
  { 
    id: '2', 
    name: 'Carimbos', 
    quantity: 4, 
    category: 'Escrita', 
    unit: 'un', 
    lastUpdated: new Date().toISOString() 
  },
  { 
    id: '3', 
    name: 'Pincel (Quadro Branco)', 
    quantity: 1, 
    category: 'Escrita', 
    unit: 'un', 
    lastUpdated: new Date().toISOString() 
  }
];
