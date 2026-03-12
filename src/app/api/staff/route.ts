import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { successResponse, errorResponse, validationErrorResponse, unauthorizedResponse, forbiddenResponse } from "@/lib/response";

export async function GET(req: NextRequest) {
    try {
        const user = getUserFromRequest(req);
        if (!user) return unauthorizedResponse();

        const staffList = await prisma.staff.findMany({
            orderBy: { created: "desc" },
            select: { staffid: true, staffname: true, phone: true, email: true, description: true, created: true, modified: true },
        });
        return successResponse(staffList);
    } catch (error) {
        console.error("Get staff error:", error);
        return errorResponse("Internal server error");
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = getUserFromRequest(req);
        if (!user) return unauthorizedResponse();
        if (user.role !== "admin") return forbiddenResponse();

        const body = await req.json();
        const { staffname, email, password, phone, description } = body;

        if (!staffname || !email || !password) {
            return validationErrorResponse("Staff name, email, and password are required");
        }

        const { hashPassword } = await import("@/lib/auth");
        const hashedPassword = await hashPassword(password);

        const staff = await prisma.staff.create({
            data: { staffname, email, password: hashedPassword, phone: phone || null, description: description || null },
        });

        return successResponse(
            { staffid: staff.staffid, staffname: staff.staffname, email: staff.email, phone: staff.phone },
            "Staff created", 201
        );
    } catch (error) {
        console.error("Create staff error:", error);
        return errorResponse("Internal server error");
    }
}
