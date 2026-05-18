"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useApi } from "@/context/AuthContext";
import { exportTableToPDF, exportToExcel } from "@/lib/export";
import dynamic from "next/dynamic";

const RechartsCharts = dynamic(() => import("recharts").then((mod) => {
    const { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } = mod;

    function StatusDonut({ data }: { data: { name: string; value: number; color: string }[] }) {
        const total = data.reduce((s, d) => s + d.value, 0);
        return (
            <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
                <ResponsiveContainer width={160} height={160}>
                    <PieChart>
                        <Pie data={data} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={72} paddingAngle={4} strokeWidth={0}>
                            {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {data.map((d, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 10, height: 10, borderRadius: "50%", background: d.color }} />
                            <span style={{ fontSize: 14, color: "#6e6e73" }}>{d.name}</span>
                            <span style={{ fontSize: 15, fontWeight: 700, color: "#1d1d1f", marginLeft: "auto" }}>{d.value}</span>
                            <span style={{ fontSize: 12, color: "#86868b" }}>({total > 0 ? Math.round(d.value / total * 100) : 0}%)</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    function TypeBarChart({ data }: { data: { name: string; count: number }[] }) {
        return (
            <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data} margin={{ top: 8, right: 8, bottom: 4, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#86868b" }} axisLine={{ stroke: "rgba(0,0,0,0.08)" }} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: "#86868b" }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip
                        contentStyle={{ background: "white", border: "none", borderRadius: 12, fontSize: 13, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
                        cursor={{ fill: "rgba(0,113,227,0.04)" }}
                    />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]} maxBarSize={36}>
                        {data.map((_, i) => <Cell key={i} fill={["#0071e3", "#5ac8fa", "#bf5af2", "#30d158", "#ff9500", "#ff3b30"][i % 6]} />)}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        );
    }

    return function Charts({ statusData, typeData }: { statusData: { name: string; value: number; color: string }[]; typeData: { name: string; count: number }[] }) {
        return (
            <div className="bento-grid" style={{ marginBottom: 24, gridAutoRows: "auto" }}>
                <div className="bento-span-2" style={{ background: "white", borderRadius: 24, padding: 28, boxShadow: "var(--shadow-card)" }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1d1d1f", marginBottom: 20, letterSpacing: "-0.02em" }}>Project Status</h3>
                    <StatusDonut data={statusData} />
                </div>
                <div className="bento-span-2" style={{ background: "white", borderRadius: 24, padding: 28, boxShadow: "var(--shadow-card)" }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1d1d1f", marginBottom: 20, letterSpacing: "-0.02em" }}>Projects by Type</h3>
                    <TypeBarChart data={typeData} />
                </div>
            </div>
        );
    };
}), {
    ssr: false, loading: () => (
        <div className="bento-grid" style={{ marginBottom: 24, gridAutoRows: "auto" }}>
            <div className="skeleton bento-span-2" style={{ height: 240 }} />
            <div className="skeleton bento-span-2" style={{ height: 240 }} />
        </div>
    )
});

interface ReportProject {
    projectgroupid: number; projectgroupname: string; projecttitle: string | null;
    projectarea: string | null; guidestaffname: string | null; status: string | null;
    averagecpi: string | null;
    projectType: { projecttypename: string } | null;
    convenerStaff: { staffname: string } | null;
    expertStaff: { staffname: string } | null;
    members: { isgroupleader: boolean; studentcgpa: string; student: { studentid: number; studentname: string; email: string } | null; }[];
    meetings: { projectmeetingid: number; meetingdatetime: string; meetingstatus: string }[];
}

interface ReportStats {
    totalProjects: number; totalStudents: number; totalMeetings: number;
    byStatus: { pending: number; approved: number };
}

export default function ReportsPage() {
    const { apiFetch } = useApi();
    const [projects, setProjects] = useState<ReportProject[]>([]);
    const [stats, setStats] = useState<ReportStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState("all");
    const [filterStatus, setFilterStatus] = useState("all");
    const [search, setSearch] = useState("");
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [toast, setToast] = useState<{ message: string; type: string } | null>(null);

    const showToast = (message: string, type = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchReports = useCallback(async () => {
        try { const d = await apiFetch("/api/reports"); setProjects(d.projects); setStats(d.stats); }
        catch (err) { showToast(err instanceof Error ? err.message : "Failed to load reports", "error"); }
        finally { setLoading(false); }
    }, [apiFetch]);

    useEffect(() => { fetchReports(); }, [fetchReports]);

    const types = [...new Set(projects.map(p => p.projectType?.projecttypename).filter(Boolean))];
    const filtered = projects.filter(p => {
        const mt = filterType === "all" || p.projectType?.projecttypename === filterType;
        const ms = filterStatus === "all" || p.status === filterStatus;
        const mq = search === "" || p.projectgroupname.toLowerCase().includes(search.toLowerCase()) ||
            (p.projecttitle && p.projecttitle.toLowerCase().includes(search.toLowerCase())) ||
            (p.guidestaffname && p.guidestaffname.toLowerCase().includes(search.toLowerCase()));
        return mt && ms && mq;
    });

    const statusChartData = useMemo(() => [
        { name: "Approved", value: stats?.byStatus.approved ?? 0, color: "#34c759" },
        { name: "Pending", value: stats?.byStatus.pending ?? 0, color: "#ff9500" },
    ], [stats]);

    const typeChartData = useMemo(() => {
        const tc: Record<string, number> = {};
        projects.forEach(p => { const n = p.projectType?.projecttypename || "Other"; tc[n] = (tc[n] || 0) + 1; });
        return Object.entries(tc).map(([name, count]) => ({ name, count }));
    }, [projects]);

    const statCards = [
        { label: "Total Projects", value: stats?.totalProjects ?? 0, color: "#0071e3" },
        { label: "Students", value: stats?.totalStudents ?? 0, color: "#5ac8fa" },
        { label: "Meetings", value: stats?.totalMeetings ?? 0, color: "#ff9500" },
        { label: "Approved", value: stats?.byStatus.approved ?? 0, color: "#34c759" },
        { label: "Pending", value: stats?.byStatus.pending ?? 0, color: "#ff3b30" },
    ];

    return (
        <div className="page-enter">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Reports & Analytics</h1>
                    <p className="page-subtitle">Comprehensive project insights</p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn btn-secondary" onClick={() => {
                        const cols = ["ID", "Group Name", "Project Title", "Type", "Area", "Status", "Members", "Meetings"];
                        const rows = filtered.map(p => [
                            p.projectgroupid,
                            p.projectgroupname,
                            p.projecttitle || "—",
                            p.projectType?.projecttypename || "—",
                            p.projectarea || "—",
                            p.status || "Pending",
                            p.members.length,
                            p.meetings.length,
                        ]);
                        exportTableToPDF("Project Reports", cols, rows, "spms_project_report");
                    }} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v1zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V7H15c.83 0 1.5.67 1.5 1.5v3zm4-3H19v1h1.5V11H19v2h-1.5V7h3v1.5zM9 9.5h1v-1H9v1zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm10 5.5h1v-3h-1v3z" /></svg>
                        PDF
                    </button>
                    <button className="btn btn-secondary" onClick={() => {
                        const cols = ["ID", "Group Name", "Project Title", "Type", "Area", "Status", "Guide", "Members", "Meetings"];
                        const rows = filtered.map(p => [
                            p.projectgroupid,
                            p.projectgroupname,
                            p.projecttitle || "",
                            p.projectType?.projecttypename || "",
                            p.projectarea || "",
                            p.status || "Pending",
                            p.guidestaffname || "",
                            p.members.length,
                            p.meetings.length,
                        ]);
                        exportToExcel([{ name: "Projects", columns: cols, rows }], "spms_project_report");
                    }} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 11H5m14 0-7 7m7-7-7-7" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        Excel
                    </button>
                </div>
            </div>

            {/* Stats row */}
            {stats && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 24 }}>
                    {statCards.map((c, i) => (
                        <div key={i} style={{
                            background: "white", borderRadius: 20, padding: "20px 22px",
                            boxShadow: "var(--shadow-card)", transition: "all 0.3s",
                            animation: `slideUp 0.3s ease ${i * 0.05}s both`,
                        }}
                            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "var(--shadow-card-hover)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "var(--shadow-card)"; }}
                        >
                            <div style={{ fontSize: 12, fontWeight: 600, color: "#86868b" }}>{c.label}</div>
                            <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.04em", color: c.color, marginTop: 2 }}>{c.value}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* Charts */}
            {stats && !loading && <RechartsCharts statusData={statusChartData} typeData={typeChartData} />}

            {/* Filters */}
            <div style={{
                background: "white", borderRadius: 20, padding: "14px 20px",
                boxShadow: "var(--shadow-card)", marginBottom: 16,
            }}>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                    <div style={{ position: "relative" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="#86868b" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}>
                            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                        </svg>
                        <input className="form-input" placeholder="Search..." value={search}
                            onChange={e => setSearch(e.target.value)} style={{ width: 240, paddingLeft: 36 }} />
                    </div>
                    <select className="form-select" style={{ width: 160 }} value={filterType} onChange={e => setFilterType(e.target.value)}>
                        <option value="all">All Types</option>
                        {types.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <select className="form-select" style={{ width: 160 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                        <option value="all">All Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                    </select>
                    <span style={{ marginLeft: "auto", fontSize: 13, color: "#86868b", fontWeight: 500 }}>
                        {filtered.length} of {projects.length}
                    </span>
                </div>
            </div>

            {/* Table */}
            <div style={{ background: "white", borderRadius: 24, boxShadow: "var(--shadow-card)", overflow: "auto", padding: 0 }}>
                {loading ? (
                    <div style={{ padding: 24 }}>{[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: 50, marginBottom: 8 }} />)}</div>
                ) : filtered.length === 0 ? (
                    <div className="empty-state">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="#d1d1d6"><path d="M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z" /></svg>
                        <p style={{ marginTop: 8 }}>No matching projects</p>
                    </div>
                ) : (
                    <table className="data-table">
                        <thead><tr><th>Project</th><th>Type</th><th>Guide</th><th>Members</th><th>Meetings</th><th>Status</th><th>Details</th></tr></thead>
                        <tbody>
                            {filtered.map((p, idx) => (
                                <React.Fragment key={p.projectgroupid}>
                                    <tr style={{ animation: `staggerFade 0.3s ease ${idx * 0.04}s both` }}>
                                        <td>
                                            <div style={{ fontWeight: 600, color: "#1d1d1f", marginBottom: 2 }}>{p.projecttitle || p.projectgroupname}</div>
                                            {p.projectarea && <div style={{ fontSize: 12, color: "#86868b" }}>{p.projectarea}</div>}
                                        </td>
                                        <td><span className="badge badge-primary">{p.projectType?.projecttypename || "—"}</span></td>
                                        <td>
                                            {p.guidestaffname ? (
                                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                                    <div style={{ width: 26, height: 26, borderRadius: "50%", background: "linear-gradient(135deg, #0071e3, #5ac8fa)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>{p.guidestaffname.charAt(0)}</div>
                                                    <span>{p.guidestaffname}</span>
                                                </div>
                                            ) : "—"}
                                        </td>
                                        <td><span className="badge badge-info">{p.members.length}</span></td>
                                        <td><span className="badge badge-info">{p.meetings.length}</span></td>
                                        <td><span className={`badge ${p.status === "Approved" ? "badge-success" : "badge-warning"}`}>{p.status}</span></td>
                                        <td>
                                            <button className={`btn ${expandedId === p.projectgroupid ? "btn-primary" : "btn-secondary"} btn-sm`}
                                                onClick={() => setExpandedId(expandedId === p.projectgroupid ? null : p.projectgroupid)}>
                                                {expandedId === p.projectgroupid ? "Hide" : "View"}
                                            </button>
                                        </td>
                                    </tr>
                                    {expandedId === p.projectgroupid && (
                                        <tr>
                                            <td colSpan={7} style={{ padding: "20px 24px", background: "#fafafa" }}>
                                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                                                    <div>
                                                        <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, color: "#1d1d1f" }}>Members</h4>
                                                        {p.members.map((m, i) => (
                                                            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", borderRadius: 10, marginBottom: 4, background: "white", fontSize: 13 }}>
                                                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: `hsl(${(m.student?.studentid || 0) * 60 % 360}, 50%, 55%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "white" }}>{m.student?.studentname.charAt(0) || "?"}</div>
                                                                    <span style={{ fontWeight: 500 }}>{m.student?.studentname || "Unknown"}</span>
                                                                    {m.isgroupleader && <span style={{ fontSize: 11, color: "#ff9500" }}>★</span>}
                                                                </div>
                                                                {m.studentcgpa && <span className="badge badge-info" style={{ fontSize: 11 }}>CGPA: {m.studentcgpa}</span>}
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div>
                                                        <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, color: "#1d1d1f" }}>Meetings</h4>
                                                        {p.meetings.length === 0 ? (
                                                            <p style={{ fontSize: 13, color: "#86868b", fontStyle: "italic" }}>No meetings</p>
                                                        ) : p.meetings.slice(0, 5).map(m => (
                                                            <div key={m.projectmeetingid} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", borderRadius: 10, marginBottom: 4, background: "white", fontSize: 13 }}>
                                                                <span>{new Date(m.meetingdatetime).toLocaleDateString()}</span>
                                                                <span className={`badge ${m.meetingstatus === "Completed" ? "badge-success" : m.meetingstatus === "Cancelled" ? "badge-danger" : "badge-info"}`} style={{ fontSize: 11 }}>{m.meetingstatus}</span>
                                                            </div>
                                                        ))}
                                                        <div style={{ marginTop: 10, padding: "8px 12px", background: "white", borderRadius: 10, fontSize: 12, color: "#86868b" }}>
                                                            Convener: <strong style={{ color: "#1d1d1f" }}>{p.convenerStaff?.staffname || "—"}</strong> · Expert: <strong style={{ color: "#1d1d1f" }}>{p.expertStaff?.staffname || "—"}</strong>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {toast && <div className={`toast toast-${toast.type}`}>{toast.message}</div>}
        </div>
    );
}
