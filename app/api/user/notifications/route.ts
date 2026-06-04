import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    let settings = await prisma.user_notification_settings.findUnique({
      where: { user_id: user.id },
    })

    // Create default settings if none exist
    if (!settings) {
      settings = await prisma.user_notification_settings.create({
        data: { user_id: user.id },
      })
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error("Failed to fetch notification settings:", error)
    return NextResponse.json({ error: "Failed to fetch notification settings" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const body = await req.json()
    const allowedFields = [
      "task_assigned",
      "status_changed",
      "new_comment",
      "task_due_soon",
      "new_project",
      "member_joined",
      "invitation_received",
    ]

    const updateData: Record<string, boolean> = {}
    for (const field of allowedFields) {
      if (typeof body[field] === "boolean") {
        updateData[field] = body[field]
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No valid settings provided" }, { status: 400 })
    }

    const settings = await prisma.user_notification_settings.upsert({
      where: { user_id: user.id },
      update: { ...updateData, updated_at: new Date() },
      create: { user_id: user.id, ...updateData },
    })

    return NextResponse.json({ settings })
  } catch (error) {
    console.error("Failed to update notification settings:", error)
    return NextResponse.json({ error: "Failed to update notification settings" }, { status: 500 })
  }
}
