import { SkeletonKanbanColumn } from "@/components/ui/skeleton"

export default function ProjectDetailLoading() {
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
          <div className="h-10 w-28 animate-pulse rounded-lg bg-slate-200" />
        </div>
      </div>

      {/* Kanban skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <SkeletonKanbanColumn key={i} />
        ))}
      </div>
    </div>
  )
}
