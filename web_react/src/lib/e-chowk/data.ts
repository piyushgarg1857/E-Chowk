export type Role = "worker" | "employer" | "admin";
export type JobStatus = "draft" | "open" | "assigned" | "in_progress" | "completed" | "cancelled";
export interface User {
  id: string;
  role: Role;
  full_name: string;
  phone_number: string;
  skill_category: string;
  current_location: string;
  daily_wage: number;
  is_available: boolean;
  rating: number;
  source: "voice" | "app" | "web" | "whatsapp";
  experience: number;
  distance: number;
}
export interface Job {
  id: string;
  employer_id: string;
  required_skill: string;
  title: string;
  description: string;
  location: string;
  offered_wage: number;
  duration_days: number;
  starts_at: string;
  status: JobStatus;
  employer: string;
  distance: number;
}
export interface JobApplication {
  id: string;
  job_id: string;
  worker_id: string;
  status: "pending" | "accepted" | "rejected" | "completed";
  created_at: string;
}
export interface Notification {
  id: string;
  title: string;
  body: string;
  type: "job" | "application" | "voice" | "payment" | "rating";
  read: boolean;
  time: string;
}
export interface Payment {
  id: string;
  job_id: string;
  amount: number;
  status: "recorded" | "pending";
  method: string;
  date: string;
}
export interface Rating {
  id: string;
  job_id: string;
  score: number;
  comment: string;
}
export interface AuditEvent {
  id: string;
  intent: string;
  tool: string;
  validation: string;
  result: string;
  time: string;
}
export interface AgentConversation {
  id: string;
  role: "user" | "assistant";
  parts: { type: "text"; text: string }[];
  tool?: string;
}
export const skills = [
  "Plumber",
  "Electrician",
  "Carpenter",
  "Painter",
  "Mason",
  "Driver",
  "Helper",
];
export const hindiSkills: Record<string, string> = {
  Plumber: "प्लंबर",
  Electrician: "इलेक्ट्रीशियन",
  Carpenter: "बढ़ई",
  Painter: "पेंटर",
  Mason: "राजमिस्त्री",
  Driver: "ड्राइवर",
  Helper: "सहायक",
};
export const users: User[] = [
  {
    id: "w1",
    role: "worker",
    full_name: "Ramesh Kumar",
    phone_number: "9876543210",
    skill_category: "Plumber",
    current_location: "Mansarovar, Jaipur",
    daily_wage: 800,
    is_available: true,
    rating: 4.8,
    source: "voice",
    experience: 8,
    distance: 2.1,
  },
  {
    id: "w2",
    role: "worker",
    full_name: "Suresh Sharma",
    phone_number: "9829123456",
    skill_category: "Electrician",
    current_location: "Vaishali Nagar, Jaipur",
    daily_wage: 900,
    is_available: true,
    rating: 4.9,
    source: "app",
    experience: 10,
    distance: 3.2,
  },
  {
    id: "w3",
    role: "worker",
    full_name: "Mohan Lal",
    phone_number: "9829123457",
    skill_category: "Carpenter",
    current_location: "Malviya Nagar, Jaipur",
    daily_wage: 850,
    is_available: true,
    rating: 4.7,
    source: "voice",
    experience: 12,
    distance: 4.5,
  },
  {
    id: "w4",
    role: "worker",
    full_name: "Sunita Devi",
    phone_number: "9829123458",
    skill_category: "Painter",
    current_location: "Jagatpura, Jaipur",
    daily_wage: 700,
    is_available: true,
    rating: 4.9,
    source: "web",
    experience: 6,
    distance: 5.8,
  },
  {
    id: "w5",
    role: "worker",
    full_name: "Raju Meena",
    phone_number: "9829123459",
    skill_category: "Mason",
    current_location: "Sanganer, Jaipur",
    daily_wage: 750,
    is_available: false,
    rating: 4.6,
    source: "app",
    experience: 9,
    distance: 6.2,
  },
  {
    id: "w6",
    role: "worker",
    full_name: "Anil Singh",
    phone_number: "9829123460",
    skill_category: "Driver",
    current_location: "Civil Lines, Jaipur",
    daily_wage: 650,
    is_available: true,
    rating: 4.8,
    source: "voice",
    experience: 7,
    distance: 3.7,
  },
  {
    id: "e1",
    role: "employer",
    full_name: "Vikram Singh",
    phone_number: "9829012345",
    skill_category: "Homeowner",
    current_location: "Mansarovar, Jaipur",
    daily_wage: 0,
    is_available: true,
    rating: 4.9,
    source: "web",
    experience: 0,
    distance: 0,
  },
];
export const jobs: Job[] = [
  {
    id: "j1",
    employer_id: "e1",
    required_skill: "Plumber",
    title: "Bathroom fitting & pipe repair",
    description:
      "We need an experienced plumber to install bathroom fittings and repair a leaking kitchen pipe. All materials will be provided. Lunch and tea included.",
    location: "Mansarovar, Jaipur",
    offered_wage: 900,
    duration_days: 2,
    starts_at: "2026-10-08T09:00",
    status: "open",
    employer: "Vikram Singh",
    distance: 2.1,
  },
  {
    id: "j2",
    employer_id: "e2",
    required_skill: "Electrician",
    title: "Home wiring & switch installation",
    description:
      "Install new switches and inspect wiring in a two-bedroom home. Tools required; materials provided.",
    location: "Vaishali Nagar, Jaipur",
    offered_wage: 1000,
    duration_days: 3,
    starts_at: "2026-10-09T09:00",
    status: "open",
    employer: "Priya Sharma",
    distance: 3.4,
  },
  {
    id: "j3",
    employer_id: "e3",
    required_skill: "Painter",
    title: "Paint a 2-bedroom apartment",
    description:
      "Interior wall painting for a vacant apartment. Paint and supplies provided. Looking for careful finishing.",
    location: "Jagatpura, Jaipur",
    offered_wage: 800,
    duration_days: 5,
    starts_at: "2026-10-10T08:30",
    status: "open",
    employer: "Arun Gupta",
    distance: 5.2,
  },
  {
    id: "j4",
    employer_id: "e1",
    required_skill: "Carpenter",
    title: "Kitchen cabinet installation",
    description:
      "Install ready-made kitchen cabinets and adjust hinges. Please bring your own tools.",
    location: "Malviya Nagar, Jaipur",
    offered_wage: 950,
    duration_days: 2,
    starts_at: "2026-10-09T10:00",
    status: "open",
    employer: "Vikram Singh",
    distance: 4.1,
  },
  {
    id: "j5",
    employer_id: "e1",
    required_skill: "Plumber",
    title: "Water tank connection",
    description: "Connect rooftop water tank and check pressure. Materials provided.",
    location: "Mansarovar, Jaipur",
    offered_wage: 850,
    duration_days: 1,
    starts_at: "2026-10-07T09:00",
    status: "in_progress",
    employer: "Vikram Singh",
    distance: 1.5,
  },
  {
    id: "j6",
    employer_id: "e4",
    required_skill: "Plumber",
    title: "Kitchen sink & tap installation",
    description: "Installed sink, taps, and drainage connection.",
    location: "Civil Lines, Jaipur",
    offered_wage: 800,
    duration_days: 2,
    starts_at: "2026-10-04T09:00",
    status: "completed",
    employer: "Neha Jain",
    distance: 3.8,
  },
  {
    id: "j7",
    employer_id: "e5",
    required_skill: "Plumber",
    title: "Bathroom maintenance",
    description: "Repaired pipe leakage and replaced shower fittings.",
    location: "Sanganer, Jaipur",
    offered_wage: 900,
    duration_days: 1,
    starts_at: "2026-10-01T09:00",
    status: "completed",
    employer: "Amit Bansal",
    distance: 6.0,
  },
  {
    id: "j8",
    employer_id: "e1",
    required_skill: "Helper",
    title: "Help with a home renovation",
    description:
      "Assist with moving materials and cleaning the renovation site. No prior experience required.",
    location: "Mansarovar, Jaipur",
    offered_wage: 550,
    duration_days: 4,
    starts_at: "2026-10-09T08:00",
    status: "open",
    employer: "Vikram Singh",
    distance: 2.8,
  },
];
export const applications: JobApplication[] = [
  { id: "a1", job_id: "j2", worker_id: "w1", status: "pending", created_at: "2026-10-06" },
  { id: "a2", job_id: "j5", worker_id: "w1", status: "accepted", created_at: "2026-10-05" },
  { id: "a3", job_id: "j1", worker_id: "w2", status: "pending", created_at: "2026-10-07" },
  { id: "a4", job_id: "j6", worker_id: "w1", status: "completed", created_at: "2026-10-03" },
  { id: "a5", job_id: "j7", worker_id: "w1", status: "completed", created_at: "2026-09-30" },
];
export const notifications: Notification[] = [
  {
    id: "n1",
    title: "A plumbing job near you",
    body: "Bathroom fitting in Mansarovar · ₹900/day · 2.1 km away.",
    type: "job",
    read: false,
    time: "5 min ago",
  },
  {
    id: "n2",
    title: "Your application is being reviewed",
    body: "Priya Sharma is reviewing your application for Home wiring.",
    type: "application",
    read: false,
    time: "25 min ago",
  },
  {
    id: "n3",
    title: "Vikram accepted your application",
    body: "Water tank connection starts today at 9:00 AM.",
    type: "application",
    read: false,
    time: "1 hour ago",
  },
  {
    id: "n4",
    title: "Voice profile updated",
    body: "Your Jaipur location and plumber skill have been saved in this demo.",
    type: "voice",
    read: true,
    time: "Yesterday",
  },
  {
    id: "n5",
    title: "₹1,600 recorded in your khata",
    body: "Kitchen sink & tap installation · cash payment record, not a transfer.",
    type: "payment",
    read: true,
    time: "2 days ago",
  },
  {
    id: "n6",
    title: "A 5-star thank you from Neha",
    body: "“Punctual, helpful, and excellent work. Would hire again.”",
    type: "rating",
    read: true,
    time: "2 days ago",
  },
];
export const payments: Payment[] = [
  {
    id: "p1",
    job_id: "j6",
    amount: 1600,
    status: "recorded",
    method: "Cash · sample record",
    date: "5 Oct 2026",
  },
  {
    id: "p2",
    job_id: "j7",
    amount: 900,
    status: "recorded",
    method: "UPI · sample record",
    date: "1 Oct 2026",
  },
];
export const ratings: Rating[] = [
  { id: "r1", job_id: "j6", score: 5, comment: "Punctual, helpful, and excellent work." },
  { id: "r2", job_id: "j7", score: 4.8, comment: "Professional and thorough. Thank you!" },
];
export const auditEvents: AuditEvent[] = [
  {
    id: "ev1",
    intent: "find_job",
    tool: "search_jobs",
    validation: "Worker role · location permitted",
    result: "3 sample jobs returned",
    time: "12:14:32",
  },
  {
    id: "ev2",
    intent: "apply_job",
    tool: "create_application",
    validation: "User confirmation · job open · no duplicate",
    result: "Application created (mock)",
    time: "12:13:08",
  },
  {
    id: "ev3",
    intent: "update_profile",
    tool: "update_worker",
    validation: "Own profile only",
    result: "Availability updated (mock)",
    time: "12:10:21",
  },
];
export const rupees = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
export const dateLabel = (value: string) =>
  new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
export const pageHead = (title: string, description: string) => ({
  meta: [
    { title: `${title} — E-Chowk | ई-चौक` },
    { name: "description", content: description },
    { property: "og:title", content: `${title} — E-Chowk` },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ],
});