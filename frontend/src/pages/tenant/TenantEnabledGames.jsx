import React, { useEffect, useState } from 'react';
import api from '../../lib/axios';
import { toast } from 'react-hot-toast';
import { 
  Edit3, 
  PowerOff, 
  Save, 
  X, 
  Gamepad2, 
  Settings2,
  Zap,
  Coins,
  ArrowUpRight,
  Loader2,
  ShieldCheck
} from 'lucide-react';

export default function TenantEnabledGames() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State for the Override Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [formData, setFormData] = useState({
    min_bet: '',
    max_bet: '',
    rtp_override: ''
  });

  const fetchEnabledGames = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tenant/games/enabled');
      setGames(response.data);
    } catch (error) {
      toast.error("Failed to fetch enabled games");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnabledGames();
  }, []);

  const handleDisable = async (gameId) => {
    if (!window.confirm("Are you sure you want to disable this game?")) return;
    
    try {
      await api.post('/tenant/games/toggle', {
        game_id: gameId,
        is_active: false
      });
      toast.success("Game disabled and moved to library");
      fetchEnabledGames();
    } catch (error) {
      toast.error("Error disabling game");
    }
  };

  const openOverrideModal = (game) => {
    setSelectedGame(game);
    setFormData({
      min_bet: game.min_bet || '',
      max_bet: game.max_bet || '',
      rtp_override: game.rtp || ''
    });
    setIsModalOpen(true);
  };

  const handleSaveOverrides = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/tenant/games/${selectedGame.game_id}/override`, null, {
        params: {
          min_bet: formData.min_bet,
          max_bet: formData.max_bet,
          rtp_override: formData.rtp_override
        }
      });
      
      toast.success("Game configurations updated!");
      setIsModalOpen(false);
      fetchEnabledGames();
    } catch (error) {
      toast.error("Failed to update overrides");
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <Loader2 className="animate-spin text-teal-500 mb-4" size={40} />
      <p className="text-slate-400 tracking-widest uppercase text-xs font-bold">Loading Active Collection...</p>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* 1. Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <div className="p-2 bg-teal-500/10 rounded-lg">
              <Gamepad2 className="text-teal-400 w-8 h-8" />
            </div>
            Active Collection
          </h1>
          <p className="text-slate-400 mt-1">Manage active games, adjust RTP, and set custom bet boundaries.</p>
        </div>
        
        <div className="bg-slate-800/50 border border-slate-700 px-4 py-2 rounded-xl flex items-center gap-3">
          <div className="flex -space-x-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-6 h-6 rounded-full bg-slate-700 border-2 border-slate-900" />
            ))}
          </div>
          <span className="text-slate-300 text-sm font-bold">{games.length} Games Live</span>
        </div>
      </header>

      {/* 2. Empty State */}
      {games.length === 0 ? (
        <div className="bg-slate-800/20 rounded-2xl border-2 border-dashed border-slate-700 p-20 text-center">
          <Gamepad2 className="mx-auto text-slate-700 mb-4" size={48} />
          <p className="text-slate-400 font-medium">No games enabled yet.</p>
          <p className="text-slate-600 text-sm mt-1">Visit the Game Library to add games to your collection.</p>
        </div>
      ) : (
        /* 3. Game Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {games.map((game, index) => (
            <div 
              key={game.game_id} 
              className="group bg-slate-800/40 backdrop-blur-md rounded-2xl border border-slate-700/50 overflow-hidden hover:border-teal-500/50 transition-all duration-300 shadow-xl hover:-translate-y-1"
              style={{ animation: `fadeInUp 0.4s ease-out ${index * 0.05}s both` }}
            >
              {/* Cinematic Header Image */}
              <div className="relative h-32 bg-slate-900 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10" />
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-indigo-500/10 group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 flex items-center justify-center opacity-20">
                  <Gamepad2 size={48} className="text-slate-500" />
                </div>
                <div className="absolute top-3 left-3 z-20">
                  <span className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-md text-[10px] font-black uppercase tracking-tighter">
                    <div className="w-1 h-1 bg-emerald-400 rounded-full animate-pulse" />
                    Live
                  </span>
                </div>
              </div>

              <div className="p-5 relative z-20 -mt-8">
                <div className="mb-4">
                  <h3 className="font-bold text-lg text-white truncate group-hover:text-teal-400 transition-colors">{game.game_name}</h3>
                  <p className="text-[10px] text-teal-500 font-bold uppercase tracking-widest">{game.provider_name}</p>
                </div>

                {/* Technical Stats */}
                <div className="space-y-3 mb-6 bg-slate-900/50 p-3 rounded-xl border border-slate-700/30">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 flex items-center gap-1.5"><Coins size={12} /> RTP</span>
                    <span className="font-mono font-bold text-teal-400 bg-teal-400/10 px-2 py-0.5 rounded">{game.rtp}%</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 flex items-center gap-1.5"><ArrowUpRight size={12} /> Range</span>
                    <span className="font-bold text-slate-200">${game.min_bet} — ${game.max_bet}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 flex items-center gap-1.5"><Zap size={12} /> Risk</span>
                    <span className="capitalize font-bold text-indigo-400">{game.volatility}</span>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex gap-2">
                  <button 
                    onClick={() => openOverrideModal(game)}
                    className="flex-1 flex items-center justify-center gap-2 bg-slate-700/50 text-slate-200 py-2.5 rounded-xl hover:bg-slate-700 hover:text-white transition-all text-xs font-bold border border-slate-600/50"
                  >
                    <Settings2 size={14} /> Configure
                  </button>
                  <button 
                    onClick={() => handleDisable(game.game_id)}
                    className="aspect-square flex items-center justify-center bg-red-500/10 text-red-400 py-2.5 px-3 rounded-xl hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
                    title="Disable Game"
                  >
                    <PowerOff size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- OVERRIDE MODAL (Dark Theme) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsModalOpen(false)} />
          
          <div className="relative bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 w-full max-w-md p-8 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Game Overrides</h2>
                <p className="text-xs text-slate-500 mt-1 uppercase font-bold tracking-widest">{selectedGame?.game_name}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSaveOverrides} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">RTP Percentage (%)</label>
                <div className="relative group">
                  <input 
                    type="number" step="0.01"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-white focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all font-mono"
                    value={formData.rtp_override}
                    onChange={(e) => setFormData({...formData, rtp_override: e.target.value})}
                    placeholder="e.g. 96.5"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 font-bold">%</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Min Bet ($)</label>
                  <input 
                    type="number" step="0.1"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-white focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all font-mono"
                    value={formData.min_bet}
                    onChange={(e) => setFormData({...formData, min_bet: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Max Bet ($)</label>
                  <input 
                    type="number" step="0.1"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-white focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all font-mono"
                    value={formData.max_bet}
                    onChange={(e) => setFormData({...formData, max_bet: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-6 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition-colors border border-slate-700"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl font-bold hover:from-teal-400 hover:to-emerald-400 shadow-lg shadow-teal-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <Save size={18} /> Update Logic
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Animation Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}