"use client"

import { useState, useCallback } from "react"

export type ToastVariant = "success" | "error" | "info"

export type Toast = {
  id: string
  message: string
  variant: ToastVariant
  leaving: boolean
}

export type AddToast = (message: string, variant?: ToastVariant) => void

let globalAddToast: AddToast | null = null

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast: AddToast = useCallback((message, variant = "info") => {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { id, message, variant, leaving: false }])

    // Start exit animation before removing
    setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, leaving: true } : t))
      )
      // Remove after animation completes
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, 300)
    }, 4700)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, leaving: true } : t))
    )
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 300)
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
