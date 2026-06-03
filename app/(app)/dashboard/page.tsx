"use client"

import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Plus, FolderKanban, Users, CheckCircle2, Clock } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

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

export default function DashboardPage() {
  const { data: session } = useSession()
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
        // Silently fail - empty state will show
      } finally {
        setIsLoading(false)
      }
    }
    loadWorkspaces()
  }, [])

  const totalMembers = workspaces.reduce((sum, ws) => sum + ws.memberCount, 0)
  const totalTasks = workspaces.reduce((sum, ws) => sum + ws.taskCount, 0)

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 sm:text-3xl">
            Welcome{session?.user?.name ? `, ${session.user.name}` : ""} 👋
          </h1>
          <p className="mt-1 text-slate-600">
            Here&apos;s what&apos;s happening across your workspaces.
          </p>
        </div>
        <Button asChild className="hidden sm:inline-flex bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 border-2 border-indigo-600 font-semibold">
          <Link href="/workspaces/new">
            <Plus className="mr-1.5 size-4" />
            New Workspace
          </Link>
        </Button>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Active Workspaces", value: workspaces.length, icon: FolderKanban, color: "text-indigo-600", bg: "bg-indigo-100" },
          { label: "Team Members", value: totalMembers, icon: Users, color: "text-purple-600", bg: "bg-purple-100" },
          { label: "Total Tasks", value: totalTasks, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-100" },
          { label: "Workspaces", value: workspaces.length, icon: Clock, color: "text-amber-600", bg: "bg-amber-100" },
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex items-center space-x-3">
                <div className={cn("flex size-11 items-center justify-center rounded-lg", stat.bg)}>
                  <Icon className={cn("size-5", stat.color)} />
                </div>
                <div>
                  <p className="text-sm text-slate-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {isLoading ? (
                      <span className="inline-block size-5 animate-pulse rounded bg-slate-200" />
                    ) : (
                      stat.value
                    )}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Workspaces list or empty state */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-slate-200" />
          ))}
        </div>
      ) : workspaces.length > 0 ? (
        <div className="space-y-4">
          <h2 className="font-display text-lg font-bold text-slate-900">Your Workspaces</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {workspaces.map((ws) => (
              <Link
                key={ws.id}
                href={`/workspaces/${ws.id}`}
                className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-indigo-200 hover:-translate-y-0.5"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                      <FolderKanban className="size-5 text-white" />
                    </div>
                    <span className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                      {ws.role}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {ws.name}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      {ws.memberCount} member{ws.memberCount !== 1 ? "s" : ""} · {ws.projectCount} project{ws.projectCount !== 1 ? "s" : ""} · {ws.taskCount} task{ws.taskCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        /* Empty state */
        <div className="rounded-xl border-2 border-dashed border-slate-300 bg-white p-12 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-indigo-100">
            <FolderKanban className="size-8 text-indigo-600" />
          </div>
          <h2 className="mt-4 font-display text-xl font-bold text-slate-900">
            Get started with Stride
          </h2>
          <p className="mt-2 text-slate-600 max-w-md mx-auto">
            Create your first workspace to start managing projects, assigning tasks, and collaborating with your team.
          </p>
          <Button asChild size="lg" className="mt-6 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 border-2 border-indigo-600 font-semibold shadow-lg">
            <Link href="/workspaces/new">
              <Plus className="mr-2 size-5" />
              Create Workspace
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}
