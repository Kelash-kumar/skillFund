"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  BookOpen,
  Search,
  FileText,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  DollarSign,
  Users,
} from "lucide-react"
import Link from "next/link"

interface Application {
  _id: string
  courseTitle: string
  amount: number
  status: "pending" | "approved" | "rejected" | "funded"
  createdAt: string
  fundedAmount?: number
}

export default function StudentDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [applications, setApplications] = useState<Application[]>([])
  const [stats, setStats] = useState({
    totalApplications: 0,
    approvedApplications: 0,
    totalFunding: 0,
    completedCourses: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "loading") return

    if (!session || session.user?.userType !== "student") {
      router.push("/auth/signin")
      return
    }

    fetchDashboardData()
  }, [session, status, router])

  const fetchDashboardData = async () => {
    try {
      const [applicationsRes, statsRes] = await Promise.all([
        fetch("/api/student/applications"),
        fetch("/api/student/stats"),
      ])

      if (applicationsRes.ok) {
        const applicationsData = await applicationsRes.json()
        setApplications(applicationsData)
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-accent" />
      case "rejected":
        return <AlertCircle className="h-4 w-4 text-destructive" />
      case "funded":
        return <DollarSign className="h-4 w-4 text-primary" />
      default:
        return <Clock className="h-4 w-4 text-foreground-muted" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-accent/10 text-accent border-accent/20"
      case "rejected":
        return "bg-destructive/10 text-destructive border-destructive/20"
      case "funded":
        return "bg-primary/10 text-primary border-primary/20"
      default:
        return "bg-foreground-muted/10 text-foreground-muted border-foreground-muted/20"
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-foreground-muted">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link href="/" className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-foreground">SkillFund</span>
            </Link>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/student/courses" className="text-foreground-muted hover:text-foreground transition-colors">
              Browse Courses
            </Link>
            <Link
              href="/student/applications"
              className="text-foreground-muted hover:text-foreground transition-colors"
            >
              My Applications
            </Link>
        <Link href="/student/profile" className="text-foreground-muted hover:text-foreground transition-colors">
          View Profile
        </Link>
          </nav>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-foreground-muted">Welcome, {session?.user?.name}</span>
            <Button variant="outline" onClick={() => router.push("/api/auth/signout")}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Welcome back, {session?.user?.name}!</h1>
          <p className="text-xl text-foreground-muted">
            Track your funding applications and discover new opportunities
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground-muted">Total Applications</CardTitle>
              <FileText className="h-4 w-4 text-foreground-muted" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.totalApplications}</div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground-muted">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.approvedApplications}</div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground-muted">Total Funding</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">${stats.totalFunding.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground-muted">Completed</CardTitle>
              <TrendingUp className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.completedCourses}</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/student/courses">
            <Card className="border-border bg-card hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Search className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-foreground">Browse Courses</CardTitle>
                    <CardDescription className="text-foreground-muted">Find your next certification</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/student/request-course">
            <Card className="border-border bg-card hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                    <Plus className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <CardTitle className="text-foreground">Request Course</CardTitle>
                    <CardDescription className="text-foreground-muted">
                      Request a new course with funding
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/student/profile">
            <Card className="border-border bg-card hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <CardTitle className="text-foreground">Update Profile</CardTitle>
                    <CardDescription className="text-foreground-muted">Manage your information</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>
        </div>

        {/* Recent Applications */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Recent Applications</CardTitle>
            <CardDescription className="text-foreground-muted">
              Track the status of your funding requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            {applications.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-foreground-muted mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No applications yet</h3>
                <p className="text-foreground-muted mb-4">Start by browsing courses and applying for funding</p>
                <Link href="/student/courses">
                  <Button className="bg-primary hover:bg-primary-hover">Browse Courses</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.slice(0, 5).map((application) => (
                  <div
                    key={application._id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg bg-background-muted"
                  >
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(application.status)}
                      <div>
                        <h4 className="font-semibold text-foreground">{application.courseTitle}</h4>
                        <p className="text-sm text-foreground-muted">
                          Applied on {new Date(application.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-semibold text-foreground">${application.amount.toLocaleString()}</p>
                        {application.fundedAmount && (
                          <p className="text-sm text-accent">${application.fundedAmount.toLocaleString()} funded</p>
                        )}
                      </div>
                      <Badge className={getStatusColor(application.status)}>{application.status}</Badge>
                    </div>
                  </div>
                ))}
                {applications.length > 5 && (
                  <div className="text-center pt-4">
                    <Link href="/student/applications">
                      <Button variant="outline">View All Applications</Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
