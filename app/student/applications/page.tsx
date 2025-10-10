"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"
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
  Trash2,
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
  requestType: "available-course" | "new-course" | "certification"
  // Available course fields
  courseId?: string
  // New course fields  
  title?: string
  provider?: string
  description?: string
  category?: string
  courseUrl?: string
  duration?: string
  // Certification fields
  certificationType?: string
  // Common fields
  reason: string
  careerGoals: string
  previousExperience: string
  expectedOutcome: string
  urgency: string
  price?: number // legacy field
  estimatedFee?: number // new field
  // Legacy fields
  url?: string
  justification?: string
  careerRelevance?: string
  timeline?: string
  status: "pending" | "approved" | "rejected"
  createdAt: string
  updatedAt: string
  documents: Record<string, any>
}

type Application = FundApplication | CourseRequest

export default function ApplicationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

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
      // Use the updated detailed API that returns both fund applications and course requests
      const response = await fetch("/api/student/applications/detailed")

      if (response.ok) {
        const data = await response.json()
        setApplications(data)
      } else {
        console.error("Error fetching applications:", response.statusText)
      }
    } catch (error) {
      console.error("Error fetching applications:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteApplication = async (applicationId: string) => {
    setDeletingId(applicationId)
    
    try {
      const response = await fetch(`/api/student/applications/${applicationId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        const result = await response.json()
        
        toast({
          title: "Application Deleted",
          description: `Application and ${result.filesDeleted} associated files have been removed.`,
        })

        // Remove the application from the local state
        setApplications(prev => prev.filter(app => app._id !== applicationId))
      } else {
        const error = await response.json()
        toast({
          title: "Delete Failed",
          description: error.message || "Failed to delete application. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting application:", error)
      toast({
        title: "Error",
        description: "An error occurred while deleting the application.",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
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
            <Link href="/student/dashboard" className="text-foreground-muted hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <Link href="/student/courses" className="text-foreground-muted hover:text-foreground transition-colors">
              Browse Courses
            </Link>
            <Link
              href="/student/applications"
              className="text-primary font-medium "
            >
              My Applications
            </Link>
            <Link href="/student/profile" className="text-foreground-muted hover:text-foreground transition-colors">
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
                                : (application as CourseRequest).title || 
                                  (application as CourseRequest).certificationType || 
                                  "Course Request"}
                            </CardTitle>
                            <Badge className={getStatusColor(application.status)}>{application.status}</Badge>
                            <Badge variant="outline" className="flex items-center gap-1">
                              {getTypeIcon(application.type)}
                              {getTypeLabel(application.type)}
                            </Badge>
                          </div>
                          <CardDescription className="text-foreground-muted">
                            {(application.type === "fund"
                              ? (application as FundApplication).courseProvider
                              : (application as CourseRequest).provider) && (
                              <>by {application.type === "fund"
                                ? (application as FundApplication).courseProvider
                                : (application as CourseRequest).provider}</>
                            )}
                            {(application as CourseRequest).requestType && (
                              <span className="ml-2 text-xs bg-muted px-2 py-1 rounded">
                                {(application as CourseRequest).requestType}
                              </span>
                            )}
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">
                            $
                            {(application.type === "fund"
                              ? (application as FundApplication).amount || 0
                              : (application as CourseRequest).price || 
                                (application as CourseRequest).estimatedFee || 0
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
                              <h4 className="font-semibold text-foreground mb-2">Reason for Request:</h4>
                              <p className="text-sm text-foreground-muted mb-4">
                                {(application as CourseRequest).reason}
                              </p>
                              <h4 className="font-semibold text-foreground mb-2">Career Goals:</h4>
                              <p className="text-sm text-foreground-muted mb-4">
                                {(application as CourseRequest).careerGoals}
                              </p>
                              {(application as CourseRequest).description && (
                                <>
                                  <h4 className="font-semibold text-foreground mb-2">Description:</h4>
                                  <p className="text-sm text-foreground-muted">
                                    {(application as CourseRequest).description}
                                  </p>
                                </>
                              )}
                            </>
                          )}
                        </div>
                        <div>
                          <div className="space-y-3">
                            {application.type === "course" && (
                              <>
                                {(application as CourseRequest).category && (
                                  <div className="flex items-center text-sm text-foreground-muted">
                                    <Building className="h-4 w-4 mr-2" />
                                    <span>Category: {(application as CourseRequest).category}</span>
                                  </div>
                                )}
                                {(application as CourseRequest).duration && (
                                  <div className="flex items-center text-sm text-foreground-muted">
                                    <Clock className="h-4 w-4 mr-2" />
                                    <span>Duration: {(application as CourseRequest).duration}</span>
                                  </div>
                                )}
                                {(application as CourseRequest).certificationType && (
                                  <div className="flex items-center text-sm text-foreground-muted">
                                    <Award className="h-4 w-4 mr-2" />
                                    <span>Certification: {(application as CourseRequest).certificationType}</span>
                                  </div>
                                )}
                                {(application as CourseRequest).urgency && (
                                  <div className="flex items-center text-sm text-foreground-muted">
                                    <AlertCircle className="h-4 w-4 mr-2" />
                                    <span>Urgency: {(application as CourseRequest).urgency}</span>
                                  </div>
                                )}
                              </>
                            )}
                            {(application as any).timeline && (
                              <div className="flex items-center text-sm text-foreground-muted">
                                <Calendar className="h-4 w-4 mr-2" />
                                <span>Timeline: {(application as any).timeline}</span>
                              </div>
                            )}
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

                          <div className="mt-4 pt-4 border-t border-border space-y-2">
                            {(application.type === "fund" 
                              ? (application as FundApplication).courseUrl 
                              : (application as CourseRequest).courseUrl || (application as CourseRequest).url
                            ) && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  window.open(
                                    application.type === "fund"
                                      ? (application as FundApplication).courseUrl
                                      : (application as CourseRequest).courseUrl || (application as CourseRequest).url,
                                    "_blank",
                                  )
                                }
                                className="w-full"
                              >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                View Course Details
                              </Button>
                            )}
                            
                            {/* Delete Button - Only show for pending applications */}
                            {application.status === "pending" && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    className="w-full"
                                    disabled={deletingId === application._id}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    {deletingId === application._id ? "Deleting..." : "Delete Application"}
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Application</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this application? This action cannot be undone and will:
                                      <br />• Remove the application permanently
                                      <br />• Delete all uploaded documents
                                      <br />• Clear all associated data
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteApplication(application._id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Yes, Delete Application
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
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
