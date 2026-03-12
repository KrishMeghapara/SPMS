"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "@/context/AuthContext";

function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("admin");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showDemoHint, setShowDemoHint] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await login(email, password, role);
            router.push("/dashboard");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Login failed");
        } finally {
            setLoading(false);
        }
    };

    const roles = [
        { key: "admin", label: "Admin", desc: "Full system access" },
        { key: "staff", label: "Staff", desc: "Guide & evaluate" },
        { key: "student", label: "Student", desc: "View projects" },
    ];

    return (
        <div style={{ minHeight: "100vh", display: "flex", background: "#f5f5f7" }}>
            {/* Left — Brand */}
            <div style={{
                flex: 1, display: "flex", flexDirection: "column", justifyContent: "center",
                alignItems: "center", padding: "60px 48px",
                background: "#1d1d1f", position: "relative", overflow: "hidden",
            }}>
                {/* Abstract gradient blobs */}
                <div className="login-blob-1" style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,113,227,0.18) 0%, transparent 65%)", top: "-200px", right: "-200px" }} />
                <div className="login-blob-2" style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(191,90,242,0.14) 0%, transparent 65%)", bottom: "-150px", left: "-150px" }} />
                <div className="login-blob-3" style={{ position: "absolute", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(48,209,88,0.1) 0%, transparent 65%)", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />

                <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 440 }}>
                    {/* Logo */}
                    <div style={{
                        width: 72, height: 72, borderRadius: 22, margin: "0 auto 32px",
                        background: "linear-gradient(135deg, #0071e3 0%, #5ac8fa 100%)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: "0 12px 40px rgba(0,113,227,0.35)",
                    }}>
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="white">
                            <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" />
                        </svg>
                    </div>

                    <h1 style={{
                        fontSize: 52, fontWeight: 800, letterSpacing: "-0.05em",
                        color: "white", lineHeight: 1.05, marginBottom: 12,
                    }}>
                        SPMS
                    </h1>
                    <p style={{ fontSize: 20, color: "rgba(255,255,255,0.5)", fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 1.4 }}>
                        Student Project<br />Management System
                    </p>

                    <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 48, flexWrap: "wrap" }}>
                        {["Track", "Manage", "Collaborate"].map((t, i) => (
                            <span key={i} style={{
                                padding: "8px 20px", borderRadius: 980,
                                background: "rgba(255,255,255,0.08)", fontSize: 14,
                                color: "rgba(255,255,255,0.6)", fontWeight: 500,
                                animation: `slideUp 0.5s ease ${0.3 + i * 0.1}s both`,
                            }}>{t}</span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right — Form */}
            <div style={{
                width: 520, minWidth: 400, display: "flex", flexDirection: "column",
                justifyContent: "center", padding: "48px 56px", background: "white",
            }}>
                <div style={{ maxWidth: 380, width: "100%", margin: "0 auto" }}>
                    <h2 style={{ fontSize: 32, fontWeight: 800, color: "#1d1d1f", letterSpacing: "-0.04em", marginBottom: 4 }}>
                        Sign in
                    </h2>
                    <p style={{ fontSize: 15, color: "#86868b", marginBottom: 32 }}>
                        Choose your role and enter credentials
                    </p>

                    {/* Role cards */}
                    <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
                        {roles.map((r) => (
                            <button key={r.key} onClick={() => setRole(r.key)}
                                style={{
                                    flex: 1, padding: "14px 8px", borderRadius: 16, cursor: "pointer",
                                    border: role === r.key ? "2px solid #0071e3" : "2px solid #e8e8ed",
                                    background: role === r.key ? "#e1f0ff" : "white",
                                    transition: "all 0.2s", textAlign: "center",
                                }}>
                                <div style={{ fontSize: 14, fontWeight: 700, color: role === r.key ? "#0071e3" : "#1d1d1f", letterSpacing: "-0.01em" }}>{r.label}</div>
                                <div style={{ fontSize: 11, color: "#86868b", marginTop: 2 }}>{r.desc}</div>
                            </button>
                        ))}
                    </div>

                    {error && (
                        <div style={{
                            padding: "12px 16px", borderRadius: 14, marginBottom: 20,
                            background: "rgba(255,59,48,0.06)", border: "1px solid rgba(255,59,48,0.12)",
                            color: "#d70015", fontSize: 14, fontWeight: 500,
                            display: "flex", alignItems: "center", gap: 8, animation: "slideUp 0.2s ease",
                        }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" /></svg>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input className="form-input" type="email" placeholder="you@example.com"
                                value={email} onChange={(e) => setEmail(e.target.value)} required id="login-email" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <div style={{ position: "relative" }}>
                                <input className="form-input" type={showPassword ? "text" : "password"}
                                    placeholder="Enter password" value={password}
                                    onChange={(e) => setPassword(e.target.value)} required id="login-password"
                                    style={{ paddingRight: 44 }} />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 4, color: "#86868b", display: "flex" }}>
                                    {showPassword ? (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" /></svg>
                                    ) : (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" /></svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, marginTop: -4 }}>
                            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14, color: "#6e6e73" }}>
                                <input type="checkbox" style={{ width: 16, height: 16, accentColor: "#0071e3" }} />
                                Remember me
                            </label>
                            <button type="button" style={{ background: "none", border: "none", color: "#0071e3", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
                                Forgot password?
                            </button>
                        </div>

                        <button type="submit" disabled={loading} className="btn btn-primary" id="login-submit"
                            style={{ width: "100%", padding: "14px", fontSize: 16, fontWeight: 600, letterSpacing: "-0.01em" }}>
                            {loading ? (
                                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <span style={{ width: 18, height: 18, border: "2.5px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
                                    Signing in...
                                </span>
                            ) : "Sign In →"}
                        </button>
                    </form>

                    {/* Demo hint */}
                    <div style={{ textAlign: "center", marginTop: 24, position: "relative" }}>
                        <button type="button" onClick={() => setShowDemoHint(!showDemoHint)}
                            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#86868b", display: "inline-flex", alignItems: "center", gap: 4 }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" /></svg>
                            Demo credentials
                        </button>
                        {showDemoHint && (
                            <div style={{
                                position: "absolute", left: "50%", transform: "translateX(-50%)",
                                top: "100%", marginTop: 8,
                                background: "#1d1d1f", color: "white", borderRadius: 16,
                                padding: "16px 22px", fontSize: 13, lineHeight: 1.8,
                                boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
                                whiteSpace: "nowrap", zIndex: 10, animation: "slideUp 0.2s ease",
                            }}>
                                <div style={{ position: "absolute", top: -6, left: "50%", transform: "translateX(-50%) rotate(45deg)", width: 12, height: 12, background: "#1d1d1f" }} />
                                <div style={{ fontSize: 11, fontWeight: 600, color: "#86868b", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Demo Access</div>
                                <div>Email: <code style={{ color: "#5ac8fa" }}>admin@spms.com</code></div>
                                <div>Password: <code style={{ color: "#5ac8fa" }}>admin123</code></div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
                @media (max-width: 900px) {
                    div:first-child > div:first-child { display: none !important; }
                    div:first-child > div:last-child { width: 100% !important; min-width: unset !important; }
                }
            `}</style>
        </div>
    );
}

export default function LoginPage() {
    return (
        <AuthProvider>
            <LoginForm />
        </AuthProvider>
    );
}
