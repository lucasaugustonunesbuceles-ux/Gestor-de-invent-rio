
import React, { useRef } from 'react';
import { InventoryItem } from '../types';

interface Props {
  items: InventoryItem[];
  setItems: () => void; // Agora apenas recarrega da nuvem
  allowImport?: boolean;
}

const BackupView: React.FC<Props> = ({ items, setItems, allowImport = false }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(items, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `backup_inventario_${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
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
    link.setAttribute("download", "planilha_materiais.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black">Nuvem e Segurança</h2>
        <p className="text-slate-400">Seus dados estão protegidos e sincronizados no Supabase.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sync Status Card */}
        <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-emerald-500/30 shadow-xl relative overflow-hidden">
          <div className="w-14 h-14 bg-emerald-900/30 text-emerald-400 rounded-2xl flex items-center justify-center mb-6">
            <i className="fas fa-cloud-upload-alt text-2xl"></i>
          </div>
          <h3 className="text-xl font-bold mb-2">Status da Nuvem</h3>
          <p className="text-slate-500 text-sm mb-6">Sincronização em tempo real ativa. Todas as alterações são salvas automaticamente.</p>
          <div className="flex items-center gap-3 text-emerald-400 font-bold text-xs uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            Conectado ao Supabase
          </div>
        </div>

        {/* Export Card */}
        <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-xl">
          <div className="w-14 h-14 bg-blue-900/30 text-blue-400 rounded-2xl flex items-center justify-center mb-6">
            <i className="fas fa-file-export text-2xl"></i>
          </div>
          <h3 className="text-xl font-bold mb-2">Exportar Dados</h3>
          <p className="text-slate-500 text-sm mb-6">Baixe uma cópia local para segurança externa ou Excel.</p>
          <div className="flex gap-3">
            <button 
              onClick={handleExportJSON}
              className="flex-1 flex items-center justify-center gap-2 py-4 bg-slate-800 hover:bg-slate-700 rounded-2xl transition-all font-bold text-slate-200"
            >
              <i className="fas fa-download text-blue-400"></i> JSON
            </button>
            <button 
              onClick={handleExportCSV}
              className="flex-1 flex items-center justify-center gap-2 py-4 bg-slate-800 hover:bg-slate-700 rounded-2xl transition-all font-bold text-slate-200"
            >
              <i className="fas fa-file-csv text-emerald-400"></i> EXCEL
            </button>
          </div>
        </div>
      </div>

      <div className="bg-indigo-900/10 border border-indigo-900/30 p-6 rounded-[2rem] flex gap-5 items-start">
        <div className="w-10 h-10 rounded-full bg-indigo-900/20 flex items-center justify-center flex-shrink-0">
          <i className="fas fa-info-circle text-indigo-500"></i>
        </div>
        <div className="text-sm text-left">
          <p className="font-black text-indigo-500 uppercase tracking-widest mb-1">Dica de Colaboração</p>
          <p className="text-slate-400 leading-relaxed">Qualquer pessoa com acesso à URL do Render e login válido verá as mesmas informações que você em tempo real. Não é necessário atualizar a página.</p>
        </div>
      </div>
    </div>
  );
};

export default BackupView;
