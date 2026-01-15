
import React, { useState } from 'react';
import { InventoryItem, Category } from '../types';

interface Props {
  items: InventoryItem[];
  onUpdate: (id: string, updates: Partial<InventoryItem>) => void;
  onDelete: (id: string) => void;
  editable?: boolean;
}

const CATEGORIES: Category[] = ['Escrita', 'Grampeamento', 'Organização', 'Papelaria', 'Outros'];

const InventoryTable: React.FC<Props> = ({ items, onUpdate, onDelete, editable = false }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-slate-900 rounded-[2rem] shadow-none border border-slate-800 overflow-hidden transition-all">
      <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
        <h2 className="text-xl font-black text-white flex items-center gap-3">
          <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
          Lista de Materiais
        </h2>
        <div className="relative w-full md:w-80 group">
          <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 group-focus-within:text-blue-500 transition-colors">
            <i className="fas fa-search"></i>
          </span>
          <input
            type="text"
            placeholder="Buscar por nome ou categoria..."
            className="block w-full pl-11 pr-4 py-3 bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/50 outline-none text-white transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-800/40 text-slate-500 text-[11px] uppercase font-black tracking-widest">
              <th className="px-8 py-5">Material</th>
              <th className="px-8 py-5 text-center">Saldo Atual</th>
              <th className="px-8 py-5 text-center">Mín. Sugerido</th>
              <th className="px-8 py-5">Categoria</th>
              <th className="px-8 py-5 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filteredItems.map((item) => {
              const isLowStock = item.quantity < item.minStock;

              return (
                <tr key={item.id} className="hover:bg-slate-800/30 transition-colors group/row">
                  <td className="px-8 py-5">
                    <input
                      type="text"
                      disabled={!editable}
                      value={item.name}
                      onChange={(e) => onUpdate(item.id, { name: e.target.value })}
                      className={`bg-transparent border-none focus:ring-0 w-full font-bold text-slate-200 py-1 ${!editable ? 'cursor-default' : ''}`}
                    />
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col items-center">
                      <div className="flex items-center gap-3">
                        {editable && (
                          <button 
                            onClick={() => onUpdate(item.id, { quantity: Math.max(0, item.quantity - 1) })}
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors text-slate-300 active:scale-90"
                          >
                            <i className="fas fa-minus text-[10px]"></i>
                          </button>
                        )}
                        <span className={`w-8 text-center font-black text-lg ${isLowStock ? 'text-red-400 animate-pulse' : 'text-blue-400'}`}>
                          {item.quantity}
                        </span>
                        {editable && (
                          <button 
                            onClick={() => onUpdate(item.id, { quantity: item.quantity + 1 })}
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors text-slate-300 active:scale-90"
                          >
                            <i className="fas fa-plus text-[10px]"></i>
                          </button>
                        )}
                      </div>
                      {isLowStock && <span className="text-[9px] font-black text-red-500/80 uppercase mt-1">Reposição!</span>}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center justify-center">
                      <input
                        type="number"
                        disabled={!editable}
                        value={item.minStock}
                        onChange={(e) => onUpdate(item.id, { minStock: Math.max(0, parseInt(e.target.value) || 0) })}
                        className={`bg-slate-800/50 border border-slate-700/50 rounded-lg w-16 text-center py-1 text-sm font-bold text-slate-400 focus:ring-1 focus:ring-blue-500 outline-none ${!editable ? 'cursor-default' : ''}`}
                      />
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <select
                      disabled={!editable}
                      value={item.category}
                      onChange={(e) => onUpdate(item.id, { category: e.target.value })}
                      className={`bg-blue-900/20 text-blue-400 text-[11px] font-black uppercase px-3 py-1.5 rounded-xl border-none focus:ring-2 focus:ring-blue-500/50 transition-all ${!editable ? 'cursor-default appearance-none' : 'cursor-pointer'}`}
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat} className="bg-slate-800">{cat}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-8 py-5 text-right">
                    {editable && (
                      <button 
                        onClick={() => onDelete(item.id)}
                        className="text-slate-300 hover:text-red-400 p-2 md:opacity-0 group-hover/row:opacity-100 transition-all duration-300 hover:scale-125"
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryTable;
