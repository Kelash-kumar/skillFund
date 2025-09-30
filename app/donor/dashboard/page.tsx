"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Heart, Users, TrendingUp, DollarSign, Award, Target, Gift, Star, ArrowRight } from "lucide-react"
import Link from "next/link"

interface DonationStats {
  totalDonated: number
  studentsSupported: number
  coursesCompleted: number
  activeSponsorship: number
}

interface RecentDonation {
  _id: string
  studentName: string
  courseTitle: string
  amount: number
  status: string
  createdAt: string
}

interface SponsoredStudent {
  _id: string
  studentName: string
  courseTitle: string
  progress: number
  totalAmount: number
  fundedAmount: number
}

export default function DonorDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DonationStats>({
    totalDonated: 0,
    studentsSupported: 0,
    coursesCompleted: 0,
    activeSponsorship: 0,
  })
  const [recentDonations, setRecentDonations] = useState<RecentDonation[]>([])
  const [sponsoredStudents, setSponsoredStudents] = useState<SponsoredStudent[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "loading") return

    if (!session || session.user?.userType !== "donor") {
      router.push("/auth/signin")
      return
    }

    fetchDashboardData()
  }, [session, status, router])

  const fetchDashboardData = async () => {
    try {
      const [statsRes, donationsRes, studentsRes] = await Promise.all([
        fetch("/api/donor/stats"),
        fetch("/api/donor/donations"),
        fetch("/api/donor/sponsored-students"),
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }

      if (donationsRes.ok) {
        const donationsData = await donationsRes.json()
        setRecentDonations(donationsData)
      }

      if (studentsRes.ok) {
        const studentsData = await studentsRes.json()
        setSponsoredStudents(studentsData)
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
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
              <span className="text-2xl font-bold text-foreground">ScholarFund</span>
            </Link>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/donor/students" className="text-foreground-muted hover:text-foreground transition-colors">
              Browse Students
            </Link>
            <Link href="/donor/donations" className="text-foreground-muted hover:text-foreground transition-colors">
              My Donations
            </Link>
            <Link href="/donor/impact" className="text-foreground-muted hover:text-foreground transition-colors">
              Impact Report
            </Link>
            <Link href="/profile" className="text-foreground-muted hover:text-foreground transition-colors">
              Profile
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
          <p className="text-xl text-foreground-muted">Thank you for empowering students through education funding</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground-muted">Total Donated</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">${stats.totalDonated.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground-muted">Students Supported</CardTitle>
              <Users className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.studentsSupported}</div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground-muted">Courses Completed</CardTitle>
              <Award className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.coursesCompleted}</div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-foreground-muted">Active Sponsorships</CardTitle>
              <Heart className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.activeSponsorship}</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/donor/students">
            <Card className="border-border bg-card hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-foreground">Browse Students</CardTitle>
                    <CardDescription className="text-foreground-muted">Find students to sponsor</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/donor/donate">
            <Card className="border-border bg-card hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                    <Gift className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <CardTitle className="text-foreground">Make a Donation</CardTitle>
                    <CardDescription className="text-foreground-muted">Support education funding</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/donor/impact">
            <Card className="border-border bg-card hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <CardTitle className="text-foreground">View Impact</CardTitle>
                    <CardDescription className="text-foreground-muted">See your contribution impact</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sponsored Students */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center">
                <Star className="h-5 w-5 mr-2" />
                Sponsored Students
              </CardTitle>
              <CardDescription className="text-foreground-muted">
                Track the progress of students you're supporting
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sponsoredStudents.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-foreground-muted mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No sponsored students yet</h3>
                  <p className="text-foreground-muted mb-4">Start by browsing students who need funding</p>
                  <Link href="/donor/students">
                    <Button className="bg-primary hover:bg-primary-hover">Browse Students</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {sponsoredStudents.slice(0, 3).map((student) => (
                    <div
                      key={student._id}
                      className="p-4 border border-border rounded-lg bg-background-muted space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-foreground">{student.studentName}</h4>
                          <p className="text-sm text-foreground-muted">{student.courseTitle}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-primary">
                            ${student.fundedAmount.toLocaleString()} / ${student.totalAmount.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-foreground-muted">Progress</span>
                          <span className="text-foreground">{student.progress}%</span>
                        </div>
                        <Progress value={student.progress} className="h-2" />
                      </div>
                    </div>
                  ))}
                  {sponsoredStudents.length > 3 && (
                    <div className="text-center pt-4">
                      <Link href="/donor/students">
                        <Button variant="outline">View All Sponsored Students</Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Donations */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center">
                <Gift className="h-5 w-5 mr-2" />
                Recent Donations
              </CardTitle>
              <CardDescription className="text-foreground-muted">
                Your latest contributions to student funding
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentDonations.length === 0 ? (
                <div className="text-center py-8">
                  <Gift className="h-12 w-12 text-foreground-muted mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No donations yet</h3>
                  <p className="text-foreground-muted mb-4">Make your first donation to support a student</p>
                  <Link href="/donor/donate">
                    <Button className="bg-secondary hover:bg-secondary-hover">Make a Donation</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentDonations.slice(0, 5).map((donation) => (
                    <div
                      key={donation._id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg bg-background-muted"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <DollarSign className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">{donation.studentName}</h4>
                          <p className="text-sm text-foreground-muted">{donation.courseTitle}</p>
                          <p className="text-xs text-foreground-muted">
                            {new Date(donation.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary">${donation.amount.toLocaleString()}</p>
                        <Badge variant={donation.status === "completed" ? "default" : "secondary"} className="text-xs">
                          {donation.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {recentDonations.length > 5 && (
                    <div className="text-center pt-4">
                      <Link href="/donor/donations">
                        <Button variant="outline">View All Donations</Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Impact Summary */}
        <Card className="border-border bg-card mt-8">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Your Impact This Year
            </CardTitle>
            <CardDescription className="text-foreground-muted">
              See how your contributions are making a difference
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">{stats.studentsSupported}</div>
                <p className="text-foreground-muted">Students Empowered</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary mb-2">{stats.coursesCompleted}</div>
                <p className="text-foreground-muted">Certifications Earned</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent mb-2">
                  {stats.studentsSupported > 0
                    ? Math.round((stats.coursesCompleted / stats.studentsSupported) * 100)
                    : 0}
                  %
                </div>
                <p className="text-foreground-muted">Success Rate</p>
              </div>
            </div>
            <div className="mt-6 text-center">
              <Link href="/donor/impact">
                <Button className="bg-accent hover:bg-accent-hover">
                  View Detailed Impact Report
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
