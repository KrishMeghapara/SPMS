import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { successResponse, errorResponse, notFoundResponse, unauthorizedResponse, forbiddenResponse } from "@/lib/response";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = getUserFromRequest(req);
        if (!user) return unauthorizedResponse();

        const { id } = await params;
        const type = await prisma.projecttype.findUnique({ where: { projecttypeid: parseInt(id) } });
        if (!type) return notFoundResponse("Project type not found");
        return successResponse(type);
    } catch (error) {
        console.error("Get project type error:", error);
        return errorResponse("Internal server error");
    }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = getUserFromRequest(req);
        if (!user) return unauthorizedResponse();
        if (user.role !== "admin") return forbiddenResponse();

        const { id } = await params;
        const body = await req.json();

        const type = await prisma.projecttype.update({
            where: { projecttypeid: parseInt(id) },
            data: {
                projecttypename: body.projecttypename || undefined,
                description: body.description !== undefined ? body.description : undefined,
                modified: new Date(),
            },
        });
        return successResponse(type, "Project type updated");
    } catch (error) {
        console.error("Update project type error:", error);
        return errorResponse("Internal server error");
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = getUserFromRequest(req);
        if (!user) return unauthorizedResponse();
        if (user.role !== "admin") return forbiddenResponse();

        const { id } = await params;
        await prisma.projecttype.delete({ where: { projecttypeid: parseInt(id) } });
        return successResponse(null, "Project type deleted");
    } catch (error) {
        console.error("Delete project type error:", error);
        return errorResponse("Internal server error");
    }
}
