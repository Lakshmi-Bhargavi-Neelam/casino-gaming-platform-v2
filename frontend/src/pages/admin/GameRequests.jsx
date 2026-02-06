import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  CheckCircle, 
  Eye, 
  Settings, 
  Gamepad2, 
  Cpu, 
  Percent, 
  Code2, 
  X,
  AlertCircle
} from 'lucide-react';
import api from '../../lib/axios';

export default function GameRequests() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewingConfig, setViewingConfig] = useState(null);

  const fetchPendingGames = async () => {
    try {
      setLoading(true);
      const res = await api.get('/games/pending');
      setGames(res.data);
    } catch (error) {
      toast.error("Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPendingGames(); }, []);

  const handleApprove = async (gameId) => {
    try {
      await api.patch(`/games/${gameId}/approve`);
      toast.success("Game Approved!");
      fetchPendingGames();
    } catch (error) { 
      toast.error("Approval failed"); 
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      
      {/* 1. Page Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Gamepad2 className="text-teal-400 w-8 h-8" />
            Pending Game Requests
          </h1>
          <p className="text-slate-400 mt-1">
            Review game logic, RTP configurations, and engine types before deployment.
          </p>
        </div>
        
        <div className="bg-slate-800 border border-slate-700 px-4 py-2 rounded-full hidden md:flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></div>
          <span className="text-slate-300 text-sm font-medium">{games.length} Games Awaiting Approval</span>
        </div>
      </header>

      {/* 2. Main Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
          <div className="w-12 h-12 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin"></div>
          <p className="text-slate-400 animate-pulse">Loading game data...</p>
        </div>
      ) : games.length === 0 ? (
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-16 text-center">
          <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-300">No Pending Requests</h3>
          <p className="text-slate-500 mt-2">All game submissions have been processed.</p>
        </div>
      ) : (
        <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs uppercase tracking-widest text-slate-500 bg-slate-900/40">
                  <th className="px-8 py-5 font-semibold">Game Info</th>
                  <th className="px-8 py-5 font-semibold">Engine Type</th>
                  <th className="px-8 py-5 font-semibold">Logic Config</th>
                  <th className="px-8 py-5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/40">
                {games.map((game, index) => (
                  <tr 
                    key={game.game_id} 
                    className="group hover:bg-slate-700/30 transition-all duration-200"
                    style={{ animation: `fadeInUp 0.3s ease-out ${index * 0.05}s both` }}
                  >
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="text-white font-bold text-lg group-hover:text-teal-400 transition-colors">
                          {game.game_name}
                        </span>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1 text-xs text-slate-500 font-mono">
                            <Code2 size={12} /> {game.game_code}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            <Percent size={12} /> RTP: {game.rtp_percentage}%
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg text-[10px] font-black uppercase tracking-tighter">
                        <Cpu size={14} />
                        {game.engine_type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <button 
                        onClick={() => setViewingConfig(game)}
                        className="flex items-center gap-2 text-sm text-slate-400 hover:text-teal-400 transition-colors py-2 px-3 rounded-lg hover:bg-slate-700/50 border border-transparent hover:border-slate-600"
                      >
                        <Eye size={16} /> 
                        <span className="font-medium">View JSON</span>
                      </button>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button 
                        onClick={() => handleApprove(game.game_id)} 
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-500 
                        text-white px-6 py-2.5 rounded-xl hover:from-teal-400 hover:to-emerald-400 
                        transition-all duration-200 text-sm font-bold shadow-lg shadow-teal-500/10 
                        hover:shadow-teal-500/20 active:scale-95 group/btn"
                      >
                        <CheckCircle size={18} className="group-hover/btn:scale-110 transition-transform" /> 
                        Approve
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. MODAL: JSON CONFIG VIEW (Glass-morphism) */}
      {viewingConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setViewingConfig(null)}
          ></div>
          
          {/* Modal Content */}
          <div className="relative bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-800/50">
              <h3 className="text-white font-bold flex items-center gap-2">
                <Settings className="text-teal-400" size={20}/> 
                Engine Configuration: <span className="text-slate-400">{viewingConfig.game_name}</span>
              </h3>
              <button 
                onClick={() => setViewingConfig(null)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="relative group">
                {/* Syntax Highlighter Style Pre */}
                <pre className="bg-slate-950 p-6 rounded-xl text-[13px] overflow-auto max-h-[400px] font-mono leading-relaxed border border-slate-800 text-teal-400 custom-scrollbar">
                  {JSON.stringify(viewingConfig.engine_config, null, 2)}
                </pre>
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                   <span className="text-[10px] text-slate-600 uppercase font-bold bg-slate-900 px-2 py-1 rounded">Read Only</span>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-900 border-t border-slate-800 flex justify-end">
              <button 
                onClick={() => setViewingConfig(null)} 
                className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-colors border border-slate-700"
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
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #0f172a;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #334155;
        }
      `}} />
    </div>
  );
}