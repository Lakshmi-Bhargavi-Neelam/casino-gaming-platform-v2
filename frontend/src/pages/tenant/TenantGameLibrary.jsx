import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Search, ShieldCheck, ShieldAlert, Loader2 } from 'lucide-react';
import api from '../../lib/axios';

export default function TenantGameLibrary() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConfig, setSelectedConfig] = useState(null); // ⭐ NEW

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const response = await api.get('/tenant/games/marketplace');
      setGames(response.data);
    } catch (error) {
      toast.error("Failed to load marketplace games");
      console.error(error);
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
    <div className="flex flex-col items-center justify-center h-64">
      <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
      <p className="text-gray-500">Fetching Game Marketplace...</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Game Library</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search providers or games..."
            className="pl-10 pr-4 py-2 border rounded-lg w-64 focus:ring-2 focus:ring-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Provider & Game</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Bet Limits</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">RTP & Risk</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600">Engine</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {filteredGames.map((game) => (
              <tr key={game.game_id} className="hover:bg-gray-50">

                <td className="px-6 py-4">
                  <div className="font-bold text-gray-900">{game.game_name}</div>
                  <div className="text-sm text-indigo-600">{game.provider_name}</div>
                </td>

                <td className="px-6 py-4 text-sm text-gray-500">
                  Min: {game.tenant_min_bet} <br />
                  Max: {game.tenant_max_bet}
                </td>

                <td className="px-6 py-4 text-sm text-gray-500">
                  RTP: <span className="font-semibold">{game.rtp_percentage}%</span> <br />
                  Volatility: <span className="capitalize">{game.volatility}</span>
                </td>

                {/* 🧠 Engine */}
                <td className="px-6 py-4 text-sm text-gray-500 space-y-2">
                  <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-md text-xs font-medium">
                    {game.engine_type}
                  </span></td>
                  <td>
                  <div>
                    <button
                      onClick={() => setSelectedConfig(game.engine_config)}
className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold 
             bg-indigo-50 text-indigo-700 rounded-md 
             hover:bg-indigo-100 hover:shadow-sm 
             transition-all duration-200"                    >
                      View Config
                    </button>
                  </div>
                </td>

                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleToggle(game.game_id, game.is_enabled)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      game.is_enabled
                        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {game.is_enabled ? <ShieldCheck size={16} /> : <ShieldAlert size={16} />}
                    {game.is_enabled ? 'Active' : 'Enable'}
                  </button>
                </td>

              </tr>
            ))}
          </tbody>
        </table>

        {filteredGames.length === 0 && (
          <div className="p-10 text-center text-gray-400">No games found.</div>
        )}
      </div>

      {/* ⭐ ENGINE CONFIG MODAL */}
      {selectedConfig && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-[600px] max-h-[80vh] overflow-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">Game Engine Configuration</h2>
              <button
                onClick={() => setSelectedConfig(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
              {JSON.stringify(selectedConfig, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
