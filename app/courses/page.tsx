"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, Search, Building, Tag, Clock } from "lucide-react"
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
  updatedAt: string
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const [provider, setProvider] = useState("all")

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/courses")
        if (res.ok) {
          const data = await res.json()
          setCourses(data)
        }
      } catch (e) {
        console.error("Error fetching courses:", e)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  const categories = useMemo(() => Array.from(new Set(courses.map((c) => c.category))).sort(), [courses])
  const providers = useMemo(() => Array.from(new Set(courses.map((c) => c.provider))).sort(), [courses])

  const filtered = useMemo(() => {
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">SkillFund</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/courses" className="text-primary font-medium">Courses</Link>
            <Link href="/how-it-works" className="text-foreground-muted hover:text-foreground transition-colors">How it Works</Link>
            <Link href="/about" className="text-foreground-muted hover:text-foreground transition-colors">About</Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Page header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-2">Browse Courses</h1>
          <p className="text-foreground-muted text-lg">Explore approved courses eligible for funding</p>
        </div>

        {/* Filters */}
        <Card className="bg-card border-border mb-8">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-foreground-muted" />
                  <Input
                    placeholder="Search courses, providers, categories..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 border-input-border bg-input"
                  />
                </div>
              </div>

              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="border-input-border bg-input">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={provider} onValueChange={setProvider}>
                <SelectTrigger className="border-input-border bg-input">
                  <SelectValue placeholder="Provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Providers</SelectItem>
                  {providers.map((prov) => (
                    <SelectItem key={prov} value={prov}>
                      {prov}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-foreground-muted">
                Showing {filtered.length} of {courses.length} courses
              </p>
              {(category !== "all" || provider !== "all" || search) && (
                <Button variant="outline" size="sm" onClick={() => { setCategory("all"); setProvider("all"); setSearch("") }}>
                  Clear Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Courses grid */}
        {isLoading ? (
          <div className="text-center py-20 text-foreground-muted">Loading courses...</div>
        ) : filtered.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="pt-8 pb-8 text-center text-foreground-muted">No courses found</CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((course) => (
              <Card key={course._id} className="bg-card border-border hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary" className="text-xs">{course.category}</Badge>
                    <span className="text-sm font-semibold text-primary">${course?.price?.toLocaleString()}</span>
                  </div>
                  <CardTitle className="text-lg text-foreground">{course.title}</CardTitle>
                  <CardDescription className="text-foreground-muted flex items-center">
                    <Building className="h-4 w-4 mr-1" />
                    {course.provider}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground-muted line-clamp-3 mb-4">{course.description}</p>
                  <div className="flex items-center justify-between text-sm text-foreground-muted">
                    <span className="flex items-center"><Clock className="h-4 w-4 mr-1" />{course.duration}</span>
                    <span className="flex items-center"><Tag className="h-4 w-4 mr-1" />{course.certificationType}</span>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Link href={course.url} target="_blank">
                      <Button variant="outline" size="sm">Course Details</Button>
                    </Link>
                    <Link href="/auth/signup?type=student">
                      <Button size="sm" className="bg-primary hover:bg-primary-hover">Request Funding</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
