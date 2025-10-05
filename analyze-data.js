const { MongoClient, ObjectId } = require('mongodb');

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function analyzeDatabaseStructure() {
  try {
    await client.connect();
    const db = client.db("skillfund");
    
    console.log("🔍 Analyzing Database Structure for Admin Panel");
    console.log("==============================================");
    
    // Get applications with full aggregation
    console.log("\n📋 Applications Analysis:");
    const applications = await db.collection("applications").aggregate([
      {
        $lookup: {
          from: "users",
          localField: "studentId", 
          foreignField: "_id",
          as: "student"
        }
      },
      {
        $lookup: {
          from: "courses",
          localField: "courseId",
          foreignField: "_id", 
          as: "course"
        }
      },
      { $unwind: { path: "$student", preserveNullAndEmptyArrays: true }},
      { $unwind: { path: "$course", preserveNullAndEmptyArrays: true }}
    ]).toArray();
    
    console.log(`Found ${applications.length} applications:`);
    applications.forEach((app, i) => {
      console.log(`\n${i+1}. Application ID: ${app._id}`);
      console.log(`   Category: Available Course`);  
      console.log(`   Student: ${app.student?.name || 'Unknown'} (${app.student?.email || 'No email'})`);
      console.log(`   Course: ${app.course?.title || 'Unknown Course'}`);
      console.log(`   Provider: ${app.course?.provider || 'Unknown Provider'}`);
      console.log(`   Cost: $${app.estimatedCost || app.course?.cost || 0}`);
      console.log(`   Status: ${app.status}`);
      console.log(`   Documents: ${app.documents ? Object.keys(app.documents).length : 0} files`);
      if (app.documents) {
        console.log(`   Document files:`, Object.keys(app.documents));
      }
    });
    
    // Get course requests 
    console.log("\n\n📋 Course Requests Analysis:");
    const courseRequests = await db.collection("courseRequests").aggregate([
      {
        $lookup: {
          from: "users",
          localField: "studentId",
          foreignField: "_id", 
          as: "student"
        }
      },
      { $unwind: { path: "$student", preserveNullAndEmptyArrays: true }}
    ]).toArray();
    
    console.log(`Found ${courseRequests.length} course requests:`);
    courseRequests.forEach((req, i) => {
      console.log(`\n${i+1}. Request ID: ${req._id}`);
      console.log(`   Category: ${req.courseName ? 'New Course' : 'Certification'}`);
      console.log(`   Student: ${req.student?.name || 'Unknown'} (${req.student?.email || 'No email'})`); 
      console.log(`   Course: ${req.courseName || req.title || 'Unknown'}`);
      console.log(`   Provider: ${req.provider || 'Unknown'}`);
      console.log(`   Cost: $${req.cost || req.price || 0}`);
      console.log(`   Duration: ${req.duration || 'Unknown'}`);
      console.log(`   Status: ${req.status}`);
      console.log(`   Documents: ${req.documents ? Object.keys(req.documents).length : 0} files`);
      if (req.documents) {
        console.log(`   Document files:`, Object.keys(req.documents));
      }
    });
    
    // Get all courses for reference
    console.log("\n\n📚 Available Courses:");
    const courses = await db.collection("courses").find({}).toArray();
    courses.forEach((course, i) => {
      console.log(`${i+1}. ${course.title} by ${course.provider} - $${course.cost}`);
    });
    
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await client.close();
  }
}

analyzeDatabaseStructure();