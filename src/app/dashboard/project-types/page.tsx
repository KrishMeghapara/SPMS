"use client";

import { useEffect, useState, useCallback } from "react";
import { useApi, useAuth } from "@/context/AuthContext";

interface ProjectType {
    projecttypeid: number;
    projecttypename: string;
    description: string | null;
    created: string;
}

export default function ProjectTypesPage() {
    const { apiFetch } = useApi();
    const { user } = useAuth();
    const [types, setTypes] = useState<ProjectType[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<ProjectType | null>(null);
    const [form, setForm] = useState({ projecttypename: "", description: "" });
    const [toast, setToast] = useState<{ message: string; type: string } | null>(null);

    const showToast = (message: string, type = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchTypes = useCallback(async () => {
        try {
            const data = await apiFetch("/api/project-types");
            setTypes(data);
        } catch (err) { showToast(err instanceof Error ? err.message : "Failed to load project types", "error"); }
        finally { setLoading(false); }
    }, [apiFetch]);

    useEffect(() => { fetchTypes(); }, [fetchTypes]);

    const openCreate = () => {
        setEditing(null);
        setForm({ projecttypename: "", description: "" });
        setShowModal(true);
    };

    const openEdit = (type: ProjectType) => {
        setEditing(type);
        setForm({ projecttypename: type.projecttypename, description: type.description || "" });
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editing) {
                await apiFetch(`/api/project-types/${editing.projecttypeid}`, { method: "PUT", body: JSON.stringify(form) });
                showToast("Project type updated");
            } else {
                await apiFetch("/api/project-types", { method: "POST", body: JSON.stringify(form) });
                showToast("Project type created");
            }
            setShowModal(false);
            fetchTypes();
        } catch (err) { showToast(err instanceof Error ? err.message : "Failed", "error"); }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this project type?")) return;
        try {
            await apiFetch(`/api/project-types/${id}`, { method: "DELETE" });
            showToast("Project type deleted");
            fetchTypes();
        } catch (err) { showToast(err instanceof Error ? err.message : "Failed", "error"); }
    };

    const typeColors = ["#0071e3", "#5ac8fa", "#bf5af2", "#30d158", "#ff9500", "#ff3b30"];

    return (
        <div className="page-enter">
            {showModal ? (
                <>
                    <div className="page-header">
                        <div>
                            <h1 className="page-title">{editing ? "Edit Project Type" : "New Project Type"}</h1>
                            <p className="page-subtitle">{editing ? "Update the details below" : "Add a new category for projects"}</p>
                        </div>
                        <button className="btn btn-secondary" onClick={() => setShowModal(false)} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
                            Back to List
                        </button>
                    </div>
                    <div className="glass-card" style={{ maxWidth: 640, margin: "0 auto", padding: 32 }}>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Type Name *</label>
                                <input className="form-input" value={form.projecttypename} onChange={e => setForm({ ...form, projecttypename: e.target.value })} required placeholder="e.g. Major Project" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea className="form-textarea" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Brief description of this project type" />
                            </div>
                            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 32, paddingTop: 20, borderTop: "1px solid var(--border-light)" }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ padding: "10px 28px" }}>{editing ? "Update Type" : "Create Type"}</button>
                            </div>
                        </form>
                    </div>
                </>
            ) : (
                <>
                    <div className="page-header">
                        <div>
                            <h1 className="page-title">Project Types</h1>
                            <p className="page-subtitle">Manage project categories like Major, Minor, Research</p>
                        </div>
                        {user?.role === "admin" && (
                            <button className="btn btn-primary" onClick={openCreate}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" /></svg>
                                Add Project Type
                            </button>
                        )}
                    </div>

                    {loading ? (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                            {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 200, borderRadius: 24 }} />)}
                        </div>
                    ) : types.length === 0 ? (
                        <div className="glass-card empty-state">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="#d1d1d6"><path d="M12 2l-5.5 9h11L12 2zm0 3.84L13.93 9h-3.87L12 5.84zM17.5 13c-2.49 0-4.5 2.01-4.5 4.5s2.01 4.5 4.5 4.5 4.5-2.01 4.5-4.5-2.01-4.5-4.5-4.5zm0 7c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zM3 21.5h8v-8H3v8zm2-6h4v4H5v-4z" /></svg>
                            <p>No project types yet</p>
                            <p style={{ fontSize: 13, color: "#86868b", marginTop: 4 }}>Create your first project type to organize projects</p>
                        </div>
                    ) : (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                            {types.map((type, idx) => {
                                const color = typeColors[idx % typeColors.length];
                                const grads: Record<string, string> = {
                                    "#0071e3": "linear-gradient(135deg, #0071e3, #5ac8fa)",
                                    "#5ac8fa": "linear-gradient(135deg, #5ac8fa, #64d2ff)",
                                    "#bf5af2": "linear-gradient(135deg, #bf5af2, #da8fff)",
                                    "#30d158": "linear-gradient(135deg, #30d158, #63e89d)",
                                    "#ff9500": "linear-gradient(135deg, #ff9500, #ffb340)",
                                    "#ff3b30": "linear-gradient(135deg, #ff3b30, #ff6961)",
                                };
                                return (
                                    <div key={type.projecttypeid} style={{
                                        background: "white", borderRadius: 24, padding: 28,
                                        boxShadow: "var(--shadow-card)", transition: "all 0.3s",
                                        animation: `slideUp 0.3s ease ${idx * 0.06}s both`,
                                    }}
                                        onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "var(--shadow-card-hover)"; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "var(--shadow-card)"; }}
                                    >
                                        <div style={{
                                            width: 56, height: 56, borderRadius: 16,
                                            background: grads[color] || color,
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            fontSize: 24, fontWeight: 800, color: "white",
                                            marginBottom: 16, boxShadow: `0 6px 20px ${color}33`,
                                        }}>
                                            {type.projecttypename.charAt(0)}
                                        </div>
                                        <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1d1d1f", letterSpacing: "-0.02em", marginBottom: 4 }}>{type.projecttypename}</h3>
                                        <p style={{ fontSize: 13, color: "#86868b", lineHeight: 1.5, marginBottom: 20, minHeight: 40 }}>
                                            {type.description || "No description provided"}
                                        </p>
                                        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", borderTop: "1px solid rgba(0,0,0,0.05)", paddingTop: 16 }}>
                                            <button className="btn btn-secondary btn-sm" onClick={() => openEdit(type)}>Edit</button>
                                            {user?.role === "admin" && (
                                                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(type.projecttypeid)}>Delete</button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </>
            )}

            {toast && <div className={`toast toast-${toast.type}`}>{toast.message}</div>}
        </div>
    );
}
