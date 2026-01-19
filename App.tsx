
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
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

const getConfig = () => {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';
  const localUrl = localStorage.getItem('supabase_url') || '';
  const localKey = localStorage.getItem('supabase_key') || '';
  
  return {
    url: envUrl || localUrl,
    key: envKey || localKey
  };
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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'withdrawals' | 'backup' | 'logs' | 'info'>('dashboard');
  const [loading, setLoading] = useState(true);

  const supabase = useMemo(() => {
    if (!config.url || !config.key) return null;
    try {
      const url = new URL(config.url);
      if (!url.protocol.startsWith('http')) return null;
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
      console.error("Erro Supabase:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session && supabase) {
      fetchData();
      const subscription = supabase
        .channel('db-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory_items' }, () => fetchData())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'withdrawal_records' }, () => fetchData())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'action_logs' }, () => fetchData())
        .subscribe();

      return () => { supabase.removeChannel(subscription); };
    }
  }, [session, supabase]);

  const handleAddItem = async () => {
    if (!supabase) return;
    const { error } = await supabase.from('inventory_items').insert([{
      name: 'Novo Item',
      quantity: 0,
      min_stock: 1,
      category: 'Outros',
      unit: 'un'
    }]);

    if (error) {
      alert("Erro ao adicionar: Verifique se as permissões (RLS) estão habilitadas no seu banco de dados Supabase.");
    } else {
      addLog('Adição', 'Criou um novo item no estoque.');
      if (activeTab !== 'inventory') setActiveTab('inventory');
    }
  };

  const handleImportData = async (importedItems: InventoryItem[]) => {
    if (!supabase || !window.confirm(`Deseja importar ${importedItems.length} itens? Isso pode gerar duplicatas se os nomes forem iguais.`)) return;
    
    setLoading(true);
    const dbItems = importedItems.map(item => ({
      name: item.name,
      quantity: item.quantity,
      min_stock: item.minStock,
      category: item.category,
      unit: item.unit
    }));

    const { error } = await supabase.from('inventory_items').insert(dbItems);
    
    if (error) {
      alert("Erro na importação: " + error.message);
    } else {
      addLog('Importação', `Importou ${importedItems.length} materiais via arquivo.`);
      alert("Dados importados com sucesso!");
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

  const handleLogout = () => {
    sessionStorage.removeItem('user_session');
    setSession(null);
  };

  if (!supabase) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-10 rounded-[2.5rem] shadow-2xl text-center">
          <div className="w-16 h-16 bg-indigo-500/10 text-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-plug text-2xl"></i>
          </div>
          <h1 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">Conectar Supabase</h1>
          <p className="text-slate-400 text-sm mb-8 leading-relaxed">Insira as credenciais do seu projeto para ativar a sincronização na nuvem.</p>
          <form onSubmit={handleManualConfig} className="space-y-4">
            <input name="url" placeholder="Project URL" required defaultValue={config.url} className="w-full bg-slate-800 border-none rounded-2xl py-4 px-6 text-white outline-none focus:ring-2 focus:ring-indigo-500/50" />
            <input name="key" type="password" placeholder="Anon Public Key" required defaultValue={config.key} className="w-full bg-slate-800 border-none rounded-2xl py-4 px-6 text-white outline-none focus:ring-2 focus:ring-indigo-500/50" />
            <button className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-lg transition-all active:scale-95">CONECTAR AGORA</button>
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
          <div className="flex items-center gap-1 bg-slate-800/50 p-1 rounded-2xl">
            <button onClick={() => setActiveTab('dashboard')} className={`px-4 py-2 rounded-xl text-sm font-semibold ${activeTab === 'dashboard' ? 'bg-slate-700 text-indigo-400' : 'text-slate-500'}`}>Painel</button>
            <button onClick={() => setActiveTab('inventory')} className={`px-4 py-2 rounded-xl text-sm font-semibold ${activeTab === 'inventory' ? 'bg-slate-700 text-indigo-400' : 'text-slate-500'}`}>Itens</button>
            <button onClick={() => setActiveTab('withdrawals')} className={`px-4 py-2 rounded-xl text-sm font-semibold ${activeTab === 'withdrawals' ? 'bg-slate-700 text-indigo-400' : 'text-slate-500'}`}>Retiradas</button>
            <button onClick={() => setActiveTab('logs')} className={`px-4 py-2 rounded-xl text-sm font-semibold ${activeTab === 'logs' ? 'bg-slate-700 text-indigo-400' : 'text-slate-500'}`}>Logs</button>
            <button onClick={() => setActiveTab('backup')} className={`px-4 py-2 rounded-xl text-sm font-semibold ${activeTab === 'backup' ? 'bg-slate-700 text-indigo-400' : 'text-slate-500'}`}>Config</button>
          </div>
          <div className="flex items-center gap-3">
            {isAdm && <button onClick={handleAddItem} className="hidden lg:block px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all"><i className="fas fa-plus mr-2"></i> Novo</button>}
            <button onClick={handleLogout} className="p-2.5 text-slate-400 hover:text-red-400"><i className="fas fa-sign-out-alt"></i></button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {activeTab === 'dashboard' && <><InventoryDashboard items={items} /><AIAssistant items={items} /></>}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <div><h2 className="text-3xl font-black">Estoque Sincronizado</h2><p className="text-slate-400">Dados reais na nuvem.</p></div>
              {isAdm && <button onClick={handleAddItem} className="px-6 py-3 bg-indigo-600 rounded-2xl font-bold hover:bg-indigo-700"><i className="fas fa-plus mr-2"></i> Adicionar Material</button>}
            </div>
            <InventoryTable 
              items={items} 
              onUpdate={async (id, up) => {
                if (!supabase) return;
                const dbUp: any = {};
                if (up.name) dbUp.name = up.name;
                if (up.quantity !== undefined) dbUp.quantity = up.quantity;
                if (up.minStock !== undefined) dbUp.min_stock = up.minStock;
                if (up.category) dbUp.category = up.category;
                await supabase.from('inventory_items').update(dbUp).eq('id', id);
              }} 
              onDelete={async (id) => {
                if (!supabase || !window.confirm('Excluir permanentemente?')) return;
                await supabase.from('inventory_items').delete().eq('id', id);
                addLog('Exclusão', 'Removeu um item do estoque.');
              }} 
              editable={isAdm} 
            />
          </div>
        )}
        {activeTab === 'withdrawals' && (
          <WithdrawalView 
            items={items} 
            records={withdrawals} 
            onWithdraw={async (rec) => {
              if (!supabase) return;
              await supabase.from('withdrawal_records').insert([{ item_id: rec.itemId, item_name: rec.itemName, withdrawn_by: rec.withdrawnBy, quantity: rec.quantity }]);
              const item = items.find(i => i.id === rec.itemId);
              if (item) await supabase.from('inventory_items').update({ quantity: Math.max(0, item.quantity - rec.quantity) }).eq('id', item.id);
              addLog('Retirada', `Registrou a saída de ${rec.quantity} de ${rec.itemName}.`);
            }} 
          />
        )}
        {activeTab === 'logs' && <ActionLogsView logs={logs} />}
        {activeTab === 'backup' && (
          <div className="space-y-6">
            <BackupView 
              items={items} 
              setItems={fetchData} 
              allowImport={isAdm} 
              onImport={handleImportData} 
            />
            <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="w-full py-4 text-red-500/50 hover:text-red-500 font-black text-xs uppercase tracking-widest">Resetar Conexão com Supabase</button>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
