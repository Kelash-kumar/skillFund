"use client"

import { useEffect, useMemo, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import {
  BookOpen,
  Building,
  CheckCircle,
  Clock,
  DollarSign,
  Filter,
  Tag,
  XCircle
} from "lucide-react"
import { Navigation } from "@/components/navigation"

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
  isApproved: boolean
  createdAt: string
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

export default function AdminCoursesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [courses, setCourses] = useState<Course[]>([])
  const [requests, setRequests] = useState<CourseRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const [provider, setProvider] = useState("all")

  useEffect(() => {
    if (status === "loading") return
    if (!session || session.user?.userType !== "admin") {
      router.push("/auth/signin")
      return
    }
    fetchData()
  }, [session, status, router])

  const fetchData = async () => {
    try {
      const [cRes, rRes] = await Promise.all([
        fetch("/api/admin/courses"),
        fetch("/api/admin/course-requests")
      ])

      if (cRes.ok) setCourses(await cRes.json())
      if (rRes.ok) setRequests(await rRes.json())
    } catch (e) {
      console.error("Error fetching data:", e)
    } finally {
      setLoading(false)
    }
  }

  const filteredCourses = useMemo(() => {
    let list = courses.filter((course) => course && course.title)
    const s = search.toLowerCase()

    if (search) {
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(s) ||
          c.provider.toLowerCase().includes(s) ||
          c.description.toLowerCase().includes(s) ||
          c.category.toLowerCase().includes(s)
      )
    }

    if (category !== "all") list = list.filter((c) => c.category === category)
    if (provider !== "all") list = list.filter((c) => c.provider === provider)
    return list
  }, [courses, search, category, provider])

  const approveRequest = async (id: string, note?: string) => {
    setProcessing(true)
    try {
      const res = await fetch("/api/admin/course-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: id, action: "approve", note })
      })
      if (res.ok) await fetchData()
    } finally {
      setProcessing(false)
    }
  }

  const rejectRequest = async (id: string, note?: string) => {
    setProcessing(true)
    try {
      const res = await fetch("/api/admin/course-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: id, action: "reject", note })
      })
      if (res.ok) await fetchData()
    } finally {
      setProcessing(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading courses...</p>
        </div>
      </div>
    )
  }

  const categories = Array.from(new Set(courses.map((c) => c.category))).sort()
  const providers = Array.from(new Set(courses.map((c) => c.provider))).sort()

  return (
    <>
      <Navigation />
      <div className="lg:pl-64">
        <div className="container mx-auto px-4 py-10">
          <header className="mb-10">
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Course Management
            </h1>
            <p className="text-lg text-muted-foreground">
              View and manage approved courses and student requests
            </p>
          </header>

          <Tabs defaultValue="courses" className="space-y-8">
            <TabsList className="w-full grid grid-cols-2 sm:w-auto sm:inline-flex">
              <TabsTrigger value="courses">Approved Courses</TabsTrigger>
              <TabsTrigger value="requests">Course Requests</TabsTrigger>
            </TabsList>

            {/* All Courses */}
            <TabsContent value="courses" className="space-y-8">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center text-foreground">
                    <Filter className="h-5 w-5 mr-2 text-primary" />
                    Filter Courses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      placeholder="Search title, provider, category..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    <select
                      className="w-full border border-input bg-background rounded-md h-10 px-3 text-sm"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option value="all">All Categories</option>
                      {categories.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                    <select
                      className="w-full border border-input bg-background rounded-md h-10 px-3 text-sm"
                      value={provider}
                      onChange={(e) => setProvider(e.target.value)}
                    >
                      <option value="all">All Providers</option>
                      {providers.map((p) => (
                        <option key={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                </CardContent>
              </Card>

              {filteredCourses.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-70" />
                    <h3 className="text-lg font-semibold mb-2">
                      No courses found
                    </h3>
                    <p>
                      Try adjusting your filters or add new courses to the
                      system.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCourses.map((c) => (
                    <Card
                      key={c._id}
                      className="bg-card border-border hover:border-primary/50 hover:shadow-md transition-all"
                    >
                      <CardHeader>
                        <div className="flex justify-between items-start mb-2">
                          <Badge variant="secondary" className="text-xs">
                            {c.category || "General"}
                          </Badge>
                          <span className="text-sm font-semibold text-primary">
                            {c.price ? `$${c.price.toLocaleString()}` : "Free"}
                          </span>
                        </div>
                        <CardTitle className="text-lg line-clamp-2">
                          {c.title}
                        </CardTitle>
                        <CardDescription className="flex items-center text-sm text-muted-foreground">
                          <Building className="h-4 w-4 mr-1" />
                          {c.provider || "Unknown Provider"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                          {c.description || "No description available"}
                        </p>
                        <div className="text-xs flex justify-between mb-2">
                          <span className="flex items-center text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            {c.duration || "Not specified"}
                          </span>
                          <Badge
                            variant={c.isApproved ? "default" : "outline"}
                            className="text-xs"
                          >
                            {c.isApproved ? "Approved" : "Pending"}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mb-4">
                          <Tag className="h-3 w-3 inline mr-1" />
                          {c.certificationType || "Certificate"}
                        </div>
                        {c.url && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            asChild
                          >
                            <a
                              href={c.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              View Course
                            </a>
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Course Requests */}
            <TabsContent value="requests" className="space-y-6">
              {requests.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    No course requests found.
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {requests.map((r) => (
                    <Card key={r._id} className="bg-card border-border">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>{r.title}</CardTitle>
                            <CardDescription className="text-sm text-muted-foreground">
                              {r.provider} • {r.category}
                            </CardDescription>
                          </div>
                          <Badge
                            variant={
                              r.status === "approved"
                                ? "default"
                                : r.status === "rejected"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {r.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm">
                        <p>
                          <span className="font-semibold text-foreground">
                            Student:
                          </span>{" "}
                          {r.studentName} ({r.studentEmail})
                        </p>
                        <p className="text-muted-foreground">{r.description}</p>
                        <p>
                          <span className="font-semibold text-foreground">
                            Justification:
                          </span>{" "}
                          {r.justification}
                        </p>
                        <p>
                          <span className="font-semibold text-foreground">
                            Career Relevance:
                          </span>{" "}
                          {r.careerRelevance}
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="flex items-center text-foreground">
                            <DollarSign className="h-4 w-4 mr-1 text-primary" />
                            {r.price.toLocaleString()}
                          </span>
                          <span className="text-muted-foreground">
                            Timeline: {r.timeline}
                          </span>
                        </div>

                        {r.status === "pending" ? (
                          <div className="flex gap-2 pt-2">
                            <Button
                              onClick={() => approveRequest(r._id)}
                              disabled={processing}
                              className="bg-primary hover:bg-primary/90 text-white"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" /> Approve
                            </Button>
                            <Button
                              onClick={() => rejectRequest(r._id)}
                              disabled={processing}
                              variant="destructive"
                            >
                              <XCircle className="h-4 w-4 mr-2" /> Reject
                            </Button>
                          </div>
                        ) : (
                          r.reviewNote && (
                            <div className="text-xs text-muted-foreground">
                              Note: {r.reviewNote}
                            </div>
                          )
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  )
}
