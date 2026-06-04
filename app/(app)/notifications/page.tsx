"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Bell,
  Loader2,
  ChevronDown,
  Activity,
  Settings,
  ExternalLink,
} from "lucide-react"
import Link from "next/link"
import { cn, formatTimeAgo } from "@/lib/utils"
import { useRealtimeNotifications, type RealtimeActivity } from "@/hooks/use-realtime-notifications"
import { SkeletonActivityItem } from "@/components/ui/skeleton"

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

const NOTIFICATION_STORAGE_KEY = "lastNotificationCheck"

export default function NotificationsFeedPage() {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [cursor, setCursor] = useState<string | null>(null)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const lastCheckRef = useRef<string | null>(null)

  // Get the last check time to identify "new" items
  useEffect(() => {
    lastCheckRef.current = localStorage.getItem(NOTIFICATION_STORAGE_KEY)
  }, [])

  // Real-time updates: prepend new activities as they arrive
  const handleRealtimeActivity = useCallback((newActivities: RealtimeActivity[]) => {
    setActivities((prev) => {
      const existingIds = new Set(prev.map((a) => a.id))
      const fresh = newActivities.filter((a) => !existingIds.has(a.id))
      return [...fresh, ...prev]
    })
  }, [])

  useRealtimeNotifications(handleRealtimeActivity)

  // Load initial batch
  useEffect(() => {
    async function loadInitial() {
      setIsLoading(true)
      try {
        const res = await fetch("/api/activity?limit=20")
        const data = await res.json()
        if (res.ok) {
          setActivities(data.activities)
          setCursor(data.nextCursor)
        }
      } catch {
        // silently fail
      } finally {
        setIsLoading(false)
      }
    }
    loadInitial()
  }, [])

  const loadMore = async () => {
    if (!cursor || isLoadingMore) return
    setIsLoadingMore(true)
    try {
      const res = await fetch(`/api/activity?cursor=${encodeURIComponent(cursor)}&limit=20`)
      const data = await res.json()
      if (res.ok) {
        setActivities((prev) => [...prev, ...data.activities])
        setCursor(data.nextCursor)
      }
    } catch {
      // silently fail
    } finally {
      setIsLoadingMore(false)
    }
  }

  const isNew = (createdAt: string) => {
    if (!lastCheckRef.current) return false
    return new Date(createdAt).getTime() > new Date(lastCheckRef.current).getTime()
  }

  // Mark as read on mount
  useEffect(() => {
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, new Date().toISOString())
  }, [])

  // Group activities by date
  const grouped = activities.reduce<Record<string, ActivityItem[]>>((acc, a) => {
    const date = new Date(a.createdAt).toLocaleDateString()
    if (!acc[date]) acc[date] = []
    acc[date].push(a)
    return acc
  }, {})

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20">
            <Bell className="size-5 text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900">Notifications</h1>
            <p className="text-sm text-slate-500">Recent activity across your workspaces</p>
          </div>
        </div>
        <Button asChild variant="outline" className="border-2 border-slate-300 font-semibold text-sm">
          <Link href="/notifications/settings">
            <Settings className="mr-1.5 size-4" />
            Preferences
          </Link>
        </Button>
      </div>

      {/* Feed */}
      {isLoading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <SkeletonActivityItem key={i} />
            ))}
          </div>
        </div>
      ) : activities.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-slate-300 bg-white p-16 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-indigo-100">
            <Activity className="size-8 text-indigo-600" />
          </div>
          <h2 className="mt-4 font-display text-xl font-bold text-slate-900">No activity yet</h2>
          <p className="mt-2 text-slate-600 max-w-md mx-auto">
            Activity from your workspaces — task updates, comments, new projects, and more — will appear here in real time.
          </p>
          <Button asChild size="lg" className="mt-6 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 border-2 border-indigo-600 font-semibold shadow-lg">
            <Link href="/workspaces">
              Go to Workspaces
            </Link>
          </Button>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm divide-y divide-slate-100">
          {Object.entries(grouped).map(([date, items]) => (
            <div key={date}>
              {/* Date heading */}
              <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm px-6 py-3 border-b border-slate-100">
                <time className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {date === new Date().toLocaleDateString()
                    ? "Today"
                    : date === new Date(Date.now() - 86400000).toLocaleDateString()
                      ? "Yesterday"
                      : date}
                </time>
              </div>

              {/* Activity items */}
              {items.map((a) => (
                <Link
                  key={a.id}
                  href={
                    a.task
                      ? `/workspaces/${a.workspace.id}/projects/${a.project!.id}/tasks/${a.task.id}`
                      : a.project
                        ? `/workspaces/${a.workspace.id}/projects/${a.project.id}`
                        : `/workspaces/${a.workspace.id}`
                  }
                  className={cn(
                    "flex items-start space-x-4 px-6 py-4 transition-colors hover:bg-slate-50 group",
                    isNew(a.createdAt) && "bg-indigo-50/50 hover:bg-indigo-50/80"
                  )}
                >
                  {/* Avatar */}
                  {a.user?.image ? (
                    <img src={a.user.image} alt="" className="size-9 rounded-full mt-0.5 flex-shrink-0" />
                  ) : (
                    <div className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold text-sm flex-shrink-0 mt-0.5">
                      {a.user?.name?.charAt(0) || "?"}
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm text-slate-700 leading-snug">
                        <span className="font-semibold text-slate-900">{a.user?.name || "Someone"}</span>{" "}
                        {a.message.toLowerCase()}
                      </p>
                      {isNew(a.createdAt) && (
                        <span className="inline-flex items-center rounded-full bg-indigo-500 px-1.5 py-0.5 text-[10px] font-bold text-white flex-shrink-0 mt-0.5">
                          NEW
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-400">
                      <span>{formatTimeAgo(a.createdAt)}</span>
                      <span>·</span>
                      <span className="inline-flex items-center space-x-0.5 text-indigo-600 font-medium">
                        <span>{a.workspace.name}</span>
                        {a.project && (
                          <>
                            <span className="text-slate-300">/</span>
                            <span>{a.project.name}</span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Arrow indicator */}
                  <ExternalLink className="size-4 text-slate-300 group-hover:text-indigo-500 transition-colors flex-shrink-0 mt-1 opacity-0 group-hover:opacity-100" />
                </Link>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Load more */}
      {cursor && !isLoading && (
        <div className="text-center">
          <button
            onClick={loadMore}
            disabled={isLoadingMore}
            className="inline-flex items-center space-x-1.5 text-sm font-semibold text-indigo-600 hover:text-purple-600 transition-colors disabled:opacity-50"
          >
            {isLoadingMore ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ChevronDown className="size-4" />
            )}
            <span>{isLoadingMore ? "Loading..." : "Load more"}</span>
          </button>
        </div>
      )}
    </div>
  )
}
