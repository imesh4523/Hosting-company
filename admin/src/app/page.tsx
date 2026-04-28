import Sidebar from "@/components/Sidebar";
import { prisma } from "@/lib/prisma";

async function getDashboardMetrics() {
  try {
    const [totalUsers, activeVPS, openTickets, totalRevenue, recoveryLogs] = await Promise.all([
      prisma.user.count({ where: { role: "customer" } }),
      prisma.vPS.count({ where: { status: "active" } }),
      prisma.supportTicket.count({ where: { status: "open" } }),
      prisma.transaction.aggregate({ where: { status: "success" }, _sum: { amount: true } }),
      prisma.recoveryLog.count({ where: { status: "success" } }),
    ]);
    return { totalUsers, activeVPS, openTickets, totalRevenue: totalRevenue._sum.amount ?? 0, recoveryLogs };
  } catch {
    return { totalUsers: 0, activeVPS: 0, openTickets: 0, totalRevenue: 0, recoveryLogs: 0 };
  }
}

// ─── Smart icon: SVGs have built-in rx=8 background → show at full 36px
//                WEBPs are artwork only → wrap in a styled container ──────────
function FIcon({ src, alt }: { src: string; alt: string }) {
  const isSvg = src.endsWith(".svg");

  if (isSvg) {
    // SVG already has its own white/light rounded background built in
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        width={44}
        height={44}
        style={{ display: "block", flexShrink: 0 }}
      />
    );
  }

  // WEBP — artwork only, needs a container
  return (
    <div style={{
      width: "44px",
      height: "44px",
      borderRadius: "10px",
      background: "rgba(69,123,255,0.06)",
      border: "1px solid rgba(0,0,0,0.04)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      overflow: "hidden",
    }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} width={38} height={38} style={{ objectFit: "contain" }} />
    </div>
  );
}

export default async function Dashboard() {
  const metrics = await getDashboardMetrics();

  const statCards = [
    {
      label: "Monthly Revenue",
      value: `$${metrics.totalRevenue.toLocaleString("en-US", { maximumFractionDigits: 0 })}`,
      icon: <FIcon src="/icons/wordpress-2x.webp" alt="Revenue" />,
      trend: "+12.5%",
      trendUp: true,
      progress: 70,
      progressColor: "#5145FF",
    },
    {
      label: "Active Customers",
      value: metrics.totalUsers.toLocaleString(),
      icon: <FIcon src="/icons/shared-2x.webp" alt="Customers" />,
      trend: "+8.2%",
      trendUp: true,
      progress: 65,
      progressColor: "#5145FF",
    },
    {
      label: "Open Tickets",
      value: metrics.openTickets.toString(),
      icon: <FIcon src="/icons/ticket.svg" alt="Tickets" />,
      trend: "-3 today",
      trendUp: false,
      progress: 35,
      progressColor: "#F59E0B",
    },
    {
      label: "Active Droplets",
      value: metrics.activeVPS.toString(),
      icon: <FIcon src="/icons/vps-2x.webp" alt="Droplets" />,
      trend: "+14",
      trendUp: true,
      progress: 58,
      progressColor: "#5145FF",
    },
    {
      label: "System Uptime",
      value: "99.99%",
      icon: <FIcon src="/icons/uptime.svg" alt="Uptime" />,
      trend: "Excellent",
      trendUp: true,
      progress: 99,
      progressColor: "#10B981",
    },
    {
      label: "Auto Recoveries",
      value: metrics.recoveryLogs.toString(),
      icon: <FIcon src="/icons/transfer-2x.webp" alt="Recovery" />,
      trend: "This month",
      trendUp: null,
      progress: 50,
      progressColor: "#9CA3AF",
    },
    {
      label: "Network",
      value: "4.2 GB/s",
      icon: <FIcon src="/icons/vds-2x.webp" alt="Network" />,
      trend: "Peak load",
      trendUp: null,
      progress: 72,
      progressColor: "#9CA3AF",
    },
    {
      label: "Security Score",
      value: "99.8%",
      icon: <FIcon src="/icons/ssl-2x.webp" alt="Security" />,
      trend: "A+ Rating",
      trendUp: true,
      progress: 99,
      progressColor: "#10B981",
    },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F8F9FA" }}>
      <Sidebar />

      <main style={{ flex: 1, padding: "28px 32px", overflowY: "auto" }}>

        {/* ── Page Header ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px" }}>
          <div>
            <h1 style={{ fontSize: "21px", fontWeight: 700, color: "#111827", letterSpacing: "-0.4px" }}>
              Infrastructure Command Center
            </h1>
            <p style={{ fontSize: "13.5px", color: "#6B7280", marginTop: "3px" }}>
              Real-time surveillance and automated failover protocols active.
            </p>
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: "7px",
            background: "#ECFDF5", border: "1px solid #A7F3D0",
            padding: "6px 16px", borderRadius: "99px",
          }}>
            <div className="live-dot" />
            <span style={{ fontSize: "12px", fontWeight: 600, color: "#059669" }}>SYSTEM OPTIMAL</span>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "14px",
          marginBottom: "24px",
        }}>
          {statCards.map((card, i) => (
            <div key={i} className="card card-hover" style={{ padding: "18px 18px 14px" }}>
              {/* Top: icon + LIVE badge */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "14px" }}>
                {card.icon}
                <span style={{ fontSize: "9px", fontWeight: 700, color: "#D1D5DB", letterSpacing: "0.1em" }}>
                  LIVE
                </span>
              </div>

              {/* Label */}
              <div style={{ fontSize: "12px", color: "#9CA3AF", fontWeight: 500, marginBottom: "4px" }}>
                {card.label}
              </div>

              {/* Value */}
              <div style={{
                fontSize: "26px", fontWeight: 700, color: "#111827",
                letterSpacing: "-0.5px", marginBottom: "8px", lineHeight: 1,
              }}>
                {card.value}
              </div>

              {/* Trend */}
              <div style={{
                fontSize: "12px", fontWeight: 500, marginBottom: "10px",
                color: card.trendUp === true ? "#10B981" : card.trendUp === false ? "#EF4444" : "#9CA3AF",
                display: "flex", alignItems: "center", gap: "3px",
              }}>
                {card.trendUp === true && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 15l-6-6-6 6"/>
                  </svg>
                )}
                {card.trendUp === false && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                )}
                {card.trend}
              </div>

              {/* Progress bar */}
              <div style={{ height: "3px", background: "#F3F4F6", borderRadius: "99px", overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width: `${card.progress}%`,
                  background: card.progressColor,
                  borderRadius: "99px",
                }} />
              </div>
            </div>
          ))}
        </div>

        {/* ── Bottom Row ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>

          {/* Recent Activity */}
          <div className="card" style={{ padding: "22px" }}>
            <div style={{ marginBottom: "18px" }}>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>Recent Activity</div>
              <div style={{ fontSize: "12.5px", color: "#9CA3AF", marginTop: "2px" }}>Last 24 hours system events</div>
            </div>
            {[
              { icon: "/icons/vps-2x.webp",       action: "VPS Provisioned",    detail: "droplet-sg-1 · Customer #892",  time: "2m ago",  color: "#10B981" },
              { icon: "/icons/transfer-2x.webp",  action: "Snapshot Created",   detail: "Auto-backup completed",          time: "15m ago", color: "#F59E0B" },
              { icon: "/icons/ticket.svg",         action: "New Support Ticket", detail: "#TK-1042 · Billing issue",       time: "32m ago", color: "#5145FF" },
              { icon: "/icons/dedicated-2x.webp", action: "Recovery Triggered", detail: "droplet-us-3 auto-restored",     time: "1h ago",  color: "#EF4444" },
              { icon: "/icons/reseller.svg",       action: "New Affiliate",      detail: "ref_code: ULTRA20",              time: "2h ago",  color: "#8B5CF6" },
            ].map((item, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: "12px",
                padding: "10px 0",
                borderBottom: i < 4 ? "1px solid #F9FAFB" : "none",
              }}>
                {/* Mini icon — smart SVG vs WEBP */}
                {item.icon.endsWith(".svg") ? (
                  // SVG has built-in background
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.icon} alt={item.action} width={32} height={32} style={{ display: "block", flexShrink: 0, borderRadius: "7px" }} />
                ) : (
                  // WEBP needs container
                  <div style={{
                    width: "34px", height: "34px",
                    borderRadius: "8px",
                    background: "rgba(69,123,255,0.05)",
                    border: "1px solid rgba(0,0,0,0.04)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.icon} alt={item.action} width={22} height={22} style={{ objectFit: "contain" }} />
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "13px", fontWeight: 500, color: "#111827" }}>{item.action}</div>
                  <div style={{ fontSize: "11.5px", color: "#9CA3AF", marginTop: "1px" }}>{item.detail}</div>
                </div>
                <span style={{ fontSize: "11px", color: "#9CA3AF", flexShrink: 0 }}>{item.time}</span>
              </div>
            ))}
          </div>

          {/* System Health */}
          <div className="card" style={{ padding: "22px" }}>
            <div style={{ marginBottom: "18px" }}>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>System Health</div>
              <div style={{ fontSize: "12.5px", color: "#9CA3AF", marginTop: "2px" }}>Real-time infrastructure status</div>
            </div>
            {[
              { label: "CPU Usage",        value: 34, color: "#5145FF", bg: "#EEF0FF" },
              { label: "RAM Usage",         value: 61, color: "#10B981", bg: "#D1FAE5" },
              { label: "Storage I/O",       value: 48, color: "#F59E0B", bg: "#FEF3C7" },
              { label: "Network Bandwidth", value: 72, color: "#3B82F6", bg: "#DBEAFE" },
              { label: "API Response Time", value: 12, color: "#8B5CF6", bg: "#EDE9FE" },
            ].map((item, i) => (
              <div key={i} style={{ marginBottom: i < 4 ? "16px" : "0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: item.color }} />
                    <span style={{ fontSize: "13px", color: "#374151", fontWeight: 500 }}>{item.label}</span>
                  </div>
                  <span style={{
                    fontSize: "11.5px", fontWeight: 700, color: item.color,
                    background: item.bg, padding: "1px 8px", borderRadius: "99px"
                  }}>{item.value}%</span>
                </div>
                <div style={{ height: "5px", background: "#F3F4F6", borderRadius: "99px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${item.value}%`, background: item.color, borderRadius: "99px" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
