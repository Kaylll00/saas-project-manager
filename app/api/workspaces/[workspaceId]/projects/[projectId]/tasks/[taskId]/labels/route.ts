import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

type RouteParams = { params: Promise<{ workspaceId: string; projectId: string; taskId: string }> }

// Toggle a label on a task (add if not present, remove if present)
export async function POST(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { workspaceId, projectId, taskId } = await params
    const { labelId } = await req.json()

    if (!labelId) {
      return NextResponse.json({ error: "Label ID is required" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })

    const membership = await prisma.workspace_members.findUnique({
      where: { workspace_id_user_id: { workspace_id: workspaceId, user_id: user?.id ?? "" } },
    })
    if (!membership) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Check if label belongs to workspace
    const label = await prisma.labels.findUnique({ where: { id: labelId } })
    if (!label || label.workspace_id !== workspaceId) {
      return NextResponse.json({ error: "Label not found" }, { status: 404 })
    }

    // Toggle: check if already attached
    const existing = await prisma.task_labels.findUnique({
      where: { task_id_label_id: { task_id: taskId, label_id: labelId } },
    })

    if (existing) {
      await prisma.task_labels.delete({
        where: { task_id_label_id: { task_id: taskId, label_id: labelId } },
      })
      return NextResponse.json({ attached: false })
    } else {
      await prisma.task_labels.create({
        data: { task_id: taskId, label_id: labelId },
      })
      return NextResponse.json({ attached: true }, { status: 201 })
    }
  } catch (error) {
    console.error("Failed to toggle label:", error)
    return NextResponse.json({ error: "Failed to toggle label" }, { status: 500 })
  }
}
