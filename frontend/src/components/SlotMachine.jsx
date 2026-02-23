import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { RotateCw } from 'lucide-react';
import api from '../lib/axios';
import { useAuth } from '../context/AuthContext';

export default function SlotMachine({ gameId, optIn, tenantId }) {
  const { balance, updateBalance } = useAuth();
  const [reels, setReels] = useState(["7", "7", "7"]); // Initial display
  const [isSpinning, setIsSpinning] = useState(false);
  const [betAmount, setBetAmount] = useState(1);
  const [lastWin, setLastWin] = useState(0);

  const handleSpin = async () => {
    if (isSpinning || balance < betAmount) return;
    setIsSpinning(true);
    setLastWin(0);

    try {
      const res = await api.post('/gameplay/play', {
        game_id: gameId,
        tenant_id: tenantId, 
        bet_amount: betAmount,
        opt_in: optIn 

      });

const { game_data, win_amount, balance: newBalance } = res.data;
const spin = game_data.spin; 
      // Reel timing logic
      setTimeout(() => {
        setReels(spin);
        setIsSpinning(false);
        updateBalance(newBalance);

        if (win > 0) {
          setLastWin(win);
          confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#fbbf24', '#f59e0b', '#ffffff'] });
        }
      }, 1000);

    } catch (err) {
      setIsSpinning(false);
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-stretch">
      
      {/* LEFT: REEL AREA */}
      <div className="flex-1 bg-slate-900/50 rounded-3xl border border-slate-800 p-12 flex flex-col items-center justify-center relative min-h-[500px] overflow-hidden">
        {/* Decorative background line */}
        <div className="absolute w-full h-[2px] bg-indigo-500/30 top-1/2 -translate-y-1/2 z-0" />
        
        <div className="flex gap-4 z-10">
          {reels.map((symbol, i) => (
            <Reel key={i} symbol={symbol} spinning={isSpinning} delay={i * 0.1} />
          ))}
        </div>

        {/* Win Notification Overlay */}
        <AnimatePresence>
          {lastWin > 0 && !isSpinning && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="absolute bottom-10 bg-yellow-500 text-black px-8 py-2 rounded-full font-black text-xl shadow-[0_0_30px_rgba(234,179,8,0.4)]"
            >
              WIN ${lastWin.toFixed(2)}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* RIGHT: CONTROL SIDEBAR */}
      <div className="w-full lg:w-80 flex flex-col gap-4">
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 flex flex-col gap-6">
          
          {/* Bet Input */}
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

          {/* Spin Button */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleSpin}
            disabled={isSpinning || balance < betAmount}
            className={`w-full py-4 rounded-xl font-black text-lg shadow-lg transition-all
              ${isSpinning || balance < betAmount 
                ? 'bg-slate-800 text-slate-600 cursor-not-allowed' 
                : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-500/20'}`}
          >
            {isSpinning ? <RotateCw className="animate-spin mx-auto" size={24} /> : 'BET'}
          </motion.button>
        </div>
      </div>
    </div>
  );
}

function Reel({ symbol, spinning, delay }) {
  // Mapping symbols to actual images or stylized emoji
  const getSymbolDisplay = (s) => {
    if (s === "7") return "🎰";
    if (s === "A") return "💎";
    if (s === "B") return "🍋";
    if (s === "C") return "🍒";
    return s;
  };

  return (
    <div className="w-24 h-36 md:w-32 md:h-48 bg-slate-950 rounded-2xl border-2 border-slate-800 flex items-center justify-center text-5xl md:text-6xl overflow-hidden relative shadow-inner">
      <AnimatePresence mode="wait">
        {spinning ? (
          <motion.div
            key="spinning"
            initial={{ y: 0 }}
            animate={{ y: [0, -200] }}
            transition={{ repeat: Infinity, duration: 0.1, delay: delay }}
            className="flex flex-col gap-8 opacity-20 blur-sm"
          >
            <div>🎰</div><div>💎</div><div>🍋</div><div>🍒</div>
          </motion.div>
        ) : (
          <motion.div
            key="static"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            {getSymbolDisplay(symbol)}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}



