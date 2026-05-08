"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

// ─── Generate simulated live data ────────────────────────────────────────────
function genEarnings() {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const now = new Date().getMonth();
  return months.slice(0, now + 1).map((m: string, i: number) => ({
    month: m,
    revenue: Math.floor(2400 + i * 380 + Math.random() * 500),
    expenses: Math.floor(800 + i * 60 + Math.random() * 200),
    profit: Math.floor(1600 + i * 320 + Math.random() * 300),
  }));
}

function genAPISpeed() {
  return Array.from({ length: 20 }, (_, i) => ({
    t: `${i}s`,
    auth: Math.floor(28 + Math.random() * 18),
    provision: Math.floor(120 + Math.random() * 80),
    billing: Math.floor(45 + Math.random() * 25),
  }));
}

function genPerformance() {
  return Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    cpu: Math.floor(20 + Math.random() * 55),
    ram: Math.floor(35 + Math.random() * 40),
    network: Math.floor(10 + Math.random() * 70),
  }));
}

function genRecovery() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return days.map((d: string) => ({
    day: d,
    events: Math.floor(Math.random() * 8),
    success: Math.floor(Math.random() * 7),
    failed: Math.floor(Math.random() * 2),
    avgTime: Math.floor(12 + Math.random() * 40),
  }));
}

function genLiveStrip() {
  return Array.from({ length: 30 }, (_, i) => ({
    t: i,
    requests: Math.floor(80 + Math.random() * 120),
    errors: Math.floor(Math.random() * 8),
    latency: Math.floor(15 + Math.random() * 35),
  }));
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#1E1E2E", border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "10px", padding: "10px 14px", fontSize: "12px", color: "#fff",
      boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
    }}>
      <div style={{ color: "#9CA3AF", marginBottom: "6px", fontWeight: 600 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "3px" }}>
          <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: p.color }} />
          <span style={{ color: "#CBD5E1" }}>{p.name}:</span>
          <span style={{ fontWeight: 700 }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Metric Pill ─────────────────────────────────────────────────────────────
function MetricPill({ label, value, up }: { label: string; value: string; up: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
      <span style={{ fontSize: "11px", color: "#6B7280", fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: "15px", fontWeight: 700, color: up ? "#10B981" : "#EF4444" }}>{value}</span>
    </div>
  );
}

export default function AnalyticsPage() {
  const [earnings]    = useState(genEarnings);
  const [apiSpeed]    = useState(genAPISpeed);
  const [performance] = useState(genPerformance);
  const [recovery]    = useState(genRecovery);
  const [live, setLive]   = useState(genLiveStrip);
  const [tick, setTick]   = useState(0);
  const [totalReq, setTotalReq] = useState(0);
  const [reqPerSec, setReqPerSec] = useState(0);
  const [errRate, setErrRate] = useState(0);
  const [avgLat, setAvgLat] = useState(0);

  // Live strip — update every 800ms
  useEffect(() => {
    const id = setInterval(() => {
      setLive(prev => {
        const next = [...prev.slice(1), {
          t: prev[prev.length - 1].t + 1,
          requests: Math.floor(80 + Math.random() * 120),
          errors: Math.floor(Math.random() * 8),
          latency: Math.floor(15 + Math.random() * 35),
        }];
        const last = next[next.length - 1];
        setReqPerSec(last.requests);
        setErrRate(parseFloat(((last.errors / last.requests) * 100).toFixed(1)));
        setAvgLat(last.latency);
        return next;
      });
      setTotalReq(r => r + Math.floor(80 + Math.random() * 120));
      setTick(t => t + 1);
    }, 800);
    return () => clearInterval(id);
  }, []);

  const cardStyle = {
    background: "#fff",
    borderRadius: "14px",
    border: "1px solid #F0F0F0",
    boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
    overflow: "hidden" as const,
  };

  const sectionHeader = (title: string, sub: string, live?: boolean) => (
    <div style={{ padding: "18px 22px 0", marginBottom: "16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>{title}</span>
        {live && (
          <span style={{
            display: "flex", alignItems: "center", gap: "5px",
            background: "#ECFDF5", border: "1px solid #A7F3D0",
            padding: "2px 10px", borderRadius: "99px",
            fontSize: "10.5px", fontWeight: 700, color: "#059669",
          }}>
            <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#10B981", animation: "pulse 1s infinite" }} />
            LIVE
          </span>
        )}
      </div>
      <div style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "2px" }}>{sub}</div>
    </div>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F8F9FA" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: "28px 32px", overflowY: "auto" }}>

        {/* ── Header ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "26px" }}>
          <div>
            <h1 style={{ fontSize: "21px", fontWeight: 700, color: "#111827", letterSpacing: "-0.4px" }}>
              Analytics &amp; Performance
            </h1>
            <p style={{ fontSize: "13.5px", color: "#6B7280", marginTop: "3px" }}>
              Real-time system telemetry, revenue trends, and API observability.
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "5px", background: "#ECFDF5", border: "1px solid #A7F3D0", padding: "5px 13px", borderRadius: "99px" }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10B981" }} />
              <span style={{ fontSize: "11.5px", fontWeight: 700, color: "#059669" }}>LIVE TELEMETRY</span>
            </div>
          </div>
        </div>

        {/* ── Live KPI Strip ── */}
        <div style={{ ...cardStyle, marginBottom: "20px", background: "#0F0F1A", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ padding: "16px 22px 0" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "14px", fontWeight: 700, color: "#fff" }}>Live Request Monitor</span>
                <span style={{ display: "flex", alignItems: "center", gap: "5px", background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", padding: "2px 10px", borderRadius: "99px", fontSize: "10.5px", fontWeight: 700, color: "#10B981" }}>
                  <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#10B981" }} /> LIVE
                </span>
              </div>
              <div style={{ display: "flex", gap: "30px" }}>
                <MetricPill label="Req/sec" value={reqPerSec.toString()} up={true} />
                <MetricPill label="Error Rate" value={`${errRate}%`} up={errRate < 5} />
                <MetricPill label="Avg Latency" value={`${avgLat}ms`} up={avgLat < 35} />
                <MetricPill label="Total Requests" value={totalReq.toLocaleString()} up={true} />
              </div>
            </div>
          </div>
          <div style={{ padding: "0 0 8px" }}>
            <ResponsiveContainer width="100%" height={120}>
              <AreaChart data={live} margin={{ top: 10, right: 20, bottom: 0, left: -10 }}>
                <defs>
                  <linearGradient id="gReq" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5145FF" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#5145FF" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gErr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="t" tick={{ fill: "#555", fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#555", fontSize: 9 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="requests" stroke="#5145FF" strokeWidth={2} fill="url(#gReq)" name="Requests" dot={false} isAnimationActive={false} />
                <Area type="monotone" dataKey="errors" stroke="#EF4444" strokeWidth={1.5} fill="url(#gErr)" name="Errors" dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="latency" stroke="#F59E0B" strokeWidth={1.5} dot={false} name="Latency(ms)" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Row 1: Earnings + API Speed ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "18px", marginBottom: "18px" }}>

          {/* Earnings Chart */}
          <div style={cardStyle}>
            {sectionHeader("Revenue & Profit", "Monthly breakdown — earnings vs expenses")}
            <div style={{ padding: "0 16px 16px" }}>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={earnings} margin={{ top: 5, right: 10, bottom: 0, left: -15 }}>
                  <defs>
                    <linearGradient id="gRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#5145FF" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#5145FF" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="month" tick={{ fill: "#9CA3AF", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#9CA3AF", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                  <Area type="monotone" dataKey="revenue" stroke="#5145FF" strokeWidth={2} fill="url(#gRevenue)" name="Revenue" dot={false} />
                  <Area type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={2} fill="url(#gProfit)" name="Profit" dot={false} />
                  <Line type="monotone" dataKey="expenses" stroke="#F59E0B" strokeWidth={1.5} dot={false} name="Expenses" strokeDasharray="4 4" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* API Speed */}
          <div style={cardStyle}>
            {sectionHeader("API Response Times", "Average latency per endpoint (ms)")}
            <div style={{ padding: "0 16px 16px" }}>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={apiSpeed.slice(-12)} margin={{ top: 5, right: 10, bottom: 0, left: -15 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="t" tick={{ fill: "#9CA3AF", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#9CA3AF", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}ms`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                  <Line type="monotone" dataKey="auth" stroke="#5145FF" strokeWidth={2} dot={{ r: 2, fill: "#5145FF" }} name="Auth API" />
                  <Line type="monotone" dataKey="provision" stroke="#F59E0B" strokeWidth={2} dot={{ r: 2, fill: "#F59E0B" }} name="Provision API" />
                  <Line type="monotone" dataKey="billing" stroke="#10B981" strokeWidth={2} dot={{ r: 2, fill: "#10B981" }} name="Billing API" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ── Row 2: System Performance + Recovery ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px", marginBottom: "18px" }}>

          {/* System Performance */}
          <div style={cardStyle}>
            {sectionHeader("System Performance", "24-hour CPU / RAM / Network usage (%)", true)}
            <div style={{ padding: "0 16px 16px" }}>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={performance} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="gCPU" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#5145FF" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#5145FF" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gRAM" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="hour" tick={{ fill: "#9CA3AF", fontSize: 9 }} axisLine={false} tickLine={false} interval={3} />
                  <YAxis tick={{ fill: "#9CA3AF", fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} domain={[0, 100]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                  <Area type="monotone" dataKey="cpu" stroke="#5145FF" strokeWidth={1.8} fill="url(#gCPU)" name="CPU" dot={false} />
                  <Area type="monotone" dataKey="ram" stroke="#10B981" strokeWidth={1.8} fill="url(#gRAM)" name="RAM" dot={false} />
                  <Line type="monotone" dataKey="network" stroke="#3B82F6" strokeWidth={1.5} dot={false} name="Network" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recovery Events */}
          <div style={cardStyle}>
            {sectionHeader("Auto-Recovery Events", "Daily failover triggers — success vs failed")}
            <div style={{ padding: "0 16px 16px" }}>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={recovery} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="day" tick={{ fill: "#9CA3AF", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#9CA3AF", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                  <Bar dataKey="success" name="Success" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={22} />
                  <Bar dataKey="failed" name="Failed" fill="#EF4444" radius={[4, 4, 0, 0]} maxBarSize={22} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ── Row 3: Recovery Avg Time + Service Health ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: "18px" }}>

          {/* Recovery avg time */}
          <div style={cardStyle}>
            {sectionHeader("Recovery Time", "Average failover restoration time (seconds)")}
            <div style={{ padding: "0 16px 16px" }}>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={recovery} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="day" tick={{ fill: "#9CA3AF", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#9CA3AF", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}s`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="avgTime" name="Avg Recovery Time (s)" fill="#8B5CF6" radius={[5, 5, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Service Health Table */}
          <div style={cardStyle}>
            {sectionHeader("Service Health Status", "Current uptime and response for all services", true)}
            <div style={{ padding: "0 20px 16px" }}>
              {[
                { name: "Auth API",            uptime: 99.98, latency: 32,  status: "healthy",  icon: "/icons/ticket.svg",      isSvg: true  },
                { name: "Billing Engine",       uptime: 99.94, latency: 48,  status: "healthy",  icon: "/icons/domain-2x.webp",  isSvg: false },
                { name: "VPS Provisioner",      uptime: 99.81, latency: 142, status: "healthy",  icon: "/icons/vps-2x.webp",     isSvg: false },
                { name: "Auto-Recovery Worker", uptime: 98.72, latency: 18,  status: "degraded", icon: "/icons/transfer-2x.webp",isSvg: false },
                { name: "Affiliate Tracker",    uptime: 99.99, latency: 22,  status: "healthy",  icon: "/icons/reseller.svg",    isSvg: true  },
                { name: "DO API Bridge",        uptime: 97.43, latency: 210, status: "warning",  icon: "/icons/dedicated-2x.webp",isSvg: false },
              ].map((svc, i) => {
                const sc = svc.status === "healthy"
                  ? { color: "#10B981", bg: "#D1FAE5", label: "Healthy" }
                  : svc.status === "degraded"
                  ? { color: "#F59E0B", bg: "#FEF3C7", label: "Degraded" }
                  : { color: "#EF4444", bg: "#FEE2E2", label: "Warning" };
                return (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: "12px",
                    padding: "9px 0", borderBottom: i < 5 ? "1px solid #F9FAFB" : "none",
                  }}>
                    {svc.isSvg
                      ? <img src={svc.icon} alt={svc.name} width={30} height={30} style={{ borderRadius: "7px", flexShrink: 0 }} />
                      : <div style={{ width: "30px", height: "30px", borderRadius: "7px", background: "#F3F4F6", border: "1px solid #EEE", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <img src={svc.icon} alt={svc.name} width={20} height={20} style={{ objectFit: "contain" }} />
                        </div>
                    }
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "13px", fontWeight: 500, color: "#111827" }}>{svc.name}</div>
                      <div style={{ fontSize: "11px", color: "#9CA3AF" }}>{svc.uptime}% uptime · {svc.latency}ms avg</div>
                    </div>
                    {/* Mini uptime bar */}
                    <div style={{ width: "70px" }}>
                      <div style={{ height: "4px", background: "#F3F4F6", borderRadius: "99px", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${svc.uptime}%`, background: sc.color, borderRadius: "99px" }} />
                      </div>
                    </div>
                    <span style={{
                      fontSize: "10.5px", fontWeight: 700,
                      background: sc.bg, color: sc.color,
                      padding: "2px 9px", borderRadius: "99px", whiteSpace: "nowrap",
                    }}>{sc.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
