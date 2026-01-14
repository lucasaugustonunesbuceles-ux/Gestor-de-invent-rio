
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { InventoryItem } from '../types';

interface Props {
  items: InventoryItem[];
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const InventoryDashboard: React.FC<Props> = ({ items }) => {
  const chartData = items.slice(0, 8).map(item => ({
    name: item.name.length > 15 ? item.name.substring(0, 12) + '...' : item.name,
    quantidade: item.quantity,
    minimo: item.minStock
  }));

  const itemsBelowMin = items.filter(i => i.quantity < i.minStock).length;

  const categoryCounts = items.reduce((acc: any, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.quantity;
    return acc;
  }, {});

  const pieData = Object.keys(categoryCounts).map(cat => ({
    name: cat,
    value: categoryCounts[cat]
  }));

  const isDark = true; // Always dark now

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 transition-all">
      {/* Bar Chart */}
      <div className="bg-slate-900 p-6 rounded-3xl shadow-none border border-slate-800 transition-colors">
        <h3 className="text-lg font-black text-white mb-6 flex items-center gap-3">
          <i className="fas fa-chart-bar text-blue-500"></i>
          Saldo vs. Estoque Mínimo
        </h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 'bold' }} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#94A3B8' }}
              />
              <Tooltip 
                cursor={{ fill: '#1E293B' }}
                contentStyle={{ 
                  borderRadius: '16px', 
                  border: '1px solid #334155', 
                  backgroundColor: '#0F172A',
                  color: '#F1F5F9'
                }}
              />
              <Bar dataKey="quantidade" name="Saldo Atual" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.quantidade < entry.minimo ? '#EF4444' : '#3B82F6'} />
                ))}
              </Bar>
              <Bar dataKey="minimo" name="Estoque Mínimo" fill="#334155" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-6 rounded-3xl border transition-all flex flex-col justify-center ${itemsBelowMin > 0 ? 'bg-red-500/10 border-red-500/20 shadow-lg shadow-red-500/5' : 'bg-slate-900 border-slate-800'}`}>
            <span className="text-red-400 text-[10px] font-black uppercase tracking-widest mb-1">Atenção Reposição</span>
            <span className={`text-4xl font-black ${itemsBelowMin > 0 ? 'text-red-500' : 'text-slate-500'}`}>{itemsBelowMin}</span>
            <div className="mt-2 text-[10px] text-slate-500 font-bold uppercase">Materiais Críticos</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl flex flex-col justify-center transition-all">
            <span className="text-blue-400 text-[10px] font-black uppercase tracking-widest mb-1">Total Unidades</span>
            <span className="text-4xl font-black text-white">
              {items.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
            <div className="mt-2 text-[10px] text-slate-500 font-bold uppercase">Volume em estoque</div>
          </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 h-full transition-colors relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 blur-3xl rounded-full"></div>
           <h3 className="text-lg font-black text-white mb-4 flex items-center gap-3">
            <i className="fas fa-chart-pie text-indigo-500"></i>
            Ocupação por Categoria
          </h3>
          <div className="flex items-center">
            <div className="h-44 w-1/2">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie
                     data={pieData}
                     cx="50%"
                     cy="50%"
                     innerRadius={50}
                     outerRadius={70}
                     paddingAngle={8}
                     dataKey="value"
                   >
                     {pieData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="transparent" />
                     ))}
                   </Pie>
                   <Tooltip 
                     contentStyle={{ 
                       borderRadius: '16px', 
                       border: 'none', 
                       backgroundColor: '#0F172A' 
                     }} 
                   />
                 </PieChart>
               </ResponsiveContainer>
            </div>
            <div className="w-1/2 space-y-2">
               {pieData.map((entry, index) => (
                 <div key={index} className="flex items-center justify-between text-[10px] font-bold">
                   <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                    <span className="text-slate-400 truncate w-24 uppercase tracking-tighter">{entry.name}</span>
                   </div>
                   <span className="text-slate-100">{entry.value}</span>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryDashboard;
