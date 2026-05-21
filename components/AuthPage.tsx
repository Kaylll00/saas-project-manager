"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { ArrowLeft, Check, Eye, EyeOff, LockKeyhole, Mail, User } from "lucide-react"
import { useState, useEffect } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type AuthMode = "login" | "register"

type AuthPageProps = {
  mode: AuthMode
}

const authCopy = {
  login: {
    eyebrow: "Sign in to continue",
    title: "Welcome back to Stride.",
    description: "Keep your team aligned and ship faster.",
    submit: "Sign In",
    alternate: "Don't have an account?",
    alternateAction: "Register",
    alternateHref: "/register",
    sideTitle: "Welcome back to Stride.",
    sideDescription: "Your workspace is ready. Jump back into tasks, timelines, and team momentum.",
  },
  register: {
    eyebrow: "Start your trial",
    title: "Create your Stride account.",
    description: "Plan smarter, track progress, and keep every handoff clear.",
    submit: "Create Account",
    alternate: "Already have an account?",
    alternateAction: "Log in",
    alternateHref: "/login",
    sideTitle: "Build momentum with Stride.",
    sideDescription: "Set up a shared command center for projects, priorities, and deadlines.",
  },
}

function GoogleIcon() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  )
}

function AuthField({
  icon: Icon,
  label,
  type = "text",
  placeholder,
  hasAction = false,
  value,
  onChange,
  showPassword,
  onTogglePassword,
}: {
  icon: typeof Mail
  label: string
  type?: string
  placeholder: string
  hasAction?: boolean
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  showPassword?: boolean
  onTogglePassword?: () => void
}) {
  const inputType = hasAction && showPassword ? "text" : type

  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <span className="flex h-12 items-center rounded-lg border-2 border-slate-200 bg-white px-3 shadow-sm transition-all focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10">
        <Icon className="mr-3 size-4 text-slate-400" />
        <input
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
        />
        {hasAction ? (
          <button 
            type="button" 
            className="ml-3 text-slate-400 transition-colors hover:text-indigo-600" 
            aria-label="Toggle password visibility"
            onClick={onTogglePassword}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        ) : null}
      </span>
    </label>
  )
}

export default function AuthPage({ mode }: AuthPageProps) {
  const copy = authCopy[mode]
  const isRegister = mode === "register"
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  })

  useEffect(() => {
    const registered = searchParams.get("registered")
    const verified = searchParams.get("verified")
    const errorParam = searchParams.get("error")

    if (registered === "true") {
      setSuccess("Registration successful! Please check your email to verify your account.")
    } else if (verified === "true") {
      setSuccess("Email verified successfully! You can now log in.")
    } else if (errorParam === "invalid-token") {
      setError("Invalid verification link. Please try registering again.")
    } else if (errorParam === "token-expired") {
      setError("Verification link expired. Please register again.")
    } else if (errorParam === "verification-failed") {
      setError("Verification failed. Please try again.")
    }
  }, [searchParams])

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (isRegister) {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })

        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || "Registration failed")
        }

        router.push("/login?registered=true")
      } else {
        const result = await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
        })

        if (result?.error) {
          throw new Error("Invalid email or password")
        }

        router.push("/")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setError(null)
    try {
      await signIn("google", { callbackUrl: "/" })
    } catch (err) {
      setError("Failed to sign in with Google")
      setIsLoading(false)
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-white text-slate-900">
      <div className="absolute left-[-8rem] top-16 h-72 w-72 rounded-full bg-indigo-300/40 blur-3xl" />
      <div className="absolute right-[-6rem] top-8 h-80 w-80 rounded-full bg-pink-300/40 blur-3xl" />
      <div className="absolute bottom-[-10rem] left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-cyan-200/50 blur-3xl" />

      <nav className="relative z-10 border-b border-slate-200 bg-white/90 shadow-sm backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center space-x-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
              <span className="size-4 rounded-sm bg-white" />
            </span>
            <span className="font-display text-xl font-bold text-slate-900">Stride</span>
          </Link>

          <Button asChild variant="ghost" className="border-2 border-slate-300 font-semibold hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600">
            <Link href="/">
              <ArrowLeft className="size-4" />
              Home
            </Link>
          </Button>
        </div>
      </nav>

      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto grid w-full max-w-4xl overflow-hidden rounded-xl border border-slate-200 bg-white/95 shadow-2xl backdrop-blur md:grid-cols-[0.9fr_1.1fr]">
          <div className="hidden border-r border-slate-200 p-8 md:flex md:flex-col md:justify-center lg:p-10">
            <div className="mb-6 flex gap-2.5">
              <span className="size-9 rounded-lg bg-indigo-500 shadow-lg shadow-indigo-500/20" />
              <span className="size-9 rounded-lg bg-purple-500 shadow-lg shadow-purple-500/20" />
              <span className="size-9 rounded-lg bg-pink-500 shadow-lg shadow-pink-500/20" />
            </div>
            <h1 className="font-display text-2xl font-bold leading-tight text-slate-900 lg:text-3xl">{copy.sideTitle}</h1>
            <p className="mt-4 max-w-sm text-sm leading-6 text-slate-600">{copy.sideDescription}</p>
            <div className="mt-5 flex items-start gap-2.5 text-sm font-medium text-slate-600">
              <Check className="mt-0.5 size-4 text-green-500" />
              <span className="text-xs">{copy.description}</span>
            </div>
          </div>

          <div className="p-6 sm:p-8 lg:p-10">
            <div className="mx-auto max-w-sm">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-indigo-600">{copy.eyebrow}</p>
              <h2 className="mt-2 font-display text-2xl font-bold text-slate-900 sm:text-3xl">{copy.title}</h2>

              <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                {success && (
                  <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-600">
                    {success}
                  </div>
                )}
                {error && (
                  <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
                    {error}
                  </div>
                )}
                {isRegister ? (
                  <AuthField 
                    icon={User} 
                    label="Full name" 
                    placeholder="Jane Cooper" 
                    value={formData.name}
                    onChange={handleInputChange("name")}
                  />
                ) : null}
                <AuthField 
                  icon={Mail} 
                  label="Email address" 
                  type="email" 
                  placeholder="you@company.com" 
                  value={formData.email}
                  onChange={handleInputChange("email")}
                />
                <AuthField 
                  icon={LockKeyhole} 
                  label="Password" 
                  type="password" 
                  placeholder="Enter your password" 
                  hasAction 
                  value={formData.password}
                  onChange={handleInputChange("password")}
                  showPassword={showPassword}
                  onTogglePassword={() => setShowPassword(!showPassword)}
                />

                <div className={cn("flex items-center", isRegister ? "justify-start" : "justify-between")}>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
                    <input type="checkbox" className="size-4 rounded border-slate-300 accent-indigo-600" defaultChecked />
                    {isRegister ? "I agree to the terms" : "Remember me"}
                  </label>
                  {!isRegister ? (
                    <Link href="#" className="text-sm font-semibold text-indigo-600 hover:text-purple-600">
                      Forgot Password?
                    </Link>
                  ) : null}
                </div>

                <Button type="submit" disabled={isLoading} className="h-12 w-full border-2 border-indigo-600 bg-gradient-to-r from-indigo-500 to-purple-600 text-base font-bold shadow-xl shadow-indigo-500/20 transition-all duration-300 hover:scale-[1.02] hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">
                  {isLoading ? "Processing..." : copy.submit}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-white px-4 text-slate-500">or continue with Google</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="h-12 w-full border-2 border-slate-300 bg-white text-base font-bold text-slate-800 shadow-md transition-all duration-300 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                >
                  <GoogleIcon />
                  {isLoading ? "Signing in..." : "Google"}
                </Button>
              </form>

              <p className="mt-5 text-center text-sm font-medium text-slate-600">
                {copy.alternate}{" "}
                <Link href={copy.alternateHref} className="font-bold text-indigo-600 hover:text-purple-600">
                  {copy.alternateAction}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
