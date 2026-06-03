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
    const membership = await prisma.workspace_members.findUnique({
      where: { workspace_id_user_id: { workspace_id: workspaceId, user_id: user?.id ?? "" } },
    })
    if (!membership) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const labels = await prisma.labels.findMany({
      where: { workspace_id: workspaceId },
      orderBy: { name: "asc" },
    })

    return NextResponse.json({ labels })
  } catch (error) {
    console.error("Failed to fetch labels:", error)
    return NextResponse.json({ error: "Failed to fetch labels" }, { status: 500 })
  }
}

const LABEL_COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4",
  "#6366f1", "#a855f7", "#ec4899", "#64748b", "#1e293b",
]

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { workspaceId } = await params
    const { name, color } = await req.json()

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Label name is required" }, { status: 400 })
    }

    const trimmedName = name.trim().slice(0, 50)

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    const membership = await prisma.workspace_members.findUnique({
      where: { workspace_id_user_id: { workspace_id: workspaceId, user_id: user?.id ?? "" } },
    })
    if (!membership) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Check for duplicate name
    const existing = await prisma.labels.findUnique({
      where: { workspace_id_name: { workspace_id: workspaceId, name: trimmedName } },
    })
    if (existing) {
      return NextResponse.json({ error: "A label with this name already exists" }, { status: 400 })
    }

    const label = await prisma.labels.create({
      data: {
        workspace_id: workspaceId,
        name: trimmedName,
        color: color || LABEL_COLORS[Math.floor(Math.random() * LABEL_COLORS.length)],
      },
    })

    return NextResponse.json({ label }, { status: 201 })
  } catch (error) {
    console.error("Failed to create label:", error)
    return NextResponse.json({ error: "Failed to create label" }, { status: 500 })
  }
}
