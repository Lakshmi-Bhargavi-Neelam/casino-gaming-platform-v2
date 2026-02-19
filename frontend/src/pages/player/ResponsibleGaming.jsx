import React, { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { useAuth } from "../../context/AuthContext";
import {
  Shield, AlertTriangle, Clock, DollarSign, TrendingDown,
  Timer, Loader2, CheckCircle, XCircle, Info, Ban
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const LIMIT_TYPES = [
  {
    type: 'DEPOSIT',
    label: 'Deposit Limit',
    description: 'Maximum amount you can deposit per day',
    icon: DollarSign,
    color: 'teal',
    unit: '$',
    inputType: 'number'
  },
  {
    type: 'LOSS',
    label: 'Loss Limit',
    description: 'Maximum amount you can lose per day',
    icon: TrendingDown,
    color: 'red',
    unit: '$',
    inputType: 'number'
  },
  {
    type: 'SESSION',
    label: 'Session Limit',
    description: 'Maximum time per gaming session (max 3 hours)',
    icon: Timer,
    color: 'amber',
    unit: 'min',
    inputType: 'number',
    maxValue: 180
  },
  {
    type: 'WAGER',
    label: 'Wager Limit',
    description: 'Maximum total bets per day',
    icon: Ban,
    color: 'purple',
    unit: '$',
    inputType: 'number'
  }
];

export default function ResponsibleGaming() {
  const { activeTenantId } = useAuth();
  const [limits, setLimits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingType, setSavingType] = useState(null);
  const [formData, setFormData] = useState({
    DEPOSIT: '',
    LOSS: '',
    SESSION: '',
    WAGER: ''
  });

  useEffect(() => {
    if (activeTenantId) {
      fetchLimits();
    }
  }, [activeTenantId]);

  const fetchLimits = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/player/limits/?tenant_id=${activeTenantId}`);
      setLimits(res.data);

      // Pre-fill form with current values
      const currentValues = { DEPOSIT: '', LOSS: '', SESSION: '', WAGER: '' };
      res.data.forEach(limit => {
        if (limit.status === 'ACTIVE') {
          currentValues[limit.limit_type] = limit.limit_value;
        }
      });
      setFormData(currentValues);
    } catch (err) {
      console.error('Failed to fetch limits:', err);
      toast.error('Failed to load limits');
    } finally {
      setLoading(false);
    }
  };

  const handleSetLimit = async (limitType) => {
    const value = parseFloat(formData[limitType]);

    if (!value || value <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    // Check session max
    const limitConfig = LIMIT_TYPES.find(l => l.type === limitType);
    if (limitConfig.maxValue && value > limitConfig.maxValue) {
      toast.error(`${limitConfig.label} cannot exceed ${limitConfig.maxValue} ${limitConfig.unit}`);
      return;
    }

    setSavingType(limitType);
    try {
      await api.post(`/player/limits/?tenant_id=${activeTenantId}`, {
        limit_type: limitType,
        limit_value: value,
        period: 'DAILY'
      });

      toast.success('Limit updated successfully');
      fetchLimits();
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        toast.error(detail);
      } else {
        toast.error('Failed to update limit');
      }
    } finally {
      setSavingType(null);
    }
  };

  const handleCancelPending = async (limitId) => {
    try {
      await api.delete(`/player/limits/${limitId}/pending?tenant_id=${activeTenantId}`);
      toast.success('Pending increase cancelled');
      fetchLimits();
    } catch (err) {
      toast.error('Failed to cancel pending limit');
    }
  };

  const getActiveLimit = (type) => {
    return limits.find(l => l.limit_type === type && l.status === 'ACTIVE');
  };

  const getPendingLimit = (type) => {
    return limits.find(l => l.limit_type === type && l.status === 'PENDING_INCREASE');
  };

  const formatTimeRemaining = (seconds) => {
    if (!seconds || seconds <= 0) return 'Now';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">

      {/* Header Card */}
      <div className="relative group overflow-hidden bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[100px] -z-10 group-hover:bg-amber-500/20 transition-all duration-700" />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-500 font-black text-[10px] uppercase tracking-[0.3em]">
              <Shield size={14} className="text-amber-500" /> Responsible Gaming
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight">
              Your Gaming Limits
            </h1>
            <p className="text-slate-400 text-sm max-w-md">
              Set personal limits to manage your gaming. Reductions apply immediately, increases require a 24-hour cooling period.
            </p>
          </div>

          <div className="w-20 h-20 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-3xl flex items-center justify-center border border-amber-500/30 shadow-2xl">
            <Shield size={40} className="text-amber-400" />
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 flex items-start gap-4">
        <Info className="text-amber-400 flex-shrink-0 mt-0.5" size={20} />
        <div className="space-y-1">
          <p className="text-amber-200 font-bold text-sm">
            Responsible Gaming Compliance
          </p>
          <p className="text-amber-100/70 text-xs">
            These limits help you stay in control. Lowering limits takes effect immediately.
            Increasing limits requires a 24-hour waiting period as per responsible gaming regulations.
          </p>
        </div>
      </div>

      {/* Limits Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {LIMIT_TYPES.map((limitConfig) => {
          const Icon = limitConfig.icon;
          const activeLimit = getActiveLimit(limitConfig.type);
          const pendingLimit = getPendingLimit(limitConfig.type);
          const colorClasses = getColorClasses(limitConfig.color);

          return (
            <div
              key={limitConfig.type}
              className={`bg-slate-900/60 border ${colorClasses.border} rounded-[2rem] p-8 space-y-6 shadow-xl transition-all hover:shadow-2xl`}
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 ${colorClasses.bgLight} rounded-2xl`}>
                    <Icon size={24} className={colorClasses.text} />
                  </div>
                  <div>
                    <h3 className="font-black text-white text-lg">{limitConfig.label}</h3>
                    <p className="text-slate-500 text-xs font-medium">{limitConfig.description}</p>
                  </div>
                </div>
              </div>

              {/* Current Status */}
              {activeLimit && (
                <div className={`${colorClasses.bgLight} border ${colorClasses.borderLight} rounded-xl p-4 space-y-3`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Current Limit
                    </span>
                    <span className={`${colorClasses.text} font-black text-xl`}>
                      {limitConfig.unit === '$' ? '$' : ''}{activeLimit.limit_value}
                      {limitConfig.unit !== '$' ? ` ${limitConfig.unit}` : ''}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Used Today</span>
                    <span className="text-slate-300 font-bold">
                      {limitConfig.unit === '$' ? '$' : ''}{activeLimit.current_usage || 0}
                      {limitConfig.unit !== '$' ? ` ${limitConfig.unit}` : ''}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${colorClasses.bgSolid} transition-all duration-500`}
                      style={{
                        width: `${Math.min(100, ((activeLimit.current_usage || 0) / activeLimit.limit_value) * 100)}%`
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Remaining</span>
                    <span className={`font-bold ${activeLimit.remaining > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {limitConfig.unit === '$' ? '$' : ''}{activeLimit.remaining || 0}
                      {limitConfig.unit !== '$' ? ` ${limitConfig.unit}` : ''}
                    </span>
                  </div>
                </div>
              )}

              {/* Pending Increase Notice */}
              {pendingLimit && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-amber-400">
                    <Clock size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Pending Increase
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 text-sm">
                      New limit: <strong>{limitConfig.unit === '$' ? '$' : ''}{pendingLimit.limit_value}{limitConfig.unit !== '$' ? ` ${limitConfig.unit}` : ''}</strong>
                    </span>
                    <span className="text-amber-300 text-xs font-bold">
                      Activates in {formatTimeRemaining(pendingLimit.pending_increases_in)}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCancelPending(pendingLimit.limit_id)}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg transition-all"
                  >
                    Cancel Pending Increase
                  </button>
                </div>
              )}

              {/* Input Form */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Set New {limitConfig.label}
                </label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    {limitConfig.unit === '$' && (
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                    )}
                    <input
                      type="number"
                      value={formData[limitConfig.type]}
                      onChange={(e) => setFormData({ ...formData, [limitConfig.type]: e.target.value })}
                      placeholder={limitConfig.maxValue ? `Max ${limitConfig.maxValue}` : '0.00'}
                      max={limitConfig.maxValue || undefined}
                      className={`w-full bg-slate-950 border border-slate-800 rounded-xl py-3 ${limitConfig.unit === '$' ? 'pl-8' : 'pl-4'} pr-4 font-mono font-bold text-white focus:outline-none focus:border-teal-500/50 transition-all`}
                    />
                    {limitConfig.unit !== '$' && (
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold">
                        {limitConfig.unit}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleSetLimit(limitConfig.type)}
                    disabled={savingType === limitConfig.type}
                    className={`px-6 py-3 ${colorClasses.bgSolid} text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-lg transition-all hover:opacity-90 disabled:opacity-50 flex items-center gap-2`}
                  >
                    {savingType === limitConfig.type ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <>
                        <CheckCircle size={18} />
                        Set
                      </>
                    )}
                  </button>
                </div>

                {activeLimit && parseFloat(formData[limitConfig.type]) > activeLimit.limit_value && (
                  <div className="flex items-center gap-2 text-amber-400 text-xs">
                    <AlertTriangle size={14} />
                    <span>Increasing limit requires 24-hour cooling period</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Warning Section */}
      <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 space-y-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="text-red-400" size={24} />
          <h3 className="font-black text-red-400 text-lg">Need Help?</h3>
        </div>
        <p className="text-slate-300 text-sm leading-relaxed">
          If you feel your gaming is becoming problematic, please reach out to professional help organizations.
          You can also self-exclude from the platform by contacting support.
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href="https://www.begambleaware.org"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-xl text-red-300 text-xs font-bold transition-all"
          >
            BeGambleAware
          </a>
          <a
            href="https://www.gamblersanonymous.org"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-xl text-red-300 text-xs font-bold transition-all"
          >
            Gamblers Anonymous
          </a>
        </div>
      </div>
    </div>
  );
}

// Helper function for color classes
function getColorClasses(color) {
  const colors = {
    teal: {
      text: 'text-teal-400',
      bgLight: 'bg-teal-500/10',
      bgSolid: 'bg-teal-500',
      border: 'border-teal-500/20',
      borderLight: 'border-teal-500/30'
    },
    red: {
      text: 'text-red-400',
      bgLight: 'bg-red-500/10',
      bgSolid: 'bg-red-500',
      border: 'border-red-500/20',
      borderLight: 'border-red-500/30'
    },
    amber: {
      text: 'text-amber-400',
      bgLight: 'bg-amber-500/10',
      bgSolid: 'bg-amber-500',
      border: 'border-amber-500/20',
      borderLight: 'border-amber-500/30'
    },
    purple: {
      text: 'text-purple-400',
      bgLight: 'bg-purple-500/10',
      bgSolid: 'bg-purple-500',
      border: 'border-purple-500/20',
      borderLight: 'border-purple-500/30'
    }
  };
  return colors[color] || colors.teal;
}
