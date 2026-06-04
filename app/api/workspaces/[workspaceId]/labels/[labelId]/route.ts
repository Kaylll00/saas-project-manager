import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

type RouteParams = { params: Promise<{ workspaceId: string; labelId: string }> }

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { workspaceId, labelId } = await params

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    const membership = await prisma.workspace_members.findUnique({
      where: { workspace_id_user_id: { workspace_id: workspaceId, user_id: user?.id ?? "" } },
    })
    if (!membership || (membership.role !== "OWNER" && membership.role !== "ADMIN")) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const label = await prisma.labels.findUnique({ where: { id: labelId } })
    if (!label || label.workspace_id !== workspaceId) {
      return NextResponse.json({ error: "Label not found" }, { status: 404 })
    }

    // Delete label (cascades to task_labels)
    await prisma.labels.delete({ where: { id: labelId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete label:", error)
    return NextResponse.json({ error: "Failed to delete label" }, { status: 500 })
  }
}
