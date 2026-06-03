import { Suspense } from "react"

import AuthPage from "@/components/AuthPage"

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <AuthPage mode="register" />
    </Suspense>
  )
}
