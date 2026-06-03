import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

type RouteParams = { params: Promise<{ workspaceId: string; invitationId: string }> }

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { workspaceId, invitationId } = await params

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })

    // Check permissions
    const membership = await prisma.workspace_members.findUnique({
      where: { workspace_id_user_id: { workspace_id: workspaceId, user_id: user?.id ?? "" } },
    })
    if (!membership || (membership.role !== "OWNER" && membership.role !== "ADMIN")) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const invitation = await prisma.invitations.findUnique({
      where: { id: invitationId },
    })
    if (!invitation || invitation.workspace_id !== workspaceId) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 })
    }

    await prisma.invitations.update({
      where: { id: invitationId },
      data: { status: "REVOKED" },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to revoke invitation:", error)
    return NextResponse.json({ error: "Failed to revoke invitation" }, { status: 500 })
  }
}
