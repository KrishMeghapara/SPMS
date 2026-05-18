"use client";

import { useEffect, useState, useCallback } from "react";
import { useApi, useAuth } from "@/context/AuthContext";

interface Meeting {
    projectmeetingid: number;
    meetingdatetime: string;
    meetingpurpose: string | null;
    meetinglocation: string | null;
    meetingnotes: string | null;
    meetingstatus: string | null;
    description: string | null;
    projectGroup: { projectgroupid: number; projectgroupname: string; projecttitle: string } | null;
    guideStaff: { staffid: number; staffname: string } | null;
    attendances: { projectmeetingattendanceid: number; ispresent: boolean; student: { studentid: number; studentname: string } | null }[];
}

interface ProjectGroup { projectgroupid: number; projectgroupname: string; }

export default function MeetingsPage() {
    const { apiFetch } = useApi();
    const { user } = useAuth();
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [groups, setGroups] = useState<ProjectGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showDetail, setShowDetail] = useState<Meeting | null>(null);
    const [form, setForm] = useState({
        projectgroupid: "", meetingdatetime: "", meetingpurpose: "", meetinglocation: "", description: "",
    });
    const [toast, setToast] = useState<{ message: string; type: string } | null>(null);
    const [statusFilter, setStatusFilter] = useState("all");
    const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
    const [calMonth, setCalMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    const showToast = (message: string, type = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchMeetings = useCallback(async () => {
        try {
            const [meetingsData, groupsData] = await Promise.all([
                apiFetch("/api/project-meetings"),
                apiFetch("/api/project-groups"),
            ]);
            setMeetings(meetingsData);
            setGroups(groupsData);
        } catch (err) { showToast(err instanceof Error ? err.message : "Failed to load meetings", "error"); }
        finally { setLoading(false); }
    }, [apiFetch]);

    useEffect(() => { fetchMeetings(); }, [fetchMeetings]);

    const filtered = meetings.filter(m => statusFilter === "all" || m.meetingstatus === statusFilter);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await apiFetch("/api/project-meetings", { method: "POST", body: JSON.stringify(form) });
            showToast("Meeting scheduled");
            setShowModal(false);
            fetchMeetings();
        } catch (err) { showToast(err instanceof Error ? err.message : "Failed", "error"); }
    };

    const updateStatus = async (id: number, status: string) => {
        try {
            await apiFetch(`/api/project-meetings/${id}`, {
                method: "PUT",
                body: JSON.stringify({ meetingstatus: status }),
            });
            showToast(`Meeting ${status.toLowerCase()}`);
            fetchMeetings();
            setShowDetail(null);
        } catch (err) { showToast(err instanceof Error ? err.message : "Failed", "error"); }
    };

    const getStatusColor = (status: string | null) => {
        switch (status) {
            case "Completed": return "badge-success";
            case "Cancelled": return "badge-danger";
            case "Scheduled": return "badge-info";
            default: return "badge-warning";
        }
    };

    const getStatusIcon = (status: string | null) => {
        switch (status) {
            case "Completed": return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>;
            case "Cancelled": return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>;
            default: return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" /></svg>;
        }
    };

    return (
        <div className="page-enter">
            {showModal ? (
                <>
                    <div className="page-header" style={{ marginBottom: 24, paddingBottom: 24, borderBottom: "1px solid var(--border-light)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)} style={{ padding: "8px 12px" }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
                            </button>
                            <div>
                                <h1 className="page-title" style={{ marginBottom: 4 }}>Schedule Meeting</h1>
                                <p className="page-subtitle">Add a new project group meeting</p>
                            </div>
                        </div>
                    </div>
                    <div className="glass-card" style={{ maxWidth: 640, margin: "0 auto", padding: 32 }}>
                        <form onSubmit={handleCreate}>
                            <div className="form-group">
                                <label className="form-label">Project Group *</label>
                                <select className="form-select" value={form.projectgroupid}
                                    onChange={e => setForm({ ...form, projectgroupid: e.target.value })} required>
                                    <option value="">Select group</option>
                                    {groups.map(g => <option key={g.projectgroupid} value={g.projectgroupid}>{g.projectgroupname}</option>)}
                                </select>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
                                <div className="form-group">
                                    <label className="form-label">Date & Time *</label>
                                    <input className="form-input" type="datetime-local" value={form.meetingdatetime}
                                        onChange={e => setForm({ ...form, meetingdatetime: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Location</label>
                                    <input className="form-input" value={form.meetinglocation || ""}
                                        onChange={e => setForm({ ...form, meetinglocation: e.target.value })} placeholder="Room number or online link" />
                                </div>
                            </div>
                            <div className="form-group" style={{ marginTop: 16 }}>
                                <label className="form-label">Purpose</label>
                                <input className="form-input" value={form.meetingpurpose || ""}
                                    onChange={e => setForm({ ...form, meetingpurpose: e.target.value })} placeholder="Meeting agenda or purpose" />
                            </div>
                            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 32, paddingTop: 20, borderTop: "1px solid var(--border-light)" }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ padding: "10px 28px" }}>Schedule Meeting</button>
                            </div>
                        </form>
                    </div>
                </>
            ) : showDetail ? (
                <>
                    <div className="page-header" style={{ marginBottom: 24, paddingBottom: 24, borderBottom: "1px solid var(--border-light)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                            <button className="btn btn-secondary" onClick={() => setShowDetail(null)} style={{ padding: "8px 12px" }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
                            </button>
                            <div>
                                <h1 className="page-title" style={{ marginBottom: 4, display: "flex", alignItems: "center", gap: 12 }}>
                                    Meeting Details
                                    <span className={`badge ${getStatusColor(showDetail.meetingstatus)}`} style={{ fontSize: 13, padding: "4px 8px" }}>{showDetail.meetingstatus}</span>
                                </h1>
                                <p className="page-subtitle">{showDetail.projectGroup?.projectgroupname}</p>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24 }}>
                        <div>
                            <div className="glass-card" style={{ marginBottom: 24 }}>
                                <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: "var(--text-primary)" }}>Information</h4>
                                <div style={{
                                    display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20,
                                }}>
                                    <div><span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Group</span><p style={{ fontWeight: 600, marginTop: 4, fontSize: 14 }}>{showDetail.projectGroup?.projectgroupname || "—"}</p></div>
                                    <div><span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Date & Time</span><p style={{ fontWeight: 600, marginTop: 4, fontSize: 14 }}>{new Date(showDetail.meetingdatetime).toLocaleString()}</p></div>
                                    <div><span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Guide</span><p style={{ fontWeight: 600, marginTop: 4, fontSize: 14 }}>{showDetail.guideStaff?.staffname || "—"}</p></div>
                                    <div><span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Purpose</span><p style={{ fontWeight: 600, marginTop: 4, fontSize: 14 }}>{showDetail.meetingpurpose || "—"}</p></div>
                                    <div style={{ gridColumn: "1 / -1" }}><span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Location</span><p style={{ fontWeight: 600, marginTop: 4, fontSize: 14 }}>{showDetail.meetinglocation || "—"}</p></div>
                                </div>
                            </div>

                            {showDetail.meetingnotes && (
                                <div className="glass-card">
                                    <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: "var(--text-primary)" }}>Meeting Notes</h4>
                                    <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--text-secondary)" }}>{showDetail.meetingnotes}</p>
                                </div>
                            )}
                        </div>

                        <div>
                            <div className="glass-card">
                                <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 8, color: "var(--text-primary)" }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#0071e3"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z" /></svg>
                                    Attendance
                                    <span className="badge badge-primary">{showDetail.attendances.length}</span>
                                </h4>
                                {showDetail.attendances.length === 0 ? (
                                    <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: "24px 0" }}>No attendance records</p>
                                ) : (
                                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                        {showDetail.attendances.map(a => (
                                            <div key={a.projectmeetingattendanceid} style={{
                                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                                padding: 14, background: "white", borderRadius: 12, border: "1px solid var(--border-light)",
                                            }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                                    <div style={{
                                                        width: 32, height: 32, borderRadius: "50%",
                                                        background: a.ispresent ? "#e8f5e9" : "#ffebee",
                                                        color: a.ispresent ? "#0f9d58" : "#d32f2f",
                                                        display: "flex", alignItems: "center", justifyContent: "center",
                                                        fontSize: 13, fontWeight: 700,
                                                    }}>
                                                        {a.student?.studentname.charAt(0) || "?"}
                                                    </div>
                                                    <span style={{ fontSize: 14, fontWeight: 600 }}>{a.student?.studentname || "Unknown"}</span>
                                                </div>
                                                <span className={`badge ${a.ispresent ? "badge-success" : "badge-danger"}`} style={{ fontSize: 11 }}>
                                                    {a.ispresent ? "Present" : "Absent"}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <>
                    <div className="page-header">
                        <div>
                            <h1 className="page-title">Meetings</h1>
                            <p className="page-subtitle">Schedule and manage project meetings</p>
                        </div>
                        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                            {/* View toggle */}
                            <div style={{ display: "flex", background: "#f0f0f5", borderRadius: 980, padding: 3 }}>
                                {(["list", "calendar"] as const).map(v => (
                                    <button key={v} onClick={() => setViewMode(v)} style={{
                                        padding: "6px 14px", borderRadius: 980, border: "none",
                                        background: viewMode === v ? "white" : "transparent",
                                        color: viewMode === v ? "#1d1d1f" : "#86868b",
                                        fontSize: 12, fontWeight: 600, cursor: "pointer",
                                        boxShadow: viewMode === v ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                                        transition: "all 0.2s", display: "flex", alignItems: "center", gap: 5,
                                    }}>
                                        {v === "list"
                                            ? <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" /></svg>
                                            : <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z" /></svg>
                                        }
                                        {v === "list" ? "List" : "Calendar"}
                                    </button>
                                ))}
                            </div>
                            <select className="form-select" style={{ width: 140 }}
                                value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                                <option value="all">All Status</option>
                                <option value="Scheduled">Scheduled</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                            {(user?.role === "admin" || user?.role === "staff") && (
                                <button className="btn btn-primary" onClick={() => {
                                    setForm({ projectgroupid: "", meetingdatetime: "", meetingpurpose: "", meetinglocation: "", description: "" });
                                    setShowModal(true);
                                }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" /></svg>
                                    Schedule
                                </button>
                            )}
                        </div>
                    </div>

            {loading ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 16 }}>
                    {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 200, borderRadius: 24 }} />)}
                </div>
            ) : viewMode === "calendar" ? (() => {
                /* Inline Calendar */
                const yr = calMonth.getFullYear(), mo = calMonth.getMonth();
                const firstDay = new Date(yr, mo, 1).getDay();
                const daysInMo = new Date(yr, mo + 1, 0).getDate();
                const today = new Date();
                const isToday = (d: number) => d === today.getDate() && mo === today.getMonth() && yr === today.getFullYear();
                const dk = (d: number) => `${yr}-${String(mo + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
                const getMeetings = (ds: string) => filtered.filter(m => m.meetingdatetime.startsWith(ds));
                const statusClr: Record<string, string> = { Scheduled: "#0071e3", Completed: "#30d158", Cancelled: "#ff3b30" };
                const selMeetings = selectedDate ? getMeetings(selectedDate) : [];
                const days: (number | null)[] = [];
                for (let i = 0; i < firstDay; i++) days.push(null);
                for (let d = 1; d <= daysInMo; d++) days.push(d);
                return (
                    <div style={{ display: "grid", gridTemplateColumns: selectedDate ? "1fr 340px" : "1fr", gap: 16 }}>
                        <div style={{ background: "white", borderRadius: 24, padding: 24, boxShadow: "var(--shadow-card)" }}>
                            {/* Month nav */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                                <button onClick={() => { const d = new Date(calMonth); d.setMonth(d.getMonth() - 1); setCalMonth(d); }} style={{ background: "none", border: "none", cursor: "pointer", padding: 6, borderRadius: 8, color: "#6e6e73", display: "flex" }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" /></svg>
                                </button>
                                <h3 style={{ fontSize: 17, fontWeight: 700, color: "#1d1d1f" }}>
                                    {calMonth.toLocaleString("default", { month: "long", year: "numeric" })}
                                </h3>
                                <button onClick={() => { const d = new Date(calMonth); d.setMonth(d.getMonth() + 1); setCalMonth(d); }} style={{ background: "none", border: "none", cursor: "pointer", padding: 6, borderRadius: 8, color: "#6e6e73", display: "flex" }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" /></svg>
                                </button>
                            </div>
                            {/* Weekday headers */}
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 4 }}>
                                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                                    <div key={d} style={{ textAlign: "center", fontSize: 11, fontWeight: 600, color: "#86868b", padding: "8px 0" }}>{d}</div>
                                ))}
                            </div>
                            {/* Days */}
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
                                {days.map((day, i) => {
                                    if (day === null) return <div key={`e${i}`} />;
                                    const key = dk(day); const dayM = getMeetings(key); const isSel = key === selectedDate;
                                    return (
                                        <button key={key} onClick={() => setSelectedDate(isSel ? null : key)} style={{
                                            padding: "8px 4px", minHeight: 64, background: isSel ? "#0071e308" : "transparent",
                                            border: isSel ? "2px solid #0071e3" : "2px solid transparent", borderRadius: 12,
                                            cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, transition: "all 0.15s",
                                        }}>
                                            <span style={{
                                                width: 26, height: 26, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                                                fontSize: 13, fontWeight: isToday(day) ? 700 : 500,
                                                background: isToday(day) ? "#0071e3" : "transparent", color: isToday(day) ? "white" : "#1d1d1f",
                                            }}>{day}</span>
                                            {dayM.length > 0 && (
                                                <div style={{ display: "flex", gap: 3 }}>
                                                    {dayM.slice(0, 3).map((m, j) => (
                                                        <div key={j} style={{ width: 5, height: 5, borderRadius: "50%", background: statusClr[m.meetingstatus || ""] || "#86868b" }} />
                                                    ))}
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                            {/* Legend */}
                            <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 14, paddingTop: 14, borderTop: "1px solid rgba(0,0,0,0.04)" }}>
                                {Object.entries(statusClr).map(([k, v]) => (
                                    <div key={k} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                        <div style={{ width: 7, height: 7, borderRadius: "50%", background: v }} />
                                        <span style={{ fontSize: 11, color: "#86868b" }}>{k}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* Side panel */}
                        {selectedDate && (
                            <div style={{ background: "white", borderRadius: 24, padding: 20, boxShadow: "var(--shadow-card)", animation: "slideUp 0.2s ease" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                                    <div>
                                        <h4 style={{ fontSize: 15, fontWeight: 700, color: "#1d1d1f" }}>
                                            {new Date(selectedDate + "T00:00:00").toLocaleDateString("default", { weekday: "long", month: "long", day: "numeric" })}
                                        </h4>
                                        <p style={{ fontSize: 12, color: "#86868b", marginTop: 2 }}>{selMeetings.length} meeting{selMeetings.length !== 1 ? "s" : ""}</p>
                                    </div>
                                    <button onClick={() => setSelectedDate(null)} style={{ background: "#f5f5f7", border: "none", borderRadius: 8, padding: 5, cursor: "pointer", color: "#86868b", display: "flex" }}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>
                                    </button>
                                </div>
                                {selMeetings.length === 0 ? (
                                    <p style={{ textAlign: "center", color: "#86868b", padding: "24px 0", fontSize: 13 }}>No meetings this day</p>
                                ) : selMeetings.map(m => (
                                    <div key={m.projectmeetingid} onClick={() => setShowDetail(m)} style={{
                                        padding: 14, borderRadius: 12, background: "#f9f9f9", marginBottom: 8,
                                        borderLeft: `3px solid ${statusClr[m.meetingstatus || ""] || "#86868b"}`,
                                        cursor: "pointer", transition: "all 0.15s",
                                    }}>
                                        <div style={{ fontSize: 13, fontWeight: 700, color: "#1d1d1f", marginBottom: 4 }}>{m.projectGroup?.projectgroupname}</div>
                                        <div style={{ fontSize: 12, color: "#6e6e73" }}>⏰ {new Date(m.meetingdatetime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                                        {m.meetingpurpose && <div style={{ fontSize: 12, color: "#6e6e73", marginTop: 2 }}>📋 {m.meetingpurpose}</div>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })() : filtered.length === 0 ? (
                <div className="glass-card empty-state">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="#d1d1d6"><path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z" /></svg>
                    <p>No meetings found.</p>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 16 }}>
                    {filtered.map((meeting, idx) => {
                        const dt = new Date(meeting.meetingdatetime);
                        const statusColors: Record<string, string> = { Scheduled: "#0071e3", Completed: "#30d158", Cancelled: "#ff3b30" };
                        const color = statusColors[meeting.meetingstatus || ""] || "#86868b";
                        return (
                            <div key={meeting.projectmeetingid} style={{
                                background: "white", borderRadius: 24, padding: 28,
                                boxShadow: "var(--shadow-card)", transition: "all 0.3s",
                                cursor: "pointer", overflow: "hidden",
                                animation: `slideUp 0.3s ease ${idx * 0.05}s both`,
                            }}
                                onClick={() => setShowDetail(meeting)}
                                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "var(--shadow-card-hover)"; }}
                                onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "var(--shadow-card)"; }}
                            >
                                <div style={{ display: "flex", gap: 18, alignItems: "flex-start", marginBottom: 16 }}>
                                    {/* Date marker */}
                                    <div style={{
                                        minWidth: 52, textAlign: "center",
                                        padding: "8px 6px", borderRadius: 14,
                                        background: `${color}10`, border: `1px solid ${color}20`,
                                    }}>
                                        <div style={{ fontSize: 22, fontWeight: 800, color, letterSpacing: "-0.03em", lineHeight: 1 }}>{dt.getDate()}</div>
                                        <div style={{ fontSize: 11, fontWeight: 600, color: "#86868b", marginTop: 2 }}>{dt.toLocaleString("default", { month: "short" })}</div>
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4, color: "#1d1d1f" }}>
                                            {meeting.projectGroup?.projectgroupname || "Meeting"}
                                        </h3>
                                        <p style={{ fontSize: 13, color: "#86868b" }}>
                                            {meeting.projectGroup?.projecttitle}
                                        </p>
                                    </div>
                                    <span className={`badge ${meeting.meetingstatus === "Completed" ? "badge-success" : meeting.meetingstatus === "Cancelled" ? "badge-danger" : "badge-info"}`}>
                                        {meeting.meetingstatus}
                                    </span>
                                </div>

                                <div style={{
                                    display: "flex", flexDirection: "column", gap: 10, fontSize: 13,
                                    color: "#6e6e73", padding: "14px 16px",
                                    background: "#f9f9f9", borderRadius: 14,
                                }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="#9e9e9e"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" /></svg>
                                        <span>{new Date(meeting.meetingdatetime).toLocaleString()}</span>
                                    </div>
                                    {meeting.meetingpurpose && (
                                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="#86868b"><path d="M14 17H4v2h10v-2zm6-8H4v2h16V9zM4 15h16v-2H4v2zM4 5v2h16V5H4z" /></svg>
                                            <span>{meeting.meetingpurpose}</span>
                                        </div>
                                    )}
                                    {meeting.meetinglocation && (
                                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="#86868b"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></svg>
                                            <span>{meeting.meetinglocation}</span>
                                        </div>
                                    )}
                                    {meeting.guideStaff && (
                                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="#86868b"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
                                            <span>{meeting.guideStaff.staffname}</span>
                                        </div>
                                    )}
                                </div>

                                <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{
                                        fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6,
                                    }}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="#9e9e9e"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z" /></svg>
                                        {meeting.attendances.length} attendees
                                    </span>
                                    {meeting.meetingstatus === "Scheduled" && (user?.role === "admin" || user?.role === "staff") && (
                                        <div style={{ display: "flex", gap: 6 }} onClick={e => e.stopPropagation()}>
                                            <button className="btn btn-success btn-sm" onClick={() => updateStatus(meeting.projectmeetingid, "Completed")}>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                                                Complete
                                            </button>
                                            <button className="btn btn-danger btn-sm" onClick={() => updateStatus(meeting.projectmeetingid, "Cancelled")}>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>
                                                Cancel
                                            </button>
                                        </div>
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
