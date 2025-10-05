const { MongoClient, ObjectId } = require('mongodb');

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function debugSpecificApplication() {
  try {
    await client.connect();
    const db = client.db("skillfund");
    
    console.log("🔍 Searching for Application by Student");
    console.log("======================================");
    
    // Search by student name from the screenshot
    console.log("\n1. Searching by student name 'Jawad Soomro':");
    const studentApps = await db.collection("applications").find({ 
      $or: [
        { "studentName": { $regex: "Jawad", $options: "i" } },
        { "studentEmail": { $regex: "jawadsoomro183", $options: "i" } }
      ]
    }).toArray();
    
    console.log("Found applications:", studentApps.length);
    studentApps.forEach((app, index) => {
      console.log(`\nApplication ${index + 1}:`, JSON.stringify(app, null, 2));
    });
    
    // Also check course requests
    console.log("\n2. Searching course requests:");
    const courseRequests = await db.collection("courseRequests").find({ 
      $or: [
        { "studentName": { $regex: "Jawad", $options: "i" } },
        { "studentEmail": { $regex: "jawadsoomro183", $options: "i" } }
      ]
    }).toArray();
    
    console.log("Found course requests:", courseRequests.length);
    courseRequests.forEach((req, index) => {
      console.log(`\nCourse Request ${index + 1}:`, JSON.stringify(req, null, 2));
    });
    
    // Search all collections
    console.log("\n3. Searching all collections for this student:");
    const collections = await db.listCollections().toArray();
    
    for (const collection of collections) {
      const collectionName = collection.name;
      try {
        const docs = await db.collection(collectionName).find({ 
          $or: [
            { "studentName": { $regex: "Jawad", $options: "i" } },
            { "studentEmail": { $regex: "jawadsoomro183", $options: "i" } },
            { "reason": { $regex: "adflkajdfllkj", $options: "i" } }
          ]
        }).toArray();
        
        if (docs.length > 0) {
          console.log(`\nFound ${docs.length} docs in ${collectionName}:`);
          docs.forEach(doc => {
            console.log("ID:", doc._id);
            console.log("Data:", JSON.stringify(doc, null, 2));
          });
        }
      } catch (error) {
        // Skip collections that don't support queries
      }
    }
    
  } catch (error) {
    console.error("❌ Debug error:", error);
  } finally {
    await client.close();
  }
}

debugSpecificApplication();