import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

type RouteParams = { params: Promise<{ workspaceId: string; projectId: string; taskId: string }> }

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { taskId } = await params

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })

    // Check membership via task's workspace
    const task = await prisma.tasks.findUnique({
      where: { id: taskId },
      select: { workspace_id: true },
    })
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    const membership = await prisma.workspace_members.findUnique({
      where: { workspace_id_user_id: { workspace_id: task.workspace_id, user_id: user?.id ?? "" } },
    })
    if (!membership) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const comments = await prisma.task_comments.findMany({
      where: { task_id: taskId },
      include: {
        users: { select: { id: true, name: true, image: true } },
      },
      orderBy: { created_at: "asc" },
    })

    return NextResponse.json({
      comments: comments.map((c) => ({
        id: c.id,
        content: c.content,
        user: { id: c.users.id, name: c.users.name, image: c.users.image },
        createdAt: c.created_at,
        updatedAt: c.updated_at,
      })),
    })
  } catch (error) {
    console.error("Failed to fetch comments:", error)
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 })
  }
}

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { workspaceId, projectId, taskId } = await params
    const { content } = await req.json()

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json({ error: "Comment content is required" }, { status: 400 })
    }

    if (content.trim().length > 5000) {
      return NextResponse.json({ error: "Comment must be 5000 characters or less" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })

    const membership = await prisma.workspace_members.findUnique({
      where: { workspace_id_user_id: { workspace_id: workspaceId, user_id: user?.id ?? "" } },
    })
    if (!membership) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const comment = await prisma.task_comments.create({
      data: {
        task_id: taskId,
        user_id: user!.id,
        content: content.trim(),
      },
      include: {
        users: { select: { id: true, name: true, image: true } },
      },
    })

    return NextResponse.json({
      comment: {
        id: comment.id,
        content: comment.content,
        user: { id: comment.users.id, name: comment.users.name, image: comment.users.image },
        createdAt: comment.created_at,
        updatedAt: comment.updated_at,
      },
    }, { status: 201 })
  } catch (error) {
    console.error("Failed to create comment:", error)
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 })
  }
}
