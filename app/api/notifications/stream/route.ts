import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return new Response("Unauthorized", { status: 401 })
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) {
    return new Response("User not found", { status: 404 })
  }

  // Get user workspace IDs
  const memberships = await prisma.workspace_members.findMany({
    where: { user_id: user.id },
    select: { workspace_id: true },
  })
  const workspaceIds = memberships.map((m) => m.workspace_id)

  // Track last-seen timestamp from query param or default to 30s ago
  const { searchParams } = new URL(req.url)
  const sinceParam = searchParams.get("since")
  let since = sinceParam ? new Date(sinceParam) : new Date(Date.now() - 30000)

  const encoder = new TextEncoder()
  let isConnected = true

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection event
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "connected" })}\n\n`))

      // Poll for new activity every 5 seconds
      const interval = setInterval(async () => {
        if (!isConnected) {
          clearInterval(interval)
          return
        }

        try {
          if (workspaceIds.length === 0) {
            since = new Date()
            return
          }

          const activities = await prisma.activity_logs.findMany({
            where: {
              workspace_id: { in: workspaceIds },
              created_at: { gt: since },
            },
            include: {
              users: { select: { id: true, name: true, image: true } },
              projects: { select: { id: true, name: true } },
              workspaces: { select: { id: true, name: true, slug: true } },
            },
            orderBy: { created_at: "desc" },
            take: 10,
          })

          if (activities.length > 0) {
            since = activities[0].created_at

            const data = activities.map((a) => ({
              id: a.id,
              action: a.action,
              message: a.message,
              user: a.users ? { id: a.users.id, name: a.users.name, image: a.users.image } : null,
              project: a.projects ? { id: a.projects.id, name: a.projects.name } : null,
              workspace: { id: a.workspaces.id, name: a.workspaces.name, slug: a.workspaces.slug },
              createdAt: a.created_at,
            }))

            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: "activity", activities: data })}\n\n`)
            )
          }
        } catch {
          // Silently fail polling - connection will be retried
        }
      }, 5000)

      // Keep-alive ping every 25 seconds
      const keepAlive = setInterval(() => {
        if (!isConnected) {
          clearInterval(keepAlive)
          return
        }
        try {
          controller.enqueue(encoder.encode(`: keepalive\n\n`))
        } catch {
          clearInterval(keepAlive)
        }
      }, 25000)

      // Cleanup on close
      req.signal.addEventListener("abort", () => {
        isConnected = false
        clearInterval(interval)
        clearInterval(keepAlive)
        controller.close()
      })
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  })
}
