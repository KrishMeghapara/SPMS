import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { successResponse, errorResponse, validationErrorResponse, unauthorizedResponse, forbiddenResponse } from "@/lib/response";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = getUserFromRequest(req);
        if (!user) return unauthorizedResponse();
        if (user.role !== "admin") return forbiddenResponse();

        const { id } = await params;
        const body = await req.json();
        const { guidestaffname, convenerstaffid, expertstaffid } = body;

        if (!guidestaffname) return validationErrorResponse("Guide staff name is required");

        const updateData: Record<string, unknown> = { guidestaffname, modified: new Date() };
        if (convenerstaffid) updateData.convenerstaffid = parseInt(convenerstaffid);
        if (expertstaffid) updateData.expertstaffid = parseInt(expertstaffid);

        const group = await prisma.projectgroup.update({
            where: { projectgroupid: parseInt(id) },
            data: updateData,
        });
        return successResponse(group, "Guide assigned successfully");
    } catch (error) {
        console.error("Assign guide error:", error);
        return errorResponse("Internal server error");
    }
}
