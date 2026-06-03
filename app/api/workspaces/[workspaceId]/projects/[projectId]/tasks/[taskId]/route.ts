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

    const { workspaceId, projectId, taskId } = await params

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })

    const membership = await prisma.workspace_members.findUnique({
      where: { workspace_id_user_id: { workspace_id: workspaceId, user_id: user?.id ?? "" } },
    })
    if (!membership) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const task = await prisma.tasks.findUnique({
      where: { id: taskId },
      include: {
        users_tasks_assignee_idTousers: { select: { id: true, name: true, image: true, email: true } },
        users_tasks_created_by_idTousers: { select: { id: true, name: true, image: true } },
        task_labels: { include: { labels: true } },
        _count: { select: { task_comments: true } },
      },
    })

    if (!task || task.project_id !== projectId || task.workspace_id !== workspaceId) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    return NextResponse.json({
      task: {
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        position: task.position,
        assignee: task.users_tasks_assignee_idTousers
          ? { id: task.users_tasks_assignee_idTousers.id, name: task.users_tasks_assignee_idTousers.name, image: task.users_tasks_assignee_idTousers.image }
          : null,
        createdBy: { id: task.users_tasks_created_by_idTousers.id, name: task.users_tasks_created_by_idTousers.name },
        dueDate: task.due_date,
        labels: task.task_labels.map((tl) => ({ id: tl.labels.id, name: tl.labels.name, color: tl.labels.color })),
        commentCount: task._count.task_comments,
        createdAt: task.created_at,
        updatedAt: task.updated_at,
      },
    })
  } catch (error) {
    console.error("Failed to fetch task:", error)
    return NextResponse.json({ error: "Failed to fetch task" }, { status: 500 })
  }
}

const VALID_STATUSES = ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE", "CANCELED"] as const
const VALID_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const

export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { workspaceId, projectId, taskId } = await params
    const updates = await req.json()

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })

    const membership = await prisma.workspace_members.findUnique({
      where: { workspace_id_user_id: { workspace_id: workspaceId, user_id: user?.id ?? "" } },
    })
    if (!membership) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const existing = await prisma.tasks.findUnique({ where: { id: taskId } })
    if (!existing || existing.project_id !== projectId || existing.workspace_id !== workspaceId) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}

    if (updates.title !== undefined) {
      if (typeof updates.title !== "string" || updates.title.trim().length === 0) {
        return NextResponse.json({ error: "Task title cannot be empty" }, { status: 400 })
      }
      updateData.title = updates.title.trim()
    }
    if (updates.description !== undefined) {
      updateData.description = updates.description?.trim() || null
    }
    if (updates.status !== undefined) {
      if (!VALID_STATUSES.includes(updates.status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 })
      }
      updateData.status = updates.status
    }
    if (updates.priority !== undefined) {
      if (!VALID_PRIORITIES.includes(updates.priority)) {
        return NextResponse.json({ error: "Invalid priority" }, { status: 400 })
      }
      updateData.priority = updates.priority
    }
    if (updates.assigneeId !== undefined) {
      updateData.assignee_id = updates.assigneeId || null
    }
    if (updates.dueDate !== undefined) {
      updateData.due_date = updates.dueDate ? new Date(updates.dueDate) : null
    }
    if (updates.position !== undefined) {
      updateData.position = updates.position
    }

    const task = await prisma.tasks.update({
      where: { id: taskId },
      data: updateData,
      include: {
        users_tasks_assignee_idTousers: { select: { id: true, name: true, image: true } },
        task_labels: { include: { labels: true } },
        _count: { select: { task_comments: true } },
      },
    })

    // Log activity for status changes
    if (updates.status && updates.status !== existing.status) {
      await prisma.activity_logs.create({
        data: {
          workspace_id: workspaceId,
          project_id: projectId,
          task_id: taskId,
          user_id: user!.id,
          action: "TASK_STATUS_CHANGED",
          message: `Moved task "${task.title}" from ${existing.status} to ${task.status}`,
        },
      })
    }

    return NextResponse.json({
      task: {
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        position: task.position,
        assignee: task.users_tasks_assignee_idTousers
          ? { id: task.users_tasks_assignee_idTousers.id, name: task.users_tasks_assignee_idTousers.name, image: task.users_tasks_assignee_idTousers.image }
          : null,
        dueDate: task.due_date,
        labels: task.task_labels.map((tl) => ({ id: tl.labels.id, name: tl.labels.name, color: tl.labels.color })),
        commentCount: task._count.task_comments,
        createdAt: task.created_at,
        updatedAt: task.updated_at,
      },
    })
  } catch (error) {
    console.error("Failed to update task:", error)
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { workspaceId, projectId, taskId } = await params

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })

    const membership = await prisma.workspace_members.findUnique({
      where: { workspace_id_user_id: { workspace_id: workspaceId, user_id: user?.id ?? "" } },
    })
    if (!membership || (membership.role !== "OWNER" && membership.role !== "ADMIN")) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const task = await prisma.tasks.findUnique({ where: { id: taskId } })
    if (!task || task.project_id !== projectId || task.workspace_id !== workspaceId) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    // Log before deletion
    await prisma.activity_logs.create({
      data: {
        workspace_id: workspaceId,
        project_id: projectId,
        user_id: user!.id,
        action: "TASK_DELETED",
        message: `Deleted task "${task.title}"`,
      },
    })

    await prisma.tasks.delete({ where: { id: taskId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete task:", error)
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 })
  }
}
