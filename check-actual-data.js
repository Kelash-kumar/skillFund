const { MongoClient, ObjectId } = require('mongodb');

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function checkActualData() {
  try {
    await client.connect();
    const db = client.db("skillfund");
    
    console.log("🔍 Checking Actual Applications Collection");
    console.log("=========================================");
    
    // Get a few sample documents to see the structure
    const samples = await db.collection("applications").find({}).limit(5).toArray();
    
    console.log(`Found ${samples.length} sample applications:`);
    
    samples.forEach((app, index) => {
      console.log(`\n${index + 1}. Application ID: ${app._id}`);
      console.log(`   Fields present: ${Object.keys(app).join(', ')}`);
      
      if (app.requestType) {
        console.log(`   Request Type: ${app.requestType}`);
      } else {
        console.log(`   ❌ No requestType field found`);
      }
      
      if (app.studentName) {
        console.log(`   Student: ${app.studentName}`);
      }
      
      // Show a few key fields
      if (app.title) console.log(`   Title: ${app.title}`);
      if (app.certificationType) console.log(`   Certification: ${app.certificationType}`);
      if (app.courseId) console.log(`   Course ID: ${app.courseId}`);
      if (app.provider) console.log(`   Provider: ${app.provider}`);
      if (app.estimatedFee) console.log(`   Fee: $${app.estimatedFee}`);
    });
    
    // Check collection stats
    const count = await db.collection("applications").countDocuments();
    console.log(`\n📊 Total applications in collection: ${count}`);
    
    // Check for different request types
    const requestTypes = await db.collection("applications").distinct("requestType");
    console.log(`📋 Request types found: ${requestTypes.join(', ')}`);
    
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await client.close();
  }
}

checkActualData();