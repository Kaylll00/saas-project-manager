"use client"

import { useParams, useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2, Plus } from "lucide-react"
import Link from "next/link"

export default function NewProjectPage() {
  const params = useParams()
  const router = useRouter()
  const workspaceId = params.workspaceId as string

  const [workspaceName, setWorkspaceName] = useState("")
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingWs, setIsLoadingWs] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadWorkspace() {
      try {
        const res = await fetch(`/api/workspaces/${workspaceId}`)
        const data = await res.json()
        if (res.ok) setWorkspaceName(data.workspace.name)
      } catch {
        // silently fail
      } finally {
        setIsLoadingWs(false)
      }
    }
    loadWorkspace()
  }, [workspaceId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to create project")
      }

      toast("Project created successfully!", "success")
      router.push(`/workspaces/${workspaceId}/projects/${data.project.id}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href={`/workspaces/${workspaceId}`}
        className="mb-6 inline-flex items-center space-x-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="size-4" />
        <span>Back to {isLoadingWs ? "workspace" : workspaceName}</span>
      </Link>

      <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-slate-900">Create a project</h1>
          <p className="mt-1 text-slate-600">
            Projects help you organize tasks, set deadlines, and track progress.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-700">
              Project name <span className="text-red-500">*</span>
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Website Redesign, Mobile App v2"
              className="flex h-12 w-full items-center rounded-lg border-2 border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
              required
              maxLength={200}
              autoFocus
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-700">Description (optional)</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this project about?"
              rows={3}
              className="flex w-full resize-none rounded-lg border-2 border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
              maxLength={1000}
            />
          </label>

          <div className="flex items-center justify-end space-x-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="border-2 border-slate-300 font-semibold"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 border-2 border-indigo-600 font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 size-4" />
                  Create Project
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
