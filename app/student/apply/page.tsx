"use client"

import type React from "react"

import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, DollarSign, Building, Clock, Award, AlertCircle, CheckCircle } from "lucide-react"
import Link from "next/link"

interface Course {
  _id: string
  title: string
  provider: string
  description: string
  category: string
  price: number
  duration: string
  certificationType: string
  url: string
}

export default function ApplyPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const courseId = searchParams.get("courseId")

  const [course, setCourse] = useState<Course | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourseId, setSelectedCourseId] = useState(courseId || "")
  const [formData, setFormData] = useState({
    reason: "",
    careerGoals: "",
    timeline: "",
    additionalInfo: "",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (status === "loading") return

    if (!session || session.user?.userType !== "student") {
      router.push("/auth/signin")
      return
    }

    fetchCourses()
  }, [session, status, router])

  useEffect(() => {
    if (selectedCourseId && courses.length > 0) {
      const selectedCourse = courses.find((c) => c._id === selectedCourseId)
      setCourse(selectedCourse || null)
    }
  }, [selectedCourseId, courses])

  const fetchCourses = async () => {
    try {
      const response = await fetch("/api/courses")
      if (response.ok) {
        const data = await response.json()
        setCourses(data)

        if (courseId) {
          const selectedCourse = data.find((c: Course) => c._id === courseId)
          setCourse(selectedCourse || null)
        }
      }
    } catch (error) {
      console.error("Error fetching courses:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCourseId || !course) {
      setError("Please select a course")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const response = await fetch("/api/student/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId: selectedCourseId,
          amount: course.price,
          reason: formData.reason,
          careerGoals: formData.careerGoals,
          timeline: formData.timeline,
          additionalInfo: formData.additionalInfo,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong")
      }

      setSuccess(true)
      setTimeout(() => {
        router.push("/student/applications")
      }, 3000)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-foreground-muted">Loading application form...</p>
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
              <h2 className="text-2xl font-bold text-foreground mb-2">Application Submitted!</h2>
              <p className="text-foreground-muted mb-4">
                Your funding application has been submitted successfully. You'll be redirected to your applications
                page.
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

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Apply for Funding</h1>
          <p className="text-xl text-foreground-muted">Submit your application to get funding for your chosen course</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Application Form */}
          <div className="lg:col-span-2">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Funding Application</CardTitle>
                <CardDescription className="text-foreground-muted">
                  Tell us about your goals and why you need funding for this course
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="course" className="text-foreground">
                      Select Course *
                    </Label>
                    <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                      <SelectTrigger className="border-input-border bg-input">
                        <SelectValue placeholder="Choose a course to apply for funding" />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map((course) => (
                          <SelectItem key={course._id} value={course._id}>
                            {course.title} - {course.provider} (${course.price})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reason" className="text-foreground">
                      Why do you need funding for this course? *
                    </Label>
                    <Textarea
                      id="reason"
                      placeholder="Explain your current situation and why you need financial assistance..."
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      className="min-h-[100px] border-input-border bg-input"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="careerGoals" className="text-foreground">
                      How will this course help your career goals? *
                    </Label>
                    <Textarea
                      id="careerGoals"
                      placeholder="Describe how this certification will advance your career..."
                      value={formData.careerGoals}
                      onChange={(e) => setFormData({ ...formData, careerGoals: e.target.value })}
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
                      placeholder="e.g., Within 3 months, By end of 2025..."
                      value={formData.timeline}
                      onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
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
                      onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                      className="min-h-[80px] border-input-border bg-input"
                    />
                  </div>

                  {error && (
                    <div className="flex items-center space-x-2 text-destructive text-sm">
                      <AlertCircle className="h-4 w-4" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="flex space-x-4">
                    <Button
                      type="submit"
                      className="bg-primary hover:bg-primary-hover"
                      disabled={isSubmitting || !selectedCourseId}
                    >
                      {isSubmitting ? "Submitting..." : "Submit Application"}
                    </Button>
                    <Link href="/student/courses">
                      <Button variant="outline" type="button">
                        Back to Courses
                      </Button>
                    </Link>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Course Details Sidebar */}
          <div>
            {course ? (
              <Card className="border-border bg-card sticky top-8">
                <CardHeader>
                  <CardTitle className="text-foreground">Course Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{course.title}</h3>
                    <p className="text-sm text-foreground-muted flex items-center">
                      <Building className="h-4 w-4 mr-1" />
                      {course.provider}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground-muted">Price:</span>
                      <span className="font-semibold text-primary flex items-center">
                        <DollarSign className="h-4 w-4" />
                        {course.price === 0 ? "Free" : course.price.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground-muted">Duration:</span>
                      <span className="text-sm text-foreground flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {course.duration}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground-muted">Type:</span>
                      <span className="text-sm text-foreground flex items-center">
                        <Award className="h-4 w-4 mr-1" />
                        {course.certificationType}
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-foreground-muted">{course.description}</p>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={() => window.open(course.url, "_blank")}
                  >
                    View Course Details
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-border bg-card">
                <CardContent className="pt-6">
                  <div className="text-center text-foreground-muted">
                    <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Select a course to see details</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
