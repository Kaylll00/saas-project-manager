"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Mail,
  Check,
  ExternalLink,
  Clock,
  User,
  Building2,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

type Invitation = {
  id: string
  workspace: { id: string; name: string; slug: string }
  invitedBy: { id: string; name: string | null; image: string | null }
  role: string
  createdAt: string
  expiresAt: string
  token: string
}

export default function InvitationsPage() {
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [acceptingId, setAcceptingId] = useState<string | null>(null)

  useEffect(() => {
    async function loadInvitations() {
      try {
        const res = await fetch("/api/invitations")
        const data = await res.json()
        if (res.ok) setInvitations(data.invitations)
      } catch {
        // silently fail
      } finally {
        setIsLoading(false)
      }
    }
    loadInvitations()
  }, [])

  const handleAccept = async (invitation: Invitation) => {
    setAcceptingId(invitation.id)
    // Redirect to the accept flow which handles everything
    window.location.href = `/invitations/accept?token=${invitation.token}`
  }

  const roleBadge = (role: string) => {
    const colors: Record<string, string> = {
      OWNER: "bg-amber-100 text-amber-700",
      ADMIN: "bg-purple-100 text-purple-700",
      MEMBER: "bg-blue-100 text-blue-700",
      VIEWER: "bg-slate-100 text-slate-700",
    }
    return colors[role] || "bg-slate-100 text-slate-700"
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900 sm:text-3xl">
          Invitations
        </h1>
        <p className="mt-1 text-slate-600">
          Review and accept invitations to join workspaces.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="size-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
        </div>
      ) : invitations.length === 0 ? (
        /* Empty state */
        <div className="rounded-xl border-2 border-dashed border-slate-300 bg-white p-16 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-indigo-100">
            <Mail className="size-8 text-indigo-600" />
          </div>
          <h2 className="mt-4 font-display text-xl font-bold text-slate-900">
            No pending invitations
          </h2>
          <p className="mt-2 text-slate-600 max-w-md mx-auto">
            You don&apos;t have any pending workspace invitations. When someone invites you, it will appear here.
          </p>
          <Button asChild size="lg" className="mt-6 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 border-2 border-indigo-600 font-semibold shadow-lg">
            <Link href="/dashboard">
              Go to Dashboard
            </Link>
          </Button>
        </div>
      ) : (
        /* Invitations list */
        <div className="space-y-4">
          <p className="text-sm text-slate-500">
            You have {invitations.length} pending invitation{invitations.length !== 1 ? "s" : ""}.
          </p>
          {invitations.map((inv) => (
            <div
              key={inv.id}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start space-x-4">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20">
                    <Building2 className="size-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-slate-900">
                      {inv.workspace.name}
                    </h3>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                      <span className="flex items-center space-x-1">
                        <User className="size-3.5" />
                        <span>Invited by {inv.invitedBy.name || "Someone"}</span>
                      </span>
                      <span className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                        roleBadge(inv.role)
                      )}>
                        {inv.role}
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock className="size-3.5" />
                        <span>Expires {new Date(inv.expiresAt).toLocaleDateString()}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 sm:flex-shrink-0">
                  <Button
                    onClick={() => handleAccept(inv)}
                    disabled={acceptingId === inv.id}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 border-2 border-indigo-600 font-semibold"
                  >
                    {acceptingId === inv.id ? (
                      <Loader2 className="mr-1.5 size-4 animate-spin" />
                    ) : (
                      <Check className="mr-1.5 size-4" />
                    )}
                    Accept
                  </Button>
                  <Link
                    href={`/invitations/accept?token=${inv.token}`}
                    className="inline-flex items-center space-x-1 text-sm font-medium text-indigo-600 hover:text-purple-600 transition-colors"
                  >
                    <ExternalLink className="size-3.5" />
                    <span>Open Link</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
