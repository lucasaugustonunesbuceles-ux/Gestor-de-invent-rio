
import React, { useState, useCallback, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { InventoryItem, WithdrawalRecord, UserSession, ActionLog } from './types';
import InventoryTable from './components/InventoryTable';
import InventoryDashboard from './components/InventoryDashboard';
import AIAssistant from './components/AIAssistant';
import BackupView from './components/BackupView';
import WithdrawalView from './components/WithdrawalView';
import Login from './components/Login';
import ActionLogsView from './components/ActionLogsView';
import InfoView from './components/InfoView';

// Estas variáveis devem ser configuradas no Render como Environment Variables
// SUPABASE_URL e SUPABASE_ANON_KEY
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const App: React.FC = () => {
  const [session, setSession] = useState<UserSession | null>(() => {
    const saved = sessionStorage.getItem('user_session');
    return saved ? JSON.parse(saved) : null;
  });

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRecord[]>([]);
  const [logs, setLogs] = useState<ActionLog[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'withdrawals' | 'backup' | 'logs' | 'info'>('dashboard');
  const [loading, setLoading] = useState(true);

  // 1. Carregamento Inicial
  const fetchData = async () => {
    setLoading(true);
    const { data: inv } = await supabase.from('inventory_items').select('*').order('name');
    const { data: withdr } = await supabase.from('withdrawal_records').select('*').order('timestamp', { ascending: false }).limit(50);
    const { data: actLogs } = await supabase.from('action_logs').select('*').order('timestamp', { ascending: false }).limit(50);
    
    if (inv) setItems(inv as any);
    if (withdr) setWithdrawals(withdr as any);
    if (actLogs) setLogs(actLogs as any);
    setLoading(false);
  };

  useEffect(() => {
    if (session) {
      fetchData();

      // 2. Escuta Real-time do Supabase
      const itemsSubscription = supabase
        .channel('schema-db-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory_items' }, () => fetchData())
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'withdrawal_records' }, () => fetchData())
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'action_logs' }, () => fetchData())
        .subscribe();

      return () => {
        supabase.removeChannel(itemsSubscription);
      };
    }
  }, [session]);

  const addLog = useCallback(async (action: string, details: string) => {
    if (!session) return;
    await supabase.from('action_logs').insert([{
      user_name: session.username,
      role: session.role,
      action,
      details
    }]);
  }, [session]);

  const handleUpdateItem = useCallback(async (id: string, updates: Partial<InventoryItem>) => {
    const { error } = await supabase
      .from('inventory_items')
      .update({ ...updates, last_updated: new Date().toISOString() })
      .eq('id', id);

    if (!error) {
      const item = items.find(i => i.id === id);
      addLog('Atualização', `Item ${item?.name} alterado.`);
    }
  }, [items, addLog]);

  const handleDeleteItem = useCallback(async (id: string) => {
    const itemToDelete = items.find(i => i.id === id);
    if (itemToDelete && window.confirm(`Deseja excluir "${itemToDelete.name}"?`)) {
      await supabase.from('inventory_items').delete().eq('id', id);
      addLog('Exclusão', `Material removido: ${itemToDelete.name}`);
    }
  }, [items, addLog]);

  const handleAddItem = async () => {
    const { data } = await supabase.from('inventory_items').insert([{
      name: 'Novo Material',
      quantity: 0,
      min_stock: 1,
      category: 'Outros',
      unit: 'un'
    }]).select();

    if (data) {
      addLog('Adição', `Novo material criado.`);
      setActiveTab('inventory');
    }
  };

  const handleRegisterWithdrawal = async (record: WithdrawalRecord) => {
    // Registra a retirada
    await supabase.from('withdrawal_records').insert([{
      item_id: record.itemId,
      item_name: record.itemName,
      withdrawn_by: record.withdrawnBy,
      quantity: record.quantity
    }]);

    // Atualiza o estoque
    const item = items.find(i => i.id === record.itemId);
    if (item) {
      await handleUpdateItem(item.id, { quantity: Math.max(0, item.quantity - record.quantity) });
    }
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

  if (loading && items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <i className="fas fa-circle-notch fa-spin text-4xl text-indigo-500"></i>
          <p className="text-slate-400 font-bold animate-pulse">SINCRONIZANDO DADOS EM NUVEM...</p>
        </div>
      </div>
    );
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
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
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
          <div className="space-y-8 animate-in fade-in duration-500">
            <InventoryDashboard items={items} />
            <AIAssistant items={items} />
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="text-left">
              <h2 className="text-3xl font-black">Estoque em Tempo Real</h2>
              <p className="text-slate-400">Alterações aqui são refletidas para todos os usuários imediatamente.</p>
            </div>
            <InventoryTable items={items} onUpdate={handleUpdateItem} onDelete={handleDeleteItem} editable={isAdm} />
          </div>
        )}

        {activeTab === 'withdrawals' && (
          <div className="animate-in fade-in duration-500">
            <WithdrawalView items={items} records={withdrawals} onWithdraw={handleRegisterWithdrawal} />
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="animate-in fade-in duration-500">
            <ActionLogsView logs={logs} />
          </div>
        )}

        {activeTab === 'backup' && (
          <div className="animate-in fade-in duration-500">
            <BackupView items={items} setItems={() => fetchData()} allowImport={isAdm} />
          </div>
        )}

        <footer className="mt-20 py-10 border-t border-slate-900 text-slate-600 text-center text-xs font-medium uppercase tracking-widest">
          <p>© 2024 TheStok • Sincronizado via Cloud Supabase</p>
        </footer>
      </main>
    </div>
  );
};

export default App;
