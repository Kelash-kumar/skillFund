const { MongoClient, ObjectId } = require('mongodb');

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function findApplicationDetails() {
  try {
    await client.connect();
    const db = client.db("skillfund");
    
    console.log("🔍 Finding Application with Aggregation");
    console.log("======================================");
    
    // List all applications with their joined user data
    console.log("\n📋 All Applications with User Details:");
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
      {
        $unwind: { path: "$student", preserveNullAndEmptyArrays: true }
      },
      {
        $unwind: { path: "$course", preserveNullAndEmptyArrays: true }
      }
    ]).toArray();
    
    console.log(`Found ${applications.length} applications:`);
    
    applications.forEach((app, index) => {
      console.log(`\n${index + 1}. Application ID: ${app._id}`);
      console.log(`   Student: ${app.student?.name || 'Unknown'} (${app.student?.email || 'No email'})`);
      console.log(`   Course: ${app.course?.title || 'Unknown'}`);
      console.log(`   Status: ${app.status}`);
      console.log(`   Description: ${app.description?.substring(0, 50) || 'No description'}...`);
      console.log(`   Documents: ${app.documents?.length || 0} files`);
      
      // Check if this might be our target application
      if (app.student?.email?.includes('jawad') || 
          app.student?.name?.toLowerCase().includes('jawad') ||
          app.description?.includes('adflkajdfllkj')) {
        console.log(`   🎯 POTENTIAL MATCH! This might be the one we're looking for`);
      }
    });
    
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await client.close();
  }
}

findApplicationDetails();