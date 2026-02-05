import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Gamepad2, Layers, Cpu } from 'lucide-react'; 
import api from '../../lib/axios';

const CATEGORIES = [
  { id: 1, name: 'Slots' },
  { id: 2, name: 'Table Games' },
  { id: 3, name: 'Crash' },
  { id: 4, name: 'Mines' },
];

// Blueprints for dynamic fields
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
    { name: 'multiplier_curve', label: 'Multiplier Curve (House Edge Factor)', type: 'number', step: '0.01', defaultValue: 0.97 }
  ],
  plinko_engine: [
    { name: 'rows', label: 'Rows', type: 'number', defaultValue: 8 },
    { name: 'bucket_multipliers', label: 'Buckets (Comma Separated)', type: 'text' }
  ]
};

export default function AddGame() {
  const { register, handleSubmit, reset, watch, formState: { isSubmitting } } = useForm();
  const selectedEngine = watch("engine_type");
// ... inside AddGame component
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

    // 🆕 Payload no longer includes provider_id
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

    // The backend identifies the provider from the 'Authorization' header
    await api.post('/games', payload);
    toast.success('Game submitted successfully!');
    reset();
  } catch (error) {
    toast.error(error.response?.data?.detail || 'Submission failed');
  }
};

  return (
    <div className="max-w-3xl mx-auto pb-10">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
        <Gamepad2 className="text-purple-600" /> Submit New Game
      </h1>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input {...register('game_name', { required: true })} className="border p-2.5 rounded-lg" placeholder="Game Name" />
            <input {...register('game_code', { required: true })} className="border p-2.5 rounded-lg" placeholder="Game Code" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select {...register('category_id', { required: true })} className="border p-2.5 rounded-lg bg-white">
              <option value="">Select Category...</option>
              {CATEGORIES.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>

            <select {...register('engine_type', { required: true })} className="border p-2.5 rounded-lg bg-purple-50 font-medium">
              <option value="">Select Game Engine...</option>
              <option value="dice_engine">Dice Engine</option>
              <option value="slot_engine">Slot Engine</option>
              <option value="crash_engine">Crash Engine</option>
              <option value="mines_engine">Mines Engine</option>
              <option value="plinko_engine">Plinko Engine</option>
            </select>
          </div>

          {/* DYNAMIC ENGINE CONFIG FIELDS */}
          {selectedEngine && (
            <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-purple-500 grid grid-cols-2 gap-4">
              <h3 className="col-span-2 text-sm font-bold text-purple-700 uppercase">Engine Config: {selectedEngine}</h3>
              {ENGINE_CONFIGS[selectedEngine].map(field => (
                <div key={field.name}>
                  <label className="block text-xs font-medium text-gray-500 mb-1">{field.label}</label>
                  <input 
                    type={field.type} 
                    step={field.step} 
                    defaultValue={field.defaultValue}
                    {...register(field.name, { required: true })} 
                    className="w-full border p-2 rounded bg-white text-sm" 
                  />
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <input type="number" step="0.1" {...register('rtp_percentage')} className="border p-2.5 rounded-lg" placeholder="RTP %" />
            <input type="number" step="0.01" {...register('min_bet')} className="border p-2.5 rounded-lg" placeholder="Min Bet" />
            <input type="number" step="0.01" {...register('max_bet')} className="border p-2.5 rounded-lg" placeholder="Max Bet" />
          </div>

          <button disabled={isSubmitting} className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 disabled:opacity-50">
            {isSubmitting ? 'Submitting...' : 'Submit for Approval'}
          </button>
        </form>
      </div>
    </div>
  );
}