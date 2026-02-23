import React, { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { 
  Gamepad2, 
  Cpu, 
  Settings2, 
  Target, 
  Zap, 
  DollarSign, 
  Eye,
  X,
  Search,
  AlertCircle
} from 'lucide-react';

export default function MyGames() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConfig, setSelectedConfig] = useState(null);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await api.get('/game-providers/my-games');
        setGames(response.data);
      } catch (err) {
        console.error("Failed to fetch games", err);
      } finally {
        setLoading(false);
      }
    };
    fetchGames();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <div className="relative">
        <Cpu className="animate-spin text-teal-500" size={48} />
        <div className="absolute inset-0 blur-xl bg-teal-500/20 animate-pulse"></div>
      </div>
      <p className="text-slate-500 mt-6 font-bold tracking-[0.2em] text-xs uppercase">Loading Studio Inventory...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* 1. Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
             <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                <Gamepad2 className="text-indigo-400 w-8 h-8" />
             </div>
             Published Games
          </h1>
          <p className="text-slate-400 mt-2 font-medium">
            Manage your studio's game inventory, logic configurations, and deployment status.
          </p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 px-6 py-3 rounded-2xl flex items-center gap-4 shadow-xl">
           <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Build Count</span>
              <span className="text-xl font-black text-white">{games.length} Titles</span>
           </div>
        </div>
      </header>

      {/* 2. Main Ledger Table Card */}
      <div className="bg-slate-800/50 backdrop-blur-md rounded-[2.5rem] border border-slate-700/50 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[11px] uppercase font-black tracking-[0.15em] text-slate-500 bg-slate-900/40">
                <th className="px-8 py-6">Game & Engine</th>
                <th className="px-8 py-6 text-center">Engine Logic</th>
                <th className="px-8 py-6 text-center">RTP</th>
                <th className="px-8 py-6 text-center">Volatility</th>
                <th className="px-8 py-6">Bet Boundaries</th>
                <th className="px-8 py-6 text-right">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-700/30">
              {games.length > 0 ? games.map((game, index) => (
                <tr 
                  key={game.game_id} 
                  className="group hover:bg-slate-700/30 transition-all duration-200"
                  style={{ animation: `fadeInUp 0.3s ease-out ${index * 0.04}s both` }}
                >
                  {/* Game & Engine */}
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 text-teal-400 flex items-center justify-center font-black border border-slate-600 group-hover:border-teal-500/50 transition-colors shadow-lg">
                        <Cpu size={20} />
                      </div>
                      <div>
                        <div className="font-bold text-slate-100 group-hover:text-white transition-colors">{game.game_name}</div>
                        <div className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mt-0.5">
                          {game.engine_type.replace('_', ' ')}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Engine Config Preview */}
                  <td className="px-8 py-6 text-center">
                    <button 
                      onClick={() => setSelectedConfig(game)}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-900/50 border border-slate-700 rounded-lg text-[10px] font-black uppercase text-slate-400 hover:text-teal-400 hover:border-teal-500/50 transition-all"
                    >
                      <Settings2 size={14} /> View JSON
                    </button>
                  </td>

                  {/* RTP */}
                  <td className="px-8 py-6 text-center">
                    <span className="text-emerald-400 font-black text-sm tracking-tight bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
                      {game.rtp_percentage}%
                    </span>
                  </td>

                  {/* Volatility */}
                  <td className="px-8 py-6 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <Zap size={14} className={`${game.volatility === 'high' ? 'text-amber-500' : 'text-slate-500'}`} />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 capitalize">
                        {game.volatility || 'Normal'}
                      </span>
                    </div>
                  </td>

                  {/* Bet Limits */}
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4 text-xs font-bold text-slate-300">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-slate-600 uppercase">Min</span>
                        <span>${game.min_bet}</span>
                      </div>
                      <div className="h-6 w-px bg-slate-700"></div>
                      <div className="flex flex-col">
                        <span className="text-[9px] text-slate-600 uppercase">Max</span>
                        <span>${game.max_bet}</span>
                      </div>
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="px-8 py-6 text-right">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border shadow-sm ${
                      game.status === 'active'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      <div className={`w-1 h-1 rounded-full ${game.status === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                      {game.status}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-30">
                      <AlertCircle size={56} className="text-slate-400" />
                      <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-sm">No games published to library</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. JSON CONFIG MODAL */}
      {selectedConfig && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={() => setSelectedConfig(null)}></div>
            <div className="relative bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-8 border-b border-slate-800 bg-slate-800/50">
                    <div>
                      <h2 className="text-white font-bold text-xl flex items-center gap-3">
                          <Settings2 className="text-teal-400" size={24}/> 
                          Engine Configuration
                      </h2>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Source Logic: {selectedConfig.game_name}</p>
                    </div>
                    <button onClick={() => setSelectedConfig(null)} className="text-slate-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-8">
                    <pre className="bg-slate-950 p-8 rounded-2xl text-[13px] overflow-auto max-h-[50vh] font-mono leading-relaxed border border-slate-800 text-teal-400 custom-scrollbar shadow-inner">
                        {JSON.stringify(selectedConfig.engine_config, null, 2)}
                    </pre>
                </div>

                <div className="p-8 bg-slate-900 border-t border-slate-800 flex justify-end gap-4">
                    <button 
                        onClick={() => setSelectedConfig(null)} 
                        className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-colors border border-slate-700 text-xs uppercase tracking-widest"
                    >
                        Close Preview
                    </button>
                </div>
            </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
      `}} />
    </div>
  );
}