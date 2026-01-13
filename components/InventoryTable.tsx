
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-xl font-semibold text-gray-800">Planilha de Materiais</h2>
        <div className="relative w-full md:w-72">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <i className="fas fa-search"></i>
          </span>
          <input
            type="text"
            placeholder="Buscar material..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-sm uppercase tracking-wider">
              <th className="px-6 py-4 font-medium">Material</th>
              <th className="px-6 py-4 font-medium">Quantidade</th>
              <th className="px-6 py-4 font-medium">Unidade</th>
              <th className="px-6 py-4 font-medium">Categoria</th>
              <th className="px-6 py-4 font-medium">Última Atualização</th>
              <th className="px-6 py-4 font-medium text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredItems.map((item) => (
              <tr key={item.id} className="hover:bg-blue-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => onUpdate(item.id, { name: e.target.value })}
                    className="bg-transparent border-b border-transparent hover:border-gray-200 focus:border-blue-300 focus:outline-none w-full font-medium py-1 transition-all"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => onUpdate(item.id, { quantity: Math.max(0, item.quantity - 1) })}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600"
                    >
                      <i className="fas fa-minus text-[10px]"></i>
                    </button>
                    <span className="w-8 text-center font-bold text-blue-600">{item.quantity}</span>
                    <button 
                      onClick={() => onUpdate(item.id, { quantity: item.quantity + 1 })}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-600"
                    >
                      <i className="fas fa-plus text-[10px]"></i>
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <input
                    type="text"
                    value={item.unit}
                    onChange={(e) => onUpdate(item.id, { unit: e.target.value })}
                    className="bg-transparent border-b border-transparent hover:border-gray-200 focus:border-blue-300 focus:outline-none w-16 text-gray-600 py-1 transition-all"
                  />
                </td>
                <td className="px-6 py-4">
                  <select
                    value={item.category}
                    onChange={(e) => onUpdate(item.id, { category: e.target.value })}
                    className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full border-none focus:ring-2 focus:ring-blue-500 cursor-pointer appearance-none outline-none"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4 text-sm text-gray-400">
                  {new Date(item.lastUpdated).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => onDelete(item.id)}
                    className="text-red-400 hover:text-red-600 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Excluir"
                  >
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </td>
              </tr>
            ))}
            {filteredItems.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-400 italic">
                  Nenhum item encontrado.
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
