"use client";

import { useEffect, useState, useCallback } from "react";
import { useApi, useAuth } from "@/context/AuthContext";
import { exportToExcel } from "@/lib/export";

interface Student {
    studentid: number;
    studentname: string;
    phone: string | null;
    email: string | null;
    description: string | null;
    created: string;
}

export default function StudentsPage() {
    const { apiFetch } = useApi();
    const { user } = useAuth();
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Student | null>(null);
    const [form, setForm] = useState({ studentname: "", email: "", password: "", phone: "", description: "" });
    const [toast, setToast] = useState<{ message: string; type: string } | null>(null);
    const [search, setSearch] = useState("");

    const showToast = (message: string, type = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchStudents = useCallback(async () => {
        try {
            const data = await apiFetch("/api/students");
            setStudents(data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }, [apiFetch]);

    useEffect(() => { fetchStudents(); }, [fetchStudents]);

    const filtered = students.filter(s =>
        s.studentname.toLowerCase().includes(search.toLowerCase()) ||
        (s.email && s.email.toLowerCase().includes(search.toLowerCase()))
    );

    const openCreate = () => {
        setEditing(null);
        setForm({ studentname: "", email: "", password: "", phone: "", description: "" });
        setShowModal(true);
    };

    const openEdit = (s: Student) => {
        setEditing(s);
        setForm({ studentname: s.studentname, email: s.email || "", password: "", phone: s.phone || "", description: s.description || "" });
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editing) {
                await apiFetch(`/api/students/${editing.studentid}`, { method: "PUT", body: JSON.stringify(form) });
                showToast("Student updated");
            } else {
                await apiFetch("/api/students", { method: "POST", body: JSON.stringify(form) });
                showToast("Student created");
            }
            setShowModal(false);
            fetchStudents();
        } catch (err) { showToast(err instanceof Error ? err.message : "Failed", "error"); }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Delete this student?")) return;
        try {
            await apiFetch(`/api/students/${id}`, { method: "DELETE" });
            showToast("Student deleted");
            fetchStudents();
        } catch (err) { showToast(err instanceof Error ? err.message : "Failed", "error"); }
    };

    return (
        <div className="page-enter">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Students</h1>
                    <p className="page-subtitle">Manage student records and their project assignments</p>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <div style={{ position: "relative" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="#86868b" style={{
                            position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
                        }}><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" /></svg>
                        <input
                            className="form-input"
                            placeholder="Search students..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{ width: 240, paddingLeft: 38, borderRadius: 980 }}
                        />
                    </div>
                    {user?.role === "admin" && (
                        <div style={{ display: "flex", gap: 8 }}>
                            <button className="btn btn-secondary" onClick={() => {
                                const cols = ["ID", "Name", "Email", "Phone", "Created"];
                                const rows = filtered.map(s => [s.studentid, s.studentname, s.email || "", s.phone || "", new Date(s.created).toLocaleDateString()]);
                                exportToExcel([{ name: "Students", columns: cols, rows }], "spms_student_list");
                            }} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" /></svg>
                                Export
                            </button>
                            <button className="btn btn-primary" onClick={openCreate}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" /></svg>
                                Add Student
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Stats row */}
            <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
                <div style={{
                    padding: "12px 20px", borderRadius: 14, background: "white",
                    boxShadow: "var(--shadow-card)", display: "flex", alignItems: "center", gap: 10,
                }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: 10, background: "rgba(0,113,227,0.08)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="#0071e3"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z" /></svg>
                    </div>
                    <div>
                        <div style={{ fontSize: 12, color: "#86868b", fontWeight: 600 }}>Total</div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: "#1d1d1f" }}>{students.length}</div>
                    </div>
                </div>
                {search && (
                    <div style={{
                        padding: "12px 20px", borderRadius: 14, background: "white",
                        boxShadow: "var(--shadow-card)", display: "flex", alignItems: "center", gap: 10,
                    }}>
                        <div>
                            <div style={{ fontSize: 12, color: "#86868b", fontWeight: 600 }}>Filtered</div>
                            <div style={{ fontSize: 18, fontWeight: 700, color: "#0071e3" }}>{filtered.length}</div>
                        </div>
                    </div>
                )}
            </div>

            <div className="glass-card" style={{ overflow: "auto", padding: 0 }}>
                {loading ? (
                    <div style={{ padding: 24 }}>{[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 50, marginBottom: 8, borderRadius: 8 }} />)}</div>
                ) : filtered.length === 0 ? (
                    <div className="empty-state">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="#d1d1d6"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
                        <p>{search ? "No matching students" : "No students found."}</p>
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Created</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {filtered.map((s, idx) => (
                                <tr key={s.studentid} style={{ animation: `staggerFade 0.3s ease ${idx * 0.04}s both` }}>
                                    <td><span className="badge badge-success">#{s.studentid}</span></td>
                                    <td>
                                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                            <div style={{
                                                width: 34, height: 34, borderRadius: "50%",
                                                background: `hsl(${(s.studentid * 60) % 360}, 45%, 90%)`,
                                                color: `hsl(${(s.studentid * 60) % 360}, 45%, 40%)`,
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                fontSize: 14, fontWeight: 700, flexShrink: 0,
                                            }}>
                                                {s.studentname.charAt(0).toUpperCase()}
                                            </div>
                                            <span style={{ fontWeight: 600, color: "#1d1d1f" }}>{s.studentname}</span>
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
                                                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s.studentid)}>
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

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h3 className="modal-title">{editing ? "Edit Student" : "New Student"}</h3>
                        <p className="modal-subtitle">{editing ? "Update student details" : "Add a new student record"}</p>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Full Name *</label>
                                    <input className="form-input" value={form.studentname} onChange={e => setForm({ ...form, studentname: e.target.value })} required placeholder="Enter student name" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Email *</label>
                                    <input className="form-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required={!editing} placeholder="student@example.com" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">{editing ? "New Password (blank to keep)" : "Password *"}</label>
                                    <input className="form-input" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required={!editing} placeholder="••••••••" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Phone</label>
                                    <input className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Optional" />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Description</label>
                                    <textarea className="form-textarea" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Optional notes" />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">{editing ? "Update" : "Create"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {toast && <div className={`toast toast-${toast.type}`}>{toast.message}</div>}
        </div>
    );
}
