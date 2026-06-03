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
    if (!user || !user.email) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Find all pending invitations where the email matches the current user
    const invitations = await prisma.invitations.findMany({
      where: {
        email: user.email,
        status: "PENDING",
        expires_at: { gt: new Date() },
      },
      include: {
        workspaces: {
          select: { id: true, name: true, slug: true },
        },
        users: {
          select: { id: true, name: true, image: true },
        },
      },
      orderBy: { created_at: "desc" },
    })

    return NextResponse.json({
      invitations: invitations.map((inv) => ({
        id: inv.id,
        workspace: { id: inv.workspaces.id, name: inv.workspaces.name, slug: inv.workspaces.slug },
        invitedBy: { id: inv.users.id, name: inv.users.name, image: inv.users.image },
        role: inv.role,
        createdAt: inv.created_at,
        expiresAt: inv.expires_at,
        token: inv.token,
      })),
    })
  } catch (error) {
    console.error("Failed to fetch invitations:", error)
    return NextResponse.json({ error: "Failed to fetch invitations" }, { status: 500 })
  }
}
