"use client"

import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Plus, FolderKanban, Users, CheckCircle2, Clock, Loader2, ChevronDown } from "lucide-react"
import Link from "next/link"
import { cn, formatTimeAgo } from "@/lib/utils"
import { useEffect, useState, useCallback, useRef } from "react"
import { SkeletonStatsCard, SkeletonCard, SkeletonActivityItem } from "@/components/ui/skeleton"
import AnimatedSection from "@/components/ui/animated-section"
import { useRealtimeNotifications, type RealtimeActivity } from "@/hooks/use-realtime-notifications"
import { fetchWithCache } from "@/hooks/use-data-cache"
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

type ActivityItem = {
  id: string
  action: string
  message: string
  user: { id: string; name: string | null; image: string | null } | null
  project: { id: string; name: string } | null
  task: { id: string; title: string } | null
  workspace: { id: string; name: string; slug: string }
  createdAt: string
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [workspaces, setWorkspaces] = useState<WorkspaceSummary[]>([])
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activityCursor, setActivityCursor] = useState<string | null>(null)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const loadingStartedAt = useRef(0)

  // Real-time notifications: prepend new activity as it arrives
  const handleRealtimeActivity = useCallback((newActivities: RealtimeActivity[]) => {
    setActivities((prev) => {
      const existingIds = new Set(prev.map((a) => a.id))
      const fresh = newActivities.filter((a) => !existingIds.has(a.id))
      return [...fresh, ...prev]
    })
  }, [])

  useRealtimeNotifications(handleRealtimeActivity)

  useEffect(() => {
    loadingStartedAt.current = Date.now()

    async function loadDashboard() {
      try {
        // Fetch both in parallel with caching for faster back-navigation
        const [wsData, actData] = await Promise.all([
          fetchWithCache<{ workspaces: WorkspaceSummary[] }>("/api/workspaces"),
          fetchWithCache<{ activities: ActivityItem[]; nextCursor: string | null }>("/api/activity?limit=10"),
        ])

        setWorkspaces(wsData.workspaces)
        setActivities(actData.activities)
        setActivityCursor(actData.nextCursor)
      } catch {
        // Silently fail - empty state will show
      } finally {
        // Ensure minimum loading duration to prevent skeleton flashing
        const elapsed = Date.now() - loadingStartedAt.current
        const remaining = Math.max(0, 200 - elapsed)
        if (remaining > 0) {
          setTimeout(() => setIsLoading(false), remaining)
        } else {
          setIsLoading(false)
        }
      }
    }

    loadDashboard()
  }, [])

  const loadMoreActivity = async () => {
    if (!activityCursor || isLoadingMore) return
    setIsLoadingMore(true)
    try {
      const res = await fetch(`/api/activity?cursor=${encodeURIComponent(activityCursor)}&limit=10`)
      const data = await res.json()
      if (res.ok) {
        setActivities((prev) => [...prev, ...data.activities])
        setActivityCursor(data.nextCursor)
      }
    } catch {
      // Silently fail
    } finally {
      setIsLoadingMore(false)
    }
  }

  const totalMembers = workspaces.reduce((sum, ws) => sum + ws.memberCount, 0)
  const totalTasks = workspaces.reduce((sum, ws) => sum + ws.taskCount, 0)

  const stats = [
    { label: "Active Workspaces", value: workspaces.length, icon: FolderKanban, color: "text-blue-600", bg: "bg-blue-100" },
    { label: "Team Members", value: totalMembers, icon: Users, color: "text-purple-600", bg: "bg-purple-100" },
    { label: "Total Tasks", value: totalTasks, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-100" },
    { label: "Workspaces", value: workspaces.length, icon: Clock, color: "text-orange-600", bg: "bg-orange-100" },
  ]

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8">
        {/* Page header */}
      <AnimatedSection variant="fade-up">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
              Welcome{session?.user?.name ? `, ${session.user.name}` : ""} 👋
            </h1>
            <p className="mt-1 text-muted-foreground">
              Here&apos;s what&apos;s happening across your workspaces.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <CreateWorkspaceModal
              trigger={(open) => (
                <Button onClick={open} className="h-11 px-5 font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90">
                  <Plus className="mr-1.5 size-4" />
                  New Workspace
                </Button>
              )}
            />
          </div>
        </div>
      </AnimatedSection>

      {/* Quick stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <AnimatedSection key={stat.label} variant="slide-up" delay={idx * 75}>
              <div className="flex min-h-[118px] rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                {isLoading ? (
                  <SkeletonStatsCard className="w-full border-0 p-0 shadow-none" />
                ) : (
                  <div className="flex w-full items-center space-x-3">
                    <div className={cn("flex size-11 items-center justify-center rounded-lg", stat.bg)}>
                      <Icon className={cn("size-5", stat.color)} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    </div>
                  </div>
                )}
              </div>
            </AnimatedSection>
          )
        })}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Workspaces list or empty state */}
        <AnimatedSection variant="fade-up" delay={100} className="lg:col-span-2 space-y-4">
          <h2 className="font-display text-lg font-bold text-foreground">Your Workspaces</h2>

          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {[1, 2].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : workspaces.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {workspaces.map((ws) => (
                <Link
                  key={ws.id}
                  href={`/workspaces/${ws.id}`}
                  className="group flex min-h-[154px] rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-md"
                >
                  <div className="flex w-full flex-col justify-between gap-5">
                    <div className="flex items-center justify-between">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                        <FolderKanban className="size-5 text-white" />
                      </div>
                      <span className="inline-flex max-w-[9rem] items-center truncate rounded-full bg-secondary px-2.5 py-0.5 text-xs font-bold text-secondary-foreground">
                        {ws.role}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-lg font-bold text-foreground transition-colors group-hover:text-primary">
                        {ws.name}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {ws.memberCount} member{ws.memberCount !== 1 ? "s" : ""} · {ws.projectCount} project{ws.projectCount !== 1 ? "s" : ""} · {ws.taskCount} task{ws.taskCount !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            /* Empty state */
            <div className="rounded-xl border-2 border-dashed border-border bg-card p-12 text-center">
              <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-secondary">
                <FolderKanban className="size-8 text-primary" />
              </div>
              <h2 className="mt-4 font-display text-xl font-bold text-foreground">
                Get started with Stride
              </h2>
              <p className="mt-2 text-muted-foreground max-w-md mx-auto">
                Create your first workspace to start managing projects, assigning tasks, and collaborating with your team.
              </p>
              <CreateWorkspaceModal
                trigger={(open) => (
                  <Button onClick={open} size="lg" className="mt-6 bg-primary font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90">
                  <Plus className="mr-2 size-5" />
                  Create Workspace
                  </Button>
                )}
              />
            </div>
          )}
        </AnimatedSection>

        {/* Activity Feed / Notifications sidebar */}
        <AnimatedSection variant="fade-up" delay={200}>
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm lg:sticky lg:top-8 lg:self-start">
            <div className="flex items-center space-x-2 mb-5">
              <Clock className="size-5 text-primary" />
              <h2 className="font-display text-lg font-bold text-foreground">Recent Activity</h2>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <SkeletonActivityItem key={i} className="border-b-0 pb-0" />
                ))}
              </div>
            ) : activities.length === 0 ? (
              <div className="py-8 text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-secondary">
                  <Clock className="size-6 text-muted-foreground" />
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  No recent activity yet.
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Activity from your workspaces will appear here.
                </p>
              </div>
            ) : (
              <div className="max-h-[500px] space-y-4 overflow-y-auto pr-1">
                {activities.map((a) => (
                  <div key={a.id} className="flex items-start space-x-3 border-b border-border pb-4 last:border-0 last:pb-0">
                    {a.user?.image ? (
                      <img src={a.user.image} alt="" className="size-7 rounded-full mt-0.5 flex-shrink-0" />
                    ) : (
                      <div className="mt-0.5 flex size-9 flex-shrink-0 items-center justify-center rounded-full bg-secondary text-[11px] font-semibold text-primary">
                        {a.user?.name?.slice(0, 2).toUpperCase() || "?"}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-snug text-foreground">
                        <span className="font-bold text-foreground">{a.user?.name || "Someone"}</span>{" "}
                        {a.message.toLowerCase()}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                        <span>{formatTimeAgo(a.createdAt)}</span>
                        <span>·</span>
                        <Link
                          href={`/workspaces/${a.workspace.id}`}
                          className="truncate max-w-[120px] transition-colors hover:text-primary"
                        >
                          {a.workspace.name}
                        </Link>
                        {a.project && (
                          <>
                            <span>·</span>
                            <Link
                              href={`/workspaces/${a.workspace.id}/projects/${a.project.id}`}
                              className="truncate max-w-[120px] transition-colors hover:text-primary"
                            >
                              {a.project.name}
                            </Link>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {/* Load More button */}
                {activityCursor && (
                  <div className="pt-2 text-center">
                    <button
                      onClick={loadMoreActivity}
                      disabled={isLoadingMore}
                      className="inline-flex items-center space-x-1 text-xs font-semibold text-primary transition-colors hover:text-primary/80 disabled:opacity-50"
                    >
                      {isLoadingMore ? (
                        <Loader2 className="size-3 animate-spin" />
                      ) : (
                        <ChevronDown className="size-3" />
                      )}
                      <span>{isLoadingMore ? "Loading..." : "Load more"}</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </AnimatedSection>
      </div>
    </div>
  )
}
