"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  Users,
  FileText,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { Navigation } from "@/components/navigation";

interface AdminStats {
  totalUsers: number;
  totalStudents: number;
  totalDonors: number;
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  totalFunding: number;
  totalCourses: number;
  pendingCourses: number;
}

interface RecentActivity {
  _id: string;
  type: "application" | "donation" | "course_request";
  description: string;
  amount?: number;
  status: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalStudents: 0,
    totalDonors: 0,
    totalApplications: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    totalFunding: 0,
    totalCourses: 0,
    pendingCourses: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;

    if (!session || session.user?.userType !== "admin") {
      router.push("/auth/signin");
      return;
    }

    fetchDashboardData();
  }, [session, status, router]);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, activityRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/recent-activity"),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (activityRes.ok) {
        const activityData = await activityRes.json();
        setRecentActivity(activityData);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "application":
        return <FileText className="h-4 w-4 text-primary" />;
      case "donation":
        return <DollarSign className="h-4 w-4 text-accent" />;
      case "course_request":
        return <BookOpen className="h-4 w-4 text-secondary" />;
      default:
        return <AlertCircle className="h-4 w-4 text-foreground-muted" />;
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-foreground-muted">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navigation />
      <div className="lg:pl-64">
        <div className="container mx-auto px-4 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Admin Dashboard
            </h1>
            <p className="text-xl text-foreground-muted">
              Manage the SkillFund platform and monitor key metrics
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border-none bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-indigo-700">
                  Total Users
                </CardTitle>
                <Users className="h-4 w-4 text-indigo-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-800">
                  {stats.totalUsers.toLocaleString()}
                </div>
                <p className="text-xs text-slate-500">
                  {stats.totalStudents} students, {stats.totalDonors} donors
                </p>
              </CardContent>
            </Card>

            <Card className="border-none bg-indigo-50 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-indigo-700">
                  Applications
                </CardTitle>
                <FileText className="h-4 w-4 text-indigo-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-800">
                  {stats.totalApplications.toLocaleString()}
                </div>
                <p className="text-xs text-slate-500">
                  {stats.pendingApplications} pending review
                </p>
              </CardContent>
            </Card>

            <Card className="border-none bg-blue-50 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-700">
                  Total Funding
                </CardTitle>
                <DollarSign className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-800">
                  ${stats.totalFunding.toLocaleString()}
                </div>
                <p className="text-xs text-slate-500">
                  Platform lifetime funding
                </p>
              </CardContent>
            </Card>

            <Card className="border-none bg-emerald-50 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-emerald-700">
                  Courses
                </CardTitle>
                <BookOpen className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-800">
                  {stats.totalCourses.toLocaleString()}
                </div>
                <p className="text-xs text-slate-500">
                  {stats.pendingCourses} pending approval
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Link href="/admin/applications">
              <Card className="border-none bg-indigo-50 hover:shadow-md hover:bg-indigo-100/50 transition-all cursor-pointer">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-medium text-indigo-800">
                        Review Applications
                      </CardTitle>
                      <CardDescription className="text-xs text-indigo-600/80">
                        {stats.pendingApplications} pending
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/admin/courses">
              <Card className="border-none bg-emerald-50 hover:shadow-md hover:bg-emerald-100/50 transition-all cursor-pointer">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-medium text-emerald-800">
                        Manage Courses
                      </CardTitle>
                      <CardDescription className="text-xs text-emerald-600/80">
                        {stats.pendingCourses} pending
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/admin/users">
              <Card className="border-none bg-sky-50 hover:shadow-md hover:bg-sky-100/50 transition-all cursor-pointer">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-sky-100 rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-sky-600" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-medium text-sky-800">
                        User Management
                      </CardTitle>
                      <CardDescription className="text-xs text-sky-600/80">
                        {stats.totalUsers} total users
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/analytics">
              <Card className="border-none bg-amber-50 hover:shadow-md hover:bg-amber-100/50 transition-all cursor-pointer">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                      <BarChart3 className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-medium text-amber-800">
                        Analytics
                      </CardTitle>
                      <CardDescription className="text-xs text-amber-600/80">
                        Platform insights
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            {/* Tabs Header */}
            <TabsList className="grid w-full grid-cols-3 bg-muted/30 rounded-lg p-1">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition-all"
              >
                Platform Overview
              </TabsTrigger>
              <TabsTrigger
                value="activity"
                className="data-[state=active]:bg-accent/10 data-[state=active]:text-accent transition-all"
              >
                Recent Activity
              </TabsTrigger>
              <TabsTrigger
                value="alerts"
                className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-700 transition-all"
              >
                System Alerts
              </TabsTrigger>
            </TabsList>

            {/* ---- OVERVIEW TAB ---- */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Application Status */}
                <Card className="border-none bg-indigo-50 hover:shadow-md transition-all">
                  <CardHeader>
                    <CardTitle className="text-indigo-800">
                      Application Status
                    </CardTitle>
                    <CardDescription className="text-indigo-600">
                      Current application pipeline
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-indigo-500" />
                        <span className="text-sm text-indigo-800">
                          Pending Review
                        </span>
                      </div>
                      <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200">
                        {stats.pendingApplications}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-800">Approved</span>
                      </div>
                      <Badge className="bg-green-100 text-green-700 border-green-200">
                        {stats.approvedApplications}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-blue-800">Funded</span>
                      </div>
                      <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                        {stats.totalApplications -
                          stats.pendingApplications -
                          stats.approvedApplications}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Platform Health */}
                <Card className="border-none bg-emerald-50 hover:shadow-md transition-all">
                  <CardHeader>
                    <CardTitle className="text-emerald-800">
                      Platform Health
                    </CardTitle>
                    <CardDescription className="text-emerald-600">
                      Key performance indicators
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-emerald-700">
                        Success Rate
                      </span>
                      <span className="text-sm font-semibold text-emerald-800">
                        {stats.totalApplications > 0
                          ? Math.round(
                              ((stats.totalApplications -
                                stats.pendingApplications) /
                                stats.totalApplications) *
                                100
                            )
                          : 0}
                        %
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-emerald-700">
                        Avg. Funding per Student
                      </span>
                      <span className="text-sm font-semibold text-emerald-800">
                        $
                        {stats.totalStudents > 0
                          ? Math.round(
                              stats.totalFunding / stats.totalStudents
                            ).toLocaleString()
                          : 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-emerald-700">
                        Active Courses
                      </span>
                      <span className="text-sm font-semibold text-emerald-800">
                        {stats.totalCourses}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* ---- ACTIVITY TAB ---- */}
            <TabsContent value="activity" className="space-y-6">
              <Card className="border-none bg-sky-50 hover:shadow-md transition-all">
                <CardHeader>
                  <CardTitle className="text-sky-800">
                    Recent Platform Activity
                  </CardTitle>
                  <CardDescription className="text-sky-600">
                    Latest actions across the platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {recentActivity.length === 0 ? (
                    <div className="text-center py-8">
                      <TrendingUp className="h-12 w-12 text-sky-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-sky-800 mb-2">
                        No recent activity
                      </h3>
                      <p className="text-sky-600">
                        Activity will appear here as users interact with the
                        platform.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentActivity.map((activity) => (
                        <div
                          key={activity._id}
                          className="flex items-center space-x-4 p-4 border border-sky-100 rounded-lg bg-white/70"
                        >
                          {getActivityIcon(activity.type)}
                          <div className="flex-1">
                            <p className="text-sm text-sky-900">
                              {activity.description}
                            </p>
                            <p className="text-xs text-sky-600">
                              {new Date(activity.createdAt).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {activity.amount && (
                              <span className="text-sm font-semibold text-sky-800">
                                ${activity.amount.toLocaleString()}
                              </span>
                            )}
                            <Badge
                              variant={
                                activity.status === "completed"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {activity.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ---- ALERTS TAB ---- */}
            <TabsContent value="alerts" className="space-y-6">
              <Card className="border-none bg-amber-50 hover:shadow-md transition-all">
                <CardHeader>
                  <CardTitle className="text-amber-800">
                    System Alerts
                  </CardTitle>
                  <CardDescription className="text-amber-600">
                    Important notifications and warnings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.pendingApplications > 10 && (
                      <div className="flex items-center space-x-3 p-4 border border-orange-200 rounded-lg bg-orange-50">
                        <AlertCircle className="h-5 w-5 text-orange-600" />
                        <div>
                          <p className="text-sm font-semibold text-orange-800">
                            High Application Volume
                          </p>
                          <p className="text-xs text-orange-600">
                            {stats.pendingApplications} applications pending
                            review
                          </p>
                        </div>
                        <Link href="/admin/applications" className="ml-auto">
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-transparent hover:bg-orange-100"
                          >
                            Review
                          </Button>
                        </Link>
                      </div>
                    )}

                    {stats.pendingCourses > 5 && (
                      <div className="flex items-center space-x-3 p-4 border border-blue-200 rounded-lg bg-blue-50">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-sm font-semibold text-blue-800">
                            Course Requests Pending
                          </p>
                          <p className="text-xs text-blue-600">
                            {stats.pendingCourses} course requests need approval
                          </p>
                        </div>
                        <Link href="/admin/courses" className="ml-auto">
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-transparent hover:bg-blue-100"
                          >
                            Review
                          </Button>
                        </Link>
                      </div>
                    )}

                    {stats.pendingApplications <= 10 &&
                      stats.pendingCourses <= 5 && (
                        <div className="text-center py-8">
                          <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-green-800 mb-2">
                            All Clear
                          </h3>
                          <p className="text-green-600">
                            No urgent alerts at this time.
                          </p>
                        </div>
                      )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
