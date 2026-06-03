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

    const projects = await prisma.projects.findMany({
      where: { workspace_id: workspaceId },
      include: {
        users: {
          select: { id: true, name: true, email: true, image: true },
        },
        _count: {
          select: { tasks: true },
        },
      },
      orderBy: { created_at: "desc" },
    })

    return NextResponse.json({
      projects: projects.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        status: p.status,
        startDate: p.start_date,
        dueDate: p.due_date,
        createdBy: {
          id: p.users.id,
          name: p.users.name,
          image: p.users.image,
        },
        taskCount: p._count.tasks,
        createdAt: p.created_at,
      })),
    })
  } catch (error) {
    console.error("Failed to fetch projects:", error)
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 })
  }
}

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { workspaceId } = await params
    const { name, description } = await req.json()

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Project name is required" }, { status: 400 })
    }

    if (name.trim().length > 200) {
      return NextResponse.json({ error: "Project name must be 200 characters or less" }, { status: 400 })
    }

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

    const project = await prisma.projects.create({
      data: {
        workspace_id: workspaceId,
        name: name.trim(),
        description: description?.trim() || null,
        created_by_id: user!.id,
      },
    })

    return NextResponse.json({ project }, { status: 201 })
  } catch (error) {
    console.error("Failed to create project:", error)
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 })
  }
}
