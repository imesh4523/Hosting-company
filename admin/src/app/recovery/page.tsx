import Sidebar from "@/components/Sidebar";
import { prisma } from "@/lib/prisma";

async function getRecoveryData() {
  try {
    const [logs, successCount, failedCount, vpsCount] = await Promise.all([
      prisma.recoveryLog.findMany({
        include: { vps: { select: { name: true, ipAddress: true } } },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.recoveryLog.count({ where: { status: "success" } }),
      prisma.recoveryLog.count({ where: { status: "failed" } }),
      prisma.vPS.count({ where: { status: "active" } }),
    ]);
    return { logs, successCount, failedCount, vpsCount };
  } catch {
    return { logs: [], successCount: 0, failedCount: 0, vpsCount: 0 };
  }
}

export default async function RecoveryPage() {
  const { logs, successCount, failedCount, vpsCount } = await getRecoveryData();

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F8F9FA" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: "28px 32px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
          <div>
            <h1 className="section-title">Recovery Center</h1>
            <p className="section-subtitle">Automated failover logs and VPS restoration history</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "7px", background: "#ECFDF5", border: "1px solid #A7F3D0", padding: "6px 14px", borderRadius: "99px" }}>
            <div className="live-dot" />
            <span style={{ fontSize: "12px", fontWeight: 600, color: "#059669" }}>FAILOVER ACTIVE</span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
          {[
            { label: "Total Recoveries", value: logs.length, icon: "icon-blue" },
            { label: "Successful", value: successCount, icon: "icon-green" },
            { label: "Failed", value: failedCount, icon: "icon-red" },
            { label: "Active VPS", value: vpsCount, icon: "icon-purple" },
          ].map((s, i) => (
            <div key={i} className="card" style={{ padding: "16px 18px", display: "flex", alignItems: "center", gap: "12px" }}>
              <span className={`icon-box icon-box-md ${s.icon}`}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 1 0 .49-4.5"/></svg>
              </span>
              <div>
                <div style={{ fontSize: "22px", fontWeight: 700, color: "#111827" }}>{s.value}</div>
                <div style={{ fontSize: "12px", color: "#9CA3AF" }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="card" style={{ overflow: "hidden" }}>
          <div style={{ padding: "18px 20px", borderBottom: "1px solid #F3F4F6" }}>
            <div className="section-title" style={{ fontSize: "15px" }}>Recovery Log</div>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>VPS Instance</th>
                <th>IP Address</th>
                <th>Action</th>
                <th>Status</th>
                <th>Message</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: "40px", color: "#9CA3AF" }}>No recovery logs yet</td></tr>
              ) : logs.map(log => (
                <tr key={log.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                      <span className="icon-box icon-box-sm icon-orange">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 4v6h6"/></svg>
                      </span>
                      <span style={{ fontWeight: 500, color: "#111827" }}>{log.vps.name}</span>
                    </div>
                  </td>
                  <td><span style={{ fontFamily: "monospace", fontSize: "12.5px", color: "#6B7280" }}>{log.vps.ipAddress ?? "â€”"}</span></td>
                  <td>
                    <span style={{ background: "#EEF0FF", color: "#5145FF", padding: "3px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 500 }}>
                      {log.action.replace("_", " ")}
                    </span>
                  </td>
                  <td>
                    {log.status === "success"
                      ? <span className="badge badge-success">Success</span>
                      : <span className="badge badge-danger">Failed</span>
                    }
                  </td>
                  <td style={{ fontSize: "12.5px", color: "#6B7280", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{log.message ?? "â€”"}</td>
                  <td style={{ fontSize: "12.5px", color: "#9CA3AF" }}>{new Date(log.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
