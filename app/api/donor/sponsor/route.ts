import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.userType !== "donor") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { applicationId, amount } = await request.json()

    if (!applicationId || !amount || amount <= 0) {
      return NextResponse.json({ message: "Invalid application ID or amount" }, { status: 400 })
    }

    const db = await getDatabase()

    // Verify application exists and is approved
    const application = await db.collection("courseRequests").findOne({
      _id: new ObjectId(applicationId),
      status: "approved",
    })

    if (!application) {
      return NextResponse.json({ message: "Application not found or not approved" }, { status: 404 })
    }

    // Calculate current funded amount
    const existingDonations = await db
      .collection("donations")
      .aggregate([
        {
          $match: {
            applicationId: new ObjectId(applicationId),
            status: "completed",
          },
        },
        {
          $group: {
            _id: null,
            totalFunded: { $sum: "$amount" },
          },
        },
      ])
      .toArray()

    const currentFunded = existingDonations.length > 0 ? existingDonations[0].totalFunded : 0
    const remainingAmount = application.amount - currentFunded

    if (amount > remainingAmount) {
      return NextResponse.json({ message: "Donation amount exceeds remaining funding needed" }, { status: 400 })
    }

    // Create donation record
    const donation = {
      donorId: new ObjectId(session.user.id),
      applicationId: new ObjectId(applicationId),
      amount: Number(amount),
      type: "one-time",
      status: "completed", // In a real app, this would be "pending" until payment is processed
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("donations").insertOne(donation)

    // Check if application is now fully funded
    const newTotalFunded = currentFunded + amount
    if (newTotalFunded >= application.amount) {
      await db.collection("courseRequests").updateOne(
        { _id: new ObjectId(applicationId) },
        {
          $set: {
            status: "funded",
            fundedAmount: newTotalFunded,
            updatedAt: new Date(),
          },
        },
      )
    }

    return NextResponse.json({ message: "Sponsorship successful", donationId: result.insertedId }, { status: 201 })
  } catch (error) {
    console.error("Error processing sponsorship:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
