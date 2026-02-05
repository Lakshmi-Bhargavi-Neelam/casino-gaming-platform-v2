import React, { useEffect, useState } from 'react';
import api from '../../lib/axios';
import { toast } from 'react-hot-toast';
import { 
  Edit3, 
  PowerOff, 
  Save, 
  X, 
  Gamepad2, 
  Settings2 
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

  // ❌ Disable Game Action
  const handleDisable = async (gameId) => {
    if (!window.confirm("Are you sure you want to disable this game?")) return;
    
    try {
      // Matches your @router.post("/toggle")
      await api.post('/tenant/games/toggle', {
        game_id: gameId,
        is_active: false
      });
      toast.success("Game disabled and moved to library");
      fetchEnabledGames(); // Refresh the list
    } catch (error) {
      toast.error("Error disabling game");
    }
  };

  // 🎛 Open Override Modal
  const openOverrideModal = (game) => {
    setSelectedGame(game);
    setFormData({
      min_bet: game.min_bet || '',
      max_bet: game.max_bet || '',
      rtp_override: game.rtp || ''
    });
    setIsModalOpen(true);
  };

  // 💾 Save Overrides Action
  const handleSaveOverrides = async (e) => {
    e.preventDefault();
    try {
      // Matches your @router.patch("/{game_id}/override")
      // Note: Backend takes query params or body depending on implementation
      // Here we pass them as query params as per your patch definition
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

  if (loading) return <div className="p-10 text-center text-indigo-600">Loading Enabled Games...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Gamepad2 className="text-indigo-600" />
          Active Game Collection
        </h1>
        <p className="text-gray-500">Manage your active games, set bet limits, and adjust RTP overrides.</p>
      </div>

      {games.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500">No games enabled yet. Visit the Game Library to add games.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <div key={game.game_id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{game.game_name}</h3>
                    <p className="text-xs text-indigo-600 font-medium uppercase tracking-wider">{game.provider_name}</p>
                  </div>
                  <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold">Active</span>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">RTP:</span>
                    <span className="font-mono font-semibold text-gray-800">{game.rtp}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Bet Range:</span>
                    <span className="font-semibold text-gray-800">${game.min_bet} - ${game.max_bet}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Volatility:</span>
                    <span className="capitalize font-medium px-2 bg-gray-100 rounded text-gray-700">{game.volatility}</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <button 
                    onClick={() => openOverrideModal(game)}
                    className="flex-1 flex items-center justify-center gap-2 bg-indigo-50 text-indigo-700 py-2 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-semibold"
                  >
                    <Settings2 size={16} /> Override
                  </button>
                  <button 
                    onClick={() => handleDisable(game.game_id)}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 py-2 rounded-lg hover:bg-red-100 transition-colors text-sm font-semibold"
                  >
                    <PowerOff size={16} /> Disable
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- OVERRIDE MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 m-4 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Configure Overrides</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSaveOverrides} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">RTP Percentage (%)</label>
                <input 
                  type="number" step="0.01"
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  value={formData.rtp_override}
                  onChange={(e) => setFormData({...formData, rtp_override: e.target.value})}
                  placeholder="e.g. 96.5"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Bet ($)</label>
                  <input 
                    type="number" step="0.1"
                    className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formData.min_bet}
                    onChange={(e) => setFormData({...formData, min_bet: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Bet ($)</label>
                  <input 
                    type="number" step="0.1"
                    className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formData.max_bet}
                    onChange={(e) => setFormData({...formData, max_bet: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-6 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 shadow-md flex items-center justify-center gap-2"
                >
                  <Save size={18} /> Save Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}