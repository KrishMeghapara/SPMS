import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse } from "@/lib/response";

export async function GET(req: NextRequest) {
    try {
        const user = getUserFromRequest(req);
        if (!user) return unauthorizedResponse();

        const totalProjects = await prisma.projectgroup.count();
        const totalStudents = await prisma.student.count();
        const totalStaff = await prisma.staff.count();
        const totalMeetings = await prisma.projectmeeting.count();
        const projectTypes = await prisma.projecttype.count();

        const pendingProjects = await prisma.projectgroup.count({ where: { status: "Pending" } });
        const approvedProjects = await prisma.projectgroup.count({ where: { status: "Approved" } });

        const upcomingMeetings = await prisma.projectmeeting.count({
            where: { meetingstatus: "Scheduled", meetingdatetime: { gte: new Date() } },
        });

        const recentProjects = await prisma.projectgroup.findMany({
            take: 5,
            orderBy: { created: "desc" },
            include: {
                projectType: true,
                members: { include: { student: { select: { studentname: true } } } },
            },
        });

        const recentMeetings = await prisma.projectmeeting.findMany({
            take: 5,
            orderBy: { meetingdatetime: "desc" },
            include: {
                projectGroup: { select: { projectgroupname: true, projecttitle: true } },
                guideStaff: { select: { staffname: true } },
            },
        });

        return successResponse({
            stats: { totalProjects, totalStudents, totalStaff, totalMeetings, projectTypes, pendingProjects, approvedProjects, upcomingMeetings },
            recentProjects,
            recentMeetings,
        });
    } catch (error) {
        console.error("Dashboard stats error:", error);
        return errorResponse("Internal server error");
    }
}
