import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.userType !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()

    // Return all courses (optionally only approved ones can be filtered on client)
    const courses = await db
      .collection("courses")
      .find({})
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json(courses)
  } catch (error) {
    console.error("Error fetching admin courses:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}