import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { resend } from "@/lib/resend"
import crypto from "crypto"

type RouteParams = { params: Promise<{ workspaceId: string }> }

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { workspaceId } = await params

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    const membership = await prisma.workspace_members.findUnique({
      where: { workspace_id_user_id: { workspace_id: workspaceId, user_id: user?.id ?? "" } },
    })
    if (!membership || (membership.role !== "OWNER" && membership.role !== "ADMIN")) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const invitations = await prisma.invitations.findMany({
      where: { workspace_id: workspaceId, status: "PENDING" },
      include: {
        users: { select: { id: true, name: true, email: true } },
      },
      orderBy: { created_at: "desc" },
    })

    return NextResponse.json({
      invitations: invitations.map((inv) => ({
        id: inv.id,
        email: inv.email,
        role: inv.role,
        status: inv.status,
        invitedBy: { id: inv.users.id, name: inv.users.name, email: inv.users.email },
        expiresAt: inv.expires_at,
        createdAt: inv.created_at,
      })),
    })
  } catch (error) {
    console.error("Failed to fetch invitations:", error)
    return NextResponse.json({ error: "Failed to fetch invitations" }, { status: 500 })
  }
}

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { workspaceId } = await params
    const { email, role } = await req.json()

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 })
    }

    const currentUser = await prisma.user.findUnique({ where: { email: session.user.email } })
    const membership = await prisma.workspace_members.findUnique({
      where: { workspace_id_user_id: { workspace_id: workspaceId, user_id: currentUser?.id ?? "" } },
    })
    if (!membership || (membership.role !== "OWNER" && membership.role !== "ADMIN")) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const workspace = await prisma.workspaces.findUnique({
      where: { id: workspaceId },
      select: { name: true },
    })
    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 })
    }

    // Check if user is already a member
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      const alreadyMember = await prisma.workspace_members.findUnique({
        where: { workspace_id_user_id: { workspace_id: workspaceId, user_id: existingUser.id } },
      })
      if (alreadyMember) {
        return NextResponse.json({ error: "User is already a member of this workspace" }, { status: 400 })
      }
    }

    // Check for existing pending invitation
    const existingInvite = await prisma.invitations.findFirst({
      where: { workspace_id: workspaceId, email, status: "PENDING" },
    })
    if (existingInvite) {
      return NextResponse.json({ error: "An invitation has already been sent to this email" }, { status: 400 })
    }

    // Create invitation
    const token = crypto.randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    const invitation = await prisma.invitations.create({
      data: {
        workspace_id: workspaceId,
        email,
        role: role || "MEMBER",
        token,
        invited_by_id: currentUser!.id,
        expires_at: expiresAt,
      },
    })

    const acceptUrl = `${process.env.NEXTAUTH_URL}/invitations/accept?token=${token}`

    // Send invitation email via Resend
    try {
      await resend.emails.send({
        from: "Stride <onboarding@resend.dev>",
        to: email,
        subject: `You've been invited to ${workspace.name}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 560px; margin: 0 auto; padding: 24px; }
                .header { background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); padding: 32px; text-align: center; border-radius: 12px 12px 0 0; }
                .header h1 { color: white; margin: 0; font-size: 24px; }
                .content { background: #f8fafc; padding: 32px 24px; border-radius: 0 0 12px 12px; }
                .button { display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
                .footer { text-align: center; margin-top: 24px; color: #94a3b8; font-size: 13px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>You're Invited to Stride!</h1>
                </div>
                <div class="content">
                  <h2>Hi there,</h2>
                  <p><strong>${currentUser?.name || "A team member"}</strong> has invited you to join <strong>${workspace.name}</strong> on Stride.</p>
                  <p style="margin-bottom: 8px;">You'll be added as: <strong>${(role || "MEMBER").replace("_", " ").toLowerCase()}</strong></p>
                  <p style="text-align: center;">
                    <a href="${acceptUrl}" class="button">Accept Invitation</a>
                  </p>
                  <p style="color: #64748b; font-size: 14px;">Or copy this link into your browser:</p>
                  <p style="color: #64748b; font-size: 12px; word-break: break-all;">${acceptUrl}</p>
                  <p style="color: #94a3b8; font-size: 13px; margin-top: 24px;">This invitation expires in 7 days.</p>
                </div>
                <div class="footer">
                  <p>Stride — Project management for modern teams</p>
                </div>
              </div>
            </body>
          </html>
        `,
      })
    } catch (emailErr) {
      console.warn("Failed to send invitation email (Resend may need domain verification):", emailErr)
    }

    return NextResponse.json({
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        status: invitation.status,
        expiresAt: invitation.expires_at,
        createdAt: invitation.created_at,
        acceptUrl,
      },
    }, { status: 201 })
  } catch (error) {
    console.error("Failed to create invitation:", error)
    return NextResponse.json({ error: "Failed to create invitation" }, { status: 500 })
  }
}
