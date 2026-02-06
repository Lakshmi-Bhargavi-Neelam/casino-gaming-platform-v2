import React from 'react';
import { 
  Building2, Users, FileCheck, Gamepad2, 
  ArrowUpRight, ArrowDownRight, MoreVertical, 
  ShieldAlert, CheckCircle, Clock, Download 
} from 'lucide-react';

// --- MOCK DATA ---
const STATS = [
  { label: "Total Tenants", value: "42", change: "+12%", trend: "up", icon: Building2, color: "from-blue-500 to-indigo-600", text: "text-blue-400" },
  { label: "Active Players", value: "15.2k", change: "+8.1%", trend: "up", icon: Users, color: "from-emerald-500 to-teal-600", text: "text-emerald-400" },
  { label: "Pending KYC", value: "7", change: "-2", trend: "down", icon: FileCheck, color: "from-orange-500 to-red-600", text: "text-orange-400" },
  { label: "Total Games", value: "1,204", change: "+24", trend: "up", icon: Gamepad2, color: "from-purple-500 to-pink-600", text: "text-purple-400" },
];

const RECENT_KYC = [
  { id: 1, entity: "BetKing India", type: "Tenant", date: "2 mins ago", status: "Pending" },
  { id: 2, entity: "Evolution Gaming", type: "Provider", date: "1 hour ago", status: "Verified" },
  { id: 3, entity: "Royal Casino", type: "Tenant", date: "3 hours ago", status: "Rejected" },
  { id: 4, entity: "Pragmatic Play", type: "Provider", date: "1 day ago", status: "Pending" },
  { id: 5, entity: "Stake Clone", type: "Tenant", date: "2 days ago", status: "Verified" },
];

export default function SuperAdminHome() {
  return (
    <div className="space-y-8 animate-fade-in pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Super Admin Overview</h1>
          <p className="text-gray-400 mt-1 text-sm">Real-time platform performance metrics.</p>
        </div>
        <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40">
          <Download size={18} /> Download Report
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS.map((stat, idx) => (
          <div key={idx} className="bg-[#131b2c]/80 backdrop-blur-sm p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-all group relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-10 rounded-bl-full group-hover:opacity-20 transition-opacity`}></div>
            
            <div className="flex justify-between items-start relative z-10">
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{stat.label}</p>
                <h3 className="text-3xl font-bold text-white mt-2">{stat.value}</h3>
              </div>
              <div className={`p-3 rounded-xl bg-white/5 border border-white/10 ${stat.text}`}>
                <stat.icon size={24} />
              </div>
            </div>
            
            <div className="mt-4 flex items-center text-xs font-medium relative z-10">
              <span className={`flex items-center ${stat.trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
                {stat.trend === 'up' ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
                {stat.change}
              </span>
              <span className="text-gray-500 ml-2">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Trend Chart (Visual) */}
        <div className="lg:col-span-2 bg-[#131b2c]/80 backdrop-blur-sm p-6 rounded-2xl border border-white/5">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-bold text-lg text-white">Tenant Registration Trend</h3>
            <select className="text-xs bg-[#0B0F1A] text-gray-300 border border-white/10 rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          
          {/* Custom CSS Chart for Dark Mode */}
          <div className="h-64 flex items-end justify-between space-x-3 px-2">
            {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
              <div key={i} className="w-full bg-white/5 rounded-t-lg relative group overflow-hidden">
                <div 
                  style={{ height: `${h}%` }} 
                  className="absolute bottom-0 w-full bg-gradient-to-t from-indigo-600 to-purple-500 rounded-t-lg opacity-80 group-hover:opacity-100 transition-all shadow-[0_0_15px_rgba(99,102,241,0.3)]" 
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-xs text-gray-500 font-mono px-2">
            <span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span><span>SUN</span>
          </div>
        </div>

        {/* System Alerts */}
        <div className="bg-[#131b2c]/80 backdrop-blur-sm p-6 rounded-2xl border border-white/5 flex flex-col">
          <h3 className="font-bold text-lg text-white mb-6">System Health</h3>
          <div className="space-y-4 flex-1">
            
            <div className="flex items-start gap-4 p-4 bg-red-500/10 rounded-xl border border-red-500/20">
              <div className="p-2 bg-red-500/20 rounded-lg text-red-400">
                 <ShieldAlert size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-white">High Fraud Risk</p>
                <p className="text-xs text-gray-400 mt-1">Unusual IP activity detected on Tenant #42.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
               <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                 <Clock size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Scheduled Maintenance</p>
                <p className="text-xs text-gray-400 mt-1">Database migration set for 03:00 AM.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
               <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
                 <CheckCircle size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-white">System Healthy</p>
                <p className="text-xs text-gray-400 mt-1">All services running at 99.9% uptime.</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Bottom Table */}
      <div className="bg-[#131b2c]/80 backdrop-blur-sm rounded-2xl border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h3 className="font-bold text-lg text-white">Recent KYC Requests</h3>
          <button className="text-emerald-400 text-sm font-bold hover:text-emerald-300 transition-colors">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-white/5 text-gray-300 uppercase text-xs font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Entity Name</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Submitted</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {RECENT_KYC.map((item) => (
                <tr key={item.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-bold text-white">{item.entity}</td>
                  <td className="px-6 py-4">{item.type}</td>
                  <td className="px-6 py-4">{item.date}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${
                        item.status === 'Verified' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                        item.status === 'Rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                        'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}