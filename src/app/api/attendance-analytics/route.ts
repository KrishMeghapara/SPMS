import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse } from "@/lib/response";

export async function GET(req: NextRequest) {
    try {
        const user = getUserFromRequest(req);
        if (!user) return unauthorizedResponse();

        // Get all attendance records with related data
        const attendances = await prisma.projectmeetingattendance.findMany({
            include: {
                student: { select: { studentid: true, studentname: true, email: true } },
                projectMeeting: {
                    select: {
                        projectmeetingid: true,
                        meetingdatetime: true,
                        meetingstatus: true,
                        projectGroup: { select: { projectgroupid: true, projectgroupname: true } },
                    },
                },
            },
        });

        // Group by student
        const studentMap: Record<number, {
            studentid: number;
            studentname: string;
            email: string;
            total: number;
            present: number;
            absent: number;
            meetings: { date: string; present: boolean; group: string }[];
        }> = {};

        for (const a of attendances) {
            if (!a.student) continue;
            const sid = a.student.studentid;
            if (!studentMap[sid]) {
                studentMap[sid] = {
                    studentid: sid,
                    studentname: a.student.studentname,
                    email: a.student.email || "",
                    total: 0,
                    present: 0,
                    absent: 0,
                    meetings: [],
                };
            }
            studentMap[sid].total++;
            if (a.ispresent) studentMap[sid].present++;
            else studentMap[sid].absent++;
            studentMap[sid].meetings.push({
                date: a.projectMeeting?.meetingdatetime?.toISOString() || "",
                present: a.ispresent ?? false,
                group: a.projectMeeting?.projectGroup?.projectgroupname || "",
            });
        }

        const students = Object.values(studentMap).map(s => ({
            ...s,
            percentage: s.total > 0 ? Math.round((s.present / s.total) * 100) : 0,
        })).sort((a, b) => a.percentage - b.percentage);

        // Monthly trend 
        const monthlyMap: Record<string, { month: string; total: number; present: number }> = {};
        for (const a of attendances) {
            if (!a.projectMeeting?.meetingdatetime) continue;
            const d = new Date(a.projectMeeting.meetingdatetime);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
            if (!monthlyMap[key]) monthlyMap[key] = { month: key, total: 0, present: 0 };
            monthlyMap[key].total++;
            if (a.ispresent) monthlyMap[key].present++;
        }
        const monthly = Object.values(monthlyMap)
            .sort((a, b) => a.month.localeCompare(b.month))
            .map(m => ({ ...m, percentage: m.total > 0 ? Math.round((m.present / m.total) * 100) : 0 }));

        // Summary
        const totalRecords = attendances.length;
        const totalPresent = attendances.filter(a => a.ispresent).length;
        const overallPercentage = totalRecords > 0 ? Math.round((totalPresent / totalRecords) * 100) : 0;
        const lowAttendance = students.filter(s => s.percentage < 75).length;

        return successResponse({
            students,
            monthly,
            summary: {
                totalRecords,
                totalPresent,
                totalAbsent: totalRecords - totalPresent,
                overallPercentage,
                totalStudents: students.length,
                lowAttendance,
            },
        });
    } catch (error) {
        console.error("Attendance analytics error:", error);
        return errorResponse("Internal server error");
    }
}
