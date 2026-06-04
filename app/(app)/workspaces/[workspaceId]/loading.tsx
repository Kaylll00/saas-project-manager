import { SkeletonStatsCard, SkeletonCard, SkeletonActivityItem } from "@/components/ui/skeleton"

export default function WorkspaceDetailLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
          <div className="h-8 w-64 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-48 animate-pulse rounded bg-slate-200" />
        </div>
        <div className="flex space-x-3">
          <div className="h-10 w-28 animate-pulse rounded-lg bg-slate-200" />
          <div className="h-10 w-36 animate-pulse rounded-lg bg-slate-200" />
        </div>
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <SkeletonStatsCard key={i} />
        ))}
      </div>

      {/* Members skeleton */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="h-5 w-20 animate-pulse rounded bg-slate-200 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="size-9 animate-pulse rounded-full bg-slate-200" />
                <div className="space-y-2">
                  <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
                  <div className="h-3 w-36 animate-pulse rounded bg-slate-200" />
                </div>
              </div>
              <div className="h-5 w-14 animate-pulse rounded-full bg-slate-200" />
            </div>
          ))}
        </div>
      </div>

      {/* Projects skeleton */}
      <div className="space-y-4">
        <div className="h-6 w-32 animate-pulse rounded bg-slate-200" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>

      {/* Activity skeleton */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center space-x-2 mb-4">
          <div className="size-5 animate-pulse rounded bg-slate-200" />
          <div className="h-5 w-28 animate-pulse rounded bg-slate-200" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <SkeletonActivityItem key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
