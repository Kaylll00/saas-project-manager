"use client"

import { useParams, useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2, Save, Trash2 } from "lucide-react"
import Link from "next/link"

type WorkspaceData = {
  id: string
  name: string
  slug: string
  description: string | null
  myRole: string
}

export default function WorkspaceSettingsPage() {
  const params = useParams()
  const router = useRouter()
  const workspaceId = params.workspaceId as string

  const [workspace, setWorkspace] = useState<WorkspaceData | null>(null)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    async function loadWorkspace() {
      try {
        const res = await fetch(`/api/workspaces/${workspaceId}`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Failed to load workspace")
        setWorkspace(data.workspace)
        setName(data.workspace.name)
        setDescription(data.workspace.description || "")
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong")
      } finally {
        setIsLoading(false)
      }
    }
    loadWorkspace()
  }, [workspaceId])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsSaving(true)
    setError(null)

    try {
      const res = await fetch(`/api/workspaces/${workspaceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description: description.trim() || null }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to update workspace")

      toast("Workspace updated successfully!", "success")
      setWorkspace((prev) => prev ? { ...prev, name: name.trim() } : prev)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    setError(null)

    try {
      const res = await fetch(`/api/workspaces/${workspaceId}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to delete workspace")
      }

      router.push("/workspaces")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="h-4 w-36 animate-pulse rounded bg-slate-200 mb-6" />
        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="space-y-3 mb-8">
            <div className="h-7 w-48 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-64 animate-pulse rounded bg-slate-200" />
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
              <div className="h-12 w-full animate-pulse rounded-lg bg-slate-200" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-36 animate-pulse rounded bg-slate-200" />
              <div className="h-24 w-full animate-pulse rounded-lg bg-slate-200" />
            </div>
            <div className="h-10 w-36 animate-pulse rounded-lg bg-slate-200" />
          </div>
        </div>
      </div>
    )
  }

  if (error && !workspace) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-red-600 font-medium">{error}</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/workspaces">Back to Workspaces</Link>
        </Button>
      </div>
    )
  }

  if (workspace?.myRole !== "OWNER" && workspace?.myRole !== "ADMIN") {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center">
        <p className="text-amber-700 font-medium">You don't have permission to modify this workspace.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href={`/workspaces/${workspaceId}`}>Back to Workspace</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href={`/workspaces/${workspaceId}`}
        className="mb-6 inline-flex items-center space-x-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="size-4" />
        <span>Back to workspace</span>
      </Link>

      <div className="space-y-8">
        {/* General Settings */}
        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="font-display text-2xl font-bold text-slate-900">Workspace Settings</h1>
          <p className="mt-1 text-slate-600">Manage your workspace name and other settings.</p>

          <form onSubmit={handleSave} className="mt-6 space-y-4">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-slate-700">Workspace name</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex h-12 w-full items-center rounded-lg border-2 border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                required
                maxLength={100}
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-slate-700">Description (optional)</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's this workspace for?"
                rows={3}
                className="flex w-full resize-none rounded-lg border-2 border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                maxLength={500}
              />
            </label>

            <label className="block space-y-1">
              <span className="text-sm font-semibold text-slate-700">Slug</span>
              <input
                type="text"
                value={workspace?.slug || ""}
                className="flex h-12 w-full items-center rounded-lg border-2 border-slate-200 bg-slate-50 px-4 text-sm text-slate-500 shadow-sm outline-none cursor-not-allowed"
                disabled
              />
              <p className="text-xs text-slate-500">Slug cannot be changed.</p>
            </label>

            <Button
              type="submit"
              disabled={isSaving || !name.trim() || name.trim() === workspace?.name}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 border-2 border-indigo-600 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <><Loader2 className="mr-2 size-4 animate-spin" />Saving...</>
              ) : (
                <><Save className="mr-2 size-4" />Save Changes</>
              )}
            </Button>
          </form>
        </div>

        {/* Danger Zone */}
        {workspace?.myRole === "OWNER" && (
          <div className="rounded-xl border border-red-200 bg-white p-8 shadow-sm">
            <h2 className="font-display text-lg font-bold text-red-600">Danger Zone</h2>
            <p className="mt-1 text-sm text-slate-600">
              Once you delete a workspace, there is no going back. Please be certain.
            </p>

            {!showDeleteConfirm ? (
              <Button
                type="button"
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
                className="mt-4"
              >
                <Trash2 className="mr-2 size-4" />
                Delete Workspace
              </Button>
            ) : (
              <div className="mt-4 space-y-3 rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-medium text-red-700">
                  Are you absolutely sure? This will permanently delete this workspace, all its projects, and tasks.
                </p>
                <div className="flex items-center space-x-3">
                  <Button
                    type="button"
                    disabled={isDeleting}
                    onClick={handleDelete}
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold border-2 border-red-600"
                  >
                    {isDeleting ? (
                      <><Loader2 className="mr-2 size-4 animate-spin" />Deleting...</>
                    ) : (
                      <><Trash2 className="mr-2 size-4" />Yes, Delete Forever</>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="border-2 border-slate-300 font-semibold"
                    disabled={isDeleting}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
