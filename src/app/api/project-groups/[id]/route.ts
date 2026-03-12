import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { successResponse, errorResponse, notFoundResponse, unauthorizedResponse, forbiddenResponse } from "@/lib/response";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = getUserFromRequest(req);
        if (!user) return unauthorizedResponse();

        const { id } = await params;
        const group = await prisma.projectgroup.findUnique({
            where: { projectgroupid: parseInt(id) },
            include: {
                projectType: true,
                convenerStaff: { select: { staffid: true, staffname: true, email: true } },
                expertStaff: { select: { staffid: true, staffname: true, email: true } },
                members: {
                    include: {
                        student: { select: { studentid: true, studentname: true, email: true, phone: true } },
                    },
                },
                meetings: {
                    orderBy: { meetingdatetime: "desc" },
                    take: 5,
                },
            },
        });
        if (!group) return notFoundResponse("Project group not found");

        return successResponse(group);
    } catch (error) {
        console.error("Get project group error:", error);
        return errorResponse("Internal server error");
    }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = getUserFromRequest(req);
        if (!user) return unauthorizedResponse();

        const { id } = await params;
        const body = await req.json();

        const updateData: Record<string, unknown> = { modified: new Date() };
        if (body.projectgroupname) updateData.projectgroupname = body.projectgroupname;
        if (body.projecttypeid !== undefined) updateData.projecttypeid = body.projecttypeid ? parseInt(body.projecttypeid) : null;
        if (body.projecttitle !== undefined) updateData.projecttitle = body.projecttitle;
        if (body.projectarea !== undefined) updateData.projectarea = body.projectarea;
        if (body.projectdescription !== undefined) updateData.projectdescription = body.projectdescription;
        if (body.guidestaffname !== undefined) updateData.guidestaffname = body.guidestaffname;
        if (body.convenerstaffid !== undefined) updateData.convenerstaffid = body.convenerstaffid ? parseInt(body.convenerstaffid) : null;
        if (body.expertstaffid !== undefined) updateData.expertstaffid = body.expertstaffid ? parseInt(body.expertstaffid) : null;
        if (body.averagecpi !== undefined) updateData.averagecpi = body.averagecpi;
        if (body.description !== undefined) updateData.description = body.description;

        const group = await prisma.projectgroup.update({
            where: { projectgroupid: parseInt(id) },
            data: updateData,
        });

        return successResponse(group, "Project group updated");
    } catch (error) {
        console.error("Update project group error:", error);
        return errorResponse("Internal server error");
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = getUserFromRequest(req);
        if (!user) return unauthorizedResponse();
        if (user.role !== "admin") return forbiddenResponse();

        const { id } = await params;
        // Delete members first
        await prisma.projectgroupmember.deleteMany({ where: { projectgroupid: parseInt(id) } });
        await prisma.projectgroup.delete({ where: { projectgroupid: parseInt(id) } });

        return successResponse(null, "Project group deleted");
    } catch (error) {
        console.error("Delete project group error:", error);
        return errorResponse("Internal server error");
    }
}
