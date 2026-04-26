'use client';

import Sidebar from '@/components/Sidebar';
import { RefreshCcw, Database, ShieldCheck, History, Clock } from 'lucide-react';

export default function RecoveryPage() {
  return (
    <div className="flex min-h-screen bg-[#020617] text-slate-100 font-sans">
      <Sidebar />
      
      <main className="flex-1 p-8 lg:p-12 overflow-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-black mb-2 tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Auto-Recovery Center
            </h1>
            <p className="text-slate-400 font-medium">Monitoring failover events and automated snapshot restorations.</p>
          </div>
          
          <div className="flex gap-4">
            <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 font-bold text-xs uppercase tracking-widest transition-all">
              <History size={16} />
              Retention Policy
            </button>
          </div>
        </header>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-3 mb-6">
              <Clock className="text-blue-400" size={24} />
              Recent Recovery Actions
            </h2>
            
            {[
              { id: 'REC-9921', vps: 'vps-us-east-01', action: 'Snapshot Restore', status: 'Completed', time: '12 mins ago', details: 'Droplet recreated from snapshot snap-88219' },
              { id: 'REC-9920', vps: 'vps-eu-west-04', action: 'Account Migration', status: 'Processing', time: 'Just now', details: 'Moving from Account #4 to Account #1 due to latency' },
              { id: 'REC-9919', vps: 'vps-ap-south-12', action: 'Heartbeat Failure', status: 'Investigating', time: '45 mins ago', details: 'Unreachable. Verifying DO API status' },
              { id: 'REC-9918', vps: 'vps-ca-cent-08', action: 'Daily Backup', status: 'Success', time: '2 hours ago', details: 'Automated 6-hour snapshot completed' },
            ].map((item) => (
              <div key={item.id} className="bg-slate-900/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5 hover:border-blue-500/30 transition-all duration-500 relative group">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                      <RefreshCcw size={24} className={item.status === 'Processing' ? 'animate-spin' : ''} />
                    </div>
                    <div>
                      <h4 className="text-lg font-black">{item.vps}</h4>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{item.action}</p>
                    </div>
                  </div>
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    item.status === 'Completed' || item.status === 'Success' ? 'bg-green-500/10 text-green-400' :
                    item.status === 'Processing' ? 'bg-blue-500/10 text-blue-400' : 'bg-orange-500/10 text-orange-400'
                  }`}>
                    {item.status}
                  </span>
                </div>
                <p className="text-sm text-slate-400 mb-4">{item.details}</p>
                <div className="text-[10px] text-slate-600 font-bold">{item.time} • Transaction ID: {item.id}</div>
              </div>
            ))}
          </div>

          <div className="space-y-8">
            <div className="bg-slate-900/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-3">
                <Database className="text-purple-400" size={20} />
                Snapshot Health
              </h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-2 uppercase tracking-widest">
                    <span>Active Snapshots</span>
                    <span className="text-purple-400">1,242</span>
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 w-4/5"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold mb-2 uppercase tracking-widest">
                    <span>Total Storage</span>
                    <span className="text-blue-400">8.4 TB</span>
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-3/5"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-xl p-8 rounded-[2.5rem] border border-blue-500/20 relative overflow-hidden">
               <ShieldCheck className="absolute -right-8 -bottom-8 text-blue-500/10" size={160} />
               <h3 className="text-lg font-bold mb-4">Failover Protection</h3>
               <p className="text-sm text-slate-400 mb-6 font-medium leading-relaxed">
                 Your infrastructure is protected by real-time heartbeat monitoring. In the event of a cluster failure, our system auto-migrates workloads to healthy accounts.
               </p>
               <div className="flex items-center gap-2 text-blue-400 text-xs font-black uppercase tracking-widest">
                 <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
                 Shield Active
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
