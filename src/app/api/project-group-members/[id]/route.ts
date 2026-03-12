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
        if (body.isgroupleader !== undefined) updateData.isgroupleader = body.isgroupleader;
        if (body.studentcgpa !== undefined) updateData.studentcgpa = body.studentcgpa;
        if (body.description !== undefined) updateData.description = body.description;

        const member = await prisma.projectgroupmember.update({
            where: { projectgroupmemberid: parseInt(id) },
            data: updateData,
        });
        return successResponse(member, "Member updated");
    } catch (error) {
        console.error("Update member error:", error);
        return errorResponse("Internal server error");
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = getUserFromRequest(req);
        if (!user) return unauthorizedResponse();

        const { id } = await params;
        await prisma.projectgroupmember.delete({ where: { projectgroupmemberid: parseInt(id) } });
        return successResponse(null, "Member removed from group");
    } catch (error) {
        console.error("Delete member error:", error);
        return errorResponse("Internal server error");
    }
}
