'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  ExternalLink, 
  RefreshCw, 
  Trash2, 
  Terminal, 
  ChevronRight, 
  Globe,
  Zap,
  MoreVertical,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

export default function AppsListPage() {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/apps/list', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) setApps(data);
      } catch (err) {
        console.error('Fetch apps error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchApps();
  }, []);

  const filteredApps = apps.filter(app => 
    app.doAppId.toLowerCase().includes(search.toLowerCase()) || 
    app.repoUrl.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FDFDFF] p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Applications</h1>
            <p className="text-slate-500 font-medium mt-1">Manage your active deployments and services.</p>
          </div>
          <Link 
            href="/dashboard/app-deploy" 
            className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 self-start"
          >
            <Plus size={20} strokeWidth={3} />
            Deploy New App
          </Link>
        </div>

        {/* Stats & Filter */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white border border-slate-100 p-6 rounded-[24px] shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Apps</p>
            <p className="text-2xl font-black text-slate-900">{apps.length}</p>
          </div>
          <div className="bg-white border border-slate-100 p-6 rounded-[24px] shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Running</p>
            <p className="text-2xl font-black text-green-600">{apps.filter(a => a.status === 'running').length}</p>
          </div>
          <div className="bg-white border border-slate-100 p-6 rounded-[24px] shadow-sm md:col-span-2 flex items-center px-8">
            <div className="flex-1 relative">
              <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="text" 
                placeholder="Search by app name or repo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-700 pl-8 placeholder:text-slate-300"
              />
            </div>
            <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
              <Filter size={18} />
            </button>
          </div>
        </div>

        {/* Apps Grid */}
        <div className="grid gap-6">
          <AnimatePresence mode="popLayout">
            {filteredApps.map((app) => (
              <motion.div 
                key={app.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white border border-slate-100 rounded-[32px] p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-xl hover:shadow-slate-100 transition-all group"
              >
                <div className="flex items-center gap-6">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl shadow-inner ${
                    app.status === 'running' ? 'bg-green-50' : (app.status === 'failed' ? 'bg-red-50' : 'bg-amber-50')
                  }`}>
                    {app.framework === 'nextjs' ? '▲' : (app.framework === 'docker' ? '🐳' : '🟢')}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-xl font-black text-slate-900">{app.doAppId}</h3>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                        app.status === 'running' ? 'bg-green-100 text-green-700' : 
                        (app.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700')
                      }`}>
                        {app.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-bold flex items-center gap-2 truncate max-w-xs">
                      <Globe size={14} /> {app.customSubdomain || app.repoUrl}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-12">
                  <div className="hidden lg:block text-right">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Region</p>
                    <p className="text-xs font-bold text-slate-700">Singapore</p>
                  </div>
                  <div className="hidden lg:block text-right">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Last Deploy</p>
                    <p className="text-xs font-bold text-slate-700">2 days ago</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Link 
                      href={`/dashboard/apps/status/${app.id}`}
                      className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all"
                    >
                      <Terminal size={18} />
                    </Link>
                    <a 
                      href={app.customSubdomain || '#'} 
                      target="_blank"
                      className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-indigo-600 hover:text-white transition-all"
                    >
                      <ExternalLink size={18} />
                    </a>
                    <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {!loading && filteredApps.length === 0 && (
            <div className="text-center py-20 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-slate-200 mx-auto mb-6">
                <Zap size={40} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No applications found</h3>
              <p className="text-slate-400 font-medium mb-8">Deploy your first project to see it here.</p>
              <Link 
                href="/dashboard/app-deploy"
                className="text-indigo-600 font-black text-sm uppercase tracking-widest flex items-center gap-2 justify-center hover:gap-3 transition-all"
              >
                Get Started <ChevronRight size={16} strokeWidth={3}/>
              </Link>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
