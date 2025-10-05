import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.userType !== "student") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()

    // Get fund applications for the current student
    const fundApplications = await db
      .collection("applications")
      .aggregate([
        {
          $match: { studentId: new ObjectId(session.user.id) },
        },
        {
          $lookup: {
            from: "courses",
            localField: "courseId",
            foreignField: "_id",
            as: "course",
          },
        },
        {
          $unwind: "$course",
        },
        {
          $project: {
            _id: 1,
            type: { $literal: "fund" },
            courseTitle: "$course.title",
            courseProvider: "$course.provider",
            courseUrl: "$course.url",
            amount: 1,
            reason: 1,
            careerGoals: 1,
            timeline: 1,
            additionalInfo: 1,
            status: 1,
            createdAt: 1,
            updatedAt: 1,
            fundedAmount: 1,
            approvedBy: 1,
          },
        },
      ])
      .toArray()

    // Get course requests for the current student
    const courseRequests = await db
      .collection("courseRequests")
      .find({ studentId: new ObjectId(session.user.id) })
      .project({
        _id: 1,
        type: { $literal: "course" },
        requestType: 1,
        courseId: 1,
        title: 1,
        provider: 1,
        description: 1,
        category: 1,
        estimatedFee: 1,
        courseUrl: 1,
        duration: 1,
        certificationType: 1,
        reason: 1,
        careerGoals: 1,
        previousExperience: 1,
        expectedOutcome: 1,
        urgency: 1,
        status: 1,
        createdAt: 1,
        updatedAt: 1,
        documents: 1,
      })
      .sort({ createdAt: -1 })
      .toArray()

    // Combine both types of applications
    const allApplications = [
      ...fundApplications.map(app => ({ ...app, type: "fund" })),
      ...courseRequests.map(req => ({ ...req, type: "course" }))
    ].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json(allApplications)
  } catch (error) {
    console.error("Error fetching detailed applications:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
