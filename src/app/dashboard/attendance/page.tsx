"use client";

import { useEffect, useState, useCallback } from "react";
import { useApi } from "@/context/AuthContext";
import { exportTableToPDF, exportToExcel } from "@/lib/export";
import dynamic from "next/dynamic";

const AttendanceCharts = dynamic(() => import("recharts").then((mod) => {
    const { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } = mod;

    function TrendChart({ data }: { data: { month: string; percentage: number }[] }) {
        return (
            <ResponsiveContainer width="100%" height={220}>
                <LineChart data={data} margin={{ top: 8, right: 8, bottom: 4, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#86868b" }} axisLine={{ stroke: "rgba(0,0,0,0.08)" }} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#86868b" }} axisLine={false} tickLine={false} domain={[0, 100]} />
                    <Tooltip contentStyle={{ background: "white", border: "none", borderRadius: 12, fontSize: 13, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
                    <Line type="monotone" dataKey="percentage" stroke="#0071e3" strokeWidth={2.5} dot={{ r: 4, fill: "#0071e3" }} activeDot={{ r: 6 }} name="Attendance %" />
                </LineChart>
            </ResponsiveContainer>
        );
    }

    function StudentBarChart({ data }: { data: { studentname: string; percentage: number }[] }) {
        return (
            <ResponsiveContainer width="100%" height={Math.max(200, data.length * 36)}>
                <BarChart data={data} layout="vertical" margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: "#86868b" }} axisLine={false} tickLine={false} />
                    <YAxis dataKey="studentname" type="category" width={100} tick={{ fontSize: 11, fill: "#1d1d1f" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: "white", border: "none", borderRadius: 12, fontSize: 13, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
                    <Bar dataKey="percentage" radius={[0, 6, 6, 0]} maxBarSize={24} name="Attendance %"
                        fill="#0071e3"
                    />
                </BarChart>
            </ResponsiveContainer>
        );
    }

    return function Charts({ trendData, studentData }: {
        trendData: { month: string; percentage: number }[];
        studentData: { studentname: string; percentage: number }[];
    }) {
        return (
            <div className="bento-grid" style={{ marginBottom: 24, gridAutoRows: "auto" }}>
                <div className="bento-span-2" style={{ background: "white", borderRadius: 24, padding: 28, boxShadow: "var(--shadow-card)" }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1d1d1f", marginBottom: 20, letterSpacing: "-0.02em" }}>Monthly Attendance Trend</h3>
                    {trendData.length > 0 ? <TrendChart data={trendData} /> : <p style={{ color: "#86868b", fontSize: 14, padding: "40px 0", textAlign: "center" }}>No trend data available</p>}
                </div>
                <div className="bento-span-2" style={{ background: "white", borderRadius: 24, padding: 28, boxShadow: "var(--shadow-card)" }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1d1d1f", marginBottom: 20, letterSpacing: "-0.02em" }}>Per-Student Attendance</h3>
                    {studentData.length > 0 ? <StudentBarChart data={studentData.slice(0, 15)} /> : <p style={{ color: "#86868b", fontSize: 14, padding: "40px 0", textAlign: "center" }}>No student data available</p>}
                </div>
            </div>
        );
    };
}), {
    ssr: false, loading: () => (
        <div className="bento-grid" style={{ marginBottom: 24, gridAutoRows: "auto" }}>
            <div className="skeleton bento-span-2" style={{ height: 280 }} />
            <div className="skeleton bento-span-2" style={{ height: 280 }} />
        </div>
    )
});

interface StudentAttendance {
    studentid: number;
    studentname: string;
    email: string;
    total: number;
    present: number;
    absent: number;
    percentage: number;
}

interface Summary {
    totalRecords: number;
    totalPresent: number;
    totalAbsent: number;
    overallPercentage: number;
    totalStudents: number;
    lowAttendance: number;
}

export default function AttendanceAnalyticsPage() {
    const { apiFetch } = useApi();
    const [students, setStudents] = useState<StudentAttendance[]>([]);
    const [monthly, setMonthly] = useState<{ month: string; percentage: number }[]>([]);
    const [summary, setSummary] = useState<Summary | null>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "low" | "good">("all");

    const fetchData = useCallback(async () => {
        try {
            const data = await apiFetch("/api/attendance-analytics");
            setStudents(data.students);
            setMonthly(data.monthly);
            setSummary(data.summary);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }, [apiFetch]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const filtered = students.filter(s => {
        if (filter === "low") return s.percentage < 75;
        if (filter === "good") return s.percentage >= 75;
        return true;
    });

    const getColor = (pct: number) => pct >= 85 ? "#30d158" : pct >= 75 ? "#ff9500" : "#ff3b30";

    return (
        <div className="page-enter">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Attendance Analytics</h1>
                    <p className="page-subtitle">Per-student attendance statistics and trends</p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn btn-secondary" onClick={() => {
                        const cols = ["ID", "Name", "Email", "Total", "Present", "Absent", "Percentage"];
                        const rows = filtered.map(s => [s.studentid, s.studentname, s.email, s.total, s.present, s.absent, `${s.percentage}%`]);
                        exportTableToPDF("Attendance Report", cols, rows, "spms_attendance_report");
                    }} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v1zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V7H15c.83 0 1.5.67 1.5 1.5v3zm4-3H19v1h1.5V11H19v2h-1.5V7h3v1.5zM9 9.5h1v-1H9v1zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm10 5.5h1v-3h-1v3z" /></svg>
                        PDF
                    </button>
                    <button className="btn btn-secondary" onClick={() => {
                        const cols = ["ID", "Name", "Email", "Total Meetings", "Present", "Absent", "Attendance %"];
                        const rows = filtered.map(s => [s.studentid, s.studentname, s.email, s.total, s.present, s.absent, s.percentage]);
                        exportToExcel([{ name: "Attendance", columns: cols, rows }], "spms_attendance_report");
                    }} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 11H5m14 0-7 7m7-7-7-7" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        Excel
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            {summary && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 24 }}>
                    {[
                        { label: "Overall", value: `${summary.overallPercentage}%`, color: getColor(summary.overallPercentage) },
                        { label: "Total Records", value: summary.totalRecords, color: "#0071e3" },
                        { label: "Present", value: summary.totalPresent, color: "#30d158" },
                        { label: "Absent", value: summary.totalAbsent, color: "#ff3b30" },
                        { label: "Students", value: summary.totalStudents, color: "#bf5af2" },
                        { label: "Low (<75%)", value: summary.lowAttendance, color: summary.lowAttendance > 0 ? "#ff9500" : "#30d158" },
                    ].map((c, i) => (
                        <div key={i} style={{
                            background: "white", borderRadius: 20, padding: "18px 20px",
                            boxShadow: "var(--shadow-card)", animation: `slideUp 0.3s ease ${i * 0.05}s both`,
                        }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: "#86868b" }}>{c.label}</div>
                            <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.04em", color: c.color, marginTop: 2 }}>{c.value}</div>
                        </div>
                    ))}
                </div>
            )}

            {loading ? (
                <>
                    <div className="bento-grid" style={{ marginBottom: 24, gridAutoRows: "auto" }}>
                        <div className="skeleton bento-span-2" style={{ height: 280 }} />
                        <div className="skeleton bento-span-2" style={{ height: 280 }} />
                    </div>
                    <div className="skeleton" style={{ height: 300, borderRadius: 24 }} />
                </>
            ) : (
                <>
                    <AttendanceCharts
                        trendData={monthly}
                        studentData={students.map(s => ({ studentname: s.studentname, percentage: s.percentage }))}
                    />

                    {/* Student Table */}
                    <div style={{
                        background: "white", borderRadius: 24, overflow: "hidden",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                    }}>
                        <div style={{
                            padding: "20px 24px", display: "flex", justifyContent: "space-between",
                            alignItems: "center", borderBottom: "1px solid rgba(0,0,0,0.04)",
                        }}>
                            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1d1d1f", letterSpacing: "-0.02em" }}>
                                Student Details
                            </h3>
                            <div style={{
                                display: "flex", background: "#f0f0f5", borderRadius: 980, padding: 3,
                            }}>
                                {(["all", "low", "good"] as const).map(f => (
                                    <button key={f} onClick={() => setFilter(f)} style={{
                                        padding: "5px 14px", borderRadius: 980, border: "none",
                                        background: filter === f ? "white" : "transparent",
                                        color: filter === f ? "#1d1d1f" : "#86868b",
                                        fontSize: 12, fontWeight: 600, cursor: "pointer",
                                        boxShadow: filter === f ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                                        transition: "all 0.2s", textTransform: "capitalize",
                                    }}>{f === "low" ? "< 75%" : f === "good" ? "≥ 75%" : "All"}</button>
                                ))}
                            </div>
                        </div>
                        {filtered.length === 0 ? (
                            <div className="empty-state">
                                <p>No attendance records found</p>
                            </div>
                        ) : (
                            <div style={{ overflow: "auto" }}>
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Student</th>
                                            <th>Total</th>
                                            <th>Present</th>
                                            <th>Absent</th>
                                            <th>Attendance</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filtered.map((s, idx) => (
                                            <tr key={s.studentid} style={{ animation: `staggerFade 0.3s ease ${idx * 0.03}s both` }}>
                                                <td>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                        <div style={{
                                                            width: 34, height: 34, borderRadius: "50%",
                                                            background: `hsl(${(s.studentid * 67) % 360}, 45%, 90%)`,
                                                            color: `hsl(${(s.studentid * 67) % 360}, 45%, 40%)`,
                                                            display: "flex", alignItems: "center", justifyContent: "center",
                                                            fontSize: 13, fontWeight: 700, flexShrink: 0,
                                                        }}>
                                                            {s.studentname.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div style={{ fontWeight: 600, color: "#1d1d1f", fontSize: 14 }}>{s.studentname}</div>
                                                            <div style={{ fontSize: 11, color: "#86868b" }}>{s.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ fontWeight: 600 }}>{s.total}</td>
                                                <td style={{ color: "#30d158", fontWeight: 600 }}>{s.present}</td>
                                                <td style={{ color: "#ff3b30", fontWeight: 600 }}>{s.absent}</td>
                                                <td>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                        <div style={{
                                                            flex: 1, height: 6, background: "#f0f0f5",
                                                            borderRadius: 3, overflow: "hidden", minWidth: 60,
                                                        }}>
                                                            <div style={{
                                                                width: `${s.percentage}%`, height: "100%",
                                                                background: getColor(s.percentage),
                                                                borderRadius: 3, transition: "width 0.5s ease",
                                                            }} />
                                                        </div>
                                                        <span style={{ fontSize: 13, fontWeight: 700, color: getColor(s.percentage), minWidth: 38 }}>
                                                            {s.percentage}%
                                                        </span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span style={{
                                                        padding: "3px 10px", borderRadius: 980,
                                                        fontSize: 11, fontWeight: 600,
                                                        background: s.percentage >= 75 ? "#30d15815" : "#ff3b3015",
                                                        color: s.percentage >= 75 ? "#30d158" : "#ff3b30",
                                                    }}>
                                                        {s.percentage >= 85 ? "Excellent" : s.percentage >= 75 ? "Good" : "Low"}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
