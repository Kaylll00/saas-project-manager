"use client"

import { Button } from "@/components/ui/button"
import { Plus, FolderKanban, Users, ArrowRight } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { SkeletonCard } from "@/components/ui/skeleton"
import CreateWorkspaceModal from "@/components/CreateWorkspaceModal"

type WorkspaceSummary = {
  id: string
  name: string
  slug: string
  role: string
  projectCount: number
  memberCount: number
  taskCount: number
  createdAt: string
}

export default function WorkspacesPage() {
  const [workspaces, setWorkspaces] = useState<WorkspaceSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadWorkspaces() {
      try {
        const res = await fetch("/api/workspaces")
        const data = await res.json()
        if (res.ok) {
          setWorkspaces(data.workspaces)
        }
      } catch {
        // Silently fail
      } finally {
        setIsLoading(false)
      }
    }
    loadWorkspaces()
  }, [])

  const roleColors: Record<string, string> = {
    OWNER: "bg-primary/10 text-primary",
    ADMIN: "bg-secondary text-secondary-foreground",
    MEMBER: "bg-secondary text-secondary-foreground",
    VIEWER: "bg-muted text-muted-foreground",
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
            Workspaces
          </h1>
          <p className="mt-1 text-muted-foreground">
            All your workspaces in one place. Create, manage, and switch between them.
          </p>
        </div>
        <CreateWorkspaceModal
          trigger={(open) => (
            <Button onClick={open} className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-lg">
              <Plus className="mr-1.5 size-4" />
              New Workspace
            </Button>
          )}
        />
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : workspaces.length === 0 ? (
        /* Empty state */
        <div className="rounded-xl border-2 border-dashed border-border bg-card p-16 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-secondary">
            <FolderKanban className="size-8 text-primary" />
          </div>
          <h2 className="mt-4 font-display text-xl font-bold text-foreground">
            No workspaces yet
          </h2>
          <p className="mt-2 text-muted-foreground max-w-md mx-auto">
            Workspaces are where your teams collaborate. Create one to start managing projects and tasks.
          </p>
          <CreateWorkspaceModal
            trigger={(open) => (
              <Button onClick={open} size="lg" className="mt-6 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-lg">
              <Plus className="mr-2 size-5" />
              Create Your First Workspace
              </Button>
            )}
          />
        </div>
      ) : (
        /* Workspace grid */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {workspaces.map((ws) => (
            <Link
              key={ws.id}
              href={`/workspaces/${ws.id}`}
              className="group relative rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:-translate-y-1 hover:border-primary"
            >
              <div className="space-y-4">
                {/* Icon + role badge */}
                <div className="flex items-start justify-between">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10">
                    <FolderKanban className="size-6 text-primary" />
                  </div>
                  <span className={cn(
                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                    roleColors[ws.role] || "bg-muted text-muted-foreground"
                  )}>
                    {ws.role}
                  </span>
                </div>

                {/* Name + stats */}
                <div>
                  <h3 className="font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                    {ws.name}
                  </h3>
                  <p className="mt-2 flex items-center space-x-3 text-sm text-muted-foreground">
                    <span className="flex items-center space-x-1">
                      <Users className="size-3.5" />
                      <span>{ws.memberCount}</span>
                    </span>
                    <span>{ws.projectCount} project{ws.projectCount !== 1 ? "s" : ""}</span>
                    <span>{ws.taskCount} task{ws.taskCount !== 1 ? "s" : ""}</span>
                  </p>
                </div>

                {/* View link */}
                <div className="flex items-center space-x-1 text-sm font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Open workspace</span>
                  <ArrowRight className="size-3.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
