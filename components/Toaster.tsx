"use client"

import { useEffect } from "react"
import { useToast, setGlobalToast } from "@/hooks/use-toast"
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
              "flex items-start space-x-3 rounded-xl border-2 px-4 py-3 shadow-xl",
              variantStyles[t.variant]
            )}
            style={{
              animation: "toastSlideIn 0.3s ease-out",
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
          </div>
        )
      })}
    </div>
  )
}
