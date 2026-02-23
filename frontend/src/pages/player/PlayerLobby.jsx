import React, { useEffect, theme, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import { 
  Gamepad2, 
  Play, 
  Flame, 
  Trophy, 
  Search, 
  Filter, 
  Zap, 
  TrendingUp, 
  Star,
  Loader2
} from 'lucide-react';

export default function PlayerLobby() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState('All');
  const navigate = useNavigate();

// Inside src/pages/player/PlayerLobby.jsx

useEffect(() => {
  const fetchLobby = async () => {
    try {
      // Get the ID we saved when clicking "Enter Casino"
      const activeTenantId = localStorage.getItem('active_tenant_id');
      
      if (!activeTenantId) {
        navigate('/player/casinos');
        return;
      }

      // Send the tenant_id to the backend
      const response = await api.get(`/player/player/lobby-games?tenant_id=${activeTenantId}`); 
      setGames(response.data);
    } catch (error) {
      console.error("Lobby error:", error);
    } finally {
      setLoading(false);
    }
  };
  fetchLobby();
}, [navigate]);

  const filteredGames = games.filter(g => 
    g.game_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
      <div className="relative">
        <Loader2 className="animate-spin text-teal-500" size={64} />
        <div className="absolute inset-0 blur-2xl bg-teal-500/20 animate-pulse"></div>
      </div>
      <p className="text-slate-500 font-black tracking-[0.3em] uppercase text-xs">Initializing Gaming Core...</p>
    </div>
  );

  return (
    <div className="space-y-12 pb-24 animate-in fade-in duration-1000">
      
      <div className="relative overflow-hidden rounded-[3rem] bg-[#0f172a] border border-slate-800 shadow-2xl group">
        {/* Animated Background Gradients */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[120px] -z-10 group-hover:bg-teal-500/20 transition-all duration-700"></div>
        <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] -z-10"></div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 p-10 md:p-16 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500/10 border border-teal-500/20 rounded-full text-teal-400 text-[10px] font-black uppercase tracking-widest animate-bounce">
              <Zap size={14} fill="currentColor" /> Live Bonus active
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black text-white leading-[0.9] tracking-tighter italic">
              UNLEASH THE <br /> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-500">
                JACKPOT.
              </span>
            </h1>
            
            <p className="text-slate-400 text-lg font-medium max-w-md leading-relaxed">
              Experience ultra-fair gaming with instant crypto payouts and exclusive studio originals.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <button className="px-10 py-5 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-teal-500/20 hover:shadow-teal-500/40 transition-all hover:-translate-y-1 active:scale-95">
                Play Featured
              </button>
              <div className="flex items-center gap-4 px-6 py-4 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800">
                <div className="text-right">
                  <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Global Prize Pool</p>
                  <p className="text-xl font-black text-white font-mono">$1,240,500.00</p>
                </div>
                <TrendingUp className="text-emerald-500 animate-pulse" size={24} />
              </div>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="hidden lg:flex justify-center relative">
             <div className="relative z-10 animate-float">
                <Trophy size={320} className="text-teal-400/20 drop-shadow-[0_0_30px_rgba(20,184,166,0.3)]" />
             </div>
             <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-64 bg-teal-500/20 rounded-full blur-3xl animate-pulse"></div>
             </div>
          </div>
        </div>
      </div>

     {/* ---  SMART SEARCH & FILTER BAR --- */}
{/* Fixed the top position and background to prevent messy overlaps on scroll */}
<div className="sticky top-[0px] -mx-10 px-10 py-6 z-30 bg-[#070b14] border-b border-slate-800/50 shadow-2xl transition-all">
  <div className="flex flex-col xl:flex-row gap-6 items-center justify-between max-w-7xl mx-auto">
    
    {/* Search Input */}
    <div className="relative w-full xl:w-1/3 group">
      <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-teal-400 transition-colors" size={20} />
      <input 
        type="text"
        placeholder="Search 500+ premium titles..."
        className="w-full bg-slate-900 border border-slate-700/50 rounded-2xl py-4 pl-14 pr-6 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/30 transition-all shadow-inner"
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>

    {/* Categories */}
    <div className="flex items-center gap-3 overflow-x-auto w-full xl:w-auto no-scrollbar pb-2 xl:pb-0">
      {['All', 'Slots', 'Crash', 'Originals', 'Table'].map((cat) => (
        <button 
          key={cat} 
          onClick={() => setActiveCategory(cat)}
          className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
            activeCategory === cat 
            ? 'bg-teal-500 text-slate-950 border-teal-400 shadow-lg shadow-teal-500/20' 
            : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:text-white hover:border-slate-600'
          }`}
        >
          {cat}
        </button>
      ))}
      <div className="h-8 w-px bg-slate-800 mx-2 hidden md:block"></div>
      <button className="p-3 rounded-xl bg-slate-800/40 border border-slate-700 text-slate-500 hover:text-white transition-all">
        <Filter size={20} />
      </button>
    </div>
  </div>
</div>

      {/* ---  GAMES GRID */}
      <section>
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="w-2 h-10 bg-gradient-to-t from-teal-500 to-emerald-400 rounded-full shadow-[0_0_15px_rgba(20,184,166,0.5)]"></div>
            <h2 className="text-3xl font-black text-white tracking-tighter italic uppercase">
              All <span className="text-teal-400">Games</span>
            </h2>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 rounded-xl border border-slate-800">
             <Star size={14} className="text-amber-500 fill-amber-500" />
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{filteredGames.length} Titles Online</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredGames.map((game, index) => (
            <div 
              key={game.game_id} 
              onClick={() => navigate(`/player/play/${game.game_id}`)}
              className="group relative bg-[#0f172a] rounded-[2rem] overflow-hidden border border-slate-800 hover:border-teal-500/50 transition-all duration-500 cursor-pointer shadow-xl hover:-translate-y-2"
              style={{ animation: `fadeInUp 0.4s ease-out ${index * 0.04}s both` }}
            >
              {/* Card Header: RTP Badge */}
              <div className="absolute top-4 left-4 z-20">
                <span className="bg-emerald-500/10 text-emerald-400 text-[9px] font-black px-2.5 py-1.5 rounded-lg backdrop-blur-md border border-emerald-500/20 shadow-lg">
                  {game.rtp_percentage}% RTP
                </span>
              </div>

              {/* Game Visual Section */}
              <div className="aspect-[4/5] bg-slate-950 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-teal-500 via-transparent to-transparent"></div>
                </div>

                <div className="relative z-10 transform group-hover:scale-110 transition-transform duration-700 ease-out">
                  <Gamepad2 size={72} className="text-slate-800 group-hover:text-teal-400 transition-colors duration-500" />
                </div>
                
                <span className="absolute bottom-10 text-slate-800 font-black text-3xl opacity-20 uppercase select-none tracking-tighter group-hover:text-teal-500/20 transition-colors">
                   {game.engine_type.split('_')[0]}
                </span>

                {/* Play Button Overlay */}
                <div className="absolute inset-0 bg-teal-950/40 opacity-0 group-hover:opacity-100 transition-all duration-500 backdrop-blur-[3px] flex items-center justify-center">
                  <div className="bg-white p-5 rounded-full shadow-[0_0_30px_rgba(255,255,255,0.4)] transform translate-y-8 group-hover:translate-y-0 transition-all duration-500 ease-out">
                    <Play fill="#0f172a" className="text-slate-900 ml-1" size={32} />
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 bg-[#0f172a] border-t border-slate-800/50 relative">
                <h3 className="font-bold text-sm text-white truncate group-hover:text-teal-400 transition-colors uppercase tracking-tight">
                  {game.game_name}
                </h3>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{game.provider_name}</p>
                  <div className="flex gap-1">
                    <div className="h-1 w-3 rounded-full bg-teal-500"></div>
                    <div className="h-1 w-3 rounded-full bg-teal-500"></div>
                    <div className="h-1 w-3 rounded-full bg-slate-700"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Internal Animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(3deg); }
          50% { transform: translateY(-20px) rotate(-3deg); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}} />
    </div>
  );
}