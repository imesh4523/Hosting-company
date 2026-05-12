"use client";
import Sidebar from "@/components/Sidebar";
import { useState, useEffect, useCallback } from "react";

type User = {
  id: string; name: string | null; email: string; role: string;
  fraudScore: number; status: string;
  balance: number; walletBalance: number; createdAt: string;
  _count?: { VPSInstance: number; invoices: number; Ticket: number };
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

function BanModal({ user, onClose, onSuccess }: { user: User; onClose: () => void; onSuccess: () => void }) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!reason.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/ban`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (data.success) { onSuccess(); onClose(); }
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: "440px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
          <div style={{ fontSize: "17px", fontWeight: 700, color: "#EF4444" }}>🚫 Ban User</div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "22px", cursor: "pointer", color: "#9CA3AF" }}>×</button>
        </div>
        <div style={{ background: "#FEF2F2", border: "1px solid #FEE2E2", borderRadius: "8px", padding: "12px", marginBottom: "16px", fontSize: "13px", color: "#DC2626" }}>
          Banning <strong>{user.email}</strong> will immediately suspend all their VPS instances and prevent login.
        </div>
        <div style={{ marginBottom: "18px" }}>
          <label style={{ fontSize: "13px", fontWeight: 600, color: "#374151", display: "block", marginBottom: "6px" }}>Ban Reason</label>
          <textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. Fraudulent activity, abuse…"
            style={{ width: "100%", height: "80px", padding: "10px 12px", borderRadius: "8px", border: "1px solid #E5E7EB", fontSize: "13px", resize: "none", outline: "none", boxSizing: "border-box" }} />
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={onClose} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #E5E7EB", background: "#fff", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
          <button onClick={submit} disabled={loading || !reason.trim()} style={{
            flex: 1, padding: "10px", borderRadius: "8px", border: "none",
            background: loading || !reason.trim() ? "#9CA3AF" : "#EF4444", color: "#fff", fontWeight: 600, cursor: "pointer",
          }}>
            {loading ? "Banning…" : "Ban User"}
          </button>
        </div>
      </div>
    </div>
  );
}

function BalanceModal({ user, onClose, onSuccess }: { user: User; onClose: () => void; onSuccess: () => void }) {
  const [operation, setOperation] = useState<"add" | "deduct">("add");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/balance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parseFloat(amount), note, operation }),
      });
      const data = await res.json();
      if (data.success) { onSuccess(); onClose(); }
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: "440px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
          <div style={{ fontSize: "17px", fontWeight: 700, color: "#111827" }}>💰 Manage Balance</div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "22px", cursor: "pointer", color: "#9CA3AF" }}>×</button>
        </div>

        <div style={{ background: "#F8F9FA", borderRadius: "10px", padding: "14px", marginBottom: "18px" }}>
          <div style={{ fontSize: "12px", color: "#9CA3AF", fontWeight: 600 }}>CURRENT BALANCE</div>
          <div style={{ fontSize: "28px", fontWeight: 700, color: "#111827", marginTop: "4px" }}>
            ${(user.walletBalance ?? 0).toFixed(2)}
          </div>
          <div style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "2px" }}>{user.email}</div>
        </div>

        <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
          {(["add", "deduct"] as const).map((op: "add" | "deduct") => (
            <button key={op} onClick={() => setOperation(op)} style={{
              flex: 1, padding: "10px", borderRadius: "8px", fontWeight: 600, fontSize: "13.5px", cursor: "pointer",
              border: `2px solid ${operation === op ? (op === "add" ? "#10B981" : "#EF4444") : "#E5E7EB"}`,
              background: operation === op ? (op === "add" ? "#D1FAE5" : "#FEE2E2") : "#fff",
              color: operation === op ? (op === "add" ? "#059669" : "#DC2626") : "#6B7280",
            }}>
              {op === "add" ? "➕ Add Funds" : "➖ Deduct"}
            </button>
          ))}
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label style={{ fontSize: "13px", fontWeight: 600, color: "#374151", display: "block", marginBottom: "6px" }}>Amount (USD)</label>
          <input type="number" min="0.01" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00"
            style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #E5E7EB", fontSize: "16px", fontWeight: 600, outline: "none", boxSizing: "border-box" }} />
        </div>

        <div style={{ marginBottom: "18px" }}>
          <label style={{ fontSize: "13px", fontWeight: 600, color: "#374151", display: "block", marginBottom: "6px" }}>Note (optional)</label>
          <input value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. Refund for downtime, promotional credit…"
            style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #E5E7EB", fontSize: "13px", outline: "none", boxSizing: "border-box" }} />
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={onClose} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #E5E7EB", background: "#fff", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
          <button onClick={submit} disabled={loading || !amount || parseFloat(amount) <= 0} style={{
            flex: 1, padding: "10px", borderRadius: "8px", border: "none",
            background: loading ? "#9CA3AF" : (operation === "add" ? "#10B981" : "#EF4444"),
            color: "#fff", fontWeight: 600, cursor: "pointer",
          }}>
            {loading ? "Processing…" : `${operation === "add" ? "Add" : "Deduct"} $${amount || "0"}`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CustomersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [banTarget, setBanTarget] = useState<User | null>(null);
  const [balanceTarget, setBalanceTarget] = useState<User | null>(null);
  const [unbanLoading, setUnbanLoading] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.success) setUsers(data.users);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const unban = async (userId: string) => {
    setUnbanLoading(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}/unban`, { method: "PUT" });
      const data = await res.json();
      if (data.success) { setToast({ msg: "User unbanned", type: "success" }); fetchUsers(); }
      else setToast({ msg: data.error, type: "error" });
    } finally { setUnbanLoading(null); }
  };

  const filtered = users.filter(u =>
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F8F9FA" }}>
      <Sidebar />
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      {banTarget && <BanModal user={banTarget} onClose={() => setBanTarget(null)} onSuccess={() => { setToast({ msg: "User banned successfully", type: "success" }); fetchUsers(); }} />}
      {balanceTarget && <BalanceModal user={balanceTarget} onClose={() => setBalanceTarget(null)} onSuccess={() => { setToast({ msg: "Balance updated!", type: "success" }); fetchUsers(); }} />}

      <main style={{ flex: 1, padding: "28px 32px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
          <div>
            <h1 style={{ fontSize: "21px", fontWeight: 700, color: "#111827", letterSpacing: "-0.4px" }}>Customer Management</h1>
            <p style={{ fontSize: "13.5px", color: "#6B7280", marginTop: "3px" }}>Ban, unban, and manage user balances.</p>
          </div>
          <input className="input-field" style={{ width: "240px" }} placeholder="Search by name or email…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "22px" }}>
          {[
            { label: "Total Customers", value: users.length, icon: "👥" },
            { label: "Active", value: users.filter(u => u.status === "active").length, icon: "✅" },
            { label: "Flagged", value: users.filter(u => u.fraudScore > 50).length, icon: "⚠️" },
            { label: "Suspended", value: users.filter(u => u.status === "banned").length, icon: "🚫" },
          ].map((s, i) => (
            <div key={i} className="card" style={{ padding: "16px 18px", display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>
                {s.icon}
              </div>
              <div>
                <div style={{ fontSize: "22px", fontWeight: 700, color: "#111827" }}>{s.value}</div>
                <div style={{ fontSize: "12px", color: "#9CA3AF" }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="card" style={{ overflow: "hidden" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Trust Level</th>
                <th>VMS</th>
                <th>Balance</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: "center", padding: "40px", color: "#9CA3AF" }}>Loading customers…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: "center", padding: "40px", color: "#9CA3AF" }}>No customers found</td></tr>
              ) : filtered.map((user: any) => (
                <tr key={user.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#EEF0FF", color: "#5145FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 600, flexShrink: 0 }}>
                        {(user.name ?? user.email)[0].toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 500, color: "#111827" }}>{user.name ?? "—"}</div>
                        <div style={{ fontSize: "12px", color: "#9CA3AF" }}>{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{
                      padding: "3px 10px", borderRadius: "99px", fontSize: "11.5px", fontWeight: 600,
                      background: user.status === "active" ? "#D1FAE5" : user.status === "flagged" ? "#FEF3C7" : user.status === "banned" ? "#FEE2E2" : "#F3F4F6",
                      color: user.status === "active" ? "#059669" : user.status === "flagged" ? "#D97706" : user.status === "banned" ? "#DC2626" : "#6B7280",
                    }}>
                      {user.status}
                    </span>
                  </td>
                  <td><span style={{ fontWeight: 600 }}>{user._count?.VPSInstance ?? 0}</span></td>
                  <td><span style={{ fontWeight: 600, color: "#059669" }}>${(user.walletBalance ?? 0).toFixed(2)}</span></td>
                  <td>
                    {user.status === "banned"
                      ? <span className="badge badge-danger">Banned</span>
                      : <span className="badge badge-success">Active</span>}
                  </td>
                  <td style={{ color: "#9CA3AF", fontSize: "12.5px" }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: "flex", gap: "5px" }}>
                      <button onClick={() => setBalanceTarget(user)} style={{
                        padding: "5px 10px", borderRadius: "6px", border: "none",
                        background: "#D1FAE5", color: "#059669", fontSize: "12px", fontWeight: 600, cursor: "pointer",
                      }}>
                        Balance
                      </button>
                      {user.status === "banned" ? (
                        <button onClick={() => unban(user.id)} disabled={unbanLoading === user.id} style={{
                          padding: "5px 10px", borderRadius: "6px", border: "none",
                          background: "#EEF0FF", color: "#5145FF", fontSize: "12px", fontWeight: 600, cursor: "pointer",
                        }}>
                          {unbanLoading === user.id ? "…" : "Unban"}
                        </button>
                      ) : (
                        <button onClick={() => setBanTarget(user)} style={{
                          padding: "5px 10px", borderRadius: "6px", border: "none",
                          background: "#FEE2E2", color: "#DC2626", fontSize: "12px", fontWeight: 600, cursor: "pointer",
                        }}>
                          Ban
                        </button>
                      )}
                    </div>
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
