import Sidebar from "@/components/Sidebar";
import { prisma } from "@/lib/prisma";

async function getFraudData() {
  try {
    const users = await prisma.user.findMany({
      where: { fraudScore: { gte: 30 } },
      orderBy: { fraudScore: "desc" },
      include: { _count: { select: { vPS: true } } },
    });
    return users;
  } catch {
    return [];
  }
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 80 ? "#DC2626" : score >= 60 ? "#F59E0B" : score >= 30 ? "#D97706" : "#10B981";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <div style={{ flex: 1, height: "5px", background: "#F3F4F6", borderRadius: "99px", overflow: "hidden", minWidth: "80px" }}>
        <div style={{ height: "100%", width: `${score}%`, background: color, borderRadius: "99px" }} />
      </div>
      <span style={{
        fontSize: "12px", fontWeight: 700,
        color: color,
        background: score >= 80 ? "#FEE2E2" : score >= 60 ? "#FEF3C7" : "#FEF9C3",
        padding: "1px 8px", borderRadius: "99px", minWidth: "36px", textAlign: "center",
      }}>{score}</span>
    </div>
  );
}

export default async function FraudPage() {
  const flagged = await getFraudData();

  // Fallback mock data if DB empty
  const displayData = flagged.length > 0 ? flagged : [
    { id: "u1", name: "John Doe",    email: "j@tempmail.io",    fraudScore: 87, trustLevel: "BANNED",  status: "banned",   createdAt: new Date("2026-04-27"), _count: { vPS: 2 }, fraudReasons: ["VPN/Proxy detected", "Disposable email", "Multiple accounts"] },
    { id: "u2", name: "Mike Chen",   email: "m@protonmail.com", fraudScore: 65, trustLevel: "FLAGGED", status: "active",   createdAt: new Date("2026-04-26"), _count: { vPS: 1 }, fraudReasons: ["Payment declined", "Unusual signup pattern"] },
    { id: "u3", name: "Sara Kim",    email: "s@yopmail.com",    fraudScore: 55, trustLevel: "FLAGGED", status: "active",   createdAt: new Date("2026-04-25"), _count: { vPS: 0 }, fraudReasons: ["Disposable email", "Multiple failed logins"] },
    { id: "u4", name: "Dave Wilson", email: "d@guerrillamail.com", fraudScore: 78, trustLevel: "FLAGGED", status: "active", createdAt: new Date("2026-04-24"), _count: { vPS: 3 }, fraudReasons: ["VPN detected", "Same IP multiple accounts", "Payment declined"] },
  ];

  const summary = [
    { label: "Auto-Banned",   value: displayData.filter(u => (u as { trustLevel?: string }).trustLevel === "BANNED" || u.status === "banned").length, color: "#EF4444", bg: "#FEE2E2", icon: "/icons/shared-2x.webp" },
    { label: "Flagged Review", value: displayData.filter(u => (u as { trustLevel?: string }).trustLevel === "FLAGGED").length, color: "#F59E0B", bg: "#FEF3C7", icon: "/icons/ticket.svg", isSvg: true },
    { label: "Avg Score",     value: Math.round(displayData.reduce((a, u) => a + (u.fraudScore ?? 0), 0) / (displayData.length || 1)), color: "#8B5CF6", bg: "#EDE9FE", icon: "/icons/ssl-2x.webp" },
    { label: "IP Blacklisted", value: 14, color: "#374151", bg: "#F3F4F6", icon: "/icons/domain-2x.webp" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F8F9FA" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: "28px 32px" }}>

        {/* Header */}
        <div style={{ marginBottom: "26px" }}>
          <h1 style={{ fontSize: "21px", fontWeight: 700, color: "#111827", letterSpacing: "-0.4px" }}>
            Fraud Detection Center
          </h1>
          <p style={{ fontSize: "13.5px", color: "#6B7280", marginTop: "3px" }}>
            AI-scored risk analysis. Auto-ban threshold: score &ge; 81.
          </p>
        </div>

        {/* Score Legend */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
          {[
            { range: "0–30",  label: "Safe",     bg: "#D1FAE5", color: "#059669" },
            { range: "31–60", label: "Review",   bg: "#FEF9C3", color: "#D97706" },
            { range: "61–80", label: "High Risk", bg: "#FEF3C7", color: "#F59E0B" },
            { range: "81–100",label: "Auto-Ban", bg: "#FEE2E2", color: "#DC2626" },
          ].map((l, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px", background: l.bg, padding: "4px 12px", borderRadius: "99px" }}>
              <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: l.color }} />
              <span style={{ fontSize: "11.5px", fontWeight: 600, color: l.color }}>{l.range} — {l.label}</span>
            </div>
          ))}
        </div>

        {/* Summary cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "14px", marginBottom: "22px" }}>
          {summary.map((s, i) => (
            <div key={i} style={{ background: "#fff", borderRadius: "14px", border: "1px solid #F0F0F0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", padding: "18px", display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{ width: "46px", height: "46px", borderRadius: "10px", background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.icon} alt={s.label} width={(s as { isSvg?: boolean }).isSvg ? 36 : 30} height={(s as { isSvg?: boolean }).isSvg ? 36 : 30} style={{ objectFit: "contain" }} />
              </div>
              <div>
                <div style={{ fontSize: "11.5px", color: "#9CA3AF", fontWeight: 500 }}>{s.label}</div>
                <div style={{ fontSize: "26px", fontWeight: 700, color: s.color, lineHeight: 1.1 }}>{s.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Flagged users table */}
        <div style={{ background: "#fff", borderRadius: "14px", border: "1px solid #F0F0F0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", overflow: "hidden" }}>
          <div style={{ padding: "18px 22px", borderBottom: "1px solid #F3F4F6" }}>
            <div style={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>Flagged Users</div>
            <div style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "2px" }}>Score &ge; 30 — requires admin review</div>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#FAFAFA" }}>
                {["User", "Email", "Fraud Score", "Risk Factors", "VPS Count", "Status", "Actions"].map(h => (
                  <th key={h} style={{ padding: "10px 18px", textAlign: "left", fontSize: "10.5px", fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.06em" }}>
                    {h.toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayData.map((user, i) => {
                const score = user.fraudScore ?? 0;
                const reasons = (user as { fraudReasons?: string[] }).fraudReasons ?? [];
                const isBanned = user.status === "banned" || (user as { trustLevel?: string }).trustLevel === "BANNED";
                return (
                  <tr key={user.id} style={{ borderTop: "1px solid #F9FAFB" }}>
                    <td style={{ padding: "14px 18px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{
                          width: "30px", height: "30px", borderRadius: "50%",
                          background: score >= 80 ? "#FEE2E2" : "#F3F4F6",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "11px", fontWeight: 700,
                          color: score >= 80 ? "#DC2626" : "#6B7280",
                        }}>
                          {user.name?.charAt(0) ?? "?"}
                        </div>
                        <span style={{ fontSize: "13px", fontWeight: 500, color: "#111827" }}>{user.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: "14px 18px" }}>
                      <span style={{ fontSize: "12.5px", color: "#6B7280" }}>{user.email}</span>
                    </td>
                    <td style={{ padding: "14px 18px", minWidth: "160px" }}>
                      <ScoreBar score={score} />
                    </td>
                    <td style={{ padding: "14px 18px", maxWidth: "220px" }}>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                        {reasons.slice(0, 2).map((r: string, ri: number) => (
                          <span key={ri} style={{ fontSize: "10.5px", background: "#F3F4F6", color: "#6B7280", padding: "1px 7px", borderRadius: "99px" }}>{r}</span>
                        ))}
                        {reasons.length > 2 && <span style={{ fontSize: "10.5px", background: "#F3F4F6", color: "#6B7280", padding: "1px 7px", borderRadius: "99px" }}>+{reasons.length - 2}</span>}
                      </div>
                    </td>
                    <td style={{ padding: "14px 18px" }}>
                      <span style={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>{user._count.vPS}</span>
                    </td>
                    <td style={{ padding: "14px 18px" }}>
                      <span style={{
                        fontSize: "11px", fontWeight: 700,
                        background: isBanned ? "#FEE2E2" : "#FEF3C7",
                        color: isBanned ? "#DC2626" : "#D97706",
                        padding: "2px 9px", borderRadius: "99px",
                      }}>
                        {isBanned ? "BANNED" : "FLAGGED"}
                      </span>
                    </td>
                    <td style={{ padding: "14px 18px" }}>
                      <div style={{ display: "flex", gap: "6px" }}>
                        {!isBanned && (
                          <>
                            <button style={{ fontSize: "11.5px", fontWeight: 600, color: "#fff", background: "#EF4444", border: "none", borderRadius: "6px", padding: "4px 11px", cursor: "pointer" }}>
                              Ban
                            </button>
                            <button style={{ fontSize: "11.5px", fontWeight: 600, color: "#5145FF", background: "#EEF0FF", border: "none", borderRadius: "6px", padding: "4px 11px", cursor: "pointer" }}>
                              Approve
                            </button>
                          </>
                        )}
                        {isBanned && (
                          <button style={{ fontSize: "11.5px", fontWeight: 600, color: "#059669", background: "#D1FAE5", border: "none", borderRadius: "6px", padding: "4px 11px", cursor: "pointer" }}>
                            Unban
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* IP Blacklist */}
        <div style={{ marginTop: "20px", background: "#fff", borderRadius: "14px", border: "1px solid #F0F0F0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", padding: "20px 22px" }}>
          <div style={{ fontSize: "15px", fontWeight: 700, color: "#111827", marginBottom: "14px" }}>IP Blacklist</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {["45.227.255.81", "103.94.185.12", "185.220.101.45", "198.96.155.3", "23.129.64.214", "178.165.72.177", "89.234.157.254", "46.165.230.5", "171.25.193.9", "192.42.116.16", "77.247.181.165", "5.188.10.179", "176.10.104.240", "109.70.100.28"].map(ip => (
              <div key={ip} style={{
                display: "flex", alignItems: "center", gap: "7px",
                background: "#FEF2F2", border: "1px solid #FECACA",
                padding: "4px 10px", borderRadius: "7px",
              }}>
                <span style={{ fontSize: "12px", fontFamily: "monospace", color: "#DC2626" }}>{ip}</span>
                <button style={{ background: "none", border: "none", color: "#9CA3AF", cursor: "pointer", fontSize: "13px", lineHeight: 1 }}>×</button>
              </div>
            ))}
            <button style={{
              fontSize: "12px", fontWeight: 600, color: "#5145FF",
              background: "#EEF0FF", border: "1px dashed #C7D2FE",
              padding: "4px 12px", borderRadius: "7px", cursor: "pointer",
            }}>
              + Add IP
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
