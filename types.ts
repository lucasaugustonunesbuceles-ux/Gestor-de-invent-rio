
export type UserRole = 'ADM' | 'VISITANTE';

export interface RegisteredUser {
  username: string;
  password: string;
  securityQuestion: string;
  securityAnswer: string;
  role: UserRole;
}

export interface UserSession {
  username: string;
  role: UserRole;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  minStock: number;
  category: string;
  unit: string;
  lastUpdated: string;
}

export interface WithdrawalRecord {
  id: string;
  itemId: string;
  itemName: string;
  withdrawnBy: string;
  quantity: number;
  timestamp: string;
}

export interface ActionLog {
  id: string;
  user: string;
  role: UserRole;
  action: string;
  details: string;
  timestamp: string;
}

export type Category = 'Escrita' | 'Grampeamento' | 'Organização' | 'Papelaria' | 'Outros';

export interface AIInsight {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
}
