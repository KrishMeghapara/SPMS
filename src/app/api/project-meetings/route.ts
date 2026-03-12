import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { successResponse, errorResponse, validationErrorResponse, unauthorizedResponse } from "@/lib/response";

export async function GET(req: NextRequest) {
    try {
        const user = getUserFromRequest(req);
        if (!user) return unauthorizedResponse();

        const { searchParams } = new URL(req.url);
        const groupId = searchParams.get("groupId");

        const where: Record<string, unknown> = {};
        if (groupId) where.projectgroupid = parseInt(groupId);
        if (user.role === "staff") where.guidestaffid = user.id;

        const meetings = await prisma.projectmeeting.findMany({
            where,
            orderBy: { meetingdatetime: "desc" },
            include: {
                projectGroup: { select: { projectgroupid: true, projectgroupname: true, projecttitle: true } },
                guideStaff: { select: { staffid: true, staffname: true } },
                attendances: { include: { student: { select: { studentid: true, studentname: true } } } },
            },
        });
        return successResponse(meetings);
    } catch (error) {
        console.error("Get meetings error:", error);
        return errorResponse("Internal server error");
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = getUserFromRequest(req);
        if (!user) return unauthorizedResponse();

        const body = await req.json();
        const { projectgroupid, guidestaffid, meetingdatetime, meetingpurpose, meetinglocation, description } = body;

        if (!projectgroupid || !meetingdatetime) {
            return validationErrorResponse("Project group ID and meeting datetime are required");
        }

        const meeting = await prisma.projectmeeting.create({
            data: {
                projectgroupid: parseInt(projectgroupid),
                guidestaffid: guidestaffid ? parseInt(guidestaffid) : (user.role === "staff" ? user.id : null),
                meetingdatetime: new Date(meetingdatetime),
                meetingpurpose: meetingpurpose || null,
                meetinglocation: meetinglocation || null,
                meetingstatus: "Scheduled",
                description: description || null,
            },
        });

        return successResponse(meeting, "Meeting scheduled", 201);
    } catch (error) {
        console.error("Create meeting error:", error);
        return errorResponse("Internal server error");
    }
}
