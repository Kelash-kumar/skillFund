"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  BookOpen,
  FileText,
  User,
  Building,
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
} from "lucide-react"
import Link from "next/link"

interface Application {
  _id: string
  studentName: string
  studentEmail: string
  courseTitle: string
  courseProvider: string
  courseCategory: string
  amount: number
  reason: string
  careerGoals: string
  timeline: string
  additionalInfo: string
  status: "pending" | "approved" | "rejected" | "funded"
  createdAt: string
  updatedAt: string
}

interface CourseRequest {
  _id: string
  studentName: string
  studentEmail: string
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
  reviewNote?: string
  createdAt: string
}

export default function AdminApplicationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [applications, setApplications] = useState<Application[]>([])
  const [courseRequests, setCourseRequests] = useState<CourseRequest[]>([])
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [reviewNote, setReviewNote] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    if (status === "loading") return

    if (!session || session.user?.userType !== "admin") {
      router.push("/auth/signin")
      return
    }

    fetchApplications()
  }, [session, status, router])

  const fetchApplications = async () => {
    try {
      const [appsRes, crRes] = await Promise.all([
        fetch("/api/admin/applications"),
        fetch("/api/admin/course-requests"),
      ])
      if (appsRes.ok) {
        const data = await appsRes.json()
        setApplications(data)
      }
      if (crRes.ok) {
        const cr = await crRes.json()
        setCourseRequests(cr)
      }
    } catch (error) {
      console.error("Error fetching applications:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApplicationAction = async (applicationId: string, action: "approve" | "reject") => {
    setIsProcessing(true)
    try {
      const response = await fetch("/api/admin/applications/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          applicationId,
          action,
          note: reviewNote,
        }),
      })

      if (response.ok) {
        fetchApplications()
        setSelectedApplication(null)
        setReviewNote("")
      }
    } catch (error) {
      console.error("Error processing application:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-accent" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-destructive" />
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

  const filterApplications = (status: string) => {
    if (status === "all") return applications
    return applications.filter((app) => app.status === status)
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-foreground-muted">Loading applications...</p>
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
            <Link href="/admin/dashboard" className="text-foreground-muted hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <Link href="/admin/applications" className="text-primary font-medium">
              Applications
            </Link>
            <Link href="/admin/courses" className="text-foreground-muted hover:text-foreground transition-colors">
              Courses
            </Link>
            <Link href="/admin/users" className="text-foreground-muted hover:text-foreground transition-colors">
              Users
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
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Application Management</h1>
          <p className="text-xl text-foreground-muted">Review and manage student funding applications</p>
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">All ({applications.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({filterApplications("pending").length})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({filterApplications("approved").length})</TabsTrigger>
            <TabsTrigger value="funded">Funded ({filterApplications("funded").length})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({filterApplications("rejected").length})</TabsTrigger>
            <TabsTrigger value="course-requests">Course Requests ({courseRequests.length})</TabsTrigger>
          </TabsList>

          {["all", "pending", "approved", "funded", "rejected"].map((tabValue) => (
            <TabsContent key={tabValue} value={tabValue} className="space-y-6">
              {filterApplications(tabValue).length === 0 ? (
                <Card className="border-border bg-card">
                  <CardContent className="pt-6">
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-foreground-muted mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">No applications found</h3>
                      <p className="text-foreground-muted">No applications match the current filter</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {filterApplications(tabValue).map((application) => (
                    <Card key={application._id} className="border-border bg-card">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                              <User className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-lg text-foreground">{application.studentName}</CardTitle>
                              <CardDescription className="text-foreground-muted">
                                {application.studentEmail}
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={getStatusColor(application.status)}>
                              {getStatusIcon(application.status)}
                              <span className="ml-1">{application.status}</span>
                            </Badge>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" onClick={() => setSelectedApplication(application)}>
                                  <Eye className="h-4 w-4 mr-1" />
                                  Review
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Application Review</DialogTitle>
                                  <DialogDescription>
                                    Review and take action on this funding application
                                  </DialogDescription>
                                </DialogHeader>
                                {selectedApplication && (
                                  <div className="space-y-6">
                                    {/* Student Info */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div>
                                        <h3 className="font-semibold text-foreground mb-2">Student Information</h3>
                                        <div className="space-y-2 text-sm">
                                          <div className="flex items-center">
                                            <User className="h-4 w-4 mr-2 text-foreground-muted" />
                                            <span>{selectedApplication.studentName}</span>
                                          </div>
                                          <div className="flex items-center">
                                            <span className="text-foreground-muted">Email:</span>
                                            <span className="ml-2">{selectedApplication.studentEmail}</span>
                                          </div>
                                        </div>
                                      </div>
                                      <div>
                                        <h3 className="font-semibold text-foreground mb-2">Course Information</h3>
                                        <div className="space-y-2 text-sm">
                                          <div className="flex items-center">
                                            <Building className="h-4 w-4 mr-2 text-foreground-muted" />
                                            <span>{selectedApplication.courseProvider}</span>
                                          </div>
                                          <div className="font-medium">{selectedApplication.courseTitle}</div>
                                          <div className="flex items-center">
                                            <DollarSign className="h-4 w-4 mr-1 text-primary" />
                                            <span className="font-semibold text-primary">
                                              ${selectedApplication.amount.toLocaleString()}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Application Details */}
                                    <div className="space-y-4">
                                      <div>
                                        <h4 className="font-semibold text-foreground mb-2">Why they need funding:</h4>
                                        <p className="text-sm text-foreground-muted bg-background-muted p-3 rounded-lg">
                                          {selectedApplication.reason}
                                        </p>
                                      </div>
                                      <div>
                                        <h4 className="font-semibold text-foreground mb-2">Career goals:</h4>
                                        <p className="text-sm text-foreground-muted bg-background-muted p-3 rounded-lg">
                                          {selectedApplication.careerGoals}
                                        </p>
                                      </div>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                          <h4 className="font-semibold text-foreground mb-2">Timeline:</h4>
                                          <p className="text-sm text-foreground-muted">
                                            {selectedApplication.timeline}
                                          </p>
                                        </div>
                                        <div>
                                          <h4 className="font-semibold text-foreground mb-2">Applied:</h4>
                                          <div className="flex items-center text-sm text-foreground-muted">
                                            <Calendar className="h-4 w-4 mr-1" />
                                            {new Date(selectedApplication.createdAt).toLocaleDateString()}
                                          </div>
                                        </div>
                                      </div>
                                      {selectedApplication.additionalInfo && (
                                        <div>
                                          <h4 className="font-semibold text-foreground mb-2">
                                            Additional Information:
                                          </h4>
                                          <p className="text-sm text-foreground-muted bg-background-muted p-3 rounded-lg">
                                            {selectedApplication.additionalInfo}
                                          </p>
                                        </div>
                                      )}
                                    </div>

                                    {/* Review Actions */}
                                    {selectedApplication.status === "pending" && (
                                      <div className="space-y-4 border-t border-border pt-4">
                                        <div>
                                          <label className="text-sm font-semibold text-foreground mb-2 block">
                                            Review Note (Optional):
                                          </label>
                                          <Textarea
                                            placeholder="Add a note about your decision..."
                                            value={reviewNote}
                                            onChange={(e) => setReviewNote(e.target.value)}
                                            className="border-input-border bg-input"
                                          />
                                        </div>
                                        <div className="flex space-x-3">
                                          <Button
                                            onClick={() => handleApplicationAction(selectedApplication._id, "approve")}
                                            disabled={isProcessing}
                                            className="bg-accent hover:bg-accent-hover"
                                          >
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            {isProcessing ? "Processing..." : "Approve"}
                                          </Button>
                                          <Button
                                            onClick={() => handleApplicationAction(selectedApplication._id, "reject")}
                                            disabled={isProcessing}
                                            variant="destructive"
                                          >
                                            <XCircle className="h-4 w-4 mr-2" />
                                            {isProcessing ? "Processing..." : "Reject"}
                                          </Button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <h4 className="font-semibold text-foreground mb-1">Course:</h4>
                            <p className="text-sm text-foreground-muted">{application.courseTitle}</p>
                            <p className="text-xs text-foreground-muted">{application.courseProvider}</p>
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground mb-1">Amount:</h4>
                            <p className="text-lg font-bold text-primary">${application.amount.toLocaleString()}</p>
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground mb-1">Applied:</h4>
                            <div className="flex items-center text-sm text-foreground-muted">
                              <Calendar className="h-4 w-4 mr-1" />
                              {new Date(application.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="mt-4">
                          <p className="text-sm text-foreground-muted line-clamp-2">{application.reason}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          ))}

          <TabsContent value="course-requests" className="space-y-6" id="course-requests">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Course Requests</CardTitle>
                <CardDescription className="text-foreground-muted">All requests submitted by students</CardDescription>
              </CardHeader>
              <CardContent>
                {courseRequests.length === 0 ? (
                  <div className="text-center py-8 text-foreground-muted">No course requests found</div>
                ) : (
                  <div className="space-y-4">
                    {courseRequests.map((r) => (
                      <div key={r._id} className="p-4 border border-border rounded-lg bg-background-muted space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-foreground">{r.title}</h4>
                            <p className="text-sm text-foreground-muted">{r.provider} • {r.category}</p>
                            <p className="text-xs text-foreground-muted">Requested by {r.studentName} ({r.studentEmail})</p>
                          </div>
                          <Badge variant={r.status === "approved" ? "default" : r.status === "rejected" ? "secondary" : "outline"}>
                            {r.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-foreground-muted">
                          <span className="font-semibold text-foreground">Justification:</span> {r.justification}
                        </div>
                        <div className="text-sm text-foreground-muted">
                          <span className="font-semibold text-foreground">Career Relevance:</span> {r.careerRelevance}
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-semibold text-primary">${'{'}r.price.toLocaleString(){'}'}</span>
                          <span className="text-foreground-muted">Timeline: {r.timeline}</span>
                        </div>
                        {r.status === "pending" && (
                          <div className="flex gap-2">
                            <Button onClick={async () => { setIsProcessing(true); await fetch('/api/admin/course-requests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ requestId: r._id, action: 'approve' }) }); setIsProcessing(false); fetchApplications(); }} disabled={isProcessing} className="bg-accent hover:bg-accent-hover">
                              Approve
                            </Button>
                            <Button onClick={async () => { setIsProcessing(true); await fetch('/api/admin/course-requests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ requestId: r._id, action: 'reject' }) }); setIsProcessing(false); fetchApplications(); }} disabled={isProcessing} variant="destructive">
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
