import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { successResponse, errorResponse, validationErrorResponse, unauthorizedResponse, forbiddenResponse } from "@/lib/response";

export async function GET(req: NextRequest) {
    try {
        const user = getUserFromRequest(req);
        if (!user) return unauthorizedResponse();

        const types = await prisma.projecttype.findMany({ orderBy: { created: "desc" } });
        return successResponse(types);
    } catch (error) {
        console.error("Get project types error:", error);
        return errorResponse("Internal server error");
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = getUserFromRequest(req);
        if (!user) return unauthorizedResponse();
        if (user.role !== "admin") return forbiddenResponse();

        const body = await req.json();
        const { projecttypename, description } = body;

        if (!projecttypename) {
            return validationErrorResponse("Project type name is required");
        }

        const type = await prisma.projecttype.create({
            data: { projecttypename, description: description || null },
        });

        return successResponse(type, "Project type created", 201);
    } catch (error) {
        console.error("Create project type error:", error);
        return errorResponse("Internal server error");
    }
}
