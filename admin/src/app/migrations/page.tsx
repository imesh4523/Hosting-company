"use client";
import { useState, useEffect, useCallback } from "react";
import Sidebar from "@/components/Sidebar";

const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

interface MigrationStep { step: number; name: string; status: string; startedAt?: string; completedAt?: string; error?: string; }
interface Migration {
  id: string; status: string; trigger: string;
  fromIp?: string; toIp?: string; retryCount: number;
  downtimeMinutes?: number; failReason?: string;
  startedAt: string; completedAt?: string;
  user: { id: string; name?: string; email: string };
  vps: { name: string; ipAddress?: string };
  fromAccount: { name: string };
  toAccount:   { name: string };
  steps: MigrationStep[];
}
interface Stats { total: number; today: number; active: number; failed: number; }

const STEP_LABELS: Record<string, string> = {
  detect_suspension:  "1. Detect Suspension",
  find_best_account:  "2. Find Best Account",
  take_snapshot:      "3. Take Snapshot",
  transfer_snapshot:  "4. Transfer Snapshot",
  create_new_droplet: "5. Create New Droplet",
  restore_snapshot:   "6. Restore Snapshot",
  verify_vps:         "7. Verify VPS",
  update_database:    "8. Update Database",
  notify_user:        "9. Notify User",
  cleanup:            "10. Cleanup",
};

const MOCK_MIGRATIONS: Migration[] = [
  { id: "m1", status: "restoring", trigger: "account_suspended", fromIp: "1.2.3.4", toIp: "", retryCount: 0, startedAt: new Date(Date.now() - 5*60000).toISOString(), user: { id: "u1", name: "Kamal Perera", email: "kamal@example.com" }, vps: { name: "vps-kamal", ipAddress: "1.2.3.4" }, fromAccount: { name: "DO-Account-1" }, toAccount: { name: "DO-Account-2" }, steps: [
    { step:1, name:"detect_suspension",  status:"done",    completedAt: new Date(Date.now()-5*60000).toISOString() },
    { step:2, name:"find_best_account",  status:"done",    completedAt: new Date(Date.now()-4*60000).toISOString() },
    { step:3, name:"take_snapshot",      status:"done",    completedAt: new Date(Date.now()-3*60000).toISOString() },
    { step:4, name:"transfer_snapshot",  status:"done",    completedAt: new Date(Date.now()-2*60000).toISOString() },
    { step:5, name:"create_new_droplet", status:"done",    completedAt: new Date(Date.now()-90000).toISOString() },
    { step:6, name:"restore_snapshot",   status:"running", startedAt:  new Date(Date.now()-30000).toISOString() },
    { step:7, name:"verify_vps",         status:"pending" },
    { step:8, name:"update_database",    status:"pending" },
    { step:9, name:"notify_user",        status:"pending" },
    { step:10,name:"cleanup",            status:"pending" },
  ]},
  { id: "m2", status: "completed", trigger: "failover", fromIp: "5.6.7.8", toIp: "9.10.11.12", retryCount: 0, downtimeMinutes: 8, startedAt: new Date(Date.now() - 30*60000).toISOString(), completedAt: new Date(Date.now() - 22*60000).toISOString(), user: { id: "u2", name: "Nimal Silva", email: "nimal@example.com" }, vps: { name: "vps-nimal", ipAddress: "5.6.7.8" }, fromAccount: { name: "DO-Account-1" }, toAccount: { name: "DO-Account-3" }, steps: Array.from({length:10},(_,i)=>({ step:i+1, name:Object.keys(STEP_LABELS)[i], status:"done" })) },
  { id: "m3", status: "failed", trigger: "manual", fromIp: "3.4.5.6", toIp: "", retryCount: 3, failReason: "Target account at droplet limit", startedAt: new Date(Date.now() - 2*3600000).toISOString(), user: { id: "u3", name: "Sunil Fernando", email: "sunil@example.com" }, vps: { name: "vps-sunil", ipAddress: "3.4.5.6" }, fromAccount: { name: "DO-Account-2" }, toAccount: { name: "DO-Account-3" }, steps: [
    { step:1, name:"detect_suspension", status:"done" },
    { step:2, name:"find_best_account", status:"failed", error:"Target account at droplet limit" },
    ...Array.from({length:8},(_,i)=>({ step:i+3, name:Object.keys(STEP_LABELS)[i+2], status:"pending" })),
  ]},
];

function StepDot({ status }: { status: string }) {
  const cfg = status === "done" ? { bg:"#10B981", symbol:"✓" } : status === "running" ? { bg:"#5145FF", symbol:"↻" } : status === "failed" ? { bg:"#EF4444", symbol:"✗" } : { bg:"#E5E7EB", symbol:"·" };
  return (
    <div style={{ width:"20px", height:"20px", borderRadius:"50%", background:cfg.bg, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"11px", fontWeight:700, flexShrink:0, animation: status==="running" ? "spin 1.5s linear infinite" : "none" }}>
      {cfg.symbol}
    </div>
  );
}

function MigrationCard({ m, expanded, onToggle }: { m: Migration; expanded: boolean; onToggle: () => void }) {
  const doneSteps    = m.steps.filter(s => s.status === "done").length;
  const pct          = Math.round((doneSteps / 10) * 100);
  const statusCfg    = m.status === "completed" ? { bg:"#D1FAE5", color:"#059669", label:"COMPLETED" }
                     : m.status === "failed"    ? { bg:"#FEE2E2", color:"#DC2626", label:"FAILED" }
                     :                            { bg:"#DBEAFE", color:"#2563EB", label:"IN PROGRESS" };
  const elapsed      = Math.round((Date.now() - new Date(m.startedAt).getTime()) / 60000);
  const triggerLabel = m.trigger.replace(/_/g," ").toUpperCase();

  return (
    <div style={{ background:"#fff", borderRadius:"14px", border:`1px solid ${m.status==="failed" ? "#FECACA" : "#F0F0F0"}`, boxShadow:"0 2px 8px rgba(0,0,0,0.04)", overflow:"hidden", marginBottom:"14px" }}>
      <div onClick={onToggle} style={{ padding:"16px 20px", cursor:"pointer", display:"flex", gap:"14px", alignItems:"flex-start" }}>
        {/* Progress circle */}
        <div style={{ position:"relative", width:"52px", height:"52px", flexShrink:0 }}>
          <svg width="52" height="52" style={{ transform:"rotate(-90deg)" }}>
            <circle cx="26" cy="26" r="22" fill="none" stroke="#F3F4F6" strokeWidth="4"/>
            <circle cx="26" cy="26" r="22" fill="none" stroke={m.status==="failed" ? "#EF4444" : "#5145FF"} strokeWidth="4" strokeDasharray={`${2*Math.PI*22}`} strokeDashoffset={`${2*Math.PI*22*(1-pct/100)}`} style={{ transition:"stroke-dashoffset 0.5s ease" }}/>
          </svg>
          <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"11px", fontWeight:700, color:"#374151" }}>{pct}%</div>
        </div>

        <div style={{ flex:1 }}>
          <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"5px", flexWrap:"wrap" }}>
            <span style={{ fontSize:"14px", fontWeight:700, color:"#111827" }}>{m.user.name ?? m.user.email}</span>
            <span style={{ fontSize:"11.5px", color:"#9CA3AF" }}>·</span>
            <span style={{ fontSize:"12px", color:"#6B7280" }}>{m.vps.name}</span>
            <span style={{ fontSize:"10px", fontWeight:700, background:statusCfg.bg, color:statusCfg.color, padding:"1px 8px", borderRadius:"99px" }}>{statusCfg.label}</span>
            {m.retryCount > 0 && <span style={{ fontSize:"10px", background:"#FEF3C7", color:"#D97706", padding:"1px 7px", borderRadius:"99px", fontWeight:700 }}>Retry {m.retryCount}/3</span>}
          </div>
          <div style={{ fontSize:"13px", color:"#374151", marginBottom:"8px" }}>
            {m.fromAccount.name} → {m.toAccount.name}
            {m.fromIp && <span style={{ color:"#9CA3AF" }}> · {m.fromIp}{m.toIp ? ` → ${m.toIp}` : ""}</span>}
          </div>

          {/* Progress bar */}
          <div style={{ height:"5px", background:"#F3F4F6", borderRadius:"99px", overflow:"hidden", marginBottom:"6px" }}>
            <div style={{ height:"100%", width:`${pct}%`, background: m.status==="failed" ? "#EF4444" : "#5145FF", borderRadius:"99px", transition:"width 0.5s ease" }}/>
          </div>

          <div style={{ display:"flex", gap:"14px", fontSize:"11.5px", color:"#9CA3AF" }}>
            <span>Step {doneSteps}/10</span>
            <span>Trigger: {triggerLabel}</span>
            <span>{m.status==="completed" ? `Done in ${m.downtimeMinutes}min` : `${elapsed}min ago`}</span>
          </div>
        </div>

        <div style={{ color:"#9CA3AF", fontSize:"16px" }}>{expanded ? "▲" : "▼"}</div>
      </div>

      {/* Expanded step list */}
      {expanded && (
        <div style={{ padding:"0 20px 16px", borderTop:"1px solid #F9FAFB" }}>
          {m.steps.map(s => (
            <div key={s.step} style={{ display:"flex", alignItems:"center", gap:"10px", padding:"7px 0", borderBottom:"1px solid #F9FAFB" }}>
              <StepDot status={s.status} />
              <div style={{ flex:1 }}>
                <span style={{ fontSize:"12.5px", color: s.status==="running" ? "#5145FF" : s.status==="failed" ? "#DC2626" : "#374151", fontWeight: s.status==="running" ? 700 : 400 }}>
                  {STEP_LABELS[s.name] ?? s.name}
                </span>
                {s.error && <div style={{ fontSize:"11px", color:"#DC2626", marginTop:"2px" }}>Error: {s.error}</div>}
              </div>
              <span style={{ fontSize:"10.5px", color:"#9CA3AF" }}>
                {s.status==="done" && s.completedAt ? new Date(s.completedAt).toLocaleTimeString() : s.status==="running" ? "Running…" : ""}
              </span>
            </div>
          ))}

          {m.status === "failed" && (
            <div style={{ marginTop:"10px", padding:"10px 12px", background:"#FEF2F2", borderRadius:"8px", fontSize:"12.5px", color:"#DC2626" }}>
              <strong>Failure Reason:</strong> {m.failReason}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function MigrationCenterPage() {
  const [migrations,  setMigrations]  = useState<Migration[]>([]);
  const [stats,       setStats]       = useState<Stats>({ total:0, today:0, active:0, failed:0 });
  const [loading,     setLoading]     = useState(true);
  const [expanded,    setExpanded]    = useState<string | null>(null);
  const [filter,      setFilter]      = useState("all");

  const load = useCallback(async () => {
    try {
      const r = await fetch(`${BACKEND}/api/admin/migrations`);
      if (r.ok) { const d = await r.json(); setMigrations(d.migrations ?? []); setStats(d.stats ?? {}); }
      else       { setMigrations(MOCK_MIGRATIONS); setStats({ total:23, today:5, active:2, failed:1 }); }
    } catch   { setMigrations(MOCK_MIGRATIONS); setStats({ total:23, today:5, active:2, failed:1 }); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); const id = setInterval(load, 8000); return () => clearInterval(id); }, [load]);

  const filtered = migrations.filter(m => filter === "all" || m.status === filter);

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"#F8F9FA" }}>
      <Sidebar />
      <main style={{ flex:1, padding:"28px 32px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"22px" }}>
          <div>
            <h1 style={{ fontSize:"21px", fontWeight:700, color:"#111827", letterSpacing:"-0.4px" }}>Migration Center</h1>
            <p style={{ fontSize:"13px", color:"#9CA3AF", marginTop:"2px" }}>Real-time migration tracking · auto-refreshes every 8s</p>
          </div>
          <div style={{ display:"flex", gap:"8px" }}>
            {stats.active > 0 && <div style={{ display:"flex", alignItems:"center", gap:"6px", background:"#DBEAFE", padding:"6px 14px", borderRadius:"99px" }}>
              <div style={{ width:"7px", height:"7px", borderRadius:"50%", background:"#3B82F6", animation:"blink 1.5s ease infinite" }}/>
              <span style={{ fontSize:"12px", fontWeight:700, color:"#2563EB" }}>{stats.active} ACTIVE</span>
            </div>}
          </div>
        </div>

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"14px", marginBottom:"22px" }}>
          {[
            { label:"Total Migrations", value:stats.total, color:"#5145FF" },
            { label:"Today",            value:stats.today, color:"#8B5CF6" },
            { label:"Active Now",       value:stats.active, color:"#3B82F6" },
            { label:"Failed (need review)", value:stats.failed, color:stats.failed>0?"#EF4444":"#9CA3AF" },
          ].map((s,i) => (
            <div key={i} style={{ background:"#fff", borderRadius:"14px", border:"1px solid #F0F0F0", boxShadow:"0 1px 6px rgba(0,0,0,0.04)", padding:"16px 18px" }}>
              <div style={{ fontSize:"11px", color:"#9CA3AF", fontWeight:600, marginBottom:"4px", textTransform:"uppercase" }}>{s.label}</div>
              <div style={{ fontSize:"26px", fontWeight:700, color:s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div style={{ display:"flex", gap:"6px", marginBottom:"18px" }}>
          {["all","pending","deploying","restoring","completed","failed"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ fontSize:"12px", fontWeight:600, padding:"5px 14px", borderRadius:"99px", border:"none", cursor:"pointer", background: filter===f ? "#5145FF" : "#fff", color: filter===f ? "#fff" : "#6B7280", boxShadow: filter===f ? "0 2px 8px rgba(81,69,255,0.25)" : "none" }}>
              {f.charAt(0).toUpperCase()+f.slice(1)}
            </button>
          ))}
          <span style={{ marginLeft:"auto", fontSize:"12px", color:"#9CA3AF", lineHeight:"26px" }}>{filtered.length} migrations</span>
        </div>

        {/* Migration cards */}
        {loading
          ? [1,2].map(i => <div key={i} style={{ height:"100px", background:"#fff", borderRadius:"14px", marginBottom:"14px", animation:"pulse 1.5s ease infinite" }}/>)
          : filtered.length === 0
          ? <div style={{ textAlign:"center", padding:"60px", background:"#fff", borderRadius:"14px" }}><div style={{ fontSize:"36px" }}>🔄</div><div style={{ fontSize:"15px", fontWeight:600, color:"#374151", marginTop:"10px" }}>No migrations match this filter</div></div>
          : filtered.map(m => <MigrationCard key={m.id} m={m} expanded={expanded===m.id} onToggle={() => setExpanded(expanded===m.id ? null : m.id)} />)
        }
      </main>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}} @keyframes blink{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
    </div>
  );
}
