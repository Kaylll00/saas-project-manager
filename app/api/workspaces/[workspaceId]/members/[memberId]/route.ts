import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

type RouteParams = { params: Promise<{ workspaceId: string; memberId: string }> }

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { workspaceId, memberId } = await params

    const currentUser = await prisma.user.findUnique({ where: { email: session.user.email } })

    // Check permissions (OWNER or ADMIN can remove members)
    const membership = await prisma.workspace_members.findUnique({
      where: {
        workspace_id_user_id: {
          workspace_id: workspaceId,
          user_id: currentUser?.id ?? "",
        },
      },
    })

    if (!membership || (membership.role !== "OWNER" && membership.role !== "ADMIN")) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Cannot remove the owner
    const memberToRemove = await prisma.workspace_members.findUnique({
      where: {
        workspace_id_user_id: {
          workspace_id: workspaceId,
          user_id: memberId,
        },
      },
    })

    if (!memberToRemove) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    if (memberToRemove.role === "OWNER") {
      return NextResponse.json({ error: "Cannot remove the workspace owner" }, { status: 400 })
    }

    await prisma.workspace_members.delete({
      where: {
        workspace_id_user_id: {
          workspace_id: workspaceId,
          user_id: memberId,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to remove member:", error)
    return NextResponse.json({ error: "Failed to remove member" }, { status: 500 })
  }
}
