// src/pages/provider/MyGames.jsx
import React, { useState, useEffect } from 'react';
import api from '../../lib/axios';

export default function MyGames() {
  const [games, setGames] = useState([]);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await api.get('/game-providers/my-games');
        setGames(response.data);
      } catch (err) {
        console.error("Failed to fetch games", err);
      }
    };
    fetchGames();
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100">
        <h2 className="text-lg font-bold text-slate-800">My Games List</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              <th className="px-6 py-4">Game / Engine</th>
              <th className="px-6 py-4">Engine Config</th>
              <th className="px-6 py-4">RTP %</th>
              <th className="px-6 py-4">Volatility</th>
              <th className="px-6 py-4">Limits (Min/Max)</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {games.map((game) => (
              <tr key={game.game_id} className="hover:bg-slate-50 transition-colors">
                {/* 🎯 Game Name & Engine Type */}
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-900">{game.game_name}</div>
                  <div className="text-[10px] text-purple-600 font-mono uppercase font-semibold">
                    {game.engine_type}
                  </div>
                </td>

                {/* 🎯 Engine Config (JSON stringified) */}
                <td className="px-6 py-4">
                  <code className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-600 block max-w-[150px] truncate">
                    {JSON.stringify(game.engine_config)}
                  </code>
                </td>

                {/* 🎯 RTP */}
                <td className="px-6 py-4 font-medium text-slate-700">
                  {game.rtp_percentage}%
                </td>

                {/* 🎯 Volatility */}
                <td className="px-6 py-4">
                  <span className="capitalize px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs">
                    {game.volatility || 'Normal'}
                  </span>
                </td>

                {/* 🎯 Min/Max Bet */}
                <td className="px-6 py-4 text-slate-600 font-mono">
                  ${game.min_bet} / ${game.max_bet}
                </td>

                {/* 🎯 Status */}
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                    game.status === 'active' 
                      ? 'bg-green-100 text-green-700 border border-green-200' 
                      : 'bg-amber-100 text-amber-700 border border-amber-200'
                  }`}>
                    {game.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}