"use client"

import { useEffect, useState } from "react"
import { useToast, setGlobalToast, type Toast as ToastType } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { X, CheckCircle, AlertCircle, Info } from "lucide-react"

const variantStyles = {
  success: "border-green-200 bg-green-50 text-green-700",
  error: "border-red-200 bg-red-50 text-red-600",
  info: "border-indigo-200 bg-indigo-50 text-indigo-700",
}

const variantIcons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
}

const progressBarColors = {
  success: "bg-green-400",
  error: "bg-red-400",
  info: "bg-indigo-400",
}

function ToastProgress({ toast }: { toast: ToastType }) {
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    if (toast.leaving) return

    const start = Date.now()
    const duration = 4700
    const timer = setInterval(() => {
      const elapsed = Date.now() - start
      const remaining = Math.max(0, ((duration - elapsed) / duration) * 100)
      setProgress(remaining)
      if (remaining <= 0) clearInterval(timer)
    }, 50)
    return () => clearInterval(timer)
  }, [toast.leaving])

  return (
    <div className="absolute bottom-0 left-0 right-0 h-1 rounded-b-xl overflow-hidden bg-black/5">
      <div
        className={cn("h-full rounded-b-xl transition-all duration-300 ease-linear", progressBarColors[toast.variant])}
        style={{ width: `${toast.leaving ? 0 : progress}%` }}
      />
    </div>
  )
}

export default function Toaster() {
  const { toasts, addToast, removeToast } = useToast()

  useEffect(() => {
    setGlobalToast(addToast)
    return () => setGlobalToast(() => {})
  }, [addToast])

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col-reverse gap-3 max-w-sm">
      {toasts.map((t) => {
        const Icon = variantIcons[t.variant]
        return (
          <div
            key={t.id}
            className={cn(
              "relative flex items-start space-x-3 overflow-hidden rounded-xl border-2 px-4 py-3 pb-4 shadow-xl",
              "transition-all duration-300",
              t.leaving
                ? "opacity-0 translate-x-full scale-95"
                : "opacity-100 translate-x-0 scale-100",
              variantStyles[t.variant]
            )}
            style={{
              animation: t.leaving ? "none" : "toastSlideIn 0.3s ease-out",
            }}
          >
            <Icon className="size-5 flex-shrink-0 mt-0.5" />
            <p className="flex-1 text-sm font-medium">{t.message}</p>
            <button
              onClick={() => removeToast(t.id)}
              className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
              aria-label="Dismiss"
            >
              <X className="size-4" />
            </button>
            <ToastProgress toast={t} />
          </div>
        )
      })}
    </div>
  )
}
