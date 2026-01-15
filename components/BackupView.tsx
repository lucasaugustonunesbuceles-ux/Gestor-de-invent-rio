
import React, { useRef } from 'react';
import { InventoryItem } from '../types';

interface Props {
  items: InventoryItem[];
  setItems: (items: InventoryItem[]) => void;
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

  const handleImportJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!allowImport) return;
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (Array.isArray(json)) {
          if (window.confirm('Isso substituirá seus dados atuais. Continuar?')) {
            setItems(json);
            alert('Dados importados com sucesso!');
          }
        } else {
          alert('Formato de arquivo inválido.');
        }
      } catch (err) {
        alert('Erro ao processar o arquivo JSON.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black">Segurança e Dados</h2>
        <p className="text-slate-400">Gerencie cópias de segurança do seu inventário.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Card */}
        <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-xl">
          <div className="w-14 h-14 bg-blue-900/30 text-blue-400 rounded-2xl flex items-center justify-center mb-6">
            <i className="fas fa-file-export text-2xl"></i>
          </div>
          <h3 className="text-xl font-bold mb-2">Exportar Inventário</h3>
          <p className="text-slate-500 text-sm mb-6">Baixe seus dados para abrir no Excel ou guardar como backup.</p>
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
              <i className="fas fa-file-csv text-emerald-400"></i> EXCEL/CSV
            </button>
          </div>
        </div>

        {/* Import Card */}
        {allowImport && (
          <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-xl">
            <div className="w-14 h-14 bg-purple-900/30 text-purple-400 rounded-2xl flex items-center justify-center mb-6">
              <i className="fas fa-file-import text-2xl"></i>
            </div>
            <h3 className="text-xl font-bold mb-2">Restaurar Dados</h3>
            <p className="text-slate-500 text-sm mb-6">Carregue um arquivo JSON de backup para restaurar o estoque.</p>
            <input type="file" ref={fileInputRef} onChange={handleImportJSON} accept=".json" className="hidden" />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl transition-all shadow-lg"
            >
              Selecionar Arquivo
            </button>
          </div>
        )}
      </div>

      <div className="bg-indigo-900/10 border border-indigo-900/30 p-6 rounded-[2rem] flex gap-5 items-start">
        <div className="w-10 h-10 rounded-full bg-indigo-900/20 flex items-center justify-center flex-shrink-0">
          <i className="fas fa-cloud text-indigo-500"></i>
        </div>
        <div className="text-sm text-left">
          <p className="font-black text-indigo-500 uppercase tracking-widest mb-1">Próximo Passo: Nuvem</p>
          <p className="text-slate-400 leading-relaxed">Para que o estoque atualize automaticamente entre diferentes celulares e computadores, este aplicativo deve ser conectado a um banco de dados (ex: Supabase ou Firebase).</p>
        </div>
      </div>
    </div>
  );
};

export default BackupView;
