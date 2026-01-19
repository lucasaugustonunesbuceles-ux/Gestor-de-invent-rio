
import React, { useRef } from 'react';
import { InventoryItem } from '../types';

interface Props {
  items: InventoryItem[];
  setItems: () => void;
  allowImport?: boolean;
  onImport?: (items: InventoryItem[]) => void;
}

const BackupView: React.FC<Props> = ({ items, setItems, allowImport = false, onImport }) => {
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

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed) && onImport) {
          onImport(parsed);
        } else {
          alert("Formato de arquivo inválido.");
        }
      } catch (err) {
        alert("Erro ao ler o arquivo JSON.");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black">Nuvem e Segurança</h2>
        <p className="text-slate-400">Gestão de dados e redundância.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Sync Status Card */}
        <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-emerald-500/30 shadow-xl relative overflow-hidden">
          <div className="w-14 h-14 bg-emerald-900/30 text-emerald-400 rounded-2xl flex items-center justify-center mb-6">
            <i className="fas fa-cloud-upload-alt text-2xl"></i>
          </div>
          <h3 className="text-xl font-bold mb-2">Sincronização</h3>
          <p className="text-slate-500 text-sm mb-6">Cloud Supabase ativa.</p>
          <div className="flex items-center gap-3 text-emerald-400 font-bold text-xs uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            Online
          </div>
        </div>

        {/* Export Card */}
        <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-xl">
          <div className="w-14 h-14 bg-blue-900/30 text-blue-400 rounded-2xl flex items-center justify-center mb-6">
            <i className="fas fa-file-export text-2xl"></i>
          </div>
          <h3 className="text-xl font-bold mb-2">Exportar</h3>
          <p className="text-slate-500 text-sm mb-6">Baixe seus dados.</p>
          <div className="flex flex-col gap-2">
            <button onClick={handleExportJSON} className="w-full py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold text-xs"><i className="fas fa-download mr-2 text-blue-400"></i> JSON</button>
            <button onClick={handleExportCSV} className="w-full py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold text-xs"><i className="fas fa-file-csv mr-2 text-emerald-400"></i> EXCEL</button>
          </div>
        </div>

        {/* Import Card */}
        {allowImport && (
          <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-indigo-500/20 shadow-xl">
            <div className="w-14 h-14 bg-indigo-900/30 text-indigo-400 rounded-2xl flex items-center justify-center mb-6">
              <i className="fas fa-file-import text-2xl"></i>
            </div>
            <h3 className="text-xl font-bold mb-2">Importar</h3>
            <p className="text-slate-500 text-sm mb-6">Subir planilha JSON.</p>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".json" 
              onChange={handleFileImport} 
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-lg transition-all"
            >
              IMPORTAR ARQUIVO
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BackupView;
