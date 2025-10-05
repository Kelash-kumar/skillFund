const { MongoClient, ObjectId } = require('mongodb');

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function createProperTestData() {
  try {
    await client.connect();
    const db = client.db("skillfund");
    
    console.log("🎯 Creating Test Data with Proper Schema");
    console.log("======================================");
    
    // Create a user first
    const testUser = {
      _id: new ObjectId("68e0e042126e061fe3d2e1fe"),
      name: "Jawad Soomro", 
      email: "jawadsoomro183@gmail.com",
      userType: "student",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    try {
      await db.collection("users").insertOne(testUser);
      console.log("✅ Created test user");
    } catch (e) {
      console.log("ℹ️  User already exists");
    }
    
    // Create a course for available-course type
    const testCourse = {
      _id: new ObjectId("68e143ad1ddc9cc123709408"),
      title: "Full Stack Web Development",
      provider: "TechEd Academy", 
      category: "Web Development",
      cost: 2500,
      duration: "12 weeks",
      description: "Comprehensive full stack development course"
    };
    
    try {
      await db.collection("courses").insertOne(testCourse);
      console.log("✅ Created test course");
    } catch (e) {
      console.log("ℹ️  Course already exists");
    }
    
    // Clear existing applications and create new ones with proper schema
    await db.collection("applications").deleteMany({});
    console.log("🗑️  Cleared existing applications");
    
    // 1. Available Course Application (matching your structure)
    const availableCourseApp = {
      _id: new ObjectId("68e17a43d9991531150a5815"),
      studentId: new ObjectId("68e0e042126e061fe3d2e1fe"),
      studentName: "Jawad Soomro",
      studentEmail: "jawadsoomro183@gmail.com",
      requestType: "available-course",
      reason: "adflkajdfllkj",
      careerGoals: "lkafj;dslkfj aldkf asdlkfj;aldks  ",
      previousExperience: "lkfajdfl;k alkdf j;aldkjf ",
      expectedOutcome: "as;lkdfj alkdsf jdlsk ",
      urgency: "medium",
      courseId: new ObjectId("68e143ad1ddc9cc123709408"),
      documents: {
        academicTranscript: {
          originalName: "STTA Form.pdf",
          fileName: "academicTranscript_1759607362390_b63d875b-0b2b-4739-b192-dfe30cbc32f2.pdf",
          filePath: "/uploads/documents/students/68e0e042126e061fe3d2e1fe/academicTranscript_1759607362390_b63d875b-0b2b-4739-b192-dfe30cbc32f2.pdf",
          fileSize: 247330,
          fileType: "application/pdf",
          uploadedAt: new Date()
        },
        marksheets: {
          originalName: "STTA Form.pdf",
          fileName: "marksheets_1759607362396_ebc6b7e1-209c-4710-a485-a444299198e2.pdf",
          filePath: "/uploads/documents/students/68e0e042126e061fe3d2e1fe/marksheets_1759607362396_ebc6b7e1-209c-4710-a485-a444299198e2.pdf",
          fileSize: 247330,
          fileType: "application/pdf",
          uploadedAt: new Date()
        },
        bankSlip: {
          originalName: "STTA Form.pdf",
          fileName: "bankSlip_1759607362400_980f5cb6-e1c8-49db-ad91-703841d9fa37.pdf",
          filePath: "/uploads/documents/students/68e0e042126e061fe3d2e1fe/bankSlip_1759607362400_980f5cb6-e1c8-49db-ad91-703841d9fa37.pdf",
          fileSize: 247330,
          fileType: "application/pdf",
          uploadedAt: new Date()
        },
        electricityBill: {
          originalName: "STTA Form.pdf",
          fileName: "electricityBill_1759607362404_5ce7d51e-15f6-4391-afae-929c5eb6c6ff.pdf",
          filePath: "/uploads/documents/students/68e0e042126e061fe3d2e1fe/electricityBill_1759607362404_5ce7d51e-15f6-4391-afae-929c5eb6c6ff.pdf",
          fileSize: 247330,
          fileType: "application/pdf",
          uploadedAt: new Date()
        },
        idCard: {
          originalName: "STTA Form.pdf",
          fileName: "idCard_1759607362408_db041da3-dce6-4f1f-82a7-f3ad9d87fced.pdf",
          filePath: "/uploads/documents/students/68e0e042126e061fe3d2e1fe/idCard_1759607362408_db041da3-dce6-4f1f-82a7-f3ad9d87fced.pdf",
          fileSize: 247330,
          fileType: "application/pdf",
          uploadedAt: new Date()
        }
      },
      status: "pending",
      isApproved: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // 2. New Course Application
    const newCourseApp = {
      _id: new ObjectId("68e17aa4d9991531150a5816"),
      studentId: new ObjectId("68e0e042126e061fe3d2e1fe"),
      studentName: "Jawad Soomro",
      studentEmail: "jawadsoomro183@gmail.com",
      requestType: "new-course",
      reason: "asdf asd fasasdfa sdf asd sf ",
      careerGoals: "asdfasdf asd asdf a a",
      previousExperience: "asfasdf asd fa sdf asd as df",
      expectedOutcome: "asdf asd fa sdfa sdf a sd asf df",
      urgency: "medium",
      title: "AWS Tech Essentials",
      provider: "Coursera",
      description: "sdafs sdf asdf asdf asdf ",
      category: "Cloud Computing",
      estimatedFee: 31,
      duration: "8 weeks",
      courseUrl: "https://awscloudclubs.udemy.com/",
      documents: {
        academicTranscript: {
          originalName: "STTA Form.pdf",
          fileName: "academicTranscript_1759607459757_f9a3df46-78d3-414d-bb71-6cf5001aea73.pdf",
          filePath: "/uploads/documents/students/68e0e042126e061fe3d2e1fe/academicTranscript_1759607459757_f9a3df46-78d3-414d-bb71-6cf5001aea73.pdf",
          fileSize: 247330,
          fileType: "application/pdf",
          uploadedAt: new Date()
        },
        marksheets: {
          originalName: "STTA Form.pdf",
          fileName: "marksheets_1759607459763_25dc4566-2152-4ab9-ad43-6d7f38100e82.pdf",
          filePath: "/uploads/documents/students/68e0e042126e061fe3d2e1fe/marksheets_1759607459763_25dc4566-2152-4ab9-ad43-6d7f38100e82.pdf",
          fileSize: 247330,
          fileType: "application/pdf",
          uploadedAt: new Date()
        },
        bankSlip: {
          originalName: "STTA Form.pdf",
          fileName: "bankSlip_1759607459768_a14fd7c2-b770-4bd1-bd60-dc925ebb8509.pdf",
          filePath: "/uploads/documents/students/68e0e042126e061fe3d2e1fe/bankSlip_1759607459768_a14fd7c2-b770-4bd1-bd60-dc925ebb8509.pdf",
          fileSize: 247330,
          fileType: "application/pdf",
          uploadedAt: new Date()
        },
        electricityBill: {
          originalName: "STTA Form.pdf",
          fileName: "electricityBill_1759607459773_6c36e2b5-3816-499d-882c-98e7b7ee9310.pdf",
          filePath: "/uploads/documents/students/68e0e042126e061fe3d2e1fe/electricityBill_1759607459773_6c36e2b5-3816-499d-882c-98e7b7ee9310.pdf",
          fileSize: 247330,
          fileType: "application/pdf",
          uploadedAt: new Date()
        },
        idCard: {
          originalName: "STTA Form.pdf",
          fileName: "idCard_1759607459778_01e6c323-cdd9-4038-b419-47795513eb67.pdf",
          filePath: "/uploads/documents/students/68e0e042126e061fe3d2e1fe/idCard_1759607459778_01e6c323-cdd9-4038-b419-47795513eb67.pdf",
          fileSize: 247330,
          fileType: "application/pdf",
          uploadedAt: new Date()
        }
      },
      status: "pending",
      isApproved: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // 3. Certification Application
    const certificationApp = {
      _id: new ObjectId("68e17adfd9991531150a5817"),
      studentId: new ObjectId("68e0e042126e061fe3d2e1fe"),
      studentName: "Jawad Soomro",
      studentEmail: "jawadsoomro183@gmail.com",
      requestType: "certification",
      reason: "adsfasd fasd fa sd asd asdf a",
      careerGoals: "asdf dasf asdf",
      previousExperience: "asdf asdf asdf asd",
      expectedOutcome: "asdfsadfasdf aasdfasdfasdf",
      urgency: "medium",
      certificationType: "AWS Cloud Practitioner",
      provider: "AWS",
      estimatedFee: 100,
      description: "adsf asdf asdf asdf asdf a asdf",
      documents: {
        academicTranscript: {
          originalName: "STTA Form.pdf",
          fileName: "academicTranscript_1759607518881_732e863b-8e17-45b5-ad0b-1d3f55b35867.pdf",
          filePath: "/uploads/documents/students/68e0e042126e061fe3d2e1fe/academicTranscript_1759607518881_732e863b-8e17-45b5-ad0b-1d3f55b35867.pdf",
          fileSize: 247330,
          fileType: "application/pdf",
          uploadedAt: new Date()
        },
        marksheets: {
          originalName: "STTA Form.pdf",
          fileName: "marksheets_1759607518885_e8820098-cfee-4341-9090-a3e445b5b29d.pdf",
          filePath: "/uploads/documents/students/68e0e042126e061fe3d2e1fe/marksheets_1759607518885_e8820098-cfee-4341-9090-a3e445b5b29d.pdf",
          fileSize: 247330,
          fileType: "application/pdf",
          uploadedAt: new Date()
        },
        bankSlip: {
          originalName: "STTA Form.pdf",
          fileName: "bankSlip_1759607518889_f7f6994c-f931-446f-898f-b2c2288a10be.pdf",
          filePath: "/uploads/documents/students/68e0e042126e061fe3d2e1fe/bankSlip_1759607518889_f7f6994c-f931-446f-898f-b2c2288a10be.pdf",
          fileSize: 247330,
          fileType: "application/pdf",
          uploadedAt: new Date()
        },
        electricityBill: {
          originalName: "STTA Form.pdf",
          fileName: "electricityBill_1759607518894_0a44fd9c-b810-4acb-8fc3-c4eeb6b779ee.pdf",
          filePath: "/uploads/documents/students/68e0e042126e061fe3d2e1fe/electricityBill_1759607518894_0a44fd9c-b810-4acb-8fc3-c4eeb6b779ee.pdf",
          fileSize: 247330,
          fileType: "application/pdf",
          uploadedAt: new Date()
        },
        idCard: {
          originalName: "STTA Form.pdf",
          fileName: "idCard_1759607518898_10733d3d-00d1-4bf4-9e45-f242c30983b5.pdf",
          filePath: "/uploads/documents/students/68e0e042126e061fe3d2e1fe/idCard_1759607518898_10733d3d-00d1-4bf4-9e45-f242c30983b5.pdf",
          fileSize: 247330,
          fileType: "application/pdf",
          uploadedAt: new Date()
        }
      },
      status: "pending",
      isApproved: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Insert all applications
    await db.collection("applications").insertMany([
      availableCourseApp,
      newCourseApp, 
      certificationApp
    ]);
    
    console.log("✅ Created 3 applications with proper schema:");
    console.log("   - 1 Available Course Application");
    console.log("   - 1 New Course Request");
    console.log("   - 1 Certification Request");
    
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await client.close();
  }
}

createProperTestData();