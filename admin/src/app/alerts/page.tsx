import Sidebar from "@/components/Sidebar";

// ─── Mock data — replace with real API calls ─────────────────────────────────
const mockAlerts = [
  { id: "1", type: "vps_down",      sev: "critical", msg: "VPS droplet-sg-1 is unreachable (5 min)",         ts: "2026-04-28T07:12:00Z", resolved: false },
  { id: "2", type: "server_health", sev: "warning",  msg: "Server sgp1 RAM usage at 89% — threshold exceeded", ts: "2026-04-28T06:58:00Z", resolved: false },
  { id: "3", type: "fraud",         sev: "critical", msg: "Fraud score 87 detected — user#882 auto-banned",   ts: "2026-04-28T06:45:00Z", resolved: true  },
  { id: "4", type: "failover",      sev: "info",     msg: "Auto-failover triggered for droplet-us-3 → sgp2",  ts: "2026-04-28T06:30:00Z", resolved: true  },
  { id: "5", type: "backup_fail",   sev: "warning",  msg: "Backup failed for user#744: B2 upload timeout",    ts: "2026-04-28T05:15:00Z", resolved: false },
  { id: "6", type: "vps_down",      sev: "critical", msg: "VPS droplet-eu-2 unreachable (2 min)",             ts: "2026-04-28T04:55:00Z", resolved: true  },
  { id: "7", type: "server_health", sev: "critical", msg: "Server ams3 CPU at 96% — auto-scaling triggered",  ts: "2026-04-28T03:40:00Z", resolved: true  },
  { id: "8", type: "backup_fail",   sev: "warning",  msg: "Weekly backup skipped — quota exceeded (B2)",      ts: "2026-04-28T02:00:00Z", resolved: false },
];

const sevConfig: Record<string, { bg: string; color: string; border: string; dot: string }> = {
  critical: { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA", dot: "#EF4444" },
  warning:  { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A", dot: "#F59E0B" },
  info:     { bg: "#EFF6FF", color: "#2563EB", border: "#BFDBFE", dot: "#3B82F6" },
};

const typeIcon: Record<string, string> = {
  vps_down:      "/icons/vds-2x.webp",
  server_health: "/icons/dedicated-2x.webp",
  fraud:         "/icons/shared-2x.webp",
  failover:      "/icons/transfer-2x.webp",
  backup_fail:   "/icons/vps-2x.webp",
};

const typeLabel: Record<string, string> = {
  vps_down:      "VPS Down",
  server_health: "Server Health",
  fraud:         "Fraud Detected",
  failover:      "Failover",
  backup_fail:   "Backup Failed",
};

function fmt(iso: string) {
  return new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function AlertsPage() {
  const unresolved = mockAlerts.filter(a => !a.resolved).length;
  const critical   = mockAlerts.filter(a => a.sev === "critical" && !a.resolved).length;

  const stats = [
    { label: "Active Alerts",    value: unresolved, color: "#EF4444", bg: "#FEE2E2", icon: "/icons/vds-2x.webp" },
    { label: "Critical",         value: critical,   color: "#DC2626", bg: "#FEF2F2", icon: "/icons/dedicated-2x.webp" },
    { label: "Warnings",         value: mockAlerts.filter(a => a.sev === "warning" && !a.resolved).length, color: "#F59E0B", bg: "#FEF3C7", icon: "/icons/transfer-2x.webp" },
    { label: "Resolved (24h)",   value: mockAlerts.filter(a => a.resolved).length, color: "#10B981", bg: "#D1FAE5", icon: "/icons/ssl-2x.webp" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F8F9FA" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: "28px 32px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "26px" }}>
          <div>
            <h1 style={{ fontSize: "21px", fontWeight: 700, color: "#111827", letterSpacing: "-0.4px" }}>
              System Alerts
            </h1>
            <p style={{ fontSize: "13.5px", color: "#6B7280", marginTop: "3px" }}>
              Real-time infrastructure and security event notifications.
            </p>
          </div>
          {unresolved > 0 && (
            <div style={{
              display: "flex", alignItems: "center", gap: "7px",
              background: "#FEF2F2", border: "1px solid #FECACA",
              padding: "6px 16px", borderRadius: "99px",
            }}>
              <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#EF4444" }} />
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#DC2626" }}>
                {unresolved} ACTIVE ALERT{unresolved > 1 ? "S" : ""}
              </span>
            </div>
          )}
        </div>

        {/* Stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "14px", marginBottom: "22px" }}>
          {stats.map((s, i) => (
            <div key={i} style={{ background: "#fff", borderRadius: "14px", border: "1px solid #F0F0F0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", padding: "18px", display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{ width: "46px", height: "46px", borderRadius: "10px", background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.icon} alt={s.label} width={32} height={32} style={{ objectFit: "contain" }} />
              </div>
              <div>
                <div style={{ fontSize: "11.5px", color: "#9CA3AF", fontWeight: 500 }}>{s.label}</div>
                <div style={{ fontSize: "26px", fontWeight: 700, color: s.color, lineHeight: 1.1 }}>{s.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Alert list */}
        <div style={{ background: "#fff", borderRadius: "14px", border: "1px solid #F0F0F0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", overflow: "hidden" }}>
          <div style={{ padding: "18px 22px", borderBottom: "1px solid #F3F4F6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>All Alerts</div>
            <button style={{ fontSize: "12.5px", color: "#5145FF", fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>
              Mark all resolved
            </button>
          </div>

          {mockAlerts.map((alert, i) => {
            const sc = sevConfig[alert.sev];
            return (
              <div key={alert.id} style={{
                display: "flex", alignItems: "flex-start", gap: "14px",
                padding: "16px 22px",
                borderBottom: i < mockAlerts.length - 1 ? "1px solid #F9FAFB" : "none",
                background: alert.resolved ? "transparent" : "rgba(254,242,242,0.3)",
              }}>
                {/* Icon */}
                <div style={{ width: "36px", height: "36px", borderRadius: "9px", background: sc.bg, border: `1px solid ${sc.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "2px" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={typeIcon[alert.type]} alt={alert.type} width={22} height={22} style={{ objectFit: "contain" }} />
                </div>

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 700, background: sc.bg, color: sc.color, padding: "1px 8px", borderRadius: "99px", border: `1px solid ${sc.border}` }}>
                      {alert.sev.toUpperCase()}
                    </span>
                    <span style={{ fontSize: "11.5px", color: "#9CA3AF" }}>{typeLabel[alert.type]}</span>
                    {alert.resolved && (
                      <span style={{ fontSize: "10.5px", fontWeight: 600, background: "#D1FAE5", color: "#059669", padding: "1px 7px", borderRadius: "99px" }}>
                        RESOLVED
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: "13.5px", color: "#111827", fontWeight: 500, marginBottom: "3px" }}>{alert.msg}</div>
                  <div style={{ fontSize: "11.5px", color: "#9CA3AF" }}>{fmt(alert.ts)}</div>
                </div>

                {/* Actions */}
                {!alert.resolved && (
                  <div style={{ display: "flex", gap: "7px", flexShrink: 0 }}>
                    <button style={{ fontSize: "12px", fontWeight: 600, color: "#5145FF", background: "#EEF0FF", border: "none", borderRadius: "7px", padding: "5px 12px", cursor: "pointer" }}>
                      Investigate
                    </button>
                    <button style={{ fontSize: "12px", fontWeight: 600, color: "#6B7280", background: "#F3F4F6", border: "none", borderRadius: "7px", padding: "5px 12px", cursor: "pointer" }}>
                      Resolve
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
