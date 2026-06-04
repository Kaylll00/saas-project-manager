"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"

const variants = {
  "fade-up": {
    hidden: { opacity: 0, y: 32 },
    visible: { opacity: 1, y: 0 },
  },
  "fade-in": {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  "slide-up": {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0 },
  },
} as const

type AnimationVariant = keyof typeof variants

export default function AnimatedSection({
  children,
  className,
  variant = "fade-up",
  as: Tag = "div",
  delay = 0,
  id,
}: {
  children: React.ReactNode
  className?: string
  variant?: AnimationVariant
  as?: "div" | "section" | "article"
  delay?: number
  id?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const MotionTag = motion.create(Tag)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReducedMotion) {
      setIsVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    )

    const currentRef = ref.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [])

  const v = variants[variant]

  return (
    <MotionTag
      ref={ref}
      id={id}
      className={className}
      initial={v.hidden}
      animate={isVisible ? v.visible : v.hidden}
      transition={{
        type: "spring",
        stiffness: 120,
        damping: 20,
        delay: delay / 1000,
      }}
    >
      {children}
    </MotionTag>
  )
}
