"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { FolderKanban, Loader2, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"

type CreateWorkspaceModalProps = {
  trigger: (open: () => void) => ReactNode
  onCreated?: () => void
}

export default function CreateWorkspaceModal({ trigger, onCreated }: CreateWorkspaceModalProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)

  const close = () => {
    if (isLoading) return
    setIsOpen(false)
    setName("")
    setDescription("")
    setError(null)
  }

  useEffect(() => {
    if (!isOpen) return

    const focusTimer = window.setTimeout(() => nameInputRef.current?.focus(), 0)
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isLoading) {
        setIsOpen(false)
        setName("")
        setDescription("")
        setError(null)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => {
      window.clearTimeout(focusTimer)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, isLoading])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to create workspace")
      }

      toast("Workspace created successfully!", "success")
      setIsOpen(false)
      setIsLoading(false)
      onCreated?.()
      router.push(`/workspaces/${data.workspace.id}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
      setIsLoading(false)
    }
  }

  return (
    <>
      {trigger(() => setIsOpen(true))}

      {isOpen && (
        <div className="fixed inset-0 z-[220] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close create workspace dialog"
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={close}
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-workspace-title"
            className="relative z-[221] w-full max-w-lg overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <FolderKanban className="size-5 text-primary" />
                </div>
                <div>
                  <h2 id="create-workspace-title" className="font-display text-xl font-bold text-foreground">
                    Create a workspace
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Workspaces are where your team collaborates on projects and tasks.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={close}
                disabled={isLoading}
                className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
                aria-label="Close modal"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 px-6 py-5">
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <label className="block space-y-2">
                <span className="text-sm font-semibold text-foreground">
                  Workspace name <span className="text-red-500">*</span>
                </span>
                <input
                  ref={nameInputRef}
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g., Marketing Team, Product Design"
                  className="flex h-12 w-full items-center rounded-lg border-2 border-border bg-background px-4 text-sm font-medium text-foreground shadow-sm outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10"
                  required
                  maxLength={100}
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-semibold text-foreground">Description (optional)</span>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="What's this workspace for?"
                  rows={3}
                  className="flex w-full resize-none rounded-lg border-2 border-border bg-background px-4 py-3 text-sm font-medium text-foreground shadow-sm outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-4 focus:ring-primary/10"
                  maxLength={500}
                />
              </label>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={close}
                  disabled={isLoading}
                  className="h-10 font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || !name.trim()}
                  className="h-10 bg-gradient-to-r from-indigo-500 to-purple-600 font-semibold text-white shadow-lg hover:from-indigo-600 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 size-4" />
                      Create Workspace
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
