
import React, { useRef } from 'react';
import { InventoryItem } from '../types';

interface Props {
  items: InventoryItem[];
  setItems: (items: InventoryItem[]) => void;
}

const BackupView: React.FC<Props> = ({ items, setItems }) => {
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
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Centro de Backup</h2>
        <p className="text-gray-500 dark:text-gray-400">Gerencie a segurança dos seus dados de inventário.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Card */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mb-6">
            <i className="fas fa-file-export text-xl"></i>
          </div>
          <h3 className="text-xl font-bold mb-2">Exportar Dados</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
            Salve uma cópia local de todo o seu inventário para segurança ou uso em outras ferramentas.
          </p>
          <div className="space-y-3">
            <button 
              onClick={handleExportJSON}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-gray-600 rounded-xl transition-colors group"
            >
              <span className="font-medium">Backup Completo (JSON)</span>
              <i className="fas fa-download text-gray-400 group-hover:text-blue-500"></i>
            </button>
            <button 
              onClick={handleExportCSV}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700 hover:bg-green-50 dark:hover:bg-gray-600 rounded-xl transition-colors group"
            >
              <span className="font-medium">Planilha Excel (CSV)</span>
              <i className="fas fa-file-csv text-gray-400 group-hover:text-green-500"></i>
            </button>
          </div>
        </div>

        {/* Import Card */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center mb-6">
            <i className="fas fa-file-import text-xl"></i>
          </div>
          <h3 className="text-xl font-bold mb-2">Restaurar Backup</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
            Recupere seus itens a partir de um arquivo JSON exportado anteriormente.
          </p>
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleImportJSON}
            accept=".json"
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-purple-500/20 active:scale-[0.98]"
          >
            Selecionar Arquivo
          </button>
          <p className="mt-4 text-[10px] text-center text-gray-400 italic">
            Apenas arquivos .json são suportados para restauração completa.
          </p>
        </div>
      </div>

      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 p-4 rounded-xl flex gap-4 items-start">
        <i className="fas fa-exclamation-triangle text-amber-500 mt-1"></i>
        <div className="text-sm">
          <p className="font-bold text-amber-800 dark:text-amber-200">Dica de Segurança</p>
          <p className="text-amber-700 dark:text-amber-300">Recomendamos exportar seus dados semanalmente. Seus dados são salvos localmente no navegador, mas limpar o cache pode removê-los.</p>
        </div>
      </div>
    </div>
  );
};

export default BackupView;
