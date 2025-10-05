import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

// Simple test endpoint without authentication to debug
export async function GET() {
  try {
    console.log("🔍 Testing database connection...")
    const db = await getDatabase()
    
    // Get all applications with the new unified structure
    const applications = await db
      .collection("applications")
      .aggregate([
        { $match: {} },
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
            displayTitle: {
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
                default: "Unknown Course"
              }
            },
            displayProvider: {
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
                default: "Unknown Provider"
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
                default: 0
              }
            },
            documentCount: { $size: { $objectToArray: { $ifNull: ["$documents", {}] } } },
            documentNames: { 
              $map: {
                input: { $objectToArray: { $ifNull: ["$documents", {}] } },
                as: "doc",
                in: "$$doc.k"
              }
            }
          }
        },
        {
          $project: {
            _id: 1,
            studentId: 1,
            studentName: 1,
            studentEmail: 1,
            requestType: 1,
            courseId: 1,
            courseTitle: "$displayTitle",
            courseProvider: "$displayProvider", 
            estimatedCost: "$displayCost",
            reason: 1,
            description: 1,
            careerGoals: 1,
            previousExperience: 1,
            expectedOutcome: 1,
            urgency: 1,
            status: 1,
            isApproved: 1,
            title: 1,
            certificationType: 1,
            provider: 1,
            category: 1,
            duration: 1,
            courseUrl: 1,
            documents: 1,
            documentCount: 1,
            documentNames: 1,
            createdAt: 1,
            updatedAt: 1,
          },
        },
        { $sort: { createdAt: -1 } },
      ])
      .toArray()

    console.log(`✅ Found ${applications.length} applications`)
    
    return NextResponse.json({
      success: true,
      count: applications.length,
      applications: applications
    })
    
  } catch (error) {
    console.error("❌ Test API error:", error)
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: String(error)
    }, { status: 500 })
  }
}