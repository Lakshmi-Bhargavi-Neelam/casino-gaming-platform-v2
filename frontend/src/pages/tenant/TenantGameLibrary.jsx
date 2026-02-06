import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  Search, 
  ShieldCheck, 
  ShieldAlert, 
  Loader2, 
  Eye, 
  Zap, 
  Coins, 
  Settings2,
  X,
  Gamepad2
} from 'lucide-react';
import api from '../../lib/axios';

export default function TenantGameLibrary() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConfig, setSelectedConfig] = useState(null);

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const response = await api.get('/tenant/games/marketplace');
      setGames(response.data);
    } catch (error) {
      toast.error("Failed to load marketplace games");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (gameId, currentStatus) => {
    try {
      await api.post('/tenant/games/toggle', {
        game_id: gameId,
        is_active: !currentStatus
      });

      setGames(prev => prev.map(g =>
        g.game_id === gameId ? { ...g, is_enabled: !currentStatus } : g
      ));

      toast.success(`Game ${!currentStatus ? 'enabled' : 'disabled'}`);
    } catch (error) {
      toast.error("Action failed");
    }
  };

  const filteredGames = games.filter(g =>
    g.game_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.provider_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <div className="relative">
        <Loader2 className="animate-spin text-teal-500" size={48} />
        <div className="absolute inset-0 blur-xl bg-teal-500/20 animate-pulse"></div>
      </div>
      <p className="text-slate-400 mt-6 font-medium tracking-widest uppercase text-xs">Synchronizing Marketplace...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* 1. Header & Search Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Game Library</h1>
          <p className="text-slate-400 mt-1">Browse and activate premium games for your casino.</p>
        </div>

        <div className="relative group min-w-[300px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-teal-400 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search providers or games..."
            className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* 2. Game Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredGames.map((game, index) => (
          <div 
            key={game.game_id}
            className="group relative bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden hover:border-teal-500/50 transition-all duration-300 hover:-translate-y-2 shadow-xl"
            style={{ animation: `fadeInUp 0.4s ease-out ${index * 0.05}s both` }}
          >
            {/* Game Preview Area (Image Placeholder with Gradient) */}
            <div className="relative h-40 bg-slate-900 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-teal-600/20 group-hover:scale-110 transition-transform duration-500"></div>
                <div className="absolute inset-0 flex items-center justify-center opacity-30 group-hover:opacity-50 transition-opacity">
                    <Gamepad2 size={64} className="text-slate-400" />
                </div>
                
                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-tighter border shadow-sm ${
                        game.is_enabled 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : 'bg-slate-900/80 text-slate-500 border-slate-700'
                    }`}>
                        {game.is_enabled ? 'Active' : 'Disabled'}
                    </span>
                </div>

                {/* Engine Badge Overlay */}
                <div className="absolute bottom-3 left-3">
                   <span className="bg-slate-900/90 text-teal-400 text-[9px] font-bold px-2 py-1 rounded border border-slate-700">
                    {game.engine_type}
                   </span>
                </div>
            </div>

            {/* Content Details */}
            <div className="p-5 space-y-4">
              <div>
                <h3 className="text-white font-bold text-lg truncate">{game.game_name}</h3>
                <p className="text-teal-500 text-xs font-semibold">{game.provider_name}</p>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-700/50">
                <div className="flex items-center gap-2">
                    <Zap size={14} className="text-amber-400" />
                    <div>
                        <p className="text-[9px] text-slate-500 uppercase font-bold">Volatility</p>
                        <p className="text-xs text-slate-300 capitalize">{game.volatility}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Coins size={14} className="text-teal-400" />
                    <div>
                        <p className="text-[9px] text-slate-500 uppercase font-bold">RTP</p>
                        <p className="text-xs text-slate-300">{game.rtp_percentage}%</p>
                    </div>
                </div>
              </div>

              {/* Action Area */}
              <div className="flex items-center gap-2 pt-1">
                <button 
                  onClick={() => setSelectedConfig(game.engine_config)}
                  className="p-2.5 rounded-xl bg-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-600 transition-colors border border-slate-600/50"
                  title="View Configuration"
                >
                  <Settings2 size={18} />
                </button>
                
                <button
                  onClick={() => handleToggle(game.game_id, game.is_enabled)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    game.is_enabled
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                      : 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-lg shadow-teal-500/20 hover:scale-[1.02]'
                  }`}
                >
                  {game.is_enabled ? (
                    <><ShieldCheck size={16} /> Deactivate</>
                  ) : (
                    <><ShieldAlert size={16} /> Enable Game</>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredGames.length === 0 && (
        <div className="p-20 text-center bg-slate-800/20 border border-dashed border-slate-700 rounded-2xl">
          <Gamepad2 size={48} className="text-slate-700 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">No games found matching your search.</p>
        </div>
      )}

      {/* ⭐ ENGINE CONFIG MODAL (Matching your theme) */}
      {selectedConfig && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div 
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300" 
                onClick={() => setSelectedConfig(null)}
            ></div>
            
            <div className="relative bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-800/50">
                    <h2 className="text-white font-bold flex items-center gap-2">
                        <Settings2 className="text-teal-400" size={20}/> 
                        Engine Logic Preview
                    </h2>
                    <button onClick={() => setSelectedConfig(null)} className="text-slate-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    <pre className="bg-slate-950 p-6 rounded-xl text-[13px] overflow-auto max-h-[60vh] font-mono leading-relaxed border border-slate-800 text-teal-400 custom-scrollbar">
                        {JSON.stringify(selectedConfig, null, 2)}
                    </pre>
                </div>

                <div className="p-6 bg-slate-900 border-t border-slate-800 flex justify-end">
                    <button 
                        onClick={() => setSelectedConfig(null)} 
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
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 10px;
        }
      `}} />
    </div>
  );
}