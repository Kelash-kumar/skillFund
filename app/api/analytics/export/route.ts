import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.userType !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const range = searchParams.get("range") || "30d"

    // Calculate date range
    const now = new Date()
    const daysBack = range === "7d" ? 7 : range === "30d" ? 30 : range === "90d" ? 90 : 365
    const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000)

    const db = await getDatabase()

    // Get detailed data for export
    const donations = await db
      .collection("payments")
      .aggregate([
        { $match: { createdAt: { $gte: startDate }, status: "completed" } },
        {
          $lookup: {
            from: "users",
            localField: "donorId",
            foreignField: "_id",
            as: "donor",
          },
        },
        {
          $project: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            amount: 1,
            donorName: { $arrayElemAt: ["$donor.name", 0] },
            donorEmail: { $arrayElemAt: ["$donor.email", 0] },
            paymentMethod: 1,
            message: 1,
          },
        },
        { $sort: { createdAt: -1 } },
      ])
      .toArray()

    // Convert to CSV
    const csvHeaders = ["Date", "Amount", "Donor Name", "Donor Email", "Payment Method", "Message"]
    const csvRows = donations.map((donation) => [
      donation.date,
      donation.amount,
      donation.donorName || "Anonymous",
      donation.donorEmail || "",
      donation.paymentMethod || "",
      donation.message || "",
    ])

    const csvContent = [csvHeaders.join(","), ...csvRows.map((row) => row.map((field) => `"${field}"`).join(","))].join(
      "\n",
    )

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="SkillFund-analytics-${range}.csv"`,
      },
    })
  } catch (error) {
    console.error("Analytics export error:", error)
    return NextResponse.json({ error: "Failed to export analytics" }, { status: 500 })
  }
}
