"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { BookOpen, TrendingUp, Users, Award, DollarSign } from "lucide-react"
import Link from "next/link"

interface Stats {
  totalDonated: number
  studentsSupported: number
  coursesCompleted: number
  activeSponsorship: number
}

interface SponsoredStudent {
  _id: string
  studentName: string
  courseTitle: string
  progress: number
  totalAmount: number
  fundedAmount: number
}

export default function DonorImpactPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<Stats | null>(null)
  const [students, setStudents] = useState<SponsoredStudent[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "loading") return
    if (!session || session.user?.userType !== "donor") {
      router.push("/auth/signin")
      return
    }
    fetchData()
  }, [session, status, router])

  const fetchData = async () => {
    try {
      const [statsRes, studentsRes] = await Promise.all([
        fetch("/api/donor/stats"),
        fetch("/api/donor/sponsored-students"),
      ])
      if (statsRes.ok) setStats(await statsRes.json())
      if (studentsRes.ok) setStudents(await studentsRes.json())
    } catch (e) {
      console.error("Error fetching impact data:", e)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === "loading" || isLoading || !stats) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <TrendingUp className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-foreground-muted">Loading your impact...</p>
        </div>
      </div>
    )
  }

  const successRate = stats.studentsSupported > 0
    ? Math.round((stats.coursesCompleted / stats.studentsSupported) * 100)
    : 0

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
            <Link href="/donor/donations" className="text-foreground-muted hover:text-foreground transition-colors">
              My Donations
            </Link>
            <Link href="/donor/impact" className="text-primary font-medium">
              Impact Report
            </Link>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Your Impact</h1>
          <p className="text-xl text-foreground-muted">A summary of how your contributions change lives</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-sm text-foreground-muted">Total Donated</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary flex items-center">
                <DollarSign className="h-6 w-6 mr-1" />
                {stats.totalDonated.toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-sm text-foreground-muted">Students Supported</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {stats.studentsSupported}
              </div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-sm text-foreground-muted">Certifications Earned</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {stats.coursesCompleted}
              </div>
            </CardContent>
          </Card>
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-sm text-foreground-muted">Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">{successRate}%</div>
            </CardContent>
          </Card>
        </div>

        {/* Sponsored students list */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Sponsored Students
            </CardTitle>
            <CardDescription className="text-foreground-muted">
              Track the progress of students you’re supporting
            </CardDescription>
          </CardHeader>
          <CardContent>
            {students.length === 0 ? (
              <div className="text-center py-8 text-foreground-muted">
                You haven't sponsored any students yet. Browse students to get started.
                <div className="mt-4">
                  <Link href="/donor/students">
                    <Button>Browse Students</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {students.map((s) => (
                  <div key={s._id} className="p-4 border border-border rounded-lg bg-background-muted">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-foreground">{s.studentName}</div>
                        <div className="text-sm text-foreground-muted">{s.courseTitle}</div>
                      </div>
                      <div className="text-sm text-foreground-muted">
                        ${s.fundedAmount.toLocaleString()} / ${s.totalAmount.toLocaleString()}
                      </div>
                    </div>
                    <div className="mt-2">
                      <Progress value={s.progress} className="h-2" />
                      <div className="text-xs text-right text-foreground-muted mt-1">{s.progress}% funded</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
