import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.userType !== "donor") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()
    const donorId = new ObjectId(session.user.id)

    // Get donation statistics
    const [totalDonatedResult, studentsSupported, coursesCompleted, activeSponsorship] = await Promise.all([
      db
        .collection("donations")
        .aggregate([
          { $match: { donorId, status: "completed" } },
          { $group: { _id: null, totalDonated: { $sum: "$amount" } } },
        ])
        .toArray(),
      db.collection("donations").distinct("applicationId", { donorId, status: "completed" }),
      db
        .collection("applications")
        .aggregate([
          {
            $lookup: {
              from: "donations",
              localField: "_id",
              foreignField: "applicationId",
              as: "donations",
            },
          },
          {
            $match: {
              "donations.donorId": donorId,
              "donations.status": "completed",
              status: "funded",
            },
          },
        ])
        .toArray(),
      db.collection("donations").distinct("applicationId", { donorId, status: { $in: ["pending", "completed"] } }),
    ])

    const totalDonated = totalDonatedResult.length > 0 ? totalDonatedResult[0].totalDonated : 0

    return NextResponse.json({
      totalDonated,
      studentsSupported: studentsSupported.length,
      coursesCompleted: coursesCompleted.length,
      activeSponsorship: activeSponsorship.length,
    })
  } catch (error) {
    console.error("Error fetching donor stats:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
