"use client";
import Sidebar from "@/components/Sidebar";
import { useState, useEffect, useCallback } from "react";

type VM = {
  id: string; name: string; ip: string | null; status: string; region: string | null;
  provider: string; ram: number; cpu: number; disk: number; sshPort: number; hostname: string | null;
  user: { id: string; name: string | null; email: string } | null;
  account: { name: string; provider: string } | null;
  plan: { name: string } | null;
  createdAt: string;
};

const STATUS_COLORS: Record<string, { bg: string; color: string; dot: string }> = {
  active:       { bg: "#D1FAE5", color: "#059669", dot: "#10B981" },
  suspended:    { bg: "#FEE2E2", color: "#DC2626", dot: "#EF4444" },
  stopped:      { bg: "#F3F4F6", color: "#6B7280", dot: "#9CA3AF" },
  provisioning: { bg: "#FEF3C7", color: "#D97706", dot: "#F59E0B" },
  migrated:     { bg: "#EDE9FE", color: "#7C3AED", dot: "#8B5CF6" },
  deleted:      { bg: "#F3F4F6", color: "#9CA3AF", dot: "#D1D5DB" },
};

function Toast({ msg, type, onClose }: { msg: string; type: "success" | "error"; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{
      position: "fixed", bottom: "24px", right: "24px", zIndex: 9999,
      background: type === "success" ? "#10B981" : "#EF4444", color: "#fff",
      padding: "12px 20px", borderRadius: "10px", fontSize: "13.5px", fontWeight: 600,
      boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
    }}>
      {type === "success" ? "✅" : "❌"} {msg}
    </div>
  );
}

function ConfirmModal({ title, body, onConfirm, onClose, danger = false }: {
  title: string; body: string; onConfirm: () => void; onClose: () => void; danger?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: "400px" }}>
        <div style={{ fontSize: "17px", fontWeight: 700, color: "#111827", marginBottom: "10px" }}>{title}</div>
        <div style={{ fontSize: "13.5px", color: "#6B7280", marginBottom: "22px" }}>{body}</div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={onClose} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #E5E7EB", background: "#fff", fontWeight: 600, cursor: "pointer", color: "#374151" }}>Cancel</button>
          <button onClick={async () => { setLoading(true); await onConfirm(); setLoading(false); }} style={{
            flex: 1, padding: "10px", borderRadius: "8px", border: "none",
            background: danger ? "#EF4444" : "#5145FF", color: "#fff", fontWeight: 600, cursor: "pointer",
          }}>
            {loading ? "Processing…" : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VPSPage() {
  const [vms, setVms] = useState<VM[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [confirmModal, setConfirmModal] = useState<{ vmId: string; action: string; title: string; body: string; danger?: boolean } | null>(null);

  const fetchVMs = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/admin/vps?${params}`);
      const data = await res.json();
      if (data.success) setVms(data.vms);
    } finally { setLoading(false); }
  }, [search, statusFilter]);

  useEffect(() => { fetchVMs(); }, [fetchVMs]);

  const doAction = async (vmId: string, action: string) => {
    setActionLoading(p => ({ ...p, [vmId + action]: true }));
    try {
      const res = await fetch(`/api/admin/vps/${vmId}/${action}`, { method: action === "delete" ? "DELETE" : "POST" });
      const data = await res.json();
      if (data.success) {
        setToast({ msg: data.message ?? `VM ${action} successful`, type: "success" });
        fetchVMs();
      } else {
        setToast({ msg: data.error ?? `Failed to ${action} VM`, type: "error" });
      }
    } catch {
      setToast({ msg: `Failed to ${action} VM`, type: "error" });
    } finally {
      setActionLoading(p => ({ ...p, [vmId + action]: false }));
    }
  };

  const handleAction = (vmId: string, action: string) => {
    if (action === "delete") {
      setConfirmModal({ vmId, action, title: "Delete VM", body: "This will permanently delete the VM from the cloud provider. This action cannot be undone.", danger: true });
    } else if (action === "stop") {
      setConfirmModal({ vmId, action, title: "Stop VM", body: "Are you sure you want to stop this VM? It will be powered off." });
    } else {
      doAction(vmId, action);
    }
  };

  const stats = [
    { label: "Total VMs", value: vms.length, color: "#5145FF", bg: "#EEF0FF" },
    { label: "Active", value: vms.filter(v => v.status === "active").length, color: "#10B981", bg: "#D1FAE5" },
    { label: "Suspended", value: vms.filter(v => v.status === "suspended").length, color: "#EF4444", bg: "#FEE2E2" },
    { label: "Other", value: vms.filter(v => !["active", "suspended"].includes(v.status)).length, color: "#F59E0B", bg: "#FEF3C7" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F8F9FA" }}>
      <Sidebar />
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      {confirmModal && (
        <ConfirmModal
          title={confirmModal.title} body={confirmModal.body} danger={confirmModal.danger}
          onClose={() => setConfirmModal(null)}
          onConfirm={async () => { await doAction(confirmModal.vmId, confirmModal.action); setConfirmModal(null); }}
        />
      )}

      <main style={{ flex: 1, padding: "28px 32px", overflowY: "auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px" }}>
          <div>
            <h1 style={{ fontSize: "21px", fontWeight: 700, color: "#111827", letterSpacing: "-0.4px" }}>Global VPS Management</h1>
            <p style={{ fontSize: "13.5px", color: "#6B7280", marginTop: "3px" }}>Control all VM instances across all cloud accounts.</p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search IP, name, email…"
              style={{ padding: "8px 14px", borderRadius: "8px", border: "1px solid #E5E7EB", fontSize: "13px", outline: "none", width: "220px" }} />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              style={{ padding: "8px 14px", borderRadius: "8px", border: "1px solid #E5E7EB", fontSize: "13px", outline: "none" }}>
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="stopped">Stopped</option>
              <option value="provisioning">Provisioning</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "24px" }}>
          {stats.map((s, i) => (
            <div key={i} className="card" style={{ padding: "18px", display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{ width: "46px", height: "46px", borderRadius: "10px", background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>
                {["🖥️", "✅", "⛔", "⏳"][i]}
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
          <div style={{ padding: "18px 22px", borderBottom: "1px solid #F3F4F6", display: "flex", justifyContent: "space-between" }}>
            <div style={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>VM Instances</div>
            <div style={{ fontSize: "12.5px", color: "#9CA3AF" }}>{vms.length} total</div>
          </div>

          {loading ? (
            <div style={{ padding: "60px", textAlign: "center", color: "#9CA3AF" }}>Loading VMs…</div>
          ) : vms.length === 0 ? (
            <div style={{ padding: "60px", textAlign: "center" }}>
              <div style={{ fontSize: "40px", marginBottom: "14px" }}>🖥️</div>
              <div style={{ fontSize: "15px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>No VMs found</div>
              <div style={{ fontSize: "13px", color: "#9CA3AF" }}>No VPS instances match your filters.</div>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#FAFAFA" }}>
                    {["VM / Host", "Customer", "IP / Port", "Specs", "Provider", "Status", "Actions"].map((h: string) => (
                      <th key={h} style={{ padding: "11px 20px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
                        {h.toUpperCase()}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {vms.map((vm: any) => {
                    const sc = STATUS_COLORS[vm.status] ?? STATUS_COLORS.stopped;
                    return (
                      <tr key={vm.id} style={{ borderTop: "1px solid #F9FAFB" }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#FAFAFA"}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
                        <td style={{ padding: "14px 20px" }}>
                          <div style={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>{vm.name}</div>
                          <div style={{ fontSize: "11.5px", color: "#9CA3AF", fontFamily: "monospace" }}>{vm.hostname ?? vm.id.slice(0, 8)}</div>
                        </td>
                        <td style={{ padding: "14px 20px" }}>
                          <div style={{ fontSize: "13px", fontWeight: 500, color: "#111827" }}>{vm.user?.name ?? "—"}</div>
                          <div style={{ fontSize: "11.5px", color: "#9CA3AF" }}>{vm.user?.email}</div>
                        </td>
                        <td style={{ padding: "14px 20px" }}>
                          <div style={{ fontSize: "12.5px", fontFamily: "monospace", color: "#374151" }}>{vm.ip ?? "—"}</div>
                          <div style={{ fontSize: "11px", color: "#9CA3AF" }}>:{vm.sshPort ?? 22}</div>
                        </td>
                        <td style={{ padding: "14px 20px" }}>
                          <div style={{ fontSize: "12px", color: "#374151" }}>{vm.cpu}C / {vm.ram}GB / {vm.disk}GB</div>
                        </td>
                        <td style={{ padding: "14px 20px" }}>
                          <div style={{ fontSize: "12.5px", color: "#374151", textTransform: "capitalize" }}>{vm.provider}</div>
                          <div style={{ fontSize: "11px", color: "#9CA3AF" }}>{vm.region}</div>
                        </td>
                        <td style={{ padding: "14px 20px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", background: sc.bg, color: sc.color, padding: "3px 10px", borderRadius: "99px", fontSize: "11.5px", fontWeight: 600 }}>
                            <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: sc.dot }} />
                            {vm.status}
                          </span>
                        </td>
                        <td style={{ padding: "14px 20px" }}>
                          <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                            {vm.status !== "active" && (
                              <button onClick={() => handleAction(vm.id, "start")} disabled={actionLoading[vm.id + "start"]}
                                style={{ padding: "4px 9px", borderRadius: "6px", border: "none", background: "#D1FAE5", color: "#059669", fontSize: "11.5px", fontWeight: 600, cursor: "pointer" }}>
                                {actionLoading[vm.id + "start"] ? "…" : "Start"}
                              </button>
                            )}
                            {vm.status === "active" && (
                              <>
                                <button onClick={() => handleAction(vm.id, "restart")} disabled={actionLoading[vm.id + "restart"]}
                                  style={{ padding: "4px 9px", borderRadius: "6px", border: "none", background: "#FEF3C7", color: "#D97706", fontSize: "11.5px", fontWeight: 600, cursor: "pointer" }}>
                                  {actionLoading[vm.id + "restart"] ? "…" : "Restart"}
                                </button>
                                <button onClick={() => handleAction(vm.id, "stop")}
                                  style={{ padding: "4px 9px", borderRadius: "6px", border: "none", background: "#FEE2E2", color: "#DC2626", fontSize: "11.5px", fontWeight: 600, cursor: "pointer" }}>
                                  Stop
                                </button>
                              </>
                            )}
                            <button onClick={() => handleAction(vm.id, "snapshot")} disabled={actionLoading[vm.id + "snapshot"]}
                              style={{ padding: "4px 9px", borderRadius: "6px", border: "1px solid #E5E7EB", background: "#fff", color: "#374151", fontSize: "11.5px", fontWeight: 500, cursor: "pointer" }}>
                              Snap
                            </button>
                            <button onClick={() => handleAction(vm.id, "delete")}
                              style={{ padding: "4px 9px", borderRadius: "6px", border: "none", background: "#EF4444", color: "#fff", fontSize: "11.5px", fontWeight: 600, cursor: "pointer" }}>
                              Delete
                            </button>
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
