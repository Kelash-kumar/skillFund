"use client"

import { useEffect, useMemo, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Navigation } from "@/components/navigation"
import { DollarSign, Users, FileText, Filter, RefreshCcw } from "lucide-react"

interface BankStats {
  totalAmount: number
  totalTransactions: number
  donorsCount: number
  topDonors: { donorId: string; total: number; count: number; donor?: { name?: string; email?: string } }[]
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, status, router])

  const fetchAll = async () => {
    setIsLoading(true)
    try {
      const [statsRes, listRes] = await Promise.all([
        fetch("/api/admin/donation-bank/stats"),
        fetch(`/api/admin/donation-bank?limit=${limit}${filterDonor ? `&donorId=${filterDonor}` : ""}`),
      ])
      if (statsRes.ok) setStats(await statsRes.json())
      if (listRes.ok) setTransactions(await listRes.json())
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
        <div className="text-center text-foreground-muted">Loading Donation Bank...</div>
      </div>
    )
  }

  return (
    <>
      <Navigation />
      <div className="lg:pl-64">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Donation Bank</h1>
              <p className="text-foreground-muted">View and manage all donation records across the platform</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={fetchAll}>
                <RefreshCcw className="h-4 w-4 mr-2" /> Refresh
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="border-border bg-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-foreground-muted">Total Collected</CardTitle>
                <DollarSign className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{totalAmountFormatted}</div>
              </CardContent>
            </Card>
            <Card className="border-border bg-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-foreground-muted">Transactions</CardTitle>
                <FileText className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stats.totalTransactions.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card className="border-border bg-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-foreground-muted">Donors</CardTitle>
                <Users className="h-4 w-4 text-secondary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stats.donorsCount.toLocaleString()}</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="border-border bg-card mb-8">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Filter className="h-4 w-4" /> Filters
              </CardTitle>
              <CardDescription className="text-foreground-muted">Filter transactions by donor</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row gap-4">
              <Input
                placeholder="Filter by Donor ID"
                value={filterDonor}
                onChange={(e) => setFilterDonor(e.target.value)}
                className="md:max-w-sm"
              />
              <Select value={String(limit)} onValueChange={(v) => setLimit(Number(v))}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Limit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="250">250</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={fetchAll}>Apply</Button>
            </CardContent>
          </Card>

          {/* Top donors */}
          <Card className="border-border bg-card mb-8">
            <CardHeader>
              <CardTitle className="text-foreground">Top Donors</CardTitle>
              <CardDescription className="text-foreground-muted">Highest contributors by amount</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.topDonors.length === 0 ? (
                <div className="text-foreground-muted">No donations yet</div>
              ) : (
                <div className="space-y-2">
                  {stats.topDonors.map((d) => (
                    <div key={d.donorId} className="flex items-center justify-between p-3 border rounded-md">
                      <div>
                        <div className="font-medium text-foreground">{d.donor?.name || d.donor?.email || d.donorId}</div>
                        <div className="text-xs text-foreground-muted">{d.count} transactions</div>
                      </div>
                      <div className="font-semibold text-primary">${d.total.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Transactions table */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">All Transactions</CardTitle>
              <CardDescription className="text-foreground-muted">Manage individual donation records</CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-foreground-muted">No transactions found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
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
                        <tr key={t._id} className="border-b last:border-b-0">
                          <td className="py-3 pr-4 text-foreground-muted">
                            {new Date(t.createdAt).toLocaleString()}
                          </td>
                          <td className="py-3 pr-4">
                            <div className="font-medium text-foreground">{t.donor?.name || t.donor?.email || t.donorId}</div>
                            <div className="text-xs text-foreground-muted">{t.donor?.email}</div>
                          </td>
                          <td className="py-3 pr-4 font-semibold text-primary">${t.amount.toLocaleString()}</td>
                          <td className="py-3 pr-4"><Badge variant="secondary">{t.source}</Badge></td>
                          <td className="py-3 pr-4">
                            <Badge variant={t.status === "completed" ? "default" : t.status === "refunded" ? "destructive" : "secondary"}>
                              {t.status || "completed"}
                            </Badge>
                          </td>
                          <td className="py-3 pr-4">
                            <Select onValueChange={(v) => handleUpdateStatus(t._id, v)}>
                              <SelectTrigger className="w-36">
                                <SelectValue placeholder={updatingId === t._id ? "Updating..." : "Change status"} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="flagged">Flagged</SelectItem>
                                <SelectItem value="refunded">Refunded</SelectItem>
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
