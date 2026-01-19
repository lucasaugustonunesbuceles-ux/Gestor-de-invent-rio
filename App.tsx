
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { InventoryItem, WithdrawalRecord, UserSession, ActionLog } from './types';
import InventoryTable from './components/InventoryTable';
import InventoryDashboard from './components/InventoryDashboard';
import AIAssistant from './components/AIAssistant';
import BackupView from './components/BackupView';
import WithdrawalView from './components/WithdrawalView';
import Login from './components/Login';
import ActionLogsView from './components/ActionLogsView';

const getConfig = () => {
  const localUrl = localStorage.getItem('supabase_url') || '';
  const localKey = localStorage.getItem('supabase_key') || '';
  return { url: localUrl, key: localKey };
};

const App: React.FC = () => {
  const [config, setConfig] = useState(getConfig());
  const [session, setSession] = useState<UserSession | null>(() => {
    const saved = sessionStorage.getItem('user_session');
    return saved ? JSON.parse(saved) : null;
  });

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRecord[]>([]);
  const [logs, setLogs] = useState<ActionLog[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'withdrawals' | 'backup' | 'logs'>('dashboard');
  const [loading, setLoading] = useState(false);

  const supabase = useMemo(() => {
    if (!config.url || !config.key) return null;
    try {
      return createClient(config.url, config.key);
    } catch (e) {
      return null;
    }
  }, [config.url, config.key]);

  const addLog = useCallback(async (action: string, details: string) => {
    if (!session || !supabase) return;
    await supabase.from('action_logs').insert([{
      user_name: session.username,
      role: session.role,
      action,
      details
    }]);
  }, [session, supabase]);

  const fetchData = async () => {
    if (!supabase) return;
    setLoading(true);
    try {
      const { data: inv } = await supabase.from('inventory_items').select('*').order('name');
      const { data: withdr } = await supabase.from('withdrawal_records').select('*').order('timestamp', { ascending: false }).limit(50);
      const { data: actLogs } = await supabase.from('action_logs').select('*').order('timestamp', { ascending: false }).limit(50);
      
      if (inv) {
        setItems(inv.map((i: any) => ({
          id: i.id,
          name: i.name,
          quantity: i.quantity,
          minStock: i.min_stock,
          category: i.category,
          unit: i.unit,
          lastUpdated: i.last_updated
        })));
      }
      
      if (withdr) {
        setWithdrawals(withdr.map((w: any) => ({
          id: w.id,
          itemId: w.item_id,
          itemName: w.item_name,
          withdrawnBy: w.withdrawn_by,
          quantity: w.quantity,
          timestamp: w.timestamp
        })));
      }

      if (actLogs) {
        setLogs(actLogs.map((l: any) => ({
          id: l.id,
          user: l.user_name,
          role: l.role,
          action: l.action,
          details: l.details,
          timestamp: l.timestamp
        })));
      }
    } catch (err) {
      console.error("Erro ao sincronizar:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session && supabase) {
      fetchData();
      const channel = supabase.channel('realtime_stock')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory_items' }, () => fetchData())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'withdrawal_records' }, () => fetchData())
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    }
  }, [session, supabase]);

  const handleAddItem = async () => {
    if (!supabase) return;
    const { error } = await supabase.from('inventory_items').insert([{
      name: 'Novo Material',
      quantity: 0,
      min_stock: 1,
      category: 'Outros',
      unit: 'un'
    }]);

    if (error) {
      alert("ERRO DE PERMISSÃO: O Supabase bloqueou a inserção. Vá em 'Config' e siga as instruções de 'Configurar Banco (SQL)'.");
    } else {
      await addLog('Adição', 'Inseriu novo item no estoque.');
      fetchData();
      setActiveTab('inventory');
    }
  };

  const handleUpdateItem = async (id: string, updates: Partial<InventoryItem>) => {
    if (!supabase) return;
    const dbUp: any = {};
    if (updates.name !== undefined) dbUp.name = updates.name;
    if (updates.quantity !== undefined) dbUp.quantity = updates.quantity;
    if (updates.minStock !== undefined) dbUp.min_stock = updates.minStock;
    if (updates.category !== undefined) dbUp.category = updates.category;

    const { error } = await supabase.from('inventory_items').update(dbUp).eq('id', id);
    if (!error) {
      fetchData();
    } else {
      alert("Erro ao atualizar: Verifique suas permissões de RLS no Supabase.");
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!supabase || !window.confirm('Excluir permanentemente este item?')) return;
    const { error } = await supabase.from('inventory_items').delete().eq('id', id);
    if (!error) {
      addLog('Exclusão', 'Removeu material do sistema.');
      fetchData();
    } else {
      alert("Erro ao excluir: Verifique suas permissões de RLS no Supabase.");
    }
  };

  const handleImportData = async (importedItems: InventoryItem[]) => {
    if (!supabase) return;
    setLoading(true);
    const dbItems = importedItems.map(item => ({
      name: item.name,
      quantity: item.quantity,
      min_stock: item.minStock || 1,
      category: item.category || 'Outros',
      unit: item.unit || 'un'
    }));

    const { error } = await supabase.from('inventory_items').insert(dbItems);
    if (error) {
      alert("Erro na importação: " + error.message);
    } else {
      addLog('Importação', `Carregou ${importedItems.length} materiais.`);
      alert("Importação concluída!");
      fetchData();
    }
    setLoading(false);
  };

  const handleManualConfig = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const url = (formData.get('url') as string).trim();
    const key = (formData.get('key') as string).trim();
    if (url && key && url.startsWith('http')) {
      localStorage.setItem('supabase_url', url);
      localStorage.setItem('supabase_key', key);
      setConfig({ url, key });
    }
  };

  if (!supabase) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-10 rounded-[2.5rem] shadow-2xl text-center">
          <div className="w-16 h-16 bg-indigo-500/10 text-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-plug text-2xl"></i>
          </div>
          <h1 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">Conectar ao Banco</h1>
          <form onSubmit={handleManualConfig} className="space-y-4">
            <input name="url" placeholder="Supabase Project URL" required className="w-full bg-slate-800 border-none rounded-2xl py-4 px-6 text-white outline-none focus:ring-2 focus:ring-indigo-500/50" />
            <input name="key" type="password" placeholder="API Key (Anon Public)" required className="w-full bg-slate-800 border-none rounded-2xl py-4 px-6 text-white outline-none focus:ring-2 focus:ring-indigo-500/50" />
            <button className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-lg transition-all active:scale-95">SALVAR E CONECTAR</button>
          </form>
        </div>
      </div>
    );
  }

  if (!session) return <Login onLogin={setSession} />;

  const isAdm = session.role === 'ADM';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <nav className="bg-slate-900 border-slate-800 border-b px-6 py-4 sticky top-0 z-50 backdrop-blur-md bg-opacity-80">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg"><i className="fas fa-layer-group text-xl"></i></div>
            <h1 className="text-xl font-black bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">THESTOK</h1>
          </div>
          
          <div className="flex items-center gap-1 bg-slate-800/50 p-1 rounded-2xl overflow-x-auto">
            <button onClick={() => setActiveTab('dashboard')} className={`px-4 py-2 rounded-xl text-sm font-semibold ${activeTab === 'dashboard' ? 'bg-slate-700 text-indigo-400' : 'text-slate-500'}`}>Painel</button>
            <button onClick={() => setActiveTab('inventory')} className={`px-4 py-2 rounded-xl text-sm font-semibold ${activeTab === 'inventory' ? 'bg-slate-700 text-indigo-400' : 'text-slate-500'}`}>Estoque</button>
            <button onClick={() => setActiveTab('withdrawals')} className={`px-4 py-2 rounded-xl text-sm font-semibold ${activeTab === 'withdrawals' ? 'bg-slate-700 text-indigo-400' : 'text-slate-500'}`}>Saídas</button>
            <button onClick={() => setActiveTab('logs')} className={`px-4 py-2 rounded-xl text-sm font-semibold ${activeTab === 'logs' ? 'bg-slate-700 text-indigo-400' : 'text-slate-500'}`}>Logs</button>
            <button onClick={() => setActiveTab('backup')} className={`px-4 py-2 rounded-xl text-sm font-semibold ${activeTab === 'backup' ? 'bg-slate-700 text-indigo-400' : 'text-slate-500'}`}>Config</button>
          </div>

          <div className="flex items-center gap-3">
            {isAdm && (
              <button onClick={handleAddItem} className="hidden md:flex px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl items-center gap-2">
                <i className="fas fa-plus"></i> Novo
              </button>
            )}
            <button onClick={() => { sessionStorage.clear(); setSession(null); }} className="p-2.5 text-slate-400 hover:text-red-400"><i className="fas fa-sign-out-alt"></i></button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {activeTab === 'dashboard' && <><InventoryDashboard items={items} /><AIAssistant items={items} /></>}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div><h2 className="text-3xl font-black">Materiais em Nuvem</h2><p className="text-slate-400">Dados reais.</p></div>
              {isAdm && (
                <button onClick={handleAddItem} className="px-6 py-3 bg-indigo-600 rounded-2xl font-bold hover:bg-indigo-700 flex items-center gap-2">
                  <i className="fas fa-plus"></i> Novo Material
                </button>
              )}
            </div>
            <InventoryTable items={items} onUpdate={handleUpdateItem} onDelete={handleDeleteItem} editable={isAdm} />
          </div>
        )}
        {activeTab === 'withdrawals' && (
          <WithdrawalView 
            items={items} 
            records={withdrawals} 
            onWithdraw={async (rec) => {
              if (!supabase) return;
              const { error } = await supabase.from('withdrawal_records').insert([{ 
                item_id: rec.itemId, item_name: rec.itemName, withdrawn_by: rec.withdrawnBy, quantity: rec.quantity 
              }]);
              if (!error) {
                const item = items.find(i => i.id === rec.itemId);
                if (item) await handleUpdateItem(item.id, { quantity: Math.max(0, item.quantity - rec.quantity) });
                addLog('Retirada', `Retirada de ${rec.quantity} unidades de ${rec.itemName}.`);
                fetchData();
              } else {
                alert("Erro ao registrar retirada. Verifique as permissões de RLS.");
              }
            }} 
          />
        )}
        {activeTab === 'logs' && <ActionLogsView logs={logs} />}
        {activeTab === 'backup' && (
          <div className="space-y-6">
            <BackupView items={items} setItems={fetchData} allowImport={isAdm} onImport={handleImportData} />
            <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="w-full py-4 text-red-500/50 hover:text-red-500 font-black text-xs uppercase tracking-widest border border-dashed border-red-500/20 rounded-2xl">Resetar Tudo</button>
          </div>
        )}
      </main>
      {loading && <div className="fixed bottom-6 right-6 bg-indigo-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-bounce"><i className="fas fa-sync fa-spin"></i><span className="text-xs font-black uppercase">Sincronizando...</span></div>}
    </div>
  );
};

export default App;
