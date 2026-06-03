import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

type RouteParams = { params: Promise<{ workspaceId: string; projectId: string }> }

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { workspaceId, projectId } = await params

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })

    const membership = await prisma.workspace_members.findUnique({
      where: { workspace_id_user_id: { workspace_id: workspaceId, user_id: user?.id ?? "" } },
    })
    if (!membership) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const tasks = await prisma.tasks.findMany({
      where: { project_id: projectId, workspace_id: workspaceId },
      include: {
        users_tasks_assignee_idTousers: {
          select: { id: true, name: true, image: true, email: true },
        },
        users_tasks_created_by_idTousers: {
          select: { id: true, name: true },
        },
        task_labels: {
          include: {
            labels: true,
          },
        },
        _count: {
          select: { task_comments: true },
        },
      },
      orderBy: { position: "asc" },
    })

    return NextResponse.json({
      tasks: tasks.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        position: t.position,
        assignee: t.users_tasks_assignee_idTousers
          ? { id: t.users_tasks_assignee_idTousers.id, name: t.users_tasks_assignee_idTousers.name, image: t.users_tasks_assignee_idTousers.image }
          : null,
        createdBy: { id: t.users_tasks_created_by_idTousers.id, name: t.users_tasks_created_by_idTousers.name },
        dueDate: t.due_date,
        labels: t.task_labels.map((tl) => ({ id: tl.labels.id, name: tl.labels.name, color: tl.labels.color })),
        commentCount: t._count.task_comments,
        createdAt: t.created_at,
      })),
    })
  } catch (error) {
    console.error("Failed to fetch tasks:", error)
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 })
  }
}

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { workspaceId, projectId } = await params
    const { title, description, assigneeId, priority, dueDate } = await req.json()

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json({ error: "Task title is required" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })

    const membership = await prisma.workspace_members.findUnique({
      where: { workspace_id_user_id: { workspace_id: workspaceId, user_id: user?.id ?? "" } },
    })
    if (!membership) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Get max position for the project
    const maxPosition = await prisma.tasks.aggregate({
      where: { project_id: projectId },
      _max: { position: true },
    })

    const task = await prisma.tasks.create({
      data: {
        workspace_id: workspaceId,
        project_id: projectId,
        title: title.trim(),
        description: description?.trim() || null,
        assignee_id: assigneeId || null,
        priority: priority || "MEDIUM",
        due_date: dueDate ? new Date(dueDate) : null,
        created_by_id: user!.id,
        position: (maxPosition._max.position ?? -1) + 1,
      },
      include: {
        users_tasks_assignee_idTousers: { select: { id: true, name: true, image: true } },
      },
    })

    // Log activity
    await prisma.activity_logs.create({
      data: {
        workspace_id: workspaceId,
        project_id: projectId,
        task_id: task.id,
        user_id: user!.id,
        action: "TASK_CREATED",
        message: `Created task "${task.title}"`,
      },
    })

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
        labels: [],
        commentCount: 0,
        createdAt: task.created_at,
      },
    }, { status: 201 })
  } catch (error) {
    console.error("Failed to create task:", error)
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 })
  }
}
