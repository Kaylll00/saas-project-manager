"use client"

import { useEffect, useRef } from "react"

type PresenceResource = {
  type: "workspace" | "project"
  id: string
}

export function usePresence(resource: PresenceResource | null) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)

  useEffect(() => {
    if (!resource) return

    const sendHeartbeat = async () => {
      try {
        await fetch("/api/presence/heartbeat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resourceType: resource.type,
            resourceId: resource.id,
          }),
        })
      } catch {
        // Silently fail
      }
    }

    // Send immediately on mount
    sendHeartbeat()

    // Then every 30 seconds
    intervalRef.current = setInterval(sendHeartbeat, 30000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [resource?.type, resource?.id])
}
