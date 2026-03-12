import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from "@/lib/response";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = getUserFromRequest(req);
        if (!user) return unauthorizedResponse();
        if (user.role !== "admin") return forbiddenResponse();

        const { id } = await params;
        const group = await prisma.projectgroup.update({
            where: { projectgroupid: parseInt(id) },
            data: { status: "Approved", modified: new Date() },
        });
        return successResponse(group, "Project group approved");
    } catch (error) {
        console.error("Approve group error:", error);
        return errorResponse("Internal server error");
    }
}
