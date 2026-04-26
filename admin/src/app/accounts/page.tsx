'use client';

import Sidebar from '@/components/Sidebar';
import { Key, Plus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AccountsPage() {
  return (
    <div className="flex min-h-screen bg-[#020617] text-slate-100 font-sans">
      <Sidebar />
      
      <main className="flex-1 p-8 lg:p-12 overflow-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-black mb-2 tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              DigitalOcean Access Keys
            </h1>
            <p className="text-slate-400 font-medium">Manage and monitor multiple infrastructure accounts.</p>
          </div>
          
          <button className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-blue-600/20">
            <Plus size={18} />
            Add New Account
          </button>
        </header>

        <div className="grid gap-6">
          {[
            { name: 'Primary Production', key: 'dop_v1_************************', status: 'Active', health: 100, usage: '12/50', lastSync: '2 mins ago' },
            { name: 'Secondary Backup', key: 'dop_v1_************************', status: 'Active', health: 98, usage: '0/10', lastSync: '15 mins ago' },
            { name: 'Asia-Pacific Gateway', key: 'dop_v1_************************', status: 'Suspended', health: 0, usage: '4/20', lastSync: '1 hour ago' },
          ].map((acc) => (
            <div key={acc.name} className="bg-slate-900/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 group hover:border-blue-500/30 transition-all duration-500">
              <div className="flex items-center gap-6 w-full md:w-auto">
                <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center ${acc.status === 'Active' ? 'bg-blue-500/10 text-blue-400' : 'bg-red-500/10 text-red-400'}`}>
                  <Key size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white group-hover:text-blue-400 transition-colors">{acc.name}</h3>
                  <p className="text-xs font-mono text-slate-500 mt-1">{acc.key}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                <div className="text-center md:text-left">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Status</p>
                  <div className="flex items-center gap-2">
                    {acc.status === 'Active' ? <CheckCircle2 size={14} className="text-green-500" /> : <AlertCircle size={14} className="text-red-500" />}
                    <span className={`text-sm font-bold ${acc.status === 'Active' ? 'text-green-400' : 'text-red-400'}`}>{acc.status}</span>
                  </div>
                </div>

                <div className="text-center md:text-left">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Integrity</p>
                  <span className="text-sm font-bold text-white">{acc.health}%</span>
                </div>

                <div className="text-center md:text-left">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Usage</p>
                  <span className="text-sm font-bold text-white">{acc.usage}</span>
                </div>

                <div className="flex gap-2">
                  <button className="p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-slate-400 transition-all">
                    <Trash2 size={18} className="hover:text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
