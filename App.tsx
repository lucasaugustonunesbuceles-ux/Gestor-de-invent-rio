
import React, { useState, useCallback, useEffect } from 'react';
import { InventoryItem } from './types';
import { INITIAL_ITEMS } from './constants';
import InventoryTable from './components/InventoryTable';
import InventoryDashboard from './components/InventoryDashboard';
import AIAssistant from './components/AIAssistant';
import BackupView from './components/BackupView';

const App: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('inventory_data');
    return saved ? JSON.parse(saved) : INITIAL_ITEMS;
  });
  
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'backup'>('dashboard');

  useEffect(() => {
    localStorage.setItem('inventory_data', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

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
    setActiveTab('inventory');
  };

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  return (
    <div className={`min-h-screen transition-colors duration-500 ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* Navigation / Header */}
      <nav className={`${theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-200'} border-b px-6 py-4 sticky top-0 z-50 backdrop-blur-md transition-colors`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <i className="fas fa-box-open text-xl"></i>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-black tracking-tight leading-none bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">ESTOQUE PRO</h1>
              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Smart Management</span>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-2xl">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${activeTab === 'dashboard' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              <i className="fas fa-chart-pie mr-2"></i> Painel
            </button>
            <button 
              onClick={() => setActiveTab('inventory')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${activeTab === 'inventory' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              <i className="fas fa-list-ul mr-2"></i> Itens
            </button>
            <button 
              onClick={() => setActiveTab('backup')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${activeTab === 'backup' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              <i className="fas fa-shield-alt mr-2"></i> Backup
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={toggleTheme}
              className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${theme === 'dark' ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              title="Trocar tema"
            >
              <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
            </button>
            <button 
              onClick={handleAddItem}
              className="hidden md:flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95"
            >
              <i className="fas fa-plus"></i>
              Adicionar
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <InventoryDashboard items={items} />
            <AIAssistant items={items} />
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-black">Gerenciar Estoque</h2>
                <p className="text-slate-500 dark:text-slate-400">Visualize e edite sua lista de materiais em tempo real.</p>
              </div>
              <button 
                onClick={handleAddItem}
                className="md:hidden flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-xl"
              >
                <i className="fas fa-plus"></i>
              </button>
            </div>
            <InventoryTable 
              items={items} 
              onUpdate={handleUpdateItem} 
              onDelete={handleDeleteItem} 
            />
          </div>
        )}

        {activeTab === 'backup' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <BackupView items={items} setItems={setItems} />
          </div>
        )}

        <footer className={`mt-20 py-10 border-t ${theme === 'dark' ? 'border-slate-900 text-slate-600' : 'border-slate-200 text-slate-400'} text-center text-xs font-medium uppercase tracking-widest`}>
          <p>© 2024 Estoque Pro • Inteligência Aplicada ao seu Negócio</p>
        </footer>
      </main>
    </div>
  );
};

export default App;
