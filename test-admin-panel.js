const { MongoClient, ObjectId } = require('mongodb');

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function testAdminPanel() {
  try {
    await client.connect();
    const db = client.db("skillfund");
    
    console.log("🔧 Testing Admin Panel with Enhanced Applications");
    console.log("==============================================");
    
    // Check current applications structure
    const applications = await db.collection("applications").find({}).limit(3).toArray();
    const courseRequests = await db.collection("courseRequests").find({}).limit(3).toArray();
    
    console.log("\n📊 Current Data Structure:");
    console.log(`Applications: ${applications.length} found`);
    console.log(`Course Requests: ${courseRequests.length} found`);
    
    if (applications.length > 0) {
      console.log("\n📝 Sample Application Fields:");
      const sampleApp = applications[0];
      console.log(`- Has estimatedCost: ${!!sampleApp.estimatedCost}`);
      console.log(`- Has amount: ${!!sampleApp.amount}`);
      console.log(`- Has description: ${!!sampleApp.description}`);
      console.log(`- Has reason: ${!!sampleApp.reason}`);
      console.log(`- Has urgency: ${!!sampleApp.urgency}`);
      console.log(`- Has documents: ${!!sampleApp.documents} (${sampleApp.documents ? Object.keys(sampleApp.documents).length : 0} files)`);
      console.log(`- Status: ${sampleApp.status}`);
    }
    
    if (courseRequests.length > 0) {
      console.log("\n📋 Sample Course Request Fields:");
      const sampleCR = courseRequests[0];
      console.log(`- Has title: ${!!sampleCR.title}`);
      console.log(`- Has courseName: ${!!sampleCR.courseName}`);
      console.log(`- Has cost: ${!!sampleCR.cost}`);
      console.log(`- Has price: ${!!sampleCR.price}`);
      console.log(`- Has documents: ${!!sampleCR.documents} (${sampleCR.documents ? Object.keys(sampleCR.documents).length : 0} files)`);
      console.log(`- Status: ${sampleCR.status}`);
    }
    
    // Test the admin API call simulation
    console.log("\n🔌 Testing Admin API Compatibility:");
    
    // Simulate what the admin applications API returns
    const adminApplications = await db
      .collection("applications")
      .aggregate([
        {
          $lookup: {
            from: "users",
            localField: "studentId",
            foreignField: "_id",
            as: "student",
          },
        },
        {
          $unwind: "$student",
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
            studentId: 1,
            courseId: 1,
            studentName: "$student.name",
            studentEmail: "$student.email",
            courseTitle: "$course.title",
            courseProvider: "$course.provider",
            courseCategory: "$course.category",
            amount: { $ifNull: ["$estimatedCost", "$amount"] },
            estimatedCost: 1,
            reason: { $ifNull: ["$description", "$reason"] },
            description: 1,
            careerGoals: 1,
            timeline: 1,
            additionalInfo: 1,
            urgency: 1,
            documents: 1,
            status: 1,
            submissionDate: 1,
            createdAt: 1,
            updatedAt: 1,
          },
        },
        { $limit: 2 },
      ])
      .toArray();
    
    console.log(`✅ Admin API returned ${adminApplications.length} applications`);
    if (adminApplications.length > 0) {
      const sample = adminApplications[0];
      console.log(`   - Sample shows amount: $${sample.amount}`);
      console.log(`   - Sample shows student: ${sample.studentName}`);
      console.log(`   - Sample shows course: ${sample.courseTitle}`);
      console.log(`   - Sample has documents: ${!!sample.documents}`);
    }
    
    // Check admin stats
    const stats = {
      totalApplications: await db.collection("applications").countDocuments(),
      pendingApplications: await db.collection("applications").countDocuments({ status: "pending" }),
      approvedApplications: await db.collection("applications").countDocuments({ status: "approved" }),
      totalCourseRequests: await db.collection("courseRequests").countDocuments(),
      pendingCourseRequests: await db.collection("courseRequests").countDocuments({ status: "pending" })
    };
    
    console.log("\n📈 Platform Statistics:");
    console.log(`Total Applications: ${stats.totalApplications}`);
    console.log(`Pending Applications: ${stats.pendingApplications}`);
    console.log(`Approved Applications: ${stats.approvedApplications}`);
    console.log(`Total Course Requests: ${stats.totalCourseRequests}`);
    console.log(`Pending Course Requests: ${stats.pendingCourseRequests}`);
    
    console.log("\n✅ Admin panel compatibility test completed!");
    console.log("🌐 Visit http://localhost:3001/admin/applications to see the enhanced admin panel");
    
  } catch (error) {
    console.error("❌ Error testing admin panel:", error);
  } finally {
    await client.close();
  }
}

testAdminPanel();