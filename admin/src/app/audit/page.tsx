import Sidebar from "@/components/Sidebar";

const auditLogs = [
  { id: "1", admin: "Admin",     action: "BANNED_USER",       target: "user#882",        detail: "Fraud score 87 — auto-ban triggered",          ts: "2026-04-28T07:45:00Z", severity: "critical" },
  { id: "2", admin: "Admin",     action: "RESTORED_BACKUP",   target: "user#744/vps-3",  detail: "Restored backup 2026-04-27 to same VPS",        ts: "2026-04-28T07:12:00Z", severity: "info" },
  { id: "3", admin: "Admin",     action: "TRIGGERED_FAILOVER",target: "droplet-us-3",    detail: "Manual failover → server sgp2",                  ts: "2026-04-28T06:58:00Z", severity: "warning" },
  { id: "4", admin: "Admin",     action: "PLAN_UPDATED",      target: "plan#pro",        detail: "Pro plan price changed $20 → $22",               ts: "2026-04-28T06:30:00Z", severity: "info" },
  { id: "5", admin: "Admin",     action: "SERVER_ADDED",      target: "sgp3-proxmox",    detail: "New Proxmox node added — 128GB RAM",             ts: "2026-04-28T05:55:00Z", severity: "info" },
  { id: "6", admin: "Admin",     action: "USER_UNBANNED",     target: "user#619",        detail: "Manual review — false positive, unbanned",       ts: "2026-04-28T04:20:00Z", severity: "warning" },
  { id: "7", admin: "Admin",     action: "BACKUP_TRIGGERED",  target: "all_users",       detail: "Manual all-user backup run initiated",           ts: "2026-04-28T03:00:00Z", severity: "info" },
  { id: "8", admin: "Admin",     action: "MAINTENANCE_ON",    target: "system",          detail: "Maintenance mode enabled — 10 min window",       ts: "2026-04-28T02:30:00Z", severity: "warning" },
  { id: "9", admin: "Admin",     action: "MAINTENANCE_OFF",   target: "system",          detail: "Maintenance mode disabled",                      ts: "2026-04-28T02:42:00Z", severity: "info" },
  { id: "10", admin: "Admin",    action: "TICKET_CLOSED",     target: "#TK-1040",        detail: "Support ticket resolved — billing issue",        ts: "2026-04-27T23:15:00Z", severity: "info" },
  { id: "11", admin: "Admin",    action: "VPS_STOPPED",       target: "droplet-eu-4",    detail: "Force stopped — customer requested termination", ts: "2026-04-27T22:05:00Z", severity: "warning" },
  { id: "12", admin: "Admin",    action: "INVOICE_CREATED",   target: "user#512",        detail: "Manual invoice $40 — Business plan renewal",     ts: "2026-04-27T20:00:00Z", severity: "info" },
];

const actionConfig: Record<string, { color: string; bg: string }> = {
  BANNED_USER:        { color: "#DC2626", bg: "#FEE2E2" },
  USER_UNBANNED:      { color: "#059669", bg: "#D1FAE5" },
  TRIGGERED_FAILOVER: { color: "#F59E0B", bg: "#FEF3C7" },
  MAINTENANCE_ON:     { color: "#D97706", bg: "#FEF9C3" },
  MAINTENANCE_OFF:    { color: "#059669", bg: "#D1FAE5" },
  VPS_STOPPED:        { color: "#D97706", bg: "#FEF3C7" },
  RESTORED_BACKUP:    { color: "#5145FF", bg: "#EEF0FF" },
  PLAN_UPDATED:       { color: "#8B5CF6", bg: "#EDE9FE" },
  SERVER_ADDED:       { color: "#14B8A6", bg: "#CCFBF1" },
  BACKUP_TRIGGERED:   { color: "#3B82F6", bg: "#DBEAFE" },
  TICKET_CLOSED:      { color: "#10B981", bg: "#D1FAE5" },
  INVOICE_CREATED:    { color: "#8B5CF6", bg: "#EDE9FE" },
};

function fmt(iso: string) {
  return new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function AuditPage() {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F8F9FA" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: "28px 32px" }}>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "26px" }}>
          <div>
            <h1 style={{ fontSize: "21px", fontWeight: 700, color: "#111827", letterSpacing: "-0.4px" }}>
              Audit Log
            </h1>
            <p style={{ fontSize: "13.5px", color: "#6B7280", marginTop: "3px" }}>
              Complete record of every admin action. Tamper-proof.
            </p>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button style={{ fontSize: "12.5px", fontWeight: 600, color: "#6B7280", background: "#fff", border: "1px solid #E5E7EB", borderRadius: "8px", padding: "7px 14px", cursor: "pointer" }}>
              Export CSV
            </button>
          </div>
        </div>

        {/* Summary bar */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "14px", marginBottom: "22px" }}>
          {[
            { label: "Total Actions (24h)", value: auditLogs.length, color: "#5145FF", bg: "#EEF0FF" },
            { label: "Critical Actions",   value: auditLogs.filter(l => l.severity === "critical").length, color: "#DC2626", bg: "#FEE2E2" },
            { label: "User Bans",          value: auditLogs.filter(l => l.action === "BANNED_USER").length, color: "#F59E0B", bg: "#FEF3C7" },
            { label: "Failovers",          value: auditLogs.filter(l => l.action === "TRIGGERED_FAILOVER").length, color: "#8B5CF6", bg: "#EDE9FE" },
          ].map((s, i) => (
            <div key={i} style={{ background: "#fff", borderRadius: "14px", border: "1px solid #F0F0F0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", padding: "16px 18px" }}>
              <div style={{ fontSize: "11.5px", color: "#9CA3AF", fontWeight: 500, marginBottom: "4px" }}>{s.label}</div>
              <div style={{ fontSize: "26px", fontWeight: 700, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Log table */}
        <div style={{ background: "#fff", borderRadius: "14px", border: "1px solid #F0F0F0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", overflow: "hidden" }}>
          <div style={{ padding: "16px 22px", borderBottom: "1px solid #F3F4F6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>Action History</div>
            <div style={{ fontSize: "12px", color: "#9CA3AF" }}>Last 24 hours · {auditLogs.length} entries</div>
          </div>

          {auditLogs.map((log, i) => {
            const ac = actionConfig[log.action] ?? { color: "#6B7280", bg: "#F3F4F6" };
            return (
              <div key={log.id} style={{
                display: "flex", alignItems: "flex-start", gap: "14px",
                padding: "14px 22px",
                borderBottom: i < auditLogs.length - 1 ? "1px solid #F9FAFB" : "none",
              }}>
                {/* Timeline dot */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "4px" }}>
                  <div style={{ width: "9px", height: "9px", borderRadius: "50%", background: ac.color, flexShrink: 0 }} />
                  {i < auditLogs.length - 1 && <div style={{ width: "1px", flex: 1, background: "#F3F4F6", marginTop: "4px" }} />}
                </div>

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", flexWrap: "wrap" }}>
                    <span style={{
                      fontSize: "10.5px", fontWeight: 700,
                      background: ac.bg, color: ac.color,
                      padding: "1px 8px", borderRadius: "99px",
                      letterSpacing: "0.04em",
                    }}>{log.action.replace(/_/g, " ")}</span>
                    <span style={{ fontSize: "11.5px", fontFamily: "monospace", color: "#9CA3AF" }}>{log.target}</span>
                  </div>
                  <div style={{ fontSize: "13px", color: "#374151", marginBottom: "3px" }}>{log.detail}</div>
                  <div style={{ display: "flex", gap: "12px", fontSize: "11px", color: "#9CA3AF" }}>
                    <span>By: <strong style={{ color: "#6B7280" }}>{log.admin}</strong></span>
                    <span>{fmt(log.ts)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
