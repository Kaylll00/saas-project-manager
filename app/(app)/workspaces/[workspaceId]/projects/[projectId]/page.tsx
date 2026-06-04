"use client"

import { useParams, useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  ListTodo,
  Plus,
  Trash2,
  Calendar,
  User,
  X,
  Loader2,
  MessageSquare,
  AlertCircle,
  Tag,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { SkeletonKanbanColumn } from "@/components/ui/skeleton"

type TaskCard = {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
  assignee: { id: string; name: string | null; image: string | null } | null
  labels: { id: string; name: string; color: string }[]
  commentCount: number
  dueDate: string | null
}

type ProjectData = {
  id: string
  workspaceId: string
  name: string
  description: string | null
  status: string
  createdBy: { id: string; name: string | null; image: string | null }
  taskCount: number
  createdAt: string
}

const columns = [
  { id: "TODO", label: "To Do", color: "border-t-slate-400" },
  { id: "IN_PROGRESS", label: "In Progress", color: "border-t-blue-500" },
  { id: "IN_REVIEW", label: "In Review", color: "border-t-amber-500" },
  { id: "DONE", label: "Done", color: "border-t-green-500" },
]

const priorityColors: Record<string, string> = {
  LOW: "text-slate-400",
  MEDIUM: "text-blue-500",
  HIGH: "text-amber-500",
  URGENT: "text-red-500",
}

const statusColors: Record<string, { label: string; bg: string; text: string }> = {
  PLANNING: { label: "Planning", bg: "bg-slate-100", text: "text-slate-700" },
  ACTIVE: { label: "Active", bg: "bg-green-100", text: "text-green-700" },
  ON_HOLD: { label: "On Hold", bg: "bg-amber-100", text: "text-amber-700" },
  COMPLETED: { label: "Completed", bg: "bg-blue-100", text: "text-blue-700" },
  ARCHIVED: { label: "Archived", bg: "bg-red-100", text: "text-red-700" },
}

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const workspaceId = params.workspaceId as string
  const projectId = params.projectId as string

  const [project, setProject] = useState<ProjectData | null>(null)
  const [tasks, setTasks] = useState<TaskCard[]>([])
  const [workspaceName, setWorkspaceName] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Create task
  const [showNewTask, setShowNewTask] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [newTaskStatus, setNewTaskStatus] = useState("TODO")
  const [isCreating, setIsCreating] = useState(false)

  const loadData = async () => {
    try {
      const [projectRes, wsRes, tasksRes] = await Promise.all([
        fetch(`/api/workspaces/${workspaceId}/projects/${projectId}`),
        fetch(`/api/workspaces/${workspaceId}`),
        fetch(`/api/workspaces/${workspaceId}/projects/${projectId}/tasks`),
      ])

      const projectData = await projectRes.json()
      if (!projectRes.ok) throw new Error(projectData.error || "Failed to load project")

      setProject(projectData.project)
      if (wsRes.ok) {
        const wsData = await wsRes.json()
        setWorkspaceName(wsData.workspace.name)
      }
      if (tasksRes.ok) {
        const tasksData = await tasksRes.json()
        setTasks(tasksData.tasks)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [workspaceId, projectId])

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/projects/${projectId}`, { method: "DELETE" })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to delete project")
      }
      toast("Project deleted successfully", "success")
      router.push(`/workspaces/${workspaceId}`)
      router.refresh()
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to delete project", "error")
      setIsDeleting(false)
    }
  }

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskTitle.trim()) return

    setIsCreating(true)
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/projects/${projectId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTaskTitle.trim(), status: newTaskStatus }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to create task")

      toast("Task created successfully", "success")
      setNewTaskTitle("")
      setShowNewTask(false)
      loadData()
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to create task", "error")
    } finally {
      setIsCreating(false)
    }
  }

  const handleQuickStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        toast("Task moved", "success")
        loadData()
      }
    } catch {
      // silently fail
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
            <div className="h-8 w-64 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-48 animate-pulse rounded bg-slate-200" />
          </div>
          <div className="flex space-x-3">
            <div className="h-10 w-28 animate-pulse rounded-lg bg-slate-200" />
            <div className="h-10 w-28 animate-pulse rounded-lg bg-slate-200" />
          </div>
        </div>

        {/* Kanban skeleton */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonKanbanColumn key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-red-600 font-medium">{error || "Project not found"}</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href={`/workspaces/${workspaceId}`}>Back to Workspace</Link>
        </Button>
      </div>
    )
  }

  const statusStyle = statusColors[project.status] || statusColors.PLANNING
  const kanbanTasks: Record<string, TaskCard[]> = {
    TODO: tasks.filter((t) => t.status === "TODO"),
    IN_PROGRESS: tasks.filter((t) => t.status === "IN_PROGRESS"),
    IN_REVIEW: tasks.filter((t) => t.status === "IN_REVIEW"),
    DONE: tasks.filter((t) => t.status === "DONE"),
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href={`/workspaces/${workspaceId}`}
            className="mb-2 inline-flex items-center space-x-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="size-4" />
            <span>{workspaceName || "Workspace"}</span>
          </Link>
          <div className="mt-1 flex items-center space-x-3">
            <h1 className="font-display text-2xl font-bold text-slate-900 sm:text-3xl">
              {project.name}
            </h1>
            <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold", statusStyle.bg, statusStyle.text)}>
              {statusStyle.label}
            </span>
          </div>
          {project.description && <p className="mt-2 text-slate-600 max-w-2xl">{project.description}</p>}
          <div className="mt-3 flex items-center space-x-4 text-sm text-slate-500">
            <span className="flex items-center space-x-1"><User className="size-3.5" /><span>{project.createdBy.name || "Unknown"}</span></span>
            <span className="flex items-center space-x-1"><Calendar className="size-3.5" /><span>Created {new Date(project.createdAt).toLocaleDateString()}</span></span>
            <span className="flex items-center space-x-1"><ListTodo className="size-3.5" /><span>{tasks.length} tasks</span></span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            className="border-2 border-slate-300 font-semibold text-red-600 hover:bg-red-50 hover:border-red-300 hover:text-red-700"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 className="mr-1.5 size-4" />Delete
          </Button>
          <Button
            onClick={() => { setShowNewTask(true); setNewTaskStatus("TODO") }}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 border-2 border-indigo-600 font-semibold shadow-lg"
          >
            <Plus className="mr-1.5 size-4" />Add Task
          </Button>
        </div>
      </div>

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-700">Are you sure? All tasks will be permanently deleted.</p>
          <div className="mt-3 flex items-center space-x-3">
            <Button onClick={handleDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-700 text-white font-semibold border-2 border-red-600">
              {isDeleting ? "Deleting..." : "Yes, Delete Project"}
            </Button>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} disabled={isDeleting} className="border-2 border-slate-300 font-semibold">
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Quick create task */}
      {showNewTask && (
        <form onSubmit={handleCreateTask} className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Task title..."
              className="flex-1 h-11 rounded-lg border-2 border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
              autoFocus
              maxLength={200}
            />
            <select
              value={newTaskStatus}
              onChange={(e) => setNewTaskStatus(e.target.value)}
              className="h-11 rounded-lg border-2 border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
            >
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="IN_REVIEW">In Review</option>
              <option value="DONE">Done</option>
            </select>
            <div className="flex space-x-2">
              <Button type="submit" disabled={isCreating || !newTaskTitle.trim()} className="h-11 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 border-2 border-indigo-600 font-semibold">
                {isCreating ? <Loader2 className="size-4 animate-spin" /> : "Create"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowNewTask(false)} className="h-11 border-2 border-slate-300 font-semibold">
                <X className="size-4" />
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* Kanban Board */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {columns.map((col) => {
          const colTasks = kanbanTasks[col.id] || []
          const nextStatus = columns[columns.indexOf(col) + 1]?.id || col.id

          return (
            <div key={col.id} className="rounded-xl border border-slate-200 bg-slate-50 shadow-sm">
              {/* Column header */}
              <div className={cn("flex items-center justify-between rounded-t-xl border-t-4 border-slate-400 bg-white px-4 py-3", col.color)}>
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold text-sm text-slate-900">{col.label}</h3>
                  <span className="inline-flex items-center justify-center size-5 rounded-full bg-slate-200 text-xs font-medium text-slate-600">
                    {colTasks.length}
                  </span>
                </div>
              </div>

              {/* Column body */}
              <div className="space-y-2 p-3 min-h-[200px]">
                {colTasks.length === 0 ? (
                  <div className="flex items-center justify-center h-24 rounded-lg border-2 border-dashed border-slate-200">
                    <p className="text-xs text-slate-400">No tasks</p>
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <Link
                      key={task.id}
                      href={`/workspaces/${workspaceId}/projects/${projectId}/tasks/${task.id}`}
                      className="group block rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-all hover:shadow-md hover:border-indigo-200 hover:-translate-y-0.5"
                    >
                      <div className="space-y-2">
                        {/* Labels */}
                        {task.labels.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {task.labels.slice(0, 3).map((l) => (
                              <span key={l.id} className="inline-block rounded px-1.5 py-0.5 text-[10px] font-medium text-white" style={{ backgroundColor: l.color }}>
                                {l.name}
                              </span>
                            ))}
                            {task.labels.length > 3 && (
                              <span className="text-[10px] text-slate-400">+{task.labels.length - 3}</span>
                            )}
                          </div>
                        )}

                        {/* Title */}
                        <h4 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                          {task.title}
                        </h4>

                        {/* Footer */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {task.priority !== "MEDIUM" && (
                              <AlertCircle className={cn("size-3.5", priorityColors[task.priority] || "text-slate-400")} />
                            )}
                            {task.commentCount > 0 && (
                              <span className="flex items-center space-x-0.5 text-xs text-slate-400">
                                <MessageSquare className="size-3" />
                                <span>{task.commentCount}</span>
                              </span>
                            )}
                          </div>

                          {/* Quick status advance */}
                          {col.id !== "DONE" && (
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleQuickStatusChange(task.id, nextStatus)
                              }}
                              className="text-[10px] font-medium text-slate-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              Move →
                            </button>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
