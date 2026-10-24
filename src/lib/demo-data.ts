/**
 * SafeBank demo data — realistic but fictional South African figures.
 * All amounts in ZAR. Labelled as simulated data throughout the UI.
 */

export const EXPENSE_CATEGORIES = [
  "Rent",
  "Food",
  "Transport",
  "Electricity",
  "Airtime & Data",
  "Education",
  "Healthcare",
  "Debt",
  "Family Support",
  "Other",
] as const;

export const INCOME_SOURCES = [
  "Salary",
  "Freelance",
  "Small business",
  "Student allowance",
  "Side hustle",
  "Other",
] as const;

export const GOAL_CATEGORIES = [
  "Emergency Fund",
  "Education",
  "Rent",
  "Transport",
  "Business Equipment",
  "Personal Savings",
] as const;

export const SAFETY_EXPENSE_ITEMS = [
  "Transport",
  "Temporary accommodation",
  "Food",
  "Phone & data",
  "Medication",
  "Childcare",
  "Essential documents",
  "Other necessities",
] as const;

export type Income = {
  id: string;
  source: string;
  amount: number;
  date: string; // ISO yyyy-mm-dd
  note?: string | undefined;
};

export type Expense = {
  id: string;
  category: string;
  amount: number;
  date: string;
  note?: string | undefined;
};

export type Goal = {
  id: string;
  name: string;
  category: string;
  target: number;
  saved: number;
  targetDate?: string | undefined;
};

export type Debt = {
  id: string;
  name: string;
  balance: number;
  rate: number; // annual %
  monthlyPayment: number;
};

export type Contact = { id: string; name: string; relation: string };

export const DEMO_USER = { name: "Thando Mokoena", email: "thando.demo@safebank.co.za" };

// Fixed demo months (Aug–Oct 2026) so seeded charts stay stable.
const month = (m: number, day: number) =>
  `2026-${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

export const seedIncome: Income[] = [
  { id: "i1", source: "Salary", amount: 7200, date: month(8, 1), note: "Retail salary" },
  {
    id: "i2",
    source: "Side hustle",
    amount: 1850,
    date: month(8, 16),
    note: "Weekend market stall",
  },
  { id: "i3", source: "Salary", amount: 7200, date: month(9, 1), note: "Retail salary" },
  { id: "i4", source: "Freelance", amount: 2600, date: month(9, 12), note: "Logo design job" },
  { id: "i5", source: "Salary", amount: 7200, date: month(10, 1), note: "Retail salary" },
  { id: "i6", source: "Side hustle", amount: 1400, date: month(10, 9), note: "Hair braiding" },
];

export const seedExpenses: Expense[] = [
  { id: "e1", category: "Rent", amount: 3200, date: month(8, 2) },
  { id: "e2", category: "Food", amount: 1980, date: month(8, 8) },
  { id: "e3", category: "Transport", amount: 640, date: month(8, 10) },
  { id: "e4", category: "Airtime & Data", amount: 320, date: month(8, 14) },
  { id: "e5", category: "Electricity", amount: 480, date: month(8, 20) },
  { id: "e6", category: "Rent", amount: 3200, date: month(9, 2) },
  { id: "e7", category: "Food", amount: 1740, date: month(9, 7) },
  { id: "e8", category: "Transport", amount: 755, date: month(9, 11) },
  { id: "e9", category: "Debt", amount: 690, date: month(9, 15), note: "Store account" },
  { id: "e10", category: "Electricity", amount: 510, date: month(9, 22) },
  { id: "e11", category: "Rent", amount: 3200, date: month(10, 2) },
  { id: "e12", category: "Food", amount: 1520, date: month(10, 5) },
  { id: "e13", category: "Transport", amount: 890, date: month(10, 6), note: "Taxi fare top-ups" },
  { id: "e14", category: "Airtime & Data", amount: 295, date: month(10, 8) },
  { id: "e15", category: "Healthcare", amount: 450, date: month(10, 12), note: "Clinic fees" },
];

export const seedGoals: Goal[] = [
  {
    id: "g1",
    name: "Emergency Fund",
    category: "Emergency Fund",
    target: 6000,
    saved: 3600,
    targetDate: "2026-12-31",
  },
  {
    id: "g2",
    name: "Sewing machine",
    category: "Business Equipment",
    target: 3500,
    saved: 1150,
    targetDate: "2027-01-31",
  },
  {
    id: "g3",
    name: "Next semester books",
    category: "Education",
    target: 2000,
    saved: 1650,
    targetDate: "2026-11-30",
  },
  {
    id: "g4",
    name: "December travel home",
    category: "Transport",
    target: 2400,
    saved: 620,
    targetDate: "2026-12-15",
  },
];

export const seedDebts: Debt[] = [
  { id: "d1", name: "Clothing store account", balance: 4200, rate: 21, monthlyPayment: 690 },
  { id: "d2", name: "Personal loan", balance: 8500, rate: 17.5, monthlyPayment: 850 },
];

export const seedRecoveryGoals: Goal[] = [
  {
    id: "r1",
    name: "Build a 3-month emergency fund",
    category: "Emergency Fund",
    target: 18000,
    saved: 3600,
  },
  {
    id: "r2",
    name: "Clear the clothing store account",
    category: "Personal Savings",
    target: 4200,
    saved: 1250,
  },
];

/* ---------------- ScamShield rule engine (transparent, rule-based) --------------- */

export type ScamRule = {
  id: string;
  label: string;
  weight: number;
  pattern: RegExp;
  why: string;
};

export const SCAM_RULES: ScamRule[] = [
  {
    id: "otp",
    label: "Asks for an OTP or PIN",
    weight: 35,
    pattern:
      /\b(otp|one[-\s]?time\s*(pin|password|code)|pin\s*code|verification\s*code|verify\s*(your|the)\s*(account|identity))\b/i,
    why: "No bank or legitimate service will ever ask you to share an OTP, PIN or password. Anyone who receives your OTP can move your money.",
  },
  {
    id: "password",
    label: "Asks for a password or login details",
    weight: 35,
    pattern:
      /\b(password|passcode|login\s*(details|credentials)|username\s*and\s*password|app\s*link)\b/i,
    why: "Sharing your login details gives scammers full access to your accounts.",
  },
  {
    id: "urgent",
    label: "Urgent payment demand",
    weight: 20,
    pattern:
      /\b(urgent(ly)?|immediately|right\s*now|within\s*\d+\s*(hours|minutes)|last\s*(warning|chance)|final\s*notice|act\s*now)\b/i,
    why: "Pressure and urgency are classic scam tactics — they stop you from thinking clearly or checking with someone you trust.",
  },
  {
    id: "link",
    label: "Suspicious link",
    weight: 20,
    pattern: /(https?:\/\/|www\.|\w+\.(xyz|click|top|shop|loan|money)|bit\.ly|tinyurl)/i,
    why: "Unknown links can lead to fake login pages that steal your details. Type the bank's web address yourself instead of tapping links.",
  },
  {
    id: "suspension",
    label: "Account suspension threat",
    weight: 25,
    pattern:
      /\b(account\s*(has\s*been|will\s*be|is)\s*(suspended|blocked|frozen|closed|locked)|suspend\s*your\s*account|unauthorised\s*(login|access|activity))\b/i,
    why: "Banks do not close accounts by SMS and never ask you to 'confirm' details to stop a suspension. Contact your bank using the number on your card.",
  },
  {
    id: "prize",
    label: "Prize or lottery win",
    weight: 25,
    pattern:
      /\b(congratulations|you('ve| have)?\s*(won|been\s*selected)|prize|lotto|lottery|lucky\s*draw|cash\s*giveaway|claim\s*your)\b/i,
    why: "If you never entered, you cannot win. A 'fee' to release a prize is always a scam.",
  },
  {
    id: "bank",
    label: "Bank impersonation language",
    weight: 20,
    pattern:
      /\b(fnb|first\s*national\s*bank|capitec|absa|standard\s*bank|nedbank|african\s*bank|tymebank|discover\s*bank|sassa)\b.{0,40}\b(confirm|verify|update|reactivate|blocked|payment)\b/is,
    why: "Scammers imitate real bank names. Verify by calling the official number printed on your bank card — never a number in the message.",
  },
  {
    id: "refund",
    label: "Unexpected refund or payout",
    weight: 15,
    pattern:
      /\b(refund|reimburse|money\s*owed\s*to\s*you|unclaimed\s*funds|tax\s*refund|sassa\s*(grant|payout)\s*(update|increase))\b/i,
    why: "Unexpected 'refunds' are bait to get your banking details. Ignore and delete.",
  },
  {
    id: "job",
    label: "Too-good-to-be-true job or investment",
    weight: 20,
    pattern:
      /\b(earn\s*r\s?\d[\d\s,]*(per\s*(day|week)|a\s*day)|work\s*from\s*home|make\s*(money|r\s?\d+)\s*(fast|daily)|guaranteed\s*(profit|returns?)|double\s*your\s*money|investment\s*opportunity)\b/i,
    why: "Guaranteed high returns do not exist. If it sounds too good to be true, it is a scam.",
  },
  {
    id: "payfirst",
    label: "Pay-first request",
    weight: 25,
    pattern:
      /\b(pay|send|deposit|transfer)\s*.{0,30}\b(first|before|to\s*(release|receive|unlock|activate))\b/i,
    why: "Any request to pay money before receiving money is a red flag.",
  },
];

export type ScamResult = {
  score: number;
  level: "high" | "medium" | "low";
  detected: { rule: ScamRule; matches: string[] }[];
};

export function analyseMessage(text: string): ScamResult {
  const detected: ScamResult["detected"] = [];
  let score = 0;
  for (const rule of SCAM_RULES) {
    const matches = text.match(new RegExp(rule.pattern.source, "gi"));
    if (matches) {
      detected.push({ rule, matches: matches.slice(0, 3) });
      score += rule.weight;
    }
  }
  const level: ScamResult["level"] = score >= 50 ? "high" : score >= 20 ? "medium" : "low";
  return { score, level, detected };
}

export const SCAM_EDUCATION = [
  {
    title: "Phishing",
    body: "Fake emails or websites that copy a real bank or company to trick you into entering your details. Check the web address carefully — type it yourself instead of following links.",
    tip: "Never sign in from a link in a message. Open your browser and type the address.",
  },
  {
    title: "Smishing (SMS phishing)",
    body: "Fraudulent SMS or WhatsApp messages claiming your account is blocked, or that you have won a prize. Banks never ask for OTPs, PINs or passwords by message.",
    tip: "Call your bank using the number on the back of your card — never a number in the message.",
  },
  {
    title: "Fake banking messages",
    body: "Screenshots of fake 'payment proofs' or 'EFT notifications'. Money can appear to reflect and later be reversed.",
    tip: "Wait until the money has cleared and is truly available before delivering goods.",
  },
  {
    title: "Investment scams",
    body: "'Double your money' schemes on WhatsApp and social media. Guaranteed returns and pressure to recruit friends are warning signs.",
    tip: "Legitimate investments never guarantee profits. Check with the FSCA before investing.",
  },
  {
    title: "Job scams",
    body: "'Earn R5,000 per day from home' offers that ask for a joining fee or your banking details upfront.",
    tip: "A real employer never asks you to pay to get a job.",
  },
  {
    title: "Social engineering",
    body: "Someone builds trust — posing as a bank agent, a family member in trouble, or a romantic partner — to get money or information.",
    tip: "Verify the person through a channel you trust before sending anything.",
  },
];

export const SCAM_QUIZ = [
  {
    q: "Your 'bank' SMS asks you to confirm your OTP to stop a suspicious payment. What do you do?",
    options: [
      "Send the OTP quickly so they can block it",
      "Do nothing — real banks never ask for your OTP — and call the bank using the number on your card",
      "Reply asking if they are really the bank",
    ],
    answer: 1,
    explain:
      "Anyone with your OTP can move your money. Banks never ask for it by message or phone.",
  },
  {
    q: "A WhatsApp job ad offers R4,500 per day, but you must pay a R250 'registration fee' first. This is…",
    options: [
      "A good deal worth trying",
      "Probably legitimate if they have a logo",
      "A scam — real jobs never ask you to pay first",
    ],
    answer: 2,
    explain: "Pay-first offers are one of the most common job scams in South Africa.",
  },
  {
    q: "Which of these is the safest way to check if a message from your bank is real?",
    options: [
      "Tap the link in the message to check",
      "Call your bank using the number on your card or official app",
      "Reply to the message asking for proof",
    ],
    answer: 1,
    explain: "Always verify through an official channel you find yourself.",
  },
];

/* ---------------- MoneyWise lessons ---------------- */

export type Lesson = {
  id: string;
  title: string;
  category: string;
  minutes: number;
  sections: { heading: string; body: string }[];
  quiz: { q: string; options: string[]; answer: number; explain: string }[];
};

export const LESSON_CATEGORIES = [
  "Budgeting Basics",
  "Saving Money",
  "Understanding Credit",
  "Debt Management",
  "Financial Fraud Awareness",
  "Financial Independence",
  "Understanding Financial Abuse",
];

export const LESSONS: Lesson[] = [
  {
    id: "l1",
    title: "Budgeting on an Irregular Income",
    category: "Budgeting Basics",
    minutes: 5,
    sections: [
      {
        heading: "Start with your lowest month",
        body: "If your income changes every month, build your budget on the smallest amount you earned in the last three months. Anything extra above that becomes savings or debt payments — not spending money.",
      },
      {
        heading: "Essentials first",
        body: "List your essential expenses in order: food, transport to work, rent or accommodation, electricity. Cover these before anything else, and know exactly how much they cost each month.",
      },
      {
        heading: "Give every rand a job",
        body: "When a good month arrives, decide immediately where the extra goes: a portion to savings, a portion to debt, and a small amount for yourself. Deciding in advance stops the money from disappearing.",
      },
    ],
    quiz: [
      {
        q: "You earned R8,000, R5,500 and R6,200 over three months. What should your base budget be built on?",
        options: ["R8,000", "R6,600 (the average)", "R5,500 (the lowest)"],
        answer: 2,
        explain: "Building on your lowest month means a slow month never puts you into shortfall.",
      },
      {
        q: "In a good month, the extra money above your base budget should first go to…",
        options: [
          "Treats and celebrations",
          "Savings and debt payments you planned in advance",
          "New clothes",
        ],
        answer: 1,
        explain:
          "Deciding in advance where extra money goes is what turns a good month into a safer future.",
      },
    ],
  },
  {
    id: "l2",
    title: "Your First Emergency Fund",
    category: "Saving Money",
    minutes: 4,
    sections: [
      {
        heading: "Why R1,000 first?",
        body: "Most emergencies — a clinic visit, a tyre, a funeral contribution — cost under R1,000. A small emergency fund stops you from borrowing at high interest the next time something goes wrong.",
      },
      {
        heading: "Save small, save often",
        body: "R50 a week is R2,600 a year. Saving a small amount regularly works better than waiting to save a big amount 'someday'. Even irregular earners can save a fixed share — for example 10% — of whatever comes in.",
      },
      {
        heading: "Keep it separate",
        body: "Keep emergency savings somewhere separate from your everyday spending money so it is not spent by accident. SafeBank's SafePocket helps you track the goal — the money itself stays wherever you choose to keep it.",
      },
    ],
    quiz: [
      {
        q: "What is a good first emergency savings target?",
        options: ["R100,000", "R1,000", "Whatever is left at the end of the year"],
        answer: 1,
        explain: "R1,000 covers most day-to-day emergencies and is reachable within a few months.",
      },
      {
        q: "As an irregular earner, the most reliable way to save is…",
        options: [
          "Saving whatever is left over",
          "Saving a fixed percentage of every amount you earn",
          "Waiting for a bonus",
        ],
        answer: 1,
        explain:
          "A fixed share of every payment — even small ones — builds the habit and the fund.",
      },
    ],
  },
  {
    id: "l3",
    title: "What Credit Really Costs",
    category: "Understanding Credit",
    minutes: 5,
    sections: [
      {
        heading: "Interest is the price of borrowing",
        body: "When you borrow R1,000 at 20% interest per year and pay it back over a year, you repay about R1,110 or more depending on fees. The faster you repay, the less interest you pay.",
      },
      {
        heading: "Store accounts add up",
        body: "Store accounts often charge 20%+ interest. A R2,000 account paid with minimum monthly instalments can take years and cost far more than R2,000 in total.",
      },
      {
        heading: "Know your rights",
        body: "Under the National Credit Act, lenders must check that you can afford the loan. If a lender offers credit without checking your income, walk away — and never borrow to pay off another loan.",
      },
    ],
    quiz: [
      {
        q: "Borrowing R1,000 at 20% interest means you will repay…",
        options: [
          "Exactly R1,000",
          "More than R1,000 — interest plus possible fees",
          "Less than R1,000",
        ],
        answer: 1,
        explain: "Interest and fees are the cost of borrowing; quick repayment keeps them low.",
      },
      {
        q: "A lender offers you a loan without checking your income or expenses. This is…",
        options: [
          "Convenient — take it",
          "A warning sign — responsible lenders must check affordability",
          "Normal practice",
        ],
        answer: 1,
        explain:
          "The National Credit Act requires affordability checks. Lenders that skip them are dangerous.",
      },
    ],
  },
  {
    id: "l4",
    title: "Understanding Financial Abuse",
    category: "Understanding Financial Abuse",
    minutes: 4,
    sections: [
      {
        heading: "What it can look like",
        body: "Financial abuse is when someone controls your access to money — taking your wages or grant, stopping you from working, forcing debt into your name, or threatening you financially. It can happen to anyone, in any kind of relationship.",
      },
      {
        heading: "It is not your fault",
        body: "Economic dependence is often created gradually and deliberately. Wanting financial independence is healthy and normal, and small steps — your own account, your own savings knowledge, knowing what things cost — build towards it.",
      },
      {
        heading: "You can plan quietly",
        body: "SafeBank's Financial Safety section offers private tools: estimating essential living costs, listing trusted people, and learning what support exists. Nothing you plan there is shared or saved on your device.",
      },
    ],
    quiz: [
      {
        q: "Which of these is an example of financial abuse?",
        options: [
          "A partner and you deciding a budget together",
          "A partner taking your wages and refusing to explain what happened to the money",
          "A family member lending you money with a written agreement",
        ],
        answer: 1,
        explain:
          "Controlling or taking your money without agreement is financial control — a form of abuse.",
      },
      {
        q: "SafeBank's Financial Safety tools…",
        options: [
          "Send your plan to the authorities automatically",
          "Keep your planning private, save nothing sensitive on your device, and share nothing without your action",
          "Require you to describe your situation in detail",
        ],
        answer: 1,
        explain:
          "The tools are private by design — no disclosures required, nothing stored or shared automatically.",
      },
    ],
  },
];

/* ---------------- Support Navigator (sample listings) ---------------- */

export const SUPPORT_CATEGORIES = [
  "Financial guidance",
  "GBV support",
  "Legal assistance",
  "Counselling",
  "Employment support",
  "Skills development",
  "Community organisations",
];

export type SupportEntry = {
  id: string;
  name: string;
  category: string;
  region: string;
  contact: string;
  hours: string;
  verified: string;
};

export const SAMPLE_SUPPORT: SupportEntry[] = [
  {
    id: "s1",
    name: "Sample Community Money Advice Centre",
    category: "Financial guidance",
    region: "Johannesburg, Gauteng",
    contact: "0800 000 001 (sample)",
    hours: "Mon–Fri 08:00–16:00",
    verified: "Sample entry — not verified",
  },
  {
    id: "s2",
    name: "Sample GBV Support Command Centre",
    category: "GBV support",
    region: "National",
    contact: "0800 000 002 (sample)",
    hours: "24 hours",
    verified: "Sample entry — not verified",
  },
  {
    id: "s3",
    name: "Sample Legal Aid Advice Office",
    category: "Legal assistance",
    region: "Durban, KwaZulu-Natal",
    contact: "0800 000 003 (sample)",
    hours: "Mon–Fri 09:00–17:00",
    verified: "Sample entry — not verified",
  },
  {
    id: "s4",
    name: "Sample Counselling Helpline",
    category: "Counselling",
    region: "National",
    contact: "0800 000 004 (sample)",
    hours: "Daily 07:00–22:00",
    verified: "Sample entry — not verified",
  },
  {
    id: "s5",
    name: "Sample Youth Employment Hub",
    category: "Employment support",
    region: "Cape Town, Western Cape",
    contact: "0800 000 005 (sample)",
    hours: "Mon–Fri 08:30–16:30",
    verified: "Sample entry — not verified",
  },
  {
    id: "s6",
    name: "Sample Skills & Training College",
    category: "Skills development",
    region: "Polokwane, Limpopo",
    contact: "0800 000 006 (sample)",
    hours: "Mon–Fri 08:00–17:00",
    verified: "Sample entry — not verified",
  },
  {
    id: "s7",
    name: "Sample Community Upliftment Forum",
    category: "Community organisations",
    region: "Gqeberha, Eastern Cape",
    contact: "0800 000 007 (sample)",
    hours: "Weekdays 09:00–15:00",
    verified: "Sample entry — not verified",
  },
  {
    id: "s8",
    name: "Sample Debt Counselling Helpline",
    category: "Financial guidance",
    region: "National",
    contact: "0800 000 008 (sample)",
    hours: "Mon–Sat 08:00–18:00",
    verified: "Sample entry — not verified",
  },
];

export const RECOVERY_RESOURCES = [
  {
    title: "Free budgeting help",
    body: "Sample listing: community money advice centres help you restructure spending for free.",
  },
  {
    title: "Learn a skill",
    body: "Sample listing: local TVET colleges and skills centres offer short courses, some funded.",
  },
  {
    title: "Work readiness",
    body: "Sample listing: youth employment hubs help with CVs, interviews and job placement.",
  },
  {
    title: "Know your rights",
    body: "Sample listing: advice offices explain credit rights, garnishee orders and ccma processes.",
  },
];

/* Insights copy used on the Overview page */
export const INSIGHT_COPY = {
  transportUp: (pct: number) =>
    `You've spent ${pct}% more on transport this month than last month.`,
  savingsGoal: (pct: number) => `Your emergency savings goal is ${pct}% complete.`,
  foodReview: "Consider reviewing your food budget before adding extra savings.",
  disclaimer:
    "Insights are simple calculations based on your demo data — not predictions from an AI model.",
};
