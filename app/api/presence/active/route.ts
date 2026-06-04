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
    const resourceType = searchParams.get("resourceType")
    const resourceId = searchParams.get("resourceId")

    if (!resourceType || !resourceId) {
      return NextResponse.json({ error: "resourceType and resourceId are required" }, { status: 400 })
    }

    // Get active users (last seen within the last 60 seconds)
    const oneMinuteAgo = new Date(Date.now() - 60000)
    const presenceRecords = await prisma.user_presence.findMany({
      where: {
        resource_type: resourceType,
        resource_id: resourceId,
        last_seen_at: { gte: oneMinuteAgo },
      },
      include: {
        users: {
          select: { id: true, name: true, image: true, email: true },
        },
      },
      orderBy: { last_seen_at: "desc" },
      take: 20,
    })

    const activeUsers = presenceRecords.map((p) => ({
      id: p.users.id,
      name: p.users.name,
      image: p.users.image,
      email: p.users.email,
    }))

    return NextResponse.json({ activeUsers, count: activeUsers.length })
  } catch (error) {
    console.error("Failed to fetch active users:", error)
    return NextResponse.json({ error: "Failed to fetch active users" }, { status: 500 })
  }
}
