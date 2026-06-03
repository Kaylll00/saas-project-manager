import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

type RouteParams = { params: Promise<{ workspaceId: string }> }

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { workspaceId } = await params

    const workspace = await prisma.workspaces.findUnique({
      where: { id: workspaceId },
      include: {
        _count: {
          select: {
            projects: true,
            workspace_members: true,
            tasks: true,
          },
        },
        workspace_members: {
          include: {
            users: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
    })

    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 })
    }

    // Check if user is a member
    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    const isMember = workspace.workspace_members.some((m) => m.user_id === user?.id)
    if (!isMember) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const memberRole = workspace.workspace_members.find((m) => m.user_id === user?.id)?.role

    return NextResponse.json({
      workspace: {
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug,
        description: workspace.description,
        ownerId: workspace.owner_id,
        projectCount: workspace._count.projects,
        memberCount: workspace._count.workspace_members,
        taskCount: workspace._count.tasks,
        members: workspace.workspace_members.map((m) => ({
          id: m.users.id,
          name: m.users.name,
          email: m.users.email,
          image: m.users.image,
          role: m.role,
          joinedAt: m.created_at,
        })),
        myRole: memberRole,
        createdAt: workspace.created_at,
      },
    })
  } catch (error) {
    console.error("Failed to fetch workspace:", error)
    return NextResponse.json({ error: "Failed to fetch workspace" }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { workspaceId } = await params
    const { name, description } = await req.json()

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check permissions (only OWNER or ADMIN can update)
    const membership = await prisma.workspace_members.findUnique({
      where: {
        workspace_id_user_id: {
          workspace_id: workspaceId,
          user_id: user.id,
        },
      },
    })

    if (!membership || (membership.role !== "OWNER" && membership.role !== "ADMIN")) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length === 0) {
        return NextResponse.json({ error: "Workspace name is required" }, { status: 400 })
      }
      updateData.name = name.trim()
    }
    if (description !== undefined) {
      updateData.description = description?.trim() || null
    }

    const workspace = await prisma.workspaces.update({
      where: { id: workspaceId },
      data: updateData,
    })

    return NextResponse.json({ workspace })
  } catch (error) {
    console.error("Failed to update workspace:", error)
    return NextResponse.json({ error: "Failed to update workspace" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { workspaceId } = await params

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Only OWNER can delete
    const membership = await prisma.workspace_members.findUnique({
      where: {
        workspace_id_user_id: {
          workspace_id: workspaceId,
          user_id: user.id,
        },
      },
    })

    if (!membership || membership.role !== "OWNER") {
      return NextResponse.json({ error: "Only the workspace owner can delete it" }, { status: 403 })
    }

    await prisma.workspaces.delete({
      where: { id: workspaceId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete workspace:", error)
    return NextResponse.json({ error: "Failed to delete workspace" }, { status: 500 })
  }
}
