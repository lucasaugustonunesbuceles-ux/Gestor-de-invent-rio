
import React, { useState, useMemo } from 'react';
import { InventoryItem, WithdrawalRecord, RegisteredUser } from '../types';

interface Props {
  items: InventoryItem[];
  records: WithdrawalRecord[];
  onWithdraw: (record: WithdrawalRecord) => void;
}

const WithdrawalView: React.FC<Props> = ({ items, records, onWithdraw }) => {
  const [selectedItemId, setSelectedItemId] = useState('');
  const [personName, setPersonName] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Memoize registered users from localStorage
  const registeredUsers = useMemo((): RegisteredUser[] => {
    const saved = localStorage.getItem('app_users');
    return saved ? JSON.parse(saved) : [];
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Validate if a material is selected
    const item = items.find(i => i.id === selectedItemId);
    if (!item) {
      alert('Por favor, selecione um material.');
      return;
    }

    // 2. Validate if the name is selected
    if (!personName) {
      alert('Por favor, selecione quem está realizando a retirada.');
      return;
    }

    // 3. Validate stock levels
    if (item.quantity < quantity) {
      alert('Quantidade em estoque insuficiente!');
      return;
    }

    // 4. Register the withdrawal
    const record: WithdrawalRecord = {
      id: Math.random().toString(36).substr(2, 9),
      itemId: item.id,
      itemName: item.name,
      withdrawnBy: personName,
      quantity: quantity,
      timestamp: new Date().toISOString()
    };

    onWithdraw(record);
    
    setPersonName('');
    setQuantity(1);
    setSelectedItemId('');
    alert('Retirada registrada com sucesso!');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
        <div className="lg:col-span-1">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl">
            <h3 className="text-xl font-black mb-6 flex items-center gap-3">
              <i className="fas fa-clipboard-check text-indigo-500"></i>
              Registrar Retirada
            </h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Item para Retirada</label>
                <select 
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  className="w-full bg-slate-800 border-none rounded-2xl p-4 text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none cursor-pointer"
                >
                  <option value="">Selecione um material...</option>
                  {items.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.quantity} {item.unit} disp.)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Quem está retirando?</label>
                <select 
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  className="w-full bg-slate-800 border-none rounded-2xl p-4 text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all appearance-none cursor-pointer"
                >
                  <option value="">Selecione o usuário registrado...</option>
                  {registeredUsers.map((user, idx) => (
                    <option key={idx} value={user.username}>
                      {user.username} ({user.role})
                    </option>
                  ))}
                </select>
                <p className="text-[9px] text-slate-500 mt-2 uppercase font-bold tracking-tighter">* Apenas usuários registrados podem realizar retiradas.</p>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Quantidade</label>
                <div className="flex items-center bg-slate-800 rounded-2xl border border-slate-700/50 overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/50 transition-all">
                  <button 
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-14 bg-slate-800 hover:bg-slate-700 transition-colors flex items-center justify-center border-r border-slate-700/50"
                  >
                    <i className="fas fa-minus text-xs text-slate-400"></i>
                  </button>
                  <input 
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="flex-1 bg-transparent border-none text-center text-xl font-black focus:ring-0 outline-none h-14 text-white"
                  />
                  <button 
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-12 h-14 bg-slate-800 hover:bg-slate-700 transition-colors flex items-center justify-center border-l border-slate-700/50"
                  >
                    <i className="fas fa-plus text-xs text-slate-400"></i>
                  </button>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.98] mt-4"
              >
                Confirmar Retirada
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="p-8 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-xl font-black flex items-center gap-3">
                <i className="fas fa-history text-emerald-500"></i>
                Histórico de Retiradas
              </h3>
              <span className="text-[10px] font-black bg-slate-800 px-3 py-1 rounded-full text-slate-400 uppercase tracking-widest">
                {records.length} registros
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-800/30 text-slate-500 text-[10px] uppercase font-black tracking-widest">
                    <th className="px-8 py-5">Colaborador</th>
                    <th className="px-8 py-5">Material</th>
                    <th className="px-8 py-5">Qtd.</th>
                    <th className="px-8 py-5">Data/Hora</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {records.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-black text-emerald-400">
                            {record.withdrawnBy.substring(0, 2).toUpperCase()}
                          </div>
                          <span className="font-bold text-slate-200">{record.withdrawnBy}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-slate-300 font-medium">{record.itemName}</td>
                      <td className="px-8 py-5 font-black text-rose-500">-{record.quantity}</td>
                      <td className="px-8 py-5 text-slate-500 text-sm">
                        {new Date(record.timestamp).toLocaleString('pt-BR', { 
                          day: '2-digit', 
                          month: '2-digit', 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </td>
                    </tr>
                  ))}
                  {records.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-8 py-20 text-center text-left">
                        <div className="flex flex-col items-center gap-3 opacity-20">
                          <i className="fas fa-box-open text-5xl"></i>
                          <p className="font-black uppercase tracking-widest">Nenhuma retirada registrada</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WithdrawalView;
