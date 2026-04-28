"use client";
import Sidebar from "@/components/Sidebar";
import { useState, useEffect } from "react";

type DOAccount = {
  id: string;
  name: string;
  apiKey: string;
  status: string;
  limit: number;
  usage: number;
  createdAt: string;
};

// DigitalOcean official logo SVG
const DOLogo = () => (
  <svg width="22" height="22" viewBox="0 0 209 209" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M104.5 0C46.8 0 0 46.8 0 104.5c0 57.7 46.8 104.5 104.5 104.5 57.7 0 104.5-46.8 104.5-104.5C209 46.8 162.2 0 104.5 0z" fill="#0080FF"/>
    <path d="M104.5 174.7V145c-22 0-40.5-18.5-40.5-40.5S82.5 64 104.5 64c22 0 40.5 18.5 40.5 40.5h29.4c0-38.6-31.3-69.9-69.9-69.9S34.6 65.9 34.6 104.5s31.3 69.9 69.9 69.9v.3z" fill="white"/>
    <path d="M104.5 145v29.7H74.8V145h29.7zM74.8 174.7v-23h-23v23h23zM51.8 151.7v-17h-17v17h17z" fill="white"/>
  </svg>
);

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<DOAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newAccount, setNewAccount] = useState({ name: "", apiKey: "" });
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<{ ok: boolean; message: string; dropletCount?: number } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/accounts")
      .then(r => r.json())
      .then(d => { setAccounts(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function verifyKey() {
    if (!newAccount.apiKey.trim()) return;
    setVerifying(true);
    setVerifyResult(null);
    try {
      const res = await fetch("/api/do/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: newAccount.apiKey }),
      });
      const data = await res.json();
      setVerifyResult(data);
    } catch {
      setVerifyResult({ ok: false, message: "Network error" });
    }
    setVerifying(false);
  }

  async function addAccount() {
    if (!newAccount.name || !newAccount.apiKey || !verifyResult?.ok) return;
    setSaving(true);
    await fetch("/api/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newAccount),
    });
    setSaving(false);
    setShowAdd(false);
    setNewAccount({ name: "", apiKey: "" });
    setVerifyResult(null);
    fetch("/api/accounts").then(r => r.json()).then(setAccounts);
  }

  function maskKey(key: string) {
    if (key.length < 8) return "••••••••";
    return key.slice(0, 6) + "••••••••••••" + key.slice(-4);
  }

  function usagePct(usage: number, limit: number) {
    return limit === 0 ? 0 : Math.min((usage / limit) * 100, 100);
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F8F9FA" }}>
      <Sidebar />

      <main style={{ flex: 1, padding: "28px 32px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <DOLogo />
              <h1 className="section-title">DigitalOcean Accounts</h1>
            </div>
            <p className="section-subtitle" style={{ marginLeft: "32px" }}>Manage API keys and droplet quotas</p>
          </div>
          <button className="btn-primary" onClick={() => setShowAdd(true)}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add DO Account
          </button>
        </div>

        {/* Account Cards */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px", color: "#9CA3AF" }}>Loading accounts…</div>
        ) : accounts.length === 0 ? (
          <div className="card" style={{ padding: "60px", textAlign: "center" }}>
            <DOLogo />
            <div style={{ marginTop: "16px", fontSize: "16px", fontWeight: 600, color: "#111827" }}>No Accounts Added</div>
            <div style={{ fontSize: "13.5px", color: "#9CA3AF", marginTop: "6px" }}>Connect a DigitalOcean account to start provisioning droplets.</div>
            <button className="btn-primary" style={{ marginTop: "20px" }} onClick={() => setShowAdd(true)}>Add Your First Account</button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "18px" }}>
            {accounts.map(acc => {
              const pct = usagePct(acc.usage, acc.limit);
              const pctColor = pct > 80 ? "#EF4444" : pct > 60 ? "#F59E0B" : "#5145FF";
              return (
                <div key={acc.id} className="card card-hover" style={{ padding: "22px" }}>
                  {/* Card header */}
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "11px" }}>
                      <div style={{ width: "42px", height: "42px", background: "#E8F4FF", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <DOLogo />
                      </div>
                      <div>
                        <div style={{ fontSize: "15px", fontWeight: 600, color: "#111827" }}>{acc.name}</div>
                        <div style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "2px", fontFamily: "monospace" }}>{maskKey(acc.apiKey)}</div>
                      </div>
                    </div>
                    <span className={`badge ${acc.status === "active" ? "badge-success" : "badge-danger"}`}>
                      {acc.status.charAt(0).toUpperCase() + acc.status.slice(1)}
                    </span>
                  </div>

                  {/* Droplet usage */}
                  <div style={{ marginBottom: "14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ fontSize: "12.5px", color: "#6B7280" }}>Droplet Usage</span>
                      <span style={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>
                        {acc.usage} / {acc.limit} droplets
                      </span>
                    </div>
                    <div style={{ height: "6px", background: "#F3F4F6", borderRadius: "99px", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: pctColor, borderRadius: "99px", transition: "width 0.5s ease" }} />
                    </div>
                    <div style={{ textAlign: "right", fontSize: "11px", color: "#9CA3AF", marginTop: "4px" }}>{pct.toFixed(0)}% utilised</div>
                  </div>

                  {/* Footer */}
                  <div style={{ borderTop: "1px solid #F3F4F6", paddingTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "12px", color: "#9CA3AF" }}>Added {new Date(acc.createdAt).toLocaleDateString()}</span>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button className="btn-outline" style={{ padding: "5px 12px", fontSize: "12px" }}>View Droplets</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ── Add Account Modal ── */}
      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "22px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "36px", height: "36px", background: "#E8F4FF", borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <DOLogo />
                </div>
                <div>
                  <div style={{ fontSize: "17px", fontWeight: 700, color: "#111827" }}>Connect DigitalOcean</div>
                  <div style={{ fontSize: "12px", color: "#9CA3AF" }}>Add an API key to manage droplets</div>
                </div>
              </div>
              <button onClick={() => setShowAdd(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", fontSize: "22px", lineHeight: 1 }}>×</button>
            </div>

            <div style={{ display: "grid", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "13px", fontWeight: 500, color: "#374151", display: "block", marginBottom: "6px" }}>Account Name</label>
                <input
                  className="input-field"
                  placeholder="e.g. Production SG"
                  value={newAccount.name}
                  onChange={e => setNewAccount({ ...newAccount, name: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: "13px", fontWeight: 500, color: "#374151", display: "block", marginBottom: "6px" }}>DigitalOcean API Key</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    className="input-field"
                    placeholder="dop_v1_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    value={newAccount.apiKey}
                    onChange={e => {
                      setNewAccount({ ...newAccount, apiKey: e.target.value });
                      setVerifyResult(null);
                    }}
                    style={{ fontFamily: "monospace", fontSize: "13px" }}
                  />
                  <button
                    className="btn-outline"
                    style={{ whiteSpace: "nowrap", flexShrink: 0 }}
                    onClick={verifyKey}
                    disabled={verifying || !newAccount.apiKey.trim()}
                  >
                    {verifying ? "…" : "Verify"}
                  </button>
                </div>
              </div>

              {/* Verify result */}
              {verifyResult && (
                <div style={{
                  padding: "12px 14px", borderRadius: "9px",
                  background: verifyResult.ok ? "#ECFDF5" : "#FEF2F2",
                  border: `1px solid ${verifyResult.ok ? "#A7F3D0" : "#FECACA"}`,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                    <span style={{ fontSize: "16px" }}>{verifyResult.ok ? "✅" : "❌"}</span>
                    <div>
                      <div style={{ fontSize: "13.5px", fontWeight: 600, color: verifyResult.ok ? "#059669" : "#DC2626" }}>
                        {verifyResult.ok ? "API Key Verified!" : "Verification Failed"}
                      </div>
                      <div style={{ fontSize: "12px", color: "#6B7280", marginTop: "1px" }}>{verifyResult.message}</div>
                      {verifyResult.dropletCount !== undefined && (
                        <div style={{ fontSize: "12px", color: "#6B7280" }}>Active droplets: <strong>{verifyResult.dropletCount}</strong></div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div style={{
                background: "#F8F9FA", padding: "12px 14px", borderRadius: "8px",
                fontSize: "12.5px", color: "#6B7280", lineHeight: 1.5,
              }}>
                💡 Generate your API key at{" "}
                <a href="https://cloud.digitalocean.com/account/api/tokens" target="_blank" rel="noreferrer" style={{ color: "#5145FF", textDecoration: "none" }}>
                  cloud.digitalocean.com → API → Generate New Token
                </a>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "22px" }}>
              <button className="btn-outline" style={{ flex: 1 }} onClick={() => setShowAdd(false)}>Cancel</button>
              <button
                className="btn-primary"
                style={{ flex: 1, opacity: (!verifyResult?.ok || saving) ? 0.5 : 1 }}
                onClick={addAccount}
                disabled={!verifyResult?.ok || saving || !newAccount.name}
              >
                {saving ? "Adding…" : "Add Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
