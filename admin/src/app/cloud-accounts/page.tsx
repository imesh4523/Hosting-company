"use client";
import { useState, useEffect } from "react";

interface CloudAccount {
  id: string;
  name: string;
  provider: string;
  credits: number;
  creditExpiry: string | null;
  daysRemaining: number | null;
  vmCount: number;
  vmLimit: number;
  status: string;
}

const PROVIDERS = [
  { 
    id: "digitalocean", 
    name: "DigitalOcean", 
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.012 2C6.49 2 2.012 6.478 2.012 12C2.012 14.53 2.956 16.84 4.512 18.608L6.444 16.676C5.46 15.42 4.88 13.82 4.88 12.068C4.88 8.128 8.072 4.936 12.012 4.936V2Z" fill="#0080FF"/>
        <path d="M12.012 2V4.936C15.952 4.936 19.144 8.128 19.144 12.068C19.144 13.82 18.564 15.42 17.58 16.676L19.512 18.608C21.068 16.84 22.012 14.53 22.012 12C22.012 6.478 17.534 2 12.012 2Z" fill="#0080FF"/>
        <circle cx="12.012" cy="12.068" r="3.216" fill="#0080FF"/>
        <rect x="10.404" y="15.284" width="3.216" height="3.216" fill="#0080FF"/>
        <rect x="7.188" y="12.068" width="3.216" height="3.216" fill="#0080FF"/>
      </svg>
    )
  },
  { 
    id: "vultr", 
    name: "Vultr", 
    icon: (
      <svg width="24" height="24" viewBox="0 0 45 45" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.5 0L45 11.25V33.75L22.5 45L0 33.75V11.25L22.5 0Z" fill="#007BFF"/>
        <path d="M22.5 11.25L33.75 16.875V28.125L22.5 33.75L11.25 28.125V16.875L22.5 11.25Z" fill="white"/>
      </svg>
    )
  },
  { 
    id: "linode", 
    name: "Linode", 
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 4.5c4.142 0 7.5 3.358 7.5 7.5s-3.358 7.5-7.5 7.5-7.5-3.358-7.5-7.5 3.358-7.5 7.5-7.5z" fill="#00B050"/>
        <path d="M12 6.75a5.25 5.25 0 100 10.5 5.25 5.25 0 000-10.5z" fill="#00B050"/>
      </svg>
    )
  },
  { 
    id: "aws", 
    name: "AWS EC2", 
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="#FF9900"/>
        <path d="M15.5 11.5c.55 0 1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1v2c0 .55.45 1 1 1zm-7 0c.55 0 1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1v2c0 .55.45 1 1 1z" fill="#FF9900"/>
        <path d="M12 16c2.21 0 4-1.79 4-4H8c0 2.21 1.79 4 4 4z" fill="#FF9900"/>
      </svg>
    )
  },
  { 
    id: "azure", 
    name: "Azure", 
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5.5 2L1 18.5h7L5.5 2z" fill="#0089D6"/>
        <path d="M5.5 2l5.5 16.5h12L5.5 2z" fill="#0072C6"/>
      </svg>
    )
  },
  { 
    id: "upcloud", 
    name: "UpCloud", 
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L4 10h5v12h6V10h5L12 2z" fill="#FF6B00"/>
      </svg>
    )
  },
  { 
    id: "kamatera", 
    name: "Kamatera", 
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="#E60000"/>
        <path d="M12 6v12M6 12h12" stroke="white" strokeWidth="2"/>
      </svg>
    )
  },
];

export default function CloudAccountsPage() {
  const [accounts, setAccounts] = useState<CloudAccount[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Mock data for initial UI presentation
  useEffect(() => {
    const fetchData = () => {
      // In real scenario, fetch from /api/admin/cloud-accounts
      setAccounts([
        { id: "1", name: "DO-Trial-1", provider: "digitalocean", credits: 45.20, creditExpiry: "5 days", daysRemaining: 5, vmCount: 8, vmLimit: 10, status: "warning" },
        { id: "2", name: "Vultr-Main", provider: "vultr", credits: 120.00, creditExpiry: "No exp", daysRemaining: null, vmCount: 12, vmLimit: 40, status: "healthy" },
        { id: "3", name: "Linode-SG", provider: "linode", credits: 200.00, creditExpiry: "30 days", daysRemaining: 30, vmCount: 5, vmLimit: 20, status: "healthy" },
      ]);
      setLoading(false);
    };

    fetchData();
    const interval = setInterval(fetchData, 15000); // Auto refresh every 15s
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: "30px", background: "#F9FAFB", minHeight: "100vh" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#111827", margin: 0 }}>☁️ Cloud Accounts Manager</h1>
          <p style={{ color: "#6B7280", fontSize: "14px", marginTop: "4px" }}>Monitor credits and manage multi-cloud availability</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          style={{
            background: "#457BFF", color: "white", padding: "10px 20px", borderRadius: "8px",
            border: "none", fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 12px rgba(69,123,255,0.25)"
          }}
        >
          + Add Account
        </button>
      </div>

      <div style={{ background: "white", borderRadius: "12px", border: "1px solid #E5E7EB", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#F9FAFB" }}>
            <tr>
              <th style={{ textAlign: "left", padding: "15px 20px", fontSize: "12px", fontWeight: 600, color: "#6B7280", textTransform: "uppercase" }}>Provider</th>
              <th style={{ textAlign: "left", padding: "15px 20px", fontSize: "12px", fontWeight: 600, color: "#6B7280", textTransform: "uppercase" }}>Name</th>
              <th style={{ textAlign: "left", padding: "15px 20px", fontSize: "12px", fontWeight: 600, color: "#6B7280", textTransform: "uppercase" }}>Credits</th>
              <th style={{ textAlign: "left", padding: "15px 20px", fontSize: "12px", fontWeight: 600, color: "#6B7280", textTransform: "uppercase" }}>Expiry</th>
              <th style={{ textAlign: "left", padding: "15px 20px", fontSize: "12px", fontWeight: 600, color: "#6B7280", textTransform: "uppercase" }}>VMs</th>
              <th style={{ textAlign: "left", padding: "15px 20px", fontSize: "12px", fontWeight: 600, color: "#6B7280", textTransform: "uppercase" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((acc: any) => (
              <tr key={acc.id} style={{ borderBottom: "1px solid #F3F4F6" }}>
                <td style={{ padding: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "24px", height: "24px" }}>
                      {PROVIDERS.find(p => p.id === acc.provider)?.icon}
                    </div>
                    <span style={{ fontWeight: 600, fontSize: "14px", color: "#111827" }}>{acc.provider.toUpperCase()}</span>
                  </div>
                </td>
                <td style={{ padding: "20px", fontSize: "14px", fontWeight: 500 }}>{acc.name}</td>
                <td style={{ padding: "20px" }}>
                  <div style={{ fontSize: "14px", fontWeight: 700 }}>${acc.credits.toFixed(2)}</div>
                  <div style={{ width: "100px", height: "6px", background: "#E5E7EB", borderRadius: "3px", marginTop: "6px", overflow: "hidden" }}>
                    <div style={{ width: `${(acc.vmCount/acc.vmLimit)*100}%`, height: "100%", background: acc.status === 'warning' ? '#F59E0B' : '#10B981' }}></div>
                  </div>
                </td>
                <td style={{ padding: "20px", fontSize: "14px", color: acc.status === 'warning' ? '#D97706' : '#111827' }}>
                  {acc.creditExpiry}
                </td>
                <td style={{ padding: "20px", fontSize: "14px" }}>
                  <strong>{acc.vmCount}</strong> / {acc.vmLimit}
                </td>
                <td style={{ padding: "20px" }}>
                  <span style={{
                    padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 700,
                    background: acc.status === 'healthy' ? '#D1FAE5' : '#FEF3C7',
                    color: acc.status === 'healthy' ? '#065F46' : '#92400E',
                    textTransform: "uppercase"
                  }}>
                    {acc.status === 'healthy' ? '🟢 Healthy' : '⚠️ Expiring'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
        }}>
          <div style={{ background: "white", padding: "30px", borderRadius: "16px", width: "450px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "20px" }}>+ Add Cloud Account</h2>
            
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>Provider:</label>
              <select style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #D1D5DB", outline: "none" }}>
                {PROVIDERS.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>Account Name:</label>
              <input type="text" placeholder="e.g. My-Vultr-Primary" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #D1D5DB", outline: "none" }} />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>API Key / Token:</label>
              <input type="password" placeholder="Paste your API key here" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #D1D5DB", outline: "none" }} />
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button 
                onClick={() => setShowModal(false)}
                style={{ flex: 1, padding: "12px", borderRadius: "8px", border: "1px solid #E5E7EB", background: "white", fontWeight: 600, cursor: "pointer" }}
              >
                Cancel
              </button>
              <button style={{ flex: 2, padding: "12px", borderRadius: "8px", border: "none", background: "#457BFF", color: "white", fontWeight: 600, cursor: "pointer" }}>
                Save Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
