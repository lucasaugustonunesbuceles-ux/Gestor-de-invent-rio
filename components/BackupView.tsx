
import React, { useRef, useState } from 'react';
import { InventoryItem } from '../types';

interface Props {
  items: InventoryItem[];
  setItems: () => void;
  allowImport?: boolean;
  onImport?: (items: InventoryItem[]) => void;
}

const SQL_SETUP = `-- 1. CRIAR AS TABELAS
CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  quantity INTEGER DEFAULT 0,
  min_stock INTEGER DEFAULT 1,
  category TEXT DEFAULT 'Outros',
  unit TEXT DEFAULT 'un',
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS withdrawal_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE,
  item_name TEXT,
  withdrawn_by TEXT,
  quantity INTEGER,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS action_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name TEXT,
  role TEXT,
  action TEXT,
  details TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. HABILITAR RLS (SEGURANÇA)
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_logs ENABLE ROW LEVEL SECURITY;

-- 3. CRIAR POLÍTICAS DE ACESSO PÚBLICO (ANON)
CREATE POLICY "Acesso Total Público" ON inventory_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso Total Público" ON withdrawal_records FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso Total Público" ON action_logs FOR ALL USING (true) WITH CHECK (true);`;

const BackupView: React.FC<Props> = ({ items, setItems, allowImport = false, onImport }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showSql, setShowSql] = useState(false);

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(items, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', `backup_inventario_${new Date().toISOString().split('T')[0]}.json`);
    linkElement.click();
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        if (Array.isArray(parsed) && onImport) onImport(parsed);
      } catch (err) { alert("Erro ao ler JSON."); }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const copySql = () => {
    navigator.clipboard.writeText(SQL_SETUP);
    alert("Código SQL copiado! Cole no SQL Editor do seu Supabase.");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black">Nuvem e Segurança</h2>
        <p className="text-slate-400">Gestão de dados e redundância.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-xl">
          <div className="w-14 h-14 bg-blue-900/30 text-blue-400 rounded-2xl flex items-center justify-center mb-6">
            <i className="fas fa-file-export text-2xl"></i>
          </div>
          <h3 className="text-xl font-bold mb-2">Exportar</h3>
          <button onClick={handleExportJSON} className="w-full py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold text-xs">BAIXAR BACKUP (JSON)</button>
        </div>

        {allowImport && (
          <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-indigo-500/20 shadow-xl text-left">
            <div className="w-14 h-14 bg-indigo-900/30 text-indigo-400 rounded-2xl flex items-center justify-center mb-6">
              <i className="fas fa-file-import text-2xl"></i>
            </div>
            <h3 className="text-xl font-bold mb-2 text-left">Importar</h3>
            <p className="text-slate-500 text-[10px] mb-4 uppercase font-bold text-left">Subir arquivo de backup anterior.</p>
            <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleFileImport} />
            <button onClick={() => fileInputRef.current?.click()} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl">IMPORTAR JSON</button>
          </div>
        )}

        <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-amber-500/20 shadow-xl text-left">
          <div className="w-14 h-14 bg-amber-900/30 text-amber-400 rounded-2xl flex items-center justify-center mb-6">
            <i className="fas fa-database text-2xl"></i>
          </div>
          <h3 className="text-xl font-bold mb-2 text-left">Configurar Banco</h3>
          <p className="text-slate-500 text-[10px] mb-4 uppercase font-bold text-left">Corrigir erros de RLS / Permissão.</p>
          <button onClick={() => setShowSql(!showSql)} className="w-full py-4 bg-amber-600 hover:bg-amber-700 text-white font-black rounded-xl">VER SCRIPT SQL</button>
        </div>
      </div>

      {showSql && (
        <div className="bg-slate-900 border border-amber-500/30 rounded-[2.5rem] p-8 animate-in slide-in-from-top-4 duration-300 text-left">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-lg font-black text-amber-400">Instruções de Instalação</h4>
            <button onClick={copySql} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-black uppercase text-white tracking-widest transition-all">Copiar Código</button>
          </div>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            1. Acesse seu painel do <strong>Supabase</strong>.<br />
            2. Clique em <strong>SQL Editor</strong> no menu lateral esquerdo.<br />
            3. Clique em <strong>New Query</strong>.<br />
            4. Cole o código abaixo e clique em <strong>Run</strong> (botão azul).
          </p>
          <pre className="bg-black/50 p-6 rounded-2xl text-[10px] font-mono text-emerald-400 overflow-x-auto border border-slate-800">
            {SQL_SETUP}
          </pre>
        </div>
      )}
    </div>
  );
};

export default BackupView;
