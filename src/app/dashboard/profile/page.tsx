"use client";

import { useEffect, useState, useCallback } from "react";
import { useApi, useAuth } from "@/context/AuthContext";

interface Profile {
    id: number;
    name: string;
    email: string;
    phone?: string;
    role: string;
    description?: string;
}

export default function ProfilePage() {
    const { apiFetch } = useApi();
    const { user } = useAuth();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({ name: "", phone: "", description: "" });
    const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
    const [showPwChange, setShowPwChange] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: string } | null>(null);
    const [saving, setSaving] = useState(false);

    const showToast = (message: string, type = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    };

    const fetchProfile = useCallback(async () => {
        try {
            const data = await apiFetch("/api/auth/profile");
            setProfile(data);
            setForm({ name: data.name, phone: data.phone || "", description: data.description || "" });
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }, [apiFetch]);

    useEffect(() => { fetchProfile(); }, [fetchProfile]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await apiFetch("/api/auth/profile", { method: "PUT", body: JSON.stringify(form) });
            showToast("Profile updated successfully");
            setEditing(false);
            fetchProfile();
            // Update local storage user name
            const saved = localStorage.getItem("spms_user");
            if (saved) {
                const u = JSON.parse(saved);
                u.name = form.name;
                localStorage.setItem("spms_user", JSON.stringify(u));
            }
        } catch (err) { showToast(err instanceof Error ? err.message : "Failed to update", "error"); }
        finally { setSaving(false); }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (pwForm.newPassword !== pwForm.confirmPassword) {
            showToast("Passwords do not match", "error");
            return;
        }
        if (pwForm.newPassword.length < 6) {
            showToast("Password must be at least 6 characters", "error");
            return;
        }
        setSaving(true);
        try {
            await apiFetch("/api/auth/profile", {
                method: "PATCH",
                body: JSON.stringify({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }),
            });
            showToast("Password changed successfully");
            setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
            setShowPwChange(false);
        } catch (err) { showToast(err instanceof Error ? err.message : "Failed to change password", "error"); }
        finally { setSaving(false); }
    };

    const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    const avatarHue = profile ? (profile.id * 67) % 360 : 200;

    if (loading) {
        return (
            <div className="page-enter" style={{ maxWidth: 700, margin: "0 auto" }}>
                <div className="skeleton" style={{ height: 200, borderRadius: 24, marginBottom: 16 }} />
                <div className="skeleton" style={{ height: 300, borderRadius: 24 }} />
            </div>
        );
    }

    if (!profile) return <div className="empty-state"><p>Unable to load profile</p></div>;

    return (
        <div className="page-enter" style={{ maxWidth: 700, margin: "0 auto" }}>
            {/* Profile Card */}
            <div style={{
                background: "white", borderRadius: 24, overflow: "hidden",
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)", marginBottom: 16,
            }}>
                {/* Banner */}
                <div style={{
                    height: 120,
                    background: `linear-gradient(135deg, hsl(${avatarHue}, 65%, 55%), hsl(${(avatarHue + 40) % 360}, 65%, 60%))`,
                    position: "relative",
                }} />

                {/* Avatar + Info */}
                <div style={{ padding: "0 32px 28px", marginTop: -48 }}>
                    <div style={{ display: "flex", alignItems: "flex-end", gap: 20, marginBottom: 20 }}>
                        <div style={{
                            width: 96, height: 96, borderRadius: 24, flexShrink: 0,
                            background: `linear-gradient(135deg, hsl(${avatarHue}, 65%, 50%), hsl(${(avatarHue + 40) % 360}, 65%, 55%))`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 32, fontWeight: 800, color: "white",
                            border: "4px solid white",
                            boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                        }}>
                            {getInitials(profile.name)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0, paddingBottom: 6 }}>
                            <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1d1d1f", letterSpacing: "-0.03em", marginBottom: 4 }}>
                                {profile.name}
                            </h1>
                            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                                <span style={{
                                    padding: "4px 12px", borderRadius: 980,
                                    background: "#0071e315", color: "#0071e3",
                                    fontSize: 12, fontWeight: 600, textTransform: "capitalize",
                                }}>{profile.role}</span>
                                <span style={{ fontSize: 13, color: "#86868b" }}>ID: #{profile.id}</span>
                            </div>
                        </div>
                    </div>

                    {/* Details */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="#86868b"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" /></svg>
                            <span style={{ fontSize: 14, color: "#1d1d1f" }}>{profile.email || "No email"}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="#86868b"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" /></svg>
                            <span style={{ fontSize: 14, color: "#1d1d1f" }}>{profile.phone || "No phone number"}</span>
                        </div>
                        {profile.description && (
                            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="#86868b" style={{ marginTop: 2, flexShrink: 0 }}><path d="M14 17H4v2h10v-2zm6-8H4v2h16V9zM4 15h16v-2H4v2zM4 5v2h16V5H4z" /></svg>
                                <span style={{ fontSize: 14, color: "#6e6e73", lineHeight: 1.5 }}>{profile.description}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Edit Profile Section */}
            {user?.role !== "admin" && (
                <div style={{
                    background: "white", borderRadius: 24, padding: 28,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.06)", marginBottom: 16,
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: editing ? 20 : 0 }}>
                        <div>
                            <h3 style={{ fontSize: 17, fontWeight: 700, color: "#1d1d1f", letterSpacing: "-0.02em" }}>Edit Profile</h3>
                            {!editing && <p style={{ fontSize: 13, color: "#86868b", marginTop: 4 }}>Update your personal information</p>}
                        </div>
                        {!editing && (
                            <button className="btn btn-secondary" onClick={() => setEditing(true)}
                                style={{ display: "flex", alignItems: "center", gap: 6 }}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" /></svg>
                                Edit
                            </button>
                        )}
                    </div>
                    {editing && (
                        <div>
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input className="form-input" value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your name" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Phone</label>
                                <input className="form-input" value={form.phone}
                                    onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 XXXXX XXXXX" />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Bio / Description</label>
                                <textarea className="form-textarea" value={form.description}
                                    onChange={e => setForm({ ...form, description: e.target.value })} placeholder="A short bio about yourself" />
                            </div>
                            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
                                <button className="btn btn-secondary" onClick={() => {
                                    setEditing(false);
                                    setForm({ name: profile.name, phone: profile.phone || "", description: profile.description || "" });
                                }}>Cancel</button>
                                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                                    {saving ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Change Password */}
            {user?.role !== "admin" && (
                <div style={{
                    background: "white", borderRadius: 24, padding: 28,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: showPwChange ? 20 : 0 }}>
                        <div>
                            <h3 style={{ fontSize: 17, fontWeight: 700, color: "#1d1d1f", letterSpacing: "-0.02em" }}>Security</h3>
                            {!showPwChange && <p style={{ fontSize: 13, color: "#86868b", marginTop: 4 }}>Change your account password</p>}
                        </div>
                        {!showPwChange && (
                            <button className="btn btn-secondary" onClick={() => setShowPwChange(true)}
                                style={{ display: "flex", alignItems: "center", gap: 6 }}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" /></svg>
                                Change Password
                            </button>
                        )}
                    </div>
                    {showPwChange && (
                        <form onSubmit={handlePasswordChange}>
                            <div className="form-group">
                                <label className="form-label">Current Password</label>
                                <input className="form-input" type="password" value={pwForm.currentPassword}
                                    onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                                    required placeholder="••••••••" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">New Password</label>
                                <input className="form-input" type="password" value={pwForm.newPassword}
                                    onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })}
                                    required placeholder="Minimum 6 characters" />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Confirm New Password</label>
                                <input className="form-input" type="password" value={pwForm.confirmPassword}
                                    onChange={e => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                                    required placeholder="Re-enter new password" />
                            </div>
                            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
                                <button type="button" className="btn btn-secondary" onClick={() => {
                                    setShowPwChange(false);
                                    setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
                                }}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? "Changing..." : "Update Password"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            )}

            {toast && <div className={`toast toast-${toast.type}`}>{toast.message}</div>}
        </div>
    );
}
