import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse } from "@/lib/response";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = getUserFromRequest(req);
        if (!user) return unauthorizedResponse();

        const { id } = await params;
        const body = await req.json();

        const updateData: Record<string, unknown> = { modified: new Date() };
        if (body.ispresent !== undefined) updateData.ispresent = body.ispresent;
        if (body.attendanceremarks !== undefined) updateData.attendanceremarks = body.attendanceremarks;
        if (body.description !== undefined) updateData.description = body.description;

        const attendance = await prisma.projectmeetingattendance.update({
            where: { projectmeetingattendanceid: parseInt(id) },
            data: updateData,
        });
        return successResponse(attendance, "Attendance updated");
    } catch (error) {
        console.error("Update attendance error:", error);
        return errorResponse("Internal server error");
    }
}
