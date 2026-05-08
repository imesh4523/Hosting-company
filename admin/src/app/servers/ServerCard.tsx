"use client";
import { Server } from "./page";

const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

function UsageBar({ pct, label }: { pct: number; label: string }) {
  const color = pct >= 90 ? "#EF4444" : pct >= 75 ? "#F59E0B" : "#10B981";
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10.5px", color: "#9CA3AF", marginBottom: "3px" }}>
        <span>{label}</span>
        <span style={{ fontWeight: 700, color }}>{pct}%</span>
      </div>
      <div style={{ height: "5px", background: "#F3F4F6", borderRadius: "99px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: "99px", transition: "width 0.5s ease" }} />
      </div>
    </div>
  );
}

interface Props {
  server: Server;
  isSelected: boolean;
  onClick: () => void;
  onEdit: () => void;
  onDisable: () => void;
  onToggleMaintenance: () => void;
  onRefresh: () => void;
  showToast: (msg: string, ok?: boolean) => void;
}

export default function ServerCard({ server, isSelected, onClick, onEdit, onDisable, onToggleMaintenance, showToast }: Props) {
  const isWarning  = server.status === "warning";
  const isOffline  = server.status === "disabled" || server.status === "offline";
  const isMaint    = server.maintenanceMode;

  const ramPct  = server.liveStats ? Math.round((server.liveStats.usedMem  / server.liveStats.totalMem)  * 100) : 0;
  const cpuPct  = server.liveStats?.avgCpu ?? 0;
  const ramGB   = server.liveStats ? `${Math.round(server.liveStats.usedMem/1073741824)}GB / ${Math.round(server.liveStats.totalMem/1073741824)}GB` : "—";

  const statusBadge = isOffline
    ? { bg: "#F3F4F6", color: "#9CA3AF",  label: "OFFLINE",  dot: "#D1D5DB" }
    : isWarning
    ? { bg: "#FEF3C7", color: "#D97706",  label: "WARNING",  dot: "#F59E0B" }
    : isMaint
    ? { bg: "#FEF3C7", color: "#D97706",  label: "MAINT",    dot: "#F59E0B" }
    : { bg: "#D1FAE5", color: "#059669",  label: "ONLINE",   dot: "#10B981" };

  const handleVMAction = async (e: React.MouseEvent, action: string, vmId?: number) => {
    e.stopPropagation();
    try {
      await fetch(`${BACKEND}/api/admin/servers/${server.id}/${action}`, { method: "POST" });
      showToast(`${action} action sent to ${server.name}`);
    } catch {
      showToast("Action failed — backend offline", false);
    }
  };

  return (
    <div
      onClick={onClick}
      style={{
        background: "#fff", borderRadius: "14px",
        border: `2px solid ${isSelected ? "#5145FF" : isWarning ? "#FDE68A" : "#F0F0F0"}`,
        boxShadow: isSelected ? "0 0 0 4px rgba(81,69,255,0.08)" : "0 2px 12px rgba(0,0,0,0.04)",
        padding: "20px", cursor: "pointer",
        transition: "all 0.18s ease",
      }}
      onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.borderColor = "#C7D2FE"; }}
      onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.borderColor = isWarning ? "#FDE68A" : "#F0F0F0"; }}
    >
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: server.type === "proxmox" ? "#EEF0FF" : "#DBEAFE", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={server.type === "proxmox" ? "/icons/dedicated-2x.webp" : "/icons/vds-2x.webp"} alt={server.type} width={28} height={28} style={{ objectFit: "contain" }} />
          </div>
          <div>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}>{server.name}</div>
            <div style={{ fontSize: "11.5px", color: "#9CA3AF", marginTop: "1px" }}>
              {server.region} · {server.type === "proxmox" ? `Proxmox · ${server.node ?? "pve"}` : "DigitalOcean"}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "5px" }}>
          {/* Status badge */}
          <div style={{ display: "flex", alignItems: "center", gap: "5px", background: statusBadge.bg, padding: "3px 9px", borderRadius: "99px" }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: statusBadge.dot, animation: statusBadge.label === "ONLINE" ? "blink 2s ease infinite" : "none" }} />
            <span style={{ fontSize: "10px", fontWeight: 700, color: statusBadge.color }}>{statusBadge.label}</span>
          </div>
          {isMaint && (
            <span style={{ fontSize: "9px", background: "#FEF9C3", color: "#D97706", padding: "1px 7px", borderRadius: "99px", fontWeight: 700 }}>🔧 MAINTENANCE</span>
          )}
        </div>
      </div>

      {/* Resource bars */}
      {server.liveStats && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "14px" }}>
          <UsageBar pct={ramPct} label={`RAM ${ramGB}`} />
          <UsageBar pct={cpuPct} label={`CPU Load`} />
        </div>
      )}

      {/* Node pills */}
      {server.liveNodes && server.liveNodes.length > 0 && (
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "14px" }}>
          {server.liveNodes.map((n: any) => (
            <div key={n.node} style={{ display: "flex", alignItems: "center", gap: "5px", background: "#F9FAFB", border: "1px solid #F3F4F6", borderRadius: "7px", padding: "4px 9px" }}>
              <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: n.status === "online" ? "#10B981" : "#EF4444" }} />
              <span style={{ fontSize: "11px", color: "#374151", fontWeight: 500 }}>{n.node}</span>
              <span style={{ fontSize: "10px", color: "#9CA3AF" }}>{Math.round(n.cpu * 100)}%CPU</span>
            </div>
          ))}
        </div>
      )}

      {/* VPS count */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "14px" }}>
        <div style={{ flex: 1, background: "#F9FAFB", borderRadius: "8px", padding: "9px 12px", textAlign: "center" }}>
          <div style={{ fontSize: "10px", color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase" }}>VPS Instances</div>
          <div style={{ fontSize: "20px", fontWeight: 700, color: "#111827", marginTop: "2px" }}>{server._count.vms}</div>
        </div>
        <div style={{ flex: 1, background: "#F9FAFB", borderRadius: "8px", padding: "9px 12px", textAlign: "center" }}>
          <div style={{ fontSize: "10px", color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase" }}>Type</div>
          <div style={{ fontSize: "12px", fontWeight: 700, color: "#374151", marginTop: "2px" }}>{server.type === "proxmox" ? "Proxmox VE" : "DigitalOcean"}</div>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", gap: "6px", paddingTop: "12px", borderTop: "1px solid #F3F4F6" }} onClick={e => e.stopPropagation()}>
        <a href={`/servers/${server.id}/vps`} style={{ flex: 1, fontSize: "12px", fontWeight: 600, color: "#5145FF", background: "#EEF0FF", border: "none", borderRadius: "7px", padding: "7px", cursor: "pointer", textAlign: "center", textDecoration: "none" }}>
          View VPS
        </a>
        <button onClick={e => { e.stopPropagation(); onEdit(); }}
          style={{ flex: 1, fontSize: "12px", fontWeight: 600, color: "#374151", background: "#F3F4F6", border: "none", borderRadius: "7px", padding: "7px", cursor: "pointer" }}>
          Edit
        </button>
        <button onClick={e => { e.stopPropagation(); onToggleMaintenance(); }}
          style={{ flex: 1, fontSize: "12px", fontWeight: 600, color: isMaint ? "#059669" : "#D97706", background: isMaint ? "#D1FAE5" : "#FEF3C7", border: "none", borderRadius: "7px", padding: "7px", cursor: "pointer" }}>
          {isMaint ? "Live" : "Maint"}
        </button>
        <button onClick={e => { e.stopPropagation(); onDisable(); }}
          style={{ flex: 1, fontSize: "12px", fontWeight: 600, color: "#EF4444", background: "#FEE2E2", border: "none", borderRadius: "7px", padding: "7px", cursor: "pointer" }}>
          Disable
        </button>
      </div>
    </div>
  );
}
