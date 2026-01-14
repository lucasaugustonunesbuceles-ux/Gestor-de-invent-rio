
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
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'withdrawals' | 'backup' | 'logs'>('dashboard');

  useEffect(() => {
    localStorage.setItem('inventory_data', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('withdrawal_records', JSON.stringify(withdrawals));
  }, [withdrawals]);

  useEffect(() => {
    localStorage.setItem('action_logs', JSON.stringify(logs));
  }, [logs]);

  // Simulação de backup automático (A cada 3 dias)
  useEffect(() => {
    const lastBackup = localStorage.getItem('last_auto_backup');
    const now = Date.now();
    const threeDaysMs = 3 * 24 * 60 * 60 * 1000;

    if (!lastBackup || (now - parseInt(lastBackup)) > threeDaysMs) {
      const backupData = { items, withdrawals, logs, date: new Date().toISOString() };
      localStorage.setItem(`auto_backup_${new Date().toISOString().split('T')[0]}`, JSON.stringify(backupData));
      localStorage.setItem('last_auto_backup', now.toString());
      console.log('Backup automático realizado com sucesso.');
    }
  }, [items, withdrawals, logs]);

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
    const itemBefore = items.find(i => i.id === id);
    setItems(prev => prev.map(item => 
      item.id === id 
        ? { ...item, ...updates, lastUpdated: new Date().toISOString() } 
        : item
    ));
    if (itemBefore) {
      addLog('Atualização de Item', `${itemBefore.name}: alterado ${Object.keys(updates).join(', ')}`);
    }
  }, [items, addLog]);

  const handleDeleteItem = useCallback((id: string) => {
    const item = items.find(i => i.id === id);
    if (window.confirm('Deseja realmente excluir este item?')) {
      setItems(prev => prev.filter(item => item.id !== id));
      if (item) addLog('Exclusão de Item', `Material removido: ${item.name}`);
    }
  }, [items, addLog]);

  const handleAddItem = () => {
    const newItem: InventoryItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'Novo Material',
      quantity: 1,
      minStock: 2,
      category: 'Outros',
      unit: 'un',
      lastUpdated: new Date().toISOString()
    };
    setItems(prev => [newItem, ...prev]);
    addLog('Adição de Item', `Novo material cadastrado: ${newItem.name}`);
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
    <div className="min-h-screen transition-colors duration-500 bg-slate-950 text-slate-100">
      <nav className="bg-slate-900/80 border-slate-800 border-b px-6 py-4 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <i className="fas fa-box-open text-xl"></i>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-black tracking-tight leading-none bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">ESTOQUE PRO</h1>
              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">{session.role}: {session.username}</span>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-slate-800/50 p-1 rounded-2xl overflow-x-auto">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 flex-shrink-0 ${activeTab === 'dashboard' ? 'bg-slate-700 shadow-sm text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <i className="fas fa-chart-pie mr-1 md:mr-2"></i> <span className="hidden md:inline">Painel</span>
            </button>
            <button 
              onClick={() => setActiveTab('inventory')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 flex-shrink-0 ${activeTab === 'inventory' ? 'bg-slate-700 shadow-sm text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <i className="fas fa-list-ul mr-1 md:mr-2"></i> <span className="hidden md:inline">Itens</span>
            </button>
            <button 
              onClick={() => setActiveTab('withdrawals')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 flex-shrink-0 ${activeTab === 'withdrawals' ? 'bg-slate-700 shadow-sm text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <i className="fas fa-hand-holding-box mr-1 md:mr-2"></i> <span className="hidden md:inline">Retiradas</span>
            </button>
            {isAdm && (
              <button 
                onClick={() => setActiveTab('logs')}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 flex-shrink-0 ${activeTab === 'logs' ? 'bg-slate-700 shadow-sm text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <i className="fas fa-clipboard-list mr-1 md:mr-2"></i> <span className="hidden md:inline">Logs</span>
              </button>
            )}
            <button 
              onClick={() => setActiveTab('backup')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 flex-shrink-0 ${activeTab === 'backup' ? 'bg-slate-700 shadow-sm text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <i className="fas fa-shield-alt mr-1 md:mr-2"></i> <span className="hidden md:inline">Segurança</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {isAdm && (
              <button 
                onClick={handleAddItem}
                className="hidden lg:flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95"
              >
                <i className="fas fa-plus"></i>
                Novo
              </button>
            )}
            <button 
              onClick={handleLogout}
              className="p-2.5 text-slate-400 hover:text-red-400 transition-colors"
              title="Sair"
            >
              <i className="fas fa-sign-out-alt text-lg"></i>
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
                <h2 className="text-3xl font-black">Estoque</h2>
                <p className="text-slate-400">{isAdm ? 'Controle total de materiais e níveis mínimos.' : 'Consulta de disponibilidade de materiais.'}</p>
              </div>
              {isAdm && (
                <button 
                  onClick={handleAddItem}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-xl"
                >
                  <i className="fas fa-plus"></i>
                </button>
              )}
            </div>
            <InventoryTable 
              items={items} 
              withdrawals={withdrawals}
              onUpdate={handleUpdateItem} 
              onDelete={handleDeleteItem}
              editable={isAdm}
            />
          </div>
        )}

        {activeTab === 'withdrawals' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <WithdrawalView 
              items={items} 
              records={withdrawals} 
              onWithdraw={handleRegisterWithdrawal} 
            />
          </div>
        )}

        {activeTab === 'logs' && isAdm && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ActionLogsView logs={logs} />
          </div>
        )}

        {activeTab === 'backup' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <BackupView items={items} setItems={setItems} allowImport={isAdm} />
          </div>
        )}

        <footer className="mt-20 py-10 border-t border-slate-900 text-slate-600 text-center text-xs font-medium uppercase tracking-widest">
          <p>© 2024 Estoque Pro • Sistema Seguro e Monitorado</p>
        </footer>
      </main>
    </div>
  );
};

export default App;
