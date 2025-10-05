import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

// GET: List DonationBank transactions with donor info. Optional filtering via query params.
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.userType !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const donorId = searchParams.get("donorId")
    const limit = Number(searchParams.get("limit") || 100)

    const db = await getDatabase()

    const match: any = {}
    if (donorId) {
      match.donorId = new ObjectId(donorId)
    }

    const transactions = await db
      .collection("donationBank")
      .aggregate([
        { $match: match },
        { $sort: { createdAt: -1 } },
        { $limit: limit },
        {
          $lookup: {
            from: "users",
            localField: "donorId",
            foreignField: "_id",
            as: "donor",
          },
        },
        { $unwind: { path: "$donor", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 1,
            donorId: 1,
            amount: 1,
            source: 1,
            donationId: 1,
            paymentId: 1,
            applicationId: 1,
            studentId: 1,
            status: 1,
            paymentMethod: 1,
            message: 1,
            createdAt: 1,
            updatedAt: 1,
            donor: {
              _id: "$donor._id",
              name: "$donor.name",
              email: "$donor.email",
            },
          },
        },
      ])
      .toArray()

    // Normalize _id to string for client
    const normalized = transactions.map((t: any) => ({
      ...t,
      _id: t._id.toString(),
      donorId: t.donorId?.toString?.() || t.donorId,
      donationId: t.donationId?.toString?.() || t.donationId || null,
      paymentId: t.paymentId?.toString?.() || t.paymentId || null,
      applicationId: t.applicationId?.toString?.() || t.applicationId || null,
      studentId: t.studentId?.toString?.() || t.studentId || null,
    }))

    return NextResponse.json(normalized)
  } catch (error) {
    console.error("Error fetching DonationBank transactions:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

// PATCH: Update a DonationBank transaction (e.g., status or admin note)
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.userType !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { transactionId, status, note } = await request.json()

    if (!transactionId) {
      return NextResponse.json({ message: "transactionId is required" }, { status: 400 })
    }

    const db = await getDatabase()

    const update: any = { updatedAt: new Date() }
    if (status) update.status = status
    if (note) update.adminNote = note

    const result = await db.collection("donationBank").updateOne(
      { _id: new ObjectId(transactionId) },
      { $set: update },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: "Transaction not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Transaction updated" })
  } catch (error) {
    console.error("Error updating DonationBank transaction:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
