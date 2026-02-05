import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Import useNavigate
import api from '../../lib/axios';
import { Gamepad2, Play, Flame, Trophy, Search, Filter } from 'lucide-react';

export default function PlayerLobby() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate(); // 2. Initialize navigate hook

  useEffect(() => {
    const fetchLobby = async () => {
      try {
        const response = await api.get('/player/player/lobby-games'); 
        setGames(response.data);
      } catch (error) {
        console.error("Lobby error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLobby();
  }, []);

  const filteredGames = games.filter(g => 
    g.game_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      <p className="text-slate-400 animate-pulse">Loading amazing games...</p>
    </div>
  );

  return (
    <div className="space-y-10 pb-20">
      {/* --- HERO SECTION --- */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 to-purple-900 p-8 md:p-12 shadow-2xl border border-white/10">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs uppercase tracking-widest mb-4">
            <Flame size={16} fill="currentColor" /> Trending Now
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-4 italic">
            WIN BIG <br /> <span className="text-indigo-400">TODAY.</span>
          </h1>
          <p className="text-slate-300 text-lg mb-8">
            Experience the next generation of fair play and instant payouts.
          </p>
          <button className="bg-indigo-500 hover:bg-indigo-400 text-white px-8 py-4 rounded-2xl font-black transition-all transform hover:scale-105 shadow-lg shadow-indigo-500/20">
            EXPLORE FEATURED
          </button>
        </div>
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 mr-10 mb-10 opacity-20">
           <Trophy size={200} className="text-white" />
        </div>
      </div>

      {/* --- SEARCH & FILTERS --- */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text"
            placeholder="Search your favorite game..."
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {['All', 'Slots', 'Crash', 'Originals'].map((cat) => (
            <button key={cat} className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm font-bold hover:bg-slate-800 transition-colors whitespace-nowrap">
              {cat}
            </button>
          ))}
          <button className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400">
            <Filter size={20} />
          </button>
        </div>
      </div>

      {/* --- GAMES GRID --- */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-white flex items-center gap-3">
            <div className="h-8 w-2 bg-indigo-500 rounded-full"></div>
            ALL GAMES
          </h2>
          <span className="text-slate-500 text-sm font-medium">{filteredGames.length} Games Available</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {filteredGames.map((game) => (
            <div 
              key={game.game_id} 
              // 3. Add onClick handler to navigate to the GamePlay page
              onClick={() => navigate(`/player/play/${game.game_id}`)}
              className="group relative bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 hover:border-indigo-500/50 hover:shadow-[0_0_30px_-10px_rgba(99,102,241,0.3)] transition-all cursor-pointer"
            >
              <div className="absolute top-3 left-3 z-20">
                <span className="bg-green-500/10 text-green-400 text-[10px] font-black px-2 py-1 rounded-lg backdrop-blur-md border border-green-500/20">
                  {game.rtp_percentage}% RTP
                </span>
              </div>

              <div className="aspect-[4/5] bg-gradient-to-br from-slate-800 to-slate-950 flex flex-col items-center justify-center p-6 text-center relative">
                <div className="transform group-hover:scale-110 transition-transform duration-500">
                  <Gamepad2 size={64} className="text-slate-700 group-hover:text-indigo-400" />
                </div>
                
               <span className="mt-4 text-slate-500 font-black text-2xl opacity-10 uppercase select-none">
    {game.engine_type} 
  </span>

                <div className="absolute inset-0 bg-indigo-950/40 opacity-0 group-hover:opacity-100 transition-all backdrop-blur-[2px] flex items-center justify-center">
                  <div className="bg-white p-4 rounded-full shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                    <Play fill="#4f46e5" className="text-indigo-600" size={28} />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-900 border-t border-slate-800">
                <h3 className="font-bold text-sm text-slate-100 truncate group-hover:text-indigo-400 transition-colors uppercase tracking-tight">
                  {game.game_name}
                </h3>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-[10px] text-slate-500 font-bold uppercase">{game.provider_name}</p>
                  <div className="flex gap-0.5">
                    {[1,2,3].map(i => <div key={i} className={`h-1 w-2 rounded-full ${i <= 2 ? 'bg-indigo-500' : 'bg-slate-700'}`}></div>)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}