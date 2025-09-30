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

    // Get total users
    const totalUsers = await db.collection("users").countDocuments()
    const previousPeriodUsers = await db.collection("users").countDocuments({
      createdAt: { $lt: startDate },
    })
    const userGrowth =
      previousPeriodUsers > 0 ? Math.round(((totalUsers - previousPeriodUsers) / previousPeriodUsers) * 100) : 100

    // Get donation statistics
    const donations = await db
      .collection("payments")
      .aggregate([
        { $match: { createdAt: { $gte: startDate }, status: "completed" } },
        { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
      ])
      .toArray()

    const totalDonations = donations[0]?.total || 0
    const donationCount = donations[0]?.count || 0

    // Get previous period donations for growth calculation
    const previousPeriodEnd = new Date(startDate.getTime() - daysBack * 24 * 60 * 60 * 1000)
    const previousDonations = await db
      .collection("payments")
      .aggregate([
        {
          $match: {
            createdAt: { $gte: previousPeriodEnd, $lt: startDate },
            status: "completed",
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ])
      .toArray()

    const previousTotalDonations = previousDonations[0]?.total || 0
    const donationGrowth =
      previousTotalDonations > 0
        ? Math.round(((totalDonations - previousTotalDonations) / previousTotalDonations) * 100)
        : 100

    // Get application statistics
    const activeApplications = await db.collection("applications").countDocuments({
      status: { $in: ["pending", "under_review"] },
    })

    const totalApplications = await db.collection("applications").countDocuments({
      createdAt: { $gte: startDate },
    })

    const approvedApplications = await db.collection("applications").countDocuments({
      createdAt: { $gte: startDate },
      status: "approved",
    })

    const successRate = totalApplications > 0 ? Math.round((approvedApplications / totalApplications) * 100) : 0

    // Get donation trends (daily data)
    const donationTrends = await db
      .collection("payments")
      .aggregate([
        { $match: { createdAt: { $gte: startDate }, status: "completed" } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            amount: { $sum: "$amount" },
          },
        },
        { $sort: { _id: 1 } },
        { $project: { date: "$_id", amount: 1, _id: 0 } },
      ])
      .toArray()

    // Get user registration trends
    const userRegistrations = await db
      .collection("users")
      .aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        { $project: { date: "$_id", count: 1, _id: 0 } },
      ])
      .toArray()

    // Get user types distribution
    const userTypes = await db
      .collection("users")
      .aggregate([
        {
          $group: {
            _id: "$userType",
            value: { $sum: 1 },
          },
        },
        { $project: { name: "$_id", value: 1, _id: 0 } },
      ])
      .toArray()

    // Get course categories
    const courseCategories = await db
      .collection("courses")
      .aggregate([
        {
          $group: {
            _id: "$category",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
        { $project: { category: "$_id", count: 1, _id: 0 } },
      ])
      .toArray()

    // Get top donors
    const topDonors = await db
      .collection("payments")
      .aggregate([
        { $match: { createdAt: { $gte: startDate }, status: "completed" } },
        {
          $group: {
            _id: "$donorId",
            totalAmount: { $sum: "$amount" },
            donations: { $sum: 1 },
          },
        },
        { $sort: { totalAmount: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "donor",
          },
        },
        {
          $project: {
            id: "$_id",
            name: { $arrayElemAt: ["$donor.name", 0] },
            totalAmount: 1,
            donations: 1,
            _id: 0,
          },
        },
      ])
      .toArray()

    // Get recent activity
    const recentActivity = await db
      .collection("payments")
      .aggregate([
        { $match: { createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
        { $sort: { createdAt: -1 } },
        { $limit: 10 },
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
            description: {
              $concat: [{ $arrayElemAt: ["$donor.name", 0] }, " donated $", { $toString: "$amount" }],
            },
            timestamp: {
              $dateToString: {
                format: "%Y-%m-%d %H:%M",
                date: "$createdAt",
              },
            },
          },
        },
      ])
      .toArray()

    return NextResponse.json({
      totalUsers,
      userGrowth,
      totalDonations: Math.round(totalDonations),
      donationGrowth,
      activeApplications,
      successRate,
      applicationGrowth: 0, // Calculate if needed
      donationTrends,
      userRegistrations,
      userTypes,
      courseCategories,
      topDonors,
      recentActivity,
    })
  } catch (error) {
    console.error("Analytics fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
