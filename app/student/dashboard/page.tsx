"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { Bar, Pie } from "react-chartjs-2"
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js"
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
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

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
  const [profile, setProfile] = useState<{ name?: string; email?: string; profile?: { major?: string } } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const profileCompletion = useMemo(() => {
    if (!profile) return 0
    const checks = [
      Boolean(profile.name && profile.name.trim().length > 0),
      Boolean(profile.email && profile.email.trim().length > 0),
      Boolean(profile.profile?.major && profile.profile.major.trim().length > 0),
    ]
    const done = checks.filter(Boolean).length
    return Math.round((done / checks.length) * 100)
  }, [profile])

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
      const [applicationsRes, statsRes, profileRes] = await Promise.all([
        fetch("/api/student/applications", { cache: "no-store" }),
        fetch("/api/student/stats", { cache: "no-store" }),
        fetch("/api/profile", { cache: "no-store" }),
      ])
      if (applicationsRes.ok) setApplications(await applicationsRes.json())
      if (statsRes.ok) setStats(await statsRes.json())
      if (profileRes.ok) setProfile(await profileRes.json())
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "rejected":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case "funded":
        return <DollarSign className="h-4 w-4 text-blue-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700 border-green-200"
      case "rejected":
        return "bg-red-100 text-red-700 border-red-200"
      case "funded":
        return "bg-blue-100 text-blue-700 border-blue-200"
      default:
        return "bg-gray-100 text-gray-600 border-gray-200"
    }
  }

  // Chart data
  const statusBreakdown = useMemo(() => {
    const pending = applications.filter(a => a.status === "pending").length
    const approved = applications.filter(a => a.status === "approved").length
    const funded = applications.filter(a => a.status === "funded").length
    const rejected = applications.filter(a => a.status === "rejected").length
    return {
      labels: ["Pending", "Approved", "Funded", "Rejected"],
      datasets: [
        {
          label: "Applications",
          data: [pending, approved, funded, rejected],
          backgroundColor: ["#facc15", "#22c55e", "#3b82f6", "#ef4444"],
        },
      ],
    }
  }, [applications])

  const fundingOverview = useMemo(() => ({
    labels: applications.map(a => a.courseTitle),
    datasets: [
      {
        label: "Requested Amount",
        data: applications.map(a => a.amount),
        backgroundColor: "#93c5fd",
      },
      {
        label: "Funded Amount",
        data: applications.map(a => a.fundedAmount || 0),
        backgroundColor: "#3b82f6",
      },
    ],
  }), [applications])

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-5 w-96 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/70 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-semibold text-slate-800">SkillFund</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6 text-sm text-slate-600">
            <Link href="/student/courses" className="hover:text-blue-600 transition-colors">Courses</Link>
            <Link href="/student/applications" className="hover:text-blue-600 transition-colors">Applications</Link>
            <Link href="/student/profile" className="hover:text-blue-600 transition-colors">Profile</Link>
          </nav>
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{session?.user?.name?.slice(0, 2)?.toUpperCase() || "S"}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-slate-600 hidden sm:block">Hi, {session?.user?.name}</span>
            <Button variant="outline" onClick={() => router.push("/api/auth/signout")}>Sign Out</Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-10 space-y-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-4xl font-bold text-slate-800 mb-2">
            Welcome back, {session?.user?.name}!
          </h1>
          <p className="text-lg text-slate-600 mb-8">
            Track your progress and funding journey below.
          </p>
        </motion.div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { title: "Total Applications", value: stats.totalApplications, icon: FileText, color: "text-purple-600", bg: "bg-purple-50" },
            { title: "Approved", value: stats.approvedApplications, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
            { title: "Total Funding", value: `$${stats.totalFunding.toLocaleString()}`, icon: DollarSign, color: "text-blue-600", bg: "bg-blue-50" },
            { title: "Completed", value: stats.completedCourses, icon: TrendingUp, color: "text-yellow-600", bg: "bg-yellow-50" },
          ].map((stat, i) => (
            <motion.div key={i} whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
              <Card className={`border-slate-200 ${stat.bg} shadow-sm hover:shadow-md transition-shadow`}>
                <CardHeader className="flex items-center justify-between pb-1">
                  <CardTitle className="text-sm text-slate-600">{stat.title}</CardTitle>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Funding Overview</CardTitle>
              <CardDescription>Comparison of requested vs funded amounts</CardDescription>
            </CardHeader>
            <CardContent>
              <Bar data={fundingOverview} options={{ responsive: true, plugins: { legend: { position: "bottom" } } }} />
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Application Status Breakdown</CardTitle>
              <CardDescription>Current distribution of your applications</CardDescription>
            </CardHeader>
            <CardContent>
              <Pie data={statusBreakdown} options={{ responsive: true, plugins: { legend: { position: "bottom" } } }} />
            </CardContent>
          </Card>
        </div>

        {/* Profile Progress */}
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-slate-700">Profile Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Progress value={profileCompletion} className="h-2" />
              <span className="text-sm text-slate-600">{profileCompletion}%</span>
            </div>
            <p className="mt-3 text-sm text-slate-500">
              {profileCompletion < 100
                ? "Complete your profile to unlock full access."
                : "Nice! Your profile looks complete."}
            </p>
          </CardContent>
        </Card>

        {/* Recent Applications */}
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-slate-800">Recent Applications</CardTitle>
            <CardDescription className="text-slate-500">Your latest funding requests</CardDescription>
          </CardHeader>
          <CardContent>
            {applications.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-700 mb-2">No applications yet</h3>
                <p className="text-slate-500 mb-4">Start by exploring available courses.</p>
                <Link href="/student/courses">
                  <Button>Browse Courses</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {applications.slice(0, 5).map((a) => (
                  <motion.div
                    key={a._id}
                    className="flex items-center justify-between p-4 border border-slate-200 rounded-lg bg-slate-50 hover:bg-white transition-colors"
                    whileHover={{ scale: 1.01 }}
                  >
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(a.status)}
                      <div>
                        <h4 className="font-semibold text-slate-800">{a.courseTitle}</h4>
                        <p className="text-sm text-slate-500">
                          Applied on {new Date(a.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-semibold text-slate-800">${a.amount.toLocaleString()}</p>
                        {a.fundedAmount && (
                          <p className="text-sm text-blue-600">${a.fundedAmount.toLocaleString()} funded</p>
                        )}
                      </div>
                      <Badge className={getStatusColor(a.status)}>{a.status}</Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
