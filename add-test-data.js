const { MongoClient, ObjectId } = require('mongodb');

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function addTestData() {
  try {
    await client.connect();
    const db = client.db("skillfund");
    
    console.log("🎯 Adding Test Data for Admin Panel");
    console.log("===================================");
    
    // Create test users
    const testUsers = [
      {
        _id: new ObjectId(),
        name: "Sarah Johnson",
        email: "sarah.johnson@example.com",
        userType: "student",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new ObjectId(),
        name: "Mike Chen", 
        email: "mike.chen@example.com",
        userType: "student",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new ObjectId(),
        name: "Amanda Rodriguez",
        email: "amanda.rodriguez@example.com", 
        userType: "student",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    // Insert test users
    await db.collection("users").insertMany(testUsers);
    console.log("✅ Added test users");
    
    // Get existing courses
    const existingCourses = await db.collection("courses").find({}).toArray();
    
    // Create applications for available courses
    const availableCourseApplications = [
      {
        _id: new ObjectId(),
        studentId: testUsers[0]._id,
        courseId: existingCourses[0]._id,
        estimatedCost: 5000,
        description: "I want to enhance my React skills to advance in my current role as a frontend developer. This course will help me learn advanced patterns and best practices.",
        urgency: "medium",
        status: "pending",
        documents: {
          transcripts: "transcripts_sarah_johnson.pdf",
          financialProof: "financial_statement_sarah.pdf",
          resume: "sarah_johnson_resume.pdf"
        },
        submissionDate: new Date(),
        createdAt: new Date()
      },
      {
        _id: new ObjectId(),
        studentId: testUsers[1]._id,
        courseId: existingCourses[1]._id,
        estimatedCost: 7500,
        description: "Looking to transition into machine learning. I have a strong background in mathematics and programming, and this course would provide the foundation I need.",
        urgency: "high",
        status: "approved",
        documents: {
          transcripts: "transcripts_mike_chen.pdf",
          financialProof: "financial_mike.pdf"
        },
        submissionDate: new Date(Date.now() - 86400000), // 1 day ago
        createdAt: new Date(Date.now() - 86400000)
      }
    ];
    
    await db.collection("applications").insertMany(availableCourseApplications);
    console.log("✅ Added available course applications");
    
    // Create new course requests
    const newCourseRequests = [
      {
        _id: new ObjectId(),
        studentId: testUsers[2]._id,
        title: "Advanced Cybersecurity and Ethical Hacking",
        courseName: "Advanced Cybersecurity and Ethical Hacking",
        provider: "SecureAcademy",
        category: "Technology",
        cost: 12000,
        duration: "16 weeks",
        description: "Comprehensive cybersecurity course covering penetration testing, vulnerability assessment, and ethical hacking techniques.",
        justification: "With increasing cyber threats, cybersecurity skills are in high demand. This course would prepare me for a career in information security.",
        careerRelevance: "Direct path to cybersecurity analyst and penetration tester roles, which are experiencing significant growth.",
        timeline: "Start immediately, complete within 4 months",
        status: "pending",
        documents: {
          courseDetails: "cybersecurity_course_syllabus.pdf",
          careerPlan: "cybersecurity_career_roadmap.pdf"
        },
        submissionDate: new Date(),
        createdAt: new Date()
      },
      {
        _id: new ObjectId(),
        studentId: testUsers[0]._id,
        title: "Blockchain Development Masterclass",
        courseName: "Blockchain Development Masterclass",
        provider: "CryptoInstitute",
        category: "Technology",
        cost: 8500,
        duration: "12 weeks",
        description: "Learn blockchain development, smart contracts, and DeFi applications using Solidity and Web3 technologies.",
        justification: "Blockchain technology is revolutionizing finance and many other industries. This skill set would open up high-paying opportunities.",
        careerRelevance: "Blockchain developers are among the highest-paid in tech, with strong demand and limited supply.",
        timeline: "Start in 2 months, flexible schedule",
        status: "pending",
        documents: {
          courseDetails: "blockchain_course_info.pdf"
        },
        submissionDate: new Date(Date.now() - 172800000), // 2 days ago
        createdAt: new Date(Date.now() - 172800000)
      }
    ];
    
    await db.collection("courseRequests").insertMany(newCourseRequests);
    console.log("✅ Added new course requests");
    
    // Create certification requests
    const certificationRequests = [
      {
        _id: new ObjectId(),
        studentId: testUsers[1]._id,
        title: "AWS Solutions Architect Professional",
        courseName: "AWS Solutions Architect Professional",
        provider: "Amazon Web Services",
        category: "Cloud Computing",
        certificationType: "Professional Certification",
        cost: 3500,
        duration: "8 weeks prep + exam",
        description: "Professional-level AWS certification for designing distributed applications and systems on the AWS platform.",
        justification: "AWS certifications are industry-recognized credentials that significantly increase earning potential and job opportunities.",
        careerRelevance: "Essential for cloud architect roles, with average salary increase of 25-40% after certification.",
        timeline: "3 months preparation, then certification exam",
        status: "pending",
        documents: {
          studyPlan: "aws_study_plan.pdf",
          experienceProof: "aws_experience_letter.pdf"
        },
        submissionDate: new Date(),
        createdAt: new Date()
      },
      {
        _id: new ObjectId(),
        studentId: testUsers[2]._id,
        title: "Google Cloud Professional Data Engineer",
        courseName: "Google Cloud Professional Data Engineer",
        provider: "Google Cloud",
        category: "Data Science",
        certificationType: "Professional Certification",
        cost: 4200,
        duration: "10 weeks prep + exam",
        description: "Design and build data processing systems and machine learning models on Google Cloud Platform.",
        justification: "Data engineering is a rapidly growing field. GCP certification would validate my skills in modern data infrastructure.",
        careerRelevance: "Data engineers with cloud certifications command premium salaries and have excellent job security.",
        timeline: "Start preparation next month, exam in 3 months",
        status: "pending",
        documents: {
          courseDetails: "gcp_data_engineer_prep.pdf",
          costBreakdown: "certification_cost_analysis.pdf"
        },
        submissionDate: new Date(Date.now() - 86400000), // 1 day ago
        createdAt: new Date(Date.now() - 86400000)
      }
    ];
    
    await db.collection("courseRequests").insertMany(certificationRequests);
    console.log("✅ Added certification requests");
    
    console.log("\n🎉 Test data successfully added!");
    console.log("📊 Summary:");
    console.log("   - 3 new test users");
    console.log("   - 2 available course applications");
    console.log("   - 2 new course requests");  
    console.log("   - 2 certification requests");
    
  } catch (error) {
    console.error("❌ Error adding test data:", error);
  } finally {
    await client.close();
  }
}

addTestData();