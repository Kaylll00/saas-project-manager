import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

type RouteParams = { params: Promise<{ workspaceId: string }> }

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { workspaceId } = await params

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })

    // Check membership
    const membership = await prisma.workspace_members.findUnique({
      where: {
        workspace_id_user_id: {
          workspace_id: workspaceId,
          user_id: user?.id ?? "",
        },
      },
    })

    if (!membership) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const members = await prisma.workspace_members.findMany({
      where: { workspace_id: workspaceId },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: { created_at: "asc" },
    })

    return NextResponse.json({
      members: members.map((m) => ({
        id: m.users.id,
        name: m.users.name,
        email: m.users.email,
        image: m.users.image,
        role: m.role,
        joinedAt: m.created_at,
      })),
    })
  } catch (error) {
    console.error("Failed to fetch members:", error)
    return NextResponse.json({ error: "Failed to fetch members" }, { status: 500 })
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

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const currentUser = await prisma.user.findUnique({ where: { email: session.user.email } })

    // Check permissions (OWNER or ADMIN can add members)
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

    // Find user to add by email
    const userToAdd = await prisma.user.findUnique({ where: { email } })
    if (!userToAdd) {
      return NextResponse.json({ error: "No user found with this email" }, { status: 404 })
    }

    // Check if already a member
    const existingMember = await prisma.workspace_members.findUnique({
      where: {
        workspace_id_user_id: {
          workspace_id: workspaceId,
          user_id: userToAdd.id,
        },
      },
    })

    if (existingMember) {
      return NextResponse.json({ error: "User is already a member" }, { status: 400 })
    }

    await prisma.workspace_members.create({
      data: {
        workspace_id: workspaceId,
        user_id: userToAdd.id,
        role: role || "MEMBER",
      },
    })

    return NextResponse.json({ message: "Member added successfully" }, { status: 201 })
  } catch (error) {
    console.error("Failed to add member:", error)
    return NextResponse.json({ error: "Failed to add member" }, { status: 500 })
  }
}
