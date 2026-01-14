
import React from 'react';
import { ActionLog } from '../types';

interface Props {
  logs: ActionLog[];
}

const ActionLogsView: React.FC<Props> = ({ logs }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black">Audit Log</h2>
          <p className="text-slate-400">Rastreabilidade completa de todas as alterações no sistema.</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-xs font-black text-slate-500 uppercase">
          {logs.length} Eventos registrados
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-800/50 text-slate-500 text-[10px] uppercase font-black tracking-widest">
                <th className="px-8 py-5">Usuário / Cargo</th>
                <th className="px-8 py-5">Ação Realizada</th>
                <th className="px-8 py-5">Detalhes</th>
                <th className="px-8 py-5">Data/Hora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-200">{log.user}</span>
                      <span className={`text-[9px] font-black uppercase tracking-widest ${log.role === 'ADM' ? 'text-blue-500' : 'text-slate-500'}`}>
                        {log.role}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="bg-slate-800 px-3 py-1 rounded-lg text-xs font-bold text-slate-300">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-sm text-slate-400 max-w-xs truncate" title={log.details}>
                      {log.details}
                    </p>
                  </td>
                  <td className="px-8 py-5 text-slate-500 text-xs font-mono">
                    {new Date(log.timestamp).toLocaleString('pt-BR')}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center text-slate-600">
                    <i className="fas fa-terminal text-4xl mb-4 opacity-10"></i>
                    <p className="font-black uppercase tracking-widest">Nenhuma ação monitorada ainda</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ActionLogsView;
