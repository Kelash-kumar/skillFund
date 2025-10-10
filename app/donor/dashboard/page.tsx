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
import {
  DollarSign,
  Gift,
  Heart,
  Users,
  Award,
} from "lucide-react";
import Link from "next/link";

// ✅ Charts
import {
  Line,
  Doughnut,
} from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface DonationStats {
  totalDonated: number;
  studentsSupported: number;
  coursesCompleted: number;
  activeSponsorship: number;
}

interface RecentDonation {
  _id: string;
  studentName: string;
  courseTitle: string;
  amount: number;
  status: string;
  createdAt: string;
}

export default function DonorDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DonationStats>({
    totalDonated: 0,
    studentsSupported: 0,
    coursesCompleted: 0,
    activeSponsorship: 0,
  });
  const [recentDonations, setRecentDonations] = useState<RecentDonation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user?.userType !== "donor") {
      router.push("/auth/signin");
      return;
    }
    fetchDashboardData();
  }, [session, status, router]);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, donationsRes] = await Promise.all([
        fetch("/api/donor/stats"),
        fetch("/api/donor/donations"),
      ]);
      if (statsRes.ok) setStats(await statsRes.json());
      if (donationsRes.ok) setRecentDonations(await donationsRes.json());
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-foreground-muted">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // --- Graph Data ---
  const lineData = {
    labels: recentDonations.slice(0, 7).map((d) =>
      new Date(d.createdAt).toLocaleDateString()
    ),
    datasets: [
      {
        label: "Donations Over Time",
        data: recentDonations.slice(0, 7).map((d) => d.amount),
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.2)",
        tension: 0.4,
        fill: true,
        pointRadius: 4,
      },
    ],
  };

  const doughnutData = {
    labels: ["Education", "Technology", "Scholarships", "Other"],
    datasets: [
      {
        data: [45, 25, 20, 10],
        backgroundColor: [
          "rgba(16, 185, 129, 0.7)",
          "rgba(52, 211, 153, 0.7)",
          "rgba(34, 197, 94, 0.7)",
          "rgba(134, 239, 172, 0.7)",
        ],
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-background to-background/90 dark:from-background dark:to-background">
      <div className="container mx-auto px-4 py-10">
        {/* Welcome Section */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-3">
            Welcome back, {session?.user?.name} 🌱
          </h1>
          <p className="text-lg text-foreground-muted max-w-2xl mx-auto">
            Thank you for empowering students through your generosity — your
            support fuels brighter futures.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <StatCard title="Total Donated" icon={DollarSign} color="emerald" value={`$${stats.totalDonated.toLocaleString()}`} />
          <StatCard title="Students Supported" icon={Users} color="green" value={stats.studentsSupported} />
          <StatCard title="Certifications Earned" icon={Award} color="yellow" value={stats.coursesCompleted} />
          <StatCard title="Active Sponsorships" icon={Gift} color="teal" value={stats.activeSponsorship} />
        </div>

        {/* Content with Graphs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Donations */}
          <Card className="border border-emerald-100 dark:border-border bg-card/60 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Gift className="h-5 w-5 text-emerald-600" />
                Recent Donations
              </CardTitle>
              <CardDescription>Your latest contributions to student funding</CardDescription>
            </CardHeader>
            <CardContent>
              {recentDonations.length === 0 ? (
                <div className="text-center py-10">
                  <Gift className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No donations yet
                  </h3>
                  <p className="text-foreground-muted mb-6">
                    Make your first donation to support a student’s journey
                  </p>
                  <Link href="/donor/donate">
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                      Make a Donation
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentDonations.slice(0, 5).map((donation) => (
                    <div
                      key={donation._id}
                      className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-emerald-50/40 to-transparent dark:from-card hover:shadow-sm"
                    >
                      <div>
                        <h4 className="font-semibold text-foreground">
                          {donation.studentName}
                        </h4>
                        <p className="text-sm text-foreground-muted">
                          {donation.courseTitle}
                        </p>
                        <p className="text-xs text-foreground-muted">
                          {new Date(donation.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-emerald-700">
                          ${donation.amount.toLocaleString()}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {donation.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Charts Section */}
          <div className="space-y-6">
            {/* Line Chart */}
            <Card className="border border-emerald-100 dark:border-border bg-card/60 hover:shadow-lg transition-all">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Heart className="h-5 w-5 text-emerald-600" />
                  Donation Trends
                </CardTitle>
                <CardDescription>Track your donations over time</CardDescription>
              </CardHeader>
              <CardContent>
                <Line data={lineData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
              </CardContent>
            </Card>

            {/* Doughnut Chart */}
            <Card className="border border-emerald-100 dark:border-border bg-card/60 hover:shadow-lg transition-all">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Users className="h-5 w-5 text-emerald-600" />
                  Sponsorship Breakdown
                </CardTitle>
                <CardDescription>How your donations are distributed</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <div className="w-64">
                  <Doughnut data={doughnutData} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// ✅ Reusable StatCard Component
function StatCard({ title, icon: Icon, color, value }: any) {
  const colorMap: Record<string, string> = {
    emerald: "from-emerald-50 text-emerald-700",
    green: "from-green-50 text-green-700",
    yellow: "from-yellow-50 text-yellow-700",
    teal: "from-teal-50 text-teal-700",
  };
  return (
    <Card className={`border border-${color}-100 bg-gradient-to-br ${colorMap[color]} hover:shadow-md`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className={`text-sm font-medium text-${color}-700`}>
          {title}
        </CardTitle>
        <Icon className={`h-5 w-5 text-${color}-600`} />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-foreground">{value}</div>
      </CardContent>
    </Card>
  );
}
