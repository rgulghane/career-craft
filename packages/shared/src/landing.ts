/** Marketing / landing page content (AI Career Launchpad accelerator). */

import { getStandardPriceInRupees } from "./constants.js";

const STANDARD_PRICE_LABEL = `₹${getStandardPriceInRupees().toLocaleString("en-IN")}`;

export const LANDING = {
  hero: {
    badge: "2026 Summer batch · Live Saturdays",
    title: "Master Industry AI Tools in",
    titleAccent: "12 Weeks",
    subtitle:
      "Bridge the gap between college and industry. Built for Tier II & III students, freshers, and career switchers — no prerequisites.",
    poweredBy: "Powered by UniConnect · TechnoSpectra EdTech",
  },
  tools: [
    "Power BI",
    "Excel",
    "SQL",
    "Canva",
    "ChatGPT",
    "Claude",
    "Gemini",
    "Google Analytics",
    "LinkedIn",
    "Zapier",
    "Notion",
    "Slack",
    "Figma",
    "Python",
    "Tableau",
    "GitHub",
    "HubSpot",
    "Jira",
  ],
  mentors: [
    {
      name: "Eshan Tiwari",
      designation: "Sr. Staff Data Scientist/TLM",
      company: "Meta",
      previouslyAt: "Facebook",
      linkedInUrl: "https://www.linkedin.com/",
      photo:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=480&h=480&q=80",
    },
    {
      name: "Priya Nair",
      designation: "Senior Product Manager",
      company: "Flipkart",
      previouslyAt: "Amazon India",
      linkedInUrl: "https://www.linkedin.com/",
      photo:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=480&h=480&q=80",
    },
    {
      name: "Arjun Mehta",
      designation: "Engineering Lead · Payments",
      company: "CRED",
      previouslyAt: "Paytm",
      linkedInUrl: "https://www.linkedin.com/",
      photo:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=480&h=480&q=80",
    },
    {
      name: "Sneha Reddy",
      designation: "Data Science Manager",
      company: "Amazon India",
      previouslyAt: "Microsoft",
      linkedInUrl: "https://www.linkedin.com/",
      photo:
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=480&h=480&q=80",
    },
    {
      name: "Kavya Iyer",
      designation: "Head of Growth Marketing",
      company: "Nykaa",
      previouslyAt: "Unilever",
      linkedInUrl: "https://www.linkedin.com/",
      photo:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=480&h=480&q=80",
    },
    {
      name: "Rohan Kapoor",
      designation: "Cloud Solutions Architect",
      company: "Google India",
      previouslyAt: "IBM",
      linkedInUrl: "https://www.linkedin.com/",
      photo:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=480&h=480&q=80",
    },
    {
      name: "Anita Desai",
      designation: "Director · Digital Consulting",
      company: "TCS",
      previouslyAt: "Infosys",
      linkedInUrl: "https://www.linkedin.com/",
      photo:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=480&h=480&q=80",
    },
    {
      name: "Vikram Singh",
      designation: "Category Lead · Fashion",
      company: "Myntra",
      previouslyAt: "Flipkart",
      linkedInUrl: "https://www.linkedin.com/",
      photo:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=480&h=480&q=80",
    },
    {
      name: "Meera Joshi",
      designation: "Strategy Partner",
      company: "Deloitte",
      previouslyAt: "KPMG",
      linkedInUrl: "https://www.linkedin.com/",
      photo:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=480&h=480&q=80",
    },
    {
      name: "Kabir Malhotra",
      designation: "VP · Business Analytics",
      company: "Swiggy",
      previouslyAt: "Zomato",
      linkedInUrl: "https://www.linkedin.com/",
      photo:
        "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=480&h=480&q=80",
    },
    {
      name: "Divya Krishnan",
      designation: "Lead UX Researcher",
      company: "Razorpay",
      previouslyAt: "Freshworks",
      linkedInUrl: "https://www.linkedin.com/",
      photo:
        "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=480&h=480&q=80",
    },
    {
      name: "Imran Sheikh",
      designation: "Senior AI Product Manager",
      company: "PhonePe",
      previouslyAt: "Google India",
      linkedInUrl: "https://www.linkedin.com/",
      photo:
        "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=480&h=480&q=80",
    },
    {
      name: "Neha Banerjee",
      designation: "Marketing Analytics Lead",
      company: "Zomato",
      previouslyAt: "Swiggy",
      linkedInUrl: "https://www.linkedin.com/",
      photo:
        "https://images.unsplash.com/photo-1594744803329-e58b31de8df5?auto=format&fit=crop&w=480&h=480&q=80",
    },
  ],
  certifications: ["MSME", "Skill India", "BFSI", "ISO 9001:2015", "FICCI"],
  studentStories: {
    eyebrow: "Student stories",
    title: "Real results. Real people.",
    items: [
      {
        name: "Rahul Sharma",
        initials: "RS",
        avatarClass: "bg-rose-500",
        role: "BBA Graduate — Now: Analyst @ FinPe",
        rating: 5,
        quote:
          "AI Career Launchpad gave me the tools I never learned in college. Got hired at FinPe within 2 months of completing the program.",
      },
      {
        name: "Anjali Kulkarni",
        initials: "AK",
        avatarClass: "bg-teal-500",
        role: "Commerce Graduate — Placed @ Delhivery",
        rating: 5,
        quote:
          "The live sessions and mentor network made all the difference. I went from confused to confident in 12 weeks.",
      },
      {
        name: "Priya Menon",
        initials: "PM",
        avatarClass: "bg-amber-500",
        role: "B.Com — Referral Agent + Analyst",
        rating: 4.5,
        quote:
          `Best investment of ${STANDARD_PRICE_LABEL} I ever made. The referral program paid for my next month's rent!`,
      },
      {
        name: "Vikram Reddy",
        initials: "VR",
        avatarClass: "bg-indigo-500",
        role: "Engineering Grad — Data Analyst @ Swiggy",
        rating: 5,
        quote:
          "I came in knowing only basic Excel. By Week 8 I was building Power BI dashboards that impressed my interviewers. The capstone project became my portfolio centerpiece.",
      },
      {
        name: "Sneha Patil",
        initials: "SP",
        avatarClass: "bg-fuchsia-500",
        role: "Career Switcher — Marketing → Analytics",
        rating: 4.5,
        quote:
          "Switching careers at 28 felt impossible until this program. The Saturday-only schedule meant I could keep my job while upskilling. Worth every rupee.",
      },
      {
        name: "Mohammed Irfan",
        initials: "MI",
        avatarClass: "bg-emerald-500",
        role: "B.Sc Graduate — Now: BI Associate @ Zomato",
        rating: 5,
        quote:
          "The mentors actually work at companies I dreamed about. Their feedback on my mock interviews is the reason I cracked my first job offer.",
      },
    ],
  },
  certificationsSection: {
    title: "5 Government-Backed Certifications",
    subtitle: "Recognised by India's top organisations — every HR knows these logos.",
    badges: [
      { name: "MSME", icon: "🏛️" },
      { name: "Skill India", icon: "🇮🇳" },
      { name: "BFSI", icon: "🏦" },
      { name: "ISO 9001:2015", icon: "🔵" },
      { name: "FICCI", icon: "📋" },
    ],
  },
  faq: {
    eyebrow: "FAQ",
    title: "Questions students ask before enrolling",
    subtitle: "Straight answers about the program, pricing, and what happens after you join.",
    items: [
      {
        question: "Who is AI Career Launchpad built for?",
        answer:
          "It's designed for final-year students, recent graduates, and career switchers — especially from Tier II & III colleges. You don't need any coding background or prior AI exposure; we begin with workplace fundamentals and work our way up to real industry tools.",
      },
      {
        question: "What is the class schedule?",
        answer:
          "Classes are held live every Saturday from 2:00 – 4:00 PM IST. Missed a session? Recordings go up on the UniConnect app within 24 hours, and your access stays active for a full 12 months.",
      },
      {
        question: "How much does the program cost?",
        answer:
          `Enrollment is ${STANDARD_PRICE_LABEL} for the full program, with payments handled securely via Razorpay.`,
      },
      {
        question: "What is the refund policy?",
        answer:
          "We offer a 30-day, no-questions-asked refund. If the classes, structure, or mentors aren't for you, just request a full refund within 30 days of payment — no explanation required. Beyond that window, enrollment is non-refundable except where the law requires otherwise.",
      },
      {
        question: "Are the certifications government recognised?",
        answer:
          "Yes — your credentials are aligned with MSME, Skill India, BFSI sector standards, ISO 9001:2015 quality frameworks, and FICCI industry recognition. These are the very same logos employers will see on your completion kit.",
      },
      {
        question: "What career support do I get?",
        answer:
          "You'll get AI-powered resume and LinkedIn optimisation, mock interviews, capstone reviews, and access to our alumni network. UniConnect also partners with 100+ companies and startups to discover and back skilled talent. We provide the tools and guidance — your results ultimately depend on your effort, location, and cohort.",
      },
      {
        question: "What do I need to get started?",
        answer:
          "Just headphones, a laptop, and the commitment to show up for Saturday classes (1–3 hours at most). A genuine interest in the course and finishing every assignment and project is essential. To unlock your certification and job recommendations, make sure you submit all your files to assignment@uniconnect.app.",
      },
    ],
  },
  phases: [
    {
      phase: "Phase 1",
      weeks: "Weeks 1–4",
      theme: "AI & Data Foundations",
      items: ["ChatGPT, Claude & Gemini", "Prompt engineering workflows", "Excel, Python & SQL fundamentals"],
    },
    {
      phase: "Phase 2",
      weeks: "Weeks 5–8",
      theme: "Analytics & Applied AI",
      items: ["Power BI executive dashboards", "Visual storytelling with Canva", "No-code automation & industry case studies"],
    },
    {
      phase: "Phase 3",
      weeks: "Weeks 9–12",
      theme: "Career Launch",
      items: ["ATS resume & personal branding", "Interview mastery & GD drills", "Capstone portfolio & job-readiness"],
    },
  ],
  schedule: {
    live: "Saturdays · 2:00 – 4:00 PM IST",
    note: "Recordings within 24 hours on the UniConnect app",
  },
  referral: {
    perReferral: "₹500",
    milestones: [
      { count: 50, reward: "Internship certificate" },
      { count: 100, reward: "Latest iPhone" },
      { count: 500, reward: "₹5,00,000 bonus" },
    ],
  },
  legal: {
    refund: "30-day no-questions-asked refund · Secure payments · No hidden charges",
  },
} as const;
