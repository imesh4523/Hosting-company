"use client";
import { useState } from "react";
import { Server } from "./page";

const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

interface Props {
  server: Server;
  onClose: () => void;
  onSave: () => void;
  showToast: (msg: string, ok?: boolean) => void;
}

export default function EditServerModal({ server, onClose, onSave, showToast }: Props) {
  const [form, setForm] = useState({
    name: server.name, apiUrl: server.apiUrl, apiUser: server.apiUser ?? "root@pam",
    apiKey: "", region: server.region ?? "", node: server.node ?? "pve",
    maxVMs: server.maxVMs ?? 50, notes: "",
  });
  const [testing,  setTesting]  = useState(false);
  const [testRes,  setTestRes]  = useState<{ ok: boolean; msg: string } | null>(null);
  const [saving,   setSaving]   = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const testConn = async () => {
    setTesting(true); setTestRes(null);
    try {
      const r = await fetch(`${BACKEND}/api/admin/servers/${server.id}/test`, { method: "POST" });
      const d = await r.json();
      setTestRes({ ok: d.ok, msg: d.ok ? `✅ Connected · Proxmox v${d.version}` : `❌ Failed: ${d.error}` });
    } catch {
      setTestRes({ ok: false, msg: "❌ Could not reach backend" });
    }
    setTesting(false);
  };

  const save = async () => {
    setSaving(true);
    try {
      const r = await fetch(`${BACKEND}/api/admin/servers/${server.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (r.ok) { showToast(`Server "${form.name}" updated`); onSave(); onClose(); }
      else       { showToast("Failed to save server", false); }
    } catch {
      showToast("Backend offline — changes not saved", false);
    }
    setSaving(false);
  };

  const inputStyle = { width: "100%", padding: "8px 12px", border: "1px solid #E5E7EB", borderRadius: "8px", fontSize: "13px", color: "#111827", background: "#FAFAFA", outline: "none", boxSizing: "border-box" as const };
  const label = (t: string) => <label style={{ fontSize: "12px", fontWeight: 600, color: "#374151", display: "block", marginBottom: "4px" }}>{t}</label>;

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 1999 }} />
      <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 2000, width: "520px", background: "#fff", borderRadius: "16px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", overflow: "hidden" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #F3F4F6", display: "flex", justifyContent: "space-between" }}>
          <div style={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>Edit Server · {server.name}</div>
          <button onClick={onClose} style={{ background: "#F3F4F6", border: "none", borderRadius: "8px", width: "28px", height: "28px", cursor: "pointer", fontSize: "16px", color: "#6B7280" }}>×</button>
        </div>

        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>{label("Server Name")}<input style={inputStyle} value={form.name} onChange={set("name")} /></div>
            <div>{label("Host / IP")}<input style={inputStyle} value={form.apiUrl} onChange={set("apiUrl")} /></div>
            <div>{label("Username")}<input style={inputStyle} value={form.apiUser} onChange={set("apiUser")} /></div>
            <div>{label("Password")}<input style={{ ...inputStyle, fontFamily: "monospace" }} type="password" placeholder="Leave blank to keep current" value={form.apiKey} onChange={set("apiKey")} /></div>
            <div>{label("Proxmox Node")}<input style={inputStyle} value={form.node} onChange={set("node")} /></div>
            <div>{label("Region")}<input style={inputStyle} value={form.region} onChange={set("region")} /></div>
            <div>{label("Max VMs")}<input style={inputStyle} type="number" value={form.maxVMs} onChange={set("maxVMs")} /></div>
          </div>
          <div>{label("Notes")}<textarea style={{ ...inputStyle, height: "60px", resize: "none" }} value={form.notes} onChange={set("notes")} /></div>

          {testRes && (
            <div style={{ padding: "10px 14px", borderRadius: "8px", background: testRes.ok ? "#D1FAE5" : "#FEE2E2", fontSize: "13px", color: testRes.ok ? "#059669" : "#DC2626", fontWeight: 500 }}>
              {testRes.msg}
            </div>
          )}
        </div>

        <div style={{ padding: "16px 24px", borderTop: "1px solid #F3F4F6", display: "flex", gap: "8px", justifyContent: "flex-end" }}>
          <button onClick={testConn} disabled={testing} style={{ fontSize: "13px", fontWeight: 600, color: "#5145FF", background: "#EEF0FF", border: "none", borderRadius: "8px", padding: "8px 18px", cursor: "pointer" }}>
            {testing ? "Testing…" : "Test Connection"}
          </button>
          <button onClick={onClose} style={{ fontSize: "13px", fontWeight: 600, color: "#6B7280", background: "#F3F4F6", border: "none", borderRadius: "8px", padding: "8px 18px", cursor: "pointer" }}>
            Cancel
          </button>
          <button onClick={save} disabled={saving} style={{ fontSize: "13px", fontWeight: 600, color: "#fff", background: "#5145FF", border: "none", borderRadius: "8px", padding: "8px 18px", cursor: "pointer", opacity: saving ? 0.7 : 1 }}>
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </>
  );
}
