"use client";
import Sidebar from "@/components/Sidebar";
import { useState, useEffect } from "react";

type User = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  fraudScore: number;
  trustLevel: string;
  suspended: boolean;
  createdAt: string;
  _count?: { vps: number; invoices: number; tickets: number };
};

function FraudBadge({ score }: { score: number }) {
  if (score < 0.3) return <span className="badge badge-success">● Safe ({(score * 100).toFixed(0)})</span>;
  if (score < 0.6) return <span className="badge badge-warning">● Medium ({(score * 100).toFixed(0)})</span>;
  return <span className="badge badge-danger">● High Risk ({(score * 100).toFixed(0)})</span>;
}

function TrustBadge({ level }: { level: string }) {
  const map: Record<string, string> = {
    trusted: "badge-success",
    new: "badge-info",
    flagged: "badge-warning",
    banned: "badge-danger",
  };
  return <span className={`badge ${map[level] ?? "badge-info"}`}>{level.charAt(0).toUpperCase() + level.slice(1)}</span>;
}

export default function CustomersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editUser, setEditUser] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/users")
      .then(r => r.json())
      .then(data => { setUsers(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = users.filter(u =>
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  async function saveEdit() {
    if (!editUser) return;
    setSaving(true);
    await fetch(`/api/users/${editUser.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editUser.name,
        trustLevel: editUser.trustLevel,
        suspended: editUser.suspended,
        fraudScore: editUser.fraudScore,
      }),
    });
    setSaving(false);
    setEditUser(null);
    // Refresh
    fetch("/api/users").then(r => r.json()).then(setUsers);
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F8F9FA" }}>
      <Sidebar />

      <main style={{ flex: 1, padding: "28px 32px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
          <div>
            <h1 className="section-title">Customer Management</h1>
            <p className="section-subtitle">Manage users, fraud scores, and trust levels</p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <input
              className="input-field"
              style={{ width: "220px" }}
              placeholder="Search by name or email…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Stats Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "22px" }}>
          {[
            { label: "Total Customers", value: users.length, icon: "icon-blue" },
            { label: "Trusted Users", value: users.filter(u => u.trustLevel === "trusted").length, icon: "icon-green" },
            { label: "Flagged", value: users.filter(u => u.trustLevel === "flagged").length, icon: "icon-orange" },
            { label: "Suspended", value: users.filter(u => u.suspended).length, icon: "icon-red" },
          ].map((s, i) => (
            <div key={i} className="card" style={{ padding: "16px 18px", display: "flex", alignItems: "center", gap: "12px" }}>
              <span className={`icon-box icon-box-md ${s.icon}`}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/>
                </svg>
              </span>
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
                <th>Fraud Score</th>
                <th>VPS</th>
                <th>Invoices</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: "40px", color: "#9CA3AF" }}>Loading customers…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: "40px", color: "#9CA3AF" }}>No customers found</td></tr>
              ) : (
                filtered.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{
                          width: "32px", height: "32px", borderRadius: "50%",
                          background: "#EEF0FF", color: "#5145FF",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "13px", fontWeight: 600, flexShrink: 0,
                        }}>
                          {(user.name ?? user.email)[0].toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500, color: "#111827" }}>{user.name ?? "—"}</div>
                          <div style={{ fontSize: "12px", color: "#9CA3AF" }}>{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><TrustBadge level={user.trustLevel} /></td>
                    <td><FraudBadge score={user.fraudScore} /></td>
                    <td><span style={{ fontWeight: 600 }}>{user._count?.vps ?? 0}</span></td>
                    <td><span style={{ fontWeight: 600 }}>{user._count?.invoices ?? 0}</span></td>
                    <td>
                      {user.suspended
                        ? <span className="badge badge-danger">Suspended</span>
                        : <span className="badge badge-success">Active</span>
                      }
                    </td>
                    <td style={{ color: "#9CA3AF", fontSize: "12.5px" }}>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <button
                        className="btn-outline"
                        style={{ padding: "5px 12px", fontSize: "12.5px" }}
                        onClick={() => setEditUser(user)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* ── Edit User Modal ── */}
      {editUser && (
        <div className="modal-overlay" onClick={() => setEditUser(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "22px" }}>
              <div>
                <div style={{ fontSize: "17px", fontWeight: 700, color: "#111827" }}>Edit Customer</div>
                <div style={{ fontSize: "12.5px", color: "#9CA3AF", marginTop: "2px" }}>{editUser.email}</div>
              </div>
              <button onClick={() => setEditUser(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", fontSize: "22px", lineHeight: 1 }}>×</button>
            </div>

            {/* Fraud Score Display */}
            <div style={{ background: "#F8F9FA", borderRadius: "10px", padding: "14px 16px", marginBottom: "18px" }}>
              <div style={{ fontSize: "12px", color: "#6B7280", marginBottom: "6px", fontWeight: 500 }}>FRAUD RISK ASSESSMENT</div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ fontSize: "30px", fontWeight: 700, color: editUser.fraudScore < 0.3 ? "#10B981" : editUser.fraudScore < 0.6 ? "#F59E0B" : "#EF4444" }}>
                  {(editUser.fraudScore * 100).toFixed(0)}
                  <span style={{ fontSize: "16px", color: "#9CA3AF" }}>/100</span>
                </div>
                <FraudBadge score={editUser.fraudScore} />
              </div>
              <div style={{ marginTop: "8px", height: "6px", background: "#E5E7EB", borderRadius: "99px", overflow: "hidden" }}>
                <div style={{
                  height: "100%", width: `${editUser.fraudScore * 100}%`, borderRadius: "99px",
                  background: editUser.fraudScore < 0.3 ? "#10B981" : editUser.fraudScore < 0.6 ? "#F59E0B" : "#EF4444"
                }} />
              </div>
            </div>

            {/* Fields */}
            <div style={{ display: "grid", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "13px", fontWeight: 500, color: "#374151", display: "block", marginBottom: "6px" }}>Display Name</label>
                <input
                  className="input-field"
                  value={editUser.name ?? ""}
                  onChange={e => setEditUser({ ...editUser, name: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: "13px", fontWeight: 500, color: "#374151", display: "block", marginBottom: "6px" }}>Trust Level</label>
                <select
                  className="input-field"
                  value={editUser.trustLevel}
                  onChange={e => setEditUser({ ...editUser, trustLevel: e.target.value })}
                >
                  <option value="new">New</option>
                  <option value="trusted">Trusted</option>
                  <option value="flagged">Flagged</option>
                  <option value="banned">Banned</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "13px", fontWeight: 500, color: "#374151", display: "block", marginBottom: "6px" }}>
                  Fraud Score: {(editUser.fraudScore * 100).toFixed(0)}/100
                </label>
                <input
                  type="range" min={0} max={1} step={0.01}
                  value={editUser.fraudScore}
                  onChange={e => setEditUser({ ...editUser, fraudScore: parseFloat(e.target.value) })}
                  style={{ width: "100%", accentColor: "#5145FF" }}
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#F8F9FA", padding: "12px 14px", borderRadius: "8px" }}>
                <div>
                  <div style={{ fontSize: "13.5px", fontWeight: 500, color: "#111827" }}>Suspend Account</div>
                  <div style={{ fontSize: "12px", color: "#9CA3AF" }}>Block user from accessing services</div>
                </div>
                <button
                  onClick={() => setEditUser({ ...editUser, suspended: !editUser.suspended })}
                  style={{
                    width: "42px", height: "24px", borderRadius: "99px", border: "none", cursor: "pointer",
                    background: editUser.suspended ? "#EF4444" : "#E5E7EB",
                    position: "relative", transition: "background 0.2s",
                  }}
                >
                  <span style={{
                    position: "absolute", top: "3px",
                    left: editUser.suspended ? "21px" : "3px",
                    width: "18px", height: "18px", borderRadius: "50%",
                    background: "white", transition: "left 0.2s",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                  }} />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: "10px", marginTop: "22px" }}>
              <button className="btn-outline" style={{ flex: 1 }} onClick={() => setEditUser(null)}>Cancel</button>
              <button className="btn-primary" style={{ flex: 1 }} onClick={saveEdit} disabled={saving}>
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
