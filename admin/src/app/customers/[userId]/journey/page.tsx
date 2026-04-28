"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { useParams } from "next/navigation";

const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

interface Event {
  id: string; event: string; date: string;
  fromAccount?: string; toAccountId?: string;
  fromIp?: string; toIp?: string;
  reason?: string; triggeredBy: string;
  duration?: number; metadata?: Record<string, unknown>;
}
interface JourneyData {
  user: { id: string; name?: string; email: string };
  currentVPS: { id: string; ip?: string; account?: string; server?: string; status: string; plan?: string; createdAt: string } | null;
  history: Event[];
}

const MOCK_JOURNEY: JourneyData = {
  user: { id: "u1", name: "Kamal Perera", email: "kamal@example.com" },
  currentVPS: { id: "v2", ip: "5.6.7.8", account: "DO-Account-2", server: "SGP1-Proxmox", status: "active", plan: "Pro", createdAt: "2026-04-15T10:12:00Z" },
  history: [
    { id:"h1", event:"created",               date:"2026-04-01T09:00:00Z", fromAccount:"DO-Account-1", fromIp:"1.2.3.4",    triggeredBy:"user",  reason:"Payment confirmed" },
    { id:"h2", event:"vps_unreachable",        date:"2026-04-15T09:58:00Z", fromAccount:"DO-Account-1",                     triggeredBy:"auto",  reason:"Ping failed" },
    { id:"h3", event:"account_suspended",      date:"2026-04-15T10:00:00Z", fromAccount:"DO-Account-1",                     triggeredBy:"auto",  reason:"Trial period expired" },
    { id:"h4", event:"migration_started",      date:"2026-04-15T10:01:00Z", fromAccount:"DO-Account-1", toAccountId:"DO-Account-2", triggeredBy:"auto" },
    { id:"h5", event:"snapshot_taken",         date:"2026-04-15T10:03:00Z", fromAccount:"DO-Account-1",                     triggeredBy:"auto" },
    { id:"h6", event:"new_droplet_created",    date:"2026-04-15T10:07:00Z", fromAccount:"DO-Account-1", toAccountId:"DO-Account-2", fromIp:"1.2.3.4", toIp:"5.6.7.8", triggeredBy:"auto" },
    { id:"h7", event:"account_changed",        date:"2026-04-15T10:09:00Z", fromAccount:"DO-Account-1", toAccountId:"DO-Account-2", fromIp:"1.2.3.4", toIp:"5.6.7.8", triggeredBy:"auto" },
    { id:"h8", event:"user_notified",          date:"2026-04-15T10:09:30Z",                                                 triggeredBy:"auto" },
    { id:"h9", event:"started",               date:"2026-04-15T10:10:00Z",                             fromIp:"5.6.7.8",    triggeredBy:"user" },
    { id:"h10",event:"started",               date:"2026-04-28T08:00:00Z",                             fromIp:"5.6.7.8",    triggeredBy:"auto",  reason:"Heartbeat OK" },
  ],
};

const EVENT_CONFIG: Record<string, { icon: string; color: string; bg: string; label: string }> = {
  created:            { icon:"🟢", color:"#059669", bg:"#D1FAE5", label:"VPS Created" },
  started:            { icon:"🟢", color:"#059669", bg:"#D1FAE5", label:"VPS Running" },
  stopped:            { icon:"🔴", color:"#DC2626", bg:"#FEE2E2", label:"VPS Stopped" },
  suspended:          { icon:"🟡", color:"#D97706", bg:"#FEF3C7", label:"VPS Suspended" },
  vps_unreachable:    { icon:"🔴", color:"#DC2626", bg:"#FEE2E2", label:"VPS Unreachable" },
  account_suspended:  { icon:"🚨", color:"#DC2626", bg:"#FEE2E2", label:"Account Suspended" },
  migration_started:  { icon:"🔄", color:"#2563EB", bg:"#DBEAFE", label:"Migration Started" },
  snapshot_taken:     { icon:"📸", color:"#7C3AED", bg:"#EDE9FE", label:"Snapshot Taken" },
  new_droplet_created:{ icon:"⚡", color:"#2563EB", bg:"#DBEAFE", label:"New Droplet Created" },
  account_changed:    { icon:"🔄", color:"#2563EB", bg:"#DBEAFE", label:"Account Changed" },
  migration_completed:{ icon:"✅", color:"#059669", bg:"#D1FAE5", label:"Migration Complete" },
  user_notified:      { icon:"📧", color:"#059669", bg:"#D1FAE5", label:"User Notified" },
  ip_changed:         { icon:"🌐", color:"#0891B2", bg:"#CFFAFE", label:"IP Changed" },
};

function fmt(iso: string) {
  return new Date(iso).toLocaleString("en-US", { month:"short", day:"numeric", year:"numeric", hour:"2-digit", minute:"2-digit" });
}

export default function UserJourneyPage() {
  const params = useParams();
  const userId = params?.userId as string;
  const [data,    setData]    = useState<JourneyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${BACKEND}/api/admin/migrations/user/${userId}/journey`);
        if (r.ok) { setData(await r.json()); }
        else setData(MOCK_JOURNEY);
      } catch { setData(MOCK_JOURNEY); }
      setLoading(false);
    })();
  }, [userId]);

  if (loading) return (
    <div style={{ display:"flex", minHeight:"100vh", background:"#F8F9FA" }}>
      <Sidebar />
      <main style={{ flex:1, padding:"28px 32px" }}>
        <div style={{ height:"300px", background:"#fff", borderRadius:"14px", animation:"pulse 1.5s ease infinite" }}/>
      </main>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
    </div>
  );

  const d = data ?? MOCK_JOURNEY;

  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"#F8F9FA" }}>
      <Sidebar />
      <main style={{ flex:1, padding:"28px 32px", maxWidth:"860px" }}>

        {/* Header */}
        <div style={{ marginBottom:"22px" }}>
          <a href="/customers" style={{ fontSize:"13px", color:"#9CA3AF", textDecoration:"none" }}>← Back to Customers</a>
          <h1 style={{ fontSize:"21px", fontWeight:700, color:"#111827", letterSpacing:"-0.4px", marginTop:"6px" }}>
            👤 {d.user.name ?? d.user.email} · Complete VPS Journey
          </h1>
          <p style={{ fontSize:"13px", color:"#9CA3AF", marginTop:"2px" }}>{d.user.email} · {d.history.length} events recorded</p>
        </div>

        {/* Current VPS */}
        <div style={{ background:"#fff", borderRadius:"14px", border:"1px solid #F0F0F0", boxShadow:"0 2px 8px rgba(0,0,0,0.04)", padding:"20px", marginBottom:"22px" }}>
          <div style={{ fontSize:"11px", fontWeight:700, color:"#9CA3AF", letterSpacing:"0.06em", marginBottom:"12px" }}>CURRENT VPS STATUS</div>
          {d.currentVPS ? (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"14px" }}>
              {[
                { label:"IP Address", value:d.currentVPS.ip ?? "—", mono:true },
                { label:"Account",    value:d.currentVPS.account ?? "—" },
                { label:"Server",     value:d.currentVPS.server  ?? "—" },
                { label:"Plan",       value:d.currentVPS.plan    ?? "—" },
              ].map((f,i) => (
                <div key={i} style={{ background:"#F9FAFB", borderRadius:"10px", padding:"12px 14px" }}>
                  <div style={{ fontSize:"10.5px", color:"#9CA3AF", fontWeight:600, marginBottom:"4px" }}>{f.label}</div>
                  <div style={{ fontSize:"13.5px", fontWeight:600, color:"#111827", fontFamily:f.mono?"monospace":"inherit" }}>{f.value}</div>
                </div>
              ))}
              <div style={{ gridColumn:"1/-1", display:"flex", alignItems:"center", gap:"7px" }}>
                <div style={{ width:"8px", height:"8px", borderRadius:"50%", background:"#10B981", animation:"blink 2s ease infinite" }}/>
                <span style={{ fontSize:"13px", fontWeight:600, color:"#059669" }}>ONLINE · Active since {new Date(d.currentVPS.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ) : (
            <div style={{ color:"#9CA3AF", fontSize:"13px" }}>No active VPS found</div>
          )}
        </div>

        {/* Timeline */}
        <div style={{ background:"#fff", borderRadius:"14px", border:"1px solid #F0F0F0", boxShadow:"0 2px 8px rgba(0,0,0,0.04)", padding:"20px" }}>
          <div style={{ fontSize:"15px", fontWeight:700, color:"#111827", marginBottom:"18px" }}>Full Event Timeline</div>

          <div style={{ position:"relative" }}>
            {/* Vertical line */}
            <div style={{ position:"absolute", left:"16px", top:"0", bottom:"0", width:"2px", background:"#F3F4F6" }}/>

            {d.history.map((event, i) => {
              const cfg = EVENT_CONFIG[event.event] ?? { icon:"•", color:"#6B7280", bg:"#F3F4F6", label:event.event.replace(/_/g," ") };
              return (
                <div key={event.id} style={{ display:"flex", gap:"16px", marginBottom: i<d.history.length-1 ? "22px" : "0", position:"relative" }}>
                  {/* Event icon */}
                  <div style={{ width:"34px", height:"34px", borderRadius:"50%", background:cfg.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"16px", flexShrink:0, zIndex:1, border:`3px solid #fff` }}>
                    {cfg.icon}
                  </div>

                  {/* Content */}
                  <div style={{ flex:1, paddingTop:"4px" }}>
                    <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:"4px" }}>
                      <span style={{ fontSize:"14px", fontWeight:700, color:cfg.color }}>{cfg.label}</span>
                      <span style={{ fontSize:"11.5px", color:"#9CA3AF" }}>{fmt(event.date)}</span>
                    </div>

                    <div style={{ fontSize:"12.5px", color:"#6B7280", marginTop:"3px" }}>
                      {event.fromAccount && <span>Account: <strong style={{ color:"#374151" }}>{event.fromAccount}</strong>{event.toAccountId ? ` → ${event.toAccountId}` : ""} · </span>}
                      {event.fromIp      && <span>IP: <code style={{ background:"#F3F4F6", padding:"1px 5px", borderRadius:"4px", fontSize:"11px" }}>{event.fromIp}</code>{event.toIp ? <> → <code style={{ background:"#F3F4F6", padding:"1px 5px", borderRadius:"4px", fontSize:"11px" }}>{event.toIp}</code></> : ""}{" "}</span>}
                      {event.reason      && <span>Reason: {event.reason}</span>}
                    </div>

                    {event.duration && (
                      <div style={{ fontSize:"11.5px", color:"#9CA3AF", marginTop:"2px" }}>Duration: {Math.round(event.duration/60)} min</div>
                    )}

                    <div style={{ fontSize:"11px", color:"#9CA3AF", marginTop:"2px" }}>
                      Triggered by: <span style={{ fontWeight:600, color: event.triggeredBy==="auto"?"#5145FF":event.triggeredBy==="admin"?"#D97706":"#059669" }}>{event.triggeredBy}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
    </div>
  );
}
