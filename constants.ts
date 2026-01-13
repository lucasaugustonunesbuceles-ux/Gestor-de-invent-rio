
import { InventoryItem } from './types';

export const INITIAL_ITEMS: InventoryItem[] = [
  { id: '1', name: 'Lapiseiras', quantity: 2, category: 'Escrita', unit: 'un', lastUpdated: new Date().toISOString() },
  { id: '2', name: 'Carimbos', quantity: 4, category: 'Escrita', unit: 'un', lastUpdated: new Date().toISOString() },
  { id: '3', name: 'Pincel (Quadro Branco)', quantity: 1, category: 'Escrita', unit: 'un', lastUpdated: new Date().toISOString() },
  { id: '4', name: 'Hidrocor (Caixa 12 cores)', quantity: 1, category: 'Escrita', unit: 'cx', lastUpdated: new Date().toISOString() },
  { id: '5', name: 'Rolos de Fita', quantity: 2, category: 'Organização', unit: 'un', lastUpdated: new Date().toISOString() },
  { id: '6', name: 'Extratores de Grampo', quantity: 5, category: 'Grampeamento', unit: 'un', lastUpdated: new Date().toISOString() },
  { id: '7', name: 'Molha + Dedos', quantity: 1, category: 'Escrita', unit: 'un', lastUpdated: new Date().toISOString() },
  { id: '8', name: 'Grampeadores', quantity: 3, category: 'Grampeamento', unit: 'un', lastUpdated: new Date().toISOString() },
  { id: '9', name: 'Grafite 0.9mm (Tubos)', quantity: 4, category: 'Escrita', unit: 'tubo', lastUpdated: new Date().toISOString() },
  { id: '10', name: 'Grampos 26/6 (Caixas)', quantity: 8, category: 'Grampeamento', unit: 'cx', lastUpdated: new Date().toISOString() },
  { id: '11', name: 'Grampos 23/10 (Caixas)', quantity: 4, category: 'Grampeamento', unit: 'cx', lastUpdated: new Date().toISOString() },
  { id: '12', name: 'Grafite (Outros Tubos)', quantity: 11, category: 'Escrita', unit: 'tubo', lastUpdated: new Date().toISOString() },
  { id: '13', name: 'Marca Textos (Verdes)', quantity: 2, category: 'Escrita', unit: 'un', lastUpdated: new Date().toISOString() },
  { id: '14', name: 'Réguas', quantity: 3, category: 'Papelaria', unit: 'un', lastUpdated: new Date().toISOString() },
];
