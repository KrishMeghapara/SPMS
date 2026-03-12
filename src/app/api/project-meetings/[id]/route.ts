import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { successResponse, errorResponse, notFoundResponse, unauthorizedResponse } from "@/lib/response";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = getUserFromRequest(req);
        if (!user) return unauthorizedResponse();

        const { id } = await params;
        const meeting = await prisma.projectmeeting.findUnique({
            where: { projectmeetingid: parseInt(id) },
            include: {
                projectGroup: { select: { projectgroupid: true, projectgroupname: true, projecttitle: true } },
                guideStaff: { select: { staffid: true, staffname: true } },
                attendances: { include: { student: { select: { studentid: true, studentname: true } } } },
            },
        });
        if (!meeting) return notFoundResponse("Meeting not found");
        return successResponse(meeting);
    } catch (error) {
        console.error("Get meeting error:", error);
        return errorResponse("Internal server error");
    }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = getUserFromRequest(req);
        if (!user) return unauthorizedResponse();

        const { id } = await params;
        const body = await req.json();

        const updateData: Record<string, unknown> = { modified: new Date() };
        if (body.meetingdatetime) updateData.meetingdatetime = new Date(body.meetingdatetime);
        if (body.meetingpurpose !== undefined) updateData.meetingpurpose = body.meetingpurpose;
        if (body.meetinglocation !== undefined) updateData.meetinglocation = body.meetinglocation;
        if (body.meetingnotes !== undefined) updateData.meetingnotes = body.meetingnotes;
        if (body.meetingstatus !== undefined) {
            updateData.meetingstatus = body.meetingstatus;
            updateData.meetingstatusdatetime = new Date();
            if (body.meetingstatusdescription) updateData.meetingstatusdescription = body.meetingstatusdescription;
        }
        if (body.description !== undefined) updateData.description = body.description;

        const meeting = await prisma.projectmeeting.update({
            where: { projectmeetingid: parseInt(id) },
            data: updateData,
        });
        return successResponse(meeting, "Meeting updated");
    } catch (error) {
        console.error("Update meeting error:", error);
        return errorResponse("Internal server error");
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = getUserFromRequest(req);
        if (!user) return unauthorizedResponse();

        const { id } = await params;
        await prisma.projectmeetingattendance.deleteMany({ where: { projectmeetingid: parseInt(id) } });
        await prisma.projectmeeting.delete({ where: { projectmeetingid: parseInt(id) } });
        return successResponse(null, "Meeting deleted");
    } catch (error) {
        console.error("Delete meeting error:", error);
        return errorResponse("Internal server error");
    }
}
