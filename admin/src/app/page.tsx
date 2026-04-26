import Sidebar from '@/components/Sidebar';
import { Shield, Server, RefreshCcw, Activity } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div className="flex min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-blue-500/30">
      <Sidebar />
      
      <main className="flex-1 p-8 lg:p-12 overflow-auto custom-scrollbar">
        {/* Animated Background Glows */}
        <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] -z-10 rounded-full animate-pulse"></div>
        <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/10 blur-[100px] -z-10 rounded-full animate-pulse delay-700"></div>

        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-black mb-2 tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Infrastructure Command Center
            </h1>
            <p className="text-slate-400 font-medium">Real-time surveillance & automated failover protocols active.</p>
          </div>
          
          <div className="flex gap-4">
            <div className="px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-ping"></div>
              <span className="text-xs font-bold text-green-400 uppercase tracking-widest">System Optimal</span>
            </div>
          </div>
        </header>
        
        {/* High-Impact Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Network Throughput', value: '4.2 GB/s', icon: Activity, color: 'text-blue-400', bg: 'bg-blue-400/10' },
            { label: 'Active Droplets', value: '142', icon: Server, color: 'text-purple-400', bg: 'bg-purple-400/10' },
            { label: 'Auto-Recoveries', value: '12', icon: RefreshCcw, color: 'text-orange-400', bg: 'bg-orange-400/10' },
            { label: 'Security Score', value: '99.8%', icon: Shield, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
          ].map((stat) => (
            <div key={stat.label} className="group relative overflow-hidden bg-slate-900/40 backdrop-blur-xl p-6 rounded-[2rem] border border-white/5 hover:border-blue-500/30 transition-all duration-500">
              <div className="flex justify-between items-start mb-4">
                <div className={`${stat.bg} ${stat.color} p-3 rounded-2xl`}>
                  <stat.icon size={20} />
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Live Monitor</span>
              </div>
              <p className="text-slate-400 text-sm font-medium mb-1">{stat.label}</p>
              <h3 className="text-3xl font-black mb-1 tracking-tight">{stat.value}</h3>
              <div className="h-1 w-full bg-slate-800 rounded-full mt-4 overflow-hidden">
                <div className={`h-full ${stat.bg.replace('/10', '')} w-2/3 group-hover:w-full transition-all duration-1000`}></div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Advanced Monitoring Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recovery Log */}
          <div className="lg:col-span-2 bg-slate-900/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold flex items-center gap-3">
                <RefreshCcw className="text-orange-400" size={24} />
                Automated Recovery Logs
              </h2>
              <button className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-widest">Export History</button>
            </div>
            
            <div className="space-y-4">
              {[
                { vps: 'vps-srv-88', status: 'Success', action: 'Snapshot Restore', time: '12 mins ago', color: 'bg-green-500' },
                { vps: 'vps-srv-42', status: 'In Progress', action: 'Account Migration', time: 'Just now', color: 'bg-blue-500' },
                { vps: 'vps-srv-12', status: 'Failed', action: 'Health Check', time: '1 hour ago', color: 'bg-red-500' },
                { vps: 'vps-srv-09', status: 'Success', action: 'Daily Snapshot', time: '2 hours ago', color: 'bg-green-500' },
              ].map((log, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${log.color}/10 ${log.color.replace('bg-', 'text-')}`}>
                      <Server size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{log.vps}</p>
                      <p className="text-xs text-slate-500">{log.action}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 justify-end mb-1">
                      <div className={`w-1.5 h-1.5 rounded-full ${log.color}`}></div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{log.status}</span>
                    </div>
                    <p className="text-[10px] text-slate-600 font-bold">{log.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Infrastructure Health */}
          <div className="bg-slate-900/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5">
             <h2 className="text-xl font-bold mb-8 flex items-center gap-3">
              <Shield className="text-blue-400" size={24} />
              Account Security
            </h2>
            <div className="space-y-8">
              {[
                { name: 'Primary DO Key', health: 98, status: 'Active' },
                { name: 'Secondary Failover', health: 100, status: 'Standby' },
                { name: 'Asia Region Gateway', health: 12, status: 'Restricted' },
              ].map((acc) => (
                <div key={acc.name}>
                  <div className="flex justify-between items-end mb-3">
                    <div>
                      <p className="text-sm font-bold text-white">{acc.name}</p>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{acc.status}</p>
                    </div>
                    <span className={`text-xs font-black ${acc.health < 20 ? 'text-red-400' : 'text-blue-400'}`}>{acc.health}% Integrity</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${acc.health < 20 ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]'}`} 
                      style={{ width: `${acc.health}%` }}
                    ></div>
                  </div>
                </div>
              ))}
              
              <button className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-[0.2em] text-[10px] transition-all shadow-xl shadow-blue-600/20 active:scale-[0.98]">
                Add DigitalOcean Key
              </button>
            </div>
          </div>
        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #334155; }
      `}</style>
    </div>
  );
}
