import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.userType !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()

    // Overall totals (coerce amount to number; ignore invalid values)
    const [totals] = await db
      .collection("donationBank")
      .aggregate([
        {
          $group: {
            _id: null,
            totalAmount: { $sum: { $convert: { input: "$amount", to: "double", onError: 0, onNull: 0 } } },
            totalTransactions: { $sum: 1 },
          },
        },
      ])
      .toArray()

    // Distinct donor count (exclude null/undefined)
    const donorsCountAgg = await db
      .collection("donationBank")
      .aggregate([
        { $match: { donorId: { $type: "objectId" } } },
        { $group: { _id: "$donorId" } },
        { $count: "count" },
      ])
      .toArray()
    const donorsCount = donorsCountAgg[0]?.count || 0

    // Top donors by amount (exclude null donorId; coerce amount)
    const topDonors = await db
      .collection("donationBank")
      .aggregate([
        { $match: { donorId: { $type: "objectId" } } },
        {
          $group: {
            _id: "$donorId",
            total: { $sum: { $convert: { input: "$amount", to: "double", onError: 0, onNull: 0 } } },
            count: { $sum: 1 },
          },
        },
        { $sort: { total: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "donor",
          },
        },
        { $unwind: { path: "$donor", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            donorId: "$_id",
            _id: 0,
            total: 1,
            count: 1,
            donor: { name: "$donor.name", email: "$donor.email" },
          },
        },
      ])
      .toArray()

    // Last 7 days totals by day (coerce amount)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const last7Days = await db
      .collection("donationBank")
      .aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo } } },
        {
          $group: {
            _id: {
              y: { $year: "$createdAt" },
              m: { $month: "$createdAt" },
              d: { $dayOfMonth: "$createdAt" },
            },
            total: { $sum: { $convert: { input: "$amount", to: "double", onError: 0, onNull: 0 } } },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.y": 1, "_id.m": 1, "_id.d": 1 } },
      ])
      .toArray()

    return NextResponse.json({
      totalAmount: totals?.totalAmount ?? 0,
      totalTransactions: totals?.totalTransactions ?? 0,
      donorsCount,
      topDonors: topDonors.map((d: any) => ({
        donorId: d.donorId?.toString?.() || d.donorId,
        total: d.total,
        count: d.count,
        donor: d.donor,
      })),
      last7Days,
    })
  } catch (error) {
    console.error("Error fetching DonationBank stats:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
