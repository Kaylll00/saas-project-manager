"use client"

import { signOut, useSession } from "next-auth/react"
import { LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function UserMenu() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="h-10 w-10 rounded-full bg-slate-200 animate-pulse" />
    )
  }

  if (!session?.user) {
    return (
      <div className="flex items-center space-x-3">
        <Button asChild variant="ghost" size="default" className="hover:bg-slate-100 font-medium border-2 border-slate-300 hover:border-slate-400 hover:scale-105 transition-all duration-200">
          <Link href="/login">Log in</Link>
        </Button>
        <Button asChild size="default" className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg hover:shadow-2xl transition-all duration-200 font-semibold px-6 border-2 border-indigo-600 hover:scale-110">
          <Link href="/register">Get Started</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-3">
      <div className="hidden sm:flex items-center space-x-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200">
        {session.user.image ? (
          <img
            src={session.user.image}
            alt={session.user.name || "User"}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
        )}
        <span className="text-sm font-medium text-slate-700">{session.user.name || session.user.email}</span>
      </div>
      <Button
        variant="ghost"
        size="default"
        onClick={() => signOut({ callbackUrl: "/" })}
        className="hover:bg-red-50 hover:text-red-600 font-medium border-2 border-slate-300 hover:border-red-300 transition-all duration-200"
      >
        <LogOut className="w-4 h-4 sm:mr-2" />
        <span className="hidden sm:inline">Sign Out</span>
      </Button>
    </div>
  )
}
