import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      // Not logged in - redirect to login
      const url = new URL("/login", req.url)
      url.searchParams.set("callbackUrl", req.url)
      return NextResponse.redirect(url)
    }

    const { searchParams } = new URL(req.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.redirect(new URL("/dashboard?error=invalid-invitation", req.url))
    }

    const invitation = await prisma.invitations.findUnique({
      where: { token },
    })

    if (!invitation) {
      return NextResponse.redirect(new URL("/dashboard?error=invalid-invitation", req.url))
    }

    if (invitation.status !== "PENDING") {
      return NextResponse.redirect(new URL("/dashboard?error=invitation-expired", req.url))
    }

    if (invitation.expires_at < new Date()) {
      await prisma.invitations.update({
        where: { id: invitation.id },
        data: { status: "EXPIRED" },
      })
      return NextResponse.redirect(new URL("/dashboard?error=invitation-expired", req.url))
    }

    // Check the invitation email matches the logged-in user's email
    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) {
      return NextResponse.redirect(new URL("/dashboard?error=user-not-found", req.url))
    }

    if (user.email !== invitation.email) {
      return NextResponse.redirect(new URL("/dashboard?error=email-mismatch", req.url))
    }

    // Check if already a member
    const existingMember = await prisma.workspace_members.findUnique({
      where: { workspace_id_user_id: { workspace_id: invitation.workspace_id, user_id: user.id } },
    })
    if (existingMember) {
      // Already a member - just mark as accepted
      await prisma.invitations.update({
        where: { id: invitation.id },
        data: { status: "ACCEPTED" },
      })
      return NextResponse.redirect(new URL(`/workspaces/${invitation.workspace_id}`, req.url))
    }

    // Add user as member and mark invitation as accepted
    await prisma.$transaction([
      prisma.workspace_members.create({
        data: {
          workspace_id: invitation.workspace_id,
          user_id: user.id,
          role: invitation.role,
        },
      }),
      prisma.invitations.update({
        where: { id: invitation.id },
        data: { status: "ACCEPTED" },
      }),
    ])

    return NextResponse.redirect(new URL(`/workspaces/${invitation.workspace_id}?joined=true`, req.url))
  } catch (error) {
    console.error("Failed to accept invitation:", error)
    return NextResponse.redirect(new URL("/dashboard?error=invitation-failed", req.url))
  }
}
