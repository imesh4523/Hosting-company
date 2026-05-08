"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type VPSDetails = {
  id: string;
  name: string;
  hostname: string | null;
  status: string;
  ip: string | null;
  plan: {
    name: string;
  } | null;
  ram: number;
  cpu: number;
  disk: number;
  bandwidth: number;
  updatedAt: string;
};

export default function ServiceDetailsPage({ params }: { params: { id: string } }) {
  const [vps, setVps] = useState<VPSDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/vps/${params.id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setVps(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching VPS:", err);
        setLoading(false);
      });
  }, [params.id]);

  const handleAction = async (action: string) => {
    if (!confirm(`Are you sure you want to ${action.replace('_', ' ')} this server?`)) return;
    
    setActionLoading(action);
    try {
      const res = await fetch(`/api/vps/${params.id}/action`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Action failed");
      alert(data.message || `Action ${action} executed successfully`);
      
      // Basic state update for start/stop UI feel
      if (action === 'power_off') setVps(prev => prev ? { ...prev, status: 'stopped' } : null);
      if (action === 'power_on') setVps(prev => prev ? { ...prev, status: 'running' } : null);
      
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading service details...</div>;
  }

  if (!vps) {
    return <div className="p-8 text-center text-red-500">Service not found.</div>;
  }

  const vpsName = vps.plan?.name ? `${vps.plan.name}` : "Custom VPS";
  const displayTitle = vpsName.includes("VPS") ? vpsName : `Linux VPS Hosting - ${vpsName}`;

  return (
    <div className="p-6 max-w-[1200px] mx-auto text-slate-800">
      <div className="mb-6">
        <button onClick={() => router.push('/dashboard/services')} className="text-slate-500 hover:text-primary text-sm flex items-center gap-1 font-medium mb-4">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Services
        </button>
      </div>

      <div className="flex gap-8 items-start">
        {/* Left Sidebar inside page */}
        <div className="w-[280px] flex flex-col gap-6 shrink-0">
          {/* Actions */}
          <div>
            <h3 className="font-bold text-slate-800 mb-4 text-lg">Actions</h3>
            <div className="flex flex-col gap-3">
              <button className="flex items-center gap-3 text-sm text-primary hover:text-blue-700 font-medium text-left">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                Change Password
              </button>
              <button className="flex items-center gap-3 text-sm text-primary hover:text-blue-700 font-medium text-left">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" /></svg>
                Upgrade/Downgrade
              </button>
              <button className="flex items-center gap-3 text-sm text-primary hover:text-blue-700 font-medium text-left">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                Upgrade/Downgrade Options
              </button>
              <button className="flex items-center gap-3 text-sm text-primary hover:text-blue-700 font-medium text-left">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Request Cancellation
              </button>
            </div>
          </div>

          {/* Additional Tools */}
          <div className="mt-4">
            <h3 className="font-bold text-slate-800 mb-4 text-lg">Additional Tools</h3>
            <div className="flex flex-col gap-3">
              {[
                "Backups", "Backups Collection", "Graphs", "Reinstall", "Snapshots", "VM Power Tasks"
              ].map(tool => (
                <button key={tool} className="flex items-center gap-3 text-sm text-primary hover:text-blue-700 font-medium text-left">
                  <span className="w-4 h-4 flex items-center justify-center text-blue-500">⚡</span>
                  {tool}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Content */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Main Blue Banner */}
          <div className="w-full rounded-2xl p-8 flex flex-col items-center justify-center text-white" style={{ background: "linear-gradient(135deg, #4F46E5 0%, #3B82F6 100%)", minHeight: "220px" }}>
            <div className="w-16 h-16 border-2 border-white/20 rounded-xl mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" /></svg>
            </div>
            <h2 className="text-3xl font-bold mb-2">{displayTitle}</h2>
            <div className="bg-white/20 px-4 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm">
              {vps.hostname || vps.name}
            </div>
          </div>

          {/* Resource Usage Graphs */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div className="flex gap-12 flex-1 justify-center">
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 rounded-full border-[12px] border-slate-100 flex items-center justify-center relative">
                    <span className="text-2xl font-bold text-slate-700">0</span>
                    <span className="text-xs text-slate-400 absolute bottom-3">GB</span>
                  </div>
                  <div className="text-xs text-slate-500 font-medium mt-3">0B / {vps.disk || 20}GB</div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 rounded-full border-[12px] border-slate-100 flex items-center justify-center relative">
                    <span className="text-2xl font-bold text-slate-700">0</span>
                    <span className="text-xs text-slate-400 absolute bottom-3">MB</span>
                  </div>
                  <div className="text-xs text-slate-500 font-medium mt-3">0M / Unlimited M</div>
                </div>
              </div>
            </div>
            <div className="text-center text-xs text-slate-400 border-t border-slate-100 pt-4">
              Last Updated: {new Date(vps.updatedAt).toLocaleString()}
            </div>
          </div>

          {/* Actions Grid */}
          <div className="mt-2">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Actions</h3>
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={() => handleAction('power_on')}
                disabled={actionLoading === 'power_on'}
                className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 hover:border-emerald-500 hover:text-emerald-600 rounded-xl font-medium shadow-sm transition-all"
              >
                <span className="text-emerald-500">▶</span> Start
              </button>
              <button 
                onClick={() => handleAction('reboot')}
                disabled={actionLoading === 'reboot'}
                className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 hover:border-blue-500 hover:text-blue-600 rounded-xl font-medium shadow-sm transition-all"
              >
                <span className="text-blue-500">↻</span> Reboot
              </button>
              <button 
                onClick={() => handleAction('power_off')}
                disabled={actionLoading === 'power_off'}
                className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 hover:border-red-500 hover:text-red-600 rounded-xl font-medium shadow-sm transition-all"
              >
                <span className="text-red-500">◼</span> Stop
              </button>
              <button 
                className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 hover:border-orange-500 hover:text-orange-600 rounded-xl font-medium shadow-sm transition-all"
              >
                <span className="text-orange-500">⏻</span> Shut Down
              </button>
              <button className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 hover:border-slate-500 rounded-xl font-medium shadow-sm transition-all">
                🖥️ noVNC Console
              </button>
              <button className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 hover:border-slate-500 rounded-xl font-medium shadow-sm transition-all">
                ⌨️ Xterm.js Console
              </button>
              <button className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 hover:border-primary rounded-xl font-medium shadow-sm transition-all">
                🌐 Reconfigure Network
              </button>
            </div>
          </div>

          {/* Additional Tools Grid */}
          <div className="mt-4">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Additional Tools</h3>
            <div className="flex flex-wrap gap-3">
              {['Reinstall', 'Backups', 'Backups Collection', 'Graphs', 'Snapshots', 'VM Power Tasks'].map((tool) => (
                <button key={tool} className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 hover:border-primary rounded-xl font-medium shadow-sm transition-all">
                  <span className="text-blue-500">⚙</span> {tool}
                </button>
              ))}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
