import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ShieldCheck, DoorOpen } from 'lucide-react';
import api from '../../lib/axios';
import { toast } from 'react-hot-toast';

// 🎯 Import separate game components
import SlotMachine from '../../components/SlotMachine';
import DiceGame from '../../components/DiceGame';
import CrashGame from '../../components/CrashGame';
import MinesGame from '../../components/MinesGame';

export default function GamePlay() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ending, setEnding] = useState(false);

  useEffect(() => {
    const fetchGameDetails = async () => {
      try {
        const res = await api.get('/player/player/lobby-games');
        const found = res.data.find(g => g.game_id === gameId);
        setGame(found);
      } catch {
        toast.error("Could not load game details");
      } finally {
        setLoading(false);
      }
    };
    fetchGameDetails();
  }, [gameId]);

  const handleEndSession = async () => {
    setEnding(true);
    try {
      await api.post(`/gameplay/end-session/${gameId}`);
      toast.success("Session ended safely");
      navigate('/lobby');
    } catch {
      toast.error("Failed to end session");
      navigate('/lobby');
    } finally {
      setEnding(false);
    }
  };

  // 🎯 Dynamic UI Switch based on engine_type
  const renderGameUI = () => {

  console.log("Current Game Object:", game);
    // Check for both standardized and variations of engine names
    switch (game.engine_type?.toLowerCase()) {
      case 'slot_engine':
      case 'slot':
        return <SlotMachine gameId={gameId} gameName={game.name} />;
      
      case 'dice_engine':
      case 'dice':
        return <DiceGame gameId={gameId} gameName={game.name} />;

      case 'crash_engine':
      case 'crash':
        return <CrashGame gameId={gameId} gameName={game.game_name} />;

      case 'mines_engine':
      case 'mines':
        return <MinesGame gameId={gameId} />;
      
      default:
        return (
          <div className="bg-slate-900 rounded-3xl border border-slate-800 p-20 text-center">
            <p className="text-slate-400">Game engine "{game.engine_type}" not supported yet.</p>
          </div>
        );
    }
  };

  if (loading) return <div className="p-10 text-center text-slate-500">Initializing Engine...</div>;
  if (!game) return <div className="p-10 text-center">Game not found.</div>;

  return (
    <div className="max-w-[1400px] mx-auto space-y-4">
      {/* 🛠️ SHARED TOP BAR */}
      <div className="flex items-center justify-between px-2">
        <button
          onClick={() => navigate('/lobby')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition text-sm font-medium"
        >
          <ChevronLeft size={18} /> Back to Lobby
        </button>

        <div className="flex items-center gap-6">
          <button
            onClick={handleEndSession}
            disabled={ending}
            className="flex items-center gap-2 px-4 py-1.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg text-xs font-bold hover:bg-red-500/20 transition"
          >
            <DoorOpen size={14} /> {ending ? 'ENDING...' : 'END SESSION'}
          </button>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Provably Fair</span>
            <ShieldCheck size={18} className="text-green-500" />
          </div>
        </div>
      </div>

      {/* 🚀 DYNAMIC GAME COMPONENT */}
      <div className="min-h-[600px]">
        {renderGameUI()}
      </div>
    </div>
  );
}


// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { ChevronLeft, ShieldCheck, DoorOpen } from 'lucide-react';
// import api from '../../lib/axios';
// import { toast } from 'react-hot-toast';
// import SlotMachine from '../../components/SlotMachine';

// export default function GamePlay() {
//   const { gameId } = useParams();
//   const navigate = useNavigate();

//   const [game, setGame] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [ending, setEnding] = useState(false);

//   // 🎮 Load game info
//   useEffect(() => {
//     const fetchGameDetails = async () => {
//       try {
//         const res = await api.get('/player/player/lobby-games');
//         const found = res.data.find(g => g.game_id === gameId);
//         setGame(found);
//       } catch {
//         toast.error("Could not load game details");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchGameDetails();
//   }, [gameId]);

//   // 🚪 End session
//   const handleEndSession = async () => {
//     setEnding(true);
//     try {
//       await api.post(`/gameplay/end-session/${gameId}`);
//       toast.success("Session ended safely");
//       navigate('/lobby');
//     } catch {
//       toast.error("Failed to end session");
//       navigate('/lobby');
//     } finally {
//       setEnding(false);
//     }
//   };

//   if (loading) return <div className="p-10 text-center text-slate-500">Initializing Engine...</div>;
//   if (!game) return <div className="p-10 text-center">Game not found.</div>;

//   return (
//     <div className="max-w-5xl mx-auto space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <button
//           onClick={() => navigate('/lobby')}
//           className="flex items-center gap-2 text-slate-400 hover:text-white transition"
//         >
//           <ChevronLeft size={20} /> Back to Lobby
//         </button>

//         <div className="flex items-center gap-4">
//           <button
//             onClick={handleEndSession}
//             disabled={ending}
//             className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl text-xs font-bold"
//           >
//             <DoorOpen size={16} /> {ending ? 'ENDING...' : 'END SESSION'}
//           </button>

//           <div className="h-6 w-[1px] bg-slate-800 mx-2" />

//           <div className="flex items-center gap-2">
//             <span className="text-[10px] font-bold text-slate-500 uppercase">Provably Fair</span>
//             <ShieldCheck size={18} className="text-green-500" />
//           </div>
//         </div>
//       </div>

//       {/* 🎰 GAME AREA */}
//       <div className="bg-slate-900 rounded-3xl border border-slate-800 aspect-video flex items-center justify-center shadow-2xl">
//         <SlotMachine gameId={gameId} />
//       </div>
//     </div>
//   );
// }

