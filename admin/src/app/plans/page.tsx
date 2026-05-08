"use client";
import Sidebar from "@/components/Sidebar";
import { useState, useEffect } from "react";

type Plan = {
  id: string;
  name: string;
  priceMonthly: number;
  priceYearly: number | null;
  ram: string | null;
  cpu: string | null;
  storage: string | null;
  bandwidth: string | null;
  category: { name: string };
  _count?: { vps: number };
};

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newPlan, setNewPlan] = useState({ name: "", priceMonthly: "", ram: "", cpu: "", storage: "", bandwidth: "" });

  useEffect(() => {
    fetch("/api/plans").then(r => r.json()).then(d => { setPlans(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  async function addPlan() {
    await fetch("/api/plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newPlan, priceMonthly: parseFloat(newPlan.priceMonthly) }),
    });
    setShowAdd(false);
    fetch("/api/plans").then(r => r.json()).then(setPlans);
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F8F9FA" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: "28px 32px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
          <div>
            <h1 className="section-title">Hosting Plans</h1>
            <p className="section-subtitle">Manage plans and pricing tiers</p>
          </div>
          <button className="btn-primary" onClick={() => setShowAdd(true)}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New Plan
          </button>
        </div>

        <div className="card" style={{ overflow: "hidden" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Plan Name</th>
                <th>Category</th>
                <th>Monthly Price</th>
                <th>RAM</th>
                <th>CPU</th>
                <th>Storage</th>
                <th>Bandwidth</th>
                <th>Active VPS</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} style={{ textAlign: "center", padding: "40px", color: "#9CA3AF" }}>Loading plans…</td></tr>
              ) : plans.length === 0 ? (
                <tr><td colSpan={9} style={{ textAlign: "center", padding: "40px", color: "#9CA3AF" }}>No plans yet. Add your first plan.</td></tr>
              ) : plans.map((plan: any) => (
                <tr key={plan.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span className="icon-box icon-box-sm icon-purple">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/></svg>
                      </span>
                      <span style={{ fontWeight: 500, color: "#111827" }}>{plan.name}</span>
                    </div>
                  </td>
                  <td><span className="badge badge-info">{plan.category?.name ?? "VPS"}</span></td>
                  <td><span style={{ fontWeight: 700, color: "#5145FF", fontSize: "15px" }}>${plan.priceMonthly}</span><span style={{ fontSize: "11px", color: "#9CA3AF" }}>/mo</span></td>
                  <td style={{ color: "#374151" }}>{plan.ram ?? "—"}</td>
                  <td style={{ color: "#374151" }}>{plan.cpu ?? "—"}</td>
                  <td style={{ color: "#374151" }}>{plan.storage ?? "—"}</td>
                  <td style={{ color: "#374151" }}>{plan.bandwidth ?? "—"}</td>
                  <td><span style={{ fontWeight: 600 }}>{plan._count?.vps ?? 0}</span></td>
                  <td>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button className="btn-outline" style={{ padding: "4px 10px", fontSize: "12px" }}>Edit</button>
                      <button style={{ padding: "4px 10px", fontSize: "12px", background: "#FEF2F2", color: "#EF4444", border: "1px solid #FECACA", borderRadius: "6px", cursor: "pointer" }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "22px" }}>
              <div style={{ fontSize: "17px", fontWeight: 700, color: "#111827" }}>Add New Plan</div>
              <button onClick={() => setShowAdd(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", fontSize: "22px" }}>×</button>
            </div>
            <div style={{ display: "grid", gap: "13px" }}>
              {([["Plan Name","name","e.g. VPS Pro"], ["Monthly Price ($)","priceMonthly","4.99"], ["RAM","ram","2 GB"], ["CPU","cpu","2 vCPUs"], ["Storage","storage","50 GB SSD"], ["Bandwidth","bandwidth","2 TB"]] as [string, string, string][]).map(([label, key, placeholder]) => (
                <div key={key}>
                  <label style={{ fontSize: "13px", fontWeight: 500, color: "#374151", display: "block", marginBottom: "5px" }}>{label}</label>
                  <input className="input-field" placeholder={placeholder} value={(newPlan as Record<string,string>)[key]} onChange={e => setNewPlan({ ...newPlan, [key]: e.target.value })} />
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "22px" }}>
              <button className="btn-outline" style={{ flex: 1 }} onClick={() => setShowAdd(false)}>Cancel</button>
              <button className="btn-primary" style={{ flex: 1 }} onClick={addPlan}>Add Plan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
