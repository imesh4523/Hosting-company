"use client";
import { useState, useEffect } from "react";
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

function Field({ label, placeholder, type = "text", value, onChange, textarea = false }: { label: string; placeholder?: string; type?: string; value?: string; onChange?: (val: string) => void, textarea?: boolean }) {
  return (
    <div style={{ marginBottom: "14px" }}>
      <label style={{ fontSize: "12.5px", fontWeight: 600, color: "#374151", display: "block", marginBottom: "5px" }}>{label}</label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          style={{
            width: "100%", padding: "8px 12px",
            border: "1px solid #E5E7EB", borderRadius: "8px",
            fontSize: "13px", color: "#111827",
            background: "#FAFAFA", outline: "none",
            boxSizing: "border-box", minHeight: "100px", resize: "vertical"
          }}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          style={{
            width: "100%", padding: "8px 12px",
            border: "1px solid #E5E7EB", borderRadius: "8px",
            fontSize: "13px", color: "#111827",
            background: "#FAFAFA", outline: "none",
            boxSizing: "border-box",
          }}
        />
      )}
    </div>
  );
}

export default function NewsPage() {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/news");
      const data = await res.json();
      if (data.success) {
        setNews(data.data);
      }
    } catch (e) {
      console.error("Failed to fetch news", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleSave = async () => {
    if (!title) return alert("Title is required");
    setSaving(true);
    try {
      const url = editingId ? `/api/news/${editingId}` : "/api/news";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content })
      });
      const data = await res.json();
      if (data.success) {
        setTitle("");
        setContent("");
        setEditingId(null);
        fetchNews();
      } else {
        alert("Error: " + data.message);
      }
    } catch (e) {
      alert("Failed to save news");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: any) => {
    setTitle(item.title);
    setContent(item.content || "");
    setEditingId(item.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this news item?")) return;
    try {
      const res = await fetch(`/api/news/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchNews();
      } else {
        alert("Error: " + data.message);
      }
    } catch (e) {
      alert("Failed to delete news");
    }
  };

  const handleCancel = () => {
    setTitle("");
    setContent("");
    setEditingId(null);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F8F9FA" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: "28px 32px", maxWidth: "1000px" }}>

        <div style={{ marginBottom: "26px" }}>
          <h1 style={{ fontSize: "21px", fontWeight: 700, color: "#111827", letterSpacing: "-0.4px" }}>Manage News</h1>
          <p style={{ fontSize: "13.5px", color: "#6B7280", marginTop: "3px" }}>Post and manage news updates for your customers.</p>
        </div>

        {/* Create/Edit Section */}
        <Section title={editingId ? "Edit News" : "Create News"} sub="Fill in the details for the news post">
          <Field label="News Title" placeholder="e.g. Scheduled Maintenance" value={title} onChange={setTitle} />
          <Field label="Content" placeholder="Enter news details here..." value={content} onChange={setContent} textarea />
          
          <div style={{ display: "flex", gap: "10px" }}>
            <button 
              onClick={handleSave}
              disabled={saving}
              style={{ 
                fontSize: "13px", fontWeight: 600, color: "#fff", 
                background: saving ? "#9CA3AF" : "#5145FF", border: "none", 
                borderRadius: "8px", padding: "8px 20px", cursor: saving ? "default" : "pointer" 
              }}
            >
              {saving ? "Saving..." : editingId ? "Update News" : "Post News"}
            </button>
            {editingId && (
              <button 
                onClick={handleCancel}
                style={{ 
                  fontSize: "13px", fontWeight: 600, color: "#4B5563", 
                  background: "#E5E7EB", border: "none", 
                  borderRadius: "8px", padding: "8px 20px", cursor: "pointer" 
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </Section>

        {/* News List */}
        <Section title="Recent News Posts" sub="Manage existing news items">
          {loading ? (
            <div style={{ textAlign: "center", padding: "20px", color: "#6B7280" }}>Loading news...</div>
          ) : news.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px", color: "#6B7280" }}>No news posts found.</div>
          ) : (
            <div style={{ borderTop: "1px solid #F3F4F6" }}>
              {news.map((item) => (
                <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "16px 0", borderBottom: "1px solid #F3F4F6" }}>
                  <div style={{ flex: 1, paddingRight: "20px" }}>
                    <div style={{ fontSize: "14.5px", fontWeight: 600, color: "#111827" }}>{item.title}</div>
                    <div style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "2px" }}>
                      {new Date(item.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </div>
                    <div style={{ fontSize: "13px", color: "#4B5563", marginTop: "8px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {item.content}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                    <button 
                      onClick={() => handleEdit(item)}
                      style={{ 
                        fontSize: "12px", fontWeight: 600, color: "#5145FF", 
                        background: "#EEF2FF", border: "none", 
                        borderRadius: "6px", padding: "6px 12px", cursor: "pointer" 
                      }}
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      style={{ 
                        fontSize: "12px", fontWeight: 600, color: "#EF4444", 
                        background: "#FEE2E2", border: "none", 
                        borderRadius: "6px", padding: "6px 12px", cursor: "pointer" 
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>

      </main>
    </div>
  );
}
