import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { TrendingUp, AlertTriangle, Zap, Timer } from 'lucide-react';
import api from '../lib/axios';
import { useAuth } from '../context/AuthContext';

export default function CrashGame({ gameId, optIn, tenantId }) {
  const { balance, updateBalance } = useAuth();
  
  // Game State
  const [betAmount, setBetAmount] = useState(10);
  const [targetMultiplier, setTargetMultiplier] = useState(2.0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentMultiplier, setCurrentMultiplier] = useState(1.0);
  const [gameState, setGameState] = useState('idle'); 
  const [lastResult, setLastResult] = useState(null);

  const timerRef = useRef(null);

  const handlePlay = async () => {
    if (isPlaying || balance < betAmount) return;

    setIsPlaying(true);
    setGameState('running');
    setLastResult(null);
    setCurrentMultiplier(1.0);

    try {
      const res = await api.post('/gameplay/play', {
        game_id: gameId,
        tenant_id: tenantId, 
        bet_amount: betAmount,
        target_multiplier: targetMultiplier,
        opt_in: optIn 

      });

      const { game_data, win_amount, balance: newBalance } = res.data;
      const crashAt = game_data.crash_at;

      // Animation Logic
      const duration = 2000; 
      const startTime = Date.now();

      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / duration;
        
        // Curve the multiplier growth slightly
        const nextVal = 1 + (crashAt - 1) * Math.pow(progress, 1.5);
        
        if (progress >= 1) {
          clearInterval(timerRef.current);
          finalizeGame(crashAt, win_amount, newBalance);
        } else {
          setCurrentMultiplier(nextVal);
        }
      }, 50);

    } catch (err) {
      setIsPlaying(false);
      setGameState('idle');
      console.error(err);
    }
  };

  const finalizeGame = (crashAt, win, newBalance) => {
    setCurrentMultiplier(crashAt);
    updateBalance(newBalance);
    setIsPlaying(false);

    if (win > 0) {
      setGameState('win');
      setLastResult(win);
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#10b981', '#ffffff']
      });
    } else {
      setGameState('crashed');
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-stretch">
      
      {/* LEFT: CRASH VISUAL AREA */}
      <div className={`flex-1 rounded-3xl border transition-all duration-500 p-12 flex flex-col items-center justify-center relative min-h-[500px] overflow-hidden
        ${gameState === 'crashed' ? 'bg-red-500/5 border-red-500/20' : 
          gameState === 'win' ? 'bg-emerald-500/5 border-emerald-500/20' : 
          'bg-slate-900 border-slate-800'}`}
      >
        {/* Background Grid */}
        <div className="absolute inset-0 opacity-10" 
             style={{ backgroundImage: 'linear-gradient(#4f46e5 1px, transparent 1px), linear-gradient(90deg, #4f46e5 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
        />

        <div className="relative z-10 text-center">
          <motion.div
            key={currentMultiplier}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`text-8xl md:text-9xl font-black italic tracking-tighter mb-2
              ${gameState === 'crashed' ? 'text-red-500' : 
                gameState === 'win' ? 'text-emerald-400' : 'text-white'}`}
          >
            {currentMultiplier.toFixed(2)}<span className="text-4xl ml-2">x</span>
          </motion.div>

          <AnimatePresence mode="wait">
            {gameState === 'crashed' && (
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex items-center gap-2 text-red-500 font-bold uppercase tracking-widest">
                <AlertTriangle size={20} /> Crashed!
              </motion.div>
            )}
            {gameState === 'win' && (
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-emerald-400 font-bold uppercase tracking-widest">
                Cashed out successfully!
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Win Overlay */}
        <AnimatePresence>
          {gameState === 'win' && lastResult > 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
              className="absolute top-10 bg-emerald-500 text-white px-8 py-3 rounded-2xl font-black text-2xl shadow-xl shadow-emerald-500/20"
            >
              +${lastResult.toFixed(2)}
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
                disabled={isPlaying}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-8 pr-4 font-mono font-bold text-white focus:border-indigo-500 outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setBetAmount(betAmount / 2)} className="bg-slate-800 hover:bg-slate-700 py-1.5 rounded-lg text-xs font-bold transition">1/2</button>
              <button onClick={() => setBetAmount(betAmount * 2)} className="bg-slate-800 hover:bg-slate-700 py-1.5 rounded-lg text-xs font-bold transition">x2</button>
            </div>
          </div>

          {/* Auto Cashout (Target Multiplier) */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex justify-between">
              Auto Cashout <span>Target</span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                value={targetMultiplier}
                onChange={(e) => setTargetMultiplier(Math.max(1.01, Number(e.target.value)))}
                disabled={isPlaying}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 font-mono font-bold text-indigo-400 focus:border-indigo-500 outline-none"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">x</span>
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <div className="flex justify-between text-[10px] font-bold uppercase">
              <span className="text-slate-500 flex items-center gap-1"><Zap size={10} /> House Edge</span>
              <span className="text-slate-300">3%</span>
            </div>
            <div className="flex justify-between text-[10px] font-bold uppercase">
              <span className="text-slate-500 flex items-center gap-1"><Timer size={10} /> Max Mult</span>
              <span className="text-slate-300">1000x</span>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handlePlay}
            disabled={isPlaying || balance < betAmount}
            className={`w-full py-4 rounded-xl font-black text-lg shadow-lg transition-all flex items-center justify-center gap-2
              ${isPlaying || balance < betAmount 
                ? 'bg-slate-800 text-slate-600 cursor-not-allowed' 
                : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-500/20'}`}
          >
            {isPlaying ? (
              <TrendingUp className="animate-pulse" size={24} />
            ) : (
              'PLACE BET'
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}