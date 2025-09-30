"use client"

import type React from "react"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { BookOpen } from "lucide-react"

interface AuthGuardProps {
  children: React.ReactNode
  requiredUserType?: string
  redirectTo?: string
}

export function AuthGuard({ children, requiredUserType, redirectTo = "/auth/signin" }: AuthGuardProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push(redirectTo)
      return
    }

    if (requiredUserType && session.user?.userType !== requiredUserType) {
      // Redirect to appropriate dashboard based on user type
      switch (session.user?.userType) {
        case "student":
          router.push("/student/dashboard")
          break
        case "donor":
          router.push("/donor/dashboard")
          break
        case "admin":
          router.push("/admin/dashboard")
          break
        default:
          router.push("/")
      }
    }
  }, [session, status, router, requiredUserType, redirectTo])

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-foreground-muted">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session || (requiredUserType && session.user?.userType !== requiredUserType)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-12 w-12 text-primary mx-auto mb-4" />
          <p className="text-foreground-muted">Redirecting...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
