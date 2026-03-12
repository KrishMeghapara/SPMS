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

        if (!groupId) return validationErrorResponse("groupId query param is required");

        const members = await prisma.projectgroupmember.findMany({
            where: { projectgroupid: parseInt(groupId) },
            include: { student: { select: { studentid: true, studentname: true, email: true, phone: true } } },
            orderBy: { isgroupleader: "desc" },
        });
        return successResponse(members);
    } catch (error) {
        console.error("Get group members error:", error);
        return errorResponse("Internal server error");
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = getUserFromRequest(req);
        if (!user) return unauthorizedResponse();

        const body = await req.json();
        const { projectgroupid, studentid, isgroupleader, studentcgpa, description } = body;

        if (!projectgroupid || !studentid) {
            return validationErrorResponse("Project group ID and student ID are required");
        }

        const existing = await prisma.projectgroupmember.findFirst({
            where: { projectgroupid: parseInt(projectgroupid), studentid: parseInt(studentid) },
        });
        if (existing) return errorResponse("Student is already in this group", 409);

        const member = await prisma.projectgroupmember.create({
            data: {
                projectgroupid: parseInt(projectgroupid),
                studentid: parseInt(studentid),
                isgroupleader: isgroupleader || false,
                studentcgpa: studentcgpa || null,
                description: description || null,
            },
        });

        return successResponse(member, "Member added to group", 201);
    } catch (error) {
        console.error("Add group member error:", error);
        return errorResponse("Internal server error");
    }
}
