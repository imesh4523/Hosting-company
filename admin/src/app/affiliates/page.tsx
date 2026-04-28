import Sidebar from "@/components/Sidebar";
import { prisma } from "@/lib/prisma";

async function getAffiliateData() {
  try {
    const [affiliates, totalCommission, pendingPayouts] = await Promise.all([
      prisma.affiliate.findMany({
        include: { user: { select: { name: true, email: true } }, payouts: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.affiliate.aggregate({ _sum: { commission: true } }),
      prisma.payout.count({ where: { status: "pending" } }),
    ]);
    return { affiliates, totalCommission: totalCommission._sum.commission ?? 0, pendingPayouts };
  } catch {
    return { affiliates: [], totalCommission: 0, pendingPayouts: 0 };
  }
}

export default async function AffiliatesPage() {
  const { affiliates, totalCommission, pendingPayouts } = await getAffiliateData();

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F8F9FA" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: "28px 32px" }}>
        <div style={{ marginBottom: "24px" }}>
          <h1 className="section-title">Affiliate Program</h1>
          <p className="section-subtitle">Manage affiliates, commissions, and payouts</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
          {[
            { label: "Total Affiliates", value: affiliates.length, icon: "icon-purple" },
            { label: "Total Commission", value: `$${totalCommission.toFixed(2)}`, icon: "icon-green" },
            { label: "Pending Payouts", value: pendingPayouts, icon: "icon-orange" },
            { label: "Avg Commission", value: affiliates.length > 0 ? `$${(totalCommission / affiliates.length).toFixed(2)}` : "$0", icon: "icon-blue" },
          ].map((s, i) => (
            <div key={i} className="card" style={{ padding: "16px 18px", display: "flex", alignItems: "center", gap: "12px" }}>
              <span className={`icon-box icon-box-md ${s.icon}`}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 20h5v-2a3 3 0 0 0-5.356-1.857"/><path d="M7 20H2v-2a3 3 0 0 1 5.356-1.857"/><circle cx="12" cy="8" r="4"/><path d="M12 12v8"/></svg>
              </span>
              <div>
                <div style={{ fontSize: "22px", fontWeight: 700, color: "#111827" }}>{s.value}</div>
                <div style={{ fontSize: "12px", color: "#9CA3AF" }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="card" style={{ overflow: "hidden" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Affiliate</th>
                <th>Referral Code</th>
                <th>Commission Earned</th>
                <th>Payouts</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {affiliates.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "#9CA3AF" }}>No affiliates yet</td></tr>
              ) : affiliates.map(aff => (
                <tr key={aff.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#EDE9FE", color: "#8B5CF6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 600, flexShrink: 0 }}>
                        {(aff.user.name ?? aff.user.email)[0].toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 500, color: "#111827" }}>{aff.user.name ?? "â€”"}</div>
                        <div style={{ fontSize: "12px", color: "#9CA3AF" }}>{aff.user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{ background: "#EDE9FE", color: "#8B5CF6", padding: "3px 10px", borderRadius: "6px", fontSize: "12.5px", fontWeight: 600, fontFamily: "monospace" }}>
                      {aff.code}
                    </span>
                  </td>
                  <td><span style={{ fontWeight: 700, color: "#10B981", fontSize: "15px" }}>${aff.commission.toFixed(2)}</span></td>
                  <td>
                    <span style={{ background: "#F3F4F6", padding: "2px 10px", borderRadius: "99px", fontSize: "12px", fontWeight: 600 }}>
                      {aff.payouts.length} payouts
                    </span>
                  </td>
                  <td style={{ color: "#9CA3AF", fontSize: "12.5px" }}>{new Date(aff.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button className="btn-primary" style={{ padding: "5px 12px", fontSize: "12px" }}>Payout</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
