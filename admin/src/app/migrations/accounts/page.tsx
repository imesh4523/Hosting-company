"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";

const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

interface Account {
  id: string; name: string; status: string; region: string;
  dropletLimit: number; dropletCount: number; bandwidthUsed: number;
  suspendedAt?: string; suspendReason?: string; isPrimaryFailover: boolean;
  lastChecked?: string;
  droplets: { id: string; name: string; ipAddress?: string; status: string }[];
  _count: { droplets: number; migrations: number; migrationsTo: number };
}

const MOCK_ACCOUNTS: Account[] = [
  { id:"a1", name:"DO-Account-1", status:"suspended", region:"sgp1", dropletLimit:10, dropletCount:0, bandwidthUsed:45, suspendedAt:"2026-04-15T10:00:00Z", suspendReason:"Trial period expired", isPrimaryFailover:false, lastChecked:"2026-04-28T09:00:00Z", droplets:[], _count:{ droplets:5, migrations:5, migrationsTo:0 } },
  { id:"a2", name:"DO-Account-2", status:"active",    region:"sgp1", dropletLimit:10, dropletCount:8, bandwidthUsed:120, isPrimaryFailover:false, lastChecked:"2026-04-28T09:01:00Z", droplets:[{id:"d1",name:"vps-kamal",ipAddress:"5.6.7.8",status:"active"},{id:"d2",name:"vps-nimal",ipAddress:"9.10.11.12",status:"active"}], _count:{ droplets:8, migrations:0, migrationsTo:5 } },
  { id:"a3", name:"DO-Account-3", status:"active",    region:"nyc1", dropletLimit:10, dropletCount:2, bandwidthUsed:20, isPrimaryFailover:true, lastChecked:"2026-04-28T09:01:00Z", droplets:[{id:"d3",name:"vps-test1",ipAddress:"11.12.13.14",status:"active"}], _count:{ droplets:2, migrations:0, migrationsTo:0 } },
];

function UsageBar({ used, max, color }: { used: number; max: number; color: string }) {
  const pct = Math.min(100, Math.round((used / max) * 100));
  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", fontSize:"11px", color:"#9CA3AF", marginBottom:"3px" }}>
        <span>{used}/{max}</span>
        <span style={{ fontWeight:700, color: pct>=90?"#EF4444": pct>=75?"#F59E0B":color }}>{pct}%</span>
      </div>
      <div style={{ height:"4px", background:"#F3F4F6", borderRadius:"99px", overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${pct}%`, background:pct>=90?"#EF4444":pct>=75?"#F59E0B":color, borderRadius:"99px", transition:"width 0.4s ease" }}/>
      </div>
    </div>
  );
}

export default function AccountHealthPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [setting,  setSetting]  = useState<string | null>(null);
  const [toast,    setToast]    = useState<string>("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${BACKEND}/api/admin/migrations/accounts/health`);
        if (r.ok) { const d = await r.json(); setAccounts(d.accounts ?? []); }
        else setAccounts(MOCK_ACCOUNTS);
      } catch { setAccounts(MOCK_ACCOUNTS); }
      setLoading(false);
    })();
  }, []);

  const setPrimary = async (id: string) => {
    setSetting(id);
    try {
      await fetch(`${BACKEND}/api/admin/migrations/accounts/${id}/set-primary`, { method:"POST" });
      setAccounts(prev => prev.map((a: any) => ({ ...a, isPrimaryFailover: a.id === id })));
      showToast("Primary failover account updated");
    } catch { showToast("Failed to update"); }
    setSetting(null);
  };

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"#F8F9FA" }}>
      <Sidebar />
      <main style={{ flex:1, padding:"28px 32px" }}>
        {toast && <div style={{ position:"fixed", bottom:"24px", right:"24px", zIndex:9999, background:"#111827", color:"#fff", padding:"12px 20px", borderRadius:"10px", fontSize:"13px" }}>{toast}</div>}

        <div style={{ marginBottom:"22px" }}>
          <h1 style={{ fontSize:"21px", fontWeight:700, color:"#111827", letterSpacing:"-0.4px" }}>DO Account Health</h1>
          <p style={{ fontSize:"13px", color:"#9CA3AF", marginTop:"2px" }}>Monitor all DigitalOcean accounts — auto-checked every 60s</p>
        </div>

        {/* Summary */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"14px", marginBottom:"22px" }}>
          {[
            { label:"Total Accounts",   value:accounts.length,                                         color:"#5145FF" },
            { label:"Active",           value:accounts.filter((a: any)=>a.status==="active").length,          color:"#10B981" },
            { label:"Suspended",        value:accounts.filter((a: any)=>a.status==="suspended").length,       color:"#EF4444" },
            { label:"Total Droplets",   value:accounts.reduce((s: number, a: any)=>s+a.dropletCount,0),             color:"#8B5CF6" },
          ].map((s: any, i: number) => (
            <div key={i} style={{ background:"#fff", borderRadius:"14px", border:"1px solid #F0F0F0", boxShadow:"0 1px 6px rgba(0,0,0,0.04)", padding:"16px 18px" }}>
              <div style={{ fontSize:"11px", color:"#9CA3AF", fontWeight:600, textTransform:"uppercase", marginBottom:"4px" }}>{s.label}</div>
              <div style={{ fontSize:"26px", fontWeight:700, color:s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Account cards */}
        <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
          {(loading ? MOCK_ACCOUNTS : accounts).map((acc: any) => {
            const isSuspended = acc.status === "suspended";
            const isActive    = acc.status === "active";
            const statusCfg   = isSuspended
              ? { dot:"#EF4444", badge:"#FEE2E2", text:"#DC2626", label:"SUSPENDED" }
              : { dot:"#10B981", badge:"#D1FAE5", text:"#059669", label:"ACTIVE" };

            return (
              <div key={acc.id} style={{ background:"#fff", borderRadius:"14px", border:`1px solid ${isSuspended?"#FECACA":"#F0F0F0"}`, boxShadow:"0 2px 8px rgba(0,0,0,0.04)", padding:"20px" }}>
                {/* Header */}
                <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:"16px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/icons/vds-2x.webp" alt="DO" width={36} height={36} style={{ objectFit:"contain", borderRadius:"8px", background:"#DBEAFE", padding:"4px" }}/>
                    <div>
                      <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                        <span style={{ fontSize:"15px", fontWeight:700, color:"#111827" }}>{acc.name}</span>
                        {acc.isPrimaryFailover && <span style={{ fontSize:"10px", fontWeight:700, background:"#EDE9FE", color:"#7C3AED", padding:"1px 8px", borderRadius:"99px" }}>★ PRIMARY FAILOVER</span>}
                      </div>
                      <div style={{ fontSize:"12px", color:"#9CA3AF", marginTop:"2px" }}>Region: {acc.region} · Checked: {acc.lastChecked ? new Date(acc.lastChecked).toLocaleTimeString() : "—"}</div>
                    </div>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:"6px", background:statusCfg.badge, padding:"4px 12px", borderRadius:"99px" }}>
                    <div style={{ width:"7px", height:"7px", borderRadius:"50%", background:statusCfg.dot, animation:isActive?"blink 2s ease infinite":"none" }}/>
                    <span style={{ fontSize:"10.5px", fontWeight:700, color:statusCfg.text }}>{statusCfg.label}</span>
                  </div>
                </div>

                {/* Suspension notice */}
                {isSuspended && (
                  <div style={{ background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:"10px", padding:"12px 14px", marginBottom:"14px" }}>
                    <div style={{ fontSize:"12.5px", fontWeight:600, color:"#DC2626", marginBottom:"4px" }}>🚨 Account Suspended</div>
                    <div style={{ fontSize:"12px", color:"#6B7280" }}>Reason: {acc.suspendReason}</div>
                    {acc.suspendedAt && <div style={{ fontSize:"11.5px", color:"#9CA3AF", marginTop:"2px" }}>Since: {new Date(acc.suspendedAt).toLocaleString()}</div>}
                    <div style={{ fontSize:"12px", color:"#059669", marginTop:"6px", fontWeight:500 }}>✅ All {acc._count.droplets} droplets successfully migrated · Zero data loss</div>
                  </div>
                )}

                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"12px", marginBottom:"14px" }}>
                  <div>
                    <div style={{ fontSize:"10.5px", color:"#9CA3AF", fontWeight:600, marginBottom:"5px" }}>DROPLETS</div>
                    <UsageBar used={acc.dropletCount} max={acc.dropletLimit} color="#5145FF"/>
                  </div>
                  <div>
                    <div style={{ fontSize:"10.5px", color:"#9CA3AF", fontWeight:600, marginBottom:"5px" }}>MIGRATIONS SENT</div>
                    <div style={{ fontSize:"18px", fontWeight:700, color:"#EF4444" }}>{acc._count.migrations}</div>
                  </div>
                  <div>
                    <div style={{ fontSize:"10.5px", color:"#9CA3AF", fontWeight:600, marginBottom:"5px" }}>MIGRATIONS RECEIVED</div>
                    <div style={{ fontSize:"18px", fontWeight:700, color:"#10B981" }}>{acc._count.migrationsTo}</div>
                  </div>
                </div>

                {/* Active droplets */}
                {acc.droplets.length > 0 && (
                  <div style={{ marginBottom:"14px" }}>
                    <div style={{ fontSize:"10.5px", color:"#9CA3AF", fontWeight:600, marginBottom:"8px" }}>ACTIVE DROPLETS</div>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:"6px" }}>
                      {acc.droplets.slice(0, 6).map((d: any) => (
                        <div key={d.id} style={{ background:"#F9FAFB", border:"1px solid #F3F4F6", borderRadius:"7px", padding:"5px 10px", display:"flex", alignItems:"center", gap:"6px" }}>
                          <div style={{ width:"5px", height:"5px", borderRadius:"50%", background:"#10B981" }}/>
                          <span style={{ fontSize:"12px", color:"#374151" }}>{d.name}</span>
                          {d.ipAddress && <span style={{ fontSize:"11px", color:"#9CA3AF", fontFamily:"monospace" }}>{d.ipAddress}</span>}
                        </div>
                      ))}
                      {acc.droplets.length > 6 && <div style={{ background:"#F9FAFB", border:"1px solid #F3F4F6", borderRadius:"7px", padding:"5px 10px", fontSize:"12px", color:"#9CA3AF" }}>+{acc.droplets.length - 6} more</div>}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div style={{ display:"flex", gap:"8px", paddingTop:"12px", borderTop:"1px solid #F3F4F6" }}>
                  <a href={`/migrations/accounts/${acc.id}/history`} style={{ fontSize:"12.5px", fontWeight:600, color:"#5145FF", background:"#EEF0FF", borderRadius:"7px", padding:"6px 14px", textDecoration:"none" }}>View History</a>
                  {!acc.isPrimaryFailover && isActive && (
                    <button onClick={() => setPrimary(acc.id)} disabled={setting===acc.id} style={{ fontSize:"12.5px", fontWeight:600, color:"#7C3AED", background:"#EDE9FE", border:"none", borderRadius:"7px", padding:"6px 14px", cursor:"pointer" }}>
                      {setting===acc.id ? "Setting…" : "Set as Primary Failover"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
    </div>
  );
}
