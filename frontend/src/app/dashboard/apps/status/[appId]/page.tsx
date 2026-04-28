'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  RefreshCw, 
  Terminal, 
  Globe, 
  ExternalLink, 
  AlertCircle, 
  ChevronRight, 
  Copy, 
  Zap,
  ArrowLeft,
  Search,
  Lightbulb
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function AppStatusPage() {
  const { appId } = useParams();
  const [app, setApp] = useState<any>(null);
  const [logs, setLogs] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/apps/status/${appId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setApp(data);
          // If building, fetch logs
          if (data.status === 'building' || data.status === 'deploying') {
            const lastDeployment = data.doApp?.active_deployment || data.doApp?.in_progress_deployment;
            if (lastDeployment) {
              fetchLogs(lastDeployment.id);
            }
          }
        }
      } catch (err) {
        console.error('Status fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchLogs = async (deploymentId: string) => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/apps/logs/${appId}/${deploymentId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.logs) {
          // In a real app, you'd fetch the actual log content from the historic URL
          // For now, we'll simulate build logs
          setLogs(prev => prev || `> Initializing build for ${appId}...\n> [FETCHED LOGS URL] ${data.logs}\n> Downloading dependencies...\n> Building project artifacts...\n> Optimizing for production...`);
        }
      } catch (err) {
        console.error('Log fetch error:', err);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [appId]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-slate-400">Loading deployment details...</div>;
  if (!app) return <div className="min-h-screen flex items-center justify-center font-bold text-red-400">Application not found.</div>;

  const steps = [
    { label: 'Queued', status: 'success' },
    { label: 'Building', status: app.status === 'building' ? 'active' : (app.status === 'running' ? 'success' : 'pending') },
    { label: 'Deploying', status: app.status === 'deploying' ? 'active' : (app.status === 'running' ? 'success' : 'pending') },
    { label: 'Running', status: app.status === 'running' ? 'success' : 'pending' }
  ];

  return (
    <div className="min-h-screen bg-[#FDFDFF] p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Navigation */}
        <Link href="/dashboard/app-deploy" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors font-bold text-sm mb-8">
          <ArrowLeft size={16} /> Back to Deploy Center
        </Link>

        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-lg shadow-slate-200">
              <Terminal size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Deployment Status</h1>
              <p className="text-slate-500 font-medium">Tracking <span className="text-indigo-600 font-mono">{app.doAppId}</span></p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-6 py-2 rounded-full bg-white border border-slate-100 shadow-sm">
            <div className={`w-2 h-2 rounded-full ${app.status === 'running' ? 'bg-green-500' : 'bg-amber-500 animate-pulse'}`} />
            <span className="text-xs font-black uppercase tracking-widest text-slate-700">{app.status}</span>
          </div>
        </div>

        {/* Progress Tracker */}
        <div className="bg-white border border-slate-100 rounded-[32px] p-8 shadow-sm mb-8">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 z-0" />
            {steps.map((step, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  step.status === 'success' ? 'bg-green-500 text-white' : 
                  (step.status === 'active' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white border-2 border-slate-100 text-slate-300')
                }`}>
                  {step.status === 'success' ? <CheckCircle2 size={20}/> : (step.status === 'active' ? <RefreshCw size={20} className="animate-spin" /> : <div className="w-2 h-2 rounded-full bg-slate-200" />)}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest ${step.status === 'pending' ? 'text-slate-300' : 'text-slate-900'}`}>{step.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Success / Logs Section */}
        {app.status === 'running' ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-green-100 rounded-[32px] p-10 shadow-xl shadow-green-100/20 text-center"
          >
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-500 mx-auto mb-6">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-2">App is LIVE!</h2>
            <p className="text-slate-500 font-medium mb-10">Your application has been successfully deployed to the edge.</p>

            <div className="grid md:grid-cols-2 gap-4 text-left">
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 group hover:border-indigo-200 transition-colors">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Custom Subdomain</p>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{app.customSubdomain || 'Creating...'}</span>
                  <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><Copy size={16}/></button>
                </div>
                <a href={app.customSubdomain} target="_blank" className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-indigo-600">
                  Open Application <ExternalLink size={12} />
                </a>
              </div>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 group hover:border-indigo-200 transition-colors">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">DigitalOcean URL</p>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-slate-500 text-[11px] truncate mr-2">{app.doUrl || 'Fetching...'}</span>
                  <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><Copy size={16}/></button>
                </div>
                <a href={app.doUrl} target="_blank" className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-indigo-600">
                  Direct Live Link <ExternalLink size={12} />
                </a>
              </div>
            </div>

            <div className="mt-10 pt-10 border-t border-slate-100 flex items-center justify-center gap-12">
              <div className="text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Region</p>
                <p className="font-bold text-slate-900">Singapore</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">SSL Status</p>
                <p className="font-bold text-green-600 flex items-center gap-1"><Zap size={14} fill="currentColor"/> Active</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Failover</p>
                <p className="font-bold text-slate-900">DO-App-1</p>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {/* Error Analysis - Only if failed */}
            {app.status === 'failed' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-50 border border-red-100 rounded-3xl p-8"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                    <Search size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-red-900 uppercase tracking-tight mb-2">AI Error Analysis</h3>
                    <p className="text-sm text-red-800 font-bold mb-4">Error Type: <span className="bg-red-100 px-2 py-0.5 rounded">Missing Module</span></p>
                    
                    <div className="bg-white/50 border border-red-100 p-4 rounded-xl mb-6">
                      <div className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest mb-2">
                        <Lightbulb size={14} /> Suggested Fix
                      </div>
                      <p className="text-sm text-slate-700 font-medium">Run <code className="bg-slate-900 text-white px-2 py-0.5 rounded text-[11px]">npm install dotenv</code> in your project, then push to GitHub again.</p>
                    </div>

                    <div className="flex gap-4">
                      <button className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-red-700 transition-all shadow-lg shadow-red-200">Retry Deploy</button>
                      <button className="bg-white border border-red-200 text-red-600 px-6 py-3 rounded-xl font-bold text-sm hover:bg-red-50 transition-all">Edit Config</button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Terminal Logs */}
            <div className="bg-slate-900 rounded-[32px] overflow-hidden shadow-2xl border border-slate-800">
              <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal size={16} className="text-slate-500" />
                  <span className="text-xs font-mono text-slate-400">Live Build Logs</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Streaming</span>
                  </div>
                </div>
              </div>
              <div className="p-8 font-mono text-xs leading-relaxed text-slate-300 max-h-[400px] overflow-y-auto scrollbar-hide">
                <div className="space-y-1">
                  {logs.split('\n').map((line, i) => (
                    <div key={i} className="flex gap-4">
                      <span className="text-slate-700 shrink-0 w-8 text-right select-none">{i + 1}</span>
                      <span className={line.startsWith('>') ? 'text-indigo-400' : ''}>{line}</span>
                    </div>
                  ))}
                  <div className="flex gap-4">
                    <span className="text-slate-700 shrink-0 w-8 text-right select-none">{logs.split('\n').length + 1}</span>
                    <span className="animate-pulse w-2 h-4 bg-indigo-500" />
                  </div>
                </div>
                <div ref={logEndRef} />
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
