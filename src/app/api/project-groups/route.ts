import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { successResponse, errorResponse, validationErrorResponse, unauthorizedResponse } from "@/lib/response";

export async function GET(req: NextRequest) {
    try {
        const user = getUserFromRequest(req);
        if (!user) return unauthorizedResponse();

        const groups = await prisma.projectgroup.findMany({
            orderBy: { created: "desc" },
            include: {
                projectType: true,
                convenerStaff: { select: { staffid: true, staffname: true, email: true } },
                expertStaff: { select: { staffid: true, staffname: true, email: true } },
                members: {
                    include: {
                        student: { select: { studentid: true, studentname: true, email: true } },
                    },
                },
            },
        });
        return successResponse(groups);
    } catch (error) {
        console.error("Get project groups error:", error);
        return errorResponse("Internal server error");
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = getUserFromRequest(req);
        if (!user) return unauthorizedResponse();

        const body = await req.json();
        const { projectgroupname, projecttypeid, projecttitle, projectarea, projectdescription, guidestaffname, description } = body;

        if (!projectgroupname) {
            return validationErrorResponse("Project group name is required");
        }

        const group = await prisma.projectgroup.create({
            data: {
                projectgroupname,
                projecttypeid: projecttypeid ? parseInt(projecttypeid) : null,
                projecttitle: projecttitle || null,
                projectarea: projectarea || null,
                projectdescription: projectdescription || null,
                guidestaffname: guidestaffname || null,
                description: description || null,
                status: "Pending",
            },
        });

        return successResponse(group, "Project group created", 201);
    } catch (error) {
        console.error("Create project group error:", error);
        return errorResponse("Internal server error");
    }
}
