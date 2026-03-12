"use client";

import { useEffect, useState, useCallback } from "react";
import { useApi, useAuth } from "@/context/AuthContext";

interface Student {
    studentid: number;
    studentname: string;
    email: string | null;
}

interface Member {
    projectgroupmemberid: number;
    isgroupleader: boolean | null;
    studentcgpa: string | null;
    student: Student | null;
}

interface ProjectGroup {
    projectgroupid: number;
    projectgroupname: string;
    projecttitle: string | null;
    projectarea: string | null;
    projectdescription: string | null;
    guidestaffname: string | null;
    averagecpi: string | null;
    status: string | null;
    created: string;
    projectType: { projecttypeid: number; projecttypename: string } | null;
    convenerStaff: { staffid: number; staffname: string } | null;
    expertStaff: { staffid: number; staffname: string } | null;
    members: Member[];
}

interface ProjectType { projecttypeid: number; projecttypename: string; }
interface Staff { staffid: number; staffname: string; }

export default function ProjectGroupsPage() {
    const { apiFetch } = useApi();
    const { user } = useAuth();
    const [groups, setGroups] = useState<ProjectGroup[]>([]);
    const [projectTypes, setProjectTypes] = useState<ProjectType[]>([]);
    const [staffList, setStaffList] = useState<Staff[]>([]);
    const [allStudents, setAllStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showDetail, setShowDetail] = useState<ProjectGroup | null>(null);
    const [showAddMember, setShowAddMember] = useState(false);
    const [memberForm, setMemberForm] = useState({ studentid: "", isgroupleader: false, studentcgpa: "" });
    const [form, setForm] = useState({
        projectgroupname: "", projecttypeid: "", projecttitle: "", projectarea: "",
        projectdescription: "", guidestaffname: "", description: "",
    });
    const [toast, setToast] = useState<{ message: string; type: string } | null>(null);

    const showToast = (message: string, type = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchGroups = useCallback(async () => {
        try {
            const [groupsData, typesData, staffData, studentsData] = await Promise.all([
                apiFetch("/api/project-groups"),
                apiFetch("/api/project-types"),
                apiFetch("/api/staff").catch(() => []),
                apiFetch("/api/students").catch(() => []),
            ]);
            setGroups(groupsData);
            setProjectTypes(typesData);
            setStaffList(staffData);
            setAllStudents(studentsData);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }, [apiFetch]);

    useEffect(() => { fetchGroups(); }, [fetchGroups]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await apiFetch("/api/project-groups", { method: "POST", body: JSON.stringify(form) });
            showToast("Project group created");
            setShowModal(false);
            fetchGroups();
        } catch (err) { showToast(err instanceof Error ? err.message : "Failed", "error"); }
    };

    const handleApprove = async (id: number) => {
        try {
            await apiFetch(`/api/project-groups/${id}/approve`, { method: "POST" });
            showToast("Group approved!");
            fetchGroups();
        } catch (err) { showToast(err instanceof Error ? err.message : "Failed", "error"); }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Delete this project group and all its members?")) return;
        try {
            await apiFetch(`/api/project-groups/${id}`, { method: "DELETE" });
            showToast("Group deleted");
            setShowDetail(null);
            fetchGroups();
        } catch (err) { showToast(err instanceof Error ? err.message : "Failed", "error"); }
    };

    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!showDetail) return;
        try {
            await apiFetch("/api/project-group-members", {
                method: "POST",
                body: JSON.stringify({
                    projectgroupid: showDetail.projectgroupid,
                    studentid: memberForm.studentid,
                    isgroupleader: memberForm.isgroupleader,
                    studentcgpa: memberForm.studentcgpa || null,
                }),
            });
            showToast("Student added to group");
            setShowAddMember(false);
            setMemberForm({ studentid: "", isgroupleader: false, studentcgpa: "" });
            const updated = await apiFetch(`/api/project-groups/${showDetail.projectgroupid}`);
            setShowDetail(updated);
            fetchGroups();
        } catch (err) { showToast(err instanceof Error ? err.message : "Failed", "error"); }
    };

    const handleRemoveMember = async (memberId: number) => {
        if (!confirm("Remove this student from the group?")) return;
        if (!showDetail) return;
        try {
            await apiFetch(`/api/project-group-members/${memberId}`, { method: "DELETE" });
            showToast("Student removed from group");
            const updated = await apiFetch(`/api/project-groups/${showDetail.projectgroupid}`);
            setShowDetail(updated);
            fetchGroups();
        } catch (err) { showToast(err instanceof Error ? err.message : "Failed", "error"); }
    };

    const handleToggleLeader = async (memberId: number, currentValue: boolean | null) => {
        if (!showDetail) return;
        try {
            await apiFetch(`/api/project-group-members/${memberId}`, {
                method: "PUT",
                body: JSON.stringify({ isgroupleader: !currentValue }),
            });
            showToast(!currentValue ? "Set as group leader" : "Removed as group leader");
            const updated = await apiFetch(`/api/project-groups/${showDetail.projectgroupid}`);
            setShowDetail(updated);
            fetchGroups();
        } catch (err) { showToast(err instanceof Error ? err.message : "Failed", "error"); }
    };

    const availableStudents = showDetail
        ? allStudents.filter(s => !showDetail.members.some(m => m.student?.studentid === s.studentid))
        : allStudents;

    const getProgressColor = (count: number) => {
        if (count > 5) return "#ff3b30";
        if (count >= 4) return "#30d158";
        return "#0071e3";
    };

    return (
        <div className="page-enter">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Project Groups</h1>
                    <p className="page-subtitle">View and manage student project groups</p>
                </div>
                <button className="btn btn-primary" onClick={() => {
                    setForm({ projectgroupname: "", projecttypeid: "", projecttitle: "", projectarea: "", projectdescription: "", guidestaffname: "", description: "" });
                    setShowModal(true);
                }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" /></svg>
                    Create Group
                </button>
            </div>

            {loading ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: 16 }}>
                    {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 240, borderRadius: 24 }} />)}
                </div>
            ) : groups.length === 0 ? (
                <div className="glass-card empty-state">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="#d1d1d6"><path d="M12 12.75c1.63 0 3.07.39 4.24.9 1.08.48 1.76 1.56 1.76 2.73V18H6v-1.61c0-1.18.68-2.26 1.76-2.73 1.17-.52 2.61-.91 4.24-.91zM12 6c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3z" /></svg>
                    <p style={{ marginTop: 12 }}>No project groups yet. Create one to get started.</p>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: 16 }}>
                    {groups.map((group, idx) => (
                        <div key={group.projectgroupid} style={{
                            background: "white", borderRadius: 24, padding: 28, cursor: "pointer",
                            position: "relative", overflow: "hidden",
                            boxShadow: "var(--shadow-card)", transition: "all 0.3s",
                            animation: `slideUp 0.3s ease ${idx * 0.05}s both`,
                        }}
                            onClick={() => setShowDetail(group)}
                            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "var(--shadow-card-hover)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "var(--shadow-card)"; }}
                        >
                            <div style={{
                                position: "absolute", top: 0, left: 0, right: 0, height: 3,
                                background: group.status === "Approved" ? "linear-gradient(90deg, #30d158, #63e89d)" : "linear-gradient(90deg, #ff9500, #ffb340)",
                                borderRadius: "24px 24px 0 0",
                            }} />

                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4, color: "var(--text-primary)" }}>
                                        {group.projecttitle || group.projectgroupname}
                                    </h3>
                                    <p style={{ fontSize: 13, color: "var(--text-muted)" }}>{group.projectgroupname}</p>
                                </div>
                                <span className={`badge ${group.status === "Approved" ? "badge-success" : "badge-warning"}`}>
                                    {group.status || "Pending"}
                                </span>
                            </div>

                            {/* Tags */}
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                                {group.projectType && (
                                    <span className="badge badge-primary" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" /></svg>
                                        {group.projectType.projecttypename}
                                    </span>
                                )}
                                {group.projectarea && (
                                    <span className="badge badge-info" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M7 2v11h3v9l7-12h-4l4-8z" /></svg>
                                        {group.projectarea}
                                    </span>
                                )}
                                {group.guidestaffname && (
                                    <span className="badge badge-success" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
                                        {group.guidestaffname}
                                    </span>
                                )}
                            </div>

                            {/* Description */}
                            {group.projectdescription && (
                                <p style={{
                                    fontSize: 13, color: "var(--text-secondary)", marginBottom: 14, lineHeight: 1.6,
                                    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden"
                                }}>
                                    {group.projectdescription}
                                </p>
                            )}

                            {/* Members & Progress */}
                            <div style={{
                                padding: "14px 16px", background: "#f9f9f9", borderRadius: 14,
                                marginBottom: 14,
                            }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)" }}>
                                        Team Members
                                    </span>
                                    <span style={{ fontSize: 13, fontWeight: 700, color: getProgressColor(group.members.length) }}>
                                        {group.members.length} / 5
                                    </span>
                                </div>
                                <div className="progress-bar">
                                    <div className="progress-bar-fill" style={{
                                        width: `${Math.min((group.members.length / 5) * 100, 100)}%`,
                                        background: getProgressColor(group.members.length),
                                    }} />
                                </div>
                            </div>

                            {/* Footer */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div style={{ display: "flex" }}>
                                    {group.members.slice(0, 4).map((m, i) => (
                                        <div key={m.projectgroupmemberid} style={{
                                            width: 32, height: 32, borderRadius: "50%", marginLeft: i > 0 ? -8 : 0,
                                            background: `hsl(${(m.student?.studentid || 0) * 60 % 360}, 45%, 55%)`,
                                            border: "2px solid white",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            fontSize: 12, fontWeight: 700, color: "white",
                                            boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
                                        }}>
                                            {m.student?.studentname.charAt(0) || "?"}
                                        </div>
                                    ))}
                                    {group.members.length > 4 && (
                                        <div style={{
                                            width: 32, height: 32, borderRadius: "50%", marginLeft: -8,
                                            background: "rgba(0,0,0,0.08)", border: "2px solid white",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            fontSize: 11, color: "#6e6e73", fontWeight: 600,
                                        }}>
                                            +{group.members.length - 4}
                                        </div>
                                    )}
                                    {group.members.length === 0 && (
                                        <span style={{ fontSize: 12, color: "var(--text-muted)", fontStyle: "italic" }}>No members</span>
                                    )}
                                </div>
                                <div style={{ display: "flex", gap: 6 }} onClick={e => e.stopPropagation()}>
                                    {user?.role === "admin" && group.status !== "Approved" && (
                                        <button className="btn btn-success btn-sm" onClick={() => handleApprove(group.projectgroupid)}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                                            Approve
                                        </button>
                                    )}
                                    {user?.role === "admin" && (
                                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(group.projectgroupid)} style={{ padding: "6px 10px" }}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" /></svg>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ===== Create Group Modal ===== */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                            <h3 className="modal-title" style={{ marginBottom: 0 }}>Create Project Group</h3>
                            <button onClick={() => setShowModal(false)} style={{
                                background: "var(--bg-hover)", border: "none", borderRadius: 8,
                                padding: 6, cursor: "pointer", color: "var(--text-muted)", display: "flex",
                            }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>
                            </button>
                        </div>
                        <form onSubmit={handleCreate}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                <div className="form-group">
                                    <label className="form-label">Group Name *</label>
                                    <input className="form-input" value={form.projectgroupname} onChange={e => setForm({ ...form, projectgroupname: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Project Type</label>
                                    <select className="form-select" value={form.projecttypeid} onChange={e => setForm({ ...form, projecttypeid: e.target.value })}>
                                        <option value="">Select type</option>
                                        {projectTypes.map(t => <option key={t.projecttypeid} value={t.projecttypeid}>{t.projecttypename}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Project Title</label>
                                <input className="form-input" value={form.projecttitle} onChange={e => setForm({ ...form, projecttitle: e.target.value })} />
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                <div className="form-group">
                                    <label className="form-label">Project Area</label>
                                    <input className="form-input" value={form.projectarea} onChange={e => setForm({ ...form, projectarea: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Guide Name</label>
                                    <select className="form-select" value={form.guidestaffname} onChange={e => setForm({ ...form, guidestaffname: e.target.value })}>
                                        <option value="">Select guide</option>
                                        {staffList.map(s => <option key={s.staffid} value={s.staffname}>{s.staffname}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea className="form-textarea" value={form.projectdescription} onChange={e => setForm({ ...form, projectdescription: e.target.value })} />
                            </div>
                            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 8 }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Create Group</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ===== Group Detail Modal ===== */}
            {showDetail && (
                <div className="modal-overlay" onClick={() => { setShowDetail(null); setShowAddMember(false); }}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 640 }}>
                        {/* Header */}
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
                            <div>
                                <h3 className="modal-title" style={{ marginBottom: 6 }}>{showDetail.projecttitle || showDetail.projectgroupname}</h3>
                                <span className={`badge ${showDetail.status === "Approved" ? "badge-success" : "badge-warning"}`}>{showDetail.status}</span>
                            </div>
                            <button onClick={() => { setShowDetail(null); setShowAddMember(false); }} style={{
                                background: "var(--bg-hover)", border: "none", borderRadius: 8,
                                padding: 6, cursor: "pointer", color: "var(--text-muted)", display: "flex",
                                height: "fit-content",
                            }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>
                            </button>
                        </div>

                        {/* Group Info */}
                        <div style={{
                            display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24,
                            padding: 18, background: "var(--bg-section)", borderRadius: 10,
                        }}>
                            <div><span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Group Name</span><p style={{ fontWeight: 600, marginTop: 4, fontSize: 14 }}>{showDetail.projectgroupname}</p></div>
                            <div><span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Project Type</span><p style={{ fontWeight: 600, marginTop: 4, fontSize: 14 }}>{showDetail.projectType?.projecttypename || "—"}</p></div>
                            <div><span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Area</span><p style={{ fontWeight: 600, marginTop: 4, fontSize: 14 }}>{showDetail.projectarea || "—"}</p></div>
                            <div><span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Guide</span><p style={{ fontWeight: 600, marginTop: 4, fontSize: 14 }}>{showDetail.guidestaffname || "Not assigned"}</p></div>
                            <div><span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Convener</span><p style={{ fontWeight: 600, marginTop: 4, fontSize: 14 }}>{showDetail.convenerStaff?.staffname || "—"}</p></div>
                            <div><span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Expert</span><p style={{ fontWeight: 600, marginTop: 4, fontSize: 14 }}>{showDetail.expertStaff?.staffname || "—"}</p></div>
                        </div>

                        {showDetail.projectdescription && (
                            <div style={{
                                marginBottom: 24, padding: 16, background: "var(--bg-section)",
                                borderRadius: 10, borderLeft: "3px solid #3f51b5",
                            }}>
                                <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Description</span>
                                <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--text-secondary)", marginTop: 6 }}>{showDetail.projectdescription}</p>
                            </div>
                        )}

                        {/* ===== Members Section ===== */}
                        <div style={{
                            background: "white", borderRadius: 12, padding: 20,
                            border: "1px solid var(--border-light)",
                            boxShadow: "var(--shadow-sm)",
                        }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                                <h4 style={{
                                    fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", gap: 8,
                                    color: "var(--text-primary)",
                                }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#3f51b5"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z" /></svg>
                                    Members
                                    <span className="badge badge-primary">{showDetail.members.length}</span>
                                </h4>
                                {(user?.role === "admin" || user?.role === "staff") && (
                                    <button
                                        className={`btn ${showAddMember ? "btn-secondary" : "btn-primary"} btn-sm`}
                                        onClick={() => {
                                            setShowAddMember(!showAddMember);
                                            setMemberForm({ studentid: "", isgroupleader: false, studentcgpa: "" });
                                        }}
                                    >
                                        {showAddMember ? (
                                            <><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg> Cancel</>
                                        ) : (
                                            <><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg> Add Student</>
                                        )}
                                    </button>
                                )}
                            </div>

                            {/* Add Student Form */}
                            {showAddMember && (
                                <form onSubmit={handleAddMember} style={{
                                    padding: 16, borderRadius: 10, marginBottom: 16,
                                    background: "#e8eaf6",
                                    border: "1px solid #c5cae9",
                                }}>
                                    <div style={{ marginBottom: 12 }}>
                                        <label className="form-label">Select Student *</label>
                                        <select
                                            className="form-select"
                                            value={memberForm.studentid}
                                            onChange={e => setMemberForm({ ...memberForm, studentid: e.target.value })}
                                            required
                                            style={{ background: "white" }}
                                        >
                                            <option value="">-- Choose a student --</option>
                                            {availableStudents.map(s => (
                                                <option key={s.studentid} value={s.studentid}>
                                                    {s.studentname} {s.email ? `(${s.email})` : ""}
                                                </option>
                                            ))}
                                        </select>
                                        {availableStudents.length === 0 && (
                                            <p style={{ fontSize: 12, color: "#e65100", marginTop: 6, fontWeight: 500 }}>
                                                All students are already in this group, or no students exist yet.
                                            </p>
                                        )}
                                    </div>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                                        <div>
                                            <label className="form-label">CGPA</label>
                                            <input
                                                className="form-input"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                max="10"
                                                placeholder="e.g. 8.5"
                                                value={memberForm.studentcgpa}
                                                onChange={e => setMemberForm({ ...memberForm, studentcgpa: e.target.value })}
                                                style={{ background: "white" }}
                                            />
                                        </div>
                                        <div>
                                            <label className="form-label">Role</label>
                                            <div style={{
                                                display: "flex", alignItems: "center", gap: 10,
                                                height: 44, paddingLeft: 4,
                                            }}>
                                                <label style={{
                                                    display: "flex", alignItems: "center", gap: 8,
                                                    cursor: "pointer", fontSize: 14, color: "var(--text-primary)",
                                                }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={memberForm.isgroupleader}
                                                        onChange={e => setMemberForm({ ...memberForm, isgroupleader: e.target.checked })}
                                                        style={{ width: 18, height: 18, accentColor: "#3f51b5" }}
                                                    />
                                                    Group Leader
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                                        <button type="submit" className="btn btn-primary btn-sm" disabled={!memberForm.studentid}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                                            Add to Group
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* Members List */}
                            {showDetail.members.length === 0 ? (
                                <div style={{ textAlign: "center", padding: "28px 0", color: "var(--text-muted)" }}>
                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="#bdbdbd"><path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
                                    <p style={{ fontSize: 14, marginTop: 8, fontWeight: 500 }}>No members in this group yet</p>
                                    <p style={{ fontSize: 12 }}>Click &quot;+ Add Student&quot; to add members</p>
                                </div>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                    {showDetail.members.map((m, idx) => (
                                        <div key={m.projectgroupmemberid} style={{
                                            display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
                                            background: "var(--bg-section)", borderRadius: 10,
                                            border: "1px solid var(--border-light)",
                                            transition: "all 0.2s",
                                            animation: `staggerFade 0.2s ease ${idx * 0.05}s both`,
                                        }}>
                                            <div style={{
                                                width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
                                                background: `hsl(${(m.student?.studentid || 0) * 60 % 360}, 45%, 55%)`,
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                fontSize: 16, fontWeight: 700, color: "white",
                                                boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                                            }}>
                                                {m.student?.studentname.charAt(0) || "?"}
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text-primary)" }}>
                                                    {m.student?.studentname || "Unknown"}
                                                </div>
                                                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                                                    {m.student?.email || "No email"}
                                                </div>
                                            </div>
                                            <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" }}>
                                                {m.studentcgpa && <span className="badge badge-info" style={{ fontSize: 11 }}>CGPA: {m.studentcgpa}</span>}
                                                {m.isgroupleader && (
                                                    <span className="badge badge-warning" style={{ fontSize: 11, display: "flex", alignItems: "center", gap: 3 }}>
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>
                                                        Leader
                                                    </span>
                                                )}
                                                {(user?.role === "admin" || user?.role === "staff") && (
                                                    <>
                                                        <button
                                                            className={`btn ${m.isgroupleader ? "btn-secondary" : "btn-primary"} btn-sm`}
                                                            onClick={() => handleToggleLeader(m.projectgroupmemberid, m.isgroupleader)}
                                                            style={{ padding: "4px 10px", fontSize: 11 }}
                                                        >
                                                            {m.isgroupleader ? "Remove Leader" : "Set Leader"}
                                                        </button>
                                                        <button
                                                            onClick={() => handleRemoveMember(m.projectgroupmemberid)}
                                                            className="btn btn-danger btn-sm"
                                                            style={{ padding: "4px 8px" }}
                                                            title="Remove from group"
                                                        >
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {toast && <div className={`toast toast-${toast.type}`}>{toast.message}</div>}
        </div>
    );
}
