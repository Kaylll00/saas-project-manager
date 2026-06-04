import { SkeletonActivityItem } from "@/components/ui/skeleton"

export default function NotificationsLoading() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="size-10 animate-pulse rounded-lg bg-slate-200" />
          <div className="space-y-2">
            <div className="h-7 w-40 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-56 animate-pulse rounded bg-slate-200" />
          </div>
        </div>
        <div className="h-10 w-32 animate-pulse rounded-lg bg-slate-200" />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <SkeletonActivityItem key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
