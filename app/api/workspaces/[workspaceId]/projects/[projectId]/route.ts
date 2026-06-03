import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

type RouteParams = { params: Promise<{ workspaceId: string; projectId: string }> }

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { workspaceId, projectId } = await params

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })

    // Check membership
    const membership = await prisma.workspace_members.findUnique({
      where: {
        workspace_id_user_id: {
          workspace_id: workspaceId,
          user_id: user?.id ?? "",
        },
      },
    })

    if (!membership) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const project = await prisma.projects.findUnique({
      where: { id: projectId },
      include: {
        users: {
          select: { id: true, name: true, email: true, image: true },
        },
        _count: {
          select: { tasks: true },
        },
      },
    })

    if (!project || project.workspace_id !== workspaceId) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    return NextResponse.json({
      project: {
        id: project.id,
        workspaceId: project.workspace_id,
        name: project.name,
        description: project.description,
        status: project.status,
        startDate: project.start_date,
        dueDate: project.due_date,
        createdBy: {
          id: project.users.id,
          name: project.users.name,
          image: project.users.image,
        },
        taskCount: project._count.tasks,
        createdAt: project.created_at,
        updatedAt: project.updated_at,
      },
    })
  } catch (error) {
    console.error("Failed to fetch project:", error)
    return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { workspaceId, projectId } = await params
    const { name, description, status } = await req.json()

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })

    // Check membership and role (only OWNER/ADMIN can update)
    const membership = await prisma.workspace_members.findUnique({
      where: {
        workspace_id_user_id: {
          workspace_id: workspaceId,
          user_id: user?.id ?? "",
        },
      },
    })

    if (!membership || (membership.role !== "OWNER" && membership.role !== "ADMIN")) {
      return NextResponse.json({ error: "Access denied. Only workspace admins can update projects." }, { status: 403 })
    }

    const existingProject = await prisma.projects.findUnique({
      where: { id: projectId },
    })

    if (!existingProject || existingProject.workspace_id !== workspaceId) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    if (name && typeof name === "string") updateData.name = name.trim()
    if (description !== undefined) updateData.description = description?.trim() || null
    if (status) updateData.status = status

    const project = await prisma.projects.update({
      where: { id: projectId },
      data: updateData,
    })

    return NextResponse.json({ project })
  } catch (error) {
    console.error("Failed to update project:", error)
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { workspaceId, projectId } = await params

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })

    // Check membership and role (only OWNER/ADMIN can delete)
    const membership = await prisma.workspace_members.findUnique({
      where: {
        workspace_id_user_id: {
          workspace_id: workspaceId,
          user_id: user?.id ?? "",
        },
      },
    })

    if (!membership || (membership.role !== "OWNER" && membership.role !== "ADMIN")) {
      return NextResponse.json({ error: "Access denied. Only workspace admins can delete projects." }, { status: 403 })
    }

    const project = await prisma.projects.findUnique({
      where: { id: projectId },
    })

    if (!project || project.workspace_id !== workspaceId) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    await prisma.projects.delete({
      where: { id: projectId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete project:", error)
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 })
  }
}
