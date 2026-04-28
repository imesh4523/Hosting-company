import Sidebar from "@/components/Sidebar";
import { prisma } from "@/lib/prisma";

async function getVPSData() {
  try {
    const vpsInstances = await prisma.vPS.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });
    const total = vpsInstances.length;
    const active = vpsInstances.filter((v) => v.status === "active").length;
    const suspended = vpsInstances.filter((v) => v.status === "suspended").length;
    return { vpsInstances, total, active, suspended };
  } catch {
    return { vpsInstances: [], total: 0, active: 0, suspended: 0 };
  }
}

const statusColors: Record<string, { bg: string; color: string; dot: string }> = {
  active:    { bg: "#D1FAE5", color: "#059669", dot: "#10B981" },
  suspended: { bg: "#FEE2E2", color: "#DC2626", dot: "#EF4444" },
  stopped:   { bg: "#F3F4F6", color: "#6B7280", dot: "#9CA3AF" },
  building:  { bg: "#FEF3C7", color: "#D97706", dot: "#F59E0B" },
};

export default async function VPSPage() {
  const { vpsInstances, total, active, suspended } = await getVPSData();

  const stats = [
    { label: "Total Droplets", value: total,              icon: "/icons/vds-2x.webp",        color: "#5145FF", bg: "#EEF0FF" },
    { label: "Active",         value: active,             icon: "/icons/uptime.svg",          color: "#10B981", bg: "#D1FAE5", isSvg: true },
    { label: "Suspended",      value: suspended,          icon: "/icons/transfer-2x.webp",    color: "#EF4444", bg: "#FEE2E2" },
    { label: "Pending",        value: total - active - suspended, icon: "/icons/dedicated-2x.webp", color: "#F59E0B", bg: "#FEF3C7" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F8F9FA" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: "28px 32px", overflowY: "auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px" }}>
          <div>
            <h1 style={{ fontSize: "21px", fontWeight: 700, color: "#111827", letterSpacing: "-0.4px" }}>
              Global VPS Management
            </h1>
            <p style={{ fontSize: "13.5px", color: "#6B7280", marginTop: "3px" }}>
              Monitor and control all DigitalOcean droplets across regions.
            </p>
          </div>
          <button style={{
            display: "flex", alignItems: "center", gap: "7px",
            background: "#5145FF", color: "#fff",
            border: "none", borderRadius: "9px",
            padding: "9px 18px", fontSize: "13.5px", fontWeight: 600,
            cursor: "pointer", boxShadow: "0 4px 14px rgba(81,69,255,0.35)",
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
            New Droplet
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "24px" }}>
          {stats.map((s, i) => (
            <div key={i} className="card" style={{ padding: "18px", display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{
                width: "46px", height: "46px", borderRadius: "10px",
                background: s.bg, display: "flex", alignItems: "center",
                justifyContent: "center", flexShrink: 0,
              }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.icon} alt={s.label} width={s.isSvg ? 36 : 32} height={s.isSvg ? 36 : 32} style={{ objectFit: "contain" }} />
              </div>
              <div>
                <div style={{ fontSize: "11.5px", color: "#9CA3AF", fontWeight: 500 }}>{s.label}</div>
                <div style={{ fontSize: "24px", fontWeight: 700, color: "#111827", lineHeight: 1.2 }}>{s.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="card" style={{ overflow: "hidden" }}>
          <div style={{ padding: "18px 22px", borderBottom: "1px solid #F3F4F6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>Droplet Instances</div>
            <div style={{ fontSize: "12.5px", color: "#9CA3AF" }}>{total} total</div>
          </div>

          {vpsInstances.length === 0 ? (
            <div style={{ padding: "60px", textAlign: "center" }}>
              <div style={{ width: "56px", height: "56px", borderRadius: "14px", background: "#EEF0FF", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/icons/vds-2x.webp" alt="VPS" width={38} height={38} />
              </div>
              <div style={{ fontSize: "15px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>No VPS instances found</div>
              <div style={{ fontSize: "13px", color: "#9CA3AF" }}>Customers have not provisioned any droplets yet.</div>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#FAFAFA" }}>
                    {["Droplet ID", "Customer", "Region", "Size / RAM", "IP Address", "Status", "Created"].map((h) => (
                      <th key={h} style={{ padding: "11px 20px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
                        {h.toUpperCase()}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {vpsInstances.map((vps, i) => {
                    const sc = statusColors[vps.status] ?? statusColors.stopped;
                    return (
                      <tr key={vps.id} style={{ borderTop: "1px solid #F9FAFB" }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#FAFAFA"}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
                        <td style={{ padding: "14px 20px" }}>
                          <div style={{ fontSize: "13px", fontWeight: 600, color: "#111827", fontFamily: "monospace" }}>
                            #{vps.dropletId ?? vps.id.slice(0, 8)}
                          </div>
                        </td>
                        <td style={{ padding: "14px 20px" }}>
                          <div style={{ fontSize: "13px", color: "#111827", fontWeight: 500 }}>{vps.user?.name ?? "—"}</div>
                          <div style={{ fontSize: "11.5px", color: "#9CA3AF" }}>{vps.user?.email ?? ""}</div>
                        </td>
                        <td style={{ padding: "14px 20px" }}>
                          <span style={{ fontSize: "12.5px", color: "#374151", fontWeight: 500 }}>
                            {vps.region ?? "sgp1"}
                          </span>
                        </td>
                        <td style={{ padding: "14px 20px" }}>
                          <span style={{ fontSize: "12.5px", color: "#374151" }}>
                            {vps.size ?? "s-1vcpu-1gb"}
                          </span>
                        </td>
                        <td style={{ padding: "14px 20px" }}>
                          <span style={{ fontSize: "12.5px", color: "#374151", fontFamily: "monospace" }}>
                            {vps.ipAddress ?? "—"}
                          </span>
                        </td>
                        <td style={{ padding: "14px 20px" }}>
                          <span style={{
                            display: "inline-flex", alignItems: "center", gap: "5px",
                            background: sc.bg, color: sc.color,
                            padding: "3px 10px", borderRadius: "99px",
                            fontSize: "11.5px", fontWeight: 600,
                          }}>
                            <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: sc.dot, flexShrink: 0 }} />
                            {vps.status.charAt(0).toUpperCase() + vps.status.slice(1)}
                          </span>
                        </td>
                        <td style={{ padding: "14px 20px" }}>
                          <span style={{ fontSize: "12px", color: "#9CA3AF" }}>
                            {new Date(vps.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
