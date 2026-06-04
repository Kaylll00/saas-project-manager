"use client"

import { useSession } from "next-auth/react"
import { getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Save, Loader2, User, ArrowLeft, Camera } from "lucide-react"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"

export default function AccountSettingsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [name, setName] = useState("")
  const [image, setImage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/user/profile")
        const data = await res.json()
        if (res.ok && data.user) {
          setName(data.user.name || "")
          setImage(data.user.image || "")
        }
      } catch {
        setError("Failed to load profile")
      } finally {
        setIsLoading(false)
      }
    }
    loadProfile()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsSaving(true)
    setError(null)

    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), image: image.trim() || null }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to update profile")

      // Force session refresh so the sidebar shows the updated name
      await getSession({ force: true })
      toast("Profile updated successfully!", "success")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
      toast(err instanceof Error ? err.message : "Failed to update profile", "error")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="h-4 w-36 animate-pulse rounded bg-slate-200 mb-6" />
        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="size-16 animate-pulse rounded-full bg-slate-200" />
              <div className="space-y-2">
                <div className="h-5 w-40 animate-pulse rounded bg-slate-200" />
                <div className="h-4 w-56 animate-pulse rounded bg-slate-200" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />
              <div className="h-12 w-full animate-pulse rounded-lg bg-slate-200" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center space-x-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="size-4" />
        <span>Back to Dashboard</span>
      </Link>

      <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center space-x-4 mb-8">
          {/* Avatar preview */}
          <div className="relative">
            {image ? (
              <img src={image} alt="" className="size-16 rounded-full ring-4 ring-slate-100 object-cover" />
            ) : (
              <div className="flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 ring-4 ring-slate-100">
                <User className="size-8 text-white" />
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full bg-white shadow-md border border-slate-200">
              <Camera className="size-3 text-slate-500" />
            </div>
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900">Account Settings</h1>
            <p className="mt-0.5 text-sm text-slate-500">
              Update your profile information
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-5">
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-700">Display Name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="flex h-12 w-full items-center rounded-lg border-2 border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
              required
              maxLength={100}
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-700">Avatar URL (optional)</span>
            <input
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              className="flex h-12 w-full items-center rounded-lg border-2 border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
            />
            <p className="text-xs text-slate-500">Paste a URL to your profile image.</p>
          </label>

          <label className="block space-y-1">
            <span className="text-sm font-semibold text-slate-700">Email</span>
            <input
              type="email"
              value={session?.user?.email || ""}
              className="flex h-12 w-full items-center rounded-lg border-2 border-slate-200 bg-slate-50 px-4 text-sm text-slate-500 shadow-sm outline-none cursor-not-allowed"
              disabled
            />
            <p className="text-xs text-slate-500">Email cannot be changed.</p>
          </label>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={isSaving || !name.trim()}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 border-2 border-indigo-600 font-semibold"
            >
              {isSaving ? (
                <><Loader2 className="mr-2 size-4 animate-spin" />Saving...</>
              ) : (
                <><Save className="mr-2 size-4" />Save Changes</>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
