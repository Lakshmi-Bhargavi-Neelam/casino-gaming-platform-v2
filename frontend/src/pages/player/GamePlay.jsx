import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ShieldCheck, DoorOpen, Trophy } from 'lucide-react'; // 🎯 Import Trophy
import api from '../../lib/axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';


// Import separate game components
import SlotMachine from '../../components/SlotMachine';
import DiceGame from '../../components/DiceGame';
import CrashGame from '../../components/CrashGame';
import MinesGame from '../../components/MinesGame';

export default function GamePlay() {
  const { gameId } = useParams();
    const { activeTenantId } = useAuth(); 
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ending, setEnding] = useState(false);

  // 🎯 NEW STATE: Jackpot Logic
  const [activeProgressive, setActiveProgressive] = useState(null); 
  const [optIn, setOptIn] = useState(false); 

  useEffect(() => {
    const fetchGameDetails = async () => {
      // 🎯 Guard: Wait for tenant ID
      if (!activeTenantId) return; 

      try {
        // 🎯 FIX: Pass tenant_id query param
        const res = await api.get(`/player/player/lobby-games?tenant_id=${activeTenantId}`);
        const found = res.data.find(g => g.game_id === gameId);
        
        if (found) {
          setGame(found);
        } else {
          toast.error("Game not found in this lobby");
          navigate('/player/lobby');
        }
      } catch (err) {
        console.error(err);
        toast.error("Could not load game details");
      } finally {
        setLoading(false);
      }
    };
    
    fetchGameDetails();
  }, [gameId, activeTenantId, navigate]); // 🎯 Add dependencies

  useEffect(() => {
    const checkJackpotStatus = async () => {
      if (!activeTenantId) return;

      try {
        // 🎯 FIX: Pass tenant_id here too (if your backend requires it now or later)
        // If your jackpot endpoint still uses user.tenant_id, it might return empty list.
        // It's safer to rely on the backend logic we updated for filtering.
        const res = await api.get('/player/jackpots/active');
        const progressive = res.data.find(j => j.jackpot_type === 'PROGRESSIVE');
        setActiveProgressive(progressive); 
      } catch (err) {
        console.error("Jackpot check failed");
      }
    };
    checkJackpotStatus();
  }, [activeTenantId]);

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

  const renderGameUI = () => {
    // 🎯 PASS optIn PROP TO ALL GAMES
    const commonProps = { gameId, gameName: game.game_name, optIn, tenantId: activeTenantId};

    switch (game.engine_type?.toLowerCase()) {
      case 'slot_engine':
      case 'slot':
        return <SlotMachine {...commonProps} />;
      
      case 'dice_engine':
      case 'dice':
        return <DiceGame {...commonProps} />;

      case 'crash_engine':
      case 'crash':
        return <CrashGame {...commonProps} />;

      case 'mines_engine':
      case 'mines':
        return <MinesGame {...commonProps} />;
      
      default:
        return <div className="text-slate-500 text-center">Engine not supported</div>;
    }
  };

  if (loading) return <div className="p-10 text-center text-slate-500">Initializing Engine...</div>;
  if (!game) return <div className="p-10 text-center">Game not found.</div>;

  return (
    <div className="max-w-[1400px] mx-auto space-y-4">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-2">
        <button onClick={() => navigate('/lobby')} className="flex items-center gap-2 text-slate-400 hover:text-white transition text-sm font-medium">
          <ChevronLeft size={18} /> Back to Lobby
        </button>
        <div className="flex items-center gap-6">
          <button onClick={handleEndSession} disabled={ending} className="flex items-center gap-2 px-4 py-1.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg text-xs font-bold hover:bg-red-500/20 transition">
            <DoorOpen size={14} /> {ending ? 'ENDING...' : 'END SESSION'}
          </button>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Provably Fair</span>
            <ShieldCheck size={18} className="text-green-500" />
          </div>
        </div>
      </div>

      {/* 🎯 JACKPOT OPT-IN TOGGLE (Only shows if Jackpot Exists) */}
      {activeProgressive && (
         <div className="mx-2 p-4 bg-gradient-to-r from-indigo-900 to-purple-900 rounded-xl border border-indigo-500/50 flex items-center justify-between shadow-lg animate-in slide-in-from-top-2">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-indigo-500 rounded-lg text-white">
                  <Trophy size={20} />
               </div>
               <div>
                  <p className="text-white font-bold text-sm uppercase italic">Compete for Progressive Jackpot</p>
                  <p className="text-indigo-200 text-[10px] font-medium">
                     {activeProgressive.contribution_percentage}% of bet goes to pool (${Number(activeProgressive.current_amount).toLocaleString()})
                  </p>
               </div>
            </div>
            
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={optIn} 
                onChange={(e) => setOptIn(e.target.checked)} 
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
            </label>
         </div>
       )}

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

