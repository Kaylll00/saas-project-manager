"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  FolderKanban,
  Users,
  ListTodo,
  Settings,
  Plus,
  ArrowLeft,
  ArrowRight,
  Activity,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

type WorkspaceMember = {
  id: string
  name: string | null
  email: string | null
  image: string | null
  role: string
  joinedAt: string
}

type WorkspaceData = {
  id: string
  name: string
  slug: string
  description: string | null
  ownerId: string
  projectCount: number
  memberCount: number
  taskCount: number
  members: WorkspaceMember[]
  myRole: string
  createdAt: string
}

type ProjectSummary = {
  id: string
  name: string
  description: string | null
  status: string
  taskCount: number
  createdBy: { id: string; name: string | null; image: string | null }
  createdAt: string
}

const statusBadges: Record<string, { label: string; bg: string; text: string }> = {
  PLANNING: { label: "Planning", bg: "bg-slate-100", text: "text-slate-600" },
  ACTIVE: { label: "Active", bg: "bg-green-100", text: "text-green-700" },
  ON_HOLD: { label: "On Hold", bg: "bg-amber-100", text: "text-amber-700" },
  COMPLETED: { label: "Completed", bg: "bg-blue-100", text: "text-blue-700" },
  ARCHIVED: { label: "Archived", bg: "bg-red-100", text: "text-red-700" },
}

export default function WorkspaceDetailPage() {
  const params = useParams()
  const workspaceId = params.workspaceId as string

  const [workspace, setWorkspace] = useState<WorkspaceData | null>(null)
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const [wsRes, projectsRes] = await Promise.all([
          fetch(`/api/workspaces/${workspaceId}`),
          fetch(`/api/workspaces/${workspaceId}/projects`),
        ])

        const wsData = await wsRes.json()
        const projectsData = await projectsRes.json()

        if (!wsRes.ok) throw new Error(wsData.error || "Failed to load workspace")
        if (projectsRes.ok) setProjects(projectsData.projects)

        // Load activity feed
        fetch(`/api/workspaces/${workspaceId}/activity`)
          .then((r) => r.ok ? r.json() : null)
          .then((d) => { if (d) setActivities(d.activities) })
          .catch(() => {})

        setWorkspace(wsData.workspace)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong")
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [workspaceId])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="size-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
      </div>
    )
  }

  if (error || !workspace) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-red-600 font-medium">{error || "Workspace not found"}</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/workspaces">Back to Workspaces</Link>
        </Button>
      </div>
    )
  }

  const roleColors: Record<string, string> = {
    OWNER: "bg-amber-100 text-amber-700",
    ADMIN: "bg-purple-100 text-purple-700",
    MEMBER: "bg-blue-100 text-blue-700",
    VIEWER: "bg-slate-100 text-slate-700",
  }

  const canEdit = workspace.myRole === "OWNER" || workspace.myRole === "ADMIN"

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/workspaces"
            className="mb-2 inline-flex items-center space-x-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="size-4" />
            <span>All Workspaces</span>
          </Link>
          <h1 className="mt-1 font-display text-2xl font-bold text-slate-900 sm:text-3xl">
            {workspace.name}
          </h1>
          {workspace.description && (
            <p className="mt-1 text-slate-600">{workspace.description}</p>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {canEdit && (
            <>
              <Button asChild variant="outline" className="border-2 border-slate-300 font-semibold">
                <Link href={`/workspaces/${workspaceId}/settings`}>
                  <Settings className="mr-1.5 size-4" />
                  Settings
                </Link>
              </Button>
              <Button asChild className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 border-2 border-indigo-600 font-semibold shadow-lg">
                <Link href={`/workspaces/${workspaceId}/projects/new`}>
                  <Plus className="mr-1.5 size-4" />
                  New Project
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "Projects", value: workspace.projectCount, icon: FolderKanban, href: "#projects", color: "text-indigo-600", bg: "bg-indigo-100" },
          { label: "Members", value: workspace.memberCount, icon: Users, href: `/workspaces/${workspaceId}/members`, color: "text-purple-600", bg: "bg-purple-100" },
          { label: "Tasks", value: workspace.taskCount, icon: ListTodo, href: "#", color: "text-green-600", bg: "bg-green-100" },
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-indigo-200"
            >
              <div className="flex items-center space-x-3">
                <div className={cn("flex size-11 items-center justify-center rounded-lg", stat.bg)}>
                  <Icon className={cn("size-5", stat.color)} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                  <p className="text-sm text-slate-600">{stat.label}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Members preview */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-bold text-slate-900">Members</h2>
          <Link
            href={`/workspaces/${workspaceId}/members`}
            className="text-sm font-semibold text-indigo-600 hover:text-purple-600 transition-colors"
          >
            View all
          </Link>
        </div>
        <div className="space-y-3">
          {workspace.members.slice(0, 5).map((member) => (
            <div key={member.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {member.image ? (
                  <img src={member.image} alt={member.name || ""} className="size-9 rounded-full" />
                ) : (
                  <div className="flex size-9 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-semibold text-sm">
                    {member.name?.charAt(0) || member.email?.charAt(0) || "?"}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-slate-900">{member.name || "Unnamed"}</p>
                  <p className="text-xs text-slate-500">{member.email}</p>
                </div>
              </div>
              <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", roleColors[member.role] || "bg-slate-100 text-slate-700")}>
                {member.role}
              </span>
            </div>
          ))}
          {workspace.members.length === 0 && (
            <p className="text-sm text-slate-500">No members yet.</p>
          )}
        </div>
      </div>

      {/* Projects section */}
      <div id="projects">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-bold text-slate-900">
            Projects ({projects.length})
          </h2>
          {canEdit && (
            <Button asChild className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 border-2 border-indigo-600 font-semibold text-sm h-9">
              <Link href={`/workspaces/${workspaceId}/projects/new`}>
                <Plus className="mr-1 size-3.5" />
                New Project
              </Link>
            </Button>
          )}
        </div>

        {projects.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-slate-300 bg-white p-10 text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-indigo-100">
              <FolderKanban className="size-7 text-indigo-600" />
            </div>
            <h3 className="mt-3 font-display text-lg font-bold text-slate-900">No projects yet</h3>
            <p className="mt-1 text-sm text-slate-600 max-w-md mx-auto">
              Create your first project to start organizing tasks and tracking progress.
            </p>
            {canEdit && (
              <Button asChild size="lg" className="mt-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 border-2 border-indigo-600 font-semibold">
                <Link href={`/workspaces/${workspaceId}/projects/new`}>
                  <Plus className="mr-2 size-5" />
                  Create Project
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => {
              const badge = statusBadges[project.status] || statusBadges.PLANNING
              return (
                <Link
                  key={project.id}
                  href={`/workspaces/${workspaceId}/projects/${project.id}`}
                  className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-indigo-200 hover:-translate-y-0.5"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-sm">
                        <FolderKanban className="size-5 text-white" />
                      </div>
                      <span className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                        badge.bg,
                        badge.text
                      )}>
                        {badge.label}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {project.name}
                      </h3>
                      {project.description && (
                        <p className="mt-1 text-xs text-slate-500 line-clamp-2">{project.description}</p>
                      )}
                      <p className="mt-2 text-xs text-slate-400">
                        {project.taskCount} task{project.taskCount !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">
                        {new Date(project.createdAt).toLocaleDateString()}
                      </span>
                      <span className="inline-flex items-center space-x-1 text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity font-semibold">
                        <span>Open</span>
                        <ArrowRight className="size-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* Activity Feed */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center space-x-2 mb-4">
          <Activity className="size-5 text-slate-500" />
          <h2 className="font-display text-lg font-bold text-slate-900">Recent Activity</h2>
        </div>

        {activities.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-slate-400">No recent activity in this workspace.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {activities.map((a) => (
              <div key={a.id} className="flex items-start space-x-3 pb-3 border-b border-slate-100 last:border-0">
                {a.user?.image ? (
                  <img src={a.user.image} alt="" className="size-7 rounded-full mt-0.5 flex-shrink-0" />
                ) : (
                  <div className="flex size-7 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-semibold text-[10px] flex-shrink-0 mt-0.5">
                    {a.user?.name?.charAt(0) || "?"}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700">
                    <span className="font-semibold text-slate-900">{a.user?.name || "Someone"}</span>{" "}
                    {a.message.toLowerCase()}
                  </p>
                  <div className="mt-0.5 flex items-center space-x-2 text-xs text-slate-400">
                    <span>{formatTimeAgo(a.createdAt)}</span>
                    {a.project && (
                      <>
                        <span>·</span>
                        <Link href={`/workspaces/${workspaceId}/projects/${a.project.id}`} className="hover:text-indigo-600 transition-colors">
                          {a.project.name}
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Types for the activity feed
type ActivityItem = {
  id: string
  action: string
  message: string
  user: { id: string; name: string | null; image: string | null } | null
  project: { id: string; name: string } | null
  task: { id: string; title: string } | null
  createdAt: string
}

function formatTimeAgo(dateStr: string): string {
  const now = Date.now()
  const date = new Date(dateStr).getTime()
  const diffMs = now - date
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}
