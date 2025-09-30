"use client"

import type React from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  BookOpen,
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  X,
  Building,
  DollarSign,
  Clock,
  Award,
  GraduationCap,
  FileCheck,
} from "lucide-react"
import Link from "next/link"

interface UploadedFile {
  name: string
  size: number
  type: string
  file: File
}

const REQUIRED_DOCUMENTS = [
  {
    id: "transcript",
    name: "Academic Transcript",
    description: "Official transcript from your current/most recent educational institution",
    required: true,
  },
  {
    id: "resume",
    name: "Resume/CV",
    description: "Current resume highlighting your educational background and experience",
    required: true,
  },
  {
    id: "motivation",
    name: "Motivation Letter",
    description: "A letter explaining why you want to take this specific course",
    required: true,
  },
  {
    id: "financial",
    name: "Financial Statement",
    description: "Document showing your current financial situation (bank statement, income proof, etc.)",
    required: true,
  },
  {
    id: "portfolio",
    name: "Portfolio/Work Samples",
    description: "Examples of your previous work or projects (if applicable)",
    required: false,
  },
]

const COURSE_CATEGORIES = [
  "Technology & Programming",
  "Data Science & Analytics",
  "Digital Marketing",
  "Business & Management",
  "Design & Creative",
  "Healthcare & Medicine",
  "Finance & Accounting",
  "Engineering",
  "Language Learning",
  "Personal Development",
  "Other",
]

const CERTIFICATION_TYPES = [
  "Professional Certificate",
  "Industry Certification",
  "University Certificate",
  "Diploma",
  "Degree Program",
  "Bootcamp Certificate",
  "Other",
]

export default function RequestCoursePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [formData, setFormData] = useState({
    title: "",
    provider: "",
    description: "",
    category: "",
    price: "",
    duration: "",
    certificationType: "",
    url: "",
    justification: "",
    careerRelevance: "",
    timeline: "",
    additionalInfo: "",
  })

  const [uploadedFiles, setUploadedFiles] = useState<Record<string, UploadedFile>>({})
  const [dragActive, setDragActive] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (status === "loading") return

    if (!session || session.user?.userType !== "student") {
      router.push("/auth/signin")
      return
    }
  }, [session, status, router])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = (documentId: string, files: FileList | null) => {
    if (!files || files.length === 0) return

    const file = files[0]
    const maxSize = 10 * 1024 * 1024 // 10MB

    if (file.size > maxSize) {
      setError("File size must be less than 10MB")
      return
    }

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png",
    ]

    if (!allowedTypes.includes(file.type)) {
      setError("Only PDF, DOC, DOCX, JPG, and PNG files are allowed")
      return
    }

    setUploadedFiles((prev) => ({
      ...prev,
      [documentId]: {
        name: file.name,
        size: file.size,
        type: file.type,
        file: file,
      },
    }))
    setError("")
  }

  const removeFile = (documentId: string) => {
    setUploadedFiles((prev) => {
      const updated = { ...prev }
      delete updated[documentId]
      return updated
    })
  }

  const handleDrag = (e: React.DragEvent, documentId: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(documentId)
    } else if (e.type === "dragleave") {
      setDragActive(null)
    }
  }

  const handleDrop = (e: React.DragEvent, documentId: string) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(null)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(documentId, e.dataTransfer.files)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const validateForm = () => {
    // Check required form fields
    const requiredFields = [
      "title",
      "provider",
      "description",
      "category",
      "price",
      "duration",
      "certificationType",
      "url",
      "justification",
      "careerRelevance",
      "timeline",
    ]
    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData]) {
        setError(`Please fill in the ${field.replace(/([A-Z])/g, " $1").toLowerCase()} field`)
        return false
      }
    }

    // Check required documents
    const requiredDocs = REQUIRED_DOCUMENTS.filter((doc) => doc.required)
    for (const doc of requiredDocs) {
      if (!uploadedFiles[doc.id]) {
        setError(`Please upload the required document: ${doc.name}`)
        return false
      }
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)
    setError("")

    try {
      // Create FormData for file upload
      const formDataToSend = new FormData()

      // Add form fields
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value)
      })

      // Add files
      Object.entries(uploadedFiles).forEach(([documentId, fileData]) => {
        formDataToSend.append(`document_${documentId}`, fileData.file)
      })

      const response = await fetch("/api/student/request-course", {
        method: "POST",
        body: formDataToSend,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong")
      }

      setSuccess(true)
      setTimeout(() => {
        router.push("/student/courses")
      }, 3000)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-foreground-muted">Loading course request form...</p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-border bg-card">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-accent mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">Course Request Submitted!</h2>
              <p className="text-foreground-muted mb-4">
                Your course request has been submitted successfully. Our team will review it and get back to you soon.
              </p>
            </div>
          </CardContent>
        </Card>
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
            <Link href="/student/dashboard" className="text-foreground-muted hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <Link href="/student/courses" className="text-foreground-muted hover:text-foreground transition-colors">
              Browse Courses
            </Link>
            <Link
              href="/student/applications"
              className="text-foreground-muted hover:text-foreground transition-colors"
            >
              My Applications
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

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Request New Course</h1>
          <p className="text-xl text-foreground-muted">
            Can't find the course you need? Request it here with supporting documents
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Course Information */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center">
                    <GraduationCap className="h-5 w-5 mr-2" />
                    Course Information
                  </CardTitle>
                  <CardDescription className="text-foreground-muted">
                    Provide detailed information about the course you want to request
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-foreground">
                        Course Title *
                      </Label>
                      <Input
                        id="title"
                        placeholder="e.g., Advanced React Development"
                        value={formData.title}
                        onChange={(e) => handleInputChange("title", e.target.value)}
                        className="border-input-border bg-input"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="provider" className="text-foreground">
                        Course Provider *
                      </Label>
                      <Input
                        id="provider"
                        placeholder="e.g., Coursera, Udemy, edX"
                        value={formData.provider}
                        onChange={(e) => handleInputChange("provider", e.target.value)}
                        className="border-input-border bg-input"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-foreground">
                      Course Description *
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Describe what this course covers, learning objectives, and key topics..."
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      className="min-h-[100px] border-input-border bg-input"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category" className="text-foreground">
                        Category *
                      </Label>
                      <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                        <SelectTrigger className="border-input-border bg-input">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {COURSE_CATEGORIES.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="certificationType" className="text-foreground">
                        Certification Type *
                      </Label>
                      <Select
                        value={formData.certificationType}
                        onValueChange={(value) => handleInputChange("certificationType", value)}
                      >
                        <SelectTrigger className="border-input-border bg-input">
                          <SelectValue placeholder="Select certification type" />
                        </SelectTrigger>
                        <SelectContent>
                          {CERTIFICATION_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price" className="text-foreground">
                        Course Price (USD) *
                      </Label>
                      <Input
                        id="price"
                        type="number"
                        placeholder="e.g., 299"
                        value={formData.price}
                        onChange={(e) => handleInputChange("price", e.target.value)}
                        className="border-input-border bg-input"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="duration" className="text-foreground">
                        Duration *
                      </Label>
                      <Input
                        id="duration"
                        placeholder="e.g., 8 weeks, 3 months"
                        value={formData.duration}
                        onChange={(e) => handleInputChange("duration", e.target.value)}
                        className="border-input-border bg-input"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="url" className="text-foreground">
                      Course URL *
                    </Label>
                    <Input
                      id="url"
                      type="url"
                      placeholder="https://example.com/course-link"
                      value={formData.url}
                      onChange={(e) => handleInputChange("url", e.target.value)}
                      className="border-input-border bg-input"
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Application Details */}
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Application Details
                  </CardTitle>
                  <CardDescription className="text-foreground-muted">
                    Explain why you need this course and how it fits your goals
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="justification" className="text-foreground">
                      Why do you need this specific course? *
                    </Label>
                    <Textarea
                      id="justification"
                      placeholder="Explain why this course is important for your education/career goals..."
                      value={formData.justification}
                      onChange={(e) => handleInputChange("justification", e.target.value)}
                      className="min-h-[100px] border-input-border bg-input"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="careerRelevance" className="text-foreground">
                      How is this relevant to your career? *
                    </Label>
                    <Textarea
                      id="careerRelevance"
                      placeholder="Describe how this course will help advance your career or achieve your professional goals..."
                      value={formData.careerRelevance}
                      onChange={(e) => handleInputChange("careerRelevance", e.target.value)}
                      className="min-h-[100px] border-input-border bg-input"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timeline" className="text-foreground">
                      When do you plan to complete this course? *
                    </Label>
                    <Input
                      id="timeline"
                      placeholder="e.g., Within 6 months, By end of 2025"
                      value={formData.timeline}
                      onChange={(e) => handleInputChange("timeline", e.target.value)}
                      className="border-input-border bg-input"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="additionalInfo" className="text-foreground">
                      Additional Information
                    </Label>
                    <Textarea
                      id="additionalInfo"
                      placeholder="Any additional information you'd like to share..."
                      value={formData.additionalInfo}
                      onChange={(e) => handleInputChange("additionalInfo", e.target.value)}
                      className="min-h-[80px] border-input-border bg-input"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Document Upload Section */}
            <div className="space-y-6">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center">
                    <FileCheck className="h-5 w-5 mr-2" />
                    Required Documents
                  </CardTitle>
                  <CardDescription className="text-foreground-muted">
                    Upload the required documents to support your course request
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {REQUIRED_DOCUMENTS.map((document) => (
                    <div key={document.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium text-foreground">
                          {document.name}
                          {document.required && <span className="text-destructive ml-1">*</span>}
                        </Label>
                        {uploadedFiles[document.id] && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(document.id)}
                            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <p className="text-xs text-foreground-muted mb-2">{document.description}</p>

                      {uploadedFiles[document.id] ? (
                        <div className="flex items-center space-x-2 p-3 bg-accent/10 border border-accent/20 rounded-lg">
                          <FileText className="h-4 w-4 text-accent" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {uploadedFiles[document.id].name}
                            </p>
                            <p className="text-xs text-foreground-muted">
                              {formatFileSize(uploadedFiles[document.id].size)}
                            </p>
                          </div>
                          <CheckCircle className="h-4 w-4 text-accent" />
                        </div>
                      ) : (
                        <div
                          className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                            dragActive === document.id
                              ? "border-primary bg-primary/5"
                              : "border-input-border hover:border-primary hover:bg-primary/5"
                          }`}
                          onDragEnter={(e) => handleDrag(e, document.id)}
                          onDragLeave={(e) => handleDrag(e, document.id)}
                          onDragOver={(e) => handleDrag(e, document.id)}
                          onDrop={(e) => handleDrop(e, document.id)}
                          onClick={() => window.document.getElementById(`file-${document.id}`)?.click()}
                        >
                          <Upload className="h-8 w-8 text-foreground-muted mx-auto mb-2" />
                          <p className="text-sm text-foreground-muted mb-1">Drop file here or click to upload</p>
                          <p className="text-xs text-foreground-muted">PDF, DOC, DOCX, JPG, PNG (max 10MB)</p>
                          <input
                            id={`file-${document.id}`}
                            type="file"
                            className="hidden"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileUpload(document.id, e.target.files)}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Course Preview */}
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-foreground">Course Preview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {formData.title ? (
                    <>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">{formData.title}</h3>
                        {formData.provider && (
                          <p className="text-sm text-foreground-muted flex items-center">
                            <Building className="h-4 w-4 mr-1" />
                            {formData.provider}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        {formData.price && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-foreground-muted">Price:</span>
                            <span className="font-semibold text-primary flex items-center">
                              <DollarSign className="h-4 w-4" />
                              {formData.price}
                            </span>
                          </div>
                        )}
                        {formData.duration && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-foreground-muted">Duration:</span>
                            <span className="text-sm text-foreground flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {formData.duration}
                            </span>
                          </div>
                        )}
                        {formData.certificationType && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-foreground-muted">Type:</span>
                            <span className="text-sm text-foreground flex items-center">
                              <Award className="h-4 w-4 mr-1" />
                              {formData.certificationType}
                            </span>
                          </div>
                        )}
                      </div>

                      {formData.category && (
                        <Badge variant="secondary" className="text-xs">
                          {formData.category}
                        </Badge>
                      )}
                    </>
                  ) : (
                    <div className="text-center text-foreground-muted">
                      <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Fill in course details to see preview</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Submit Section */}
          <Card className="border-border bg-card">
            <CardContent className="pt-6">
              {error && (
                <div className="flex items-center space-x-2 text-destructive text-sm mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex space-x-4">
                <Button type="submit" className="bg-primary hover:bg-primary-hover" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting Request..." : "Submit Course Request"}
                </Button>
                <Link href="/student/courses">
                  <Button variant="outline" type="button">
                    Back to Courses
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  )
}
