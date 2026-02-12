import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Bomb, Gem, Coins, Trophy, RefreshCcw } from 'lucide-react';
import api from '../lib/axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

export default function MinesGame({ gameId, optIn, tenantId }) {
  const { balance, updateBalance } = useAuth();
  
  // Game Configuration
  const [betAmount, setBetAmount] = useState(10);
  const [mineCount, setMineCount] = useState(3);
  
  // Game State
  const [grid, setGrid] = useState(Array(25).fill(null)); // null, 'gem', 'mine'
  const [isGameActive, setIsGameActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successfulPicks, setSuccessfulPicks] = useState(0);
  const [lastWin, setLastWin] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  // Audio/Visual feedback logic
  const handleTileClick = (index) => {
    if (!isGameActive || grid[index] !== null || gameOver) return;

    // Frontend "Probability" Logic 
    // (Actual win is verified by backend upon cashout)
    const isMine = Math.random() < (mineCount / (25 - successfulPicks));
    
    const newGrid = [...grid];
    if (isMine) {
      newGrid[index] = 'mine';
      setGrid(newGrid);
      handleLoss();
    } else {
      newGrid[index] = 'gem';
      setGrid(newGrid);
      setSuccessfulPicks(prev => prev + 1);
    }
  };

const handleStartGame = () => {
    if (balance < betAmount) return toast.error("Insufficient balance");
    
    // 🎯 FIX: Visually deduct money immediately (Optimistic Update)
    // This makes the UI feel responsive, even though the API call happens later
    updateBalance(balance - betAmount);

    setGrid(Array(25).fill(null));
    setSuccessfulPicks(0);
    setLastWin(0);
    setGameOver(false);
    setIsGameActive(true);
  };

 const handleLoss = async () => {
    setGameOver(true);
    setIsGameActive(false);
    toast.error("BOOM! You hit a mine.");

    try {
      // 🎯 Call API to process the LOSS (Debit money, Credit 0)
      const res = await api.post('/gameplay/play', {
        game_id: gameId,
        tenant_id: tenantId,
        bet_amount: betAmount,
        successful_picks: 0, // 0 picks means you lost
        opt_in: optIn
      });

      // Update balance to reflect the lost bet
      updateBalance(res.data.balance); 
      
    } catch (err) {
      console.error(err);
    }
  };
  const handleCashout = async () => {
    if (successfulPicks === 0) return;
    setLoading(true);

    try {
      const res = await api.post('/gameplay/play', {
        game_id: gameId,
        tenant_id: tenantId, // 👈 Required by backend now
        bet_amount: betAmount,
        successful_picks: successfulPicks, // 🎯 Backend uses this for payout
        opt_in: optIn // <--- THIS IS THE KEY

      });

      const { win_amount, balance: newBalance } = res.data;

      setLastWin(win_amount);
      updateBalance(newBalance);
      setIsGameActive(false);
      setGameOver(true);

      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#10b981', '#ffffff']
      });
      
    } catch (err) {
      console.error(err);
      toast.error("Cashout failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-stretch">
      
      {/* LEFT: MINES GRID AREA */}
      <div className="flex-1 bg-slate-900 rounded-3xl border border-slate-800 p-8 flex flex-col items-center justify-center relative min-h-[550px]">
        
        <div className="grid grid-cols-5 gap-3 w-full max-w-md">
          {grid.map((state, i) => (
            <Tile 
              key={i} 
              state={state} 
              onClick={() => handleTileClick(i)} 
              disabled={!isGameActive || gameOver}
            />
          ))}
        </div>

        {/* Win Notification */}
        <AnimatePresence>
          {lastWin > 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex items-center justify-center bg-slate-950/80 rounded-3xl z-20 backdrop-blur-sm"
            >
              <div className="text-center space-y-4">
                <Trophy size={64} className="text-yellow-500 mx-auto" />
                <h2 className="text-4xl font-black text-white uppercase italic">Winner!</h2>
                <p className="text-5xl font-black text-emerald-400">+${lastWin.toFixed(2)}</p>
                <button 
                  onClick={handleStartGame}
                  className="bg-indigo-600 px-8 py-3 rounded-xl font-bold hover:bg-indigo-500 transition"
                >
                  PLAY AGAIN
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* RIGHT: CONTROL SIDEBAR */}
      <div className="w-full lg:w-80 flex flex-col gap-4">
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 flex flex-col gap-6">
          
          {/* Bet Amount */}
         <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Bet Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(Math.max(0, Number(e.target.value)))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-8 pr-4 font-mono font-bold text-white focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
            {/* Quick Bet Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setBetAmount(betAmount / 2)} className="bg-slate-800 hover:bg-slate-700 py-1 rounded-lg text-xs font-bold transition">1/2</button>
              <button onClick={() => setBetAmount(betAmount * 2)} className="bg-slate-800 hover:bg-slate-700 py-1 rounded-lg text-xs font-bold transition">x2</button>
            </div>
          </div>

          {/* Game Stats */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
              <span className="text-slate-500">RTP</span>
              <span className="text-indigo-400">98%</span>
            </div>
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
              <span className="text-slate-500">Engine</span>
              <span className="text-slate-300">Slot Engine</span>
            </div>
          </div>

          {/* Mine Selection */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Mines</label>
            <select 
              value={mineCount}
              onChange={(e) => setMineCount(Number(e.target.value))}
              disabled={isGameActive}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 font-bold text-white outline-none focus:border-indigo-500 appearance-none cursor-pointer"
            >
              {[1, 3, 5, 10, 24].map(n => (
                <option key={n} value={n}>{n} Mines</option>
              ))}
            </select>
          </div>

          {/* Current Game Stats */}
          {isGameActive && (
            <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl space-y-2">
              <div className="flex justify-between text-xs font-bold uppercase tracking-tight">
                <span className="text-indigo-300">Gems Found</span>
                <span className="text-white">{successfulPicks}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {!isGameActive ? (
            <button
              onClick={handleStartGame}
              className="w-full py-4 rounded-xl font-black text-lg bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20 transition-all"
            >
              BET
            </button>
          ) : (
            <button
              onClick={handleCashout}
              disabled={successfulPicks === 0 || loading}
              className={`w-full py-4 rounded-xl font-black text-lg shadow-lg transition-all flex items-center justify-center gap-2
                ${successfulPicks === 0 || loading ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-500/20'}`}
            >
              {loading ? <RefreshCcw className="animate-spin" /> : 'CASH OUT'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Tile({ state, onClick, disabled }) {
  return (
    <motion.button
      whileHover={!disabled && !state ? { scale: 1.05, backgroundColor: '#1e293b' } : {}}
      whileTap={!disabled && !state ? { scale: 0.95 } : {}}
      onClick={onClick}
      disabled={disabled}
      className={`aspect-square rounded-xl border-2 flex items-center justify-center text-3xl transition-all duration-300
        ${state === 'gem' ? 'bg-emerald-500/20 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 
          state === 'mine' ? 'bg-red-500/20 border-red-500' : 
          'bg-slate-950 border-slate-800'}`}
    >
      <AnimatePresence mode="wait">
        {state === 'gem' && (
          <motion.div initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }}>
            <Gem className="text-emerald-400 fill-emerald-400/20" size={28} />
          </motion.div>
        )}
        {state === 'mine' && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1.2 }}>
            <Bomb className="text-red-500" size={28} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}