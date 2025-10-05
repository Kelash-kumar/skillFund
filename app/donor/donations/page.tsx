"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DollarSign, Gift, BookOpen } from "lucide-react"
import Link from "next/link"

interface DonationItem {
  _id: string
  studentName: string
  courseTitle: string
  amount: number
  status: string
  createdAt: string
}

export default function DonorDonationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [donations, setDonations] = useState<DonationItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "loading") return

    if (!session || session.user?.userType !== "donor") {
      router.push("/auth/signin")
      return
    }

    fetchDonations()
  }, [session, status, router])

  const fetchDonations = async () => {
    try {
      const res = await fetch("/api/donor/donations")
      if (res.ok) {
        const data = await res.json()
        setDonations(data)
      }
    } catch (e) {
      console.error("Error fetching donations:", e)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Gift className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-foreground-muted">Loading your donations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link href="/" className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-foreground">SkillFund</span>
            </Link>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/donor/dashboard" className="text-foreground-muted hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <Link href="/donor/students" className="text-foreground-muted hover:text-foreground transition-colors">
              Browse Students
            </Link>
            <Link href="/donor/donations" className="text-primary font-medium">
              My Donations
            </Link>
            <Link href="/profile" className="text-foreground-muted hover:text-foreground transition-colors">
              Profile
            </Link>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">My Donations</h1>
          <p className="text-xl text-foreground-muted">A record of your contributions to student funding</p>
        </div>

        {donations.length === 0 ? (
          <Card className="border-border bg-card">
            <CardContent className="pt-6 text-center">
              <Gift className="h-12 w-12 text-foreground-muted mx-auto mb-4" />
              <p className="text-foreground-muted mb-4">You haven't made any donations yet.</p>
              <Link href="/donor/students">
                <Button>Browse Students</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {donations.map((d) => (
              <Card key={d._id} className="border-border bg-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-foreground">{d.studentName}</CardTitle>
                    <CardDescription className="text-foreground-muted">{d.courseTitle}</CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-primary flex items-center justify-end">
                      <DollarSign className="h-4 w-4 mr-1" />
                      {d.amount.toLocaleString()}
                    </div>
                    <Badge variant={d.status === "completed" ? "default" : d.status === "refunded" ? "destructive" : "secondary"} className="mt-1">
                      {d.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-foreground-muted">
                    Donated on {new Date(d.createdAt).toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
