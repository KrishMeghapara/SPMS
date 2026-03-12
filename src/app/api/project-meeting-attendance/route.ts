import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { successResponse, errorResponse, validationErrorResponse, unauthorizedResponse } from "@/lib/response";

export async function GET(req: NextRequest) {
    try {
        const user = getUserFromRequest(req);
        if (!user) return unauthorizedResponse();

        const { searchParams } = new URL(req.url);
        const meetingId = searchParams.get("meetingId");

        if (!meetingId) return validationErrorResponse("meetingId query param is required");

        const attendance = await prisma.projectmeetingattendance.findMany({
            where: { projectmeetingid: parseInt(meetingId) },
            include: { student: { select: { studentid: true, studentname: true, email: true } } },
        });
        return successResponse(attendance);
    } catch (error) {
        console.error("Get attendance error:", error);
        return errorResponse("Internal server error");
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = getUserFromRequest(req);
        if (!user) return unauthorizedResponse();

        const body = await req.json();
        const { projectmeetingid, studentid, ispresent, attendanceremarks, description } = body;

        if (!projectmeetingid || !studentid) {
            return validationErrorResponse("Meeting ID and student ID are required");
        }

        const attendance = await prisma.projectmeetingattendance.create({
            data: {
                projectmeetingid: parseInt(projectmeetingid),
                studentid: parseInt(studentid),
                ispresent: ispresent ?? false,
                attendanceremarks: attendanceremarks || null,
                description: description || null,
            },
        });

        return successResponse(attendance, "Attendance marked", 201);
    } catch (error) {
        console.error("Mark attendance error:", error);
        return errorResponse("Internal server error");
    }
}
