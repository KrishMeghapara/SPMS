"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("spms_token");
        if (token) {
            router.replace("/dashboard");
            return;
        }
        setMounted(true);
    }, [router]);

    if (!mounted) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#f5f5f7" }}>
                <div className="skeleton" style={{ width: 150, height: 24 }} />
            </div>
        );
    }

    const features = [
        { icon: "📊", title: "Project Tracking", desc: "Monitor project groups, milestones, and team progress in real-time" },
        { icon: "👥", title: "Team Management", desc: "Organize student groups, assign guides, and manage memberships" },
        { icon: "📅", title: "Meeting Scheduler", desc: "Schedule, track attendance, and record notes for project meetings" },
        { icon: "📈", title: "Reports & Analytics", desc: "Visualize project data with charts, export reports as PDF or Excel" },
        { icon: "🔐", title: "Role-Based Access", desc: "Separate dashboards and permissions for Admins, Staff, and Students" },
        { icon: "⚡", title: "Real-Time Dashboard", desc: "Instant overview with Bento Grid layout, sparklines, and live stats" },
    ];

    const stats = [
        { value: "3", label: "User Roles" },
        { value: "6", label: "Core Modules" },
        { value: "20+", label: "API Endpoints" },
        { value: "∞", label: "Possibilities" },
    ];

    return (
        <div style={{ background: "#f5f5f7", minHeight: "100vh", fontFamily: "'Inter', -apple-system, sans-serif" }}>
            {/* Nav */}
            <nav style={{
                position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
                background: "rgba(245,245,247,0.72)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
                borderBottom: "1px solid rgba(0,0,0,0.06)",
            }}>
                <div style={{
                    maxWidth: 1200, margin: "0 auto", padding: "0 32px",
                    height: 56, display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                            width: 32, height: 32, borderRadius: 8,
                            background: "linear-gradient(135deg, #0071e3, #5ac8fa)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                                <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" />
                            </svg>
                        </div>
                        <span style={{ fontSize: 18, fontWeight: 700, color: "#1d1d1f", letterSpacing: "-0.03em" }}>SPMS</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <button onClick={() => router.push("/login")}
                            style={{
                                padding: "8px 20px", borderRadius: 980, border: "none",
                                background: "#0071e3", color: "white", fontSize: 14, fontWeight: 600,
                                cursor: "pointer", transition: "all 0.2s",
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = "#0077ED"}
                            onMouseLeave={e => e.currentTarget.style.background = "#0071e3"}
                        >
                            Sign In
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section style={{
                paddingTop: 140, paddingBottom: 80,
                textAlign: "center", maxWidth: 900, margin: "0 auto", padding: "140px 32px 80px",
            }}>
                <div style={{
                    display: "inline-block", padding: "6px 16px", borderRadius: 980,
                    background: "rgba(0,113,227,0.08)", color: "#0071e3",
                    fontSize: 13, fontWeight: 600, marginBottom: 20, letterSpacing: "-0.01em",
                }}>
                    🎓 Built for Academic Excellence
                </div>
                <h1 style={{
                    fontSize: "clamp(40px, 6vw, 64px)", fontWeight: 700, color: "#1d1d1f",
                    letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: 20,
                    animation: "heroFadeIn 0.8s ease both",
                }}>
                    Student Project<br />
                    <span style={{
                        background: "linear-gradient(135deg, #0071e3 0%, #5ac8fa 50%, #bf5af2 100%)",
                        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                    }}>
                        Management System
                    </span>
                </h1>
                <p style={{
                    fontSize: 19, color: "#6e6e73", lineHeight: 1.6, maxWidth: 600, margin: "0 auto 36px",
                    animation: "heroFadeIn 0.8s ease 0.15s both",
                }}>
                    A modern platform to organize, track, and evaluate academic projects.
                    Designed for institutions that value clarity and efficiency.
                </p>
                <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", animation: "heroFadeIn 0.8s ease 0.3s both" }}>
                    <button onClick={() => router.push("/login")}
                        style={{
                            padding: "14px 32px", borderRadius: 980, border: "none",
                            background: "#0071e3", color: "white", fontSize: 16, fontWeight: 600,
                            cursor: "pointer", transition: "all 0.25s",
                            boxShadow: "0 4px 16px rgba(0,113,227,0.3)",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,113,227,0.4)"; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,113,227,0.3)"; }}
                    >
                        Get Started →
                    </button>
                    <button onClick={() => {
                        document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
                    }}
                        style={{
                            padding: "14px 32px", borderRadius: 980,
                            border: "1px solid rgba(0,0,0,0.1)", background: "white",
                            color: "#1d1d1f", fontSize: 16, fontWeight: 600,
                            cursor: "pointer", transition: "all 0.25s",
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = "#f5f5f7"}
                        onMouseLeave={e => e.currentTarget.style.background = "white"}
                    >
                        Learn More
                    </button>
                </div>
            </section>

            {/* Stats Bar */}
            <section style={{
                maxWidth: 900, margin: "0 auto 64px", padding: "0 32px",
            }}>
                <div style={{
                    display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1,
                    background: "white", borderRadius: 20,
                    boxShadow: "0 2px 12px rgba(0,0,0,0.06)", overflow: "hidden",
                }}>
                    {stats.map((s, i) => (
                        <div key={i} style={{
                            padding: "28px 24px", textAlign: "center",
                            borderRight: i < 3 ? "1px solid rgba(0,0,0,0.06)" : "none",
                        }}>
                            <div style={{ fontSize: 32, fontWeight: 800, color: "#0071e3", letterSpacing: "-0.04em" }}>{s.value}</div>
                            <div style={{ fontSize: 13, color: "#86868b", fontWeight: 500, marginTop: 4 }}>{s.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features */}
            <section id="features" style={{
                maxWidth: 1100, margin: "0 auto", padding: "0 32px 80px",
            }}>
                <div style={{ textAlign: "center", marginBottom: 48 }}>
                    <h2 style={{ fontSize: 36, fontWeight: 700, color: "#1d1d1f", letterSpacing: "-0.03em", marginBottom: 10 }}>
                        Everything you need
                    </h2>
                    <p style={{ fontSize: 17, color: "#86868b", maxWidth: 500, margin: "0 auto" }}>
                        Built with modern tools — Next.js, PostgreSQL, Prisma — for a premium experience
                    </p>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
                    {features.map((f, i) => (
                        <div key={i} style={{
                            background: "white", borderRadius: 20, padding: 28,
                            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                            transition: "all 0.3s", cursor: "default",
                            animation: `heroFadeIn 0.5s ease ${i * 0.08}s both`,
                        }}
                            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 30px rgba(0,0,0,0.08)"; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)"; }}
                        >
                            <div style={{ fontSize: 32, marginBottom: 14 }}>{f.icon}</div>
                            <h3 style={{ fontSize: 17, fontWeight: 700, color: "#1d1d1f", marginBottom: 8, letterSpacing: "-0.02em" }}>{f.title}</h3>
                            <p style={{ fontSize: 14, color: "#86868b", lineHeight: 1.6 }}>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Roles */}
            <section style={{
                background: "#1d1d1f", padding: "80px 32px",
            }}>
                <div style={{ maxWidth: 1100, margin: "0 auto" }}>
                    <div style={{ textAlign: "center", marginBottom: 48 }}>
                        <h2 style={{ fontSize: 36, fontWeight: 700, color: "white", letterSpacing: "-0.03em", marginBottom: 10 }}>
                            Designed for every role
                        </h2>
                        <p style={{ fontSize: 17, color: "rgba(255,255,255,0.5)" }}>
                            Tailored experiences for administrators, faculty, and students
                        </p>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
                        {[
                            { role: "Admin", color: "#0071e3", items: ["Full system control", "User management", "Approve project groups", "Access all reports"] },
                            { role: "Staff", color: "#bf5af2", items: ["Guide project teams", "Schedule meetings", "Track attendance", "View analytics"] },
                            { role: "Student", color: "#30d158", items: ["Join project groups", "View meeting schedules", "Track own progress", "Submit project details"] },
                        ].map((r, i) => (
                            <div key={i} style={{
                                background: "rgba(255,255,255,0.06)", borderRadius: 20, padding: 28,
                                border: "1px solid rgba(255,255,255,0.08)",
                                animation: `heroFadeIn 0.5s ease ${i * 0.1}s both`,
                            }}>
                                <div style={{
                                    display: "inline-block", padding: "6px 14px", borderRadius: 980,
                                    background: `${r.color}22`, color: r.color,
                                    fontSize: 13, fontWeight: 700, marginBottom: 16,
                                }}>{r.role}</div>
                                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                                    {r.items.map((item, j) => (
                                        <li key={j} style={{
                                            padding: "10px 0", fontSize: 14, color: "rgba(255,255,255,0.7)",
                                            borderBottom: j < r.items.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
                                            display: "flex", alignItems: "center", gap: 10,
                                        }}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill={r.color}><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section style={{ textAlign: "center", padding: "80px 32px" }}>
                <h2 style={{ fontSize: 36, fontWeight: 700, color: "#1d1d1f", letterSpacing: "-0.03em", marginBottom: 12 }}>
                    Ready to get started?
                </h2>
                <p style={{ fontSize: 17, color: "#86868b", marginBottom: 32, maxWidth: 450, margin: "0 auto 32px" }}>
                    Sign in to access your dashboard and start managing projects today.
                </p>
                <button onClick={() => router.push("/login")}
                    style={{
                        padding: "16px 40px", borderRadius: 980, border: "none",
                        background: "#0071e3", color: "white", fontSize: 17, fontWeight: 600,
                        cursor: "pointer", boxShadow: "0 4px 16px rgba(0,113,227,0.3)",
                        transition: "all 0.25s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,113,227,0.4)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,113,227,0.3)"; }}
                >
                    Sign In →
                </button>
            </section>

            {/* Footer */}
            <footer style={{
                borderTop: "1px solid rgba(0,0,0,0.06)", padding: "24px 32px",
                textAlign: "center", color: "#86868b", fontSize: 13,
            }}>
                <p>© {new Date().getFullYear()} SPMS — Student Project Management System. Built with Next.js & PostgreSQL.</p>
            </footer>

            <style>{`
                @keyframes heroFadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
