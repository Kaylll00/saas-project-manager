import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const cursor = searchParams.get("cursor")
    const limit = Math.min(parseInt(searchParams.get("limit") || "10", 10), 50)

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const memberships = await prisma.workspace_members.findMany({
      where: { user_id: user.id },
      select: { workspace_id: true },
    })

    const workspaceIds = memberships.map((m) => m.workspace_id)

    if (workspaceIds.length === 0) {
      return NextResponse.json({ activities: [], nextCursor: null })
    }

    const where: Record<string, unknown> = {
      workspace_id: { in: workspaceIds },
    }
    if (cursor) {
      where.created_at = { lt: new Date(cursor) }
    }

    const activities = await prisma.activity_logs.findMany({
      where: where as any,
      include: {
        users: { select: { id: true, name: true, image: true } },
        projects: { select: { id: true, name: true } },
        tasks: { select: { id: true, title: true } },
        workspaces: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { created_at: "desc" },
      take: limit + 1,
    })

    const hasMore = activities.length > limit
    const items = hasMore ? activities.slice(0, limit) : activities
    const nextCursor = hasMore ? items[items.length - 1]?.created_at.toISOString() : null

    return NextResponse.json({
      activities: items.map((a) => ({
        id: a.id,
        action: a.action,
        message: a.message,
        user: a.users ? { id: a.users.id, name: a.users.name, image: a.users.image } : null,
        project: a.projects ? { id: a.projects.id, name: a.projects.name } : null,
        task: a.tasks ? { id: a.tasks.id, title: a.tasks.title } : null,
        workspace: { id: a.workspaces.id, name: a.workspaces.name, slug: a.workspaces.slug },
        createdAt: a.created_at,
      })),
      nextCursor,
    })
  } catch (error) {
    console.error("Failed to fetch activity:", error)
    return NextResponse.json({ error: "Failed to fetch activity" }, { status: 500 })
  }
}
