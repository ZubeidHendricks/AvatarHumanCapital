import { db } from "./db";
import { users, jobs, candidates } from "@shared/schema";

async function seedDatabase() {
  console.log("🌱 Starting database seed...");

  try {
    console.log("Clearing existing data...");
    await db.delete(candidates);
    await db.delete(jobs);
    await db.delete(users);

    console.log("Creating users...");
    const userRecords = await db.insert(users).values([
      {
        username: "admin",
        password: "admin123",
        email: "admin@ahc.ai",
        fullName: "Admin User",
        role: "admin"
      },
      {
        username: "hr_manager",
        password: "hr123",
        email: "hr@ahc.ai",
        fullName: "Sarah Nkosi",
        role: "hr"
      },
      {
        username: "recruiter",
        password: "recruiter123",
        email: "recruiter@ahc.ai",
        fullName: "Thabo Mokwena",
        role: "hr"
      }
    ]).returning();

    console.log(`✓ Created ${userRecords.length} users`);

    console.log("Creating job postings...");
    const jobRecords = await db.insert(jobs).values([
      {
        title: "Senior Backend Developer",
        department: "Engineering",
        location: "Gauteng",
        employmentType: "full-time",
        salaryRange: "R650,000 - R850,000",
        description: "We're seeking an experienced Backend Developer to join our growing engineering team. You'll work on scalable microservices architecture using Node.js, Python, and PostgreSQL.",
        requirements: JSON.stringify([
          "5+ years of backend development experience",
          "Strong proficiency in Node.js and Python",
          "Experience with PostgreSQL and Redis",
          "Knowledge of microservices architecture",
          "Excellent problem-solving skills"
        ]),
        responsibilities: JSON.stringify([
          "Design and implement scalable backend systems",
          "Collaborate with frontend developers",
          "Optimize database performance",
          "Mentor junior developers",
          "Participate in code reviews"
        ]),
        benefits: JSON.stringify([
          "Medical aid (Discovery)",
          "Provident fund contribution",
          "Annual performance bonus",
          "Remote work flexibility",
          "Professional development budget"
        ]),
        status: "active"
      },
      {
        title: "Frontend React Developer",
        department: "Engineering",
        location: "Western Cape",
        employmentType: "full-time",
        salaryRange: "R550,000 - R750,000",
        description: "Join our product team to build beautiful, responsive user interfaces using React, TypeScript, and modern CSS frameworks.",
        requirements: JSON.stringify([
          "3+ years of React development",
          "Strong TypeScript skills",
          "Experience with Tailwind CSS",
          "Knowledge of state management (React Query, Zustand)",
          "Eye for design and UX"
        ]),
        responsibilities: JSON.stringify([
          "Build reusable React components",
          "Implement responsive designs",
          "Optimize frontend performance",
          "Work closely with designers",
          "Write comprehensive tests"
        ]),
        benefits: JSON.stringify([
          "Medical aid (Momentum)",
          "Provident fund",
          "Hybrid work model",
          "Learning stipend",
          "Team building events"
        ]),
        status: "active"
      },
      {
        title: "DevOps Engineer",
        department: "Infrastructure",
        location: "Gauteng",
        employmentType: "full-time",
        salaryRange: "R700,000 - R950,000",
        description: "We need a talented DevOps Engineer to manage our cloud infrastructure, CI/CD pipelines, and ensure system reliability.",
        requirements: JSON.stringify([
          "4+ years DevOps experience",
          "Strong AWS or Azure knowledge",
          "Experience with Kubernetes and Docker",
          "Proficiency in Terraform or similar IaC tools",
          "Understanding of monitoring and observability"
        ]),
        responsibilities: JSON.stringify([
          "Manage cloud infrastructure",
          "Build and maintain CI/CD pipelines",
          "Implement monitoring solutions",
          "Ensure system security and compliance",
          "On-call rotation support"
        ]),
        benefits: JSON.stringify([
          "Top-tier medical aid",
          "Provident fund with employer contribution",
          "Performance bonuses",
          "Certification sponsorship",
          "Flexible working hours"
        ]),
        status: "active"
      },
      {
        title: "Product Manager",
        department: "Product",
        location: "Western Cape",
        employmentType: "full-time",
        salaryRange: "R800,000 - R1,100,000",
        description: "Lead product strategy and execution for our AI-powered HR platform. Work with engineering, design, and business teams to deliver exceptional products.",
        requirements: JSON.stringify([
          "5+ years product management experience",
          "Experience with SaaS products",
          "Strong analytical skills",
          "Excellent communication abilities",
          "Technical background preferred"
        ]),
        responsibilities: JSON.stringify([
          "Define product roadmap and strategy",
          "Gather and prioritize requirements",
          "Work with engineering on delivery",
          "Analyze product metrics",
          "Engage with customers for feedback"
        ]),
        benefits: JSON.stringify([
          "Comprehensive medical aid",
          "Provident fund",
          "Equity options",
          "Professional development",
          "Remote work flexibility"
        ]),
        status: "active"
      },
      {
        title: "HR Business Partner",
        department: "Human Resources",
        location: "KwaZulu-Natal",
        employmentType: "full-time",
        salaryRange: "R500,000 - R650,000",
        description: "Support our business units with strategic HR guidance, talent management, and employee relations.",
        requirements: JSON.stringify([
          "BCOM or BA in HR Management",
          "3+ years HR Business Partner experience",
          "Strong understanding of South African labour law",
          "Excellent interpersonal skills",
          "Experience with HRIS systems"
        ]),
        responsibilities: JSON.stringify([
          "Partner with business leaders",
          "Manage employee relations",
          "Support talent acquisition",
          "Drive performance management",
          "Ensure compliance with labour laws"
        ]),
        benefits: JSON.stringify([
          "Medical aid subsidy",
          "Provident fund",
          "Annual bonus",
          "Study assistance",
          "Wellness programs"
        ]),
        status: "active"
      }
    ]).returning();

    console.log(`✓ Created ${jobRecords.length} job postings`);

    console.log("Creating candidates...");
    const candidateRecords = await db.insert(candidates).values([
      {
        jobId: jobRecords[0].id,
        firstName: "Sipho",
        lastName: "Dlamini",
        email: "sipho.dlamini@email.com",
        phone: "+27 82 345 6789",
        location: "Gauteng",
        cvUrl: "https://example.com/cv/sipho-dlamini.pdf",
        linkedinUrl: "https://linkedin.com/in/siphodlamini",
        experienceYears: 7,
        currentCompany: "Tech Solutions SA",
        currentPosition: "Senior Backend Developer",
        skills: JSON.stringify(["Node.js", "Python", "PostgreSQL", "Redis", "AWS", "Docker"]),
        education: JSON.stringify([
          {
            degree: "BSc Computer Science",
            institution: "University of the Witwatersrand",
            year: "2016"
          }
        ]),
        status: "screening",
        aiScore: 92,
        aiNotes: "Excellent technical background with strong problem-solving skills. Great cultural fit based on values alignment."
      },
      {
        jobId: jobRecords[0].id,
        firstName: "Lerato",
        lastName: "Molefe",
        email: "lerato.molefe@email.com",
        phone: "+27 83 456 7890",
        location: "Western Cape",
        cvUrl: "https://example.com/cv/lerato-molefe.pdf",
        experienceYears: 6,
        currentCompany: "Digital Innovations",
        currentPosition: "Backend Engineer",
        skills: JSON.stringify(["Node.js", "TypeScript", "MongoDB", "GraphQL", "Kubernetes"]),
        education: JSON.stringify([
          {
            degree: "BSc Information Technology",
            institution: "University of Cape Town",
            year: "2017"
          }
        ]),
        status: "interview",
        aiScore: 88,
        aiNotes: "Strong technical skills with good leadership potential. Excellent communication skills demonstrated in screening."
      },
      {
        jobId: jobRecords[1].id,
        firstName: "Thandi",
        lastName: "Ndlovu",
        email: "thandi.ndlovu@email.com",
        phone: "+27 84 567 8901",
        location: "Western Cape",
        cvUrl: "https://example.com/cv/thandi-ndlovu.pdf",
        githubUrl: "https://github.com/thandindlovu",
        experienceYears: 4,
        currentCompany: "Creative Web Studios",
        currentPosition: "Senior Frontend Developer",
        skills: JSON.stringify(["React", "TypeScript", "Tailwind CSS", "Next.js", "GraphQL", "Jest"]),
        education: JSON.stringify([
          {
            degree: "BSc Computer Science",
            institution: "Stellenbosch University",
            year: "2019"
          }
        ]),
        status: "screening",
        aiScore: 90,
        aiNotes: "Outstanding portfolio showcasing modern React applications. Strong design sensibility and attention to detail."
      },
      {
        jobId: jobRecords[1].id,
        firstName: "Michael",
        lastName: "Van Der Merwe",
        email: "michael.vdm@email.com",
        phone: "+27 85 678 9012",
        location: "Gauteng",
        cvUrl: "https://example.com/cv/michael-vandermerwe.pdf",
        linkedinUrl: "https://linkedin.com/in/michaelvdm",
        githubUrl: "https://github.com/mvdmerwe",
        experienceYears: 5,
        currentCompany: "StartupHub",
        currentPosition: "Frontend Lead",
        skills: JSON.stringify(["React", "Vue.js", "TypeScript", "CSS3", "Webpack", "Vite"]),
        education: JSON.stringify([
          {
            degree: "BSc Computer Science",
            institution: "University of Pretoria",
            year: "2018"
          }
        ]),
        status: "new",
        aiScore: 85,
        aiNotes: "Versatile frontend developer with experience in multiple frameworks. Good technical depth."
      },
      {
        jobId: jobRecords[2].id,
        firstName: "Nomvula",
        lastName: "Khumalo",
        email: "nomvula.khumalo@email.com",
        phone: "+27 86 789 0123",
        location: "Gauteng",
        cvUrl: "https://example.com/cv/nomvula-khumalo.pdf",
        linkedinUrl: "https://linkedin.com/in/nomvulakhumalo",
        experienceYears: 5,
        currentCompany: "CloudOps Africa",
        currentPosition: "DevOps Engineer",
        skills: JSON.stringify(["AWS", "Kubernetes", "Terraform", "Jenkins", "Python", "Bash", "Prometheus"]),
        education: JSON.stringify([
          {
            degree: "BSc Engineering",
            institution: "University of Johannesburg",
            year: "2018"
          },
          {
            degree: "AWS Solutions Architect Certification",
            institution: "Amazon Web Services",
            year: "2021"
          }
        ]),
        status: "interview",
        aiScore: 94,
        aiNotes: "Exceptional DevOps skills with multiple AWS certifications. Strong automation mindset and problem-solving abilities."
      },
      {
        jobId: jobRecords[2].id,
        firstName: "David",
        lastName: "Botha",
        email: "david.botha@email.com",
        phone: "+27 87 890 1234",
        location: "Western Cape",
        cvUrl: "https://example.com/cv/david-botha.pdf",
        experienceYears: 6,
        currentCompany: "Enterprise Tech",
        currentPosition: "Senior DevOps Engineer",
        skills: JSON.stringify(["Azure", "Docker", "Kubernetes", "Ansible", "GitLab CI", "Monitoring"]),
        education: JSON.stringify([
          {
            degree: "BSc Computer Engineering",
            institution: "University of Cape Town",
            year: "2017"
          }
        ]),
        status: "screening",
        aiScore: 87,
        aiNotes: "Strong Azure expertise with solid containerization skills. Good team player with mentorship experience."
      },
      {
        jobId: jobRecords[3].id,
        firstName: "Zanele",
        lastName: "Mthembu",
        email: "zanele.mthembu@email.com",
        phone: "+27 88 901 2345",
        location: "Western Cape",
        cvUrl: "https://example.com/cv/zanele-mthembu.pdf",
        linkedinUrl: "https://linkedin.com/in/zanelemthembu",
        experienceYears: 7,
        currentCompany: "SaaS Innovators",
        currentPosition: "Senior Product Manager",
        skills: JSON.stringify(["Product Strategy", "Agile", "User Research", "Analytics", "Roadmapping", "Stakeholder Management"]),
        education: JSON.stringify([
          {
            degree: "BCOM Business Management",
            institution: "University of Cape Town",
            year: "2016"
          },
          {
            degree: "MBA",
            institution: "GIBS Business School",
            year: "2020"
          }
        ]),
        status: "interview",
        aiScore: 91,
        aiNotes: "Impressive product management track record. Strategic thinker with strong business acumen and technical understanding."
      },
      {
        jobId: jobRecords[4].id,
        firstName: "Bongani",
        lastName: "Sithole",
        email: "bongani.sithole@email.com",
        phone: "+27 89 012 3456",
        location: "KwaZulu-Natal",
        cvUrl: "https://example.com/cv/bongani-sithole.pdf",
        experienceYears: 4,
        currentCompany: "Corporate HR Solutions",
        currentPosition: "HR Business Partner",
        skills: JSON.stringify(["Employee Relations", "Talent Management", "Labour Law", "Performance Management", "HRIS", "Coaching"]),
        education: JSON.stringify([
          {
            degree: "BCOM Human Resources Management",
            institution: "University of KwaZulu-Natal",
            year: "2019"
          }
        ]),
        status: "screening",
        aiScore: 86,
        aiNotes: "Strong HR generalist with good knowledge of SA labour law. Excellent interpersonal skills and cultural awareness."
      },
      {
        jobId: jobRecords[0].id,
        firstName: "Chloe",
        lastName: "Smith",
        email: "chloe.smith@email.com",
        phone: "+27 81 234 5678",
        location: "Gauteng",
        cvUrl: "https://example.com/cv/chloe-smith.pdf",
        githubUrl: "https://github.com/chloesmith",
        experienceYears: 8,
        currentCompany: "FinTech SA",
        currentPosition: "Lead Backend Engineer",
        skills: JSON.stringify(["Python", "Django", "PostgreSQL", "RabbitMQ", "Celery", "FastAPI"]),
        education: JSON.stringify([
          {
            degree: "BSc Mathematics & Computer Science",
            institution: "Rhodes University",
            year: "2015"
          }
        ]),
        status: "offer",
        aiScore: 95,
        aiNotes: "Exceptional candidate with deep technical expertise. Strong leadership skills and proven track record of delivering complex systems."
      },
      {
        jobId: jobRecords[1].id,
        firstName: "Katlego",
        lastName: "Mokoena",
        email: "katlego.mokoena@email.com",
        phone: "+27 82 345 6789",
        location: "Gauteng",
        cvUrl: "https://example.com/cv/katlego-mokoena.pdf",
        portfolioUrl: "https://katlegomokoena.dev",
        experienceYears: 3,
        currentCompany: "Design & Dev Co",
        currentPosition: "Frontend Developer",
        skills: JSON.stringify(["React", "TypeScript", "SCSS", "Figma", "Storybook", "Accessibility"]),
        education: JSON.stringify([
          {
            degree: "BSc IT (Web Development)",
            institution: "University of Johannesburg",
            year: "2020"
          }
        ]),
        status: "rejected",
        aiScore: 72,
        aiNotes: "Good technical skills but lacks experience with complex state management. May be better suited for mid-level positions."
      }
    ]).returning();

    console.log(`✓ Created ${candidateRecords.length} candidates`);

    console.log("\n✅ Database seeded successfully!");
    console.log("\nSummary:");
    console.log(`- ${userRecords.length} users`);
    console.log(`- ${jobRecords.length} jobs`);
    console.log(`- ${candidateRecords.length} candidates`);
    
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

seedDatabase()
  .then(() => {
    console.log("\n🎉 Seed complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Seed failed:", error);
    process.exit(1);
  });
