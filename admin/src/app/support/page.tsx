import Sidebar from "@/components/Sidebar";
import { prisma } from "@/lib/prisma";

async function getSupportData() {
  try {
    const [tickets, openCount, pendingCount, closedCount] = await Promise.all([
      prisma.supportTicket.findMany({
        include: { user: { select: { name: true, email: true } }, _count: { select: { messages: true } } },
        orderBy: { updatedAt: "desc" },
        take: 50,
      }),
      prisma.supportTicket.count({ where: { status: "open" } }),
      prisma.supportTicket.count({ where: { status: "pending" } }),
      prisma.supportTicket.count({ where: { status: "closed" } }),
    ]);
    return { tickets, openCount, pendingCount, closedCount };
  } catch {
    return { tickets: [], openCount: 0, pendingCount: 0, closedCount: 0 };
  }
}

export default async function SupportPage() {
  const { tickets, openCount, pendingCount, closedCount } = await getSupportData();

  const priorityBadge = (p: string) => {
    const map: Record<string, string> = { high: "badge-danger", medium: "badge-warning", low: "badge-success" };
    return <span className={`badge ${map[p] ?? "badge-info"}`}>{p.charAt(0).toUpperCase() + p.slice(1)}</span>;
  };

  const statusBadge = (s: string) => {
    const map: Record<string, string> = { open: "badge-danger", pending: "badge-warning", closed: "badge-success" };
    return <span className={`badge ${map[s] ?? "badge-info"}`}>{s.charAt(0).toUpperCase() + s.slice(1)}</span>;
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F8F9FA" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: "28px 32px" }}>
        <div style={{ marginBottom: "24px" }}>
          <h1 className="section-title">Support Center</h1>
          <p className="section-subtitle">Manage customer support tickets and responses</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
          {[
            { label: "Total Tickets", value: tickets.length, icon: "icon-blue" },
            { label: "Open", value: openCount, icon: "icon-red" },
            { label: "Pending", value: pendingCount, icon: "icon-orange" },
            { label: "Closed", value: closedCount, icon: "icon-green" },
          ].map((s, i) => (
            <div key={i} className="card" style={{ padding: "16px 18px", display: "flex", alignItems: "center", gap: "12px" }}>
              <span className={`icon-box icon-box-md ${s.icon}`}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
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
                <th>Ticket</th>
                <th>Customer</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Messages</th>
                <th>Last Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tickets.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: "center", padding: "40px", color: "#9CA3AF" }}>No support tickets</td></tr>
              ) : tickets.map(ticket => (
                <tr key={ticket.id}>
                  <td>
                    <div style={{ fontWeight: 500, color: "#111827", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ticket.subject}</div>
                    <div style={{ fontSize: "11.5px", color: "#9CA3AF", fontFamily: "monospace" }}>#{ticket.id.slice(0, 8)}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: "13.5px", fontWeight: 500 }}>{ticket.user.name ?? "â€”"}</div>
                    <div style={{ fontSize: "11.5px", color: "#9CA3AF" }}>{ticket.user.email}</div>
                  </td>
                  <td>{priorityBadge(ticket.priority)}</td>
                  <td>{statusBadge(ticket.status)}</td>
                  <td>
                    <span style={{
                      background: "#EEF0FF", color: "#5145FF",
                      padding: "2px 10px", borderRadius: "99px",
                      fontSize: "12px", fontWeight: 600,
                    }}>
                      {ticket._count.messages}
                    </span>
                  </td>
                  <td style={{ color: "#9CA3AF", fontSize: "12.5px" }}>{new Date(ticket.updatedAt).toLocaleDateString()}</td>
                  <td>
                    <button className="btn-primary" style={{ padding: "5px 12px", fontSize: "12px" }}>Reply</button>
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
