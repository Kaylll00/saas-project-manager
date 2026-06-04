"use client"

import { useEffect, useRef, useCallback } from "react"

export type RealtimeActivity = {
  id: string
  action: string
  message: string
  user: { id: string; name: string | null; image: string | null } | null
  project: { id: string; name: string } | null
  task: { id: string; title: string } | null
  workspace: { id: string; name: string; slug: string }
  createdAt: string
}

type SSEMessage =
  | { type: "connected" }
  | { type: "activity"; activities: RealtimeActivity[] }

export function useRealtimeNotifications(onActivity?: (activities: RealtimeActivity[]) => void) {
  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const connect = useCallback(() => {
    // Clean up any existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    const lastCheck = typeof window !== "undefined"
      ? localStorage.getItem("lastNotificationCheck")
      : null

    const params = lastCheck ? `?since=${encodeURIComponent(lastCheck)}` : ""
    const es = new EventSource(`/api/notifications/stream${params}`)
    eventSourceRef.current = es

    es.onmessage = (event) => {
      try {
        const data: SSEMessage = JSON.parse(event.data)
        if (data.type === "activity" && data.activities.length > 0 && onActivity) {
          onActivity(data.activities)
        }
      } catch {
        // Ignore malformed messages (including keepalive comments)
      }
    }

    es.onerror = () => {
      es.close()
      // Reconnect after 3 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        connect()
      }, 3000)
    }
  }, [onActivity])

  useEffect(() => {
    connect()
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [connect])
}
