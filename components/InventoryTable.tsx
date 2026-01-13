
import React, { useState } from 'react';
import { InventoryItem, Category } from '../types';

interface Props {
  items: InventoryItem[];
  onUpdate: (id: string, updates: Partial<InventoryItem>) => void;
  onDelete: (id: string) => void;
}

const CATEGORIES: Category[] = ['Escrita', 'Grampeamento', 'Organização', 'Papelaria', 'Outros'];

const InventoryTable: React.FC<Props> = ({ items, onUpdate, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 overflow-hidden transition-all">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
        <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-3">
          <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
          Tabela de Inventário
        </h2>
        <div className="relative w-full md:w-80 group">
          <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 group-focus-within:text-blue-500 transition-colors">
            <i className="fas fa-search"></i>
          </span>
          <input
            type="text"
            placeholder="O que você está procurando?"
            className="block w-full pl-11 pr-4 py-3 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/50 outline-none dark:text-white transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/40 text-slate-400 dark:text-slate-500 text-[11px] uppercase font-black tracking-widest">
              <th className="px-8 py-5">Material</th>
              <th className="px-8 py-5">Quantidade</th>
              <th className="px-8 py-5">Unidade</th>
              <th className="px-8 py-5">Categoria</th>
              <th className="px-8 py-5">Última Ref.</th>
              <th className="px-8 py-5 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredItems.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group/row">
                <td className="px-8 py-5">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => onUpdate(item.id, { name: e.target.value })}
                    className="bg-transparent border-none focus:ring-0 w-full font-bold dark:text-slate-200 py-1"
                  />
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => onUpdate(item.id, { quantity: Math.max(0, item.quantity - 1) })}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors text-slate-600 dark:text-slate-300 active:scale-90"
                    >
                      <i className="fas fa-minus text-[10px]"></i>
                    </button>
                    <span className="w-6 text-center font-black text-blue-600 dark:text-blue-400 text-lg">{item.quantity}</span>
                    <button 
                      onClick={() => onUpdate(item.id, { quantity: item.quantity + 1 })}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors text-slate-600 dark:text-slate-300 active:scale-90"
                    >
                      <i className="fas fa-plus text-[10px]"></i>
                    </button>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <input
                    type="text"
                    value={item.unit}
                    onChange={(e) => onUpdate(item.id, { unit: e.target.value })}
                    className="bg-transparent border-none focus:ring-0 w-12 text-slate-500 font-medium"
                  />
                </td>
                <td className="px-8 py-5">
                  <select
                    value={item.category}
                    onChange={(e) => onUpdate(item.id, { category: e.target.value })}
                    className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-[11px] font-black uppercase px-3 py-1.5 rounded-xl border-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer transition-all"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat} className="dark:bg-slate-800">{cat}</option>
                    ))}
                  </select>
                </td>
                <td className="px-8 py-5 text-sm font-medium text-slate-400 dark:text-slate-500">
                  {new Date(item.lastUpdated).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                </td>
                <td className="px-8 py-5 text-right">
                  <button 
                    onClick={() => onDelete(item.id)}
                    className="text-slate-300 hover:text-red-500 dark:hover:text-red-400 p-2 md:opacity-0 group-hover/row:opacity-100 transition-all duration-300 hover:scale-125"
                    title="Remover Item"
                  >
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </td>
              </tr>
            ))}
            {filteredItems.length === 0 && (
              <tr>
                <td colSpan={6} className="px-8 py-20 text-center">
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <i className="fas fa-ghost text-4xl mb-2 opacity-20"></i>
                    <p className="font-bold">Nada encontrado</p>
                    <p className="text-xs uppercase tracking-widest">Tente outro termo de busca</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryTable;
