"use client";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";

function Section({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#fff", borderRadius: "14px", border: "1px solid #F0F0F0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", padding: "22px", marginBottom: "18px" }}>
      <div style={{ marginBottom: "18px", paddingBottom: "14px", borderBottom: "1px solid #F3F4F6" }}>
        <div style={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>{title}</div>
        <div style={{ fontSize: "12.5px", color: "#9CA3AF", marginTop: "2px" }}>{sub}</div>
      </div>
      {children}
    </div>
  );
}

function Field({ label, placeholder, type = "text", value, mono, onChange }: { label: string; placeholder?: string; type?: string; value?: string; mono?: boolean; onChange?: (val: string) => void }) {
  return (
    <div style={{ marginBottom: "14px" }}>
      <label style={{ fontSize: "12.5px", fontWeight: 600, color: "#374151", display: "block", marginBottom: "5px" }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%", padding: "8px 12px",
          border: "1px solid #E5E7EB", borderRadius: "8px",
          fontSize: "13px", color: "#111827",
          fontFamily: mono ? "monospace" : "inherit",
          background: "#FAFAFA", outline: "none",
          boxSizing: "border-box",
        }}
      />
    </div>
  );
}

function Toggle({ label, sub, on, setOn }: { label: string; sub: string; on: boolean; setOn: (val: boolean) => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #F9FAFB" }}>
      <div>
        <div style={{ fontSize: "13.5px", fontWeight: 500, color: "#111827" }}>{label}</div>
        <div style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "1px" }}>{sub}</div>
      </div>
      <button
        onClick={() => setOn(!on)}
        style={{
          width: "44px", height: "24px", borderRadius: "99px",
          background: on ? "#5145FF" : "#E5E7EB",
          border: "none", cursor: "pointer",
          position: "relative", transition: "background 0.2s ease", flexShrink: 0,
        }}
      >
        <div style={{
          position: "absolute", top: "3px",
          left: on ? "22px" : "3px",
          width: "18px", height: "18px", borderRadius: "50%", background: "#fff",
          transition: "left 0.2s ease", boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
        }} />
      </button>
    </div>
  );
}

import { useEffect } from "react";

export default function SettingsPage() {
  const [stripeEnabled, setStripeEnabled] = useState(false);
  const [stripeSecretKey, setStripeSecretKey] = useState("");
  const [stripePublicKey, setStripePublicKey] = useState("");
  const [stripeWebhookSecret, setStripeWebhookSecret] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings/payment")
      .then(res => res.json())
      .then(res => {
        if (res.success) {
          setStripeEnabled(res.data.stripeEnabled);
          setStripePublicKey(res.data.stripePublicKey || "");
          setStripeSecretKey(res.data.stripeSecretKey || "");
          setStripeWebhookSecret(res.data.stripeWebhookSecret || "");
        }
      });
  }, []);

  const saveStripe = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stripeEnabled,
          stripePublicKey,
          stripeSecretKey,
          stripeWebhookSecret
        })
      });
      const data = await res.json();
      if (data.success) {
        alert("Stripe settings saved successfully!");
      } else {
        alert("Error: " + data.message);
      }
    } catch (e) {
      alert("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F8F9FA" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: "28px 32px", maxWidth: "860px" }}>

        <div style={{ marginBottom: "26px" }}>
          <h1 style={{ fontSize: "21px", fontWeight: 700, color: "#111827", letterSpacing: "-0.4px" }}>Settings</h1>
          <p style={{ fontSize: "13.5px", color: "#6B7280", marginTop: "3px" }}>Platform-wide configuration and integrations.</p>
        </div>

        {/* General */}
        <Section title="General" sub="System-wide toggles and preferences">
          <Toggle label="Maintenance Mode"   sub="Disable customer access — show maintenance page" on={false} setOn={()=>{}} />
          <Toggle label="New Registrations"  sub="Allow new user sign-ups" on={true} setOn={()=>{}} />
          <Toggle label="Auto Failover"      sub="Automatically restore VPS on failure" on={true} setOn={()=>{}} />
          <Toggle label="Fraud Detection"    sub="Enable IPQualityScore risk scoring" on={true} setOn={()=>{}} />
          <Toggle label="Email Notifications" sub="Send emails via Resend on key events" on={true} setOn={()=>{}} />
          <Toggle label="Telegram Alerts"    sub="Send critical alerts to Telegram admin chat" on={true} setOn={()=>{}} />
        </Section>

        {/* Authentication & OAuth */}
        <Section title="Authentication & OAuth" sub="Manage social login methods and security">
          <div style={{ background: "#F9FAFB", padding: "16px", borderRadius: "12px", border: "1px solid #E5E7EB", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>Multi-Provider OAuth</div>
              <div style={{ fontSize: "12px", color: "#6B7280", marginTop: "2px" }}>Configure Google, Facebook, and GitHub login methods</div>
            </div>
            <a 
              href="/settings/auth" 
              style={{ 
                fontSize: "13px", fontWeight: 600, color: "#fff", background: "#5145FF", 
                textDecoration: "none", borderRadius: "8px", padding: "8px 16px", 
                boxShadow: "0 2px 6px rgba(81,69,255,0.2)" 
              }}
            >
              Configure Auth
            </a>
          </div>
        </Section>

        {/* Stripe */}
        <Section title="Stripe Billing" sub="Payment gateway configuration">
          <Toggle label="Enable Stripe" sub="Allow customers to pay via Stripe" on={stripeEnabled} setOn={setStripeEnabled} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginTop: "15px" }}>
            <Field label="Stripe Secret Key" value={stripeSecretKey} onChange={setStripeSecretKey} placeholder="sk_live_..." type="password" mono />
            <Field label="Stripe Webhook Secret" value={stripeWebhookSecret} onChange={setStripeWebhookSecret} placeholder="whsec_..." type="password" mono />
            <Field label="Stripe Publishable Key" value={stripePublicKey} onChange={setStripePublicKey} placeholder="pk_live_..." mono />
          </div>
          <button 
            onClick={saveStripe}
            disabled={loading}
            style={{ 
              marginTop: "6px", fontSize: "13px", fontWeight: 600, color: "#fff", 
              background: loading ? "#9CA3AF" : "#5145FF", border: "none", 
              borderRadius: "8px", padding: "8px 20px", cursor: loading ? "default" : "pointer" 
            }}
          >
            {loading ? "Saving..." : "Save Stripe Config"}
          </button>
        </Section>

        {/* DigitalOcean */}
        <Section title="DigitalOcean API" sub="Default DO account for new droplet provisioning">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <Field label="DO API Key" placeholder="dop_v1_..." type="password" mono />
            <Field label="Default Region" placeholder="sgp1" value="sgp1" />
          </div>
          <button style={{ marginTop: "6px", fontSize: "13px", fontWeight: 600, color: "#fff", background: "#5145FF", border: "none", borderRadius: "8px", padding: "8px 20px", cursor: "pointer" }}>
            Test Connection
          </button>
        </Section>

        {/* Telegram */}
        <Section title="Telegram Bot" sub="Admin notification bot configuration">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <Field label="Bot Token" placeholder="123456:ABC-..." type="password" mono />
            <Field label="Admin Chat ID" placeholder="-1001234567890" mono />
          </div>
          <button style={{ marginTop: "6px", fontSize: "13px", fontWeight: 600, color: "#fff", background: "#5145FF", border: "none", borderRadius: "8px", padding: "8px 20px", cursor: "pointer" }}>
            Send Test Message
          </button>
        </Section>

        {/* Backblaze B2 */}
        <Section title="Backblaze B2 Storage" sub="Backup storage configuration">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <Field label="Key ID"      placeholder="005a4c..." mono />
            <Field label="App Key"     placeholder="K005..." type="password" mono />
            <Field label="Bucket Name" placeholder="vps-backups" />
            <Field label="Backup Schedule (cron)" value="0 2 * * *" mono />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "6px" }}>
            <button style={{ fontSize: "13px", fontWeight: 600, color: "#fff", background: "#5145FF", border: "none", borderRadius: "8px", padding: "8px", cursor: "pointer" }}>
              Save B2 Config
            </button>
            <button style={{ fontSize: "13px", fontWeight: 600, color: "#EF4444", background: "#FEE2E2", border: "none", borderRadius: "8px", padding: "8px", cursor: "pointer" }}>
              Run All Backups Now
            </button>
          </div>
        </Section>

        {/* Email */}
        <Section title="Email (Resend)" sub="Transactional email provider">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <Field label="Resend API Key"  placeholder="re_..." type="password" mono />
            <Field label="From Email"      placeholder="noreply@yourdomain.com" />
          </div>
          <button style={{ marginTop: "6px", fontSize: "13px", fontWeight: 600, color: "#fff", background: "#5145FF", border: "none", borderRadius: "8px", padding: "8px 20px", cursor: "pointer" }}>
            Send Test Email
          </button>
        </Section>

        {/* IPQS */}
        <Section title="Fraud Detection (IPQualityScore)" sub="API-based IP/email risk scoring">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <Field label="IPQS API Key"  placeholder="..." type="password" mono />
            <Field label="Auto-ban threshold (0–100)" value="81" />
          </div>
          <button style={{ marginTop: "6px", fontSize: "13px", fontWeight: 600, color: "#fff", background: "#5145FF", border: "none", borderRadius: "8px", padding: "8px 20px", cursor: "pointer" }}>
            Save Settings
          </button>
        </Section>

      </main>
    </div>
  );
}
