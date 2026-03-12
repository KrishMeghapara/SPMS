import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { successResponse, errorResponse, notFoundResponse, unauthorizedResponse, forbiddenResponse } from "@/lib/response";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = getUserFromRequest(req);
        if (!user) return unauthorizedResponse();

        const { id } = await params;
        const staff = await prisma.staff.findUnique({
            where: { staffid: parseInt(id) },
            select: { staffid: true, staffname: true, phone: true, email: true, description: true, created: true, modified: true },
        });
        if (!staff) return notFoundResponse("Staff not found");
        return successResponse(staff);
    } catch (error) {
        console.error("Get staff error:", error);
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

        const updateData: Record<string, unknown> = { modified: new Date() };
        if (body.staffname) updateData.staffname = body.staffname;
        if (body.phone !== undefined) updateData.phone = body.phone;
        if (body.email !== undefined) updateData.email = body.email;
        if (body.description !== undefined) updateData.description = body.description;
        if (body.password) {
            const { hashPassword } = await import("@/lib/auth");
            updateData.password = await hashPassword(body.password);
        }

        const staff = await prisma.staff.update({ where: { staffid: parseInt(id) }, data: updateData });
        return successResponse({ staffid: staff.staffid, staffname: staff.staffname, email: staff.email });
    } catch (error) {
        console.error("Update staff error:", error);
        return errorResponse("Internal server error");
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = getUserFromRequest(req);
        if (!user) return unauthorizedResponse();
        if (user.role !== "admin") return forbiddenResponse();

        const { id } = await params;
        await prisma.staff.delete({ where: { staffid: parseInt(id) } });
        return successResponse(null, "Staff deleted");
    } catch (error) {
        console.error("Delete staff error:", error);
        return errorResponse("Internal server error");
    }
}
