// Comprehensive seeding script for ScholarFund platform
const { MongoClient, ObjectId } = require("mongodb")
const bcrypt = require("bcryptjs")

const uri = process.env.MONGODB_URI || "mongodb+srv://kelashraisal_db_user:IDXX84Pd5ib19j1R@cluster0.7umhbjx.mongodb.net/"
const dbName = "scholarfund"

async function seedComprehensiveData() {
  const client = new MongoClient(uri)
  
  try {
    await client.connect()
    console.log("Connected to MongoDB")
    
    const db = client.db(dbName)
    
    // Clear existing data
    console.log("Clearing existing data...")
    await Promise.all([
      db.collection("users").deleteMany({}),
      db.collection("applications").deleteMany({}),
      db.collection("donations").deleteMany({}),
      db.collection("payments").deleteMany({}),
      db.collection("courseRequests").deleteMany({})
    ])
    
    // Create sample users
    console.log("Creating users...")
    const hashedPassword = await bcrypt.hash("password123", 10)
    
    const users = [
      // Admin users
      {
        _id: new ObjectId(),
        name: "Admin User",
        email: "admin@scholarfund.com",
        password: hashedPassword,
        userType: "admin",
        createdAt: new Date("2024-01-15"),
        updatedAt: new Date("2024-01-15")
      },
      
      // Student users
      {
        _id: new ObjectId(),
        name: "Alice Johnson",
        email: "alice.johnson@email.com",
        password: hashedPassword,
        userType: "student",
        profile: {
          education: "Bachelor's in Computer Science",
          careerGoals: "Become a cloud solutions architect",
          completedCertifications: [],
          portfolio: "https://alicejohnson.dev",
          linkedIn: "https://linkedin.com/in/alicejohnson",
          github: "https://github.com/alicejohnson"
        },
        createdAt: new Date("2024-02-01"),
        updatedAt: new Date("2024-02-01")
      },
      {
        _id: new ObjectId(),
        name: "Michael Chen",
        email: "michael.chen@email.com",
        password: hashedPassword,
        userType: "student",
        profile: {
          education: "Associate's in Data Analytics",
          careerGoals: "Data scientist at a tech company",
          completedCertifications: ["Google Analytics Individual Qualification"],
          portfolio: "https://michaelchen.portfolio.com",
          linkedIn: "https://linkedin.com/in/michaelchen",
          github: "https://github.com/michaelchen"
        },
        createdAt: new Date("2024-02-05"),
        updatedAt: new Date("2024-02-05")
      },
      {
        _id: new ObjectId(),
        name: "Sarah Williams",
        email: "sarah.williams@email.com",
        password: hashedPassword,
        userType: "student",
        profile: {
          education: "Self-taught Web Developer",
          careerGoals: "Frontend developer at a startup",
          completedCertifications: ["FreeCodeCamp Responsive Web Design"],
          portfolio: "https://sarahwilliams.dev",
          linkedIn: "https://linkedin.com/in/sarahwilliams"
        },
        createdAt: new Date("2024-02-10"),
        updatedAt: new Date("2024-02-10")
      },
      {
        _id: new ObjectId(),
        name: "David Rodriguez",
        email: "david.rodriguez@email.com",
        password: hashedPassword,
        userType: "student",
        profile: {
          education: "Business Administration",
          careerGoals: "Project manager in IT",
          completedCertifications: [],
          linkedIn: "https://linkedin.com/in/davidrodriguez"
        },
        createdAt: new Date("2024-02-15"),
        updatedAt: new Date("2024-02-15")
      },
      {
        _id: new ObjectId(),
        name: "Emily Davis",
        email: "emily.davis@email.com",
        password: hashedPassword,
        userType: "student",
        profile: {
          education: "Marketing Degree",
          careerGoals: "Digital marketing specialist",
          completedCertifications: ["Google Ads Certification"],
          portfolio: "https://emilydavis.marketing"
        },
        createdAt: new Date("2024-02-20"),
        updatedAt: new Date("2024-02-20")
      },
      
      // Donor users
      {
        _id: new ObjectId(),
        name: "Robert Thompson",
        email: "robert.thompson@techcorp.com",
        password: hashedPassword,
        userType: "donor",
        profile: {
          company: "TechCorp Solutions",
          interests: ["Cloud Computing", "Data Science", "AI/ML"],
          donationPreferences: {
            categories: ["Cloud Computing", "Data Science"],
            maxAmount: 1000,
            recurring: false
          },
          isAnonymous: false
        },
        createdAt: new Date("2024-01-20"),
        updatedAt: new Date("2024-01-20")
      },
      {
        _id: new ObjectId(),
        name: "Jennifer Martinez",
        email: "jennifer.martinez@innovate.com",
        password: hashedPassword,
        userType: "donor",
        profile: {
          company: "Innovate Inc",
          interests: ["Web Development", "Mobile Development", "UX/UI"],
          donationPreferences: {
            categories: ["Web Development", "Mobile Development"],
            maxAmount: 800,
            recurring: true
          },
          isAnonymous: false
        },
        createdAt: new Date("2024-01-25"),
        updatedAt: new Date("2024-01-25")
      },
      {
        _id: new ObjectId(),
        name: "Anonymous Donor",
        email: "anon.donor@email.com",
        password: hashedPassword,
        userType: "donor",
        profile: {
          interests: ["General Education", "Career Development"],
          donationPreferences: {
            categories: [],
            maxAmount: 500,
            recurring: false
          },
          isAnonymous: true
        },
        createdAt: new Date("2024-01-30"),
        updatedAt: new Date("2024-01-30")
      },
      {
        _id: new ObjectId(),
        name: "Mark Wilson",
        email: "mark.wilson@consulting.com",
        password: hashedPassword,
        userType: "donor",
        profile: {
          company: "Wilson Consulting",
          interests: ["Project Management", "Business Analysis", "Leadership"],
          donationPreferences: {
            categories: ["Project Management", "Business Analysis"],
            maxAmount: 1200,
            recurring: true
          },
          isAnonymous: false
        },
        createdAt: new Date("2024-02-01"),
        updatedAt: new Date("2024-02-01")
      }
    ]
    
    await db.collection("users").insertMany(users)
    console.log(`Inserted ${users.length} users`)
    
    // Get user IDs for relationships
    const students = users.filter(u => u.userType === "student")
    const donors = users.filter(u => u.userType === "donor")
    const courses = await db.collection("courses").find({}).toArray()
    
    // Create applications
    console.log("Creating applications...")
    const applications = [
      {
        _id: new ObjectId(),
        studentId: students[0]._id, // Alice Johnson
        courseId: courses[0]._id, // AWS Certified Solutions Architect
        amount: 300,
        reason: "I want to transition into cloud computing and this certification will help me secure a solutions architect role at a major tech company.",
        status: "funded",
        approvedBy: users[0]._id, // Admin
        fundedAmount: 300,
        donors: [donors[0]._id], // Robert Thompson
        createdAt: new Date("2024-02-25"),
        updatedAt: new Date("2024-03-05")
      },
      {
        _id: new ObjectId(),
        studentId: students[1]._id, // Michael Chen
        courseId: courses[1]._id, // Google Data Analytics Certificate
        amount: 49,
        reason: "As someone with a background in data analytics, I want to earn Google's certification to validate my skills and improve job prospects.",
        status: "funded",
        approvedBy: users[0]._id, // Admin
        fundedAmount: 49,
        donors: [donors[0]._id], // Robert Thompson
        createdAt: new Date("2024-03-01"),
        updatedAt: new Date("2024-03-08")
      },
      {
        _id: new ObjectId(),
        studentId: students[2]._id, // Sarah Williams
        courseId: courses[2]._id, // Meta Front-End Developer
        amount: 49,
        reason: "I'm self-taught and want to formalize my frontend skills with Meta's professional certificate to land my first developer job.",
        status: "approved",
        approvedBy: users[0]._id, // Admin
        fundedAmount: 25, // Partially funded
        donors: [donors[1]._id], // Jennifer Martinez
        createdAt: new Date("2024-03-05"),
        updatedAt: new Date("2024-03-12")
      },
      {
        _id: new ObjectId(),
        studentId: students[3]._id, // David Rodriguez
        courseId: courses[4]._id, // PMP Project Management
        amount: 555,
        reason: "I want to advance my career in project management and the PMP certification is essential for senior roles in my field.",
        status: "approved",
        approvedBy: users[0]._id, // Admin
        fundedAmount: 300, // Partially funded
        donors: [donors[3]._id], // Mark Wilson
        createdAt: new Date("2024-03-10"),
        updatedAt: new Date("2024-03-15")
      },
      {
        _id: new ObjectId(),
        studentId: students[4]._id, // Emily Davis
        courseId: courses[1]._id, // Google Data Analytics Certificate
        amount: 49,
        reason: "I want to add data analytics skills to my marketing background to become more effective in digital marketing campaigns.",
        status: "pending",
        createdAt: new Date("2024-03-18"),
        updatedAt: new Date("2024-03-18")
      },
      {
        _id: new ObjectId(),
        studentId: students[0]._id, // Alice Johnson (second application)
        courseId: courses[3]._id, // Salesforce Administrator
        amount: 200,
        reason: "After completing AWS certification, I want to add Salesforce skills to become more versatile in enterprise solutions.",
        status: "pending",
        createdAt: new Date("2024-03-20"),
        updatedAt: new Date("2024-03-20")
      }
    ]
    
    await db.collection("applications").insertMany(applications)
    console.log(`Inserted ${applications.length} applications`)
    
    // Create donations and payments
    console.log("Creating donations and payments...")
    const donations = []
    const payments = []
    
    // Create donations for funded applications
    const fundedApplications = applications.filter(app => app.status === "funded" || app.fundedAmount > 0)
    
    for (const app of fundedApplications) {
      if (app.donors && app.fundedAmount > 0) {
        const donation = {
          _id: new ObjectId(),
          donorId: app.donors[0],
          amount: app.fundedAmount,
          type: "one-time",
          applicationId: app._id,
          status: "completed",
          paymentId: new ObjectId().toString(),
          createdAt: new Date(app.updatedAt.getTime() - 24 * 60 * 60 * 1000), // 1 day before application update
          updatedAt: app.updatedAt
        }
        donations.push(donation)
        
        // Create corresponding payment record
        const payment = {
          _id: new ObjectId(donation.paymentId),
          donorId: app.donors[0],
          applicationId: app._id,
          amount: app.fundedAmount,
          status: "completed",
          paymentMethod: "credit_card",
          transactionId: `tx_${new ObjectId().toString().slice(-8)}`,
          createdAt: donation.createdAt,
          updatedAt: app.updatedAt
        }
        payments.push(payment)
      }
    }
    
    if (donations.length > 0) {
      await db.collection("donations").insertMany(donations)
      console.log(`Inserted ${donations.length} donations`)
    }
    
    if (payments.length > 0) {
      await db.collection("payments").insertMany(payments)
      console.log(`Inserted ${payments.length} payments`)
    }
    
    // Create course requests
    console.log("Creating course requests...")
    const courseRequests = [
      {
        _id: new ObjectId(),
        studentId: students[2]._id, // Sarah Williams
        studentName: students[2].name,
        studentEmail: students[2].email,
        title: "Advanced React Development",
        provider: "Udemy",
        description: "Advanced React concepts including hooks, context, performance optimization, and testing",
        category: "Web Development",
        price: 89.99,
        duration: "40 hours",
        certificationType: "Course Completion Certificate",
        url: "https://udemy.com/course/advanced-react-development",
        justification: "I need advanced React skills to build more complex applications and stand out in the job market.",
        careerRelevance: "React is the most in-demand frontend framework. Advanced skills will help me land senior positions.",
        timeline: "I plan to complete this course within 2 months while working on personal projects.",
        additionalInfo: "I've already completed basic React courses and built several projects.",
        documents: {},
        status: "pending",
        createdAt: new Date("2024-03-22"),
        updatedAt: new Date("2024-03-22")
      },
      {
        _id: new ObjectId(),
        studentId: students[4]._id, // Emily Davis
        studentName: students[4].name,
        studentEmail: students[4].email,
        title: "Facebook Ads Marketing Certification",
        provider: "Facebook Blueprint",
        description: "Comprehensive training on Facebook and Instagram advertising",
        category: "Digital Marketing",
        price: 0, // Free but requires preparation materials
        duration: "20 hours",
        certificationType: "Professional Certification",
        url: "https://www.facebook.com/business/learn/certification",
        justification: "This certification is crucial for my digital marketing career and will help me manage larger ad budgets.",
        careerRelevance: "Facebook ads expertise is essential for digital marketers. This certification will validate my skills to employers.",
        timeline: "I can complete the preparation and exam within 1 month.",
        additionalInfo: "I already have experience with Facebook ads but need the official certification.",
        documents: {},
        status: "approved",
        reviewNote: "Excellent justification and clear career path. Approved for funding of preparation materials.",
        reviewedBy: users[0]._id, // Admin
        reviewedAt: new Date("2024-03-25"),
        isApproved: true,
        createdAt: new Date("2024-03-23"),
        updatedAt: new Date("2024-03-25")
      }
    ]
    
    await db.collection("courseRequests").insertMany(courseRequests)
    console.log(`Inserted ${courseRequests.length} course requests`)
    
    console.log("Database seeded successfully with comprehensive data!")
    console.log("Summary:")
    console.log(`- Users: ${users.length} (${users.filter(u => u.userType === 'student').length} students, ${users.filter(u => u.userType === 'donor').length} donors, ${users.filter(u => u.userType === 'admin').length} admin)`)
    console.log(`- Applications: ${applications.length}`)
    console.log(`- Donations: ${donations.length}`)
    console.log(`- Payments: ${payments.length}`)
    console.log(`- Course Requests: ${courseRequests.length}`)
    
    console.log("\nLogin credentials for testing:")
    console.log("Admin: admin@scholarfund.com / password123")
    console.log("Student: alice.johnson@email.com / password123")
    console.log("Donor: robert.thompson@techcorp.com / password123")
    
  } catch (error) {
    console.error("Seeding failed:", error)
  } finally {
    await client.close()
  }
}

seedComprehensiveData()