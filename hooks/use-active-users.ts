"use client"

import { useEffect, useState, useRef } from "react"

type ActiveUser = {
  id: string
  name: string | null
  image: string | null
  email: string | null
}

type PresenceResource = {
  type: "workspace" | "project"
  id: string
}

export function useActiveUsers(resource: PresenceResource | null) {
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)

  useEffect(() => {
    if (!resource) {
      setActiveUsers([])
      return
    }

    const fetchActiveUsers = async () => {
      setIsLoading(true)
      try {
        const res = await fetch(
          `/api/presence/active?resourceType=${resource.type}&resourceId=${resource.id}`
        )
        const data = await res.json()
        if (res.ok) {
          setActiveUsers(data.activeUsers)
        }
      } catch {
        // Silently fail
      } finally {
        setIsLoading(false)
      }
    }

    // Fetch immediately
    fetchActiveUsers()

    // Then poll every 15 seconds
    intervalRef.current = setInterval(fetchActiveUsers, 15000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [resource?.type, resource?.id])

  return { activeUsers, isLoading, count: activeUsers.length }
}
