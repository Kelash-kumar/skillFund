"use client"

import { useEffect, useMemo, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Navigation } from "@/components/navigation"
import {
  DollarSign,
  Users,
  FileText,
  Filter,
  RefreshCcw,
} from "lucide-react"

interface BankStats {
  totalAmount: number
  totalTransactions: number
  donorsCount: number
  topDonors: {
    donorId: string
    total: number
    count: number
    donor?: { name?: string; email?: string }
  }[]
  last7Days: any[]
}

interface BankTransaction {
  _id: string
  donorId: string
  amount: number
  source: string
  donationId?: string | null
  paymentId?: string | null
  applicationId?: string | null
  studentId?: string | null
  status?: string
  paymentMethod?: string
  message?: string
  createdAt: string
  updatedAt: string
  donor?: { _id?: string; name?: string; email?: string }
}

export default function DonationBankAdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<BankStats | null>(null)
  const [transactions, setTransactions] = useState<BankTransaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterDonor, setFilterDonor] = useState("")
  const [limit, setLimit] = useState(100)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    if (status === "loading") return
    if (!session || session.user?.userType !== "admin") {
      router.push("/auth/signin")
      return
    }
    fetchAll()
  }, [session, status, router])

  const isValidObjectId = (v: string) => /^[a-fA-F0-9]{24}$/.test(v)

  const fetchAll = async () => {
    setIsLoading(true)
    try {
      const donorParam =
        filterDonor && isValidObjectId(filterDonor.trim())
          ? `donorId=${encodeURIComponent(filterDonor.trim())}`
          : filterDonor.trim()
          ? `donorQuery=${encodeURIComponent(filterDonor.trim())}`
          : ""

      const query = `limit=${limit}${donorParam ? `&${donorParam}` : ""}`

      const [statsRes, listRes] = await Promise.all([
        fetch("/api/admin/donation-bank/stats", { credentials: "include" }),
        fetch(`/api/admin/donation-bank?${query}`, { credentials: "include" }),
      ])
      if (statsRes.ok) {
        setStats(await statsRes.json())
      } else {
        setStats({
          totalAmount: 0,
          totalTransactions: 0,
          donorsCount: 0,
          topDonors: [],
          last7Days: [],
        })
      }
      if (listRes.ok) {
        setTransactions(await listRes.json())
      } else {
        setTransactions([])
      }
    } finally {
      setIsLoading(false)
    }
  }

  const totalAmountFormatted = useMemo(
    () => (stats ? `$${stats.totalAmount.toLocaleString()}` : "$0"),
    [stats],
  )

  const handleUpdateStatus = async (id: string, status: string) => {
    setUpdatingId(id)
    try {
      await fetch("/api/admin/donation-bank", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId: id, status }),
      })
      await fetchAll()
    } finally {
      setUpdatingId(null)
    }
  }

  if (status === "loading" || isLoading || !stats) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center text-foreground-muted animate-pulse">
          Loading Donation Bank...
        </div>
      </div>
    )
  }

  return (
    <>
      <Navigation />
      <div className="lg:pl-64 bg-muted/10 min-h-screen">
        <div className="container mx-auto px-4 py-10">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-1">
                Donation Bank
              </h1>
              <p className="text-foreground-muted">
                Manage and review all donation transactions
              </p>
            </div>
            <Button
              variant="outline"
              onClick={fetchAll}
              className="mt-4 sm:mt-0"
            >
              <RefreshCcw className="h-4 w-4 mr-2" /> Refresh
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 shadow-sm hover:shadow-md transition-all">
              <CardHeader className="flex flex-row justify-between items-center pb-2">
                <CardTitle className="text-sm font-medium text-foreground-muted">
                  Total Collected
                </CardTitle>
                <DollarSign className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">
                  {totalAmountFormatted}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20 shadow-sm hover:shadow-md transition-all">
              <CardHeader className="flex flex-row justify-between items-center pb-2">
                <CardTitle className="text-sm font-medium text-foreground-muted">
                  Total Transactions
                </CardTitle>
                <FileText className="h-5 w-5 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">
                  {stats.totalTransactions.toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20 shadow-sm hover:shadow-md transition-all">
              <CardHeader className="flex flex-row justify-between items-center pb-2">
                <CardTitle className="text-sm font-medium text-foreground-muted">
                  Donors
                </CardTitle>
                <Users className="h-5 w-5 text-secondary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">
                  {stats.donorsCount.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="border-border bg-card/50 backdrop-blur-sm mb-10 shadow-sm hover:shadow-md transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Filter className="h-4 w-4" /> Filters
              </CardTitle>
              <CardDescription className="text-foreground-muted">
                Search donors and adjust record limits
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row gap-4">
              <Input
                placeholder="Donor ID / name / email"
                value={filterDonor}
                onChange={(e) => setFilterDonor(e.target.value)}
                className="md:max-w-sm"
              />
              <Select
                value={String(limit)}
                onValueChange={(v) => setLimit(Number(v))}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Limit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="250">250</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={fetchAll} className="md:w-auto w-full">
                Apply
              </Button>
            </CardContent>
          </Card>

          {/* Top Donors */}
          <Card className="border-border bg-card mb-10 shadow-sm hover:shadow-md transition-all">
            <CardHeader>
              <CardTitle className="text-foreground">Top Donors</CardTitle>
              <CardDescription className="text-foreground-muted">
                Highest contributors by total donations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats.topDonors.length === 0 ? (
                <div className="text-foreground-muted text-sm">
                  No donations yet
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.topDonors.map((d) => (
                    <div
                      key={d.donorId}
                      className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/30 transition-colors"
                    >
                      <div>
                        <div className="font-medium text-foreground">
                          {d.donor?.name || d.donor?.email || d.donorId}
                        </div>
                        <div className="text-xs text-foreground-muted">
                          {d.count} transactions
                        </div>
                      </div>
                      <div className="font-semibold text-primary">
                        ${d.total.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Transactions */}
          <Card className="border-border bg-card shadow-sm hover:shadow-md transition-all">
            <CardHeader>
              <CardTitle className="text-foreground">
                All Transactions
              </CardTitle>
              <CardDescription className="text-foreground-muted">
                Review and update donation records
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-foreground-muted text-sm">
                  No transactions found.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="text-left text-foreground-muted border-b">
                        <th className="py-2 pr-4">Date</th>
                        <th className="py-2 pr-4">Donor</th>
                        <th className="py-2 pr-4">Amount</th>
                        <th className="py-2 pr-4">Source</th>
                        <th className="py-2 pr-4">Status</th>
                        <th className="py-2 pr-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((t) => (
                        <tr
                          key={t._id}
                          className="border-b last:border-b-0 hover:bg-muted/20 transition-colors"
                        >
                          <td className="py-3 pr-4 text-foreground-muted">
                            {new Date(t.createdAt).toLocaleString()}
                          </td>
                          <td className="py-3 pr-4">
                            <div className="font-medium text-foreground">
                              {t.donor?.name ||
                                t.donor?.email ||
                                t.donorId}
                            </div>
                            <div className="text-xs text-foreground-muted">
                              {t.donor?.email}
                            </div>
                          </td>
                          <td className="py-3 pr-4 font-semibold text-primary">
                            ${t.amount.toLocaleString()}
                          </td>
                          <td className="py-3 pr-4">
                            <Badge variant="secondary">{t.source}</Badge>
                          </td>
                          <td className="py-3 pr-4">
                            <Badge
                              variant={
                                t.status === "completed"
                                  ? "default"
                                  : t.status === "refunded"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {t.status || "completed"}
                            </Badge>
                          </td>
                          <td className="py-3 pr-4">
                            <Select
                              onValueChange={(v) =>
                                handleUpdateStatus(t._id, v)
                              }
                            >
                              <SelectTrigger className="w-36">
                                <SelectValue
                                  placeholder={
                                    updatingId === t._id
                                      ? "Updating..."
                                      : "Change status"
                                  }
                                />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="completed">
                                  Completed
                                </SelectItem>
                                <SelectItem value="flagged">
                                  Flagged
                                </SelectItem>
                                <SelectItem value="refunded">
                                  Refunded
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
