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
  Pencil,
  Check,
  X,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { SkeletonComment } from "@/components/ui/skeleton"

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

  // Edit mode
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editPriority, setEditPriority] = useState("MEDIUM")
  const [editAssigneeId, setEditAssigneeId] = useState<string | null>(null)
  const [editDueDate, setEditDueDate] = useState("")
  const [isSavingEdit, setIsSavingEdit] = useState(false)
  const [members, setMembers] = useState<{ id: string; name: string | null; email: string | null; image: string | null }[]>([])

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

  // Load members when entering edit mode
  useEffect(() => {
    if (isEditing) {
      fetch(`/api/workspaces/${workspaceId}/members`)
        .then((r) => r.json())
        .then((data) => { if (data.members) setMembers(data.members) })
        .catch(() => {})
    }
  }, [isEditing, workspaceId])

  const startEditing = () => {
    if (!task) return
    setEditTitle(task.title)
    setEditDescription(task.description || "")
    setEditPriority(task.priority)
    setEditAssigneeId(task.assignee?.id || null)
    setEditDueDate(task.dueDate ? task.dueDate.split("T")[0] : "")
    setIsEditing(true)
  }

  const cancelEditing = () => {
    setIsEditing(false)
  }

  const handleSaveEdit = async () => {
    if (!task || !editTitle.trim()) return
    setIsSavingEdit(true)
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/projects/${projectId}/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle.trim(),
          description: editDescription.trim() || null,
          priority: editPriority,
          assigneeId: editAssigneeId,
          dueDate: editDueDate || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to update task")
      setTask(data.task)
      setIsEditing(false)
      toast("Task updated successfully", "success")
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to update task", "error")
    } finally {
      setIsSavingEdit(false)
    }
  }

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
      toast("Status updated successfully", "success")
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
      toast("Comment added", "success")
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
      toast("Task deleted successfully", "success")
      router.push(`/workspaces/${workspaceId}/projects/${projectId}`)
      router.refresh()
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to delete task", "error")
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="h-4 w-32 animate-pulse rounded bg-slate-200 mb-6" />
        <div className="space-y-6">
          {/* Main card skeleton */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
            <div className="space-y-4">
              <div className="h-8 w-3/4 animate-pulse rounded bg-slate-200" />
              <div className="flex space-x-2">
                <div className="h-6 w-20 animate-pulse rounded-full bg-slate-200" />
                <div className="h-6 w-16 animate-pulse rounded-full bg-slate-200" />
              </div>
              <div className="flex flex-wrap gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-4 w-24 animate-pulse rounded bg-slate-200" />
                ))}
              </div>
              <div className="space-y-2 mt-4">
                <div className="h-4 w-16 animate-pulse rounded bg-slate-200" />
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-6 w-16 animate-pulse rounded-full bg-slate-200" />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Comments skeleton */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
            <div className="h-6 w-32 animate-pulse rounded bg-slate-200 mb-4" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <SkeletonComment key={i} />
              ))}
            </div>
          </div>
        </div>
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
              {isEditing ? (
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full text-2xl font-bold text-slate-900 bg-white border-2 border-indigo-300 rounded-lg px-3 py-2 outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                  maxLength={200}
                  autoFocus
                />
              ) : (
                <h1 className="font-display text-2xl font-bold text-slate-900">{task.title}</h1>
              )}
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
                {isEditing ? (
                  <select
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value)}
                    className="inline-flex items-center rounded-lg border-2 border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="URGENT">URGENT</option>
                  </select>
                ) : (
                  <span className={cn(
                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                    priorityColors[task.priority] || "bg-slate-100 text-slate-600"
                  )}>
                    <AlertCircle className="mr-1 size-3" />
                    {task.priority}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {isEditing ? (
                <>
                  <Button
                    onClick={handleSaveEdit}
                    disabled={isSavingEdit || !editTitle.trim()}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 border-2 border-indigo-600 font-semibold"
                  >
                    {isSavingEdit ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Check className="size-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={cancelEditing}
                    disabled={isSavingEdit}
                    className="border-2 border-slate-300 font-semibold"
                  >
                    <X className="size-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={startEditing}
                    className="border-2 border-slate-300 font-semibold"
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="border-2 border-slate-300 font-semibold text-red-600 hover:bg-red-50 hover:border-red-300 hover:text-red-700"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </>
              )}
            </div>
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

          {/* Description - editable */}
          {isEditing ? (
            <div className="mt-5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 block">Description</label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Add a description..."
                rows={3}
                className="flex w-full resize-none rounded-lg border-2 border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                maxLength={5000}
              />
            </div>
          ) : task.description ? (
            <div className="mt-5 rounded-lg bg-slate-50 p-4">
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{task.description}</p>
            </div>
          ) : null}

          {/* Meta info - editable */}
          <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-slate-500">
            {/* Assignee */}
            {isEditing ? (
              <div className="flex items-center space-x-1.5">
                <User className="size-3.5 flex-shrink-0" />
                <select
                  value={editAssigneeId || ""}
                  onChange={(e) => setEditAssigneeId(e.target.value || null)}
                  className="rounded-lg border-2 border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                >
                  <option value="">Unassigned</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>{m.name || m.email || "Unknown"}</option>
                  ))}
                </select>
              </div>
            ) : task.assignee ? (
              <span className="flex items-center space-x-1.5">
                <User className="size-3.5" />
                <span>{task.assignee.name || "Unassigned"}</span>
              </span>
            ) : null}

            {/* Due date */}
            {isEditing ? (
              <div className="flex items-center space-x-1.5">
                <Calendar className="size-3.5 flex-shrink-0" />
                <input
                  type="date"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  className="rounded-lg border-2 border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>
            ) : task.dueDate ? (
              <span className="flex items-center space-x-1.5">
                <Calendar className="size-3.5" />
                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
              </span>
            ) : null}

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
