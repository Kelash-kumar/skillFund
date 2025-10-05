"use client"

import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
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
  AlertTriangle,
  AlertCircle,
  Download,
  Paperclip,
  ArrowLeft,
  Eye,
  ExternalLink,
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

interface UnifiedApplicationDetails {
  _id: string
  studentId: string
  courseId?: string
  requestType?: "available-course" | "new-course" | "certification"
  
  // Student information
  studentName: string
  studentEmail: string
  
  // Course information (unified across all types)
  courseTitle: string
  courseProvider: string
  courseCategory?: string
  
  // Financial information
  amount: number
  estimatedCost?: number
  
  // Application details
  reason?: string
  description?: string
  careerGoals?: string
  timeline: string
  additionalInfo?: string
  urgency?: "low" | "medium" | "high"
  
  // Type-specific fields
  title?: string
  certificationType?: string
  provider?: string
  category?: string
  duration?: string
  courseUrl?: string
  justification?: string
  careerRelevance?: string
  
  // Documents and status
  documents?: {
    [key: string]: string
  }
  status: "pending" | "approved" | "rejected" | "funded"
  submissionDate?: string
  createdAt: string
  updatedAt?: string
  reviewNote?: string
  approvedBy?: string
}

export default function ApplicationDetailsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [application, setApplication] = useState<UnifiedApplicationDetails | null>(null)
  const [reviewNote, setReviewNote] = useState("")
  const [purchasePrice, setPurchasePrice] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingAction, setProcessingAction] = useState<"approve" | "reject" | null>(null)
  const [applicationType, setApplicationType] = useState<"application" | "course-request" | null>(null)

  useEffect(() => {
    if (status === "loading") return

    if (!session || session.user?.userType !== "admin") {
      router.push("/auth/signin")
      return
    }

    if (params.id) {
      fetchApplicationDetails(params.id as string)
    }
  }, [session, status, router, params.id])

  const fetchApplicationDetails = async (id: string) => {
    try {
      setIsLoading(true)
      console.log('🔍 Fetching application details for ID:', id)
      
      // Use the unified applications API that handles all request types
      const response = await fetch(`/api/admin/applications/${id}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Successfully fetched application data:', data)
        
        setApplication(data)
        
        // Set application type based on requestType or fallback logic
        if (data.requestType === "new-course" || data.requestType === "certification") {
          setApplicationType("course-request")
        } else {
          setApplicationType("application")
        }
        
        console.log('📝 Application type set to:', data.requestType)
      } else {
        const errorText = await response.text()
        console.error("❌ Failed to fetch application:", response.status, response.statusText)
        console.error("❌ Error response:", errorText)
        
        toast({
          title: "Error",
          description: "Application not found",
          variant: "destructive",
        })
        router.push("/admin/applications")
      }
    } catch (error) {
      console.error("❌ Network error fetching application:", error)
      toast({
        title: "Error",
        description: "Failed to load application details",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleApplicationAction = async (action: "approve" | "reject") => {
    if (!application) return

    if (action === "approve") {
      const priceNum = Number(purchasePrice)
      if (!purchasePrice || isNaN(priceNum) || priceNum <= 0) {
        toast({
          title: "Missing or invalid price",
          description: "Enter a valid purchase price greater than 0 before approving.",
          variant: "destructive",
        })
        return
      }
    }

    setProcessingAction(action)
    setIsProcessing(true)
    try {
      const endpoint = applicationType === "application" 
        ? "/api/admin/applications/review"
        : "/api/admin/course-requests"

      const priceNum = Number(purchasePrice)

      const body = applicationType === "application"
        ? {
            applicationId: application._id,
            action,
            note: reviewNote,
            ...(action === "approve" ? { purchasePrice: priceNum } : {}),
          }
        : {
            requestId: application._id,
            action,
            note: reviewNote,
            ...(action === "approve" ? { purchasePrice: priceNum } : {}),
          }

      const response = await fetch(endpoint, {
        method: "POST",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Application ${action}d successfully`,
        })
        // Refresh the application data
        fetchApplicationDetails(application._id)
        setReviewNote("")
        if (action === "approve") setPurchasePrice("")
      } else {
        const errText = await response.text().catch(() => "")
        throw new Error(errText || "Failed to process application")
      }
    } catch (error) {
      console.error("Error processing application:", error)
      toast({
        title: "Error",
        description: "Failed to process application",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
      setProcessingAction(null)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "funded":
        return <DollarSign className="h-5 w-5 text-blue-500" />
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-50 text-green-700 border-green-200"
      case "rejected":
        return "bg-red-50 text-red-700 border-red-200"
      case "funded":
        return "bg-blue-50 text-blue-700 border-blue-200"
      default:
        return "bg-yellow-50 text-yellow-700 border-yellow-200"
    }
  }

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case "high":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "medium":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case "low":
        return <Clock className="h-4 w-4 text-gray-500" />
      default:
        return null
    }
  }

  const DocumentPreview = ({ filename, documentType }: { filename: string; documentType: string }) => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    
    // Add safety check for filename
    if (!filename || typeof filename !== 'string') {
      return (
        <div className="border border-border rounded-lg p-4 bg-background">
          <div className="bg-gray-50 rounded border p-4 text-center">
            <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Invalid filename</p>
          </div>
        </div>
      )
    }
    
    // Handle both full path and filename-only cases
    const getDocumentUrl = () => {
      if (filename.startsWith('uploads/applications/')) {
        return `/${filename}` // Already has full path
      }
      return `/uploads/applications/${encodeURIComponent(filename)}` // Add path
    }
    
    const getCleanFilename = () => {
      if (filename.startsWith('uploads/applications/')) {
        return filename.split('/').pop() || filename // Extract just the filename
      }
      return filename
    }
    
    const cleanFilename = getCleanFilename()
    const fileExtension = cleanFilename.split('.').pop()?.toLowerCase()

    const openDocument = () => {
      try {
        window.open(getDocumentUrl(), '_blank')
      } catch (error) {
        console.error('Error opening document:', error)
      }
    }

    const downloadDocument = () => {
      try {
        const link = document.createElement('a')
        link.href = getDocumentUrl()
        link.download = getCleanFilename()
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } catch (error) {
        console.error('Error downloading document:', error)
      }
    }

    return (
      <div className="border border-border rounded-lg p-4 bg-background">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-500" />
            <div>
              <p className="font-medium text-foreground">
                {documentType.charAt(0).toUpperCase() + documentType.slice(1).replace(/([A-Z])/g, ' $1')}
              </p>
              <p className="text-sm text-muted-foreground">{cleanFilename}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={openDocument}>
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            <Button variant="outline" size="sm" onClick={downloadDocument}>
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
          </div>
        </div>
        
        {/* Preview based on file type */}
        {fileExtension === 'pdf' && (
          <div className="bg-gray-50 rounded border p-4 text-center">
            <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">PDF Document</p>
            <p className="text-xs text-gray-500">Click "View" to open in new tab</p>
          </div>
        )}
        
        {['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension || '') && (
          <div className="bg-gray-50 rounded border p-2">
            <img 
              src={getDocumentUrl()} 
              alt={documentType}
              className="max-w-full h-auto max-h-64 mx-auto rounded"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
                // Show fallback content
                const parent = target.parentElement
                if (parent) {
                  parent.innerHTML = `
                    <div class="text-center p-4">
                      <svg class="h-8 w-8 text-gray-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <p class="text-sm text-gray-600">Image preview unavailable</p>
                    </div>
                  `
                }
              }}
            />
          </div>
        )}
        
        {!['pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension || '') && (
          <div className="bg-gray-50 rounded border p-4 text-center">
            <Paperclip className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">{fileExtension?.toUpperCase()} Document</p>
            <p className="text-xs text-gray-500">Click "View" or "Download" to access</p>
          </div>
        )}
      </div>
    )
  }

  const EnhancedDocumentPreview = ({ 
    document, 
    documentType, 
    applicationId 
  }: { 
    document: any; 
    documentType: string; 
    applicationId: string;
  }) => {
    // Handle different document structure formats
    const getDocumentInfo = () => {
      if (typeof document === 'string') {
        // Old format: just filename
        return {
          filename: document,
          originalName: document,
          fileType: 'application/octet-stream'
        }
      } else if (typeof document === 'object' && document !== null) {
        // New format: object with properties
        return {
          filename: document.fileName || document.filename || document.originalName || 'unknown',
          originalName: document.originalName || document.fileName || document.filename || 'Unknown Document',
          fileType: document.fileType || document.mimeType || 'application/octet-stream',
          filePath: document.filePath
        }
      }
      return null
    }

    const docInfo = getDocumentInfo()
    if (!docInfo) {
      return (
        <Card className="h-full">
          <CardContent className="p-4">
            <div className="bg-muted/30 rounded-lg p-6 text-center">
              <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700">Invalid Document</p>
              <p className="text-xs text-muted-foreground">Document type: {documentType}</p>
              <Badge variant="destructive" className="mt-2 text-xs">
                Error
              </Badge>
            </div>
          </CardContent>
        </Card>
      )
    }

    const fileExtension = docInfo.filename.split('.').pop()?.toLowerCase()

    const openDocument = () => {
      try {
        // Use the API route for document access
        const url = `/api/admin/applications/${applicationId}/documents/${documentType}`
        window.open(url, '_blank')
      } catch (error) {
        console.error('Error opening document:', error)
      }
    }

    const downloadDocument = () => {
      try {
        // Use the API route for document download
        const url = `/api/admin/applications/${applicationId}/documents/${documentType}`
        const link = document.createElement('a')
        link.href = url
        link.download = docInfo.originalName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } catch (error) {
        console.error('Error downloading document:', error)
      }
    }

    return (
      <Card className="h-full">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start space-x-3 flex-1">
              <div className="mt-1">
                {fileExtension === 'pdf' && <FileText className="h-5 w-5 text-red-500" />}
                {['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension || '') && (
                  <div className="h-5 w-5 bg-green-500 rounded flex items-center justify-center text-white text-xs font-bold">
                    IMG
                  </div>
                )}
                {!['pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension || '') && (
                  <Paperclip className="h-5 w-5 text-blue-500" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-foreground truncate">
                  {documentType
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, str => str.toUpperCase())
                    .trim()}
                </h4>
                <p className="text-sm text-muted-foreground truncate" title={docInfo.originalName}>
                  {docInfo.originalName}
                </p>
                <div className="flex items-center mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {fileExtension?.toUpperCase() || 'FILE'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* File type preview */}
          <div className="bg-muted/30 rounded-lg p-6 text-center mb-4">
            {fileExtension === 'pdf' && (
              <>
                <FileText className="h-12 w-12 text-red-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">PDF Document</p>
                <p className="text-xs text-muted-foreground">Portable Document Format</p>
              </>
            )}
            
            {['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension || '') && (
              <>
                <div className="h-12 w-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg mx-auto mb-2 flex items-center justify-center text-white font-bold">
                  IMG
                </div>
                <p className="text-sm font-medium text-gray-700">Image File</p>
                <p className="text-xs text-muted-foreground">{fileExtension?.toUpperCase()} Format</p>
              </>
            )}
            
            {!['pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension || '') && (
              <>
                <div className="h-12 w-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg mx-auto mb-2 flex items-center justify-center text-white">
                  <Paperclip className="h-6 w-6" />
                </div>
                <p className="text-sm font-medium text-gray-700">Document</p>
                <p className="text-xs text-muted-foreground">{fileExtension?.toUpperCase() || 'Unknown'} Format</p>
              </>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={openDocument} className="flex-1">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button variant="outline" size="sm" onClick={downloadDocument} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading application details...</p>
        </div>
      </div>
    )
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Application Not Found</h2>
          <p className="text-muted-foreground mb-4">The requested application could not be found.</p>
          <Button onClick={() => router.push("/admin/applications")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Applications
          </Button>
        </div>
      </div>
    )
  }

  // Determine display mode based on request type
  const isApplication = application.requestType === "available-course"
  const isNewCourse = application.requestType === "new-course"
  const isCertification = application.requestType === "certification"
  
  // For backward compatibility with the display logic
  const appData = application
  const reqData = application

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => router.push("/admin/applications")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center space-x-2">
              <Link href="/" className="flex items-center space-x-2">
                <BookOpen className="h-8 w-8 text-primary" />
                <span className="text-2xl font-bold text-foreground">SkillFund</span>
              </Link>
              <Badge variant="secondary" className="ml-2">
                Admin
              </Badge>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-muted-foreground">Admin: {session?.user?.name}</span>
            <Button variant="outline" onClick={() => router.push("/api/auth/signout")}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {isApplication && "Available Course Application Details"}
                {isNewCourse && "New Course Request Details"}
                {isCertification && "Certification Application Details"}
                {!application.requestType && "Application Details"}
              </h1>
              <p className="text-muted-foreground">
                Submitted by {application.studentName || 'Unknown'} ({application.studentEmail || 'No email'})
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Badge className={`${getStatusColor(application.status)} flex items-center gap-1`}>
                {getStatusIcon(application.status)}
                {application.status}
              </Badge>
              {application.urgency && (
                <Badge variant={application.urgency === "high" ? "destructive" : application.urgency === "medium" ? "default" : "secondary"}>
                  {getUrgencyIcon(application.urgency)}
                  <span className="ml-1">{application.urgency} priority</span>
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Application Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {isApplication && <><DollarSign className="h-5 w-5" />Available Course Funding</>}
                  {isNewCourse && <><BookOpen className="h-5 w-5" />New Course Request</>}
                  {isCertification && <><Building className="h-5 w-5" />Certification Application</>}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">
                      {isApplication && "Course"}
                      {isNewCourse && "Requested Course"}
                      {isCertification && "Certification"}
                    </h4>
                    <p className="text-foreground">{application.courseTitle || application.title || application.certificationType || 'N/A'}</p>
                    <p className="text-sm text-muted-foreground flex items-center mt-1">
                      <Building className="h-4 w-4 mr-1" />
                      {application.courseProvider || application.provider || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Amount</h4>
                    <p className="text-2xl font-bold text-primary">
                      ${(application.estimatedCost || application.amount || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                {(application.courseCategory || application.category) && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Category</h4>
                    <Badge variant="outline">{application.courseCategory || application.category}</Badge>
                  </div>
                )}
                
                {application.duration && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Duration</h4>
                    <p className="text-sm text-muted-foreground">{application.duration}</p>
                  </div>
                )}
                
                <div>
                  <h4 className="font-semibold text-foreground mb-2">
                    {isApplication && "Application Description"}
                    {isNewCourse && "Course Description"}
                    {isCertification && "Certification Description"}
                  </h4>
                  <p className="text-muted-foreground bg-muted p-3 rounded-lg">
                    {application.description || application.reason || 'No description provided'}
                  </p>
                </div>

                {application.careerGoals && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Career Goals</h4>
                    <p className="text-muted-foreground bg-muted p-3 rounded-lg">
                      {application.careerGoals}
                    </p>
                  </div>
                )}

                {application.justification && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Justification</h4>
                    <p className="text-muted-foreground bg-muted p-3 rounded-lg">
                      {application.justification}
                    </p>
                  </div>
                )}
                
                {application.careerRelevance && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Career Relevance</h4>
                    <p className="text-muted-foreground bg-muted p-3 rounded-lg">
                      {application.careerRelevance}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Documents Section */}
            {application.documents && 
             typeof application.documents === 'object' && 
             Object.keys(application.documents).length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <CardTitle>Submitted Documents</CardTitle>
                    </div>
                    <Badge variant="outline" className="text-sm">
                      {Object.keys(application.documents).length} file{Object.keys(application.documents).length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  <CardDescription>
                    Documents and certificates uploaded with this application
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {Object.entries(application.documents)
                      .filter(([key, document]) => document != null)
                      .map(([key, document]) => (
                        <EnhancedDocumentPreview
                          key={key}
                          document={document}
                          documentType={key}
                          applicationId={application._id}
                        />
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Additional Information */}
            {(application.additionalInfo || application.courseUrl) && (
              <Card>
                <CardHeader>
                  <CardTitle>Additional Information</CardTitle>
                </CardHeader>
                <CardContent>
                  {application.additionalInfo && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Additional Notes</h4>
                      <p className="text-muted-foreground bg-muted p-3 rounded-lg">
                        {application.additionalInfo}
                      </p>
                    </div>
                  )}
                  
                  {application.courseUrl && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Course URL</h4>
                      <a 
                        href={application.courseUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1"
                      >
                        {application.courseUrl}
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Application Meta */}
            <Card>
              <CardHeader>
                <CardTitle>Application Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Student</h4>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{application.studentName || 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground">{application.studentEmail || 'No email provided'}</p>
                      </div>
                    </div>
                  </div>                <Separator />
                
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Timeline</h4>
                  <p className="text-sm text-muted-foreground">{application.timeline || 'Not specified'}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Submitted</h4>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {application.submissionDate || application.createdAt 
                        ? new Date(application.submissionDate || application.createdAt).toLocaleDateString()
                        : 'Unknown date'
                      }
                    </p>
                  </div>
                </div>

                {application.duration && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Duration</h4>
                    <p className="text-sm text-muted-foreground">{application.duration}</p>
                  </div>
                )}

                {isCertification && application.certificationType && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Certification Type</h4>
                    <p className="text-sm text-muted-foreground">{application.certificationType}</p>
                  </div>
                )}
                
                {application.courseUrl && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Course URL</h4>
                    <a 
                      href={application.courseUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      View Course
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Review Actions */}
            {application.status === "pending" && (
              <Card>
                <CardHeader>
                  <CardTitle>Review Application</CardTitle>
                  <CardDescription>
                    Take action on this {isApplication ? "funding application" : "course request"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-foreground mb-2 block">
                      Review Note (Optional)
                    </label>
                    <Textarea
                      placeholder="Add a note about your decision..."
                      value={reviewNote}
                      onChange={(e) => setReviewNote(e.target.value)}
                      className="min-h-[80px]"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-foreground mb-2 block">
                      Course Purchase Price (required to approve)
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="text-muted-foreground">$</div>
                      <Input
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={purchasePrice}
                        onChange={(e) => setPurchasePrice(e.target.value)}
                        className="max-w-xs"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Enter the actual purchase price to be deducted from the DonationBank.</p>
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <Button
                      onClick={() => handleApplicationAction("approve")}
                      disabled={isProcessing || !purchasePrice || isNaN(Number(purchasePrice)) || Number(purchasePrice) <= 0}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {isProcessing && processingAction === "approve" ? "Approving..." : "Approve"}
                    </Button>
                    <Button
                      onClick={() => handleApplicationAction("reject")}
                      disabled={isProcessing}
                      variant="destructive"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      {isProcessing && processingAction === "reject" ? "Rejecting..." : "Reject"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Review History */}
            {application.status !== "pending" && (
              <Card>
                <CardHeader>
                  <CardTitle>Review Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2 mb-2">
                    {getStatusIcon(application.status)}
                    <span className="font-medium capitalize">{application.status}</span>
                  </div>
                  {(application as any).reviewNote && (
                    <div className="mt-3">
                      <h5 className="text-sm font-semibold mb-1">Review Note:</h5>
                      <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
                        {(application as any).reviewNote}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}