"use client";
import Sidebar from "@/components/Sidebar";
import { useState, useEffect, useCallback } from "react";

type Backup = {
  id: string; userId: string; vmId: string; status: string; type: string;
  sizeGb: number; b2Path: string | null; createdAt: string; restoredAt: string | null;
  user: { name: string | null; email: string };
  vm: { name: string; ip: string | null; provider: string };
};

type UserSummary = { userId: string; _count: { id: number }; _sum: { sizeGb: number | null }; _max: { createdAt: string | null } };

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  pending:   { bg: "#FEF3C7", color: "#D97706" },
  completed: { bg: "#D1FAE5", color: "#059669" },
  failed:    { bg: "#FEE2E2", color: "#DC2626" },
  restoring: { bg: "#DBEAFE", color: "#2563EB" },
};

function Toast({ msg, type, onClose }: { msg: string; type: "success" | "error"; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{
      position: "fixed", bottom: "24px", right: "24px", zIndex: 9999,
      background: type === "success" ? "#10B981" : "#EF4444", color: "#fff",
      padding: "12px 20px", borderRadius: "10px", fontSize: "13.5px", fontWeight: 600,
      boxShadow: "0 8px 24px rgba(0,0,0,0.2)", display: "flex", alignItems: "center", gap: "10px",
    }}>
      {type === "success" ? "✅" : "❌"} {msg}
    </div>
  );
}

function RestoreModal({ backup, onClose, onSuccess }: {
  backup: Backup; onClose: () => void; onSuccess: () => void;
}) {
  const [restoreType, setRestoreType] = useState<"same" | "new">("same");
  const [loading, setLoading] = useState(false);

  const doRestore = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/backups/${backup.userId}/restore`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ backupId: backup.id, restoreType }),
      });
      const data = await res.json();
      if (data.success) { onSuccess(); onClose(); }
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: "480px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div>
            <div style={{ fontSize: "17px", fontWeight: 700, color: "#111827" }}>Restore Backup</div>
            <div style={{ fontSize: "12.5px", color: "#9CA3AF", marginTop: "2px" }}>{backup.vm.name} • {new Date(backup.createdAt).toLocaleString()}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "22px", cursor: "pointer", color: "#9CA3AF" }}>×</button>
        </div>

        <div style={{ background: "#F8F9FA", padding: "14px", borderRadius: "10px", marginBottom: "20px" }}>
          <div style={{ fontSize: "12px", color: "#6B7280", fontWeight: 600, marginBottom: "8px" }}>BACKUP INFO</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "13px" }}>
            <div><span style={{ color: "#9CA3AF" }}>VM:</span> <strong>{backup.vm.name}</strong></div>
            <div><span style={{ color: "#9CA3AF" }}>IP:</span> <code style={{ fontSize: "12px" }}>{backup.vm.ip ?? "—"}</code></div>
            <div><span style={{ color: "#9CA3AF" }}>Size:</span> <strong>{backup.sizeGb.toFixed(2)} GB</strong></div>
            <div><span style={{ color: "#9CA3AF" }}>Type:</span> <strong>{backup.type}</strong></div>
          </div>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "10px" }}>Restore Type</div>
          {(["same", "new"] as const).map((type: string) => (
            <label key={type} style={{
              display: "flex", alignItems: "flex-start", gap: "10px", padding: "12px 14px",
              border: `2px solid ${restoreType === type ? "#5145FF" : "#E5E7EB"}`,
              borderRadius: "10px", cursor: "pointer", marginBottom: "8px",
              background: restoreType === type ? "#F5F4FF" : "#fff",
              transition: "all 0.15s",
            }}>
              <input type="radio" name="restoreType" checked={restoreType === type} onChange={() => setRestoreType(type)} style={{ marginTop: "2px" }} />
              <div>
                <div style={{ fontSize: "13.5px", fontWeight: 600, color: "#111827" }}>
                  {type === "same" ? "Same VPS (overwrite)" : "New VPS (keep old)"}
                </div>
                <div style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "2px" }}>
                  {type === "same"
                    ? "Restore data to the same VPS. Existing data will be overwritten."
                    : "Create a new VPS from this backup. Old VPS remains active."}
                </div>
              </div>
            </label>
          ))}
        </div>

        {restoreType === "same" && (
          <div style={{ background: "#FEF3C7", border: "1px solid #FDE68A", borderRadius: "8px", padding: "12px", marginBottom: "18px", fontSize: "12.5px", color: "#92400E" }}>
            ⚠️ <strong>Warning:</strong> This will overwrite all current data on the VPS. This action cannot be undone.
          </div>
        )}

        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={onClose} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #E5E7EB", background: "#fff", fontSize: "13.5px", fontWeight: 600, cursor: "pointer", color: "#374151" }}>
            Cancel
          </button>
          <button onClick={doRestore} disabled={loading} style={{
            flex: 1, padding: "10px", borderRadius: "8px", border: "none",
            background: loading ? "#9CA3AF" : "#5145FF", color: "#fff",
            fontSize: "13.5px", fontWeight: 600, cursor: loading ? "default" : "pointer",
          }}>
            {loading ? "Restoring…" : "Start Restore"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BackupsPage() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoreTarget, setRestoreTarget] = useState<Backup | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [runningAll, setRunningAll] = useState(false);
  const [search, setSearch] = useState("");

  const fetchBackups = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/backups");
      const data = await res.json();
      if (data.success) setBackups(data.backups);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchBackups(); }, [fetchBackups]);

  const runAll = async () => {
    setRunningAll(true);
    try {
      const res = await fetch("/api/admin/backups/run-all", { method: "POST" });
      const data = await res.json();
      if (data.success) { setToast({ msg: data.message, type: "success" }); fetchBackups(); }
      else setToast({ msg: data.error, type: "error" });
    } finally { setRunningAll(false); }
  };

  const runUserBackup = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/backups/${userId}/run`, { method: "POST" });
      const data = await res.json();
      if (data.success) { setToast({ msg: data.message, type: "success" }); fetchBackups(); }
      else setToast({ msg: data.error, type: "error" });
    } catch { setToast({ msg: "Failed to trigger backup", type: "error" }); }
  };

  const filtered = backups.filter(b =>
    b.user.email.toLowerCase().includes(search.toLowerCase()) ||
    b.vm.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalGb = backups.reduce((s, b) => s + b.sizeGb, 0);
  const completedCount = backups.filter(b => b.status === "completed").length;
  const failedCount = backups.filter(b => b.status === "failed").length;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F8F9FA" }}>
      <Sidebar />
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      {restoreTarget && (
        <RestoreModal
          backup={restoreTarget}
          onClose={() => setRestoreTarget(null)}
          onSuccess={() => { setToast({ msg: "Restore initiated successfully!", type: "success" }); fetchBackups(); }}
        />
      )}

      <main style={{ flex: 1, padding: "28px 32px", overflowY: "auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px" }}>
          <div>
            <h1 style={{ fontSize: "21px", fontWeight: 700, color: "#111827", letterSpacing: "-0.4px" }}>Backup Manager</h1>
            <p style={{ fontSize: "13.5px", color: "#6B7280", marginTop: "3px" }}>Manage VPS backups across all cloud accounts.</p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search email or VM…"
              style={{ padding: "8px 14px", borderRadius: "8px", border: "1px solid #E5E7EB", fontSize: "13px", outline: "none", width: "200px" }}
            />
            <button onClick={runAll} disabled={runningAll} style={{
              display: "flex", alignItems: "center", gap: "7px",
              background: runningAll ? "#9CA3AF" : "#10B981", color: "#fff",
              border: "none", borderRadius: "9px", padding: "9px 18px",
              fontSize: "13.5px", fontWeight: 600, cursor: runningAll ? "default" : "pointer",
            }}>
              {runningAll ? "Running…" : "▶ Run All Backups"}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "24px" }}>
          {[
            { label: "Total Backups", value: backups.length, color: "#5145FF", bg: "#EEF0FF" },
            { label: "Completed", value: completedCount, color: "#10B981", bg: "#D1FAE5" },
            { label: "Failed", value: failedCount, color: "#EF4444", bg: "#FEE2E2" },
            { label: "Total Storage", value: `${totalGb.toFixed(1)} GB`, color: "#F59E0B", bg: "#FEF3C7" },
          ].map((s, i) => (
            <div key={i} className="card" style={{ padding: "18px", display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", flexShrink: 0 }}>
                {["💾", "✅", "❌", "📦"][i]}
              </div>
              <div>
                <div style={{ fontSize: "11.5px", color: "#9CA3AF", fontWeight: 500 }}>{s.label}</div>
                <div style={{ fontSize: "22px", fontWeight: 700, color: "#111827", lineHeight: 1.2 }}>{s.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="card" style={{ overflow: "hidden" }}>
          <div style={{ padding: "18px 22px", borderBottom: "1px solid #F3F4F6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>Backup Records</div>
            <div style={{ fontSize: "12.5px", color: "#9CA3AF" }}>{filtered.length} records</div>
          </div>

          {loading ? (
            <div style={{ padding: "60px", textAlign: "center", color: "#9CA3AF" }}>Loading backups…</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: "60px", textAlign: "center" }}>
              <div style={{ fontSize: "40px", marginBottom: "14px" }}>💾</div>
              <div style={{ fontSize: "15px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>No backups found</div>
              <div style={{ fontSize: "13px", color: "#9CA3AF" }}>Run backups to start protecting your VPS instances.</div>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#FAFAFA" }}>
                    {["Customer", "VM", "Size", "Status", "Type", "Created", "Actions"].map((h: string) => (
                      <th key={h} style={{ padding: "11px 20px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.06em" }}>
                        {h.toUpperCase()}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((b: any) => {
                    const sc = STATUS_COLORS[b.status] ?? STATUS_COLORS.pending;
                    return (
                      <tr key={b.id} style={{ borderTop: "1px solid #F9FAFB" }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#FAFAFA"}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
                        <td style={{ padding: "14px 20px" }}>
                          <div style={{ fontSize: "13px", fontWeight: 500, color: "#111827" }}>{b.user.name ?? "—"}</div>
                          <div style={{ fontSize: "11.5px", color: "#9CA3AF" }}>{b.user.email}</div>
                        </td>
                        <td style={{ padding: "14px 20px" }}>
                          <div style={{ fontSize: "13px", fontWeight: 500, color: "#111827" }}>{b.vm.name}</div>
                          <div style={{ fontSize: "11.5px", color: "#9CA3AF", fontFamily: "monospace" }}>{b.vm.ip ?? "—"}</div>
                        </td>
                        <td style={{ padding: "14px 20px" }}>
                          <span style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>{b.sizeGb.toFixed(2)} GB</span>
                        </td>
                        <td style={{ padding: "14px 20px" }}>
                          <span style={{ background: sc.bg, color: sc.color, padding: "3px 10px", borderRadius: "99px", fontSize: "11.5px", fontWeight: 600 }}>
                            {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                          </span>
                        </td>
                        <td style={{ padding: "14px 20px" }}>
                          <span style={{ fontSize: "12.5px", color: "#6B7280" }}>{b.type}</span>
                        </td>
                        <td style={{ padding: "14px 20px" }}>
                          <span style={{ fontSize: "12px", color: "#9CA3AF" }}>{new Date(b.createdAt).toLocaleDateString()}</span>
                        </td>
                        <td style={{ padding: "14px 20px" }}>
                          <div style={{ display: "flex", gap: "6px" }}>
                            <button onClick={() => runUserBackup(b.userId)} style={{
                              padding: "5px 10px", borderRadius: "6px", border: "1px solid #E5E7EB",
                              background: "#fff", fontSize: "12px", cursor: "pointer", color: "#374151", fontWeight: 500,
                            }}>
                              Run Now
                            </button>
                            {b.status === "completed" && (
                              <button onClick={() => setRestoreTarget(b)} style={{
                                padding: "5px 10px", borderRadius: "6px", border: "none",
                                background: "#5145FF", fontSize: "12px", cursor: "pointer", color: "#fff", fontWeight: 600,
                              }}>
                                Restore
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
          )}
        </div>
      </main>
    </div>
  );
}
