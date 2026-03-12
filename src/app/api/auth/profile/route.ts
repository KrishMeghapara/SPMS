import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse } from "@/lib/response";

export async function GET(req: NextRequest) {
    try {
        const user = getUserFromRequest(req);
        if (!user) return unauthorizedResponse();

        if (user.role === "admin") {
            return successResponse({ id: 0, name: "Administrator", email: user.email, role: "admin" });
        }

        if (user.role === "staff") {
            const staff = await prisma.staff.findUnique({ where: { staffid: user.id } });
            if (!staff) return errorResponse("Staff not found", 404);
            return successResponse({
                id: staff.staffid, name: staff.staffname, email: staff.email,
                phone: staff.phone, role: "staff", description: staff.description,
            });
        }

        if (user.role === "student") {
            const student = await prisma.student.findUnique({ where: { studentid: user.id } });
            if (!student) return errorResponse("Student not found", 404);
            return successResponse({
                id: student.studentid, name: student.studentname, email: student.email,
                phone: student.phone, role: "student", description: student.description,
            });
        }

        return errorResponse("Invalid role");
    } catch (error) {
        console.error("Profile error:", error);
        return errorResponse("Internal server error");
    }
}

export async function PUT(req: NextRequest) {
    try {
        const user = getUserFromRequest(req);
        if (!user) return unauthorizedResponse();

        const body = await req.json();

        if (user.role === "staff") {
            const updated = await prisma.staff.update({
                where: { staffid: user.id },
                data: {
                    staffname: body.name || undefined,
                    phone: body.phone || undefined,
                    description: body.description || undefined,
                    modified: new Date(),
                },
            });
            return successResponse({ id: updated.staffid, name: updated.staffname, email: updated.email });
        }

        if (user.role === "student") {
            const updated = await prisma.student.update({
                where: { studentid: user.id },
                data: {
                    studentname: body.name || undefined,
                    phone: body.phone || undefined,
                    description: body.description || undefined,
                    modified: new Date(),
                },
            });
            return successResponse({ id: updated.studentid, name: updated.studentname, email: updated.email });
        }

        return errorResponse("Admin profile cannot be updated via API");
    } catch (error) {
        console.error("Update profile error:", error);
        return errorResponse("Internal server error");
    }
}

// Change password
export async function PATCH(req: NextRequest) {
    try {
        const user = getUserFromRequest(req);
        if (!user) return unauthorizedResponse();

        const { currentPassword, newPassword } = await req.json();
        if (!currentPassword || !newPassword) return errorResponse("Current and new passwords are required");
        if (newPassword.length < 6) return errorResponse("Password must be at least 6 characters");

        const bcrypt = await import("bcryptjs");

        if (user.role === "staff") {
            const staff = await prisma.staff.findUnique({ where: { staffid: user.id } });
            if (!staff) return errorResponse("Staff not found", 404);
            const valid = await bcrypt.compare(currentPassword, staff.password);
            if (!valid) return errorResponse("Current password is incorrect");
            const hashed = await bcrypt.hash(newPassword, 10);
            await prisma.staff.update({ where: { staffid: user.id }, data: { password: hashed, modified: new Date() } });
            return successResponse({ message: "Password changed successfully" });
        }

        if (user.role === "student") {
            const student = await prisma.student.findUnique({ where: { studentid: user.id } });
            if (!student || !student.password) return errorResponse("Student not found", 404);
            const valid = await bcrypt.compare(currentPassword, student.password);
            if (!valid) return errorResponse("Current password is incorrect");
            const hashed = await bcrypt.hash(newPassword, 10);
            await prisma.student.update({ where: { studentid: user.id }, data: { password: hashed, modified: new Date() } });
            return successResponse({ message: "Password changed successfully" });
        }

        return errorResponse("Admin password cannot be changed via API");
    } catch (error) {
        console.error("Change password error:", error);
        return errorResponse("Internal server error");
    }
}

