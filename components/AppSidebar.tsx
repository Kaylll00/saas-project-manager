"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import {
  LayoutDashboard,
  FolderKanban,
  LogOut,
  X,
  Menu,
  User,
  Plus,
  Mail,
  Moon,
  Sun,
  Bell,
  ExternalLink,
  Activity,
} from "lucide-react"
import { cn, formatTimeAgo } from "@/lib/utils"
import { useState, useEffect, useRef, useCallback } from "react"
import { useRealtimeNotifications, type RealtimeActivity } from "@/hooks/use-realtime-notifications"

type WorkspaceSummary = {
  id: string
  name: string
  slug: string
  role: string
}

type ActivityItem = {
  id: string
  action: string
  message: string
  user: { id: string; name: string | null; image: string | null } | null
  project: { id: string; name: string } | null
  workspace: { id: string; name: string; slug: string }
  createdAt: string
}

const NOTIFICATION_STORAGE_KEY = "lastNotificationCheck"

export default function AppSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [workspaces, setWorkspaces] = useState<WorkspaceSummary[]>([])
  const [darkMode, setDarkMode] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoadingCount, setIsLoadingCount] = useState(true)

  // Notification dropdown state
  const [showNotifications, setShowNotifications] = useState(false)
  const [notificationActivities, setNotificationActivities] = useState<ActivityItem[]>([])
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false)
  const notificationRef = useRef<HTMLDivElement>(null)

  // Real-time notifications: update badge when new activity arrives
  const handleRealtimeActivity = useCallback((newActivities: RealtimeActivity[]) => {
    setUnreadCount((prev) => prev + newActivities.length)
  }, [])

  useRealtimeNotifications(handleRealtimeActivity)

  // Load unread notification count
  useEffect(() => {
    async function fetchUnreadCount() {
      try {
        const lastCheck = localStorage.getItem(NOTIFICATION_STORAGE_KEY)
        const params = lastCheck ? `?since=${encodeURIComponent(lastCheck)}` : ""
        const res = await fetch(`/api/notifications/unread${params}`)
        const data = await res.json()
        if (res.ok) {
          setUnreadCount(data.count)
        }
      } catch {
        // Silently fail
      } finally {
        setIsLoadingCount(false)
      }
    }

    if (session?.user) {
      fetchUnreadCount()
      // Fallback: still poll every 60s as backup
      const interval = setInterval(fetchUnreadCount, 60000)
      return () => clearInterval(interval)
    }
  }, [session])

  // Mark notifications as read when visiting dashboard
  useEffect(() => {
    if (pathname === "/dashboard") {
      localStorage.setItem(NOTIFICATION_STORAGE_KEY, new Date().toISOString())
      setUnreadCount(0)
    }
  }, [pathname])

  // Close notification dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
        setShowNotifications(false)
      }
    }
    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showNotifications])

  const toggleNotifications = async () => {
    const newState = !showNotifications
    setShowNotifications(newState)

    if (newState) {
      setIsLoadingNotifications(true)
      try {
        const res = await fetch("/api/activity")
        const data = await res.json()
        if (res.ok) {
          setNotificationActivities(data.activities.slice(0, 5))
        }
      } catch {
        setNotificationActivities([])
      } finally {
        setIsLoadingNotifications(false)
      }

      // Mark as read when opening
      localStorage.setItem(NOTIFICATION_STORAGE_KEY, new Date().toISOString())
      setUnreadCount(0)
    }
  }

  useEffect(() => {
    const stored = localStorage.getItem("darkMode")
    if (stored === "true" || (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      setDarkMode(true)
      document.documentElement.classList.add("dark")
    }
  }, [])

  const toggleDarkMode = () => {
    const newMode = !darkMode
    setDarkMode(newMode)
    localStorage.setItem("darkMode", String(newMode))
    document.documentElement.classList.toggle("dark", newMode)
  }

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
      }
    }
    loadWorkspaces()
  }, [])

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard"
    }
    return pathname.startsWith(href)
  }

  const sidebarContent = (
    <div className="flex h-full flex-col bg-slate-900 text-white">
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-slate-800 px-6">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
            <div className="size-4 rounded-sm bg-white" />
          </div>
          <span className="font-display text-lg font-bold">Stride</span>
        </Link>
        <button
          onClick={() => setSidebarOpen(false)}
          className="flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors lg:hidden"
          aria-label="Close sidebar"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {/* Main nav items */}
        {[
          { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
          { label: "Workspaces", href: "/workspaces", icon: FolderKanban },
          { label: "Invitations", href: "/invitations", icon: Mail },
          { label: "Notifications", href: "/notifications", icon: Bell },
        ].map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                active
                  ? "bg-indigo-500/20 text-indigo-300 shadow-sm"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )}
            >
              <Icon className="size-5 flex-shrink-0" />
              <span>{item.label}</span>
            </Link>
          )
        })}

        {/* Notification bell with dropdown */}
        <div className="pt-1 relative" ref={notificationRef}>
          <button
            onClick={(e) => {
              e.stopPropagation()
              toggleNotifications()
            }}
            className={cn(
              "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
              showNotifications
                ? "bg-indigo-500/20 text-indigo-300 shadow-sm"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            )}
          >
            <div className="flex items-center space-x-3">
              <Bell className="size-5 flex-shrink-0" />
              <span>Notifications</span>
            </div>
            {!isLoadingCount && unreadCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-[20px] h-5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-1.5 text-[10px] font-bold text-white shadow-sm shadow-indigo-500/30">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {/* Notification dropdown */}
          {showNotifications && (
            <div className="mt-1 rounded-xl border border-slate-700 bg-slate-800 shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="px-4 py-3 border-b border-slate-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
                    <Activity className="size-4" />
                    <span>Recent Activity</span>
                  </h3>
                  <Link
                    href="/notifications"
                    onClick={() => {
                      setSidebarOpen(false)
                      setShowNotifications(false)
                    }}
                    className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors flex items-center space-x-1"
                  >
                    <span>View all</span>
                    <ExternalLink className="size-3" />
                  </Link>
                </div>
              </div>

              {/* Content */}
              <div className="max-h-72 overflow-y-auto">
                {isLoadingNotifications ? (
                  <div className="p-4 space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-start space-x-3 animate-pulse">
                        <div className="size-7 rounded-full bg-slate-700 flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 w-3/4 rounded bg-slate-700" />
                          <div className="h-2 w-1/3 rounded bg-slate-700" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : notificationActivities.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-slate-700">
                      <Bell className="size-5 text-slate-400" />
                    </div>
                    <p className="mt-3 text-sm text-slate-400">No recent activity</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Activity from your workspaces will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-700/50">
                    {notificationActivities.map((a) => (
                      <Link
                        key={a.id}
                        href={
                          a.project
                            ? `/workspaces/${a.workspace.id}/projects/${a.project.id}`
                            : `/workspaces/${a.workspace.id}`
                        }
                        onClick={() => {
                          setSidebarOpen(false)
                          setShowNotifications(false)
                        }}
                        className="flex items-start space-x-3 px-4 py-3 hover:bg-slate-700/50 transition-colors group"
                      >
                        {a.user?.image ? (
                          <img src={a.user.image} alt="" className="size-7 rounded-full mt-0.5 flex-shrink-0" />
                        ) : (
                          <div className="flex size-7 items-center justify-center rounded-full bg-indigo-500/30 text-indigo-300 font-semibold text-[10px] flex-shrink-0 mt-0.5">
                            {a.user?.name?.charAt(0) || "?"}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-300 leading-snug group-hover:text-white transition-colors">
                            <span className="font-semibold">{a.user?.name || "Someone"}</span>{" "}
                            {a.message.toLowerCase()}
                          </p>
                          <div className="mt-0.5 flex items-center space-x-1.5 text-[10px] text-slate-500">
                            <span>{formatTimeAgo(a.createdAt)}</span>
                            <span>·</span>
                            <span className="truncate max-w-[80px]">{a.workspace.name}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Workspace list */}
        {workspaces.length > 0 && (
          <div className="pt-4">
            <div className="mb-2 flex items-center justify-between px-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                My Workspaces
              </span>
              <Link
                href="/workspaces/new"
                className="flex size-5 items-center justify-center rounded text-slate-500 hover:bg-slate-800 hover:text-white transition-colors"
                aria-label="Create workspace"
              >
                <Plus className="size-3.5" />
              </Link>
            </div>
            <div className="space-y-0.5">
              {workspaces.map((ws) => {
                const href = `/workspaces/${ws.id}`
                const active = pathname === href || pathname.startsWith(`${href}/`)
                return (
                  <Link
                    key={ws.id}
                    href={href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                      active
                        ? "bg-indigo-500/20 text-indigo-300"
                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                    )}
                  >
                    <div className="flex size-5 items-center justify-center rounded bg-slate-800 text-[10px] font-bold text-slate-400">
                      {ws.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="truncate">{ws.name}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Dark mode toggle */}
      <div className="border-t border-slate-800 px-4 py-2">
        <button
          onClick={toggleDarkMode}
          className="flex w-full items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-all duration-200"
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? <Sun className="size-5" /> : <Moon className="size-5" />}
          <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
        </button>
      </div>

      {/* User section */}
      <div className="border-t border-slate-800 p-4">
        <div className="flex items-center space-x-3">
          {session?.user?.image ? (
            <img
              src={session.user.image}
              alt={session.user.name || "User"}
              className="size-9 rounded-full ring-2 ring-slate-700"
            />
          ) : (
            <div className="flex size-9 items-center justify-center rounded-full bg-indigo-500 ring-2 ring-slate-700">
              <User className="size-4 text-white" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <Link
              href="/settings"
              onClick={() => setSidebarOpen(false)}
              className="block truncate text-sm font-medium text-white hover:text-indigo-300 transition-colors"
            >
              {session?.user?.name || "User"}
            </Link>
            <p className="truncate text-xs text-slate-400">
              {session?.user?.email || ""}
            </p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-red-400 transition-colors"
            aria-label="Sign out"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar drawer */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:hidden",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        {sidebarContent}
      </div>

      {/* Mobile hamburger button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed left-4 top-3 z-30 flex size-10 items-center justify-center rounded-lg bg-white text-slate-700 shadow-md border border-slate-200 transition-colors hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700 lg:hidden"
        aria-label="Open sidebar"
      >
        <Menu className="size-5" />
      </button>
    </>
  )
}
