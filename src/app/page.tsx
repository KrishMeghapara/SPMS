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
        <div style={{ background: "#000000", minHeight: "100vh", fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", color: "#f5f5f7", overflow: "hidden" }}>
            {/* Ambient Background Glow */}
            <div style={{
                position: "absolute", top: "-20%", left: "50%", transform: "translateX(-50%)",
                width: "80vw", height: "80vw", maxWidth: 1000, maxHeight: 1000,
                background: "radial-gradient(circle, rgba(0,113,227,0.15) 0%, rgba(90,200,250,0.05) 40%, rgba(0,0,0,0) 70%)",
                zIndex: 0, pointerEvents: "none",
            }} />

            {/* Nav */}
            <nav style={{
                position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
                background: "rgba(0,0,0,0.5)", backdropFilter: "blur(24px) saturate(180%)", WebkitBackdropFilter: "blur(24px) saturate(180%)",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
            }}>
                <div style={{
                    maxWidth: 1000, margin: "0 auto", padding: "0 24px",
                    height: 52, display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                            <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" />
                        </svg>
                        <span style={{ fontSize: 16, fontWeight: 600, color: "#f5f5f7", letterSpacing: "-0.01em" }}>SPMS</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                        <div style={{ display: "flex", gap: 24, fontSize: 12, color: "rgba(255,255,255,0.7)" }} className="hide-mobile">
                            <span style={{ cursor: "pointer", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "white"} onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.7)"}>Overview</span>
                            <span style={{ cursor: "pointer", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "white"} onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.7)"}>Features</span>
                            <span style={{ cursor: "pointer", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "white"} onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.7)"}>Roles</span>
                        </div>
                        <button onClick={() => router.push("/login")}
                            style={{
                                padding: "4px 14px", borderRadius: 980, border: "none",
                                background: "#f5f5f7", color: "#000", fontSize: 12, fontWeight: 600,
                                cursor: "pointer", transition: "all 0.2s",
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = "#fff"}
                            onMouseLeave={e => e.currentTarget.style.background = "#f5f5f7"}
                        >
                            Sign In
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section style={{
                position: "relative", zIndex: 10,
                paddingTop: 180, paddingBottom: 100,
                textAlign: "center", maxWidth: 1000, margin: "0 auto", padding: "180px 24px 100px",
            }}>
                <h1 style={{
                    fontSize: "clamp(48px, 8vw, 84px)", fontWeight: 700, color: "#f5f5f7",
                    letterSpacing: "-0.04em", lineHeight: 1.05, marginBottom: 24,
                    textShadow: "0 4px 24px rgba(0,0,0,0.5)",
                    animation: "heroFadeIn 1s cubic-bezier(0.16, 1, 0.3, 1) both",
                }}>
                    Pro management.<br />
                    <span style={{
                        background: "linear-gradient(90deg, #2997ff 0%, #a252fa 50%, #ff3b30 100%)",
                        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                    }}>
                        M1-level speed.
                    </span>
                </h1>
                <p style={{
                    fontSize: 21, color: "#a1a1a6", lineHeight: 1.5, maxWidth: 640, margin: "0 auto 40px",
                    fontWeight: 500, letterSpacing: "-0.015em",
                    animation: "heroFadeIn 1s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both",
                }}>
                    A beautifully engineered platform to organize, track, and evaluate academic projects with unprecedented clarity and power.
                </p>
                <div style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap", animation: "heroFadeIn 1s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both" }}>
                    <button onClick={() => router.push("/login")}
                        style={{
                            padding: "16px 36px", borderRadius: 980, border: "none",
                            background: "#f5f5f7", color: "#000", fontSize: 17, fontWeight: 600,
                            cursor: "pointer", transition: "all 0.25s", transformOrigin: "center",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.02)"; e.currentTarget.style.background = "#fff"; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.background = "#f5f5f7"; }}
                    >
                        Sign In
                    </button>
                    <button onClick={() => {
                        document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
                    }}
                        style={{
                            padding: "16px 36px", borderRadius: 980,
                            border: "1px solid rgba(255,255,255,0.2)", background: "transparent",
                            color: "#f5f5f7", fontSize: 17, fontWeight: 600,
                            cursor: "pointer", transition: "all 0.25s",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                    >
                        Learn more ›
                    </button>
                </div>
            </section>



            {/* Stats Bar */}
            <section style={{ maxWidth: 1000, margin: "0 auto 120px", padding: "0 24px", position: "relative", zIndex: 10 }}>
                <div style={{
                    display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1,
                    background: "rgba(255,255,255,0.03)", borderRadius: 24, border: "1px solid rgba(255,255,255,0.08)",
                    backdropFilter: "blur(20px)", overflow: "hidden",
                }}>
                    {stats.map((s, i) => (
                        <div key={i} style={{ padding: "36px 24px", textAlign: "center" }}>
                            <div style={{ fontSize: 40, fontWeight: 700, color: "#f5f5f7", letterSpacing: "-0.04em" }}>{s.value}</div>
                            <div style={{ fontSize: 13, color: "#a1a1a6", fontWeight: 600, marginTop: 4, letterSpacing: "0.02em" }}>{s.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features */}
            <section id="features" style={{
                maxWidth: 1200, margin: "0 auto 120px", padding: "0 24px", position: "relative", zIndex: 10
            }}>
                <div style={{ textAlign: "center", marginBottom: 64 }}>
                    <h2 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 700, color: "#f5f5f7", letterSpacing: "-0.03em", marginBottom: 12 }}>
                        Powerful features.<br/>Simple by design.
                    </h2>
                    <p style={{ fontSize: 19, color: "#a1a1a6", maxWidth: 600, margin: "0 auto", fontWeight: 500 }}>
                        Engineered to give you everything you need, and nothing you don&apos;t.
                    </p>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
                    {features.map((f, i) => (
                        <div key={i} style={{
                            background: "rgba(255,255,255,0.02)", borderRadius: 24, padding: "32px",
                            border: "1px solid rgba(255,255,255,0.05)",
                            transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)", cursor: "default",
                        }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = "scale(1.02)";
                                e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                                e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = "none";
                                e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                                e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)";
                            }}
                        >
                            <div style={{ fontSize: 40, marginBottom: 20, filter: "drop-shadow(0 4px 12px rgba(255,255,255,0.1))" }}>{f.icon}</div>
                            <h3 style={{ fontSize: 21, fontWeight: 700, color: "#f5f5f7", marginBottom: 10, letterSpacing: "-0.02em" }}>{f.title}</h3>
                            <p style={{ fontSize: 15, color: "#a1a1a6", lineHeight: 1.5, fontWeight: 500 }}>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Roles */}
            <section style={{
                background: "#111111", padding: "120px 24px", position: "relative", zIndex: 10,
                borderTop: "1px solid #222"
            }}>
                <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                    <div style={{ textAlign: "center", marginBottom: 64 }}>
                        <h2 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 700, color: "#f5f5f7", letterSpacing: "-0.03em", marginBottom: 12 }}>
                            Three roles.<br/>One unified system.
                        </h2>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
                        {[
                            { role: "Admin", color: "#2997ff", items: ["Full system control", "User management", "Approve project groups", "Access all reports"] },
                            { role: "Staff", color: "#a252fa", items: ["Guide project teams", "Schedule meetings", "Track attendance", "View analytics"] },
                            { role: "Student", color: "#30d158", items: ["Join project groups", "View meeting schedules", "Track own progress", "Submit project details"] },
                        ].map((r, i) => (
                            <div key={i} style={{
                                background: "#000", borderRadius: 24, padding: "40px 32px",
                                border: "1px solid #222", position: "relative", overflow: "hidden"
                            }}>
                                <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 3, background: r.color }} />
                                <h3 style={{ fontSize: 24, fontWeight: 700, color: "#f5f5f7", marginBottom: 24, letterSpacing: "-0.02em" }}>{r.role}</h3>
                                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                                    {r.items.map((item, j) => (
                                        <li key={j} style={{
                                            padding: "12px 0", fontSize: 15, color: "#a1a1a6", fontWeight: 500,
                                            borderBottom: j < r.items.length - 1 ? "1px solid #222" : "none",
                                            display: "flex", alignItems: "center", gap: 12,
                                        }}>
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill={r.color}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>
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
            <section style={{ textAlign: "center", padding: "120px 24px 160px", position: "relative", zIndex: 10 }}>
                <h2 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 700, color: "#f5f5f7", letterSpacing: "-0.03em", marginBottom: 16 }}>
                    Unlock your potential.
                </h2>
                <p style={{ fontSize: 21, color: "#a1a1a6", marginBottom: 40, maxWidth: 450, margin: "0 auto 40px", fontWeight: 500 }}>
                    Sign in to your dashboard.
                </p>
                <button onClick={() => router.push("/login")}
                    style={{
                        padding: "16px 40px", borderRadius: 980, border: "none",
                        background: "#f5f5f7", color: "#000", fontSize: 17, fontWeight: 600,
                        cursor: "pointer", transition: "all 0.25s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.02)"; e.currentTarget.style.background = "#fff"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.background = "#f5f5f7"; }}
                >
                    Get Started
                </button>
            </section>

            {/* Footer */}
            <footer style={{
                borderTop: "1px solid #222", padding: "32px 24px",
                textAlign: "center", color: "#6e6e73", fontSize: 12,
                position: "relative", zIndex: 10, background: "#000"
            }}>
                <p>Copyright © {new Date().getFullYear()} SPMS. Built with Next.js & PostgreSQL.</p>
            </footer>

            <style>{`
                @keyframes heroFadeIn {
                    from { opacity: 0; transform: translateY(30px); filter: blur(10px); }
                    to { opacity: 1; transform: translateY(0); filter: blur(0); }
                }
                @media (max-width: 768px) {
                    .hide-mobile { display: none !important; }
                }
            `}</style>
        </div>
    );
}
