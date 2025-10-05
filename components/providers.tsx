"use client"

import type React from "react"

import { SessionProvider } from "next-auth/react"
import { Suspense } from "react"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-foreground-muted">Loading SkillFund...</p>
          </div>
        </div>
      }
    >
      <SessionProvider>{children}</SessionProvider>
    </Suspense>
  )
}
