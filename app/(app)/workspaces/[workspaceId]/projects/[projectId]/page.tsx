"use client"

import { useParams, useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { useEffect, useState, useCallback, useRef } from "react"
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
  GripVertical,
  LayoutGrid,
  Table2,
  Search,
  Pencil,
  Check,
  Filter,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { SkeletonKanbanColumn } from "@/components/ui/skeleton"
import AnimatedSection from "@/components/ui/animated-section"
import ActiveUsers from "@/components/ActiveUsers"
import { usePresence } from "@/hooks/use-presence"
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

type TaskCard = {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
  position: number
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

function DraggableTaskCard({ task, workspaceId, projectId }: { task: TaskCard; workspaceId: string; projectId: string }) {
  const router = useRouter()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: "task", task },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const dragged = useRef(false)

  // Track when dnd-kit actually initiates a drag (reliable: reacts to hook state)
  useEffect(() => {
    if (isDragging) {
      dragged.current = true
    }
  }, [isDragging])

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="group block cursor-grab active:cursor-grabbing rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-all hover:shadow-md hover:border-indigo-200 hover:-translate-y-0.5 select-none"
      onClick={() => {
        if (!dragged.current) {
          router.push(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${task.id}`)
        }
        dragged.current = false
      }}
    >
      <div className="space-y-2 pointer-events-none">
        {/* Drag handle indicator */}
        <div className="flex items-center justify-between mb-1">
          <GripVertical className="size-3.5 text-slate-300 group-hover:text-slate-500 transition-colors" />
          {task.priority !== "MEDIUM" && (
            <AlertCircle className={cn("size-3.5", priorityColors[task.priority] || "text-slate-400")} />
          )}
        </div>

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
            {task.commentCount > 0 && (
              <span className="flex items-center space-x-0.5 text-xs text-slate-400">
                <MessageSquare className="size-3" />
                <span>{task.commentCount}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function KanbanColumn({
  column,
  tasks,
  workspaceId,
  projectId,
}: {
  column: typeof columns[0]
  tasks: TaskCard[]
  workspaceId: string
  projectId: string
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { type: "column", columnId: column.id },
  })

  return (
    <AnimatedSection key={column.id} variant="slide-up" delay={columns.indexOf(column) * 100}>
      <div className={cn("rounded-xl border border-slate-200 bg-slate-50 shadow-sm", isOver && "ring-2 ring-indigo-400 ring-offset-2")}>
        {/* Column header */}
        <div className={cn("flex items-center justify-between rounded-t-xl border-t-4 border-slate-400 bg-white px-4 py-3", column.color)}>
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold text-sm text-slate-900">{column.label}</h3>
            <span className="inline-flex items-center justify-center size-5 rounded-full bg-slate-200 text-xs font-medium text-slate-600">
              {tasks.length}
            </span>
          </div>
        </div>

        {/* Column body - droppable area */}
        <div
          ref={setNodeRef}
          className="space-y-2 p-3 min-h-[200px] transition-colors"
        >
          <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            {tasks.length === 0 ? (
              <div className="flex items-center justify-center h-24 rounded-lg border-2 border-dashed border-slate-200">
                <p className="text-xs text-slate-400">Drop tasks here</p>
              </div>
            ) : (
              tasks.map((task) => (
                <DraggableTaskCard
                  key={task.id}
                  task={task}
                  workspaceId={workspaceId}
                  projectId={projectId}
                />
              ))
            )}
          </SortableContext>
        </div>
      </div>
    </AnimatedSection>
  )
}

function DragOverlayContent({ task }: { task: TaskCard }) {
  return (
    <div className="rounded-lg border-2 border-indigo-400 bg-white p-3 shadow-xl rotate-3 w-64">
      <div className="space-y-2">
        {/* Labels */}
        {task.labels.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.labels.slice(0, 2).map((l) => (
              <span key={l.id} className="inline-block rounded px-1.5 py-0.5 text-[10px] font-medium text-white" style={{ backgroundColor: l.color }}>
                {l.name}
              </span>
            ))}
          </div>
        )}
        <h4 className="text-sm font-semibold text-slate-900 leading-snug">{task.title}</h4>
        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <span>{task.priority}</span>
          {task.commentCount > 0 && <span>· {task.commentCount} comments</span>}
        </div>
      </div>
    </div>
  )
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
  const [activeDragTask, setActiveDragTask] = useState<TaskCard | null>(null)

  // Mobile: selected column for single-column view
  const [mobileColumn, setMobileColumn] = useState("TODO")

  // Presence tracking
  usePresence({ type: "project", id: projectId })

  // Project editing
  const [isEditingProject, setIsEditingProject] = useState(false)
  const [editProjectName, setEditProjectName] = useState("")
  const [editProjectDescription, setEditProjectDescription] = useState("")
  const [editProjectStatus, setEditProjectStatus] = useState("PLANNING")
  const [isSavingProject, setIsSavingProject] = useState(false)

  // View mode: 'kanban' | 'list'
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban")

  // Search & filter
  const [searchQuery, setSearchQuery] = useState("")
  const [filterAssignee, setFilterAssignee] = useState<string | null>(null)
  const [filterPriority, setFilterPriority] = useState<string | null>(null)
  const [filterLabels, setFilterLabels] = useState<string[]>([])

  // Create task
  const [showNewTask, setShowNewTask] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [newTaskStatus, setNewTaskStatus] = useState("TODO")
  const [newTaskAssigneeId, setNewTaskAssigneeId] = useState<string | null>(null)
  const [newTaskDueDate, setNewTaskDueDate] = useState("")
  const [members, setMembers] = useState<{ id: string; name: string | null; email: string | null }[]>([])
  const [isCreating, setIsCreating] = useState(false)

  const sensors = useSensors(
    // Reduced distance for more responsive drag initiation
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  )

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

  const startEditingProject = () => {
    if (!project) return
    setEditProjectName(project.name)
    setEditProjectDescription(project.description || "")
    setEditProjectStatus(project.status)
    setIsEditingProject(true)
  }

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editProjectName.trim()) return
    setIsSavingProject(true)
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editProjectName.trim(),
          description: editProjectDescription.trim() || null,
          status: editProjectStatus,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to update project")
      setProject((prev) => prev ? { ...prev, name: editProjectName.trim(), description: editProjectDescription.trim() || null, status: editProjectStatus } : prev)
      setIsEditingProject(false)
      toast("Project updated successfully", "success")
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to update project", "error")
    } finally {
      setIsSavingProject(false)
    }
  }

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

  // Load members on mount for assignee filter and quick-create form
  useEffect(() => {
    fetch(`/api/workspaces/${workspaceId}/members`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data?.members) setMembers(data.members) })
      .catch(() => {})
  }, [workspaceId])

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskTitle.trim()) return

    setIsCreating(true)
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/projects/${projectId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTaskTitle.trim(),
          status: newTaskStatus,
          assigneeId: newTaskAssigneeId,
          dueDate: newTaskDueDate || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to create task")

      toast("Task created successfully", "success")
      setNewTaskTitle("")
      setNewTaskStatus("TODO")
      setNewTaskAssigneeId(null)
      setNewTaskDueDate("")
      setShowNewTask(false)
      loadData()
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to create task", "error")
    } finally {
      setIsCreating(false)
    }
  }

  // Handle drag start
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id)
    if (task) setActiveDragTask(task)
  }, [tasks])

  // Handle drag end - update task status and position
  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveDragTask(null)

    if (!over) return

    const activeTask = tasks.find((t) => t.id === active.id)
    if (!activeTask) return

    // Determine target column
    let targetStatus: string
    const overData = over.data.current
    if (overData?.type === "column") {
      targetStatus = overData.columnId
    } else {
      // Dropped on another task - find its column
      const overTask = tasks.find((t) => t.id === over.id)
      if (!overTask) return
      targetStatus = overTask.status
    }

    const sourceStatus = activeTask.status

    // If same column and same position, no change needed
    if (sourceStatus === targetStatus && active.id === over.id) return

    // Snapshot for rollback
    const previousTasks = [...tasks]

    // Optimistically update
    setTasks((prev) => {
      const updated = prev.map((t) => {
        if (t.id === activeTask.id) {
          return { ...t, status: targetStatus }
        }
        return t
      })

      // Assign positions: reindex within each column
      const columns = ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]
      const positioned = columns.flatMap((col) =>
        updated
          .filter((t) => t.status === col)
          .map((t, i) => ({ ...t, position: i }))
      )
      return positioned
    })

    try {
      // Persist the change
      if (sourceStatus !== targetStatus) {
        const res = await fetch(`/api/workspaces/${workspaceId}/projects/${projectId}/tasks/${activeTask.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: targetStatus }),
        })
        if (!res.ok) {
          setTasks(previousTasks)
          throw new Error("Failed to update task status")
        }
      }

      // Sync positions across all columns
      const allTasks = tasks.map((t) => {
        if (t.id === activeTask.id) return { ...t, status: targetStatus }
        return t
      })
      const columns = ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]
      const reordered = columns.flatMap((col) =>
        allTasks
          .filter((t) => t.status === col)
          .map((t, i) => ({ id: t.id, position: i }))
      )

      const posRes = await fetch(`/api/workspaces/${workspaceId}/projects/${projectId}/tasks/reorder`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tasks: reordered }),
      })
      if (!posRes.ok) {
        setTasks(previousTasks)
        throw new Error("Failed to sync positions")
      }

      toast("Task moved", "success")
    } catch (err) {
      setTasks(previousTasks)
      toast(err instanceof Error ? err.message : "Failed to move task", "error")
    }
  }, [tasks, workspaceId, projectId])

  if (isLoading) {
    return (
      <div className="space-y-6">
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

  // Apply search and filters
  const filteredTasks = tasks.filter((t) => {
    if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
    if (filterAssignee && t.assignee?.id !== filterAssignee) return false
    return true
  })

  const kanbanTasks: Record<string, TaskCard[]> = {}
  for (const col of columns) {
    kanbanTasks[col.id] = filteredTasks
      .filter((t) => t.status === col.id)
      .sort((a, b) => a.position - b.position)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <AnimatedSection variant="fade-up">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link
              href={`/workspaces/${workspaceId}`}
              className="mb-2 inline-flex items-center space-x-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
            >
              <ArrowLeft className="size-4" />
              <span>{workspaceName || "Workspace"}</span>
            </Link>

            {/* Project title - editable */}
            {isEditingProject ? (
              <form onSubmit={handleSaveProject} className="mt-1 space-y-2">
                <input
                  type="text"
                  value={editProjectName}
                  onChange={(e) => setEditProjectName(e.target.value)}
                  className="w-full text-2xl font-bold text-slate-900 bg-white border-2 border-indigo-300 rounded-lg px-3 py-2 outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                  maxLength={100}
                  autoFocus
                />
                <div className="flex items-center gap-3">
                  <select
                    value={editProjectStatus}
                    onChange={(e) => setEditProjectStatus(e.target.value)}
                    className="rounded-lg border-2 border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                  >
                    <option value="PLANNING">Planning</option>
                    <option value="ACTIVE">Active</option>
                    <option value="ON_HOLD">On Hold</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                  <input
                    type="text"
                    value={editProjectDescription}
                    onChange={(e) => setEditProjectDescription(e.target.value)}
                    placeholder="Project description..."
                    className="flex-1 rounded-lg border-2 border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                    maxLength={500}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Button type="submit" disabled={isSavingProject || !editProjectName.trim()} className="h-9 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 border-2 border-indigo-600 font-semibold text-sm">
                    {isSavingProject ? <Loader2 className="size-4 animate-spin" /> : <><Check className="mr-1 size-3.5" />Save</>}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsEditingProject(false)} className="h-9 border-2 border-slate-300 font-semibold text-sm">
                    <X className="size-3.5" />
                  </Button>
                </div>
              </form>
            ) : (
              <>
                <div className="mt-1 flex items-center space-x-3">
                  <h1 className="font-display text-2xl font-bold text-slate-900 sm:text-3xl">{project.name}</h1>
                  <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold", statusStyle.bg, statusStyle.text)}>
                    {statusStyle.label}
                  </span>
                </div>
                {project.description && <p className="mt-2 text-slate-600 max-w-2xl">{project.description}</p>}
              </>
            )}
            <div className="mt-3 flex items-center space-x-4 text-sm text-slate-500">
              <span className="flex items-center space-x-1"><User className="size-3.5" /><span>{project.createdBy.name || "Unknown"}</span></span>
              <span className="flex items-center space-x-1"><Calendar className="size-3.5" /><span>Created {new Date(project.createdAt).toLocaleDateString()}</span></span>
              <span className="flex items-center space-x-1"><ListTodo className="size-3.5" /><span>{tasks.length} tasks</span></span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {/* View mode toggle */}
            <div className="flex items-center rounded-lg border-2 border-slate-200 bg-white p-0.5 shadow-sm">
              <button
                onClick={() => setViewMode("kanban")}
                className={cn(
                  "flex items-center space-x-1 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-all",
                  viewMode === "kanban"
                    ? "bg-indigo-100 text-indigo-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                )}
                title="Kanban view"
              >
                <LayoutGrid className="size-3.5" />
                <span className="hidden sm:inline">Board</span>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "flex items-center space-x-1 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-all",
                  viewMode === "list"
                    ? "bg-indigo-100 text-indigo-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                )}
                title="List view"
              >
                <Table2 className="size-3.5" />
                <span className="hidden sm:inline">List</span>
              </button>
            </div>

            {!isEditingProject && (
              <Button variant="outline" onClick={startEditingProject} className="border-2 border-slate-300 font-semibold">
                <Pencil className="size-4" />
              </Button>
            )}
            <Button variant="outline" className="border-2 border-slate-300 font-semibold text-red-600 hover:bg-red-50 hover:border-red-300 hover:text-red-700" onClick={() => setShowDeleteConfirm(true)}>
              <Trash2 className="mr-1.5 size-4" />Delete
            </Button>
            <Button onClick={() => { setShowNewTask(true); setNewTaskStatus("TODO"); setNewTaskAssigneeId(null); setNewTaskDueDate("") }} className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 border-2 border-indigo-600 font-semibold shadow-lg">
              <Plus className="mr-1.5 size-4" />Add Task
            </Button>
          </div>
        </div>
      </AnimatedSection>

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
          <div className="flex flex-col gap-3">
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
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              {/* Assignee picker */}
              <div className="flex-1 flex items-center space-x-2">
                <User className="size-4 text-slate-400 flex-shrink-0" />
                <select
                  value={newTaskAssigneeId || ""}
                  onChange={(e) => setNewTaskAssigneeId(e.target.value || null)}
                  className="flex-1 h-11 rounded-lg border-2 border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                >
                  <option value="">Unassigned</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>{m.name || m.email || "Unknown"}</option>
                  ))}
                </select>
              </div>
              {/* Due date */}
              <div className="flex items-center space-x-2">
                <Calendar className="size-4 text-slate-400 flex-shrink-0" />
                <input
                  type="date"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                  className="h-11 rounded-lg border-2 border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>
              <div className="flex space-x-2">
                <Button type="submit" disabled={isCreating || !newTaskTitle.trim()} className="h-11 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 border-2 border-indigo-600 font-semibold">
                  {isCreating ? <Loader2 className="size-4 animate-spin" /> : "Create"}
                </Button>
                <Button type="button" variant="outline" onClick={() => {
                  setShowNewTask(false)
                  setNewTaskAssigneeId(null)
                  setNewTaskDueDate("")
                }} className="h-11 border-2 border-slate-300 font-semibold">
                  <X className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Search & filter bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <ActiveUsers resource={{ type: "project", id: projectId }} />
        <div className="flex flex-1 items-center gap-2 sm:max-w-md">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-full h-10 rounded-lg border-2 border-slate-200 bg-white pl-9 pr-3 text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Assignee filter */}
          <div className="flex items-center space-x-1">
            <Filter className="size-3.5 text-slate-400" />
            <select
              value={filterAssignee || ""}
              onChange={(e) => setFilterAssignee(e.target.value || null)}
              className="h-10 rounded-lg border-2 border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
            >
              <option value="">All</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>{m.name || m.email || "User"}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Mobile column selector tabs */}
      <div className="flex overflow-x-auto gap-1 sm:hidden -mx-4 px-4 pb-1 scrollbar-none">
        {columns.map((col) => {
          const count = kanbanTasks[col.id]?.length || 0
          return (
            <button
              key={col.id}
              onClick={() => setMobileColumn(col.id)}
              className={cn(
                "flex items-center space-x-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold transition-all",
                mobileColumn === col.id
                  ? "bg-indigo-100 text-indigo-700 shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              <span className={cn("size-2 rounded-full", {
                "bg-slate-400": col.id === "TODO",
                "bg-blue-500": col.id === "IN_PROGRESS",
                "bg-amber-500": col.id === "IN_REVIEW",
                "bg-green-500": col.id === "DONE",
              })} />
              <span>{col.label}</span>
              <span className="inline-flex items-center justify-center size-4 rounded-full bg-white/80 text-[10px] font-medium text-slate-500">
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Kanban Board with Drag & Drop */}
      {viewMode === "kanban" ? (
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {/* Mobile: single column */}
          <div className="sm:hidden">
            {columns
              .filter((col) => col.id === mobileColumn)
              .map((col) => (
                <KanbanColumn
                  key={col.id}
                  column={col}
                  tasks={kanbanTasks[col.id] || []}
                  workspaceId={workspaceId}
                  projectId={projectId}
                />
              ))}
          </div>

          {/* Desktop: all columns */}
          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {columns.map((col) => (
              <KanbanColumn
                key={col.id}
                column={col}
                tasks={kanbanTasks[col.id] || []}
                workspaceId={workspaceId}
                projectId={projectId}
              />
            ))}
          </div>

          <DragOverlay>
            {activeDragTask ? <DragOverlayContent task={activeDragTask} /> : null}
          </DragOverlay>
        </DndContext>
      ) : (
        /* List View */
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {filteredTasks.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-slate-100">
                <ListTodo className="size-6 text-slate-400" />
              </div>
              <p className="mt-3 text-sm text-slate-500">
                {searchQuery || filterAssignee ? "No tasks match your search." : "No tasks yet. Create one to get started."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Title</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 hidden sm:table-cell">Priority</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 hidden md:table-cell">Assignee</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 hidden md:table-cell">Due Date</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                      <Link
                        href={`/workspaces/${workspaceId}/projects/${projectId}/tasks/new`}
                        className="inline-flex items-center space-x-1 text-indigo-600 hover:text-indigo-700"
                      >
                        <Plus className="size-3.5" />
                        <span>Add</span>
                      </Link>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTasks.map((task) => {
                    const statusBadge = {
                      TODO: { label: "To Do", bg: "bg-slate-100 text-slate-600" },
                      IN_PROGRESS: { label: "In Progress", bg: "bg-blue-100 text-blue-700" },
                      IN_REVIEW: { label: "In Review", bg: "bg-amber-100 text-amber-700" },
                      DONE: { label: "Done", bg: "bg-green-100 text-green-700" },
                    }[task.status] || { label: task.status, bg: "bg-slate-100 text-slate-600" }

                    return (
                      <tr
                        key={task.id}
                        onClick={() => router.push(`/workspaces/${workspaceId}/projects/${projectId}/tasks/${task.id}`)}
                        className="hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <td className="px-4 py-3">
                          <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold", statusBadge.bg)}>
                            {statusBadge.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 max-w-[200px]">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-slate-900 truncate">{task.title}</span>
                            {task.labels.length > 0 && (
                              <div className="flex gap-1 flex-shrink-0">
                                {task.labels.slice(0, 2).map((l) => (
                                  <span key={l.id} className="size-2 rounded-full" style={{ backgroundColor: l.color }} />
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <span className={cn(
                            "inline-flex items-center space-x-1 text-xs font-medium",
                            priorityColors[task.priority] || "text-slate-400"
                          )}>
                            <AlertCircle className="size-3" />
                            <span>{task.priority}</span>
                          </span>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          {task.assignee ? (
                            <div className="flex items-center space-x-1.5">
                              {task.assignee.image ? (
                                <img src={task.assignee.image} alt="" className="size-5 rounded-full" />
                              ) : (
                                <div className="flex size-5 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-semibold text-[8px]">
                                  {task.assignee.name?.charAt(0) || "?"}
                                </div>
                              )}
                              <span className="text-xs text-slate-600">{task.assignee.name || "Unnamed"}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          {task.dueDate ? (
                            <span className="text-xs text-slate-500">{new Date(task.dueDate).toLocaleDateString()}</span>
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/workspaces/${workspaceId}/projects/${projectId}/tasks/${task.id}`}
                            className="text-xs font-medium text-indigo-600 hover:text-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Open
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
