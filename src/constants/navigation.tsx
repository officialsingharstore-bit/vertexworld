import { 
  LayoutDashboard, 
  Briefcase, 
  MessageSquare, 
  Wallet, 
  Bell,
  Search,
  PlusSquare,
  FileText,
  Settings
} from "lucide-react";

export const FREELANCER_NAV = [
  { name: "Overview", icon: <LayoutDashboard className="w-5 h-5" />, href: "/dashboard/freelancer" },
  { name: "Portfolio", icon: <Briefcase className="w-5 h-5" />, href: "/dashboard/freelancer/portfolio" },
  { name: "Services (Gigs)", icon: <PlusSquare className="w-5 h-5" />, href: "/dashboard/freelancer/gigs" },
  { name: "Active Orders", icon: <Bell className="w-5 h-5" />, href: "/dashboard/freelancer/orders" },
  { name: "Messages", icon: <MessageSquare className="w-5 h-5" />, href: "/dashboard/freelancer/messages" },
  { name: "Earnings", icon: <Wallet className="w-5 h-5" />, href: "/dashboard/freelancer/earnings" },
  { name: "Profile Settings", icon: <FileText className="w-5 h-5" />, href: "/dashboard/freelancer/profile" },
];

export const BUYER_NAV = [
  { name: "Overview", icon: <LayoutDashboard className="w-5 h-5" />, href: "/dashboard/buyer" },
  { name: "Post a Job", icon: <PlusSquare className="w-5 h-5" />, href: "/dashboard/buyer/jobs/create" },
  { name: "My Jobs", icon: <Briefcase className="w-5 h-5" />, href: "/dashboard/buyer/projects" },
  { name: "Proposals", icon: <FileText className="w-5 h-5" />, href: "/dashboard/buyer/proposals" },
  { name: "Messages", icon: <MessageSquare className="w-5 h-5" />, href: "/dashboard/buyer/messages" },
  { name: "Wallet", icon: <Wallet className="w-5 h-5" />, href: "/dashboard/buyer/wallet" },
  { name: "Account Settings", icon: <FileText className="w-5 h-5" />, href: "/dashboard/buyer/profile" },
];
