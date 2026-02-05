import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { CheckCircle, XCircle, Eye, Settings } from 'lucide-react';
import api from '../../lib/axios';

export default function GameRequests() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewingConfig, setViewingConfig] = useState(null); // For modal/preview

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
    } catch (error) { toast.error("Approval failed"); }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Pending Game Requests</h1>

      {loading ? (
        <div className="text-center p-8">Loading...</div>
      ) : games.length === 0 ? (
        <div className="text-gray-500 bg-white p-8 rounded-lg text-center">No pending requests</div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Game Info</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Engine Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Logic Config</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {games.map((game) => (
                <tr key={game.game_id}>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{game.game_name}</div>
                    <div className="text-xs text-gray-500">{game.game_code} | RTP: {game.rtp_percentage}%</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-md text-xs font-bold uppercase">
                      {game.engine_type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => setViewingConfig(game)}
                      className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                    >
                      <Eye size={14} /> View JSON
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="inline-flex gap-4">
                      <button onClick={() => handleApprove(game.game_id)} className="text-emerald-600 flex items-center gap-1"><CheckCircle size={16}/> Approve</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* SIMPLE OVERLAY TO VIEW CONFIG */}
      {viewingConfig && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl">
            <h3 className="font-bold mb-4 flex items-center gap-2"><Settings size={18}/> Engine Configuration</h3>
            <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-60 mb-4 font-mono">
              {JSON.stringify(viewingConfig.engine_config, null, 2)}
            </pre>
            <button onClick={() => setViewingConfig(null)} className="w-full bg-gray-800 text-white py-2 rounded">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}