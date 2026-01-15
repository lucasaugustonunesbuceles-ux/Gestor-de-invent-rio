
import React from 'react';

const InfoView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700">
      <div className="text-center space-y-4">
        <div className="inline-block px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mb-4">
          Apresentação Oficial
        </div>
        <h2 className="text-5xl font-black tracking-tight text-white">Gestão de Inventário Inteligente</h2>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Uma plataforma moderna e segura para controle total de materiais de escritório, integrando auditoria e inteligência artificial.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-xl relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/5 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
          <div className="w-12 h-12 bg-blue-900/30 text-blue-400 rounded-xl flex items-center justify-center mb-6">
            <i className="fas fa-shield-alt text-xl"></i>
          </div>
          <h3 className="text-xl font-bold text-white mb-3 text-left">Segurança de Dados</h3>
          <p className="text-slate-400 text-sm leading-relaxed text-left">
            Acesso segmentado por cargos (ADM e Visitante). Monitoramento de ações críticas via logs de auditoria e backups automáticos periódicos.
          </p>
        </div>

        <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-xl relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/5 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
          <div className="w-12 h-12 bg-indigo-900/30 text-indigo-400 rounded-xl flex items-center justify-center mb-6">
            <i className="fas fa-brain text-xl"></i>
          </div>
          <h3 className="text-xl font-bold text-white mb-3 text-left">Assistência com IA</h3>
          <p className="text-slate-400 text-sm leading-relaxed text-left">
            Utilizamos o Google Gemini para analisar os níveis de estoque e fornecer recomendações proativas, ajudando a evitar a falta de materiais essenciais.
          </p>
        </div>

        <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-xl relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/5 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
          <div className="w-12 h-12 bg-emerald-900/30 text-emerald-400 rounded-xl flex items-center justify-center mb-6">
            <i className="fas fa-chart-line text-xl"></i>
          </div>
          <h3 className="text-xl font-bold text-white mb-3 text-left">Painel Visual</h3>
          <p className="text-slate-400 text-sm leading-relaxed text-left">
            Gráficos dinâmicos que mostram o saldo atual vs. estoque mínimo, além da distribuição do seu capital por categoria de produto.
          </p>
        </div>

        <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-xl relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/5 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
          <div className="w-12 h-12 bg-amber-900/30 text-amber-400 rounded-xl flex items-center justify-center mb-6">
            <i className="fas fa-hand-holding-box text-xl"></i>
          </div>
          <h3 className="text-xl font-bold text-white mb-3 text-left">Controle de Retiradas</h3>
          <p className="text-slate-400 text-sm leading-relaxed text-left">
            Módulo dedicado para registro de saídas de material, permitindo um rastreio detalhado de quem utilizou cada item do estoque.
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border border-blue-500/20 p-10 rounded-[3rem] text-center">
        <h4 className="text-xl font-black text-white mb-4">Protocolos de Uso</h4>
        <p className="text-slate-400 mb-8 max-w-lg mx-auto text-sm leading-relaxed">
          Navegue pelas abas superiores para acessar as funcionalidades. Lembre-se que o modo ADM possui privilégios de edição e exclusão.
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <i className="fas fa-check-circle text-emerald-500"></i> Seguro
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <i className="fas fa-check-circle text-blue-500"></i> Inteligente
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <i className="fas fa-check-circle text-indigo-500"></i> Auditado
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoView;
