import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { successResponse, errorResponse, validationErrorResponse, unauthorizedResponse, forbiddenResponse } from "@/lib/response";

export async function GET(req: NextRequest) {
    try {
        const user = getUserFromRequest(req);
        if (!user) return unauthorizedResponse();
        if (user.role !== "admin") return forbiddenResponse();

        const students = await prisma.student.findMany({
            orderBy: { created: "desc" },
            select: {
                studentid: true,
                studentname: true,
                phone: true,
                email: true,
                description: true,
                created: true,
                modified: true,
            },
        });
        return successResponse(students);
    } catch (error) {
        console.error("Get students error:", error);
        return errorResponse("Internal server error");
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = getUserFromRequest(req);
        if (!user) return unauthorizedResponse();
        if (user.role !== "admin") return forbiddenResponse();

        const body = await req.json();
        const { studentname, email, password, phone, description } = body;

        if (!studentname || !email) {
            return validationErrorResponse("Student name and email are required");
        }

        const { hashPassword } = await import("@/lib/auth");
        const hashedPassword = password ? await hashPassword(password) : null;

        const student = await prisma.student.create({
            data: {
                studentname,
                email,
                password: hashedPassword,
                phone: phone || null,
                description: description || null,
            },
        });

        return successResponse(
            { studentid: student.studentid, studentname: student.studentname, email: student.email },
            "Student created",
            201
        );
    } catch (error) {
        console.error("Create student error:", error);
        return errorResponse("Internal server error");
    }
}
