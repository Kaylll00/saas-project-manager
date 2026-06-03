"use client"

import { useState, useCallback } from "react"

type ToastVariant = "success" | "error" | "info"

type Toast = {
  id: string
  message: string
  variant: ToastVariant
}

type AddToast = (message: string, variant?: ToastVariant) => void

let globalAddToast: AddToast | null = null

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast: AddToast = useCallback((message, variant = "info") => {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { id, message, variant }])

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return { toasts, addToast, removeToast }
}

// Singleton helper for calling toast from anywhere
export function toast(message: string, variant?: ToastVariant) {
  if (globalAddToast) {
    globalAddToast(message, variant)
  }
}

export function setGlobalToast(fn: AddToast) {
  globalAddToast = fn
}
