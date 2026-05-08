"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { useParams } from "next/navigation";

const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

interface VM {
  vmid: number; name: string; status: string; type: string;
  mem: number; maxmem: number; cpu: number; uptime: number;
}

const MOCK_VMS: VM[] = [
  { vmid: 101, name: "vps-kamal",   status: "running", type: "lxc", mem: 2147483648, maxmem: 2147483648, cpu: 0.12, uptime: 864000 },
  { vmid: 102, name: "vps-nimal",   status: "running", type: "lxc", mem: 3758096384, maxmem: 4294967296, cpu: 0.45, uptime: 432000 },
  { vmid: 103, name: "vps-sunil",   status: "stopped",  type: "lxc", mem: 0, maxmem: 2147483648, cpu: 0, uptime: 0 },
  { vmid: 104, name: "vps-amal",    status: "running", type: "qemu", mem: 7516192768, maxmem: 8589934592, cpu: 0.28, uptime: 1296000 },
  { vmid: 105, name: "vps-ruwan",   status: "running", type: "lxc", mem: 1073741824, maxmem: 2147483648, cpu: 0.08, uptime: 259200 },
  { vmid: 106, name: "vps-chamara", status: "stopped",  type: "lxc", mem: 0, maxmem: 4294967296, cpu: 0, uptime: 0 },
];

function statusDot(s: string) {
  return s === "running" ? "#10B981" : s === "stopped" ? "#EF4444" : "#F59E0B";
}

export default function ServerVPSPage() {
  const params    = useParams();
  const serverId  = params?.id as string;
  const [vms,     setVMs]     = useState<VM[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [filter,  setFilter]  = useState("all");
  const [toast,   setToast]   = useState<{ msg: string; ok: boolean } | null>(null);
  const [actVmId, setActVmId] = useState<number | null>(null);

  const showToast = (msg: string, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3000); };

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${BACKEND}/api/admin/servers/${serverId}/vms`);
        if (r.ok) { const d = await r.json(); setVMs(d.vms ?? MOCK_VMS); }
        else setVMs(MOCK_VMS);
      } catch { setVMs(MOCK_VMS); }
      setLoading(false);
    })();
  }, [serverId]);

  const action = async (vmId: number, type: string, act: string) => {
    setActVmId(vmId);
    try {
      const r = await fetch(`${BACKEND}/api/admin/servers/${serverId}/vm/${vmId}/${act}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ node: "pve", type }),
      });
      if (r.ok) { showToast(`${act} sent to VM ${vmId}`); }
      else       { showToast(`Failed to ${act} VM ${vmId}`, false); }
    } catch { showToast("Backend offline", false); }
    setActVmId(null);
  };

  const filtered = vms
    .filter(v => !search || v.name.toLowerCase().includes(search.toLowerCase()) || String(v.vmid).includes(search))
    .filter(v => filter === "all" || v.status === filter);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F8F9FA" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: "28px 32px" }}>
        {toast && (
          <div style={{ position: "fixed", bottom: "24px", right: "24px", zIndex: 9999, background: toast.ok ? "#111827" : "#EF4444", color: "#fff", padding: "12px 20px", borderRadius: "10px", fontSize: "13px", fontWeight: 500, boxShadow: "0 8px 30px rgba(0,0,0,0.25)" }}>
            {toast.msg}
          </div>
        )}

        <div style={{ marginBottom: "22px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <a href="/servers" style={{ fontSize: "13px", color: "#9CA3AF", textDecoration: "none" }}>← Servers</a>
          </div>
          <h1 style={{ fontSize: "21px", fontWeight: 700, color: "#111827", letterSpacing: "-0.4px" }}>
            VPS Instances · {serverId}
          </h1>
          <p style={{ fontSize: "13px", color: "#9CA3AF", marginTop: "2px" }}>{vms.length} total instances on this server</p>
        </div>

        {/* Filter bar */}
        <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #F0F0F0", padding: "12px 16px", marginBottom: "18px", display: "flex", gap: "10px", alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <svg style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or VMID…" style={{ width: "100%", padding: "7px 10px 7px 30px", border: "1px solid #E5E7EB", borderRadius: "8px", fontSize: "13px", background: "#FAFAFA", outline: "none", boxSizing: "border-box" as const }} />
          </div>
          <select value={filter} onChange={e => setFilter(e.target.value)} style={{ padding: "7px 10px", border: "1px solid #E5E7EB", borderRadius: "8px", fontSize: "13px", background: "#FAFAFA", outline: "none" }}>
            <option value="all">All Status</option>
            <option value="running">Running</option>
            <option value="stopped">Stopped</option>
          </select>
          <span style={{ fontSize: "12px", color: "#9CA3AF", whiteSpace: "nowrap" }}>{filtered.length} of {vms.length}</span>
        </div>

        {/* VPS Table */}
        <div style={{ background: "#fff", borderRadius: "14px", border: "1px solid #F0F0F0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#FAFAFA" }}>
                {["VMID", "Hostname", "Type", "RAM", "CPU", "Uptime", "Status", "Actions"].map((h: string) => (
                  <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontSize: "10.5px", fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1,2,3,4].map((i: number) => (
                  <tr key={i} style={{ borderTop: "1px solid #F9FAFB" }}>
                    {[1,2,3,4,5,6,7,8].map((j: number) => (
                      <td key={j} style={{ padding: "14px 16px" }}>
                        <div style={{ height: "12px", background: "#F3F4F6", borderRadius: "6px", animation: "pulse 1.5s ease infinite" }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.map((vm: any, i: number) => {
                const ramPct  = vm.maxmem ? Math.round((vm.mem / vm.maxmem) * 100) : 0;
                const cpuPct  = Math.round(vm.cpu * 100);
                const uptimeH = vm.uptime ? `${Math.floor(vm.uptime / 3600)}h` : "—";
                const ramGB   = vm.maxmem ? `${Math.round(vm.mem / 1073741824)}/${Math.round(vm.maxmem / 1073741824)}GB` : "—";
                const isAct   = actVmId === vm.vmid;
                return (
                  <tr key={vm.vmid} style={{ borderTop: "1px solid #F9FAFB" }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#FAFAFA"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
                    <td style={{ padding: "13px 16px" }}>
                      <span style={{ fontSize: "13px", fontWeight: 700, color: "#111827", fontFamily: "monospace" }}>{vm.vmid}</span>
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <span style={{ fontSize: "13px", fontWeight: 500, color: "#111827" }}>{vm.name}</span>
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 700, background: vm.type === "lxc" ? "#DBEAFE" : "#EDE9FE", color: vm.type === "lxc" ? "#2563EB" : "#7C3AED", padding: "2px 8px", borderRadius: "99px" }}>
                        {vm.type.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <div style={{ fontSize: "12.5px", color: "#374151" }}>{ramGB}</div>
                      <div style={{ width: "60px", height: "3px", background: "#F3F4F6", borderRadius: "99px", marginTop: "4px" }}>
                        <div style={{ height: "100%", width: `${ramPct}%`, background: ramPct > 85 ? "#EF4444" : "#5145FF", borderRadius: "99px" }} />
                      </div>
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <span style={{ fontSize: "12.5px", color: cpuPct > 80 ? "#EF4444" : "#374151", fontWeight: cpuPct > 80 ? 700 : 400 }}>{cpuPct}%</span>
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <span style={{ fontSize: "12px", color: "#9CA3AF" }}>{uptimeH}</span>
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                        <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: statusDot(vm.status) }} />
                        <span style={{ fontSize: "12px", color: "#374151", fontWeight: 500 }}>{vm.status.charAt(0).toUpperCase() + vm.status.slice(1)}</span>
                      </div>
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <div style={{ display: "flex", gap: "5px" }}>
                        {vm.status === "running" ? (
                          <button onClick={() => action(vm.vmid, vm.type, "stop")}   disabled={isAct} style={{ fontSize: "11.5px", fontWeight: 600, color: "#EF4444", background: "#FEE2E2", border: "none", borderRadius: "6px", padding: "4px 10px", cursor: "pointer" }}>{isAct ? "…" : "Stop"}</button>
                        ) : (
                          <button onClick={() => action(vm.vmid, vm.type, "start")}  disabled={isAct} style={{ fontSize: "11.5px", fontWeight: 600, color: "#059669", background: "#D1FAE5", border: "none", borderRadius: "6px", padding: "4px 10px", cursor: "pointer" }}>{isAct ? "…" : "Start"}</button>
                        )}
                        <button onClick={() => action(vm.vmid, vm.type, "restart")} disabled={isAct} style={{ fontSize: "11.5px", fontWeight: 600, color: "#5145FF", background: "#EEF0FF", border: "none", borderRadius: "6px", padding: "4px 10px", cursor: "pointer" }}>↺</button>
                        <button style={{ fontSize: "11.5px", fontWeight: 600, color: "#374151", background: "#F3F4F6", border: "none", borderRadius: "6px", padding: "4px 10px", cursor: "pointer" }}>Console</button>
                        <button style={{ fontSize: "11.5px", fontWeight: 600, color: "#374151", background: "#F3F4F6", border: "none", borderRadius: "6px", padding: "4px 10px", cursor: "pointer" }}>Snapshot</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
      </main>
    </div>
  );
}
