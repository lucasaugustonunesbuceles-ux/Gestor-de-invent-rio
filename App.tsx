
import React, { useState, useCallback, useEffect } from 'react';
import { InventoryItem, WithdrawalRecord, UserSession, ActionLog } from './types';
import { INITIAL_ITEMS } from './constants';
import InventoryTable from './components/InventoryTable';
import InventoryDashboard from './components/InventoryDashboard';
import AIAssistant from './components/AIAssistant';
import BackupView from './components/BackupView';
import WithdrawalView from './components/WithdrawalView';
import Login from './components/Login';
import ActionLogsView from './components/ActionLogsView';
import InfoView from './components/InfoView';

const App: React.FC = () => {
  const [session, setSession] = useState<UserSession | null>(() => {
    const saved = sessionStorage.getItem('user_session');
    return saved ? JSON.parse(saved) : null;
  });

  const [items, setItems] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('inventory_data');
    return saved ? JSON.parse(saved) : INITIAL_ITEMS;
  });

  const [withdrawals, setWithdrawals] = useState<WithdrawalRecord[]>(() => {
    const saved = localStorage.getItem('withdrawal_records');
    return saved ? JSON.parse(saved) : [];
  });

  const [logs, setLogs] = useState<ActionLog[]>(() => {
    const saved = localStorage.getItem('action_logs');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'withdrawals' | 'backup' | 'logs' | 'info'>('dashboard');
  const [isSyncing, setIsSyncing] = useState(false);

  // Efeito para salvar no localStorage (Fallback enquanto não há banco de dados)
  useEffect(() => {
    localStorage.setItem('inventory_data', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('withdrawal_records', JSON.stringify(withdrawals));
  }, [withdrawals]);

  useEffect(() => {
    localStorage.setItem('action_logs', JSON.stringify(logs));
  }, [logs]);

  // Simulação de Sincronização Automática (Aqui entraria a chamada ao Banco de Dados)
  useEffect(() => {
    if (session) {
      const syncInterval = setInterval(() => {
        // setIsSyncing(true);
        // Exemplo: fetch('/api/inventory').then(...)
        // setTimeout(() => setIsSyncing(false), 1000);
      }, 30000); // Tenta sincronizar a cada 30 segundos
      return () => clearInterval(syncInterval);
    }
  }, [session]);

  const addLog = useCallback((action: string, details: string) => {
    if (!session) return;
    const newLog: ActionLog = {
      id: Math.random().toString(36).substr(2, 9),
      user: session.username,
      role: session.role,
      action,
      details,
      timestamp: new Date().toISOString()
    };
    setLogs(prev => [newLog, ...prev]);
  }, [session]);

  const handleUpdateItem = useCallback((id: string, updates: Partial<InventoryItem>) => {
    let logMsg = "";
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const changes = Object.entries(updates).map(([key, value]) => {
          const oldVal = item[key as keyof InventoryItem];
          if (oldVal !== value) {
            return `${key}: de "${oldVal}" para "${value}"`;
          }
          return null;
        }).filter(Boolean);

        if (changes.length > 0) {
          logMsg = `${item.name}: ${changes.join(', ')}`;
        }
        
        return { ...item, ...updates, lastUpdated: new Date().toISOString() };
      }
      return item;
    }));

    if (logMsg) {
      addLog('Atualização de Item', logMsg);
    }
  }, [addLog]);

  const handleDeleteItem = useCallback((id: string) => {
    const itemToDelete = items.find(i => i.id === id);
    if (itemToDelete && window.confirm(`Deseja excluir "${itemToDelete.name}"?`)) {
      setItems(prev => prev.filter(item => item.id !== id));
      addLog('Exclusão de Item', `Material removido: ${itemToDelete.name}`);
    }
  }, [items, addLog]);

  const handleAddItem = () => {
    const newItem: InventoryItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'Novo Material',
      quantity: 0,
      minStock: 1,
      category: 'Outros',
      unit: 'un',
      lastUpdated: new Date().toISOString()
    };
    setItems(prev => [newItem, ...prev]);
    addLog('Adição de Item', `Novo material: ${newItem.name}`);
    setActiveTab('inventory');
  };

  const handleRegisterWithdrawal = (record: WithdrawalRecord) => {
    setWithdrawals(prev => [record, ...prev]);
    setItems(prev => prev.map(item => 
      item.id === record.itemId 
        ? { ...item, quantity: Math.max(0, item.quantity - record.quantity), lastUpdated: new Date().toISOString() }
        : item
    ));
    addLog('Retirada', `${record.withdrawnBy} retirou ${record.quantity} un de ${record.itemName}`);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('user_session');
    setSession(null);
  };

  if (!session) {
    return <Login onLogin={(user) => {
      setSession(user);
      sessionStorage.setItem('user_session', JSON.stringify(user));
    }} />;
  }

  const isAdm = session.role === 'ADM';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <nav className="bg-slate-900 border-slate-800 border-b px-6 py-4 sticky top-0 z-50 backdrop-blur-md bg-opacity-80">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg">
              <i className="fas fa-layer-group text-xl"></i>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-black bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">THESTOK</h1>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase text-slate-500 font-bold">{session.role}: {session.username}</span>
                {isSyncing && <i className="fas fa-sync fa-spin text-[8px] text-indigo-400"></i>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-slate-800/50 p-1 rounded-2xl overflow-x-auto">
            <button onClick={() => setActiveTab('dashboard')} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === 'dashboard' ? 'bg-slate-700 text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}>
              <i className="fas fa-chart-pie md:mr-2"></i> <span className="hidden md:inline">Painel</span>
            </button>
            <button onClick={() => setActiveTab('inventory')} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === 'inventory' ? 'bg-slate-700 text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}>
              <i className="fas fa-list-ul md:mr-2"></i> <span className="hidden md:inline">Itens</span>
            </button>
            <button onClick={() => setActiveTab('withdrawals')} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === 'withdrawals' ? 'bg-slate-700 text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}>
              <i className="fas fa-hand-holding-box md:mr-2"></i> <span className="hidden md:inline">Retiradas</span>
            </button>
            <button onClick={() => setActiveTab('logs')} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === 'logs' ? 'bg-slate-700 text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}>
              <i className="fas fa-clipboard-list md:mr-2"></i> <span className="hidden md:inline">Logs</span>
            </button>
            <button onClick={() => setActiveTab('backup')} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === 'backup' ? 'bg-slate-700 text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}>
              <i className="fas fa-shield-alt md:mr-2"></i> <span className="hidden md:inline">Segurança</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {isAdm && (
              <button onClick={handleAddItem} className="hidden lg:flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all">
                <i className="fas fa-plus"></i> Novo
              </button>
            )}
            <button onClick={handleLogout} className="p-2.5 text-slate-400 hover:text-red-400 transition-colors">
              <i className="fas fa-sign-out-alt text-lg"></i>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <InventoryDashboard items={items} />
            <AIAssistant items={items} />
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <div className="text-left">
              <h2 className="text-3xl font-black">Estoque</h2>
              <p className="text-slate-400">Gerenciamento de materiais disponíveis.</p>
            </div>
            <InventoryTable items={items} onUpdate={handleUpdateItem} onDelete={handleDeleteItem} editable={isAdm} />
          </div>
        )}

        {activeTab === 'withdrawals' && (
          <WithdrawalView items={items} records={withdrawals} onWithdraw={handleRegisterWithdrawal} />
        )}

        {activeTab === 'logs' && <ActionLogsView logs={logs} />}

        {activeTab === 'backup' && <BackupView items={items} setItems={setItems} allowImport={isAdm} />}

        <footer className="mt-20 py-10 border-t border-slate-900 text-slate-600 text-center text-xs font-medium uppercase tracking-widest">
          <p>© 2024 TheStok • Sincronização Inteligente</p>
        </footer>
      </main>
    </div>
  );
};

export default App;
