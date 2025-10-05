import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.userType !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid application ID" }, { status: 400 })
    }

    const db = await getDatabase()

    // Get single application with unified support for all request types
    const applications = await db
      .collection("courseRequests")
      .aggregate([
        {
          $match: { _id: new ObjectId(id) }
        },
        {
          $lookup: {
            from: "users",
            localField: "studentId",
            foreignField: "_id",
            as: "student",
          },
        },
        {
          $unwind: {
            path: "$student",
            preserveNullAndEmptyArrays: true,
          },
        },
        // Only lookup courses for available-course type
        {
          $lookup: {
            from: "courses",
            localField: "courseId",
            foreignField: "_id",
            as: "courseDetails",
          },
        },
        {
          $addFields: {
            // Get course information based on request type
            courseTitle: {
              $switch: {
                branches: [
                  {
                    case: { $eq: ["$requestType", "available-course"] },
                    then: { $arrayElemAt: ["$courseDetails.title", 0] }
                  },
                  {
                    case: { $eq: ["$requestType", "new-course"] },
                    then: "$title"
                  },
                  {
                    case: { $eq: ["$requestType", "certification"] },
                    then: "$certificationType"
                  }
                ],
                default: { $ifNull: ["$title", "$courseName"] }
              }
            },
            courseProvider: {
              $switch: {
                branches: [
                  {
                    case: { $eq: ["$requestType", "available-course"] },
                    then: { $arrayElemAt: ["$courseDetails.provider", 0] }
                  },
                  {
                    case: { $in: ["$requestType", ["new-course", "certification"]] },
                    then: "$provider"
                  }
                ],
                default: "$provider"
              }
            },
            courseCategory: {
              $switch: {
                branches: [
                  {
                    case: { $eq: ["$requestType", "available-course"] },
                    then: { $arrayElemAt: ["$courseDetails.category", 0] }
                  },
                  {
                    case: { $in: ["$requestType", ["new-course", "certification"]] },
                    then: "$category"
                  }
                ],
                default: "$category"
              }
            },
            displayCost: {
              $switch: {
                branches: [
                  {
                    case: { $eq: ["$requestType", "available-course"] },
                    then: { $arrayElemAt: ["$courseDetails.cost", 0] }
                  },
                  {
                    case: { $in: ["$requestType", ["new-course", "certification"]] },
                    then: "$estimatedFee"
                  }
                ],
                default: { $ifNull: ["$estimatedCost", "$amount"] }
              }
            }
          }
        },
        {
          $project: {
            _id: 1,
            studentId: 1,
            courseId: 1,
            requestType: 1,
            
            // Student information
            studentName: { $ifNull: ["$student.name", "$studentName"] },
            studentEmail: { $ifNull: ["$student.email", "$studentEmail"] },
            
            // Course information (unified across all types)
            courseTitle: 1,
            courseProvider: 1,
            courseCategory: 1,
            
            // Financial information
            amount: "$displayCost",
            estimatedCost: "$displayCost",
            
            // Application details
            reason: { $ifNull: ["$description", "$reason"] },
            description: 1,
            careerGoals: 1,
            timeline: 1,
            additionalInfo: 1,
            urgency: 1,
            
            // Type-specific fields
            title: 1,
            certificationType: 1,
            provider: 1,
            category: 1,
            duration: 1,
            courseUrl: "$url",
            justification: 1,
            careerRelevance: 1,
            
            // Documents and status
            documents: { $ifNull: ["$documents", {}] },
            status: 1,
            submissionDate: 1,
            createdAt: 1,
            updatedAt: 1,
            reviewNote: 1,
            approvedBy: 1,
          },
        },
      ])
      .toArray()

    if (applications.length === 0) {
      return NextResponse.json({ message: "Application not found" }, { status: 404 })
    }

    return NextResponse.json(applications[0])
  } catch (error) {
    console.error("Error fetching application details:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}