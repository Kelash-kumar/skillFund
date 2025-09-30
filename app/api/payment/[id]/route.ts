import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()
    const payment = await db.collection("payments").findOne({
      _id: new ObjectId(params.id),
      donorId: new ObjectId(session.user.id),
    })

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    return NextResponse.json({
      id: payment._id.toString(),
      amount: payment.amount,
      status: payment.status,
      createdAt: payment.createdAt,
      message: payment.message,
    })
  } catch (error) {
    console.error("Payment fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch payment details" }, { status: 500 })
  }
}
