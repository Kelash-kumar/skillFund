"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Users,
  User,
  UserCheck,
  UserX,
  Mail,
  Calendar,
  MapPin,
  Phone,
  Building,
  Search,
  Filter,
  Eye,
  Shield,
  GraduationCap,
  Heart,
} from "lucide-react"
import { Navigation } from "@/components/navigation"

interface User {
  _id: string
  name: string
  email: string
  userType: "student" | "donor" | "admin"
  location?: string
  phone?: string
  bio?: string
  university?: string
  major?: string
  graduationYear?: string
  organization?: string
  position?: string
  interests?: string[]
  isActive: boolean
  createdAt: string
  lastLogin?: string
  profileComplete?: boolean
}

interface UserStats {
  totalApplications?: number
  totalDonations?: number
  totalFunded?: number
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [userStats, setUserStats] = useState<UserStats>({})

  const [search, setSearch] = useState("")
  const [filterType, setFilterType] = useState<"all" | "student" | "donor" | "admin">("all")
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all")

  useEffect(() => {
    if (status === "loading") return
    if (!session || session.user?.userType !== "admin") {
      router.push("/auth/signin")
      return
    }
    fetchUsers()
  }, [session, status, router])

  useEffect(() => {
    let filtered = users

    // Filter by search term
    if (search) {
      const searchTerm = search.toLowerCase()
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm) ||
          user.email.toLowerCase().includes(searchTerm) ||
          user.university?.toLowerCase().includes(searchTerm) ||
          user.organization?.toLowerCase().includes(searchTerm)
      )
    }

    // Filter by user type
    if (filterType !== "all") {
      filtered = filtered.filter((user) => user.userType === filterType)
    }

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter((user) => user.isActive === (filterStatus === "active"))
    }

    setFilteredUsers(filtered)
  }, [users, search, filterType, filterStatus])

  const fetchUsers = async () => {
    try {
      console.log("Fetching users...")
      const response = await fetch("/api/admin/users")
      if (response.ok) {
        const userData = await response.json()
        console.log("Users fetched:", userData.length)
        setUsers(userData)
        setFilteredUsers(userData)
      } else {
        console.error("Failed to fetch users:", response.status, response.statusText)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserStats = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/stats`)
      if (response.ok) {
        const stats = await response.json()
        setUserStats(stats)
      }
    } catch (error) {
      console.error("Error fetching user stats:", error)
    }
  }

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isActive: !currentStatus,
        }),
      })

      if (response.ok) {
        await fetchUsers() // Refresh the user list
      }
    } catch (error) {
      console.error("Error updating user status:", error)
    }
  }

  const getUserTypeIcon = (userType: string) => {
    switch (userType) {
      case "student":
        return <GraduationCap className="h-4 w-4 text-blue-500" />
      case "donor":
        return <Heart className="h-4 w-4 text-red-500" />
      case "admin":
        return <Shield className="h-4 w-4 text-purple-500" />
      default:
        return <User className="h-4 w-4 text-gray-500" />
    }
  }

  const getUserTypeBadgeColor = (userType: string) => {
    switch (userType) {
      case "student":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "donor":
        return "bg-red-100 text-red-800 border-red-200"
      case "admin":
        return "bg-purple-100 text-purple-800 border-purple-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const openUserDetails = (user: User) => {
    setSelectedUser(user)
    fetchUserStats(user._id)
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Users className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-foreground-muted">Loading users...</p>
        </div>
      </div>
    )
  }

  const usersByType = {
    all: filteredUsers.length,
    student: filteredUsers.filter((u) => u.userType === "student").length,
    donor: filteredUsers.filter((u) => u.userType === "donor").length,
    admin: filteredUsers.filter((u) => u.userType === "admin").length,
  }

  return (
    <>
      <Navigation />
      <div className="lg:pl-64">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">User Management</h1>
            <p className="text-xl text-foreground-muted">
              Manage platform users and monitor user activity
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users.length}</div>
                <p className="text-xs text-muted-foreground">
                  {users.filter((u) => u.isActive).length} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Students</CardTitle>
                <GraduationCap className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {users.filter((u) => u.userType === "student").length}
                </div>
                <p className="text-xs text-muted-foreground">Learning community</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Donors</CardTitle>
                <Heart className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {users.filter((u) => u.userType === "donor").length}
                </div>
                <p className="text-xs text-muted-foreground">Supporting community</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Admins</CardTitle>
                <Shield className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {users.filter((u) => u.userType === "admin").length}
                </div>
                <p className="text-xs text-muted-foreground">Platform managers</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filter Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, email, university, or organization..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as any)}
                    className="px-3 py-2 border border-input rounded-md bg-background"
                  >
                    <option value="all">All Types</option>
                    <option value="student">Students</option>
                    <option value="donor">Donors</option>
                    <option value="admin">Admins</option>
                  </select>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="px-3 py-2 border border-input rounded-md bg-background"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Users List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Platform Users</CardTitle>
                <Badge variant="outline">
                  {filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""}
                </Badge>
              </div>
              <CardDescription>
                Manage and monitor all platform users
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredUsers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No users found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search filters or check back later.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredUsers.map((user) => (
                    <Card key={user._id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                              {user.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-semibold text-sm truncate">{user.name}</h3>
                              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            {getUserTypeIcon(user.userType)}
                            {user.isActive ? (
                              <UserCheck className="h-3 w-3 text-green-500" />
                            ) : (
                              <UserX className="h-3 w-3 text-red-500" />
                            )}
                          </div>
                        </div>

                        <div className="space-y-2 mb-4">
                          <Badge variant="outline" className={getUserTypeBadgeColor(user.userType)}>
                            {user.userType.charAt(0).toUpperCase() + user.userType.slice(1)}
                          </Badge>

                          {user.university && (
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Building className="h-3 w-3 mr-1" />
                              <span className="truncate">{user.university}</span>
                            </div>
                          )}

                          {user.organization && (
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Building className="h-3 w-3 mr-1" />
                              <span className="truncate">{user.organization}</span>
                            </div>
                          )}

                          {user.location && (
                            <div className="flex items-center text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3 mr-1" />
                              <span className="truncate">{user.location}</span>
                            </div>
                          )}

                          <div className="flex items-center text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={() => openUserDetails(user)}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle className="flex items-center space-x-2">
                                  <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center text-xs font-medium">
                                    {selectedUser?.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
                                  </div>
                                  <span>{selectedUser?.name}</span>
                                  {getUserTypeIcon(selectedUser?.userType || "")}
                                </DialogTitle>
                                <DialogDescription>
                                  Detailed information about this user
                                </DialogDescription>
                              </DialogHeader>
                              
                              {selectedUser && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="space-y-4">
                                    <div>
                                      <h4 className="font-semibold text-sm mb-2">Basic Information</h4>
                                      <div className="space-y-2 text-sm">
                                        <div className="flex items-center">
                                          <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                                          <span>{selectedUser.email}</span>
                                        </div>
                                        {selectedUser.phone && (
                                          <div className="flex items-center">
                                            <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                                            <span>{selectedUser.phone}</span>
                                          </div>
                                        )}
                                        {selectedUser.location && (
                                          <div className="flex items-center">
                                            <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                                            <span>{selectedUser.location}</span>
                                          </div>
                                        )}
                                        <div className="flex items-center">
                                          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                                          <span>Joined {new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                                        </div>
                                      </div>
                                    </div>

                                    {selectedUser.userType === "student" && (
                                      <div>
                                        <h4 className="font-semibold text-sm mb-2">Academic Information</h4>
                                        <div className="space-y-2 text-sm">
                                          {selectedUser.university && (
                                            <div>
                                              <span className="text-muted-foreground">University:</span> {selectedUser.university}
                                            </div>
                                          )}
                                          {selectedUser.major && (
                                            <div>
                                              <span className="text-muted-foreground">Major:</span> {selectedUser.major}
                                            </div>
                                          )}
                                          {selectedUser.graduationYear && (
                                            <div>
                                              <span className="text-muted-foreground">Graduation:</span> {selectedUser.graduationYear}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}

                                    {selectedUser.userType === "donor" && (
                                      <div>
                                        <h4 className="font-semibold text-sm mb-2">Professional Information</h4>
                                        <div className="space-y-2 text-sm">
                                          {selectedUser.organization && (
                                            <div>
                                              <span className="text-muted-foreground">Organization:</span> {selectedUser.organization}
                                            </div>
                                          )}
                                          {selectedUser.position && (
                                            <div>
                                              <span className="text-muted-foreground">Position:</span> {selectedUser.position}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  <div className="space-y-4">
                                    <div>
                                      <h4 className="font-semibold text-sm mb-2">Status & Activity</h4>
                                      <div className="space-y-2">
                                        <div className="flex items-center space-x-2">
                                          <Badge variant={selectedUser.isActive ? "default" : "secondary"}>
                                            {selectedUser.isActive ? "Active" : "Inactive"}
                                          </Badge>
                                          <Badge variant="outline" className={getUserTypeBadgeColor(selectedUser.userType)}>
                                            {selectedUser.userType.charAt(0).toUpperCase() + selectedUser.userType.slice(1)}
                                          </Badge>
                                        </div>
                                        {selectedUser.lastLogin && (
                                          <div className="text-sm text-muted-foreground">
                                            Last login: {new Date(selectedUser.lastLogin).toLocaleDateString()}
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    <div>
                                      <h4 className="font-semibold text-sm mb-2">Platform Statistics</h4>
                                      <div className="space-y-2 text-sm">
                                        {selectedUser.userType === "student" && (
                                          <>
                                            <div>Applications: {userStats.totalApplications || 0}</div>
                                            <div>Total Funded: ${(userStats.totalFunded || 0).toLocaleString()}</div>
                                          </>
                                        )}
                                        {selectedUser.userType === "donor" && (
                                          <div>Total Donations: {userStats.totalDonations || 0}</div>
                                        )}
                                      </div>
                                    </div>

                                    {selectedUser.bio && (
                                      <div>
                                        <h4 className="font-semibold text-sm mb-2">Bio</h4>
                                        <p className="text-sm text-muted-foreground">{selectedUser.bio}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>

                          <Button
                            variant={user.isActive ? "destructive" : "default"}
                            size="sm"
                            onClick={() => toggleUserStatus(user._id, user.isActive)}
                          >
                            {user.isActive ? (
                              <>
                                <UserX className="h-3 w-3 mr-1" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <UserCheck className="h-3 w-3 mr-1" />
                                Activate
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}