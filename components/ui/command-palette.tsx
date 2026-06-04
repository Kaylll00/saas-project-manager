"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { Search, FolderKanban, FileText, ListTodo, ArrowRight, Command } from "lucide-react"
import { cn } from "@/lib/utils"

type SearchResult = {
  id: string
  label: string
  description: string
  href: string
  type: "workspace" | "project" | "task"
  icon: typeof FolderKanban
}

export default function CommandPalette() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [allItems, setAllItems] = useState<SearchResult[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)

  // Load all navigable items
  useEffect(() => {
    async function loadItems() {
      setIsLoading(true)
      try {
        // Load workspaces and their projects/tasks
        const wsRes = await fetch("/api/workspaces")
        const wsData = await wsRes.json()
        const items: SearchResult[] = []

        if (wsRes.ok && wsData.workspaces) {
          for (const ws of wsData.workspaces) {
            items.push({
              id: `ws-${ws.id}`,
              label: ws.name,
              description: `${ws.memberCount} members · ${ws.projectCount} projects`,
              href: `/workspaces/${ws.id}`,
              type: "workspace",
              icon: FolderKanban,
            })

            // Load projects for this workspace
            try {
              const projRes = await fetch(`/api/workspaces/${ws.id}/projects`)
              const projData = await projRes.json()
              if (projRes.ok && projData.projects) {
                for (const proj of projData.projects) {
                  items.push({
                    id: `proj-${proj.id}`,
                    label: proj.name,
                    description: `${ws.name} · ${proj.taskCount} tasks`,
                    href: `/workspaces/${ws.id}/projects/${proj.id}`,
                    type: "project",
                    icon: FileText,
                  })

                  // Load tasks for this project (limit to 20 per project)
                  try {
                    const taskRes = await fetch(`/api/workspaces/${ws.id}/projects/${proj.id}/tasks`)
                    const taskData = await taskRes.json()
                    if (taskRes.ok && taskData.tasks) {
                      for (const task of taskData.tasks.slice(0, 20)) {
                        items.push({
                          id: `task-${task.id}`,
                          label: task.title,
                          description: `${proj.name} · ${task.status}`,
                          href: `/workspaces/${ws.id}/projects/${proj.id}/tasks/${task.id}`,
                          type: "task",
                          icon: ListTodo,
                        })
                      }
                    }
                  } catch {
                    // Skip tasks if API fails
                  }
                }
              }
            } catch {
              // Skip projects if API fails
            }
          }
        }

        setAllItems(items)
        setResults(items)
      } catch {
        setAllItems([])
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }

    if (isOpen) {
      loadItems()
    }
  }, [isOpen])

  // Listen for Cmd+K / Ctrl+K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      }
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false)
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen])

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
      setQuery("")
      setSelectedIndex(0)
    }
  }, [isOpen])

  // Filter results based on query
  useEffect(() => {
    if (!query.trim()) {
      setResults(allItems)
      setSelectedIndex(0)
      return
    }

    const lower = query.toLowerCase()
    const filtered = allItems.filter(
      (item) =>
        item.label.toLowerCase().includes(lower) ||
        item.description.toLowerCase().includes(lower)
    )
    setResults(filtered)
    setSelectedIndex(0)
  }, [query, allItems])

  const navigate = useCallback(
    (href: string) => {
      setIsOpen(false)
      router.push(href)
    },
    [router]
  )

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((prev) => Math.max(prev - 1, 0))
    } else if (e.key === "Enter" && results[selectedIndex]) {
      e.preventDefault()
      navigate(results[selectedIndex].href)
    }
  }

  if (!isOpen) return null

  const hasNoResults = !isLoading && results.length === 0 && query.trim()

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="fixed left-1/2 top-[15%] z-[201] w-full max-w-xl -translate-x-1/2"
      >
        <div className="rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-800 overflow-hidden">
          {/* Search input */}
          <div className="flex items-center border-b border-slate-200 px-4 dark:border-slate-700">
            <Search className="size-5 text-slate-400 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search workspaces, projects, tasks..."
              className="flex-1 h-14 bg-transparent px-3 text-base font-medium text-slate-900 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500"
              autoComplete="off"
              spellCheck={false}
            />
            <kbd className="hidden sm:inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[11px] font-medium text-slate-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-400">
              <Command className="size-3 mr-0.5" />
              K
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-80 overflow-y-auto p-2">
            {isLoading ? (
              <div className="space-y-1 p-2" role="status" aria-label="Loading search results">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center space-x-3 rounded-lg p-2 animate-pulse">
                    <div className="size-8 rounded-lg bg-slate-200 dark:bg-slate-700" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-700" />
                      <div className="h-3 w-1/2 rounded bg-slate-100 dark:bg-slate-700/50" />
                    </div>
                  </div>
                ))}
              </div>
            ) : hasNoResults ? (
              <div className="py-8 text-center">
                <p className="text-sm text-slate-500 dark:text-slate-400">No results found</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  Try a different search term
                </p>
              </div>
            ) : results.length === 0 && !query ? (
              <div className="py-6 text-center">
                <p className="text-sm text-slate-400 dark:text-slate-500">
                  Start typing to search...
                </p>
              </div>
            ) : (
              <div className="space-y-0.5">
                {/* Group by type */}
                {(["workspace", "project", "task"] as const).map((type) => {
                  const typeResults = results.filter((r) => r.type === type)
                  if (typeResults.length === 0) return null

                  const typeLabels = {
                    workspace: "Workspaces",
                    project: "Projects",
                    task: "Tasks",
                  }

                  return (
                    <div key={type}>
                      <div className="px-2 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        {typeLabels[type]}
                      </div>
                      {typeResults.map((item) => {
                        const idx = results.indexOf(item)
                        const Icon = item.icon
                        return (
                          <button
                            key={item.id}
                            onClick={() => navigate(item.href)}
                            onMouseEnter={() => setSelectedIndex(idx)}
                            className={cn(
                              "flex w-full items-center space-x-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                              idx === selectedIndex
                                ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300"
                                : "text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700/50"
                            )}
                          >
                            <div
                              className={cn(
                                "flex size-8 items-center justify-center rounded-lg",
                                item.type === "workspace"
                                  ? "bg-gradient-to-br from-indigo-500 to-purple-600"
                                  : item.type === "project"
                                  ? "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400"
                                  : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
                              )}
                            >
                              <Icon className="size-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{item.label}</p>
                              <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                                {item.description}
                              </p>
                            </div>
                            {idx === selectedIndex && (
                              <ArrowRight className="size-4 flex-shrink-0 text-indigo-500" />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-200 px-4 py-2 dark:border-slate-700">
            <div className="flex items-center space-x-4 text-[11px] text-slate-400 dark:text-slate-500">
              <span className="flex items-center space-x-1">
                <kbd className="inline-flex items-center rounded border border-slate-300 bg-slate-50 px-1 font-medium text-slate-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-400">↑↓</kbd>
                <span>Navigate</span>
              </span>
              <span className="flex items-center space-x-1">
                <kbd className="inline-flex items-center rounded border border-slate-300 bg-slate-50 px-1 font-medium text-slate-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-400">↵</kbd>
                <span>Open</span>
              </span>
              <span className="flex items-center space-x-1">
                <kbd className="inline-flex items-center rounded border border-slate-300 bg-slate-50 px-1 font-medium text-slate-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-400">Esc</kbd>
                <span>Close</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
