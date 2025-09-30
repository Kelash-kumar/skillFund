import type React from "react"
import { AuthGuard } from "@/components/auth-guard"
import { Navigation } from "@/components/navigation"

export default function DonorLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requiredUserType="donor">
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="lg:pl-64">
          <main className="py-6">{children}</main>
        </div>
      </div>
    </AuthGuard>
  )
}
