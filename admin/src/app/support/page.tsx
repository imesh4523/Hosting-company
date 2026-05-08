"use client";
import Sidebar from "@/components/Sidebar";
import { useState, useEffect, useCallback } from "react";

type TicketMessage = { id: string; sender: string; message: string; createdAt: string };
type Ticket = {
  id: string; subject: string; status: string; priority: string; createdAt: string; updatedAt: string;
  user: { name: string | null; email: string };
  messages: TicketMessage[];
  _count: { messages: number };
};

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  open:     { bg: "#FEE2E2", color: "#DC2626" },
  pending:  { bg: "#FEF3C7", color: "#D97706" },
  resolved: { bg: "#D1FAE5", color: "#059669" },
  closed:   { bg: "#F3F4F6", color: "#6B7280" },
};

const PRIORITY_COLORS: Record<string, { bg: string; color: string }> = {
  high:   { bg: "#FEE2E2", color: "#DC2626" },
  medium: { bg: "#FEF3C7", color: "#D97706" },
  low:    { bg: "#D1FAE5", color: "#059669" },
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

function TicketModal({ ticket, onClose, onRefresh }: { ticket: Ticket; onClose: () => void; onRefresh: () => void }) {
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<TicketMessage[]>(ticket.messages);
  const [changingStatus, setChangingStatus] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(ticket.status);

  const sendReply = async () => {
    if (!reply.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`/api/admin/support/tickets/${ticket.id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: reply }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages(prev => [...prev, data.message]);
        setReply("");
        onRefresh();
      }
    } finally { setSending(false); }
  };

  const changeStatus = async (status: string) => {
    setChangingStatus(true);
    try {
      const res = await fetch(`/api/admin/support/tickets/${ticket.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) { setCurrentStatus(status); onRefresh(); }
    } finally { setChangingStatus(false); }
  };

  const sc = STATUS_COLORS[currentStatus] ?? STATUS_COLORS.open;
  const pc = PRIORITY_COLORS[ticket.priority] ?? PRIORITY_COLORS.low;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: "620px", maxHeight: "85vh", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "18px" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "16px", fontWeight: 700, color: "#111827", marginBottom: "4px" }}>{ticket.subject}</div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <span style={{ ...sc, padding: "2px 8px", borderRadius: "99px", fontSize: "11px", fontWeight: 600 }}>{currentStatus}</span>
              <span style={{ ...pc, padding: "2px 8px", borderRadius: "99px", fontSize: "11px", fontWeight: 600 }}>{ticket.priority}</span>
              <span style={{ fontSize: "12px", color: "#9CA3AF" }}>#{ticket.id.slice(0, 8)} • {ticket.user.email}</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "22px", cursor: "pointer", color: "#9CA3AF", marginLeft: "10px" }}>×</button>
        </div>

        {/* Status Changer */}
        <div style={{ display: "flex", gap: "6px", marginBottom: "16px" }}>
          {["open", "pending", "resolved", "closed"].map(s => (
            <button key={s} onClick={() => changeStatus(s)} disabled={changingStatus || currentStatus === s}
              style={{
                padding: "4px 12px", borderRadius: "99px", fontSize: "11.5px", fontWeight: 600, cursor: "pointer",
                border: `1px solid ${currentStatus === s ? "#5145FF" : "#E5E7EB"}`,
                background: currentStatus === s ? "#5145FF" : "#fff",
                color: currentStatus === s ? "#fff" : "#6B7280",
              }}>
              {s}
            </button>
          ))}
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", marginBottom: "16px", display: "flex", flexDirection: "column", gap: "12px", paddingRight: "4px" }}>
          {messages.length === 0 ? (
            <div style={{ textAlign: "center", color: "#9CA3AF", padding: "30px", fontSize: "13px" }}>No messages yet</div>
          ) : messages.map(msg => (
            <div key={msg.id} style={{
              alignSelf: msg.sender === "admin" ? "flex-end" : "flex-start",
              maxWidth: "80%",
            }}>
              <div style={{ fontSize: "11px", color: "#9CA3AF", marginBottom: "4px", textAlign: msg.sender === "admin" ? "right" : "left" }}>
                {msg.sender === "admin" ? "👨‍💼 Admin" : "👤 " + (ticket.user.name ?? ticket.user.email)} • {new Date(msg.createdAt).toLocaleTimeString()}
              </div>
              <div style={{
                padding: "10px 14px", borderRadius: "12px", fontSize: "13.5px",
                background: msg.sender === "admin" ? "#5145FF" : "#F3F4F6",
                color: msg.sender === "admin" ? "#fff" : "#111827",
                borderBottomRightRadius: msg.sender === "admin" ? "2px" : "12px",
                borderBottomLeftRadius: msg.sender === "admin" ? "12px" : "2px",
              }}>
                {msg.message}
              </div>
            </div>
          ))}
        </div>

        {/* Reply Input */}
        <div style={{ borderTop: "1px solid #F3F4F6", paddingTop: "14px" }}>
          <textarea
            value={reply} onChange={e => setReply(e.target.value)}
            placeholder="Type your reply here…"
            onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) sendReply(); }}
            style={{
              width: "100%", height: "80px", padding: "10px 12px",
              borderRadius: "8px", border: "1px solid #E5E7EB",
              fontSize: "13.5px", resize: "none", outline: "none", boxSizing: "border-box",
            }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
            <span style={{ fontSize: "11.5px", color: "#9CA3AF" }}>Ctrl+Enter to send</span>
            <button onClick={sendReply} disabled={sending || !reply.trim()} style={{
              padding: "8px 20px", borderRadius: "8px", border: "none",
              background: sending || !reply.trim() ? "#9CA3AF" : "#5145FF",
              color: "#fff", fontSize: "13.5px", fontWeight: 600, cursor: "pointer",
            }}>
              {sending ? "Sending…" : "Send Reply"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [statusFilter, setStatusFilter] = useState("");

  const fetchTickets = useCallback(async () => {
    try {
      const params = statusFilter ? `?status=${statusFilter}` : "";
      const res = await fetch(`/api/admin/support/tickets${params}`);
      const data = await res.json();
      if (data.success) setTickets(data.tickets);
    } finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const openCount = tickets.filter(t => t.status === "open").length;
  const pendingCount = tickets.filter(t => t.status === "pending").length;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F8F9FA" }}>
      <Sidebar />
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      {selected && (
        <TicketModal
          ticket={selected}
          onClose={() => setSelected(null)}
          onRefresh={() => { fetchTickets(); setToast({ msg: "Reply sent!", type: "success" }); }}
        />
      )}

      <main style={{ flex: 1, padding: "28px 32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div>
            <h1 style={{ fontSize: "21px", fontWeight: 700, color: "#111827", letterSpacing: "-0.4px" }}>Support Center</h1>
            <p style={{ fontSize: "13.5px", color: "#6B7280", marginTop: "3px" }}>Reply to and manage customer support tickets.</p>
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            style={{ padding: "8px 14px", borderRadius: "8px", border: "1px solid #E5E7EB", fontSize: "13px", outline: "none" }}>
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
          {[
            { label: "Total", value: tickets.length, icon: "💬" },
            { label: "Open", value: openCount, icon: "🔴" },
            { label: "Pending", value: pendingCount, icon: "🟡" },
            { label: "Resolved", value: tickets.filter(t => t.status === "resolved").length, icon: "✅" },
          ].map((s, i) => (
            <div key={i} className="card" style={{ padding: "16px 18px", display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ fontSize: "24px" }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: "22px", fontWeight: 700, color: "#111827" }}>{s.value}</div>
                <div style={{ fontSize: "12px", color: "#9CA3AF" }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="card" style={{ overflow: "hidden" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Ticket</th>
                <th>Customer</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Messages</th>
                <th>Last Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: "center", padding: "40px", color: "#9CA3AF" }}>Loading tickets…</td></tr>
              ) : tickets.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: "center", padding: "40px", color: "#9CA3AF" }}>No tickets found</td></tr>
              ) : tickets.map(ticket => {
                const sc = STATUS_COLORS[ticket.status] ?? STATUS_COLORS.open;
                const pc = PRIORITY_COLORS[ticket.priority] ?? PRIORITY_COLORS.low;
                return (
                  <tr key={ticket.id}>
                    <td>
                      <div style={{ fontWeight: 500, color: "#111827", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ticket.subject}</div>
                      <div style={{ fontSize: "11.5px", color: "#9CA3AF", fontFamily: "monospace" }}>#{ticket.id.slice(0, 8)}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{ticket.user.name ?? "—"}</div>
                      <div style={{ fontSize: "11.5px", color: "#9CA3AF" }}>{ticket.user.email}</div>
                    </td>
                    <td><span style={{ ...pc, padding: "2px 8px", borderRadius: "99px", fontSize: "11.5px", fontWeight: 600 }}>{ticket.priority}</span></td>
                    <td><span style={{ ...sc, padding: "2px 8px", borderRadius: "99px", fontSize: "11.5px", fontWeight: 600 }}>{ticket.status}</span></td>
                    <td>
                      <span style={{ background: "#EEF0FF", color: "#5145FF", padding: "2px 10px", borderRadius: "99px", fontSize: "12px", fontWeight: 600 }}>
                        {ticket._count.messages}
                      </span>
                    </td>
                    <td style={{ color: "#9CA3AF", fontSize: "12.5px" }}>{new Date(ticket.updatedAt).toLocaleDateString()}</td>
                    <td>
                      <button onClick={() => setSelected(ticket)} style={{
                        padding: "5px 14px", borderRadius: "6px", border: "none",
                        background: "#5145FF", color: "#fff", fontSize: "12px", fontWeight: 600, cursor: "pointer",
                      }}>
                        Reply
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
