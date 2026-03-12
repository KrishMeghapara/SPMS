import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword, generateToken, JWTPayload } from "@/lib/auth";
import { successResponse, errorResponse, validationErrorResponse } from "@/lib/response";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, password, role } = body;

        if (!email || !password || !role) {
            return validationErrorResponse("Email, password and role are required");
        }

        // Admin login
        if (role === "admin") {
            if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
                const token = generateToken({
                    id: 0,
                    email,
                    role: "admin",
                    name: "Administrator",
                });
                return successResponse({ token, user: { id: 0, email, role: "admin", name: "Administrator" } }, "Login successful");
            }
            return errorResponse("Invalid admin credentials", 401);
        }

        // Staff login
        if (role === "staff") {
            const staff = await prisma.staff.findFirst({ where: { email } });
            if (!staff) return errorResponse("Staff not found", 404);

            const isValid = await verifyPassword(password, staff.password);
            if (!isValid) return errorResponse("Invalid credentials", 401);

            const payload: JWTPayload = {
                id: staff.staffid,
                email: staff.email || "",
                role: "staff",
                name: staff.staffname,
            };
            const token = generateToken(payload);
            return successResponse({ token, user: payload }, "Login successful");
        }

        // Student login
        if (role === "student") {
            const student = await prisma.student.findFirst({ where: { email } });
            if (!student) return errorResponse("Student not found", 404);
            if (!student.password) return errorResponse("Password not set. Contact admin.", 401);

            const isValid = await verifyPassword(password, student.password);
            if (!isValid) return errorResponse("Invalid credentials", 401);

            const payload: JWTPayload = {
                id: student.studentid,
                email: student.email || "",
                role: "student",
                name: student.studentname,
            };
            const token = generateToken(payload);
            return successResponse({ token, user: payload }, "Login successful");
        }

        return validationErrorResponse("Invalid role. Must be admin, staff, or student");
    } catch (error) {
        console.error("Login error:", error);
        return errorResponse("Internal server error");
    }
}
