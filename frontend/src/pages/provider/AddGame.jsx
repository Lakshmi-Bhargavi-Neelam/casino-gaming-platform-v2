import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { 
  Gamepad2, 
  Rocket, 
  Cpu, 
  Zap, 
  Coins, 
  BarChart4, 
  Settings2, 
  CheckCircle,
  Code2,
  Layers
} from 'lucide-react'; 
import api from '../../lib/axios';

const CATEGORIES = [
  { id: 1, name: 'Slots', icon: '🎰' },
  { id: 2, name: 'Table Games', icon: '🃏' },
  { id: 3, name: 'Crash', icon: '🚀' },
  { id: 4, name: 'Mines', icon: '💣' },
];

const ENGINE_CONFIGS = {
  dice_engine: [
    { name: 'multiplier', label: 'Multiplier', type: 'number', step: '0.01', defaultValue: 1.98 },
    { name: 'house_edge', label: 'House Edge', type: 'number', step: '0.01', defaultValue: 0.02 }
  ],
  slot_engine: [
    { name: 'reels', label: 'Reels', type: 'number', defaultValue: 3 },
    { name: 'paylines', label: 'Paylines', type: 'number', defaultValue: 5 },
    { name: 'symbol_map', label: 'Symbols (Comma Separated)', type: 'text', placeholder: 'A,B,C,7' }
  ],
  crash_engine: [
    { name: 'max_multiplier', label: 'Max Multiplier', type: 'number', defaultValue: 1000 },
    { name: 'house_edge', label: 'House Edge', type: 'number', step: '0.01', defaultValue: 0.03 }
  ],
  mines_engine: [
    { name: 'grid_size', label: 'Grid Size', type: 'number', defaultValue: 25 },
    { name: 'mine_count', label: 'Mine Count', type: 'number', defaultValue: 3 },
    { name: 'multiplier_curve', label: 'Multiplier Curve', type: 'number', step: '0.01', defaultValue: 0.97 }
  ],
  plinko_engine: [
    { name: 'rows', label: 'Rows', type: 'number', defaultValue: 8 },
    { name: 'bucket_multipliers', label: 'Buckets (Comma Separated)', type: 'text' }
  ]
};

export default function AddGame() {
  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm();
  const selectedEngine = watch("engine_type");

  const onSubmit = async (data) => {
    try {
      const configFields = ENGINE_CONFIGS[data.engine_type] || [];
      const engine_config = {};
      
      configFields.forEach(field => {
        let val = data[field.name];
        if (field.name === 'symbol_map' || field.name === 'bucket_multipliers') {
          val = val.split(',').map(s => s.trim());
        } else if (field.type === 'number') {
          val = parseFloat(val);
        }
        engine_config[field.name] = val;
      });

      const payload = {
        category_id: parseInt(data.category_id),
        game_name: data.game_name,
        game_code: data.game_code,
        rtp_percentage: parseFloat(data.rtp_percentage),
        volatility: data.volatility,
        min_bet: parseFloat(data.min_bet),
        max_bet: parseFloat(data.max_bet),
        engine_type: data.engine_type,
        engine_config: engine_config
      };

      await api.post('/games', payload);
      toast.success('Game Title Published for Review!');
      reset();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Submission failed');
    }
  };

  const inputClasses = `w-full bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-white 
                       placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/40 
                       focus:border-teal-500/40 transition-all duration-300 shadow-inner`;

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-6 duration-700">
      
      {/* 🚀 Header */}
      <header className="mb-10 text-center md:text-left">
        <h1 className="text-4xl font-black text-white tracking-tight flex items-center justify-center md:justify-start gap-4">
          <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 shadow-lg shadow-indigo-500/5">
            <Rocket className="text-indigo-400" size={36} />
          </div>
          Submit New Title
        </h1>
        <p className="text-slate-400 mt-2 text-lg font-medium">
          Deploy your latest game engine to the marketplace for operator approval.
        </p>
      </header>
      
      {/* 🛠 Main Form Card */}
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-[2.5rem] border border-slate-700/50 shadow-2xl overflow-hidden">
        
        {/* Animated Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-teal-500 to-emerald-500"></div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 md:p-12 space-y-10">
          
          {/* Section 1: Basic Identity */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-slate-400 mb-4">
              <Gamepad2 size={18} className="text-teal-500" />
              <span className="text-[11px] font-black uppercase tracking-[0.2em]">Game Identity</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Game Display Name</label>
                <input {...register('game_name', { required: true })} className={inputClasses} placeholder="e.g. Neon Strike" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Unique Game Code</label>
                <div className="relative group">
                    <Code2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-teal-400" size={18} />
                    <input {...register('game_code', { required: true })} className={`${inputClasses} pl-12`} placeholder="NEON_STRIKE_V1" />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Engine Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Marketplace Category</label>
              <select {...register('category_id', { required: true })} className={inputClasses}>
                <option value="" className="bg-slate-900">Select Category...</option>
                {CATEGORIES.map(cat => <option key={cat.id} value={cat.id} className="bg-slate-900">{cat.icon} {cat.name}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Core Logic Engine</label>
              <div className="relative group">
                <Cpu className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-teal-400 transition-colors" size={18} />
                <select {...register('engine_type', { required: true })} className={`${inputClasses} pl-12 bg-indigo-500/5 border-indigo-500/20 text-indigo-300 font-bold`}>
                  <option value="" className="bg-slate-900">Select Engine...</option>
                  <option value="dice_engine" className="bg-slate-900">Dice Logic</option>
                  <option value="slot_engine" className="bg-slate-900">Slot Reels</option>
                  <option value="crash_engine" className="bg-slate-900">Crash Multiplier</option>
                  <option value="mines_engine" className="bg-slate-900">Mines Grid</option>
                  <option value="plinko_engine" className="bg-slate-900">Plinko Board</option>
                </select>
              </div>
            </div>
          </div>

          {/* ⚡ DYNAMIC ENGINE CONFIG SECTION */}
          {selectedEngine && (
            <div className="p-8 bg-indigo-500/5 rounded-3xl border border-indigo-500/20 space-y-6 animate-in slide-in-from-top-4 duration-300 shadow-inner">
              <div className="flex items-center justify-between border-b border-indigo-500/10 pb-4">
                <h3 className="text-sm font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                    <Settings2 size={18} /> Engine Parameters: {selectedEngine.replace('_', ' ')}
                </h3>
                <span className="text-[10px] text-indigo-500/60 font-mono font-bold">MODE: CONFIG_INJECTION</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {ENGINE_CONFIGS[selectedEngine].map(field => (
                  <div key={field.name} className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{field.label}</label>
                    <input 
                      type={field.type} 
                      step={field.step} 
                      defaultValue={field.defaultValue}
                      placeholder={field.placeholder}
                      {...register(field.name, { required: true })} 
                      className="w-full bg-slate-950/50 border border-slate-800 rounded-xl p-3 text-white text-sm focus:ring-1 focus:ring-indigo-500 outline-none transition-all" 
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 4: Performance Specs */}
          <div className="space-y-6">
             <div className="flex items-center gap-2 text-slate-400">
                <BarChart4 size={18} className="text-teal-500" />
                <span className="text-[11px] font-black uppercase tracking-[0.2em]">Deployment Specifications</span>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1 flex items-center gap-2"><Layers size={14}/> RTP (%)</label>
                  <input type="number" step="0.1" {...register('rtp_percentage')} className={inputClasses} placeholder="96.5" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1 flex items-center gap-2"><Coins size={14}/> Min Bet ($)</label>
                  <input type="number" step="0.01" {...register('min_bet')} className={inputClasses} placeholder="0.10" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1 flex items-center gap-2"><Zap size={14}/> Max Bet ($)</label>
                  <input type="number" step="0.01" {...register('max_bet')} className={inputClasses} placeholder="100.00" />
                </div>
             </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6">
            <button 
                disabled={isSubmitting} 
                className="w-full relative group overflow-hidden bg-gradient-to-r from-teal-500 to-emerald-500 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-teal-500/20 hover:shadow-teal-500/40 hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <div className="relative z-10 flex items-center justify-center gap-3">
                    {isSubmitting ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                            Processing Build...
                        </>
                    ) : (
                        <>
                            <CheckCircle size={20} className="group-hover:scale-125 transition-transform" />
                            Submit to Marketplace
                        </>
                    )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </button>
            <p className="text-center text-slate-600 text-[10px] mt-4 font-bold uppercase tracking-widest">
                Game logic will be audited by the compliance team before listing.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}