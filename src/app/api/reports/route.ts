import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse } from "@/lib/response";

export async function GET(req: NextRequest) {
    try {
        const user = getUserFromRequest(req);
        if (!user) return unauthorizedResponse();

        const { searchParams } = new URL(req.url);
        const typeId = searchParams.get("typeId");
        const staffId = searchParams.get("staffId");

        const where: Record<string, unknown> = {};
        if (typeId) where.projecttypeid = parseInt(typeId);
        if (staffId) {
            where.OR = [
                { convenerstaffid: parseInt(staffId) },
                { expertstaffid: parseInt(staffId) },
            ];
        }

        const projects = await prisma.projectgroup.findMany({
            where,
            orderBy: { created: "desc" },
            include: {
                projectType: true,
                convenerStaff: { select: { staffid: true, staffname: true } },
                expertStaff: { select: { staffid: true, staffname: true } },
                members: {
                    include: {
                        student: { select: { studentid: true, studentname: true, email: true } },
                    },
                },
                meetings: {
                    select: { projectmeetingid: true, meetingdatetime: true, meetingstatus: true },
                    orderBy: { meetingdatetime: "desc" },
                },
            },
        });

        const stats = {
            totalProjects: projects.length,
            totalStudents: projects.reduce((acc, p) => acc + p.members.length, 0),
            totalMeetings: projects.reduce((acc, p) => acc + p.meetings.length, 0),
            byStatus: {
                pending: projects.filter(p => p.status === "Pending").length,
                approved: projects.filter(p => p.status === "Approved").length,
            },
        };

        return successResponse({ projects, stats });
    } catch (error) {
        console.error("Reports error:", error);
        return errorResponse("Internal server error");
    }
}
