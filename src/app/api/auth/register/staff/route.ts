import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, getUserFromRequest } from "@/lib/auth";
import { successResponse, errorResponse, validationErrorResponse, unauthorizedResponse, forbiddenResponse } from "@/lib/response";

export async function POST(req: NextRequest) {
    try {
        const user = getUserFromRequest(req);
        if (!user) return unauthorizedResponse();
        if (user.role !== "admin") return forbiddenResponse("Only admins can register staff");

        const body = await req.json();
        const { staffname, email, password, phone, description } = body;

        if (!staffname || !email || !password) {
            return validationErrorResponse("Staff name, email, and password are required");
        }

        const existing = await prisma.staff.findFirst({ where: { email } });
        if (existing) return errorResponse("Staff with this email already exists", 409);

        const hashedPassword = await hashPassword(password);

        const staff = await prisma.staff.create({
            data: {
                staffname,
                email,
                password: hashedPassword,
                phone: phone || null,
                description: description || null,
            },
        });

        return successResponse(
            { staffid: staff.staffid, staffname: staff.staffname, email: staff.email },
            "Staff registered successfully",
            201
        );
    } catch (error) {
        console.error("Register staff error:", error);
        return errorResponse("Internal server error");
    }
}
