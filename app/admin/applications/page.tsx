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
  FileText,
  User,
  Building,
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  AlertTriangle,
  AlertCircle,
  Download,
  Paperclip,
} from "lucide-react";
import Link from "next/link";

// Updated interface based on actual MongoDB schema
interface UnifiedApplication {
  _id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  requestType: "available-course" | "new-course" | "certification";

  // Course information (varies by type)
  courseId?: string;
  courseTitle: string;
  courseProvider: string;
  title?: string;
  certificationType?: string;
  provider?: string;
  category?: string;
  duration?: string;
  courseUrl?: string;

  // Financial information
  estimatedCost: number;

  // Application details
  reason: string;
  description?: string;
  careerGoals?: string;
  previousExperience?: string;
  expectedOutcome?: string;
  urgency: "low" | "medium" | "high";

  // Status and approval
  status: "pending" | "approved" | "rejected";
  isApproved: boolean;

  // Documents with proper structure
  documents: {
    [key: string]: {
      originalName: string;
      fileName: string;
      filePath: string;
      fileSize: number;
      fileType: string;
      uploadedAt: string;
    };
  };
  documentCount: number;
  documentNames: string[];

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

// Application Grid Component
function ApplicationGrid({
  applications,
  router,
  type,
}: {
  applications: UnifiedApplication[];
  router: any;
  type?: string;
}) {
  if (applications.length === 0) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-foreground-muted mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No applications found
            </h3>
            <p className="text-foreground-muted">
              No applications match the current filter
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {applications.map((application) => (
        <ApplicationCard
          key={application._id}
          application={application}
          router={router}
          type={type}
        />
      ))}
    </div>
  );
}

// Individual Application Card Component
function ApplicationCard({
  application,
  router,
  type,
}: {
  application: UnifiedApplication;
  router: any;
  type?: string;
}) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-accent" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-destructive" />;
      case "funded":
        return <DollarSign className="h-4 w-4 text-primary" />;
      default:
        return <Clock className="h-4 w-4 text-foreground-muted" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-accent/10 text-accent border-accent/20";
      case "rejected":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "funded":
        return "bg-primary/10 text-primary border-primary/20";
      default:
        return "bg-foreground-muted/10 text-foreground-muted border-foreground-muted/20";
    }
  };

  const getTypeIcon = (appType: string) => {
    switch (appType) {
      case "available-course":
        return <BookOpen className="h-6 w-6 text-blue-600" />;
      case "new-course":
        return <FileText className="h-6 w-6 text-green-600" />;
      case "certification":
        return <Building className="h-6 w-6 text-purple-600" />;
      default:
        return <User className="h-6 w-6 text-primary" />;
    }
  };

  const getTypeLabel = (appType: string) => {
    switch (appType) {
      case "available-course":
        return "Available Course";
      case "new-course":
        return "New Course Request";
      case "certification":
        return "Certification";
      default:
        return "Application";
    }
  };

  const getTypeBadgeColor = (appType: string) => {
    switch (appType) {
      case "available-course":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "new-course":
        return "bg-green-100 text-green-800 border-green-200";
      case "certification":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleNavigation = () => {
    if (!application._id) {
      console.error("❌ No application ID found:", application);
      return;
    }

    const url = `/admin/applications/${application._id}`;
    console.log(
      "� Simple navigation to:",
      url,
      "for application:",
      application.studentName
    );

    // Use window.location for more reliable navigation
    window.location.href = url;
  };

  return (
    <Card
      className="border-border bg-card hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleNavigation}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              {getTypeIcon(application.requestType)}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <CardTitle className="text-lg text-foreground">
                  {application.studentName}
                </CardTitle>
                <Badge
                  className={`text-xs ${getTypeBadgeColor(
                    application.requestType
                  )}`}
                >
                  {getTypeLabel(application.requestType)}
                </Badge>
              </div>
              <CardDescription className="text-foreground-muted">
                {application.studentEmail}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor(application.status)}>
              {getStatusIcon(application.status)}
              <span className="ml-1">{application.status}</span>
            </Badge>
            {application.urgency && (
              <Badge
                variant={
                  application.urgency === "high"
                    ? "destructive"
                    : application.urgency === "medium"
                    ? "default"
                    : "secondary"
                }
                className="flex items-center gap-1"
              >
                {application.urgency === "high" && (
                  <AlertTriangle className="h-3 w-3" />
                )}
                {application.urgency === "medium" && (
                  <AlertCircle className="h-3 w-3" />
                )}
                {application.urgency === "low" && <Clock className="h-3 w-3" />}
                {application.urgency}
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleNavigation();
              }}
            >
              <Eye className="h-4 w-4 mr-1" />
              View Details
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h4 className="font-semibold text-foreground mb-1">
              {application.requestType === "certification"
                ? "Certification:"
                : "Course:"}
            </h4>
            <p className="text-sm text-foreground-muted font-medium">
              {application.courseTitle}
            </p>
            <p className="text-xs text-foreground-muted">
              {application.courseProvider}
            </p>
            {application.duration && (
              <p className="text-xs text-blue-600 mt-1">
                Duration: {application.duration}
              </p>
            )}
            {application.category && (
              <p className="text-xs text-green-600 mt-1">
                Category: {application.category}
              </p>
            )}
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-1">
              {application.requestType === "available-course"
                ? "Estimated Cost:"
                : "Requested Amount:"}
            </h4>
            <p className="text-lg font-bold text-primary">
              ${application.estimatedCost?.toLocaleString() || 0}
            </p>
            {application.courseUrl &&
              application.requestType === "new-course" && (
                <p className="text-xs text-blue-600 mt-1">
                  <a
                    href={application.courseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Course
                  </a>
                </p>
              )}
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-1">Applied:</h4>
            <div className="flex items-center text-sm text-foreground-muted">
              <Calendar className="h-4 w-4 mr-1" />
              {new Date(application.createdAt).toLocaleDateString()}
            </div>
            {application.documentCount > 0 && (
              <div className="flex items-center mt-1 text-xs text-blue-600">
                <Paperclip className="h-3 w-3 mr-1" />
                <span>
                  {application.documentCount} document
                  {application.documentCount === 1 ? "" : "s"}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="mt-4">
          <p className="text-sm text-foreground-muted line-clamp-2">
            {application.description || application.reason}
          </p>
          {application.documentNames &&
            application.documentNames.length > 0 && (
              <div className="flex items-start mt-2 text-xs text-foreground-muted">
                <Paperclip className="h-3 w-3 mr-1 mt-0.5" />
                <div>
                  <span className="font-medium">Documents attached:</span>
                  <div className="ml-1 flex flex-wrap gap-1 mt-1">
                    {application.documentNames.map((docName, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="text-xs px-1 py-0"
                      >
                        {docName}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminApplicationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [allApplications, setAllApplications] = useState<UnifiedApplication[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;

    if (!session || session.user?.userType !== "admin") {
      router.push("/auth/signin");
      return;
    }

    fetchApplications();
  }, [session, status, router]);

  const fetchApplications = async () => {
    try {
      console.log("🔍 Fetching applications from unified API...");
      const response = await fetch("/api/admin/unified-applications", {
        credentials: "include",
      });

      console.log("📡 API Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Received applications:", data);
        console.log(
          "📊 Application count:",
          Array.isArray(data) ? data.length : "Not an array"
        );
        setAllApplications(data);
      } else {
        const errorText = await response.text();
        console.error(
          "❌ Failed to fetch applications:",
          response.status,
          response.statusText
        );
        console.error("❌ Error response:", errorText);
      }
    } catch (error) {
      console.error("❌ Network error fetching applications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-accent" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-destructive" />;
      case "funded":
        return <DollarSign className="h-4 w-4 text-primary" />;
      default:
        return <Clock className="h-4 w-4 text-foreground-muted" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-accent/10 text-accent border-accent/20";
      case "rejected":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "funded":
        return "bg-primary/10 text-primary border-primary/20";
      default:
        return "bg-foreground-muted/10 text-foreground-muted border-foreground-muted/20";
    }
  };

  const filterApplications = (status: string, requestType?: string) => {
    let filtered = allApplications;

    if (status !== "all") {
      filtered = filtered.filter((app) => app.status === status);
    }

    if (requestType) {
      filtered = filtered.filter((app) => app.requestType === requestType);
    }

    return filtered;
  };

  const getApplicationsByType = (
    requestType: "available-course" | "new-course" | "certification"
  ) => {
    const filtered = allApplications.filter(
      (app) => app.requestType === requestType
    );
    console.log(`🔍 Applications for ${requestType}:`, filtered.length);
    console.log(
      `🔍 Sample application IDs:`,
      filtered
        .slice(0, 3)
        .map((app) => ({ id: app._id, type: app.requestType }))
    );
    return filtered;
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-foreground-muted">Loading applications...</p>
        </div>
      </div>
    );
  }

  // Debug logging
  console.log("🔍 Admin Applications Debug Info:");
  console.log("   Session:", session?.user);
  console.log("   Loading:", isLoading);
  console.log("   All Applications:", allApplications);
  console.log("   Application Count:", allApplications.length);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link href="/" className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-foreground">
                SkillFund
              </span>
            </Link>
            <Badge variant="secondary" className="ml-2">
              Admin
            </Badge>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/admin/dashboard"
              className="text-foreground-muted hover:text-foreground transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/admin/applications"
              className="text-primary font-medium"
            >
              Applications
            </Link>
            <Link
              href="/admin/courses"
              className="text-foreground-muted hover:text-foreground transition-colors"
            >
              Courses
            </Link>
            <Link
              href="/admin/users"
              className="text-foreground-muted hover:text-foreground transition-colors"
            >
              Users
            </Link>
          </nav>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-foreground-muted">
              Admin: {session?.user?.name}
            </span>
            <Button
              variant="outline"
              onClick={() => router.push("/api/auth/signout")}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-10">
        {/* Page Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Application Management
          </h1>
          <p className="text-lg text-foreground-muted">
            Review and manage student funding applications
          </p>
        </div>

        <Tabs defaultValue="all" className="space-y-8">
          {/* Tab List */}
          <TabsList className="grid w-full grid-cols-5 bg-muted/30 rounded-lg p-1">
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition-all text-sm font-medium"
            >
              All Applications ({allApplications.length})
            </TabsTrigger>
            <TabsTrigger
              value="available-courses"
              className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 transition-all text-sm font-medium"
            >
              Available Courses (
              {getApplicationsByType("available-course").length})
            </TabsTrigger>
            <TabsTrigger
              value="new-courses"
              className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700 transition-all text-sm font-medium"
            >
              New Courses ({getApplicationsByType("new-course").length})
            </TabsTrigger>
            <TabsTrigger
              value="certifications"
              className="data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700 transition-all text-sm font-medium"
            >
              Certifications ({getApplicationsByType("certification").length})
            </TabsTrigger>
            <TabsTrigger
              value="pending"
              className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-700 transition-all text-sm font-medium"
            >
              Pending ({filterApplications("pending").length})
            </TabsTrigger>
          </TabsList>

          {/* ---- ALL APPLICATIONS ---- */}
          <TabsContent
            value="all"
            className="space-y-6 bg-card rounded-lg p-6 border border-border/50"
          >
            <ApplicationGrid applications={allApplications} router={router} />
          </TabsContent>

          {/* ---- AVAILABLE COURSES ---- */}
          <TabsContent
            value="available-courses"
            className="space-y-6 bg-blue-50/40 rounded-lg p-6 border border-blue-100"
          >
            <div className="mb-4">
              <h2 className="text-2xl font-semibold text-blue-800 mb-1">
                Available Course Applications
              </h2>
              <p className="text-blue-700/80">
                Applications for courses already in our catalog
              </p>
            </div>
            <ApplicationGrid
              applications={getApplicationsByType("available-course")}
              router={router}
              type="available-course"
            />
          </TabsContent>

          {/* ---- NEW COURSES ---- */}
          <TabsContent
            value="new-courses"
            className="space-y-6 bg-emerald-50/40 rounded-lg p-6 border border-emerald-100"
          >
            <div className="mb-4">
              <h2 className="text-2xl font-semibold text-emerald-800 mb-1">
                New Course Requests
              </h2>
              <p className="text-emerald-700/80">
                Student requests for courses not currently in our catalog
              </p>
            </div>
            <ApplicationGrid
              applications={getApplicationsByType("new-course")}
              router={router}
              type="new-course"
            />
          </TabsContent>

          {/* ---- CERTIFICATIONS ---- */}
          <TabsContent
            value="certifications"
            className="space-y-6 bg-violet-50/40 rounded-lg p-6 border border-violet-100"
          >
            <div className="mb-4">
              <h2 className="text-2xl font-semibold text-violet-800 mb-1">
                Certification Requests
              </h2>
              <p className="text-violet-700/80">
                Applications for professional certifications and credentials
              </p>
            </div>
            <ApplicationGrid
              applications={getApplicationsByType("certification")}
              router={router}
              type="certification"
            />
          </TabsContent>

          {/* ---- PENDING APPLICATIONS ---- */}
          <TabsContent
            value="pending"
            className="space-y-6 bg-amber-50/40 rounded-lg p-6 border border-amber-100"
          >
            <div className="mb-4">
              <h2 className="text-2xl font-semibold text-amber-800 mb-1">
                Pending Applications
              </h2>
              <p className="text-amber-700/80">
                All applications awaiting review
              </p>
            </div>
            <ApplicationGrid
              applications={filterApplications("pending")}
              router={router}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
