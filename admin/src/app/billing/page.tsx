import Sidebar from "@/components/Sidebar";
import { prisma } from "@/lib/prisma";

async function getBillingData() {
  try {
    const [invoices, revenue, pending, failed] = await Promise.all([
      prisma.invoice.findMany({
        include: { user: { select: { name: true, email: true } } },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.transaction.aggregate({ where: { status: "success" }, _sum: { amount: true } }),
      prisma.invoice.count({ where: { status: "pending" } }),
      prisma.invoice.count({ where: { status: "cancelled" } }),
    ]);
    return { invoices, revenue: revenue._sum.amount ?? 0, pending, failed };
  } catch {
    return { invoices: [], revenue: 0, pending: 0, failed: 0 };
  }
}

export default async function BillingPage() {
  const { invoices, revenue, pending, failed } = await getBillingData();

  const statusBadge = (s: string) => {
    const map: Record<string, string> = { paid: "badge-success", pending: "badge-warning", cancelled: "badge-danger" };
    return <span className={`badge ${map[s] ?? "badge-info"}`}>{s.charAt(0).toUpperCase() + s.slice(1)}</span>;
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F8F9FA" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: "28px 32px" }}>
        <div style={{ marginBottom: "24px" }}>
          <h1 className="section-title">Billing & Revenue</h1>
          <p className="section-subtitle">Track invoices, transactions, and revenue metrics</p>
        </div>

        {/* Metrics */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
          {[
            { label: "Total Revenue", value: `$${revenue.toLocaleString("en-US", { maximumFractionDigits: 0 })}`, icon: "icon-green", iconSvg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> },
            { label: "Total Invoices", value: invoices.length, icon: "icon-blue", iconSvg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg> },
            { label: "Pending", value: pending, icon: "icon-orange", iconSvg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
            { label: "Cancelled", value: failed, icon: "icon-red", iconSvg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg> },
          ].map((s, i) => (
            <div key={i} className="card" style={{ padding: "18px 20px", display: "flex", alignItems: "center", gap: "14px" }}>
              <span className={`icon-box icon-box-lg ${s.icon}`}>{s.iconSvg}</span>
              <div>
                <div style={{ fontSize: "23px", fontWeight: 700, color: "#111827" }}>{s.value}</div>
                <div style={{ fontSize: "12px", color: "#9CA3AF" }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Invoices Table */}
        <div className="card" style={{ overflow: "hidden" }}>
          <div style={{ padding: "18px 20px", borderBottom: "1px solid #F3F4F6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div className="section-title" style={{ fontSize: "15px" }}>Invoice History</div>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice ID</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Due Date</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "#9CA3AF" }}>No invoices yet</td></tr>
              ) : invoices.map((inv: any) => (
                <tr key={inv.id}>
                  <td><span style={{ fontFamily: "monospace", fontSize: "12px", background: "#F3F4F6", padding: "2px 8px", borderRadius: "4px" }}>#{inv.id.slice(0, 8)}</span></td>
                  <td>
                    <div style={{ fontSize: "13.5px", fontWeight: 500 }}>{inv.user.name ?? "—"}</div>
                    <div style={{ fontSize: "11.5px", color: "#9CA3AF" }}>{inv.user.email}</div>
                  </td>
                  <td><span style={{ fontWeight: 700, color: "#111827", fontSize: "15px" }}>${inv.amount.toFixed(2)}</span></td>
                  <td>{statusBadge(inv.status)}</td>
                  <td style={{ color: "#6B7280", fontSize: "13px" }}>{new Date(inv.dueDate).toLocaleDateString()}</td>
                  <td style={{ color: "#9CA3AF", fontSize: "12.5px" }}>{new Date(inv.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
