"use client"

import { useEffect, useMemo, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { BookOpen, Building, CheckCircle, Clock, DollarSign, Filter, Tag, XCircle } from "lucide-react"
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
        fetch("/api/admin/course-requests"),
      ])
      if (cRes.ok) setCourses(await cRes.json())
      if (rRes.ok) setRequests(await rRes.json())
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const filteredCourses = useMemo(() => {
    let list = courses
    if (search) {
      const s = search.toLowerCase()
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(s) ||
          c.provider.toLowerCase().includes(s) ||
          c.description?.toLowerCase().includes(s) ||
          c.category.toLowerCase().includes(s),
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
        body: JSON.stringify({ requestId: id, action: "approve", note }),
      })
      if (res.ok) {
        await fetchData()
      }
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
        body: JSON.stringify({ requestId: id, action: "reject", note }),
      })
      if (res.ok) {
        await fetchData()
      }
    } finally {
      setProcessing(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-foreground-muted">Loading courses...</p>
        </div>
      </div>
    )
  }

  const categories = Array.from(new Set(courses.map((c) => c.category))).sort()
  const providers = Array.from(new Set(courses.map((c) => c.provider))).sort()

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link href="/" className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-foreground">ScholarFund</span>
            </Link>
            <Badge variant="secondary" className="ml-2">Admin</Badge>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/admin/dashboard" className="text-foreground-muted hover:text-foreground transition-colors">Dashboard</Link>
            <Link href="/admin/applications" className="text-foreground-muted hover:text-foreground transition-colors">Applications</Link>
            <Link href="/admin/courses" className="text-primary font-medium">Courses</Link>
            <Link href="/admin/users" className="text-foreground-muted hover:text-foreground transition-colors">Users</Link>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Course Management</h1>
          <p className="text-xl text-foreground-muted">View approved courses and manage course requests</p>
        </div>

        <Tabs defaultValue="courses" className="space-y-6">
          <TabsList>
            <TabsTrigger value="courses">All Courses</TabsTrigger>
            <TabsTrigger value="requests">Course Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center">
                  <Filter className="h-5 w-5 mr-2" /> Filter Courses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1">
                    <Input placeholder="Search title, provider, category..." value={search} onChange={(e) => setSearch(e.target.value)} />
                  </div>
                  <div>
                    <select className="w-full border-input-border bg-input rounded-md h-10 px-3" value={category} onChange={(e) => setCategory(e.target.value)}>
                      <option value="all">All Categories</option>
                      {categories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <select className="w-full border-input-border bg-input rounded-md h-10 px-3" value={provider} onChange={(e) => setProvider(e.target.value)}>
                      <option value="all">All Providers</option>
                      {providers.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((c) => (
                <Card key={c._id} className="bg-card border-border">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="secondary" className="text-xs">{c.category}</Badge>
                      <span className="text-sm font-semibold text-primary">${c.price.toLocaleString()}</span>
                    </div>
                    <CardTitle className="text-lg text-foreground">{c.title}</CardTitle>
                    <CardDescription className="text-foreground-muted flex items-center"><Building className="h-4 w-4 mr-1" />{c.provider}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-foreground-muted line-clamp-3 mb-4">{c.description}</p>
                    <div className="text-xs text-foreground-muted flex justify-between">
                      <span className="flex items-center"><Clock className="h-3 w-3 mr-1" />{c.duration}</span>
                      <span className="flex items-center"><Tag className="h-3 w-3 mr-1" />{c.certificationType}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="requests" className="space-y-6">
            {requests.length === 0 ? (
              <Card className="bg-card border-border">
                <CardContent className="pt-8 pb-8 text-center text-foreground-muted">No course requests found</CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {requests.map((r) => (
                  <Card key={r._id} className="bg-card border-border">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-foreground">{r.title}</CardTitle>
                          <CardDescription className="text-foreground-muted">{r.provider} • {r.category}</CardDescription>
                        </div>
                        <Badge variant={r.status === "approved" ? "default" : r.status === "rejected" ? "secondary" : "outline"}>
                          {r.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-sm">
                        <span className="font-semibold">Student:</span> {r.studentName} ({r.studentEmail})
                      </div>
                      <p className="text-sm text-foreground-muted">{r.description}</p>
                      <div className="text-sm text-foreground-muted">
                        <span className="font-semibold text-foreground">Justification:</span> {r.justification}
                      </div>
                      <div className="text-sm text-foreground-muted">
                        <span className="font-semibold text-foreground">Career Relevance:</span> {r.careerRelevance}
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center text-foreground"><DollarSign className="h-4 w-4 mr-1 text-primary" />{r.price.toLocaleString()}</span>
                        <span className="text-foreground-muted">Timeline: {r.timeline}</span>
                      </div>

                      {r.status === "pending" ? (
                        <div className="flex gap-2 pt-2">
                          <Button onClick={() => approveRequest(r._id)} disabled={processing} className="bg-accent hover:bg-accent-hover">
                            <CheckCircle className="h-4 w-4 mr-2" /> Approve
                          </Button>
                          <Button onClick={() => rejectRequest(r._id)} disabled={processing} variant="destructive">
                            <XCircle className="h-4 w-4 mr-2" /> Reject
                          </Button>
                        </div>
                      ) : (
                        r.reviewNote ? (
                          <div className="text-xs text-foreground-muted">Note: {r.reviewNote}</div>
                        ) : null
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
  )
}
