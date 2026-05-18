"use client";

import { useEffect, useState, useCallback } from "react";
import { useApi } from "@/context/AuthContext";

interface Meeting {
    projectmeetingid: number;
    meetingdatetime: string;
    meetingpurpose: string | null;
    meetinglocation: string | null;
    meetingstatus: string | null;
    meetingnotes: string | null;
    projectGroup?: { projectgroupid: number; projectgroupname: string; projecttitle: string | null };
    guideStaff?: { staffname: string } | null;
    attendances: { projectmeetingattendanceid: number; ispresent: boolean | null; student?: { studentname: string } | null }[];
}

export default function CalendarPage() {
    const { apiFetch } = useApi();
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<"month" | "week">("month");
    const [toast, setToast] = useState<{ message: string; type: string } | null>(null);

    const showToast = (message: string, type = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchMeetings = useCallback(async () => {
        try {
            const data = await apiFetch("/api/project-meetings");
            setMeetings(data);
        } catch (err) { showToast(err instanceof Error ? err.message : "Failed to load calendar", "error"); }
        finally { setLoading(false); }
    }, [apiFetch]);

    useEffect(() => { fetchMeetings(); }, [fetchMeetings]);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    const isToday = (d: number) => d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

    const getMeetingsForDate = (dateStr: string) =>
        meetings.filter(m => m.meetingdatetime.startsWith(dateStr));

    const dateKey = (d: number) => `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

    const statusColors: Record<string, string> = {
        Scheduled: "#0071e3",
        Completed: "#30d158",
        Cancelled: "#ff3b30",
    };

    const navigate = (dir: number) => {
        const d = new Date(currentDate);
        if (viewMode === "month") d.setMonth(d.getMonth() + dir);
        else d.setDate(d.getDate() + dir * 7);
        setCurrentDate(d);
    };

    // Week view helpers
    const getWeekDates = () => {
        const start = new Date(currentDate);
        start.setDate(start.getDate() - start.getDay());
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(start);
            d.setDate(d.getDate() + i);
            return d;
        });
    };

    const selectedMeetings = selectedDate ? getMeetingsForDate(selectedDate) : [];

    const calendarDays = [];
    for (let i = 0; i < firstDay; i++) calendarDays.push(null);
    for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);

    return (
        <div className="page-enter">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Calendar</h1>
                    <p className="page-subtitle">Visual meeting schedule</p>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <div style={{
                        display: "flex", background: "#f0f0f5", borderRadius: 980, padding: 3,
                    }}>
                        {(["month", "week"] as const).map(v => (
                            <button key={v} onClick={() => setViewMode(v)} style={{
                                padding: "6px 16px", borderRadius: 980, border: "none",
                                background: viewMode === v ? "white" : "transparent",
                                color: viewMode === v ? "#1d1d1f" : "#86868b",
                                fontSize: 13, fontWeight: 600, cursor: "pointer",
                                boxShadow: viewMode === v ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                                transition: "all 0.2s", textTransform: "capitalize",
                            }}>{v}</button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Month/Week navigator */}
            <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                marginBottom: 20, background: "white", borderRadius: 16, padding: "14px 20px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            }}>
                <button onClick={() => navigate(-1)} style={{
                    background: "none", border: "none", cursor: "pointer", padding: 8,
                    borderRadius: 8, color: "#6e6e73", display: "flex",
                }}
                    onMouseEnter={e => e.currentTarget.style.background = "#f5f5f7"}
                    onMouseLeave={e => e.currentTarget.style.background = "none"}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" /></svg>
                </button>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1d1d1f", letterSpacing: "-0.02em" }}>
                    {viewMode === "month"
                        ? currentDate.toLocaleString("default", { month: "long", year: "numeric" })
                        : `Week of ${getWeekDates()[0].toLocaleDateString("default", { month: "short", day: "numeric" })}`
                    }
                </h2>
                <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => { setCurrentDate(new Date()); setSelectedDate(dateKey(today.getDate())); }} style={{
                        padding: "6px 14px", borderRadius: 980, border: "1px solid rgba(0,0,0,0.1)",
                        background: "white", fontSize: 13, fontWeight: 600, color: "#0071e3",
                        cursor: "pointer",
                    }}>Today</button>
                    <button onClick={() => navigate(1)} style={{
                        background: "none", border: "none", cursor: "pointer", padding: 8,
                        borderRadius: 8, color: "#6e6e73", display: "flex",
                    }}
                        onMouseEnter={e => e.currentTarget.style.background = "#f5f5f7"}
                        onMouseLeave={e => e.currentTarget.style.background = "none"}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" /></svg>
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="skeleton" style={{ height: 400, borderRadius: 24 }} />
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: selectedDate ? "1fr 360px" : "1fr", gap: 16 }}>
                    {/* Calendar Grid */}
                    <div style={{
                        background: "white", borderRadius: 24, padding: 24,
                        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                    }}>
                        {viewMode === "month" ? (
                            <>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 0, marginBottom: 8 }}>
                                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                                        <div key={d} style={{
                                            textAlign: "center", fontSize: 12, fontWeight: 600,
                                            color: "#86868b", padding: "8px 0",
                                        }}>{d}</div>
                                    ))}
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
                                    {calendarDays.map((day, i) => {
                                        if (day === null) return <div key={`e${i}`} />;
                                        const dk = dateKey(day);
                                        const dayMeetings = getMeetingsForDate(dk);
                                        const isSelected = dk === selectedDate;
                                        return (
                                            <button key={dk} onClick={() => setSelectedDate(isSelected ? null : dk)}
                                                style={{
                                                    padding: "8px 4px", minHeight: 72,
                                                    background: isSelected ? "#0071e308" : "transparent",
                                                    border: isSelected ? "2px solid #0071e3" : "2px solid transparent",
                                                    borderRadius: 14, cursor: "pointer",
                                                    display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                                                    transition: "all 0.15s",
                                                }}
                                                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = "#f5f5f7"; }}
                                                onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
                                            >
                                                <span style={{
                                                    width: 28, height: 28, borderRadius: "50%",
                                                    display: "flex", alignItems: "center", justifyContent: "center",
                                                    fontSize: 13, fontWeight: isToday(day) ? 700 : 500,
                                                    background: isToday(day) ? "#0071e3" : "transparent",
                                                    color: isToday(day) ? "white" : "#1d1d1f",
                                                }}>{day}</span>
                                                {dayMeetings.length > 0 && (
                                                    <div style={{ display: "flex", gap: 3, flexWrap: "wrap", justifyContent: "center" }}>
                                                        {dayMeetings.slice(0, 3).map((m, j) => (
                                                            <div key={j} style={{
                                                                width: 6, height: 6, borderRadius: "50%",
                                                                background: statusColors[m.meetingstatus || ""] || "#86868b",
                                                            }} />
                                                        ))}
                                                        {dayMeetings.length > 3 && (
                                                            <span style={{ fontSize: 9, color: "#86868b", fontWeight: 600 }}>+{dayMeetings.length - 3}</span>
                                                        )}
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </>
                        ) : (
                            /* Week View */
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }}>
                                {getWeekDates().map(wd => {
                                    const dk = `${wd.getFullYear()}-${String(wd.getMonth() + 1).padStart(2, "0")}-${String(wd.getDate()).padStart(2, "0")}`;
                                    const dayMeetings = getMeetingsForDate(dk);
                                    const isSelected = dk === selectedDate;
                                    const isTodayDate = wd.toDateString() === today.toDateString();
                                    return (
                                        <div key={dk}
                                            onClick={() => setSelectedDate(isSelected ? null : dk)}
                                            style={{
                                                padding: 12, borderRadius: 16, minHeight: 200,
                                                background: isSelected ? "#0071e308" : "#f9f9f9",
                                                border: isSelected ? "2px solid #0071e3" : "2px solid transparent",
                                                cursor: "pointer", transition: "all 0.15s",
                                            }}
                                        >
                                            <div style={{ textAlign: "center", marginBottom: 10 }}>
                                                <div style={{ fontSize: 11, fontWeight: 600, color: "#86868b", textTransform: "uppercase" }}>
                                                    {wd.toLocaleString("default", { weekday: "short" })}
                                                </div>
                                                <div style={{
                                                    fontSize: 20, fontWeight: 700,
                                                    color: isTodayDate ? "#0071e3" : "#1d1d1f",
                                                }}>{wd.getDate()}</div>
                                            </div>
                                            {dayMeetings.map((m, j) => (
                                                <div key={j} style={{
                                                    padding: "6px 8px", borderRadius: 8, marginBottom: 4,
                                                    background: `${statusColors[m.meetingstatus || ""] || "#86868b"}15`,
                                                    borderLeft: `3px solid ${statusColors[m.meetingstatus || ""] || "#86868b"}`,
                                                    fontSize: 11, color: "#1d1d1f", fontWeight: 500,
                                                }}>
                                                    {new Date(m.meetingdatetime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                    <div style={{ fontSize: 10, color: "#86868b", marginTop: 2 }}>
                                                        {m.projectGroup?.projectgroupname?.slice(0, 12) || "Meeting"}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Legend */}
                        <div style={{ display: "flex", gap: 20, justifyContent: "center", marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(0,0,0,0.04)" }}>
                            {Object.entries(statusColors).map(([k, v]) => (
                                <div key={k} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: v }} />
                                    <span style={{ fontSize: 12, color: "#86868b" }}>{k}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Side Panel */}
                    {selectedDate && (
                        <div style={{
                            background: "white", borderRadius: 24, padding: 24,
                            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                            animation: "slideUp 0.2s ease",
                        }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                                <div>
                                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1d1d1f", letterSpacing: "-0.02em" }}>
                                        {new Date(selectedDate + "T00:00:00").toLocaleDateString("default", { weekday: "long", month: "long", day: "numeric" })}
                                    </h3>
                                    <p style={{ fontSize: 13, color: "#86868b", marginTop: 2 }}>
                                        {selectedMeetings.length} meeting{selectedMeetings.length !== 1 ? "s" : ""}
                                    </p>
                                </div>
                                <button onClick={() => setSelectedDate(null)} style={{
                                    background: "#f5f5f7", border: "none", borderRadius: 8,
                                    padding: 6, cursor: "pointer", color: "#86868b", display: "flex",
                                }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>
                                </button>
                            </div>

                            {selectedMeetings.length === 0 ? (
                                <div style={{ textAlign: "center", padding: "32px 0", color: "#86868b" }}>
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="#d1d1d6" style={{ marginBottom: 8 }}><path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z" /></svg>
                                    <p style={{ fontSize: 13 }}>No meetings on this day</p>
                                </div>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                    {selectedMeetings.map(m => {
                                        const color = statusColors[m.meetingstatus || ""] || "#86868b";
                                        return (
                                            <div key={m.projectmeetingid} style={{
                                                padding: 16, borderRadius: 14,
                                                background: "#f9f9f9", borderLeft: `4px solid ${color}`,
                                            }}>
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                                                    <h4 style={{ fontSize: 14, fontWeight: 700, color: "#1d1d1f" }}>
                                                        {m.projectGroup?.projectgroupname || "Meeting"}
                                                    </h4>
                                                    <span style={{
                                                        padding: "2px 8px", borderRadius: 980,
                                                        background: `${color}15`, color,
                                                        fontSize: 11, fontWeight: 600,
                                                    }}>{m.meetingstatus}</span>
                                                </div>
                                                <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13, color: "#6e6e73" }}>
                                                    <span>⏰ {new Date(m.meetingdatetime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                                                    {m.meetingpurpose && <span>📋 {m.meetingpurpose}</span>}
                                                    {m.meetinglocation && <span>📍 {m.meetinglocation}</span>}
                                                    {m.guideStaff && <span>👤 {m.guideStaff.staffname}</span>}
                                                    <span>👥 {m.attendances.length} attendees</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {toast && <div className={`toast toast-${toast.type}`}>{toast.message}</div>}
        </div>
    );
}
