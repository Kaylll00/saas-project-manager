"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Save, Loader2, Bell, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

type NotificationSettings = {
  task_assigned: boolean
  status_changed: boolean
  new_comment: boolean
  task_due_soon: boolean
  new_project: boolean
  member_joined: boolean
  invitation_received: boolean
}

const defaultSettings: NotificationSettings = {
  task_assigned: true,
  status_changed: true,
  new_comment: true,
  task_due_soon: true,
  new_project: true,
  member_joined: true,
  invitation_received: true,
}

const notificationOptions: {
  key: keyof NotificationSettings
  label: string
  description: string
}[] = [
  {
    key: "task_assigned",
    label: "Task assigned",
    description: "When someone assigns you a task",
  },
  {
    key: "status_changed",
    label: "Status changed",
    description: "When a task's status is updated",
  },
  {
    key: "new_comment",
    label: "New comment",
    description: "When someone comments on a task",
  },
  {
    key: "task_due_soon",
    label: "Due date approaching",
    description: "When a task is due within 24 hours",
  },
  {
    key: "new_project",
    label: "New project",
    description: "When a new project is created in your workspace",
  },
  {
    key: "member_joined",
    label: "Member joined",
    description: "When a new member joins a workspace",
  },
  {
    key: "invitation_received",
    label: "Invitation received",
    description: "When you receive a workspace invitation",
  },
]

export default function NotificationSettingsPage() {
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/user/notifications")
        const data = await res.json()
        if (res.ok && data.settings) {
          setSettings({
            task_assigned: data.settings.task_assigned,
            status_changed: data.settings.status_changed,
            new_comment: data.settings.new_comment,
            task_due_soon: data.settings.task_due_soon,
            new_project: data.settings.new_project,
            member_joined: data.settings.member_joined,
            invitation_received: data.settings.invitation_received,
          })
        }
      } catch {
        setError("Failed to load notification settings")
      } finally {
        setIsLoading(false)
      }
    }
    loadSettings()
  }, [])

  const handleToggle = (key: keyof NotificationSettings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)
    try {
      const res = await fetch("/api/user/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to save settings")
      toast("Notification preferences saved!", "success")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
      toast(err instanceof Error ? err.message : "Failed to save settings", "error")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="animate-pulse space-y-6">
          <div className="h-4 w-36 rounded bg-slate-200" />
          <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="space-y-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="space-y-1.5">
                    <div className="h-4 w-40 rounded bg-slate-200" />
                    <div className="h-3 w-56 rounded bg-slate-100" />
                  </div>
                  <div className="size-10 rounded-full bg-slate-200" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/notifications"
        className="mb-6 inline-flex items-center space-x-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="size-4" />
        <span>Back to Notifications</span>
      </Link>

      <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center space-x-3 mb-6">
          <div className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
            <Bell className="size-5 text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900">Notification Preferences</h1>
            <p className="mt-0.5 text-sm text-slate-500">
              Choose which events trigger notifications for you.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="space-y-1 divide-y divide-slate-100">
          {notificationOptions.map((option) => (
            <label
              key={option.key}
              className="flex items-center justify-between py-4 cursor-pointer rounded-lg px-3 -mx-3 hover:bg-slate-50 transition-colors"
            >
              <div>
                <p className="text-sm font-semibold text-slate-900">{option.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{option.description}</p>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={settings[option.key]}
                  onChange={() => handleToggle(option.key)}
                  className="peer sr-only"
                  id={`toggle-${option.key}`}
                />
                <div
                  className={cn(
                    "h-6 w-11 rounded-full transition-colors duration-200 ease-in-out cursor-pointer",
                    settings[option.key]
                      ? "bg-indigo-600"
                      : "bg-slate-300"
                  )}
                  onClick={() => handleToggle(option.key)}
                >
                  <div
                    className={cn(
                      "h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out pointer-events-none",
                      settings[option.key] ? "translate-x-[22px]" : "translate-x-[2px]"
                    )}
                    style={{ marginTop: "2px" }}
                  />
                </div>
              </div>
            </label>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-slate-200">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 border-2 border-indigo-600 font-semibold"
          >
            {isSaving ? (
              <><Loader2 className="mr-2 size-4 animate-spin" />Saving...</>
            ) : (
              <><Save className="mr-2 size-4" />Save Preferences</>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
