"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BookOpen,
  Users,
  FileText,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  Shield,
} from "lucide-react"
import Link from "next/link"

interface AdminStats {
  totalUsers: number
  totalStudents: number
  totalDonors: number
  totalApplications: number
  pendingApplications: number
  approvedApplications: number
  totalFunding: number
  totalCourses: number
  pendingCourses: number
}

interface RecentActivity {
  _id: string
  type: "application" | "donation" | "course_request"
  description: string
  amount?: number
  status: string
  createdAt: string
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalStudents: 0,
    totalDonors: 0,
    totalApplications: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    totalFunding: 0,
    totalCourses: 0,
    pendingCourses: 0,
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "loading") return

    if (!session || session.user?.userType !== "admin") {
      router.push("/auth/signin")
      return
    }

    fetchDashboardData()
  }, [session, status, router])

  const fetchDashboardData = async () => {
    try {
      const [statsRes, activityRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/recent-activity"),
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }

      if (activityRes.ok) {
        const activityData = await activityRes.json()
        setRecentActivity(activityData)
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "application":
        return <FileText className="h-4 w-4 text-primary" />
      case "donation":
        return <DollarSign className="h-4 w-4 text-accent" />
      case "course_request":
        return <BookOpen className="h-4 w-4 text-secondary" />
      default:
        return <AlertCircle className="h-4 w-4 text-foreground-muted" />
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-foreground-muted">Loading admin dashboard...</p>
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
              <span className="text-2xl font-bold text-foreground">ScholarFund</span>
            </Link>
            <Badge variant="secondary" className="ml-2">
              Admin
            </Badge>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/admin/applications" className="text-foreground-muted hover:text-foreground transition-colors">
              Applications
            </Link>
            <Link href="/admin/courses" className="text-foreground-muted hover:text-foreground transition-colors">
              Courses
            </Link>
            <Link href="/admin/users" className="text-foreground-muted hover:text-foreground transition-colors">
              Users
            </Link>
            <Link href="/admin/analytics" className="text-foreground-muted hover:text-foreground transition-colors">
              Analytics
            </Link>
          </nav>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-foreground-muted">Admin: {session?.user?.name}</span>
            <Button variant="outline" onClick={() => router.push("/api/auth/signout")}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-xl text-foreground-muted">Manage the ScholarFund platform and monitor key metrics</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground-muted">Total Users</CardTitle>
              <Users className="h-4 w-4 text-foreground-muted" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-foreground-muted">
                {stats.totalStudents} students, {stats.totalDonors} donors
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground-muted">Applications</CardTitle>
              <FileText className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.totalApplications.toLocaleString()}</div>
              <p className="text-xs text-foreground-muted">{stats.pendingApplications} pending review</p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground-muted">Total Funding</CardTitle>
              <DollarSign className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">${stats.totalFunding.toLocaleString()}</div>
              <p className="text-xs text-foreground-muted">Platform lifetime funding</p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground-muted">Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.totalCourses.toLocaleString()}</div>
              <p className="text-xs text-foreground-muted">{stats.pendingCourses} pending approval</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Link href="/admin/applications">
            <Card className="border-border bg-card hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-sm text-foreground">Review Applications</CardTitle>
                    <CardDescription className="text-xs text-foreground-muted">
                      {stats.pendingApplications} pending
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/admin/courses">
            <Card className="border-border bg-card hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <CardTitle className="text-sm text-foreground">Manage Courses</CardTitle>
                    <CardDescription className="text-xs text-foreground-muted">
                      {stats.pendingCourses} pending
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/admin/users">
            <Card className="border-border bg-card hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <CardTitle className="text-sm text-foreground">User Management</CardTitle>
                    <CardDescription className="text-xs text-foreground-muted">
                      {stats.totalUsers} total users
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/admin/analytics">
            <Card className="border-border bg-card hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-sm text-foreground">Analytics</CardTitle>
                    <CardDescription className="text-xs text-foreground-muted">Platform insights</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Platform Overview</TabsTrigger>
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
            <TabsTrigger value="alerts">System Alerts</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Application Status */}
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-foreground">Application Status</CardTitle>
                  <CardDescription className="text-foreground-muted">Current application pipeline</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-foreground-muted" />
                      <span className="text-sm text-foreground">Pending Review</span>
                    </div>
                    <Badge variant="secondary">{stats.pendingApplications}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-accent" />
                      <span className="text-sm text-foreground">Approved</span>
                    </div>
                    <Badge className="bg-accent/10 text-accent border-accent/20">{stats.approvedApplications}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-primary" />
                      <span className="text-sm text-foreground">Funded</span>
                    </div>
                    <Badge className="bg-primary/10 text-primary border-primary/20">
                      {stats.totalApplications - stats.pendingApplications - stats.approvedApplications}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Platform Health */}
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-foreground">Platform Health</CardTitle>
                  <CardDescription className="text-foreground-muted">Key performance indicators</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">Success Rate</span>
                    <span className="text-sm font-semibold text-accent">
                      {stats.totalApplications > 0
                        ? Math.round(
                            ((stats.totalApplications - stats.pendingApplications) / stats.totalApplications) * 100,
                          )
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">Avg. Funding per Student</span>
                    <span className="text-sm font-semibold text-primary">
                      $
                      {stats.totalStudents > 0
                        ? Math.round(stats.totalFunding / stats.totalStudents).toLocaleString()
                        : 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">Active Courses</span>
                    <span className="text-sm font-semibold text-secondary">{stats.totalCourses}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Recent Platform Activity</CardTitle>
                <CardDescription className="text-foreground-muted">Latest actions across the platform</CardDescription>
              </CardHeader>
              <CardContent>
                {recentActivity.length === 0 ? (
                  <div className="text-center py-8">
                    <TrendingUp className="h-12 w-12 text-foreground-muted mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No recent activity</h3>
                    <p className="text-foreground-muted">
                      Activity will appear here as users interact with the platform
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div
                        key={activity._id}
                        className="flex items-center space-x-4 p-4 border border-border rounded-lg bg-background-muted"
                      >
                        {getActivityIcon(activity.type)}
                        <div className="flex-1">
                          <p className="text-sm text-foreground">{activity.description}</p>
                          <p className="text-xs text-foreground-muted">
                            {new Date(activity.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {activity.amount && (
                            <span className="text-sm font-semibold text-primary">
                              ${activity.amount.toLocaleString()}
                            </span>
                          )}
                          <Badge variant={activity.status === "completed" ? "default" : "secondary"}>
                            {activity.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">System Alerts</CardTitle>
                <CardDescription className="text-foreground-muted">
                  Important notifications and warnings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.pendingApplications > 10 && (
                    <div className="flex items-center space-x-3 p-4 border border-orange-200 rounded-lg bg-orange-50">
                      <AlertCircle className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="text-sm font-semibold text-orange-800">High Application Volume</p>
                        <p className="text-xs text-orange-600">
                          {stats.pendingApplications} applications are pending review
                        </p>
                      </div>
                      <Link href="/admin/applications">
                        <Button size="sm" variant="outline" className="ml-auto bg-transparent">
                          Review
                        </Button>
                      </Link>
                    </div>
                  )}

                  {stats.pendingCourses > 5 && (
                    <div className="flex items-center space-x-3 p-4 border border-blue-200 rounded-lg bg-blue-50">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-semibold text-blue-800">Course Requests Pending</p>
                        <p className="text-xs text-blue-600">{stats.pendingCourses} course requests need approval</p>
                      </div>
                      <Link href="/admin/courses">
                        <Button size="sm" variant="outline" className="ml-auto bg-transparent">
                          Review
                        </Button>
                      </Link>
                    </div>
                  )}

                  {stats.pendingApplications <= 10 && stats.pendingCourses <= 5 && (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-accent mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">All Clear</h3>
                      <p className="text-foreground-muted">No urgent alerts at this time</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
