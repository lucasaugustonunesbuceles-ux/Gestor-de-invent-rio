
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
    quantidade: item.quantity
  }));

  const categoryCounts = items.reduce((acc: any, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.quantity;
    return acc;
  }, {});

  const pieData = Object.keys(categoryCounts).map(cat => ({
    name: cat,
    value: categoryCounts[cat]
  }));

  const isDark = document.documentElement.classList.contains('dark');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 transition-all">
      {/* Bar Chart */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
          <i className="fas fa-chart-bar text-blue-500"></i>
          Distribuição de Quantidades (Top 8)
        </h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#374151" : "#f3f4f6"} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: isDark ? '#9CA3AF' : '#6B7280' }} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: isDark ? '#9CA3AF' : '#6B7280' }}
              />
              <Tooltip 
                cursor={{ fill: isDark ? '#1F2937' : '#f9fafb' }}
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: 'none', 
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                  backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                  color: isDark ? '#FFFFFF' : '#000000'
                }}
              />
              <Bar dataKey="quantidade" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-4 h-full">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-800 flex flex-col justify-center transition-colors">
            <span className="text-blue-600 dark:text-blue-400 text-sm font-semibold uppercase">Total de Itens</span>
            <span className="text-3xl font-bold text-blue-900 dark:text-blue-100">{items.length}</span>
            <div className="mt-2 text-xs text-blue-700 dark:text-blue-500">Diversidade de materiais</div>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-xl border border-emerald-100 dark:border-emerald-800 flex flex-col justify-center transition-colors">
            <span className="text-emerald-600 dark:text-emerald-400 text-sm font-semibold uppercase">Estoque Total</span>
            <span className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">
              {items.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
            <div className="mt-2 text-xs text-emerald-700 dark:text-emerald-500">Unidades totais</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 h-full transition-colors">
           <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <i className="fas fa-chart-pie text-emerald-500"></i>
            Porcentagem por Categoria
          </h3>
          <div className="h-48 w-full">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={pieData}
                   cx="50%"
                   cy="50%"
                   innerRadius={60}
                   outerRadius={80}
                   paddingAngle={5}
                   dataKey="value"
                 >
                   {pieData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                   ))}
                 </Pie>
                 <Tooltip 
                   contentStyle={{ 
                     borderRadius: '12px', 
                     border: 'none', 
                     backgroundColor: isDark ? '#1F2937' : '#FFFFFF' 
                   }} 
                 />
               </PieChart>
             </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
             {pieData.map((entry, index) => (
               <div key={index} className="flex items-center gap-2 text-xs">
                 <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                 <span className="text-gray-600 dark:text-gray-400 truncate">{entry.name}</span>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryDashboard;
