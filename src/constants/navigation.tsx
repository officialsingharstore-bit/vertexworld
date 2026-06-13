import { 
  LayoutDashboard, 
  Briefcase, 
  MessageSquare, 
  Wallet, 
  Bell,
  Search,
  PlusSquare,
  FileText,
  UserGear
} from "lucide-react";

export const FREELANCER_NAV = [
  { name: "Overview", icon: <LayoutDashboard />, href: "/dashboard/freelancer" },
  { name: "My Gigs", icon: <PlusSquare />, href: "/dashboard/freelancer/gigs" },
  { name: "Active Orders", icon: <Bell />, href: "/dashboard/freelancer/orders" },
  { name: "Messages", icon: <MessageSquare />, href: "/dashboard/freelancer/messages" },
  { name: "Earnings", icon: <Wallet />, href: "/dashboard/freelancer/earnings" },
  { name: "Profile Settings", icon: <FileText />, href: "/dashboard/freelancer/profile" },
];

export const BUYER_NAV = [
  { name: "Overview", icon: <LayoutDashboard />, href: "/dashboard/buyer" },
  { name: "Post a Job", icon: <PlusSquare />, href: "/dashboard/buyer/jobs/create" },
  { name: "My Projects", icon: <Briefcase />, href: "/dashboard/buyer/projects" },
  { name: "Proposals", icon: <FileText />, href: "/dashboard/buyer/proposals" },
  { name: "Messages", icon: <MessageSquare />, href: "/dashboard/buyer/messages" },
  { name: "Wallet", icon: <Wallet />, href: "/dashboard/buyer/wallet" },
  { name: "Account Settings", icon: <FileText />, href: "/dashboard/buyer/profile" },
];
