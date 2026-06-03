import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        workspace_members: {
          include: {
            workspaces: {
              include: {
                _count: {
                  select: {
                    projects: true,
                    workspace_members: true,
                    tasks: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const workspaces = user.workspace_members.map((wm) => ({
      id: wm.workspaces.id,
      name: wm.workspaces.name,
      slug: wm.workspaces.slug,
      description: wm.workspaces.description,
      role: wm.role,
      projectCount: wm.workspaces._count.projects,
      memberCount: wm.workspaces._count.workspace_members,
      taskCount: wm.workspaces._count.tasks,
      createdAt: wm.workspaces.created_at,
    }))

    return NextResponse.json({ workspaces })
  } catch (error) {
    console.error("Failed to fetch workspaces:", error)
    return NextResponse.json({ error: "Failed to fetch workspaces" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, description } = await req.json()

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Workspace name is required" }, { status: 400 })
    }

    if (name.trim().length > 100) {
      return NextResponse.json({ error: "Workspace name must be 100 characters or less" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Generate unique slug
    let baseSlug = generateSlug(name)
    if (!baseSlug) baseSlug = "workspace"

    let slug = baseSlug
    let attempts = 0
    while (attempts < 10) {
      const existing = await prisma.workspaces.findUnique({ where: { slug } })
      if (!existing) break
      attempts++
      slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`
    }

    const workspace = await prisma.workspaces.create({
      data: {
        name: name.trim(),
        slug,
        description: description?.trim() || null,
        owner_id: user.id,
        workspace_members: {
          create: {
            user_id: user.id,
            role: "OWNER",
          },
        },
      },
    })

    return NextResponse.json(
      { workspace },
      { status: 201 }
    )
  } catch (error) {
    console.error("Failed to create workspace:", error)
    return NextResponse.json({ error: "Failed to create workspace" }, { status: 500 })
  }
}
