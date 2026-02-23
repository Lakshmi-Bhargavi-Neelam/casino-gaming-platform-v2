import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti'; 
import api from '../lib/axios'; 
import { useAuth } from '../context/AuthContext';

export default function DiceGame({ gameId, optIn, tenantId }) {
  const { balance, updateBalance } = useAuth();
  const [betAmount, setBetAmount] = useState(10);
  const [choice, setChoice] = useState('EVEN'); 
  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState(null);
  const [lastWin, setLastWin] = useState(0);

  const handleRoll = async () => {
    if (rolling || balance < betAmount) return; 
    
    setRolling(true);
    setResult(null); // Clear previous result so animation feels fresh
    setLastWin(0); // Reset win display for the new roll

    try {
      const res = await api.post('/gameplay/play', {
        game_id: gameId,
        tenant_id: tenantId,
        bet_amount: betAmount,
        player_choice: choice, 
        opt_in: optIn  

      });
      const { game_data, win_amount, balance: newBalance } = res.data;

      setTimeout(() => {
        setResult(game_data); 
setLastWin(win_amount); 
updateBalance(newBalance);
setRolling(false);

        // Celebration Logic
        if (win_amount > 0) {
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#6366f1', '#a855f7', '#ffffff']
          });
        }
      }, 800);

    } catch (err) { 
      setRolling(false); 
      console.error("Roll failed", err);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Game Visuals */}
      <div className="flex-1 bg-slate-900 rounded-3xl border border-slate-800 p-20 flex flex-col items-center justify-center min-h-[400px]">
        {/* DICE ANIMATION */}
        <motion.div 
          animate={rolling ? { 
            rotate: [0, 90, 180, 270, 360],
            scale: [1, 1.2, 1],
            y: [0, -20, 0]
          } : { rotate: 0 }} 
          transition={rolling ? { repeat: Infinity, duration: 0.4, ease: "linear" } : { duration: 0.2 }}
          className="text-9xl mb-8 filter drop-shadow-[0_0_20px_rgba(99,102,241,0.3)]"
        >
          🎲
        </motion.div>
        {/* RESULT & FEEDBACK MESSAGES */}
        <AnimatePresence mode="wait">
          {!rolling && result && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="text-center space-y-2"
            >
              <p className="text-5xl font-black text-white">Result: {result.roll}</p>
              
              {lastWin > 0 ? (
                <div className="space-y-1">
                  <p className="text-green-400 font-black text-2xl animate-bounce">YOU WON ${lastWin}!</p>
                  <p className="text-slate-400 text-sm italic">Amazing roll, keep it going!</p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-red-500 font-bold text-xl uppercase tracking-widest">Better luck next time!</p>
                  <p className="text-slate-500 text-sm italic">You'll get it now, try one more time!</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sidebar Controls */}
  

{/* RIGHT: CONTROL SIDEBAR */}
<div className="w-full lg:w-80 flex flex-col gap-4">
  <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 flex flex-col gap-6">
    
    {/* BET AMOUNT INPUT */}
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
        <button 
          onClick={() => setBetAmount(Math.floor(betAmount / 2))} 
          className="bg-slate-800 hover:bg-slate-700 py-1 rounded-lg text-xs font-bold transition text-slate-300"
        >
          1/2
        </button>
        <button 
          onClick={() => setBetAmount(betAmount * 2)} 
          className="bg-slate-800 hover:bg-slate-700 py-1 rounded-lg text-xs font-bold transition text-slate-300"
        >
          x2
        </button>
      </div>
    </div>

    {/*CHOICE SELECTION (EVEN/ODD) */}
    <div className="space-y-2 pt-4 border-t border-slate-800">
      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pick One</label>
      <div className="grid grid-cols-2 gap-2 mt-2">
        {['EVEN', 'ODD'].map(o => (
          <button 
            key={o} 
            onClick={() => setChoice(o)}
            className={`py-3 rounded-xl font-bold transition-all ${
              choice === o 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>

    {/*  ROLL BUTTON */}
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={handleRoll}
      disabled={rolling || balance < betAmount}
      className={`w-full py-4 rounded-xl font-black text-lg shadow-lg transition-all
        ${rolling || balance < betAmount 
          ? 'bg-slate-800 text-slate-600 cursor-not-allowed' 
          : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-500/20'}`}
    >
      {rolling ? 'ROLLING...' : 'ROLL DICE'}
    </motion.button>
  </div>
</div>
    </div>
  );
}