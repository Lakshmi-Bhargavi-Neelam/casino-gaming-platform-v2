import React from 'react';
import { Clock, ChevronRight } from 'lucide-react';

export default function HistoryTable({ history }) {
  if (!history || history.length === 0) {
    return <div className="p-20 text-center text-slate-500 font-bold uppercase tracking-widest">No rounds found</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-slate-950/50 text-slate-500 text-[10px] uppercase font-black tracking-widest">
            <th className="px-6 py-4">Game & Round ID</th>
            <th className="px-6 py-4">Result</th>
            <th className="px-6 py-4">Bet / Payout</th>
            <th className="px-6 py-4">Balance After</th>
            <th className="px-6 py-4">Time</th>
            <th className="px-6 py-4 text-right">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/50">
          {history.map((item) => (
            <tr key={item.round_id} className="hover:bg-slate-800/20 transition group">
              <td className="px-6 py-4">
                <div className="font-bold text-white group-hover:text-indigo-400 transition-colors">
                  {item.game_name}
                </div>
                <div className="text-[10px] text-slate-600 font-mono flex items-center gap-1">
                  <Clock size={10} /> {item.round_id.substring(0, 8)}
                </div>
              </td>

<td className="px-6 py-4">
  <div className="flex flex-wrap gap-1">
    {/* 🎯 FIX: Specifically target the 'spin' property if it exists */}
    {item.result_data?.spin && Array.isArray(item.result_data.spin) ? (
      item.result_data.spin.map((symbol, idx) => (
        <span key={idx} className="bg-slate-800 px-1.5 py-0.5 rounded text-[10px] border border-slate-700 font-bold text-slate-300">
          {symbol}
        </span>
      ))
    ) : Array.isArray(item.result_data) ? (
      item.result_data.map((symbol, idx) => (
        <span key={idx} className="bg-slate-800 px-1.5 py-0.5 rounded text-[10px] border border-slate-700 font-bold text-slate-300">
          {symbol}
        </span>
      ))
    ) : (
      <span className="text-slate-400 text-xs">
        {typeof item.result_data === 'object' ? 'Result Processed' : item.result_data || '---'}
      </span>
    )}
  </div>
</td>

              <td className="px-6 py-4">
                <div className="text-xs text-slate-400 font-bold">Bet: ${item.bet_amount}</div>
                <div className={`text-sm font-black ${item.win_amount > 0 ? 'text-green-400' : 'text-slate-500'}`}>
                  {item.win_amount > 0 ? `Win: $${item.win_amount}` : 'No Win'}
                </div>
              </td>

              <td className="px-6 py-4 font-mono text-sm text-slate-300">
                {/* 🎯 FIX: Display historical balance if available, else '---' */}
                {item.balance_after !== null 
                  ? `$${parseFloat(item.balance_after).toLocaleString(undefined, { minimumFractionDigits: 2 })}` 
                  : '$---'}
              </td>

              <td className="px-6 py-4 text-xs text-slate-500">
                {item.date ? new Date(item.date).toLocaleTimeString() : 'N/A'}
              </td>

              <td className="px-6 py-4 text-right">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                  item.win_amount > 0 ? 'bg-green-500/10 text-green-500' : 'bg-slate-800 text-slate-500'
                }`}>
                  {item.win_amount > 0 ? 'Won' : 'Loss'}
                  <ChevronRight size={12} />
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}