"use client";
import { Server } from "./page";

const MOCK_USERS = [
  { id: "u1", name: "Kamal Perera",  vps: "vps-001", ram: "2GB", status: "running"  },
  { id: "u2", name: "Nimal Silva",   vps: "vps-002", ram: "4GB", status: "running"  },
  { id: "u3", name: "Sunil Fernando",vps: "vps-003", ram: "2GB", status: "stopped"  },
  { id: "u4", name: "Amal Jayawardena",vps:"vps-004",ram: "8GB", status: "suspended"},
];

function statDot(status: string) {
  return status === "running" ? "#10B981" : status === "stopped" ? "#EF4444" : "#F59E0B";
}

function UsageBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div style={{ height: "4px", background: "#F3F4F6", borderRadius: "99px", overflow: "hidden", marginTop: "3px" }}>
      <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: "99px" }} />
    </div>
  );
}

interface Props {
  server: Server;
  onClose: () => void;
  onEdit: () => void;
  showToast: (msg: string, ok?: boolean) => void;
}

export default function ServerDetailPanel({ server, onClose, onEdit, showToast }: Props) {
  const ramGB  = server.liveStats ? Math.round(server.liveStats.usedMem  / 1073741824) : 0;
  const maxRAM = server.liveStats ? Math.round(server.liveStats.totalMem / 1073741824) : 0;
  const ramPct = maxRAM ? Math.round((ramGB / maxRAM) * 100) : 0;
  const cpuPct = server.liveStats?.avgCpu ?? 0;
  const barColor = (pct: number) => pct >= 90 ? "#EF4444" : pct >= 75 ? "#F59E0B" : "#10B981";

  return (
    <>
      {/* Overlay */}
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.2)", zIndex: 999 }} />

      {/* Panel */}
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, width: "420px",
        background: "#fff", zIndex: 1000,
        boxShadow: "-8px 0 40px rgba(0,0,0,0.12)",
        overflowY: "auto", display: "flex", flexDirection: "column",
      }}>
        {/* Header */}
        <div style={{ padding: "20px 22px", borderBottom: "1px solid #F3F4F6", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: "16px", fontWeight: 700, color: "#111827" }}>{server.name}</div>
            <div style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "2px" }}>
              {server.region} · {server.type === "proxmox" ? `Proxmox · ${server.apiUrl}` : "DigitalOcean"}
            </div>
          </div>
          <button onClick={onClose} style={{ background: "#F3F4F6", border: "none", borderRadius: "8px", width: "30px", height: "30px", cursor: "pointer", fontSize: "16px", color: "#6B7280" }}>×</button>
        </div>

        <div style={{ padding: "20px 22px", flex: 1 }}>
          {/* Resources */}
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.06em", marginBottom: "10px" }}>RESOURCES</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px" }}>
                  <span style={{ color: "#374151" }}>RAM</span>
                  <span style={{ fontWeight: 600, color: barColor(ramPct) }}>{ramGB}GB / {maxRAM}GB · {ramPct}%</span>
                </div>
                <UsageBar pct={ramPct} color={barColor(ramPct)} />
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px" }}>
                  <span style={{ color: "#374151" }}>CPU</span>
                  <span style={{ fontWeight: 600, color: barColor(cpuPct) }}>{cpuPct}%</span>
                </div>
                <UsageBar pct={cpuPct} color={barColor(cpuPct)} />
              </div>
              <div style={{ display: "flex", gap: "8px", fontSize: "12px", color: "#374151", marginTop: "4px" }}>
                <span>↑ 1.2GB/s</span>
                <span>↓ 890MB/s</span>
              </div>
            </div>
          </div>

          {/* VPS summary */}
          <div style={{ background: "#F9FAFB", borderRadius: "10px", padding: "14px", marginBottom: "20px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.06em", marginBottom: "10px" }}>VPS INSTANCES: {server._count.vps}</div>
            <div style={{ display: "flex", gap: "12px" }}>
              {[
                { label: "Running",   count: Math.round(server._count.vps * 0.9), dot: "#10B981" },
                { label: "Stopped",   count: Math.round(server._count.vps * 0.07), dot: "#EF4444" },
                { label: "Suspended", count: Math.round(server._count.vps * 0.03), dot: "#F59E0B" },
              ].map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: s.dot }} />
                  <span style={{ fontSize: "12px", color: "#374151" }}>{s.count} {s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Nodes */}
          {server.liveNodes && server.liveNodes.length > 0 && (
            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.06em", marginBottom: "10px" }}>PROXMOX NODES</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {server.liveNodes.map((node: any) => {
                  const nCpu = Math.round(node.cpu * 100);
                  const nRam = Math.round(node.mem / 1073741824);
                  const nMaxRam = Math.round(node.maxmem / 1073741824);
                  return (
                    <div key={node.node} style={{ background: "#F9FAFB", border: "1px solid #F3F4F6", borderRadius: "10px", padding: "12px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                          <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: node.status === "online" ? "#10B981" : "#EF4444" }} />
                          <span style={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>{node.node}</span>
                        </div>
                        <span style={{ fontSize: "11px", color: "#9CA3AF" }}>CPU: {nCpu}%</span>
                      </div>
                      <UsageBar pct={nCpu} color={barColor(nCpu)} />
                      <div style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "6px" }}>RAM: {nRam}GB / {nMaxRam}GB</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Users on this server */}
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.06em", marginBottom: "10px" }}>USERS ON THIS SERVER</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1px", background: "#F3F4F6", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "8px", padding: "8px 12px", background: "#FAFAFA", fontSize: "10px", fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.04em" }}>
                <span>USER</span><span>VPS</span><span>RAM</span><span>STATUS</span>
              </div>
              {MOCK_USERS.map((u, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "8px", padding: "10px 12px", background: "#fff", fontSize: "12.5px", alignItems: "center" }}>
                  <a href={`/customers/${u.id}`} style={{ color: "#5145FF", fontWeight: 500, textDecoration: "none" }}>{u.name}</a>
                  <a href={`/vps/${u.vps}`} style={{ color: "#374151", textDecoration: "none", fontFamily: "monospace", fontSize: "11px" }}>{u.vps}</a>
                  <span style={{ color: "#6B7280" }}>{u.ram}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: statDot(u.status) }} />
                    <span style={{ color: "#374151", fontSize: "11px" }}>{u.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div style={{ padding: "16px 22px", borderTop: "1px solid #F3F4F6", display: "flex", gap: "8px" }}>
          <a href={`/servers/${server.id}/vps`} style={{ flex: 1, textAlign: "center", fontSize: "13px", fontWeight: 600, color: "#fff", background: "#5145FF", borderRadius: "8px", padding: "9px", textDecoration: "none" }}>View All VPS</a>
          <button onClick={onEdit} style={{ flex: 1, fontSize: "13px", fontWeight: 600, color: "#374151", background: "#F3F4F6", border: "none", borderRadius: "8px", padding: "9px", cursor: "pointer" }}>Edit Server</button>
        </div>
      </div>
    </>
  );
}
