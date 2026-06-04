import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const since = searchParams.get("since")

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get all workspace IDs the user belongs to
    const memberships = await prisma.workspace_members.findMany({
      where: { user_id: user.id },
      select: { workspace_id: true },
    })

    const workspaceIds = memberships.map((m) => m.workspace_id)

    if (workspaceIds.length === 0) {
      return NextResponse.json({ count: 0 })
    }

    // Build filter based on 'since' parameter
    const filter: Record<string, unknown> = {
      workspace_id: { in: workspaceIds },
    }

    if (since) {
      const sinceDate = new Date(since)
      if (!isNaN(sinceDate.getTime())) {
        filter.created_at = { gt: sinceDate }
      }
    }

    const count = await prisma.activity_logs.count({
      where: filter as any,
    })

    return NextResponse.json({ count })
  } catch (error) {
    console.error("Failed to fetch notification count:", error)
    return NextResponse.json({ error: "Failed to fetch notification count" }, { status: 500 })
  }
}
