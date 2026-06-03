"use client"

import { useParams, useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  Calendar,
  User,
  MessageSquare,
  Send,
  Tag,
  Trash2,
  AlertCircle,
  ChevronDown,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

type TaskData = {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
  assignee: { id: string; name: string | null; image: string | null } | null
  createdBy: { id: string; name: string | null }
  dueDate: string | null
  labels: { id: string; name: string; color: string }[]
  commentCount: number
  createdAt: string
  updatedAt: string
}

type CommentData = {
  id: string
  content: string
  user: { id: string; name: string | null; image: string | null }
  createdAt: string
}

type LabelData = {
  id: string
  name: string
  color: string
}

const statusOptions = [
  { value: "TODO", label: "To Do" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "IN_REVIEW", label: "In Review" },
  { value: "DONE", label: "Done" },
  { value: "CANCELED", label: "Canceled" },
]

const priorityColors: Record<string, string> = {
  LOW: "bg-slate-100 text-slate-600",
  MEDIUM: "bg-blue-100 text-blue-700",
  HIGH: "bg-amber-100 text-amber-700",
  URGENT: "bg-red-100 text-red-700",
}

export default function TaskDetailPage() {
  const params = useParams()
  const router = useRouter()
  const workspaceId = params.workspaceId as string
  const projectId = params.projectId as string
  const taskId = params.taskId as string

  const [task, setTask] = useState<TaskData | null>(null)
  const [projectName, setProjectName] = useState("")
  const [workspaceName, setWorkspaceName] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Comments
  const [comments, setComments] = useState<CommentData[]>([])
  const [newComment, setNewComment] = useState("")
  const [isSendingComment, setIsSendingComment] = useState(false)
  const commentEndRef = useRef<HTMLDivElement>(null)

  // Labels
  const [availableLabels, setAvailableLabels] = useState<LabelData[]>([])
  const [showLabelPicker, setShowLabelPicker] = useState(false)

  // Status change
  const [isUpdating, setIsUpdating] = useState(false)

  // Delete
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadTask = async () => {
    try {
      const [taskRes, wsRes, commentsRes, labelsRes] = await Promise.all([
        fetch(`/api/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}`),
        fetch(`/api/workspaces/${workspaceId}`),
        fetch(`/api/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/comments`),
        fetch(`/api/workspaces/${workspaceId}/labels`),
      ])

      const taskData = await taskRes.json()
      if (!taskRes.ok) throw new Error(taskData.error || "Failed to load task")

      setTask(taskData.task)
      if (wsRes.ok) {
        const wsData = await wsRes.json()
        setWorkspaceName(wsData.workspace.name)
      }
      if (commentsRes.ok) {
        const commentsData = await commentsRes.json()
        setComments(commentsData.comments)
      }
      if (labelsRes.ok) {
        const labelsData = await labelsRes.json()
        setAvailableLabels(labelsData.labels)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadTask()
  }, [workspaceId, projectId, taskId])

  useEffect(() => {
    commentEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [comments.length])

  const handleStatusChange = async (newStatus: string) => {
    if (!task || newStatus === task.status) return
    setIsUpdating(true)
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to update status")
      setTask(data.task)
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to update status", "error")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setIsSendingComment(true)
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to add comment")
      setComments((prev) => [...prev, data.comment])
      setNewComment("")
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to add comment", "error")
    } finally {
      setIsSendingComment(false)
    }
  }

  const handleToggleLabel = async (labelId: string) => {
    try {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}/labels`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ labelId }),
        }
      )
      if (!res.ok) return
      loadTask()
    } catch {
      // silently fail
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to delete task")
      }
      router.push(`/workspaces/${workspaceId}/projects/${projectId}`)
      router.refresh()
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to delete task", "error")
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="size-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
      </div>
    )
  }

  if (error || !task) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-red-600 font-medium">{error || "Task not found"}</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href={`/workspaces/${workspaceId}/projects/${projectId}`}>Back to Project</Link>
        </Button>
      </div>
    )
  }

  const taskLabels = task.labels
  const isLabelAttached = (labelId: string) => taskLabels.some((l) => l.id === labelId)

  return (
    <div className="mx-auto max-w-4xl">
      {/* Breadcrumb */}
      <Link
        href={`/workspaces/${workspaceId}/projects/${projectId}`}
        className="mb-6 inline-flex items-center space-x-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="size-4" />
        <span>{projectName || "Back to project"}</span>
      </Link>

      <div className="space-y-6">
        {/* Main card */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          {/* Header row */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <h1 className="font-display text-2xl font-bold text-slate-900">{task.title}</h1>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                {/* Status selector */}
                <div className="relative group">
                  <button
                    onClick={() => !isUpdating && handleStatusChange(
                      statusOptions[(statusOptions.findIndex((s) => s.value === task.status) + 1) % statusOptions.length].value
                    )}
                    disabled={isUpdating}
                    className={cn(
                      "inline-flex items-center space-x-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all hover:scale-105",
                      {
                        "bg-slate-100 text-slate-700": task.status === "TODO",
                        "bg-blue-100 text-blue-700": task.status === "IN_PROGRESS",
                        "bg-amber-100 text-amber-700": task.status === "IN_REVIEW",
                        "bg-green-100 text-green-700": task.status === "DONE",
                        "bg-red-100 text-red-700": task.status === "CANCELED",
                      }
                    )}
                  >
                    <span>{statusOptions.find((s) => s.value === task.status)?.label}</span>
                    <ChevronDown className="size-3" />
                  </button>
                </div>

                {/* Priority */}
                <span className={cn(
                  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                  priorityColors[task.priority] || "bg-slate-100 text-slate-600"
                )}>
                  <AlertCircle className="mr-1 size-3" />
                  {task.priority}
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              className="border-2 border-slate-300 font-semibold text-red-600 hover:bg-red-50 hover:border-red-300 hover:text-red-700"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>

          {/* Delete confirmation */}
          {showDeleteConfirm && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-700">Delete this task permanently?</p>
              <div className="mt-3 flex items-center space-x-3">
                <Button onClick={handleDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-700 text-white font-semibold border-2 border-red-600 text-sm py-1.5">
                  {isDeleting ? "Deleting..." : "Yes, Delete"}
                </Button>
                <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} disabled={isDeleting} className="border-2 border-slate-300 font-semibold text-sm py-1.5">
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Description */}
          {task.description && (
            <div className="mt-5 rounded-lg bg-slate-50 p-4">
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{task.description}</p>
            </div>
          )}

          {/* Meta info */}
          <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-slate-500">
            {task.assignee && (
              <span className="flex items-center space-x-1.5">
                <User className="size-3.5" />
                <span>{task.assignee.name || "Unassigned"}</span>
              </span>
            )}
            {task.dueDate && (
              <span className="flex items-center space-x-1.5">
                <Calendar className="size-3.5" />
                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
              </span>
            )}
            <span className="flex items-center space-x-1.5">
              <MessageSquare className="size-3.5" />
              <span>{comments.length} comment{comments.length !== 1 ? "s" : ""}</span>
            </span>
            <span className="text-xs text-slate-400">
              Created {new Date(task.createdAt).toLocaleDateString()}
            </span>
          </div>

          {/* Labels */}
          <div className="mt-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center space-x-1">
                <Tag className="size-3" />
                <span>Labels</span>
              </span>
              <button
                onClick={() => setShowLabelPicker(!showLabelPicker)}
                className="text-xs font-semibold text-indigo-600 hover:text-purple-600 transition-colors"
              >
                {showLabelPicker ? "Done" : "Edit"}
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {taskLabels.length > 0 ? taskLabels.map((label) => (
                <span
                  key={label.id}
                  className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
                  style={{ backgroundColor: label.color }}
                >
                  {label.name}
                </span>
              )) : (
                <span className="text-xs text-slate-400">No labels</span>
              )}
            </div>

            {/* Label picker */}
            {showLabelPicker && (
              <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                {availableLabels.length === 0 ? (
                  <p className="text-xs text-slate-400">No labels available. Create labels in workspace settings.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {availableLabels.map((label) => (
                      <button
                        key={label.id}
                        onClick={() => handleToggleLabel(label.id)}
                        className={cn(
                          "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-all hover:scale-105",
                          isLabelAttached(label.id) ? "ring-2 ring-offset-1 ring-slate-400" : "opacity-60 hover:opacity-100"
                        )}
                        style={{ backgroundColor: label.color, color: "#fff" }}
                      >
                        {label.name}
                        {isLabelAttached(label.id) && <span className="ml-1">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Comments section */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          <h2 className="font-display text-lg font-bold text-slate-900 mb-4 flex items-center space-x-2">
            <MessageSquare className="size-5" />
            <span>Comments ({comments.length})</span>
          </h2>

          <div className="space-y-4 max-h-80 overflow-y-auto">
            {comments.length === 0 ? (
              <p className="text-sm text-slate-400 py-4 text-center">No comments yet. Start the conversation.</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex space-x-3">
                  {comment.user.image ? (
                    <img src={comment.user.image} alt="" className="size-8 rounded-full mt-0.5 flex-shrink-0" />
                  ) : (
                    <div className="flex size-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-semibold text-xs flex-shrink-0 mt-0.5">
                      {comment.user.name?.charAt(0) || "?"}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold text-slate-900">{comment.user.name || "Unknown"}</span>
                      <span className="text-xs text-slate-400">{new Date(comment.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">{comment.content}</p>
                  </div>
                </div>
              ))
            )}
            <div ref={commentEndRef} />
          </div>

          {/* Comment input */}
          <form onSubmit={handleSendComment} className="mt-4 flex items-start space-x-3">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 h-11 rounded-lg border-2 border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
              maxLength={5000}
            />
            <Button
              type="submit"
              disabled={isSendingComment || !newComment.trim()}
              className="h-11 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 border-2 border-indigo-600 font-semibold px-4"
            >
              {isSendingComment ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
