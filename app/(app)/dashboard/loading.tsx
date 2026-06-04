import { SkeletonStatsCard, SkeletonCard, SkeletonActivityItem } from "@/components/ui/skeleton"

export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-64 animate-pulse rounded-lg bg-slate-200" />
          <div className="h-4 w-48 animate-pulse rounded bg-slate-200" />
        </div>
        <div className="h-11 w-40 animate-pulse rounded-lg bg-slate-200" />
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <SkeletonStatsCard key={i} />
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Workspaces list skeleton */}
        <div className="lg:col-span-2 space-y-4">
          <div className="h-6 w-40 animate-pulse rounded bg-slate-200" />
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>

        {/* Activity skeleton */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:self-start lg:sticky lg:top-8">
          <div className="flex items-center space-x-2 mb-4">
            <div className="size-5 animate-pulse rounded bg-slate-200" />
            <div className="h-5 w-32 animate-pulse rounded bg-slate-200" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <SkeletonActivityItem key={i} className="border-b-0 pb-0" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
