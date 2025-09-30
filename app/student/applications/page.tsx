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
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Calendar,
  ExternalLink,
  Plus,
  Upload,
  Building,
  Award,
} from "lucide-react"
import Link from "next/link"

interface FundApplication {
  _id: string
  type: "fund"
  courseTitle: string
  courseProvider: string
  courseUrl: string
  amount: number
  reason: string
  careerGoals: string
  timeline: string
  status: "pending" | "approved" | "rejected" | "funded"
  createdAt: string
  updatedAt: string
  fundedAmount?: number
  approvedBy?: string
}

interface CourseRequest {
  _id: string
  type: "course"
  title: string
  provider: string
  description: string
  category: string
  price: number
  duration: string
  certificationType: string
  url: string
  justification: string
  careerRelevance: string
  timeline: string
  status: "pending" | "approved" | "rejected"
  createdAt: string
  updatedAt: string
  documents: Record<string, any>
}

type Application = FundApplication | CourseRequest

export default function ApplicationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === "loading") return

    if (!session || session.user?.userType !== "student") {
      router.push("/auth/signin")
      return
    }

    fetchApplications()
  }, [session, status, router])

  const fetchApplications = async () => {
    try {
      const [fundResponse, courseResponse] = await Promise.all([
        fetch("/api/student/applications/detailed"),
        fetch("/api/student/course-requests"),
      ])

      const applications: Application[] = []

      if (fundResponse.ok) {
        const fundData = await fundResponse.json()
        applications.push(...fundData.map((app: any) => ({ ...app, type: "fund" })))
      }

      if (courseResponse.ok) {
        const courseData = await courseResponse.json()
        applications.push(...courseData.map((req: any) => ({ ...req, type: "course" })))
      }

      // Sort by creation date (newest first)
      applications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      setApplications(applications)
    } catch (error) {
      console.error("Error fetching applications:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-5 w-5 text-accent" />
      case "rejected":
        return <AlertCircle className="h-5 w-5 text-destructive" />
      case "funded":
        return <DollarSign className="h-5 w-5 text-primary" />
      default:
        return <Clock className="h-5 w-5 text-foreground-muted" />
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

  const getTypeIcon = (type: string) => {
    return type === "fund" ? (
      <DollarSign className="h-4 w-4 text-primary" />
    ) : (
      <BookOpen className="h-4 w-4 text-secondary" />
    )
  }

  const getTypeLabel = (type: string) => {
    return type === "fund" ? "Fund Application" : "Course Request"
  }

  const filterApplications = (status: string) => {
    if (status === "all") return applications
    return applications.filter((app) => app.status === status)
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-foreground-muted">Loading your applications...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">My Applications</h1>
            <p className="text-xl text-foreground-muted">Track your funding requests and course applications</p>
          </div>
          <Link href="/student/request-course">
            <Button className="bg-primary hover:bg-primary-hover">
              <Plus className="h-4 w-4 mr-2" />
              Request Course
            </Button>
          </Link>
        </div>

        {applications.length === 0 ? (
          <Card className="border-border bg-card">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-foreground-muted mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No applications yet</h3>
                <p className="text-foreground-muted mb-4">Start by requesting a course or browsing available courses</p>
                <div className="flex gap-4 justify-center">
                  <Link href="/student/request-course">
                    <Button className="bg-primary hover:bg-primary-hover">Request Course</Button>
                  </Link>
                  <Link href="/student/courses">
                    <Button variant="outline">Browse Courses</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All ({applications.length})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({filterApplications("pending").length})</TabsTrigger>
              <TabsTrigger value="approved">Approved ({filterApplications("approved").length})</TabsTrigger>
              <TabsTrigger value="funded">Funded ({filterApplications("funded").length})</TabsTrigger>
              <TabsTrigger value="rejected">Rejected ({filterApplications("rejected").length})</TabsTrigger>
            </TabsList>

            {["all", "pending", "approved", "funded", "rejected"].map((tabValue) => (
              <TabsContent key={tabValue} value={tabValue} className="space-y-6">
                {filterApplications(tabValue).map((application) => (
                  <Card key={application._id} className="border-border bg-card">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            {getStatusIcon(application.status)}
                            <CardTitle className="text-foreground">
                              {application.type === "fund"
                                ? (application as FundApplication).courseTitle
                                : (application as CourseRequest).title}
                            </CardTitle>
                            <Badge className={getStatusColor(application.status)}>{application.status}</Badge>
                            <Badge variant="outline" className="flex items-center gap-1">
                              {getTypeIcon(application.type)}
                              {getTypeLabel(application.type)}
                            </Badge>
                          </div>
                          <CardDescription className="text-foreground-muted">
                            by{" "}
                            {application.type === "fund"
                              ? (application as FundApplication).courseProvider
                              : (application as CourseRequest).provider}
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">
                            $
                            {(application.type === "fund"
                              ? (application as FundApplication).amount
                              : (application as CourseRequest).price
                            ).toLocaleString()}
                          </div>
                          {application.type === "fund" && (application as FundApplication).fundedAmount && (
                            <div className="text-sm text-accent">
                              ${(application as FundApplication).fundedAmount!.toLocaleString()} funded
                            </div>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          {application.type === "fund" ? (
                            <>
                              <h4 className="font-semibold text-foreground mb-2">Why you need funding:</h4>
                              <p className="text-sm text-foreground-muted mb-4">
                                {(application as FundApplication).reason}
                              </p>
                              <h4 className="font-semibold text-foreground mb-2">Career goals:</h4>
                              <p className="text-sm text-foreground-muted">
                                {(application as FundApplication).careerGoals}
                              </p>
                            </>
                          ) : (
                            <>
                              <h4 className="font-semibold text-foreground mb-2">Course Description:</h4>
                              <p className="text-sm text-foreground-muted mb-4">
                                {(application as CourseRequest).description}
                              </p>
                              <h4 className="font-semibold text-foreground mb-2">Justification:</h4>
                              <p className="text-sm text-foreground-muted">
                                {(application as CourseRequest).justification}
                              </p>
                            </>
                          )}
                        </div>
                        <div>
                          <div className="space-y-3">
                            {application.type === "course" && (
                              <>
                                <div className="flex items-center text-sm text-foreground-muted">
                                  <Building className="h-4 w-4 mr-2" />
                                  <span>Category: {(application as CourseRequest).category}</span>
                                </div>
                                <div className="flex items-center text-sm text-foreground-muted">
                                  <Clock className="h-4 w-4 mr-2" />
                                  <span>Duration: {(application as CourseRequest).duration}</span>
                                </div>
                                <div className="flex items-center text-sm text-foreground-muted">
                                  <Award className="h-4 w-4 mr-2" />
                                  <span>Type: {(application as CourseRequest).certificationType}</span>
                                </div>
                              </>
                            )}
                            <div className="flex items-center text-sm text-foreground-muted">
                              <Calendar className="h-4 w-4 mr-2" />
                              <span>Timeline: {application.timeline}</span>
                            </div>
                            <div className="flex items-center text-sm text-foreground-muted">
                              <Clock className="h-4 w-4 mr-2" />
                              <span>Applied: {new Date(application.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center text-sm text-foreground-muted">
                              <FileText className="h-4 w-4 mr-2" />
                              <span>Updated: {new Date(application.updatedAt).toLocaleDateString()}</span>
                            </div>
                            {application.type === "course" && (application as CourseRequest).documents && (
                              <div className="flex items-center text-sm text-foreground-muted">
                                <Upload className="h-4 w-4 mr-2" />
                                <span>
                                  {Object.keys((application as CourseRequest).documents).length} documents uploaded
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="mt-4 pt-4 border-t border-border">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                window.open(
                                  application.type === "fund"
                                    ? (application as FundApplication).courseUrl
                                    : (application as CourseRequest).url,
                                  "_blank",
                                )
                              }
                              className="w-full"
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              View Course Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </div>
  )
}
