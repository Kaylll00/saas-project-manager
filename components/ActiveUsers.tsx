"use client"

import { useActiveUsers } from "@/hooks/use-active-users"
import { cn } from "@/lib/utils"
import { Users } from "lucide-react"

type PresenceResource = {
  type: "workspace" | "project"
  id: string
}

export default function ActiveUsers({
  resource,
  className,
}: {
  resource: PresenceResource
  className?: string
}) {
  const { activeUsers, count, isLoading } = useActiveUsers(resource)

  return (
    <div className={cn("flex items-center", className)}>
      {isLoading ? (
        <div className="flex -space-x-1.5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="size-6 animate-pulse rounded-full border-2 border-white bg-slate-200"
            />
          ))}
        </div>
      ) : count > 0 ? (
        <div className="flex items-center space-x-2">
          <div className="flex -space-x-1.5">
            {activeUsers.slice(0, 4).map((user) => (
              <div key={user.id} className="relative">
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name || "User"}
                    title={user.name || user.email || "User"}
                    className="size-6 rounded-full border-2 border-white shadow-sm"
                  />
                ) : (
                  <div
                    title={user.name || user.email || "User"}
                    className="flex size-6 items-center justify-center rounded-full border-2 border-white bg-indigo-500 text-[9px] font-bold text-white shadow-sm"
                  >
                    {user.name?.charAt(0) || user.email?.charAt(0) || "?"}
                  </div>
                )}
                <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-white bg-green-500" />
              </div>
            ))}
            {count > 4 && (
              <div className="flex size-6 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-[10px] font-semibold text-slate-500 shadow-sm">
                +{count - 4}
              </div>
            )}
          </div>
          <span className="text-xs text-slate-400">
            {count} active{count !== 1 ? "" : ""}
          </span>
        </div>
      ) : null}
    </div>
  )
}
