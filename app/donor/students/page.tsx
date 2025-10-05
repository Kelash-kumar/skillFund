"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Search, Filter, Heart, DollarSign, Clock, Award, User, Calendar, Building } from "lucide-react"
import Link from "next/link"

interface StudentApplication {
  _id: string
  studentId: string
  studentName: string
  courseTitle: string
  courseProvider: string
  courseCategory: string
  amount: number
  reason: string
  careerGoals: string
  timeline: string
  createdAt: string
  fundingProgress: number
  fundedAmount: number
}

export default function BrowseStudentsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [applications, setApplications] = useState<StudentApplication[]>([])
  const [filteredApplications, setFilteredApplications] = useState<StudentApplication[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [fundingFilter, setFundingFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    if (status === "loading") return

    if (!session || session.user?.userType !== "donor") {
      router.push("/auth/signin")
      return
    }

    fetchApplications()
  }, [session, status, router])

  useEffect(() => {
    filterApplications()
  }, [applications, searchTerm, selectedCategory, fundingFilter])

  const fetchApplications = async () => {
    try {
      const response = await fetch("/api/donor/browse-students")
      if (response.ok) {
        const data = await response.json()
        setApplications(data)

        // Extract unique categories
        const uniqueCategories = [...new Set(data.map((app: StudentApplication) => app.courseCategory))]
        setCategories(uniqueCategories)
      }
    } catch (error) {
      console.error("Error fetching applications:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterApplications = () => {
    let filtered = applications

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (app) =>
          app.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.courseTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.careerGoals.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter((app) => app.courseCategory === selectedCategory)
    }

    // Funding filter
    if (fundingFilter !== "all") {
      switch (fundingFilter) {
        case "new":
          filtered = filtered.filter((app) => app.fundingProgress === 0)
          break
        case "partial":
          filtered = filtered.filter((app) => app.fundingProgress > 0 && app.fundingProgress < 100)
          break
        case "almost-funded":
          filtered = filtered.filter((app) => app.fundingProgress >= 75 && app.fundingProgress < 100)
          break
      }
    }

    setFilteredApplications(filtered)
  }

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedCategory("all")
    setFundingFilter("all")
  }

  const handleSponsor = async (applicationId: string, amount: number) => {
    try {
      const response = await fetch("/api/donor/sponsor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          applicationId,
          amount,
        }),
      })

      if (response.ok) {
        // Refresh the applications list
        fetchApplications()
        // You could also show a success message here
      }
    } catch (error) {
      console.error("Error sponsoring student:", error)
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-foreground-muted">Loading students...</p>
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
            <Link href="/donor/dashboard" className="text-foreground-muted hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <Link href="/donor/students" className="text-primary font-medium">
              Browse Students
            </Link>
            <Link href="/donor/donations" className="text-foreground-muted hover:text-foreground transition-colors">
              My Donations
            </Link>
            <Link href="/donor/profile" className="text-foreground-muted hover:text-foreground transition-colors">
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
          <h1 className="text-4xl font-bold text-foreground mb-2">Browse Students</h1>
          <p className="text-xl text-foreground-muted">
            Discover talented students who need funding for their professional development
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="border-border bg-card mb-8">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Search & Filter Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-foreground-muted" />
                  <Input
                    placeholder="Search students, courses, or goals..."
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

              <Select value={fundingFilter} onValueChange={setFundingFilter}>
                <SelectTrigger className="border-input-border bg-input">
                  <SelectValue placeholder="Funding Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Students</SelectItem>
                  <SelectItem value="new">New Applications</SelectItem>
                  <SelectItem value="partial">Partially Funded</SelectItem>
                  <SelectItem value="almost-funded">Almost Funded</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-foreground-muted">
                Showing {filteredApplications.length} of {applications.length} students
              </p>
              <Button variant="outline" onClick={clearFilters} size="sm">
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Students Grid */}
        {filteredApplications.length === 0 ? (
          <Card className="border-border bg-card">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Search className="h-12 w-12 text-foreground-muted mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No students found</h3>
                <p className="text-foreground-muted mb-4">Try adjusting your search criteria</p>
                <Button onClick={clearFilters} variant="outline">
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredApplications.map((application) => (
              <Card key={application._id} className="border-border bg-card hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-foreground">{application.studentName}</CardTitle>
                        <CardDescription className="text-foreground-muted flex items-center">
                          <Building className="h-4 w-4 mr-1" />
                          {application.courseProvider}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {application.courseCategory}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-foreground">{application.courseTitle}</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-1">Why they need funding:</h4>
                    <p className="text-sm text-foreground-muted line-clamp-2">{application.reason}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-1">Career goals:</h4>
                    <p className="text-sm text-foreground-muted line-clamp-2">{application.careerGoals}</p>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-foreground-muted">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {application.timeline}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {new Date(application.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Funding Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-foreground">Funding Progress</span>
                      <span className="text-sm text-foreground">
                        ${application.fundedAmount.toLocaleString()} / ${application.amount.toLocaleString()}
                      </span>
                    </div>
                    <Progress value={application.fundingProgress} className="h-2" />
                    <div className="text-xs text-foreground-muted text-right">
                      {application.fundingProgress}% funded
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2 pt-2">
                    <Button
                      className="flex-1 bg-primary hover:bg-primary-hover"
                      onClick={() => handleSponsor(application._id, application.amount - application.fundedAmount)}
                      disabled={application.fundingProgress >= 100}
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      {application.fundingProgress >= 100 ? "Fully Funded" : "Sponsor Student"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() =>
                        handleSponsor(application._id, Math.min(100, application.amount - application.fundedAmount))
                      }
                      disabled={application.fundingProgress >= 100}
                      className="border-border"
                    >
                      <DollarSign className="h-4 w-4" />
                    </Button>
                  </div>

                  {application.fundingProgress >= 100 && (
                    <div className="flex items-center justify-center text-accent text-sm font-medium">
                      <Award className="h-4 w-4 mr-1" />
                      This student is fully funded!
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
