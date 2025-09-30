"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpen, Search, Filter, ExternalLink, Clock, DollarSign, Award, Building, Plus } from "lucide-react"
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
}

export default function CoursesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedProvider, setSelectedProvider] = useState("all")
  const [priceRange, setPriceRange] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [categories, setCategories] = useState<string[]>([])
  const [providers, setProviders] = useState<string[]>([])

  useEffect(() => {
    if (status === "loading") return

    if (!session || session.user?.userType !== "student") {
      router.push("/auth/signin")
      return
    }

    fetchCourses()
  }, [session, status, router])

  useEffect(() => {
    filterCourses()
  }, [courses, searchTerm, selectedCategory, selectedProvider, priceRange])

  const fetchCourses = async () => {
    try {
      const response = await fetch("/api/courses")
      if (response.ok) {
        const data = await response.json()
        setCourses(data)

        // Extract unique categories and providers
        const uniqueCategories = [...new Set(data.map((course: Course) => course.category))]
        const uniqueProviders = [...new Set(data.map((course: Course) => course.provider))]
        setCategories(uniqueCategories)
        setProviders(uniqueProviders)
      }
    } catch (error) {
      console.error("Error fetching courses:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterCourses = () => {
    let filtered = courses

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (course) =>
          course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.provider.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter((course) => course.category === selectedCategory)
    }

    // Provider filter
    if (selectedProvider !== "all") {
      filtered = filtered.filter((course) => course.provider === selectedProvider)
    }

    // Price range filter
    if (priceRange !== "all") {
      switch (priceRange) {
        case "free":
          filtered = filtered.filter((course) => course.price === 0)
          break
        case "under-100":
          filtered = filtered.filter((course) => course.price > 0 && course.price < 100)
          break
        case "100-500":
          filtered = filtered.filter((course) => course.price >= 100 && course.price <= 500)
          break
        case "over-500":
          filtered = filtered.filter((course) => course.price > 500)
          break
      }
    }

    setFilteredCourses(filtered)
  }

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedCategory("all")
    setSelectedProvider("all")
    setPriceRange("all")
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-foreground-muted">Loading courses...</p>
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
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/student/dashboard" className="text-foreground-muted hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <Link href="/student/courses" className="text-primary font-medium">
              Browse Courses
            </Link>
            <Link
              href="/student/applications"
              className="text-foreground-muted hover:text-foreground transition-colors"
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Browse Courses</h1>
          <p className="text-xl text-foreground-muted">
            Discover professional courses and certifications to advance your career
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="border-border bg-card mb-8">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-foreground-muted" />
                  <Input
                    placeholder="Search courses, providers, or keywords..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-input-border bg-input"
                  />
                </div>
              </div>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="border-input-border bg-input">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                <SelectTrigger className="border-input-border bg-input">
                  <SelectValue placeholder="Provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Providers</SelectItem>
                  {providers.map((provider) => (
                    <SelectItem key={provider} value={provider}>
                      {provider}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger className="border-input-border bg-input">
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="under-100">Under $100</SelectItem>
                  <SelectItem value="100-500">$100 - $500</SelectItem>
                  <SelectItem value="over-500">Over $500</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-foreground-muted">
                Showing {filteredCourses.length} of {courses.length} courses
              </p>
              <Button variant="outline" onClick={clearFilters} size="sm">
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Request New Course */}
        <Card className="border-border bg-card mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">Can't find the course you need?</h3>
                <p className="text-foreground-muted">Request a new course to be added to our platform</p>
              </div>
              <Link href="/student/request-course">
                <Button className="bg-secondary hover:bg-secondary-hover">
                  <Plus className="h-4 w-4 mr-2" />
                  Request Course
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Courses Grid */}
        {filteredCourses.length === 0 ? (
          <Card className="border-border bg-card">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Search className="h-12 w-12 text-foreground-muted mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No courses found</h3>
                <p className="text-foreground-muted mb-4">Try adjusting your search criteria or request a new course</p>
                <Button onClick={clearFilters} variant="outline">
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <Card key={course._id} className="border-border bg-card hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {course.category}
                    </Badge>
                    <div className="flex items-center text-primary font-semibold">
                      <DollarSign className="h-4 w-4" />
                      {course.price === 0 ? "Free" : course.price.toLocaleString()}
                    </div>
                  </div>
                  <CardTitle className="text-lg text-foreground line-clamp-2">{course.title}</CardTitle>
                  <CardDescription className="text-foreground-muted flex items-center">
                    <Building className="h-4 w-4 mr-1" />
                    {course.provider}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground-muted mb-4 line-clamp-3">{course.description}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-foreground-muted">
                      <Clock className="h-4 w-4 mr-2" />
                      {course.duration}
                    </div>
                    <div className="flex items-center text-sm text-foreground-muted">
                      <Award className="h-4 w-4 mr-2" />
                      {course.certificationType}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      className="flex-1 bg-primary hover:bg-primary-hover"
                      onClick={() => window.open(course.url, "_blank")}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Course Details
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(course.url, "_blank")}
                      className="border-border"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
