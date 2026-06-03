"use client"

import { useParams } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2, UserPlus, X, Shield, Mail, Clock, Ban } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

type Member = {
  id: string
  name: string | null
  email: string | null
  image: string | null
  role: string
  joinedAt: string
}

type Invitation = {
  id: string
  email: string
  role: string
  status: string
  invitedBy: { id: string; name: string | null; email: string | null }
  expiresAt: string
  createdAt: string
}

type WorkspaceInfo = {
  name: string
  myRole: string
  ownerId: string
}

export default function WorkspaceMembersPage() {
  const params = useParams()
  const workspaceId = params.workspaceId as string

  const [workspace, setWorkspace] = useState<WorkspaceInfo | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Invite by email state
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState("MEMBER")
  const [isInviting, setIsInviting] = useState(false)
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null)

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [wsRes, membersRes, invitesRes] = await Promise.all([
        fetch(`/api/workspaces/${workspaceId}`),
        fetch(`/api/workspaces/${workspaceId}/members`),
        fetch(`/api/workspaces/${workspaceId}/invitations`),
      ])

      const wsData = await wsRes.json()
      const membersData = await membersRes.json()
      const invitesData = invitesRes.ok ? await invitesRes.json() : null

      if (!wsRes.ok) throw new Error(wsData.error || "Failed to load workspace")
      if (!membersRes.ok) throw new Error(membersData.error || "Failed to load members")

      setWorkspace({ name: wsData.workspace.name, myRole: wsData.workspace.myRole, ownerId: wsData.workspace.ownerId })
      setMembers(membersData.members)
      if (invitesData) setInvitations(invitesData.invitations)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [workspaceId])

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim()) return

    setIsInviting(true)
    setInviteError(null)
    setInviteSuccess(null)

    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/invitations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to send invitation")

      setInviteSuccess(`Invitation sent to ${inviteEmail.trim()}!`)
      setInviteEmail("")
      setShowInviteForm(false)
      loadData()
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setIsInviting(false)
    }
  }

  const handleRevokeInvitation = async (invitationId: string) => {
    if (!confirm("Revoke this invitation?")) return

    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/invitations/${invitationId}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to revoke invitation")
      }
      loadData()
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to revoke invitation", "error")
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return

    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/members/${memberId}`, { method: "DELETE" })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to remove member")
      }
      loadData()
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to remove member", "error")
    }
  }

  const roleColors: Record<string, string> = {
    OWNER: "bg-amber-100 text-amber-700",
    ADMIN: "bg-purple-100 text-purple-700",
    MEMBER: "bg-blue-100 text-blue-700",
    VIEWER: "bg-slate-100 text-slate-700",
  }

  const canManage = workspace?.myRole === "OWNER" || workspace?.myRole === "ADMIN"

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="size-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
      </div>
    )
  }

  if (error || !workspace) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-red-600 font-medium">{error || "Workspace not found"}</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/workspaces">Back to Workspaces</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href={`/workspaces/${workspaceId}`}
        className="mb-6 inline-flex items-center space-x-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="size-4" />
        <span>Back to {workspace.name}</span>
      </Link>

      <div className="space-y-8">
        {/* Current Members */}
        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-display text-2xl font-bold text-slate-900">Members</h1>
              <p className="mt-1 text-slate-600">
                {members.length} member{members.length !== 1 ? "s" : ""}
              </p>
            </div>
            {canManage && (
              <Button
                onClick={() => setShowInviteForm(!showInviteForm)}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 border-2 border-indigo-600 font-semibold"
              >
                <UserPlus className="mr-1.5 size-4" />
                Invite
              </Button>
            )}
          </div>

          {/* Invite form */}
          {showInviteForm && (
            <div className="mb-6 rounded-lg border border-indigo-200 bg-indigo-50 p-4">
              <form onSubmit={handleInvite} className="space-y-3">
                {inviteError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{inviteError}</div>
                )}
                {inviteSuccess && (
                  <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-600">{inviteSuccess}</div>
                )}
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="flex-1 h-11 rounded-lg border-2 border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                    required
                  />
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="h-11 rounded-lg border-2 border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                  >
                    <option value="MEMBER">Member</option>
                    <option value="ADMIN">Admin</option>
                    <option value="VIEWER">Viewer</option>
                  </select>
                  <Button
                    type="submit"
                    disabled={isInviting || !inviteEmail.trim()}
                    className="h-11 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 border-2 border-indigo-600 font-semibold"
                  >
                    {isInviting ? <Loader2 className="size-4 animate-spin" /> : "Send Invite"}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Members list */}
          <div className="space-y-1">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between rounded-lg px-4 py-3 transition-colors hover:bg-slate-50">
                <div className="flex items-center space-x-4">
                  {member.image ? (
                    <img src={member.image} alt={member.name || ""} className="size-10 rounded-full" />
                  ) : (
                    <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold text-sm">
                      {member.name?.charAt(0)?.toUpperCase() || member.email?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-slate-900">{member.name || "Unnamed"}</p>
                      {member.role === "OWNER" && <Shield className="size-3.5 text-amber-500" />}
                    </div>
                    <p className="text-xs text-slate-500">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", roleColors[member.role] || "bg-slate-100 text-slate-700")}>
                    {member.role}
                  </span>
                  {canManage && member.role !== "OWNER" && (
                    <button onClick={() => handleRemoveMember(member.id)} className="text-slate-400 hover:text-red-500 transition-colors" aria-label={`Remove ${member.name || member.email || "member"}`}>
                      <X className="size-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            {members.length === 0 && <p className="py-8 text-center text-sm text-slate-500">No members found.</p>}
          </div>
        </div>

        {/* Pending Invitations */}
        {canManage && (
          <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-center space-x-2 mb-4">
              <Mail className="size-5 text-slate-500" />
              <h2 className="font-display text-lg font-bold text-slate-900">Pending Invitations</h2>
              {invitations.length > 0 && (
                <span className="inline-flex items-center justify-center size-5 rounded-full bg-amber-100 text-xs font-medium text-amber-700">
                  {invitations.length}
                </span>
              )}
            </div>

            {invitations.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-400">No pending invitations.</p>
            ) : (
              <div className="space-y-2">
                {invitations.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3">
                    <div className="flex items-center space-x-3">
                      <div className="flex size-10 items-center justify-center rounded-full bg-slate-100">
                        <Mail className="size-4 text-slate-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{inv.email}</p>
                        <div className="flex items-center space-x-2 text-xs text-slate-500">
                          <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium", roleColors[inv.role] || "bg-slate-100 text-slate-700")}>
                            {inv.role}
                          </span>
                          <span className="flex items-center space-x-0.5">
                            <Clock className="size-3" />
                            <span>Expires {new Date(inv.expiresAt).toLocaleDateString()}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRevokeInvitation(inv.id)}
                      className="flex items-center space-x-1 text-xs font-medium text-slate-400 hover:text-red-500 transition-colors"
                      aria-label="Revoke invitation"
                    >
                      <Ban className="size-3.5" />
                      <span>Revoke</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
