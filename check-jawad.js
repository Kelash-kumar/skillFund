const { MongoClient, ObjectId } = require('mongodb');

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function checkForJawadUser() {
  try {
    await client.connect();
    const db = client.db("skillfund");
    
    console.log("🔍 Searching for Jawad in Users");
    console.log("==============================");
    
    // Check all users
    const users = await db.collection("users").find({}).toArray();
    console.log(`Total users: ${users.length}`);
    
    users.forEach((user, index) => {
      console.log(`\n${index + 1}. User ID: ${user._id}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Type: ${user.userType}`);
    });
    
    // Search for Jawad specifically
    const jawadUser = await db.collection("users").findOne({
      $or: [
        { name: { $regex: "jawad", $options: "i" } },
        { email: { $regex: "jawad", $options: "i" } }
      ]
    });
    
    if (jawadUser) {
      console.log("\n🎯 Found Jawad user:", jawadUser);
      
      // Now find applications for this user
      const jawadApps = await db.collection("applications").find({ 
        studentId: jawadUser._id 
      }).toArray();
      
      console.log(`\n📋 Jawad's applications (${jawadApps.length}):`);
      jawadApps.forEach(app => {
        console.log(`- Application ID: ${app._id}`);
        console.log(`  Status: ${app.status}`);
        console.log(`  Description: ${app.description?.substring(0, 50)}...`);
      });
      
    } else {
      console.log("\n❌ No user found with name 'Jawad'");
      console.log("This suggests the data in your screenshot is from a different database or was created differently.");
    }
    
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await client.close();
  }
}

checkForJawadUser();