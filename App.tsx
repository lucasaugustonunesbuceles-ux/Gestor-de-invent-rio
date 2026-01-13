
import React, { useState, useCallback } from 'react';
import { InventoryItem } from './types';
import { INITIAL_ITEMS } from './constants';
import InventoryTable from './components/InventoryTable';
import InventoryDashboard from './components/InventoryDashboard';
import AIAssistant from './components/AIAssistant';

const App: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>(INITIAL_ITEMS);

  const handleUpdateItem = useCallback((id: string, updates: Partial<InventoryItem>) => {
    setItems(prev => prev.map(item => 
      item.id === id 
        ? { ...item, ...updates, lastUpdated: new Date().toISOString() } 
        : item
    ));
  }, []);

  const handleDeleteItem = useCallback((id: string) => {
    if (window.confirm('Deseja realmente excluir este item?')) {
      setItems(prev => prev.filter(item => item.id !== id));
    }
  }, []);

  const handleAddItem = () => {
    const newItem: InventoryItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'Novo Material',
      quantity: 1,
      category: 'Outros',
      unit: 'un',
      lastUpdated: new Date().toISOString()
    };
    setItems(prev => [newItem, ...prev]);
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Material', 'Quantidade', 'Unidade', 'Categoria', 'Ultima Atualizacao'];
    const rows = items.map(i => [i.id, i.name, i.quantity, i.unit, i.category, i.lastUpdated]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "meu_inventario.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen pb-12">
      {/* Navigation / Header */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <i className="fas fa-boxes-stacked text-xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-none">Estoque Pro</h1>
              <span className="text-xs text-gray-500 font-medium">Gestão Inteligente</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleExportCSV}
              className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
            >
              <i className="fas fa-file-export"></i>
              Exportar CSV
            </button>
            <button 
              onClick={handleAddItem}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg shadow-blue-500/30 transition-all"
            >
              <i className="fas fa-plus"></i>
              Novo Item
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 mt-8">
        {/* Statistics and Dashboard */}
        <InventoryDashboard items={items} />

        {/* AI Assistant Section */}
        <AIAssistant items={items} />

        {/* Main Table Section */}
        <div className="mt-8">
          <InventoryTable 
            items={items} 
            onUpdate={handleUpdateItem} 
            onDelete={handleDeleteItem} 
          />
        </div>

        {/* Footer Area */}
        <footer className="mt-12 pt-8 border-t border-gray-200 text-center text-gray-400 text-sm">
          <p>© 2024 Gestor de Materiais Inteligente. Desenvolvido para máxima produtividade.</p>
        </footer>
      </main>

      {/* Floating Action for Mobile Export */}
      <div className="md:hidden fixed bottom-6 right-6">
        <button 
          onClick={handleExportCSV}
          className="w-12 h-12 bg-white border border-gray-200 rounded-full shadow-lg flex items-center justify-center text-gray-600"
        >
          <i className="fas fa-download"></i>
        </button>
      </div>
    </div>
  );
};

export default App;
