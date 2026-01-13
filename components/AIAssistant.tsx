
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
    setLoading(true);
    const result = await analyzeInventory(items);
    setInsights(result);
    setLoading(false);
  };

  useEffect(() => {
    getInsights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-indigo-900 text-white p-6 rounded-2xl shadow-xl mt-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center animate-pulse">
            <i className="fas fa-robot text-indigo-300"></i>
          </div>
          <div>
            <h2 className="text-xl font-bold">Assistente Inteligente Gemini</h2>
            <p className="text-indigo-200 text-sm">Insights automáticos do seu estoque</p>
          </div>
        </div>
        <button 
          onClick={getInsights}
          disabled={loading}
          className="bg-indigo-500 hover:bg-indigo-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          {loading ? (
            <i className="fas fa-spinner fa-spin"></i>
          ) : (
            <i className="fas fa-sync-alt"></i>
          )}
          Recalcular
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="bg-indigo-800/50 p-4 rounded-xl animate-pulse">
              <div className="h-4 bg-indigo-700 rounded w-3/4 mb-3"></div>
              <div className="h-3 bg-indigo-700 rounded w-full mb-2"></div>
              <div className="h-3 bg-indigo-700 rounded w-5/6"></div>
            </div>
          ))
        ) : (
          insights.map((insight, idx) => (
            <div key={idx} className="bg-indigo-800/50 p-4 rounded-xl border border-indigo-700/50 hover:bg-indigo-800/70 transition-all cursor-default">
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-2 h-2 rounded-full ${
                  insight.priority === 'high' ? 'bg-red-400' : 
                  insight.priority === 'medium' ? 'bg-yellow-400' : 'bg-green-400'
                }`}></span>
                <h4 className="font-semibold text-indigo-50 text-sm uppercase tracking-wide">{insight.title}</h4>
              </div>
              <p className="text-indigo-200 text-sm leading-relaxed">{insight.description}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AIAssistant;
