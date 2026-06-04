import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700", className)}
      {...props}
    />
  )
}

function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800", className)}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="size-10 rounded-lg" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    </div>
  )
}

function SkeletonStatsCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800", className)}>
      <div className="flex items-center space-x-3">
        <Skeleton className="size-11 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-7 w-12" />
        </div>
      </div>
    </div>
  )
}

function SkeletonListRow({ className, showImage = true }: { className?: string; showImage?: boolean }) {
  return (
    <div className={cn("flex items-center justify-between rounded-lg px-4 py-3", className)}>
      <div className="flex items-center space-x-4">
        {showImage && <Skeleton className="size-10 rounded-full" />}
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Skeleton className="h-5 w-16 rounded-full" />
    </div>
  )
}

function SkeletonKanbanColumn({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-xl border border-slate-200 bg-slate-50 shadow-sm dark:border-slate-700 dark:bg-slate-800/50", className)}>
      <div className="flex items-center justify-between rounded-t-xl border-t-4 border-slate-400 bg-white px-4 py-3 dark:bg-slate-800 dark:border-slate-600">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="size-5 rounded-full" />
        </div>
      </div>
      <div className="space-y-2 p-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div className="space-y-2">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <div className="flex items-center justify-between">
                <Skeleton className="size-3.5 rounded-full" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SkeletonActivityItem({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-start space-x-3 pb-3 border-b border-slate-100 dark:border-slate-700/50", className)}>
      <Skeleton className="size-7 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  )
}

function SkeletonComment({ className }: { className?: string }) {
  return (
    <div className={cn("flex space-x-3", className)}>
      <Skeleton className="size-8 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  )
}

export {
  Skeleton,
  SkeletonCard,
  SkeletonStatsCard,
  SkeletonListRow,
  SkeletonKanbanColumn,
  SkeletonActivityItem,
  SkeletonComment,
}
