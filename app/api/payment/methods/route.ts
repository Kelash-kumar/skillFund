import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

// GET: List saved masked payment methods for the current donor
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

    const db = await getDatabase()
    const methods = await db
      .collection("paymentMethods")
      .find({ donorId: new ObjectId(session.user.id) })
      .sort({ createdAt: -1 })
      .toArray()

    const normalized = methods.map((m: any) => ({
      _id: m._id.toString(),
      label: m.label,
      type: m.type,
      brand: m.brand,
      last4: m.last4,
      exp: m.exp,
      bankName: m.bankName || null,
      accountLast4: m.accountLast4 || null,
      createdAt: m.createdAt,
    }))

    return NextResponse.json(normalized)
  } catch (error) {
    console.error("Error listing payment methods:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

// POST: Save a dummy payment method (masked). Never store full card/bank details.
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

    const {
      type = "card",
      cardNumber = "",
      nameOnCard = "",
      exp = "",
      cvc = "",
      bankName = "",
      bankAccountNumber = "",
      routingNumber = "",
    } = await request.json()

    // Mask and reduce inputs
    const digits = (cardNumber || "").replace(/\D/g, "")
    const last4 = digits.slice(-4) || "0000"
    const brand = digits.startsWith("4") ? "Visa" : digits.startsWith("5") ? "Mastercard" : "Card"

    // Normalize expiry
    const expNormalized = exp.trim()

    const accountDigits = (bankAccountNumber || "").replace(/\D/g, "")
    const accountLast4 = accountDigits.slice(-4) || undefined

    const labelParts = [brand, "****", last4]
    if (expNormalized) labelParts.push(`(${expNormalized})`)
    const label = labelParts.join(" ")

    const doc: any = {
      donorId: new ObjectId(session.user.id),
      type,
      brand,
      last4,
      exp: expNormalized,
      nameOnCard,
      bankName: bankName || undefined,
      accountLast4,
      label,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Never store full sensitive data
    // cvc, routingNumber, full card/account numbers are intentionally discarded

    const db = await getDatabase()
    const result = await db.collection("paymentMethods").insertOne(doc)

    return NextResponse.json({ _id: result.insertedId.toString(), label, brand, last4, exp: expNormalized })
  } catch (error) {
    console.error("Error saving payment method:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
