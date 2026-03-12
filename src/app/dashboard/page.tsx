"use client";

import { useEffect, useState, useRef } from "react";
import { useApi } from "@/context/AuthContext";

interface DashboardStats {
    totalProjects: number; totalStudents: number; totalStaff: number;
    totalMeetings: number; projectTypes: number; pendingProjects: number;
    approvedProjects: number; upcomingMeetings: number;
}
interface RecentProject {
    projectgroupid: number; projectgroupname: string; projecttitle: string;
    status: string; projectType: { projecttypename: string } | null;
    members: { student: { studentname: string } }[]; created: string;
}
interface RecentMeeting {
    projectmeetingid: number; meetingdatetime: string; meetingstatus: string;
    meetingpurpose: string;
    projectGroup: { projectgroupname: string; projecttitle: string } | null;
    guideStaff: { staffname: string } | null;
}

// Animated counter
function Counter({ value, suffix = "" }: { value: number; suffix?: string }) {
    const [display, setDisplay] = useState(0);
    const ref = useRef(0);
    useEffect(() => {
        const duration = 900;
        const start = ref.current;
        const diff = value - start;
        const t0 = Date.now();
        const tick = () => {
            const p = Math.min((Date.now() - t0) / duration, 1);
            const e = 1 - Math.pow(1 - p, 3);
            const c = Math.round(start + diff * e);
            setDisplay(c); ref.current = c;
            if (p < 1) requestAnimationFrame(tick);
        };
        tick();
    }, [value]);
    return <>{display}{suffix}</>;
}

// Mini sparkline
function Spark({ data, color }: { data: number[]; color: string }) {
    const max = Math.max(...data, 1);
    const w = 100; const h = 36;
    const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * h * 0.8 - h * 0.1}`).join(" ");
    return (
        <svg width={w} height={h} style={{ opacity: 0.6 }}>
            <defs>
                <linearGradient id={`s${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.2" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <polygon points={`0,${h} ${pts} ${w},${h}`} fill={`url(#s${color.replace("#", "")})`} />
            <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

export default function DashboardPage() {
    const { apiFetch } = useApi();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);
    const [recentMeetings, setRecentMeetings] = useState<RecentMeeting[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const data = await apiFetch("/api/dashboard");
                setStats(data.stats); setRecentProjects(data.recentProjects); setRecentMeetings(data.recentMeetings);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        })();
    }, [apiFetch]);

    if (loading) {
        return (
            <div>
                <div style={{ marginBottom: 24 }}>
                    <div className="skeleton" style={{ width: 200, height: 36, marginBottom: 8 }} />
                    <div className="skeleton" style={{ width: 320, height: 16 }} />
                </div>
                <div className="bento-grid">
                    <div className="skeleton bento-span-2" style={{ height: 200 }} />
                    <div className="skeleton" style={{ height: 140 }} />
                    <div className="skeleton" style={{ height: 140 }} />
                    <div className="skeleton bento-span-2" style={{ height: 300 }} />
                    <div className="skeleton bento-span-2" style={{ height: 300 }} />
                </div>
            </div>
        );
    }

    const s = stats!;

    return (
        <div className="page-enter">
            <div style={{ marginBottom: 24 }}>
                <h1 className="page-title">Dashboard</h1>
                <p className="page-subtitle">Welcome back. Here&apos;s your overview.</p>
            </div>

            {/* === BENTO GRID === */}
            <div className="bento-grid">

                {/* HERO CARD — big, spans 2 cols */}
                <div className="bento-span-2 hero-gradient" style={{
                    borderRadius: 24, padding: "36px 40px", color: "white",
                    display: "flex", flexDirection: "column", justifyContent: "space-between",
                    minHeight: 220, animation: "slideUp 0.4s ease both",
                    boxShadow: "0 8px 30px rgba(0,0,0,0.12)", position: "relative", overflow: "hidden",
                }}>
                    <div>
                        <p style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Total Projects</p>
                        <div style={{ fontSize: 64, fontWeight: 800, letterSpacing: "-0.06em", lineHeight: 1 }}>
                            <Counter value={s.totalProjects} />
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: 24, marginTop: 20 }}>
                        <div>
                            <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.03em" }}><Counter value={s.approvedProjects} /></div>
                            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Approved</div>
                        </div>
                        <div>
                            <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.03em" }}><Counter value={s.pendingProjects} /></div>
                            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Pending</div>
                        </div>
                        <div>
                            <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.03em" }}><Counter value={s.projectTypes} /></div>
                            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Types</div>
                        </div>
                    </div>
                </div>

                {/* STUDENTS card */}
                <div style={{
                    background: "white", borderRadius: 24, padding: "28px",
                    boxShadow: "var(--shadow-card)", animation: "slideUp 0.4s ease 0.05s both",
                    display: "flex", flexDirection: "column", justifyContent: "space-between",
                    transition: "all 0.3s",
                }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "var(--shadow-card-hover)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "var(--shadow-card)"; }}
                >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#86868b" }}>Students</span>
                        <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(90,200,250,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="#5ac8fa"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
                        </div>
                    </div>
                    <div style={{ fontSize: 42, fontWeight: 800, letterSpacing: "-0.05em", color: "#1d1d1f", margin: "8px 0" }}>
                        <Counter value={s.totalStudents} />
                    </div>
                    <Spark data={[5, 8, 6, 12, 9, 14, 11]} color="#5ac8fa" />
                </div>

                {/* STAFF card */}
                <div style={{
                    background: "white", borderRadius: 24, padding: "28px",
                    boxShadow: "var(--shadow-card)", animation: "slideUp 0.4s ease 0.1s both",
                    display: "flex", flexDirection: "column", justifyContent: "space-between",
                    transition: "all 0.3s",
                }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "var(--shadow-card-hover)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "var(--shadow-card)"; }}
                >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#86868b" }}>Staff</span>
                        <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(48,209,88,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="#30d158"><path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z" /></svg>
                        </div>
                    </div>
                    <div style={{ fontSize: 42, fontWeight: 800, letterSpacing: "-0.05em", color: "#1d1d1f", margin: "8px 0" }}>
                        <Counter value={s.totalStaff} />
                    </div>
                    <Spark data={[3, 4, 3, 5, 4, 6, 5]} color="#30d158" />
                </div>

                {/* MEETINGS — spans 2 cols, smaller */}
                <div className="bento-span-2" style={{
                    background: "white", borderRadius: 24, padding: "28px",
                    boxShadow: "var(--shadow-card)", animation: "slideUp 0.4s ease 0.15s both",
                }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                        <div>
                            <span style={{ fontSize: 13, fontWeight: 600, color: "#86868b" }}>Meetings</span>
                            <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-0.05em", marginTop: 4 }}>
                                <Counter value={s.totalMeetings} />
                            </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: 28, fontWeight: 700, color: "#0071e3", letterSpacing: "-0.03em" }}><Counter value={s.upcomingMeetings} /></div>
                            <div style={{ fontSize: 12, color: "#86868b" }}>Upcoming</div>
                        </div>
                    </div>
                    <Spark data={[2, 5, 3, 8, 4, 10, 6, 9, 5]} color="#0071e3" />
                </div>

                {/* Quick stat pills */}
                <div className="bento-span-2" style={{
                    display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12,
                    animation: "slideUp 0.4s ease 0.2s both",
                }}>
                    {[
                        { label: "Project Types", value: s.projectTypes, color: "#bf5af2" },
                        { label: "Approved", value: s.approvedProjects, color: "#30d158" },
                        { label: "Pending", value: s.pendingProjects, color: "#ff9500" },
                        { label: "Upcoming", value: s.upcomingMeetings, color: "#0071e3" },
                    ].map((item, i) => (
                        <div key={i} style={{
                            background: "white", borderRadius: 20, padding: "20px 24px",
                            boxShadow: "var(--shadow-card)", transition: "all 0.3s",
                        }}
                            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "var(--shadow-card-hover)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "var(--shadow-card)"; }}
                        >
                            <div style={{ fontSize: 12, fontWeight: 600, color: "#86868b", marginBottom: 6 }}>{item.label}</div>
                            <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.04em", color: item.color }}>
                                <Counter value={item.value} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* RECENT PROJECTS — wide card */}
                <div className="bento-span-2" style={{
                    background: "white", borderRadius: 24, padding: "28px",
                    boxShadow: "var(--shadow-card)", animation: "slideUp 0.4s ease 0.25s both",
                }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                        <h2 style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.03em" }}>Recent Projects</h2>
                        <span style={{ padding: "3px 10px", borderRadius: 980, background: "#f0f0f0", fontSize: 12, fontWeight: 600, color: "#6e6e73" }}>{recentProjects.length}</span>
                    </div>
                    {recentProjects.length === 0 ? (
                        <div className="empty-state" style={{ padding: "32px 0" }}>
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="#d1d1d6"><path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z" /></svg>
                            <p style={{ marginTop: 8 }}>No projects yet</p>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            {recentProjects.map((p, i) => (
                                <div key={p.projectgroupid} style={{
                                    display: "flex", alignItems: "center", justifyContent: "space-between",
                                    padding: "12px 16px", borderRadius: 14, background: "#f9f9f9",
                                    transition: "all 0.2s", cursor: "pointer",
                                    animation: `staggerFade 0.3s ease ${i * 0.04}s both`,
                                }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = "#f0f0f5"}
                                    onMouseLeave={(e) => e.currentTarget.style.background = "#f9f9f9"}
                                >
                                    <div>
                                        <div style={{ fontSize: 14, fontWeight: 600, color: "#1d1d1f" }}>{p.projecttitle || p.projectgroupname}</div>
                                        <div style={{ fontSize: 12, color: "#86868b", marginTop: 2 }}>
                                            {p.projectType?.projecttypename} · {p.members.length} members
                                        </div>
                                    </div>
                                    <span className={`badge ${p.status === "Approved" ? "badge-success" : "badge-warning"}`}>{p.status}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* RECENT MEETINGS — wide card */}
                <div className="bento-span-2" style={{
                    background: "white", borderRadius: 24, padding: "28px",
                    boxShadow: "var(--shadow-card)", animation: "slideUp 0.4s ease 0.3s both",
                }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                        <h2 style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.03em" }}>Recent Meetings</h2>
                        <span style={{ padding: "3px 10px", borderRadius: 980, background: "#f0f0f0", fontSize: 12, fontWeight: 600, color: "#6e6e73" }}>{recentMeetings.length}</span>
                    </div>
                    {recentMeetings.length === 0 ? (
                        <div className="empty-state" style={{ padding: "32px 0" }}>
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="#d1d1d6"><path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z" /></svg>
                            <p style={{ marginTop: 8 }}>Schedule your first meeting →</p>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            {recentMeetings.map((m, i) => (
                                <div key={m.projectmeetingid} style={{
                                    display: "flex", alignItems: "center", justifyContent: "space-between",
                                    padding: "12px 16px", borderRadius: 14, background: "#f9f9f9",
                                    transition: "all 0.2s",
                                    animation: `staggerFade 0.3s ease ${i * 0.04}s both`,
                                }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = "#f0f0f5"}
                                    onMouseLeave={(e) => e.currentTarget.style.background = "#f9f9f9"}
                                >
                                    <div>
                                        <div style={{ fontSize: 14, fontWeight: 600, color: "#1d1d1f" }}>{m.projectGroup?.projectgroupname || "Meeting"}</div>
                                        <div style={{ fontSize: 12, color: "#86868b", marginTop: 2 }}>
                                            {m.meetingpurpose || "—"} · {new Date(m.meetingdatetime).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <span className={`badge ${m.meetingstatus === "Completed" ? "badge-success" : m.meetingstatus === "Cancelled" ? "badge-danger" : "badge-info"}`}>{m.meetingstatus}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
