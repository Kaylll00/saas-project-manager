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
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"

type WorkspaceSummary = {
  id: string
  name: string
  slug: string
  role: string
}

export default function AppSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [workspaces, setWorkspaces] = useState<WorkspaceSummary[]>([])
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    // Check localStorage and system preference on mount
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

  const currentWorkspaceId = pathname.match(/^\/workspaces\/([^/]+)/)?.[1]

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
            <p className="truncate text-sm font-medium text-white">
              {session?.user?.name || "User"}
            </p>
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
        className="fixed left-4 top-3 z-30 flex size-10 items-center justify-center rounded-lg bg-white text-slate-700 shadow-md border border-slate-200 transition-colors hover:bg-slate-50 lg:hidden"
        aria-label="Open sidebar"
      >
        <Menu className="size-5" />
      </button>
    </>
  )
}
