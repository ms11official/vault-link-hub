import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  FolderOpen, Briefcase, Home, ShoppingCart, FileText, Check, Search,
  GraduationCap, Plane, Utensils, Gamepad2, Music, Film, Book, Trophy,
  Camera, Share2, BarChart3, Building2, Heart, Scale, Calculator, Users,
  Monitor, Headphones, DollarSign, Car, Shield, Landmark, Bitcoin, LineChart,
  FlaskConical, PenTool, Palette, Shirt, Sparkles, Dumbbell, Brain, Baby,
  HandHeart, Target, Languages, Puzzle, Library, Bell, FileCheck, Contact,
  Network, UserCheck, Stethoscope, Wrench, Leaf, Dog, Receipt, Gift,
  CalendarDays, MapPin, Clipboard, Archive, Clock, Star, Lightbulb, Megaphone
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Template {
  id: string;
  name: string;
  icon: any;
  description: string;
  category: string;
  categories: {
    name: string;
    icon: string;
    subCategories?: string[];
  }[];
}

const templates: Template[] = [
  // Work & Business
  {
    id: "work",
    name: "Work Organization",
    icon: Briefcase,
    category: "Business",
    description: "Organize your work-related items",
    categories: [
      { name: "Projects", icon: "FolderOpen", subCategories: ["Active", "Completed", "On Hold", "Planning"] },
      { name: "Meetings", icon: "Calendar", subCategories: ["Scheduled", "Notes", "Action Items", "Recurring"] },
      { name: "Tasks", icon: "CheckSquare", subCategories: ["Today", "This Week", "Backlog", "Done"] }
    ]
  },
  {
    id: "startup",
    name: "Startup Management",
    icon: Lightbulb,
    category: "Business",
    description: "Manage your startup operations",
    categories: [
      { name: "Product", icon: "Package", subCategories: ["Features", "Roadmap", "Bugs", "Feedback"] },
      { name: "Team", icon: "Users", subCategories: ["Members", "Roles", "Hiring", "Performance"] },
      { name: "Funding", icon: "DollarSign", subCategories: ["Investors", "Pitch Decks", "Financials", "Grants"] }
    ]
  },
  {
    id: "freelance",
    name: "Freelance Business",
    icon: UserCheck,
    category: "Business",
    description: "Manage freelance work and clients",
    categories: [
      { name: "Clients", icon: "Users", subCategories: ["Active", "Prospective", "Past", "Referrals"] },
      { name: "Projects", icon: "Briefcase", subCategories: ["In Progress", "Completed", "Proposals"] },
      { name: "Invoices", icon: "Receipt", subCategories: ["Pending", "Paid", "Overdue", "Templates"] }
    ]
  },
  {
    id: "marketing",
    name: "Marketing Hub",
    icon: Megaphone,
    category: "Business",
    description: "Organize marketing campaigns and content",
    categories: [
      { name: "Campaigns", icon: "Target", subCategories: ["Active", "Planned", "Completed", "Ideas"] },
      { name: "Content", icon: "FileText", subCategories: ["Blog Posts", "Social Media", "Videos", "Graphics"] },
      { name: "Analytics", icon: "BarChart3", subCategories: ["Reports", "KPIs", "Insights", "Competitors"] }
    ]
  },
  {
    id: "sales",
    name: "Sales Pipeline",
    icon: BarChart3,
    category: "Business",
    description: "Track sales leads and deals",
    categories: [
      { name: "Leads", icon: "UserPlus", subCategories: ["New", "Contacted", "Qualified", "Lost"] },
      { name: "Deals", icon: "Handshake", subCategories: ["Negotiation", "Proposal", "Closed Won", "Closed Lost"] },
      { name: "Customers", icon: "Users", subCategories: ["Active", "At Risk", "Churned", "VIP"] }
    ]
  },
  {
    id: "hr",
    name: "HR Management",
    icon: Users,
    category: "Business",
    description: "Human resources organization",
    categories: [
      { name: "Employees", icon: "Users", subCategories: ["Active", "Onboarding", "Offboarding", "Alumni"] },
      { name: "Recruitment", icon: "UserPlus", subCategories: ["Open Positions", "Applicants", "Interviews", "Offers"] },
      { name: "Policies", icon: "FileText", subCategories: ["Handbook", "Benefits", "Leave", "Compliance"] }
    ]
  },
  {
    id: "customer-support",
    name: "Customer Support",
    icon: Headphones,
    category: "Business",
    description: "Manage customer inquiries and support",
    categories: [
      { name: "Tickets", icon: "MessageSquare", subCategories: ["Open", "In Progress", "Resolved", "Escalated"] },
      { name: "Knowledge Base", icon: "Book", subCategories: ["FAQs", "Tutorials", "Troubleshooting", "Updates"] },
      { name: "Feedback", icon: "MessageCircle", subCategories: ["Reviews", "Suggestions", "Complaints", "Praise"] }
    ]
  },
  {
    id: "ecommerce",
    name: "E-Commerce Store",
    icon: ShoppingCart,
    category: "Business",
    description: "Manage online store operations",
    categories: [
      { name: "Products", icon: "Package", subCategories: ["Active", "Draft", "Archive", "Out of Stock"] },
      { name: "Orders", icon: "ShoppingBag", subCategories: ["Pending", "Processing", "Shipped", "Delivered"] },
      { name: "Inventory", icon: "Warehouse", subCategories: ["In Stock", "Low Stock", "Reorder", "Suppliers"] }
    ]
  },
  {
    id: "real-estate",
    name: "Real Estate",
    icon: Building2,
    category: "Business",
    description: "Manage properties and listings",
    categories: [
      { name: "Properties", icon: "Home", subCategories: ["For Sale", "For Rent", "Sold", "Off Market"] },
      { name: "Clients", icon: "Users", subCategories: ["Buyers", "Sellers", "Renters", "Investors"] },
      { name: "Documents", icon: "FileText", subCategories: ["Contracts", "Deeds", "Inspections", "Appraisals"] }
    ]
  },
  {
    id: "consulting",
    name: "Consulting Practice",
    icon: Clipboard,
    category: "Business",
    description: "Manage consulting engagements",
    categories: [
      { name: "Engagements", icon: "Briefcase", subCategories: ["Active", "Completed", "Proposals", "Pipeline"] },
      { name: "Deliverables", icon: "FileCheck", subCategories: ["Reports", "Presentations", "Frameworks", "Templates"] },
      { name: "Expertise", icon: "Award", subCategories: ["Case Studies", "Methodologies", "Research", "Publications"] }
    ]
  },

  // Personal Life
  {
    id: "personal",
    name: "Personal Life",
    icon: Home,
    category: "Personal",
    description: "Manage your personal activities",
    categories: [
      { name: "Health", icon: "Heart", subCategories: ["Medical", "Fitness", "Nutrition", "Mental Health"] },
      { name: "Finance", icon: "DollarSign", subCategories: ["Bills", "Investments", "Budgets", "Savings"] },
      { name: "Goals", icon: "Target", subCategories: ["Short Term", "Long Term", "Completed", "Ideas"] }
    ]
  },
  {
    id: "home-management",
    name: "Home Management",
    icon: Home,
    category: "Personal",
    description: "Organize household tasks and maintenance",
    categories: [
      { name: "Maintenance", icon: "Wrench", subCategories: ["Scheduled", "Repairs", "Improvements", "History"] },
      { name: "Appliances", icon: "Tv", subCategories: ["Warranties", "Manuals", "Service Records", "Replacements"] },
      { name: "Utilities", icon: "Zap", subCategories: ["Electric", "Water", "Gas", "Internet"] }
    ]
  },
  {
    id: "family",
    name: "Family Organization",
    icon: Users,
    category: "Personal",
    description: "Manage family activities and schedules",
    categories: [
      { name: "Calendar", icon: "Calendar", subCategories: ["Events", "Appointments", "Birthdays", "Holidays"] },
      { name: "Kids", icon: "Baby", subCategories: ["School", "Activities", "Health", "Milestones"] },
      { name: "Memories", icon: "Camera", subCategories: ["Photos", "Videos", "Stories", "Traditions"] }
    ]
  },
  {
    id: "relationships",
    name: "Relationships",
    icon: HandHeart,
    category: "Personal",
    description: "Nurture personal relationships",
    categories: [
      { name: "Family", icon: "Users", subCategories: ["Immediate", "Extended", "In-Laws", "Contact Info"] },
      { name: "Friends", icon: "Heart", subCategories: ["Close Friends", "Acquaintances", "Old Friends", "New Friends"] },
      { name: "Special Dates", icon: "Calendar", subCategories: ["Birthdays", "Anniversaries", "Holidays", "Reminders"] }
    ]
  },
  {
    id: "self-improvement",
    name: "Self Improvement",
    icon: Target,
    category: "Personal",
    description: "Track personal growth and development",
    categories: [
      { name: "Habits", icon: "CheckCircle", subCategories: ["Daily", "Weekly", "Monthly", "Tracking"] },
      { name: "Learning", icon: "Book", subCategories: ["Courses", "Books", "Skills", "Certifications"] },
      { name: "Reflection", icon: "PenTool", subCategories: ["Journal", "Goals Review", "Gratitude", "Lessons"] }
    ]
  },

  // Finance
  {
    id: "personal-finance",
    name: "Personal Finance",
    icon: DollarSign,
    category: "Finance",
    description: "Manage personal finances comprehensively",
    categories: [
      { name: "Income", icon: "TrendingUp", subCategories: ["Salary", "Side Income", "Investments", "Other"] },
      { name: "Expenses", icon: "TrendingDown", subCategories: ["Fixed", "Variable", "Subscriptions", "One-time"] },
      { name: "Savings", icon: "PiggyBank", subCategories: ["Emergency Fund", "Goals", "Retirement", "Kids"] }
    ]
  },
  {
    id: "investments",
    name: "Investment Portfolio",
    icon: LineChart,
    category: "Finance",
    description: "Track and manage investments",
    categories: [
      { name: "Stocks", icon: "TrendingUp", subCategories: ["Holdings", "Watchlist", "Dividends", "Analysis"] },
      { name: "Mutual Funds", icon: "PieChart", subCategories: ["Equity", "Debt", "Hybrid", "Index"] },
      { name: "Other Assets", icon: "Gem", subCategories: ["Real Estate", "Gold", "Bonds", "Alternatives"] }
    ]
  },
  {
    id: "crypto",
    name: "Crypto Portfolio",
    icon: Bitcoin,
    category: "Finance",
    description: "Manage cryptocurrency investments",
    categories: [
      { name: "Holdings", icon: "Wallet", subCategories: ["Bitcoin", "Ethereum", "Altcoins", "Stablecoins"] },
      { name: "Wallets", icon: "Key", subCategories: ["Hot Wallets", "Cold Storage", "Exchange", "DeFi"] },
      { name: "Tracking", icon: "LineChart", subCategories: ["Transactions", "P&L", "Tax Records", "Research"] }
    ]
  },
  {
    id: "banking",
    name: "Banking & Accounts",
    icon: Landmark,
    category: "Finance",
    description: "Organize banking information",
    categories: [
      { name: "Accounts", icon: "CreditCard", subCategories: ["Savings", "Checking", "Fixed Deposits", "Credit Cards"] },
      { name: "Loans", icon: "FileText", subCategories: ["Home Loan", "Car Loan", "Personal", "Education"] },
      { name: "Documents", icon: "File", subCategories: ["Statements", "Tax Forms", "Agreements", "KYC"] }
    ]
  },
  {
    id: "insurance",
    name: "Insurance Management",
    icon: Shield,
    category: "Finance",
    description: "Track insurance policies",
    categories: [
      { name: "Health", icon: "Heart", subCategories: ["Individual", "Family", "Claims", "Documents"] },
      { name: "Life", icon: "Shield", subCategories: ["Term", "Whole Life", "ULIP", "Nominations"] },
      { name: "General", icon: "Car", subCategories: ["Vehicle", "Home", "Travel", "Gadgets"] }
    ]
  },
  {
    id: "taxes",
    name: "Tax Planning",
    icon: Calculator,
    category: "Finance",
    description: "Organize tax documents and planning",
    categories: [
      { name: "Documents", icon: "FileText", subCategories: ["Income Proofs", "Deductions", "Forms", "Returns"] },
      { name: "Deductions", icon: "Receipt", subCategories: ["80C", "80D", "HRA", "Other"] },
      { name: "Planning", icon: "Target", subCategories: ["Current Year", "Projections", "Strategies", "Consultations"] }
    ]
  },

  // Education
  {
    id: "student",
    name: "Student Life",
    icon: GraduationCap,
    category: "Education",
    description: "Organize academic life",
    categories: [
      { name: "Courses", icon: "Book", subCategories: ["Current", "Completed", "Planned", "Electives"] },
      { name: "Assignments", icon: "FileText", subCategories: ["Pending", "Submitted", "Graded", "Late"] },
      { name: "Exams", icon: "ClipboardCheck", subCategories: ["Upcoming", "Study Materials", "Past Papers", "Results"] }
    ]
  },
  {
    id: "research",
    name: "Research Project",
    icon: FlaskConical,
    category: "Education",
    description: "Manage research and academic work",
    categories: [
      { name: "Literature", icon: "Book", subCategories: ["Papers", "Books", "Articles", "Reviews"] },
      { name: "Data", icon: "Database", subCategories: ["Raw Data", "Processed", "Analysis", "Visualizations"] },
      { name: "Writing", icon: "PenTool", subCategories: ["Drafts", "Revisions", "Final", "Publications"] }
    ]
  },
  {
    id: "online-learning",
    name: "Online Learning",
    icon: Monitor,
    category: "Education",
    description: "Track online courses and certifications",
    categories: [
      { name: "Courses", icon: "PlayCircle", subCategories: ["In Progress", "Completed", "Wishlist", "Certificates"] },
      { name: "Platforms", icon: "Globe", subCategories: ["Coursera", "Udemy", "LinkedIn", "Others"] },
      { name: "Notes", icon: "FileText", subCategories: ["By Course", "By Topic", "Summaries", "Key Takeaways"] }
    ]
  },
  {
    id: "language-learning",
    name: "Language Learning",
    icon: Languages,
    category: "Education",
    description: "Track language learning progress",
    categories: [
      { name: "Vocabulary", icon: "Book", subCategories: ["New Words", "Reviewed", "Mastered", "Difficult"] },
      { name: "Grammar", icon: "FileText", subCategories: ["Rules", "Exercises", "Mistakes", "Examples"] },
      { name: "Practice", icon: "MessageCircle", subCategories: ["Speaking", "Writing", "Reading", "Listening"] }
    ]
  },
  {
    id: "teaching",
    name: "Teaching Resources",
    icon: GraduationCap,
    category: "Education",
    description: "Organize teaching materials",
    categories: [
      { name: "Lesson Plans", icon: "FileText", subCategories: ["By Subject", "By Grade", "Templates", "Archive"] },
      { name: "Resources", icon: "FolderOpen", subCategories: ["Worksheets", "Presentations", "Videos", "Activities"] },
      { name: "Students", icon: "Users", subCategories: ["Roster", "Grades", "Feedback", "Parent Contact"] }
    ]
  },

  // Health & Wellness
  {
    id: "fitness",
    name: "Fitness Tracker",
    icon: Dumbbell,
    category: "Health",
    description: "Track workouts and fitness goals",
    categories: [
      { name: "Workouts", icon: "Activity", subCategories: ["Strength", "Cardio", "Flexibility", "Recovery"] },
      { name: "Progress", icon: "TrendingUp", subCategories: ["Measurements", "Photos", "PRs", "Milestones"] },
      { name: "Programs", icon: "Calendar", subCategories: ["Current", "Completed", "Planned", "Custom"] }
    ]
  },
  {
    id: "nutrition",
    name: "Nutrition Planner",
    icon: Utensils,
    category: "Health",
    description: "Plan and track nutrition",
    categories: [
      { name: "Meal Plans", icon: "Calendar", subCategories: ["Weekly", "Monthly", "Special Diet", "Templates"] },
      { name: "Recipes", icon: "ChefHat", subCategories: ["Breakfast", "Lunch", "Dinner", "Snacks"] },
      { name: "Shopping", icon: "ShoppingCart", subCategories: ["Grocery List", "Pantry", "Favorites", "Meal Prep"] }
    ]
  },
  {
    id: "mental-health",
    name: "Mental Wellness",
    icon: Brain,
    category: "Health",
    description: "Track mental health and wellness",
    categories: [
      { name: "Mood", icon: "Smile", subCategories: ["Daily Log", "Triggers", "Patterns", "Insights"] },
      { name: "Practices", icon: "Heart", subCategories: ["Meditation", "Breathing", "Journaling", "Therapy"] },
      { name: "Resources", icon: "Book", subCategories: ["Articles", "Apps", "Contacts", "Emergency"] }
    ]
  },
  {
    id: "medical-records",
    name: "Medical Records",
    icon: Stethoscope,
    category: "Health",
    description: "Organize medical information",
    categories: [
      { name: "Records", icon: "FileText", subCategories: ["History", "Test Results", "Prescriptions", "Vaccinations"] },
      { name: "Appointments", icon: "Calendar", subCategories: ["Upcoming", "Past", "Reminders", "Notes"] },
      { name: "Providers", icon: "Users", subCategories: ["Doctors", "Specialists", "Hospitals", "Pharmacies"] }
    ]
  },

  // Creative & Hobbies
  {
    id: "photography",
    name: "Photography",
    icon: Camera,
    category: "Creative",
    description: "Organize photography work",
    categories: [
      { name: "Portfolio", icon: "Image", subCategories: ["Best Work", "Projects", "Series", "Prints"] },
      { name: "Equipment", icon: "Camera", subCategories: ["Cameras", "Lenses", "Accessories", "Wishlist"] },
      { name: "Editing", icon: "Sliders", subCategories: ["Presets", "Tutorials", "Before/After", "Workflow"] }
    ]
  },
  {
    id: "music",
    name: "Music Collection",
    icon: Music,
    category: "Creative",
    description: "Organize music and playlists",
    categories: [
      { name: "Library", icon: "Library", subCategories: ["Albums", "Artists", "Genres", "Decades"] },
      { name: "Playlists", icon: "ListMusic", subCategories: ["Mood", "Activity", "Favorites", "Discover"] },
      { name: "Learning", icon: "Music2", subCategories: ["Instruments", "Theory", "Practice", "Songs to Learn"] }
    ]
  },
  {
    id: "art",
    name: "Art & Design",
    icon: Palette,
    category: "Creative",
    description: "Manage art projects and inspiration",
    categories: [
      { name: "Projects", icon: "Brush", subCategories: ["In Progress", "Completed", "Ideas", "Commissions"] },
      { name: "Inspiration", icon: "Sparkles", subCategories: ["References", "Color Palettes", "Styles", "Artists"] },
      { name: "Supplies", icon: "Package", subCategories: ["Inventory", "Wishlist", "Brands", "Reviews"] }
    ]
  },
  {
    id: "writing",
    name: "Writing Projects",
    icon: PenTool,
    category: "Creative",
    description: "Organize writing and content",
    categories: [
      { name: "Projects", icon: "FileText", subCategories: ["Novels", "Short Stories", "Articles", "Poetry"] },
      { name: "Characters", icon: "Users", subCategories: ["Main", "Supporting", "Antagonists", "Development"] },
      { name: "World Building", icon: "Globe", subCategories: ["Settings", "History", "Rules", "Maps"] }
    ]
  },
  {
    id: "gaming",
    name: "Gaming Library",
    icon: Gamepad2,
    category: "Creative",
    description: "Track games and achievements",
    categories: [
      { name: "Games", icon: "Gamepad", subCategories: ["Playing", "Completed", "Backlog", "Wishlist"] },
      { name: "Platforms", icon: "Monitor", subCategories: ["PC", "PlayStation", "Xbox", "Nintendo"] },
      { name: "Progress", icon: "Trophy", subCategories: ["Achievements", "Stats", "Screenshots", "Reviews"] }
    ]
  },
  {
    id: "crafts",
    name: "Crafts & DIY",
    icon: Puzzle,
    category: "Creative",
    description: "Organize craft projects",
    categories: [
      { name: "Projects", icon: "Scissors", subCategories: ["In Progress", "Completed", "Ideas", "Tutorials"] },
      { name: "Supplies", icon: "Package", subCategories: ["Inventory", "Shopping List", "Organization", "Storage"] },
      { name: "Patterns", icon: "Grid", subCategories: ["Knitting", "Sewing", "Woodworking", "Paper Crafts"] }
    ]
  },

  // Travel & Lifestyle
  {
    id: "travel",
    name: "Travel Planning",
    icon: Plane,
    category: "Travel",
    description: "Plan and organize trips",
    categories: [
      { name: "Trips", icon: "Map", subCategories: ["Upcoming", "Past", "Dream Destinations", "Road Trips"] },
      { name: "Bookings", icon: "Ticket", subCategories: ["Flights", "Hotels", "Activities", "Transportation"] },
      { name: "Packing", icon: "Briefcase", subCategories: ["Checklists", "Essentials", "By Trip Type", "Gear"] }
    ]
  },
  {
    id: "recipes",
    name: "Recipe Collection",
    icon: Utensils,
    category: "Lifestyle",
    description: "Organize recipes and cooking",
    categories: [
      { name: "By Meal", icon: "UtensilsCrossed", subCategories: ["Breakfast", "Lunch", "Dinner", "Desserts"] },
      { name: "By Cuisine", icon: "Globe", subCategories: ["Italian", "Indian", "Mexican", "Asian"] },
      { name: "Special", icon: "Star", subCategories: ["Family Favorites", "Quick Meals", "Healthy", "Party"] }
    ]
  },
  {
    id: "fashion",
    name: "Wardrobe Manager",
    icon: Shirt,
    category: "Lifestyle",
    description: "Organize clothing and outfits",
    categories: [
      { name: "Closet", icon: "Shirt", subCategories: ["Tops", "Bottoms", "Outerwear", "Accessories"] },
      { name: "Outfits", icon: "Sparkles", subCategories: ["Work", "Casual", "Formal", "Seasonal"] },
      { name: "Shopping", icon: "ShoppingBag", subCategories: ["Wishlist", "Purchased", "Returns", "Budget"] }
    ]
  },
  {
    id: "beauty",
    name: "Beauty & Skincare",
    icon: Sparkles,
    category: "Lifestyle",
    description: "Track beauty routines and products",
    categories: [
      { name: "Routines", icon: "Clock", subCategories: ["Morning", "Evening", "Weekly", "Monthly"] },
      { name: "Products", icon: "Package", subCategories: ["Skincare", "Makeup", "Haircare", "Tools"] },
      { name: "Reviews", icon: "Star", subCategories: ["Favorites", "Testing", "Empties", "Repurchase"] }
    ]
  },
  {
    id: "pet-care",
    name: "Pet Care",
    icon: Dog,
    category: "Lifestyle",
    description: "Manage pet information and care",
    categories: [
      { name: "Health", icon: "Heart", subCategories: ["Vet Visits", "Vaccinations", "Medications", "Weight"] },
      { name: "Care", icon: "Home", subCategories: ["Feeding", "Grooming", "Training", "Exercise"] },
      { name: "Info", icon: "FileText", subCategories: ["Documents", "Insurance", "Emergency", "Favorites"] }
    ]
  },
  {
    id: "gardening",
    name: "Garden Planner",
    icon: Leaf,
    category: "Lifestyle",
    description: "Plan and track garden activities",
    categories: [
      { name: "Plants", icon: "Flower", subCategories: ["Indoor", "Outdoor", "Vegetables", "Herbs"] },
      { name: "Tasks", icon: "CheckSquare", subCategories: ["Watering", "Fertilizing", "Pruning", "Harvesting"] },
      { name: "Planning", icon: "Map", subCategories: ["Layout", "Seasonal", "Companion", "Wishlist"] }
    ]
  },
  {
    id: "vehicles",
    name: "Vehicle Management",
    icon: Car,
    category: "Lifestyle",
    description: "Track vehicle maintenance and expenses",
    categories: [
      { name: "Maintenance", icon: "Wrench", subCategories: ["Scheduled", "Repairs", "History", "DIY"] },
      { name: "Documents", icon: "FileText", subCategories: ["Registration", "Insurance", "Warranty", "Manuals"] },
      { name: "Expenses", icon: "DollarSign", subCategories: ["Fuel", "Service", "Parts", "Upgrades"] }
    ]
  },

  // Entertainment
  {
    id: "movies",
    name: "Movie Collection",
    icon: Film,
    category: "Entertainment",
    description: "Track movies and watchlist",
    categories: [
      { name: "Watchlist", icon: "List", subCategories: ["To Watch", "Watching", "Completed", "Favorites"] },
      { name: "By Genre", icon: "Film", subCategories: ["Action", "Comedy", "Drama", "Sci-Fi"] },
      { name: "Reviews", icon: "Star", subCategories: ["My Ratings", "Notes", "Recommendations", "Series"] }
    ]
  },
  {
    id: "books",
    name: "Book Library",
    icon: Book,
    category: "Entertainment",
    description: "Organize reading list",
    categories: [
      { name: "Reading", icon: "BookOpen", subCategories: ["Currently Reading", "To Read", "Finished", "DNF"] },
      { name: "By Genre", icon: "Library", subCategories: ["Fiction", "Non-Fiction", "Self-Help", "Technical"] },
      { name: "Notes", icon: "PenTool", subCategories: ["Highlights", "Summaries", "Reviews", "Quotes"] }
    ]
  },
  {
    id: "podcasts",
    name: "Podcast Tracker",
    icon: Headphones,
    category: "Entertainment",
    description: "Track podcasts and episodes",
    categories: [
      { name: "Shows", icon: "Radio", subCategories: ["Subscribed", "Favorites", "Discover", "Archive"] },
      { name: "Episodes", icon: "PlayCircle", subCategories: ["Queue", "In Progress", "Completed", "Saved"] },
      { name: "Notes", icon: "FileText", subCategories: ["Takeaways", "Guests", "Resources", "Ideas"] }
    ]
  },
  {
    id: "sports",
    name: "Sports Tracker",
    icon: Trophy,
    category: "Entertainment",
    description: "Follow sports and teams",
    categories: [
      { name: "Teams", icon: "Users", subCategories: ["Favorites", "Leagues", "Schedules", "Stats"] },
      { name: "Events", icon: "Calendar", subCategories: ["Upcoming", "Results", "Tickets", "Watch Parties"] },
      { name: "Fantasy", icon: "Trophy", subCategories: ["Teams", "Standings", "Trades", "Research"] }
    ]
  },

  // Events & Planning
  {
    id: "events",
    name: "Event Planning",
    icon: CalendarDays,
    category: "Events",
    description: "Plan and organize events",
    categories: [
      { name: "Events", icon: "Calendar", subCategories: ["Upcoming", "Past", "Ideas", "Templates"] },
      { name: "Guests", icon: "Users", subCategories: ["Invited", "Confirmed", "Declined", "Contact List"] },
      { name: "Tasks", icon: "CheckSquare", subCategories: ["To Do", "In Progress", "Completed", "Delegated"] }
    ]
  },
  {
    id: "wedding",
    name: "Wedding Planner",
    icon: Heart,
    category: "Events",
    description: "Plan your perfect wedding",
    categories: [
      { name: "Planning", icon: "Clipboard", subCategories: ["Timeline", "Budget", "Checklist", "Ideas"] },
      { name: "Vendors", icon: "Store", subCategories: ["Venue", "Catering", "Photography", "Entertainment"] },
      { name: "Guests", icon: "Users", subCategories: ["Guest List", "RSVPs", "Seating", "Registry"] }
    ]
  },
  {
    id: "party",
    name: "Party Planner",
    icon: Gift,
    category: "Events",
    description: "Plan parties and celebrations",
    categories: [
      { name: "Details", icon: "Clipboard", subCategories: ["Theme", "Venue", "Date & Time", "Budget"] },
      { name: "Guests", icon: "Users", subCategories: ["Invitations", "RSVPs", "Dietary", "Plus Ones"] },
      { name: "Supplies", icon: "ShoppingCart", subCategories: ["Decorations", "Food & Drinks", "Games", "Favors"] }
    ]
  },

  // Documents & Legal
  {
    id: "documents",
    name: "Document Vault",
    icon: FileText,
    category: "Documents",
    description: "Organize important documents",
    categories: [
      { name: "Legal", icon: "Scale", subCategories: ["Contracts", "Agreements", "Certificates", "Wills"] },
      { name: "Personal", icon: "User", subCategories: ["ID Documents", "Education", "Employment", "Medical"] },
      { name: "Property", icon: "Home", subCategories: ["Deeds", "Leases", "Insurance", "Tax Records"] }
    ]
  },
  {
    id: "legal",
    name: "Legal Matters",
    icon: Scale,
    category: "Documents",
    description: "Track legal documents and cases",
    categories: [
      { name: "Documents", icon: "FileText", subCategories: ["Contracts", "Agreements", "Filings", "Correspondence"] },
      { name: "Cases", icon: "Briefcase", subCategories: ["Active", "Closed", "Appeals", "Research"] },
      { name: "Contacts", icon: "Users", subCategories: ["Lawyers", "Courts", "Notaries", "Witnesses"] }
    ]
  },
  {
    id: "warranties",
    name: "Warranty Tracker",
    icon: FileCheck,
    category: "Documents",
    description: "Track product warranties",
    categories: [
      { name: "Active", icon: "Shield", subCategories: ["Electronics", "Appliances", "Furniture", "Vehicles"] },
      { name: "Documents", icon: "FileText", subCategories: ["Receipts", "Manuals", "Registration", "Claims"] },
      { name: "Expiring", icon: "Clock", subCategories: ["This Month", "This Quarter", "This Year", "Expired"] }
    ]
  },

  // Social & Networking
  {
    id: "social-media",
    name: "Social Media",
    icon: Share2,
    category: "Social",
    description: "Manage social media presence",
    categories: [
      { name: "Content", icon: "FileText", subCategories: ["Ideas", "Drafts", "Scheduled", "Published"] },
      { name: "Platforms", icon: "Globe", subCategories: ["Instagram", "Twitter", "LinkedIn", "TikTok"] },
      { name: "Analytics", icon: "BarChart3", subCategories: ["Growth", "Engagement", "Best Posts", "Insights"] }
    ]
  },
  {
    id: "networking",
    name: "Professional Network",
    icon: Network,
    category: "Social",
    description: "Manage professional connections",
    categories: [
      { name: "Contacts", icon: "Users", subCategories: ["Industry", "Mentors", "Peers", "Potential"] },
      { name: "Events", icon: "Calendar", subCategories: ["Conferences", "Meetups", "Webinars", "Coffee Chats"] },
      { name: "Follow-ups", icon: "MessageSquare", subCategories: ["Pending", "Completed", "Scheduled", "Ideas"] }
    ]
  },
  {
    id: "contacts",
    name: "Contact Manager",
    icon: Contact,
    category: "Social",
    description: "Organize all your contacts",
    categories: [
      { name: "Personal", icon: "Heart", subCategories: ["Family", "Friends", "Neighbors", "Others"] },
      { name: "Professional", icon: "Briefcase", subCategories: ["Colleagues", "Clients", "Vendors", "Partners"] },
      { name: "Services", icon: "Wrench", subCategories: ["Medical", "Legal", "Financial", "Home Services"] }
    ]
  },

  // Collections
  {
    id: "collections",
    name: "Collections Manager",
    icon: Library,
    category: "Collections",
    description: "Track various collections",
    categories: [
      { name: "Items", icon: "Package", subCategories: ["Owned", "Wishlist", "For Sale", "Traded"] },
      { name: "Catalog", icon: "List", subCategories: ["By Type", "By Value", "By Condition", "By Date"] },
      { name: "Community", icon: "Users", subCategories: ["Collectors", "Events", "Resources", "Marketplace"] }
    ]
  },
  {
    id: "subscriptions",
    name: "Subscriptions",
    icon: Bell,
    category: "Collections",
    description: "Track all subscriptions",
    categories: [
      { name: "Active", icon: "CheckCircle", subCategories: ["Streaming", "Software", "Memberships", "Boxes"] },
      { name: "Billing", icon: "CreditCard", subCategories: ["Monthly", "Annual", "Free Trials", "Cancelled"] },
      { name: "Review", icon: "Star", subCategories: ["Keep", "Consider Cancel", "Upgrade", "Downgrade"] }
    ]
  },
  {
    id: "gift-ideas",
    name: "Gift Ideas",
    icon: Gift,
    category: "Collections",
    description: "Track gift ideas for everyone",
    categories: [
      { name: "By Person", icon: "Users", subCategories: ["Family", "Friends", "Colleagues", "Kids"] },
      { name: "By Occasion", icon: "Calendar", subCategories: ["Birthday", "Holiday", "Anniversary", "Thank You"] },
      { name: "Status", icon: "CheckSquare", subCategories: ["Ideas", "Purchased", "Wrapped", "Given"] }
    ]
  },

  // Productivity
  {
    id: "gtd",
    name: "GTD System",
    icon: Clipboard,
    category: "Productivity",
    description: "Getting Things Done methodology",
    categories: [
      { name: "Inbox", icon: "Inbox", subCategories: ["Capture", "Clarify", "Organize", "Process"] },
      { name: "Actions", icon: "Zap", subCategories: ["Next Actions", "Waiting For", "Someday", "Reference"] },
      { name: "Projects", icon: "FolderOpen", subCategories: ["Active", "On Hold", "Completed", "Review"] }
    ]
  },
  {
    id: "meetings",
    name: "Meeting Notes",
    icon: Users,
    category: "Productivity",
    description: "Organize meeting notes and actions",
    categories: [
      { name: "Notes", icon: "FileText", subCategories: ["1:1s", "Team", "Client", "All Hands"] },
      { name: "Actions", icon: "CheckSquare", subCategories: ["My Actions", "Delegated", "Follow-ups", "Completed"] },
      { name: "Templates", icon: "Copy", subCategories: ["Agendas", "Minutes", "Retrospectives", "Stand-ups"] }
    ]
  },
  {
    id: "goals",
    name: "Goal Tracker",
    icon: Target,
    category: "Productivity",
    description: "Track and achieve your goals",
    categories: [
      { name: "Goals", icon: "Target", subCategories: ["This Year", "This Quarter", "This Month", "Long Term"] },
      { name: "Progress", icon: "TrendingUp", subCategories: ["On Track", "At Risk", "Completed", "Abandoned"] },
      { name: "Review", icon: "Calendar", subCategories: ["Weekly", "Monthly", "Quarterly", "Annual"] }
    ]
  },
  {
    id: "time-management",
    name: "Time Management",
    icon: Clock,
    category: "Productivity",
    description: "Track and optimize your time",
    categories: [
      { name: "Time Blocks", icon: "Clock", subCategories: ["Deep Work", "Meetings", "Admin", "Break"] },
      { name: "Tracking", icon: "Activity", subCategories: ["Daily", "Weekly", "By Project", "Analysis"] },
      { name: "Optimization", icon: "Zap", subCategories: ["Automation", "Delegation", "Elimination", "Templates"] }
    ]
  }
];

const categoryFilters = ["All", "Business", "Personal", "Finance", "Education", "Health", "Creative", "Travel", "Lifestyle", "Entertainment", "Events", "Documents", "Social", "Collections", "Productivity"];

interface CategoryTemplatesDialogProps {
  onSuccess: () => void;
}

const CategoryTemplatesDialog = ({ onSuccess }: CategoryTemplatesDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const { toast } = useToast();

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === "All" || template.category === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const createFromTemplate = async (template: Template) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in",
          variant: "destructive",
        });
        return;
      }

      // Create each category and its sub-categories
      for (const category of template.categories) {
        const { data: parentCategory, error: categoryError } = await supabase
          .from("categories")
          .insert({
            user_id: user.id,
            name: category.name,
            icon: category.icon,
          })
          .select()
          .single();

        if (categoryError) throw categoryError;

        // Create sub-categories if they exist
        if (category.subCategories && parentCategory) {
          for (const subCategoryName of category.subCategories) {
            const { error: subCategoryError } = await supabase
              .from("categories")
              .insert({
                user_id: user.id,
                name: subCategoryName,
                icon: "FolderOpen",
                parent_category_id: parentCategory.id,
              });

            if (subCategoryError) throw subCategoryError;
          }
        }
      }

      toast({
        title: "Success",
        description: `${template.name} template created with ${template.categories.length} folders and all sub-folders`,
      });

      setOpen(false);
      setSelectedTemplate(null);
      setSearchQuery("");
      setActiveFilter("All");
      onSuccess();
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to create template",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedTemplateData = templates.find((t) => t.id === selectedTemplate);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FolderOpen className="mr-2 h-4 w-4" />
          Use Template
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Category Templates ({templates.length}+ Templates)</DialogTitle>
          <DialogDescription>
            Select a template to instantly create organized folders with sub-folders
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Filters */}
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-2 pb-2">
              {categoryFilters.map((filter) => (
                <Badge
                  key={filter}
                  variant={activeFilter === filter ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/10 transition-colors"
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter}
                </Badge>
              ))}
            </div>
          </ScrollArea>

          {/* Templates Grid */}
          <ScrollArea className="h-[400px] pr-4">
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {filteredTemplates.map((template) => {
                const Icon = template.icon;
                const isSelected = selectedTemplate === template.id;
                return (
                  <Card
                    key={template.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      isSelected ? "ring-2 ring-primary bg-primary/5" : ""
                    }`}
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-sm">
                        <Icon className="h-4 w-4 text-primary" />
                        {template.name}
                        {isSelected && <Check className="h-4 w-4 ml-auto text-primary" />}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-xs text-muted-foreground mb-2">
                        {template.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {template.categories.slice(0, 3).map((cat, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {cat.name}
                          </Badge>
                        ))}
                        {template.categories.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{template.categories.length - 3}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            {filteredTemplates.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No templates found matching your search.
              </div>
            )}
          </ScrollArea>

          {/* Selected Template Preview */}
          {selectedTemplateData && (
            <Card className="bg-muted/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Archive className="h-4 w-4" />
                  Template Preview: {selectedTemplateData.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                  {selectedTemplateData.categories.map((cat, idx) => (
                    <div key={idx} className="bg-background rounded-md p-2 text-sm">
                      <div className="font-medium flex items-center gap-1 mb-1">
                        <FolderOpen className="h-3 w-3 text-primary" />
                        {cat.name}
                      </div>
                      {cat.subCategories && (
                        <div className="pl-4 space-y-0.5">
                          {cat.subCategories.map((sub, subIdx) => (
                            <div key={subIdx} className="text-xs text-muted-foreground flex items-center gap-1">
                              <FolderOpen className="h-2.5 w-2.5" />
                              {sub}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex justify-between items-center mt-4">
          <p className="text-sm text-muted-foreground">
            {filteredTemplates.length} templates available
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedTemplateData) createFromTemplate(selectedTemplateData);
              }}
              disabled={!selectedTemplate || loading}
            >
              {loading ? "Creating..." : "Create Template"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryTemplatesDialog;
