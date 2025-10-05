/*
 Seeder for ScholarFund/SkillFund MongoDB
 - Creates: 1 admin, 5 donors, 5 students, 5 courses, 3 approved course requests
 - Uses process.env.MONGODB_URI and seeds the `skillfund` database (matching lib/mongodb.ts)

 Usage:
   - Ensure MONGODB_URI is set in your environment (e.g., .env.local)
   - Run: npm run seed
*/

/* eslint-disable no-console */

const { MongoClient, ObjectId } = require("mongodb");
const bcrypt = require("bcryptjs");

const DB_NAME = "skillfund"; // Keep consistent with lib/mongodb.ts
const MONGODB_URI  = "mongodb+srv://kelashraisal_db_user:IDXX84Pd5ib19j1R@cluster0.7umhbjx.mongodb.net/"
async function upsertOne(collection, filter, doc) {
  const res = await collection.updateOne(filter, { $setOnInsert: doc }, { upsert: true });
  if (res.upsertedId && res.upsertedId._id) {
    return res.upsertedId._id;
  }
  const existing = await collection.findOne(filter, { projection: { _id: 1 } });
  return existing?._id;
}

async function run() {
  if (!MONGODB_URI) {
    console.error("MONGODB_URI is not set. Please add it to your environment (e.g., .env.local)");
    process.exit(1);
  }

  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db(DB_NAME);

    const usersCol = db.collection("users");
    const coursesCol = db.collection("courses");
    const courseRequestsCol = db.collection("courseRequests");

    const passwordHash = await bcrypt.hash("Password123", 12);

    // 1) Users
    const admin = {
      name: "Admin User",
      email: "admin@skillfund.test",
      password: passwordHash,
      userType: "admin",
      profile: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const donors = Array.from({ length: 5 }).map((_, i) => ({
      name: `Donor ${i + 1}`,
      email: `donor${i + 1}@skillfund.test`,
      password: passwordHash,
      userType: "donor",
      profile: {
        company: `DonorCo ${i + 1}`,
        interests: ["Web Development", "Data", "Design"].slice(0, (i % 3) + 1),
        donationPreferences: { categories: ["Web Development", "Data", "Design"], recurring: i % 2 === 0 },
        isAnonymous: i % 2 === 1,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const students = Array.from({ length: 5 }).map((_, i) => ({
      name: `Student ${i + 1}`,
      email: `student${i + 1}@skillfund.test`,
      password: passwordHash,
      userType: "student",
      profile: {
        education: "Bachelor's in CS",
        careerGoals: "Become a software engineer",
        completedCertifications: [],
        portfolio: "https://portfolio.example.com/student" + (i + 1),
        linkedIn: "https://linkedin.com/in/student" + (i + 1),
        github: "https://github.com/student" + (i + 1),
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    console.log("Upserting users...");
    const adminId = await upsertOne(usersCol, { email: admin.email }, admin);

    const donorIds = [];
    for (const d of donors) {
      donorIds.push(await upsertOne(usersCol, { email: d.email }, d));
    }

    const studentIds = [];
    for (const s of students) {
      studentIds.push(await upsertOne(usersCol, { email: s.email }, s));
    }

    console.log("Users seeded:", { adminId, donors: donorIds.length, students: studentIds.length });

    // 2) Courses (approved)
    const baseCourses = [
      {
        title: "Full-Stack Web Development",
        provider: "Coursera",
        description: "Learn full-stack development with React and Node.js",
        category: "Web Development",
        price: 399,
        duration: "8 weeks",
        certificationType: "Certificate",
        url: "https://example.com/fullstack",
        isApproved: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: "Data Analysis with Python",
        provider: "edX",
        description: "Analyze data using Python, pandas, and visualization tools",
        category: "Data Science",
        price: 299,
        duration: "6 weeks",
        certificationType: "Certificate",
        url: "https://example.com/data-analysis",
        isApproved: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: "UI/UX Design Fundamentals",
        provider: "Udemy",
        description: "Foundations of design, prototyping, and user research",
        category: "Design",
        price: 149,
        duration: "4 weeks",
        certificationType: "Certificate",
        url: "https://example.com/ui-ux",
        isApproved: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: "Cloud Practitioner Essentials",
        provider: "AWS Training",
        description: "Core cloud concepts and AWS services overview",
        category: "Cloud",
        price: 0,
        duration: "2 weeks",
        certificationType: "Certificate",
        url: "https://example.com/aws-cloud",
        isApproved: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: "Machine Learning Basics",
        provider: "Coursera",
        description: "Introduction to ML concepts and algorithms",
        category: "Data Science",
        price: 499,
        duration: "10 weeks",
        certificationType: "Certificate",
        url: "https://example.com/ml-basics",
        isApproved: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    console.log("Upserting courses...");
    const courseIds = [];
    for (const c of baseCourses) {
      const id = await upsertOne(coursesCol, { title: c.title }, c);
      courseIds.push(id);
    }

    console.log("Courses seeded:", courseIds.length);

    // 3) Course Requests (approved) — tie students to courses
    // Only 3 requests as asked
    const requestPayloads = [
      {
        studentIdx: 0,
        courseIdx: 0,
        amount: baseCourses[0].price,
        reason: "Need funding to transition to full-stack role",
        careerGoals: "Become a full-stack engineer",
        timeline: "Q4 2025",
      },
      {
        studentIdx: 1,
        courseIdx: 1,
        amount: baseCourses[1].price,
        reason: "Upskill in data analysis for entry-level data roles",
        careerGoals: "Data analyst",
        timeline: "Q1 2026",
      },
      {
        studentIdx: 2,
        courseIdx: 4,
        amount: baseCourses[4].price,
        reason: "Foundational ML knowledge to pursue ML internships",
        careerGoals: "Machine learning engineer",
        timeline: "Q2 2026",
      },
    ];

    console.log("Upserting course requests...");
    for (const r of requestPayloads) {
      const studentId = studentIds[r.studentIdx];
      const courseId = courseIds[r.courseIdx];
      if (!studentId || !courseId) continue;

      const doc = {
        studentId: new ObjectId(studentId),
        courseId: new ObjectId(courseId),
        amount: r.amount ?? 0,
        reason: r.reason,
        careerGoals: r.careerGoals,
        timeline: r.timeline,
        status: "approved", // ensure visibility in donor browse
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await courseRequestsCol.updateOne(
        { studentId: doc.studentId, courseId: doc.courseId },
        { $setOnInsert: doc },
        { upsert: true }
      );
    }

    const totalRequests = await courseRequestsCol.countDocuments({ status: "approved" });
    console.log("Approved course requests (current count):", totalRequests);

    console.log("Seeding complete.");
  } catch (err) {
    console.error("Seeding error:", err);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

run();
