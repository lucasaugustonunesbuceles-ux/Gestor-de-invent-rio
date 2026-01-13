
import React, { useState, useEffect } from 'react';
import { analyzeInventory } from '../services/geminiService';
import { InventoryItem, AIInsight } from '../types';

interface Props {
  items: InventoryItem[];
}

const AIAssistant: React.FC<Props> = ({ items }) => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(false);

  const getInsights = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const result = await analyzeInventory(items);
      setInsights(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getInsights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative overflow-hidden bg-slate-900 dark:bg-slate-900 rounded-[2.5rem] p-8 md:p-10 shadow-2xl shadow-blue-500/10 border border-slate-800 transition-all duration-500">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px] -ml-32 -mb-32"></div>

      <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/30">
            <i className={`fas fa-sparkles text-2xl ${loading ? 'animate-spin' : 'animate-pulse'}`}></i>
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">Assistente Gemini</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <p className="text-slate-400 text-sm font-medium">Análise inteligente ativa</p>
            </div>
          </div>
        </div>
        <button 
          onClick={getInsights}
          disabled={loading}
          className="group relative px-6 py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white rounded-2xl text-sm font-bold transition-all border border-slate-700 flex items-center gap-3 active:scale-95"
        >
          {loading ? (
            <i className="fas fa-circle-notch fa-spin"></i>
          ) : (
            <i className="fas fa-bolt text-yellow-400 group-hover:scale-125 transition-transform"></i>
          )}
          <span>{loading ? 'Processando...' : 'Gerar Novos Insights'}</span>
        </button>
      </div>

      <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="bg-slate-800/40 backdrop-blur-sm p-6 rounded-3xl border border-slate-700/50 animate-pulse h-40">
              <div className="h-5 bg-slate-700 rounded-full w-2/3 mb-4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-slate-700/60 rounded-full w-full"></div>
                <div className="h-3 bg-slate-700/60 rounded-full w-5/6"></div>
              </div>
            </div>
          ))
        ) : (
          insights.map((insight, idx) => (
            <div key={idx} className="group bg-slate-800/40 backdrop-blur-sm p-6 rounded-3xl border border-slate-700/50 hover:bg-slate-800/60 hover:border-slate-600 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  insight.priority === 'high' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                  insight.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 
                  'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                }`}>
                  {insight.priority === 'high' ? 'Crítico' : insight.priority === 'medium' ? 'Atenção' : 'Sugestão'}
                </div>
                <i className="fas fa-lightbulb text-slate-600 group-hover:text-blue-400 transition-colors"></i>
              </div>
              <h4 className="font-bold text-slate-100 mb-2 leading-tight">{insight.title}</h4>
              <p className="text-slate-400 text-sm leading-relaxed">{insight.description}</p>
            </div>
          ))
        )}
      </div>
      
      {insights.length === 0 && !loading && (
        <div className="text-center py-10 bg-slate-800/30 rounded-3xl border border-dashed border-slate-700">
          <p className="text-slate-500 font-medium">Clique no botão para iniciar a análise dos materiais.</p>
        </div>
      )}
    </div>
  );
};

export default AIAssistant;
