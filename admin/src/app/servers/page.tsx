"use client";
import { useState, useEffect, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import ServerCard from "./ServerCard";
import ServerDetailPanel from "./ServerDetailPanel";
import EditServerModal from "./EditServerModal";
import DisableServerModal from "./DisableServerModal";
import AddServerModal from "./AddServerModal";

export interface Server {
  id: string; name: string; type: "proxmox" | "digitalocean";
  apiUrl: string; apiUser?: string; region?: string; node?: string;
  maxVMs?: number; notes?: string; status: string; maintenanceMode?: boolean;
  _count: { vms: number };
  liveNodes?: { node: string; status: string; cpu: number; mem: number; maxmem: number; disk: number; maxdisk: number; uptime: number }[];
  liveStats?: { totalMem: number; usedMem: number; avgCpu: number } | null;
}

const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export default function ServersPage() {
  const [servers,       setServers]       = useState<Server[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [selected,      setSelected]      = useState<Server | null>(null);
  const [editing,       setEditing]       = useState<Server | null>(null);
  const [disabling,     setDisabling]     = useState<Server | null>(null);
  const [showAdd,       setShowAdd]       = useState(false);
  const [search,        setSearch]        = useState("");
  const [filterType,    setFilterType]    = useState("all");
  const [filterStatus,  setFilterStatus]  = useState("all");
  const [filterRegion,  setFilterRegion]  = useState("all");
  const [sortBy,        setSortBy]        = useState("name");
  const [lastUpdated,   setLastUpdated]   = useState("");
  const [toast,         setToast]         = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchServers = useCallback(async () => {
    try {
      const r = await fetch(`${BACKEND}/api/admin/servers`);
      if (r.ok) {
        const d = await r.json();
        setServers(d.servers ?? []);
        setLastUpdated(new Date().toLocaleTimeString());
      }
    } catch { /* backend offline — keep mock data */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchServers();
    const id = setInterval(fetchServers, 10000); // poll every 10s
    return () => clearInterval(id);
  }, [fetchServers]);

  // Use mock data when backend is offline
  useEffect(() => {
    if (!loading && servers.length === 0) {
      setServers([
        { id: "s1", name: "SGP1-Proxmox",  type: "proxmox",      apiUrl: "https://10.12.0.1:8006", region: "Singapore", status: "active",  maintenanceMode: false, _count: { vps: 31 }, liveNodes: [{ node: "pve-node-1", status: "online", cpu: 0.38, mem: 34359738368, maxmem: 68719476736, disk: 0, maxdisk: 0, uptime: 86400 }, { node: "pve-node-2", status: "online", cpu: 0.52, mem: 49392123904, maxmem: 68719476736, disk: 0, maxdisk: 0, uptime: 82000 }], liveStats: { totalMem: 137438953472, usedMem: 83751862272, avgCpu: 45 } },
        { id: "s2", name: "US-DO-Primary", type: "digitalocean",  apiUrl: "https://api.digitalocean.com", region: "New York", status: "active",  maintenanceMode: false, _count: { vps: 24 }, liveStats: null },
        { id: "s3", name: "EU-AMS3",       type: "proxmox",      apiUrl: "https://10.20.0.1:8006", region: "Amsterdam", status: "warning", maintenanceMode: false, _count: { vps: 18 }, liveStats: { totalMem: 68719476736, usedMem: 66571993088, avgCpu: 94 } },
        { id: "s4", name: "SGP2-Backup",   type: "proxmox",      apiUrl: "https://10.12.0.2:8006", region: "Singapore", status: "active",  maintenanceMode: true,  _count: { vps: 5  }, liveStats: { totalMem: 68719476736, usedMem: 12884901888, avgCpu: 18 } },
      ]);
    }
  }, [loading, servers.length]);

  // ─── Filter + Sort ─────────────────────────────────────────────────────────
  const regions   = [...new Set(servers.map((s: any) => s.region).filter(Boolean))] as string[];
  const filtered  = servers
    .filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()) || (s.region ?? "").toLowerCase().includes(search.toLowerCase()))
    .filter(s => filterType   === "all" || s.type   === filterType)
    .filter(s => filterStatus === "all" || s.status === filterStatus)
    .filter(s => filterRegion === "all" || s.region === filterRegion)
    .sort((a, b) => {
      if (sortBy === "ram")      return (b.liveStats?.usedMem ?? 0) - (a.liveStats?.usedMem ?? 0);
      if (sortBy === "cpu")      return (b.liveStats?.avgCpu  ?? 0) - (a.liveStats?.avgCpu  ?? 0);
      if (sortBy === "vpsCount") return b._count.vms - a._count.vms;
      return a.name.localeCompare(b.name);
    });

  // ─── Maintenance toggle ────────────────────────────────────────────────────
  const toggleMaintenance = async (s: Server) => {
    const enabled = !s.maintenanceMode;
    try {
      await fetch(`${BACKEND}/api/admin/servers/${s.id}/maintenance`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });
    } catch {}
    setServers(prev => prev.map((x: any) => x.id === s.id ? { ...x, maintenanceMode: enabled } : x));
    showToast(`Maintenance mode ${enabled ? "enabled" : "disabled"} for ${s.name}`);
  };

  // ─── Stats Summary ─────────────────────────────────────────────────────────
  const totalRAM_GB  = Math.round(servers.reduce((a, s) => a + (s.liveStats?.totalMem ?? 0), 0) / 1073741824);
  const usedRAM_GB   = Math.round(servers.reduce((a, s) => a + (s.liveStats?.usedMem  ?? 0), 0) / 1073741824);
  const avgCPU       = servers.filter(s => s.liveStats).length
    ? Math.round(servers.reduce((a, s) => a + (s.liveStats?.avgCpu ?? 0), 0) / servers.filter(s => s.liveStats).length)
    : 0;
  const warnings     = servers.filter(s => s.status === "warning").length;

  const summaryCards = [
    { label: "Total Nodes",   value: servers.length,                        color: "#5145FF" },
    { label: "Online",        value: servers.filter(s => s.status !== "disabled" && s.status !== "offline").length, color: "#10B981" },
    { label: "Total VPS",     value: servers.reduce((a, s) => a + s._count.vms, 0), color: "#8B5CF6" },
    { label: "Total RAM",     value: `${totalRAM_GB}GB`,                   color: "#3B82F6" },
    { label: "Avg CPU",       value: `${avgCPU}%`,                         color: avgCPU > 80 ? "#EF4444" : "#F59E0B" },
    { label: "Warnings",      value: warnings,                              color: warnings > 0 ? "#EF4444" : "#9CA3AF" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F8F9FA" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: "28px 32px", overflowY: "auto" }}>

        {/* Toast */}
        {toast && (
          <div style={{
            position: "fixed", bottom: "24px", right: "24px", zIndex: 9999,
            background: toast.ok ? "#111827" : "#EF4444", color: "#fff",
            padding: "12px 20px", borderRadius: "10px", fontSize: "13px", fontWeight: 500,
            boxShadow: "0 8px 30px rgba(0,0,0,0.25)",
            animation: "slideUp 0.3s ease",
          }}>{toast.msg}</div>
        )}

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "22px" }}>
          <div>
            <h1 style={{ fontSize: "21px", fontWeight: 700, color: "#111827", letterSpacing: "-0.4px" }}>Server Manager</h1>
            <p style={{ fontSize: "13px", color: "#9CA3AF", marginTop: "2px" }}>
              {lastUpdated ? `Last updated: ${lastUpdated}` : "Loading live data…"}
            </p>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={fetchServers} style={{ fontSize: "12.5px", fontWeight: 600, color: "#6B7280", background: "#fff", border: "1px solid #E5E7EB", borderRadius: "8px", padding: "7px 14px", cursor: "pointer" }}>
              ↻ Refresh
            </button>
            <button onClick={() => setShowAdd(true)} style={{ display: "flex", alignItems: "center", gap: "6px", background: "#5145FF", color: "#fff", border: "none", borderRadius: "9px", padding: "9px 18px", fontSize: "13.5px", fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 14px rgba(81,69,255,0.35)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
              Add Server
            </button>
          </div>
        </div>

        {/* Summary cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: "12px", marginBottom: "20px" }}>
          {summaryCards.map((s: any, i: number) => (
            <div key={i} style={{ background: "#fff", borderRadius: "12px", border: "1px solid #F0F0F0", boxShadow: "0 1px 6px rgba(0,0,0,0.04)", padding: "14px 16px" }}>
              <div style={{ fontSize: "11px", color: "#9CA3AF", fontWeight: 600, marginBottom: "4px", textTransform: "uppercase" }}>{s.label}</div>
              <div style={{ fontSize: "22px", fontWeight: 700, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Filter bar */}
        <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #F0F0F0", padding: "14px 18px", marginBottom: "20px", display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: "1 1 200px" }}>
            <svg style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search servers…" style={{ width: "100%", padding: "7px 10px 7px 32px", border: "1px solid #E5E7EB", borderRadius: "8px", fontSize: "13px", background: "#FAFAFA", outline: "none", boxSizing: "border-box" }} />
          </div>
          {[
            { label: "Type",   val: filterType,   set: setFilterType,   opts: [["all","All Types"],["proxmox","Proxmox"],["digitalocean","DigitalOcean"]] },
            { label: "Status", val: filterStatus,  set: setFilterStatus,  opts: [["all","All Status"],["active","Online"],["warning","Warning"],["disabled","Offline"]] },
            { label: "Region", val: filterRegion,  set: setFilterRegion,  opts: [["all","All Regions"], ...regions.map((r: string) => [r,r])] },
            { label: "Sort",   val: sortBy,        set: setSortBy,        opts: [["name","Name"],["ram","RAM Usage"],["cpu","CPU"],["vpsCount","VPS Count"]] },
          ].map((f: any) => (
            <select key={f.label} value={f.val} onChange={e => f.set(e.target.value)} style={{ padding: "7px 10px", border: "1px solid #E5E7EB", borderRadius: "8px", fontSize: "13px", background: "#FAFAFA", color: "#374151", cursor: "pointer", outline: "none" }}>
              {f.opts.map(([v,l]: any) => <option key={v} value={v}>{l}</option>)}
            </select>
          ))}
          {(search || filterType !== "all" || filterStatus !== "all" || filterRegion !== "all") && (
            <button onClick={() => { setSearch(""); setFilterType("all"); setFilterStatus("all"); setFilterRegion("all"); }} style={{ fontSize: "12px", color: "#9CA3AF", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
              Clear all
            </button>
          )}
          <span style={{ fontSize: "12px", color: "#9CA3AF", marginLeft: "auto", whiteSpace: "nowrap" }}>
            Showing {filtered.length} of {servers.length} servers
          </span>
        </div>

        {/* Server grid */}
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
            {[1,2,3,4].map((i: number) => (
              <div key={i} style={{ background: "#fff", borderRadius: "14px", border: "1px solid #F0F0F0", height: "220px", animation: "pulse 1.5s ease infinite" }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px", background: "#fff", borderRadius: "14px", border: "1px solid #F0F0F0" }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>🖥️</div>
            <div style={{ fontSize: "15px", fontWeight: 600, color: "#374151" }}>No servers match your filters</div>
            <div style={{ fontSize: "13px", color: "#9CA3AF", marginTop: "4px" }}>Try adjusting your search or filter criteria</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
            {filtered.map((server: any) => (
              <ServerCard
                key={server.id}
                server={server}
                isSelected={selected?.id === server.id}
                onClick={() => setSelected(selected?.id === server.id ? null : server)}
                onEdit={() => setEditing(server)}
                onDisable={() => setDisabling(server)}
                onToggleMaintenance={() => toggleMaintenance(server)}
                onRefresh={fetchServers}
                showToast={showToast}
              />
            ))}
            {/* Add server card */}
            <button onClick={() => setShowAdd(true)} style={{ background: "#FAFAFA", borderRadius: "14px", border: "2px dashed #E5E7EB", padding: "40px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "10px", cursor: "pointer", transition: "border-color 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "#5145FF")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "#E5E7EB")}>
              <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "#EEF0FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5145FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "14px", fontWeight: 600, color: "#374151" }}>Add New Server</div>
                <div style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "2px" }}>Proxmox node or DigitalOcean</div>
              </div>
            </button>
          </div>
        )}

        {/* Detail side panel */}
        {selected && (
          <ServerDetailPanel
            server={selected}
            onClose={() => setSelected(null)}
            onEdit={() => setEditing(selected)}
            showToast={showToast}
          />
        )}

        {/* Modals */}
        {editing   && <EditServerModal   server={editing}   onClose={() => setEditing(null)}   onSave={fetchServers} showToast={showToast} />}
        {disabling && <DisableServerModal server={disabling} onClose={() => setDisabling(null)} onConfirm={fetchServers} servers={servers} showToast={showToast} />}
        {showAdd   && <AddServerModal                        onClose={() => setShowAdd(false)}  onSave={fetchServers} showToast={showToast} />}
      </main>

      <style>{`
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:.5} }
        @keyframes slideUp{ from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes blink  { 0%,100%{opacity:1} 50%{opacity:.4} }
      `}</style>
    </div>
  );
}
