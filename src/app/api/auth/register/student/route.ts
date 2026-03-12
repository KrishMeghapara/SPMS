import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, getUserFromRequest } from "@/lib/auth";
import { successResponse, errorResponse, validationErrorResponse, unauthorizedResponse, forbiddenResponse } from "@/lib/response";

export async function POST(req: NextRequest) {
    try {
        const user = getUserFromRequest(req);
        if (!user) return unauthorizedResponse();
        if (user.role !== "admin") return forbiddenResponse("Only admins can register students");

        const body = await req.json();
        const { studentname, email, password, phone, description } = body;

        if (!studentname || !email || !password) {
            return validationErrorResponse("Student name, email, and password are required");
        }

        const existing = await prisma.student.findFirst({ where: { email } });
        if (existing) return errorResponse("Student with this email already exists", 409);

        const hashedPassword = await hashPassword(password);

        const student = await prisma.student.create({
            data: {
                studentname, email, password: hashedPassword,
                phone: phone || null, description: description || null,
            },
        });

        return successResponse(
            { studentid: student.studentid, studentname: student.studentname, email: student.email },
            "Student registered successfully", 201
        );
    } catch (error) {
        console.error("Register student error:", error);
        return errorResponse("Internal server error");
    }
}
