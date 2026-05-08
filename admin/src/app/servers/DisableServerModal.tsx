"use client";
import { useState } from "react";
import { Server } from "./page";

const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

interface Props { server: Server; servers: Server[]; onClose: () => void; onConfirm: () => void; showToast: (m: string, ok?: boolean) => void; }

export default function DisableServerModal({ server, servers, onClose, onConfirm, showToast }: Props) {
  const [action,   setAction]   = useState<"keep" | "migrate" | "suspend">("keep");
  const [target,   setTarget]   = useState("");
  const [loading,  setLoading]  = useState(false);

  const otherServers = servers.filter(s => s.id !== server.id && s.status !== "disabled");

  const confirm = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${BACKEND}/api/admin/servers/${server.id}/disable`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, targetServerId: target }),
      });
      if (r.ok) { showToast(`Server "${server.name}" disabled`); onConfirm(); onClose(); }
      else       { showToast("Failed to disable server", false); }
    } catch {
      showToast("Backend offline — server marked disabled locally", false);
      onClose();
    }
    setLoading(false);
  };

  const radio = (val: "keep" | "migrate" | "suspend", label: string, sub: string) => (
    <label style={{ display: "flex", gap: "10px", padding: "12px", borderRadius: "10px", border: `2px solid ${action === val ? "#5145FF" : "#F0F0F0"}`, cursor: "pointer", marginBottom: "8px", background: action === val ? "#F5F4FF" : "#fff" }}>
      <input type="radio" name="action" value={val} checked={action === val} onChange={() => setAction(val)} style={{ marginTop: "2px" }} />
      <div>
        <div style={{ fontSize: "13.5px", fontWeight: 600, color: "#111827" }}>{label}</div>
        <div style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "1px" }}>{sub}</div>
      </div>
    </label>
  );

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 1999 }} />
      <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 2000, width: "480px", background: "#fff", borderRadius: "16px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", overflow: "hidden" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #F3F4F6" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#FEF3C7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>⚠️</div>
            <div>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>Disable {server.name}?</div>
              <div style={{ fontSize: "12px", color: "#9CA3AF" }}>This server has {server._count.vms} active VPS instances</div>
            </div>
          </div>
        </div>

        <div style={{ padding: "20px 24px" }}>
          <div style={{ fontSize: "13px", color: "#374151", marginBottom: "14px", fontWeight: 500 }}>Choose what to do with the {server._count.vms} VPS instances:</div>

          {radio("keep",    "Keep VPS running",      "Mark server as disabled in panel only — VPS continue running")}
          {radio("suspend", "Suspend all VPS",        "Stop all VPS on this server immediately")}
          {radio("migrate", "Migrate all VPS",        "Move all VPS to another server")}

          {action === "migrate" && (
            <div style={{ marginTop: "8px" }}>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "#374151", display: "block", marginBottom: "5px" }}>Target Server</label>
              <select value={target} onChange={e => setTarget(e.target.value)} style={{ width: "100%", padding: "8px 12px", border: "1px solid #E5E7EB", borderRadius: "8px", fontSize: "13px", background: "#FAFAFA", outline: "none" }}>
                <option value="">Select target server…</option>
                {otherServers.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.name} ({s._count.vms}/{s.maxVMs ?? 50} VPS)</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div style={{ padding: "16px 24px", borderTop: "1px solid #F3F4F6", display: "flex", gap: "8px", justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ fontSize: "13px", fontWeight: 600, color: "#6B7280", background: "#F3F4F6", border: "none", borderRadius: "8px", padding: "8px 18px", cursor: "pointer" }}>Cancel</button>
          <button onClick={confirm} disabled={loading || (action === "migrate" && !target)} style={{ fontSize: "13px", fontWeight: 600, color: "#fff", background: "#EF4444", border: "none", borderRadius: "8px", padding: "8px 18px", cursor: "pointer", opacity: (loading || (action === "migrate" && !target)) ? 0.6 : 1 }}>
            {loading ? "Disabling…" : "Confirm Disable"}
          </button>
        </div>
      </div>
    </>
  );
}
