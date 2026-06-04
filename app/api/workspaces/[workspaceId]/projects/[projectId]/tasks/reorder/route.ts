import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

type RouteParams = { params: Promise<{ workspaceId: string; projectId: string }> }

export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { workspaceId, projectId } = await params
    const { tasks } = await req.json()

    if (!Array.isArray(tasks) || tasks.length === 0) {
      return NextResponse.json({ error: "Invalid request: tasks must be a non-empty array" }, { status: 400 })
    }

    // Validate each task entry
    const isValid = tasks.every(
      (t: unknown) =>
        typeof t === "object" &&
        t !== null &&
        typeof (t as Record<string, unknown>).id === "string" &&
        typeof (t as Record<string, unknown>).position === "number"
    )
    if (!isValid) {
      return NextResponse.json({ error: "Invalid request: each task must have 'id' (string) and 'position' (number)" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    const membership = await prisma.workspace_members.findUnique({
      where: { workspace_id_user_id: { workspace_id: workspaceId, user_id: user?.id ?? "" } },
    })
    if (!membership) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Batch update positions in a transaction
    await prisma.$transaction(
      tasks.map((t: { id: string; position: number }) =>
        prisma.tasks.update({
          where: { id: t.id },
          data: { position: t.position },
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to reorder tasks:", error)
    return NextResponse.json({ error: "Failed to reorder tasks" }, { status: 500 })
  }
}
