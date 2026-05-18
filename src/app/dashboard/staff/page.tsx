"use client";

import { useEffect, useState, useCallback } from "react";
import { useApi, useAuth } from "@/context/AuthContext";
import { exportToExcel } from "@/lib/export";

interface Staff {
    staffid: number;
    staffname: string;
    phone: string | null;
    email: string | null;
    description: string | null;
    created: string;
}

export default function StaffPage() {
    const { apiFetch } = useApi();
    const { user } = useAuth();
    const [staffList, setStaffList] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Staff | null>(null);
    const [form, setForm] = useState({ staffname: "", email: "", password: "", phone: "", description: "" });
    const [toast, setToast] = useState<{ message: string; type: string } | null>(null);

    const showToast = (message: string, type = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchStaff = useCallback(async () => {
        try {
            const data = await apiFetch("/api/staff");
            setStaffList(data);
        } catch (err) { showToast(err instanceof Error ? err.message : "Failed to load staff", "error"); }
        finally { setLoading(false); }
    }, [apiFetch]);

    useEffect(() => { fetchStaff(); }, [fetchStaff]);

    const openCreate = () => {
        setEditing(null);
        setForm({ staffname: "", email: "", password: "", phone: "", description: "" });
        setShowModal(true);
    };

    const openEdit = (s: Staff) => {
        setEditing(s);
        setForm({ staffname: s.staffname, email: s.email || "", password: "", phone: s.phone || "", description: s.description || "" });
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const body = { ...form };
            if (editing) {
                await apiFetch(`/api/staff/${editing.staffid}`, { method: "PUT", body: JSON.stringify(body) });
                showToast("Staff updated");
            } else {
                await apiFetch("/api/staff", { method: "POST", body: JSON.stringify(body) });
                showToast("Staff created");
            }
            setShowModal(false);
            fetchStaff();
        } catch (err) { showToast(err instanceof Error ? err.message : "Failed", "error"); }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Delete this staff member?")) return;
        try {
            await apiFetch(`/api/staff/${id}`, { method: "DELETE" });
            showToast("Staff deleted");
            fetchStaff();
        } catch (err) { showToast(err instanceof Error ? err.message : "Failed", "error"); }
    };

    return (
        <div className="page-enter">
            {showModal ? (
                <>
                    <div className="page-header">
                        <div>
                            <h1 className="page-title">{editing ? "Edit Staff" : "New Staff Member"}</h1>
                            <p className="page-subtitle">{editing ? "Update staff details" : "Add a new faculty member"}</p>
                        </div>
                        <button className="btn btn-secondary" onClick={() => setShowModal(false)} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
                            Back to List
                        </button>
                    </div>
                    <div className="glass-card" style={{ maxWidth: 640, margin: "0 auto", padding: 32 }}>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Full Name *</label>
                                <input className="form-input" value={form.staffname} onChange={e => setForm({ ...form, staffname: e.target.value })} required placeholder="Enter full name" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email *</label>
                                <input className="form-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required={!editing} placeholder="staff@example.com" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">{editing ? "New Password (blank to keep)" : "Password *"}</label>
                                <input className="form-input" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required={!editing} placeholder="••••••••" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Phone</label>
                                <input className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Optional" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea className="form-textarea" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Optional bio or notes" />
                            </div>
                            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 32, paddingTop: 20, borderTop: "1px solid var(--border-light)" }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ padding: "10px 28px" }}>{editing ? "Update Staff" : "Create Staff"}</button>
                            </div>
                        </form>
                    </div>
                </>
            ) : (
                <>
                    <div className="page-header">
                        <div>
                            <h1 className="page-title">Staff Management</h1>
                            <p className="page-subtitle">Manage faculty members who can guide and evaluate projects</p>
                        </div>
                        {user?.role === "admin" && (
                            <div style={{ display: "flex", gap: 8 }}>
                                <button className="btn btn-secondary" onClick={() => {
                                    const cols = ["ID", "Name", "Email", "Phone", "Created"];
                                    const rows = staffList.map(s => [s.staffid, s.staffname, s.email || "", s.phone || "", new Date(s.created).toLocaleDateString()]);
                                    exportToExcel([{ name: "Staff", columns: cols, rows }], "spms_staff_list");
                                }} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" /></svg>
                                    Export
                                </button>
                                <button className="btn btn-primary" onClick={openCreate}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" /></svg>
                                    Add Staff
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="glass-card" style={{ overflow: "auto", padding: 0 }}>
                        {loading ? (
                            <div style={{ padding: 24 }}>{[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 50, marginBottom: 8, borderRadius: 8 }} />)}</div>
                        ) : staffList.length === 0 ? (
                            <div className="empty-state">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="#d1d1d6"><path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z" /></svg>
                                <p>No staff members found.</p>
                            </div>
                        ) : (
                            <table className="data-table">
                                <thead>
                                    <tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Created</th><th>Actions</th></tr>
                                </thead>
                                <tbody>
                                    {staffList.map((s, idx) => (
                                        <tr key={s.staffid} style={{ animation: `staggerFade 0.3s ease ${idx * 0.05}s both` }}>
                                            <td><span className="badge badge-info">#{s.staffid}</span></td>
                                            <td>
                                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                    <div style={{
                                                        width: 34, height: 34, borderRadius: "50%",
                                                        background: "linear-gradient(135deg, #0071e3, #5ac8fa)", color: "white",
                                                        display: "flex", alignItems: "center", justifyContent: "center",
                                                        fontSize: 14, fontWeight: 700, flexShrink: 0,
                                                    }}>
                                                        {s.staffname.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{s.staffname}</span>
                                                </div>
                                            </td>
                                            <td>{s.email || "—"}</td>
                                            <td>{s.phone || "—"}</td>
                                            <td>{new Date(s.created).toLocaleDateString()}</td>
                                            <td>
                                                <div style={{ display: "flex", gap: 6 }}>
                                                    <button className="btn btn-secondary btn-sm" onClick={() => openEdit(s)}>
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" /></svg>
                                                        Edit
                                                    </button>
                                                    {user?.role === "admin" && (
                                                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s.staffid)}>
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" /></svg>
                                                            Delete
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </>
            )}

            {toast && <div className={`toast toast-${toast.type}`}>{toast.message}</div>}
        </div>
    );
}
