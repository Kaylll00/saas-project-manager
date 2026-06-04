import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const { resourceType, resourceId } = await req.json()

    if (!resourceType || !resourceId) {
      return NextResponse.json({ error: "resourceType and resourceId are required" }, { status: 400 })
    }

    if (!["workspace", "project"].includes(resourceType)) {
      return NextResponse.json({ error: "resourceType must be 'workspace' or 'project'" }, { status: 400 })
    }

    // Upsert presence record
    await prisma.user_presence.upsert({
      where: {
        user_id_resource_type_resource_id: {
          user_id: user.id,
          resource_type: resourceType,
          resource_id: resourceId,
        },
      },
      update: { last_seen_at: new Date() },
      create: {
        user_id: user.id,
        resource_type: resourceType,
        resource_id: resourceId,
      },
    })

    // Clean up stale presence records (older than 2 minutes)
    const twoMinutesAgo = new Date(Date.now() - 120000)
    await prisma.user_presence.deleteMany({
      where: { last_seen_at: { lt: twoMinutesAgo } },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to update presence:", error)
    return NextResponse.json({ error: "Failed to update presence" }, { status: 500 })
  }
}
