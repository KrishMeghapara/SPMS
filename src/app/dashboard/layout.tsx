"use client";

import { useEffect, useState, useRef, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AuthProvider, useAuth } from "@/context/AuthContext";

const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: "dashboard", roles: ["admin", "staff", "student"] },
    { href: "/dashboard/project-types", label: "Project Types", icon: "category", roles: ["admin"] },
    { href: "/dashboard/staff", label: "Staff", icon: "school", roles: ["admin"] },
    { href: "/dashboard/students", label: "Students", icon: "people", roles: ["admin"] },
    { href: "/dashboard/project-groups", label: "Project Groups", icon: "groups", roles: ["admin", "staff", "student"] },
    { href: "/dashboard/meetings", label: "Meetings", icon: "event", roles: ["admin", "staff", "student"] },
    { href: "/dashboard/reports", label: "Reports", icon: "bar_chart", roles: ["admin", "staff"] },
    { href: "/dashboard/attendance", label: "Attendance", icon: "fact_check", roles: ["admin", "staff"] },
];

const icons: Record<string, ReactNode> = {
    dashboard: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" /></svg>,
    category: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l-5.5 9h11L12 2zm0 3.84L13.93 9h-3.87L12 5.84zM17.5 13c-2.49 0-4.5 2.01-4.5 4.5s2.01 4.5 4.5 4.5 4.5-2.01 4.5-4.5-2.01-4.5-4.5-4.5zm0 7c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zM3 21.5h8v-8H3v8zm2-6h4v4H5v-4z" /></svg>,
    school: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z" /></svg>,
    people: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" /></svg>,
    groups: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12.75c1.63 0 3.07.39 4.24.9 1.08.48 1.76 1.56 1.76 2.73V18H6v-1.61c0-1.18.68-2.26 1.76-2.73 1.17-.52 2.61-.91 4.24-.91zM4 13c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm1.13 1.1c-.37-.06-.74-.1-1.13-.1-.99 0-1.93.21-2.78.58C.48 14.9 0 15.62 0 16.43V18h4.5v-1.61c0-.83.23-1.61.63-2.29zM20 13c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm4 3.43c0-.81-.48-1.53-1.22-1.85-.85-.37-1.79-.58-2.78-.58-.39 0-.76.04-1.13.1.4.68.63 1.46.63 2.29V18H24v-1.57zM12 6c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3z" /></svg>,
    event: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z" /></svg>,
    bar_chart: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z" /></svg>,
    fact_check: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20 3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM10 17H5v-2h5v2zm0-4H5v-2h5v2zm0-4H5V7h5v2zm4.82 6L12 12.16l1.41-1.41 1.41 1.42L18.99 8l1.42 1.42L14.82 15z" /></svg>,
    person: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>,
    calendar_month: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z" /></svg>,
    check_circle: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>,
    logout: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" /></svg>,
    menu: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" /></svg>,
    close: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3 18h13v-2H3v2zm0-5h10v-2H3v2zm0-7v2h13V6H3zm18 9.59L17.42 12 21 8.41 19.59 7l-5 5 5 5L21 15.59z" /></svg>,
};

function DashboardContent({ children }: { children: ReactNode }) {
    const { user, logout, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [profileOpen, setProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);

    useEffect(() => { if (!isLoading && !user) router.replace("/login"); }, [user, isLoading, router]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    if (isLoading) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#f5f5f7" }}>
                <div style={{ textAlign: "center" }}>
                    <div style={{ width: 40, height: 40, border: "3px solid #e8e8ed", borderTopColor: "#0071e3", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
                    <p style={{ color: "#86868b", fontSize: 14 }}>Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) return null;

    const filteredNav = navItems.filter(item => item.roles.includes(user.role));
    const currentPage = navItems.find(item => pathname === item.href);
    const pageTitle = currentPage?.label || "Dashboard";

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "#f5f5f7" }}>
            {/* Sidebar — Apple dark */}
            <aside style={{
                width: sidebarOpen ? 240 : 72,
                background: "#1d1d1f",
                display: "flex", flexDirection: "column",
                transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                position: "fixed", top: 0, left: 0, bottom: 0,
                zIndex: 50, overflow: "hidden",
            }}>
                {/* Logo */}
                <div style={{
                    padding: sidebarOpen ? "20px 18px" : "20px 16px",
                    display: "flex", alignItems: "center", gap: 12,
                    minHeight: 72,
                }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                        background: "linear-gradient(135deg, #0071e3, #5ac8fa)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                            <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" />
                        </svg>
                    </div>
                    {sidebarOpen && (
                        <div style={{ animation: "fadeIn 0.2s ease" }}>
                            <div style={{ fontSize: 16, fontWeight: 700, color: "white", letterSpacing: "-0.02em" }}>SPMS</div>
                        </div>
                    )}
                </div>

                {/* Nav */}
                <nav style={{ flex: 1, padding: "8px 8px", overflowY: "auto" }}>
                    {filteredNav.map((item, index) => {
                        const isActive = pathname === item.href;
                        return (
                            <a key={item.href} href={item.href}
                                style={{
                                    display: "flex", alignItems: "center", gap: 12,
                                    padding: sidebarOpen ? "10px 14px" : "10px 0",
                                    justifyContent: sidebarOpen ? "flex-start" : "center",
                                    borderRadius: 10, marginBottom: 2,
                                    textDecoration: "none", fontSize: 14,
                                    fontWeight: isActive ? 600 : 400,
                                    letterSpacing: "-0.01em",
                                    color: isActive ? "white" : "rgba(255,255,255,0.5)",
                                    background: isActive ? "rgba(255,255,255,0.12)" : "transparent",
                                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                                    animation: `staggerFade 0.3s ease ${index * 0.04}s both`,
                                    position: "relative",
                                }}
                                onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.8)"; } }}
                                onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; } }}
                            >
                                {isActive && <div style={{ position: "absolute", left: 0, top: 8, bottom: 8, width: 3, borderRadius: "0 3px 3px 0", background: "#0071e3" }} />}
                                <span style={{ opacity: isActive ? 1 : 0.55, display: "flex", transition: "opacity 0.2s" }}>{icons[item.icon]}</span>
                                {sidebarOpen && <span>{item.label}</span>}
                            </a>
                        );
                    })}
                </nav>

                {/* Bottom section — divider + logout */}
                <div style={{ padding: "8px 8px 12px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                    <button onClick={() => { logout(); router.push("/login"); }}
                        style={{
                            display: "flex", alignItems: "center", gap: 12, width: "100%",
                            padding: sidebarOpen ? "10px 14px" : "10px 0",
                            justifyContent: sidebarOpen ? "flex-start" : "center",
                            borderRadius: 10, border: "none", cursor: "pointer",
                            background: "transparent", color: "rgba(255,255,255,0.4)",
                            fontSize: 14, fontWeight: 400, transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,59,48,0.1)"; e.currentTarget.style.color = "rgba(255,59,48,0.9)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}
                    >
                        <span style={{ display: "flex" }}>{icons.logout}</span>
                        {sidebarOpen && <span>Sign Out</span>}
                    </button>
                    {sidebarOpen && (
                        <div style={{ textAlign: "center", fontSize: 10, color: "rgba(255,255,255,0.15)", marginTop: 8, letterSpacing: "0.05em" }}>
                            SPMS v1.0
                        </div>
                    )}
                </div>
            </aside>

            {/* Main */}
            <main style={{
                flex: 1, marginLeft: sidebarOpen ? 240 : 72,
                transition: "margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                minHeight: "100vh",
            }}>
                {/* Header bar */}
                <header style={{
                    padding: "0 32px", height: 60,
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    background: "rgba(245,245,247,0.8)",
                    backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
                    position: "sticky", top: 0, zIndex: 30,
                    borderBottom: "1px solid rgba(0,0,0,0.06)",
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <button onClick={() => setSidebarOpen(!sidebarOpen)}
                            style={{ background: "none", border: "none", color: "#86868b", padding: 6, cursor: "pointer", display: "flex", borderRadius: 8, transition: "all 0.15s" }}
                            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(0,0,0,0.05)"}
                            onMouseLeave={(e) => e.currentTarget.style.background = "none"}
                        >
                            {sidebarOpen ? icons.close : icons.menu}
                        </button>
                        <h2 style={{ fontSize: 17, fontWeight: 600, color: "#1d1d1f", letterSpacing: "-0.02em" }}>{pageTitle}</h2>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{
                            padding: "4px 12px", borderRadius: 980,
                            background: "#f0f0f0", fontSize: 12, fontWeight: 600,
                            color: "#6e6e73", textTransform: "capitalize",
                        }}>{user.role}</span>
                        <div ref={profileRef} style={{ position: "relative" }}>
                            <button onClick={() => setProfileOpen(!profileOpen)}
                                style={{
                                    width: 34, height: 34, borderRadius: "50%",
                                    background: "linear-gradient(135deg, #0071e3, #5ac8fa)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: 14, fontWeight: 600, color: "white",
                                    border: "none", cursor: "pointer", transition: "all 0.15s",
                                }}>
                                {user.name.charAt(0).toUpperCase()}
                            </button>
                            {profileOpen && (
                                <div style={{
                                    position: "absolute", right: 0, top: "calc(100% + 8px)",
                                    background: "white", borderRadius: 16,
                                    boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
                                    minWidth: 200, overflow: "hidden",
                                    animation: "slideUp 0.2s ease", zIndex: 100,
                                }}>
                                    <div style={{ padding: "14px 18px", borderBottom: "1px solid #f0f0f0" }}>
                                        <div style={{ fontSize: 14, fontWeight: 600, color: "#1d1d1f" }}>{user.name}</div>
                                        <div style={{ fontSize: 12, color: "#86868b", textTransform: "capitalize" }}>{user.role}</div>
                                    </div>
                                    <div style={{ padding: 6 }}>
                                        <button onClick={() => { setProfileOpen(false); router.push("/dashboard/profile"); }}
                                            style={{
                                                width: "100%", display: "flex", alignItems: "center", gap: 10,
                                                padding: "9px 14px", border: "none", background: "transparent",
                                                borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 500,
                                                color: "#1d1d1f", textAlign: "left", transition: "all 0.15s",
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(0,0,0,0.04)"}
                                            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                                        >{icons.person} My Profile</button>
                                        <button onClick={logout}
                                            style={{
                                                width: "100%", display: "flex", alignItems: "center", gap: 10,
                                                padding: "9px 14px", border: "none", background: "transparent",
                                                borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 500,
                                                color: "#ff3b30", textAlign: "left", transition: "all 0.15s",
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,59,48,0.06)"}
                                            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                                        >{icons.logout} Sign Out</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <div style={{ padding: "24px 32px" }}>{children}</div>
            </main>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes staggerFade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return (<AuthProvider><DashboardContent>{children}</DashboardContent></AuthProvider>);
}
