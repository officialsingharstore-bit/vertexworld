"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Briefcase, 
  MessageSquare, 
  Wallet, 
  Settings, 
  LogOut,
  Bell,
  Search,
  User,
  Plus
} from "lucide-react";
import NotificationDropdown from "./NotificationDropdown";
import { Button } from "@/components/ui/button";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import IncomingCallOverlay from "../chat/IncomingCallOverlay";

export default function DashboardLayout({
  children,
  navItems,
  userRole = "Freelancer",
}: {
  children: React.ReactNode;
  navItems: { name: string; icon: React.ReactNode; href: string }[];
  userRole?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, userData } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/auth/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background flex text-foreground font-sans relative">
      <IncomingCallOverlay user={user} />
      
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[60] lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        ${isSidebarOpen ? "w-72" : "w-24"} 
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        bg-card border-r border-border transition-all duration-500 flex flex-col 
        fixed lg:static inset-y-0 left-0 z-[70] lg:z-50 m-0 lg:m-4 
        rounded-none lg:rounded-[2.5rem] shadow-2xl overflow-hidden
      `}>
        <div className="p-8 flex items-center justify-between lg:justify-start gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center font-bold text-primary-foreground text-2xl shrink-0 shadow-lg shadow-primary/20">
              V
            </div>
            {isSidebarOpen && <span className="text-2xl font-black text-foreground tracking-tighter uppercase italic">VerteX</span>}
          </div>
          <button 
            className="lg:hidden p-2 text-muted-foreground hover:text-foreground"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-3 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-4 px-5 py-4 rounded-[1.5rem] transition-all duration-300 ${
                  isActive 
                  ? "bg-primary text-primary-foreground shadow-xl shadow-primary/10" 
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="shrink-0">{item.icon}</span>
                {isSidebarOpen && <span className="text-sm font-bold uppercase tracking-wide">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 mt-auto border-t border-border">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-4 px-5 py-4 w-full rounded-[1.5rem] hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all duration-300"
          >
            <LogOut className="shrink-0" />
            {isSidebarOpen && <span className="text-sm font-bold uppercase tracking-wide">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 p-2 lg:p-4 w-full">
        {/* Header */}
        <header className="h-20 lg:h-24 bg-card/40 backdrop-blur-3xl border border-border rounded-3xl lg:rounded-[2.5rem] px-4 lg:px-10 flex items-center justify-between sticky top-2 lg:top-4 z-40 shadow-xl">
          <div className="flex items-center gap-4 lg:gap-6 max-w-md w-full">
            <button 
              className="lg:hidden p-2 text-muted-foreground hover:text-foreground bg-muted/50 rounded-xl"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="relative w-full hidden sm:block">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input 
                    type="text" 
                    placeholder="Search operations..." 
                    className="w-full h-11 lg:h-12 bg-background/50 border border-border rounded-2xl pl-12 pr-6 text-sm focus:outline-none focus:border-primary/50 transition-all font-medium"
                />
            </div>
          </div>

          <div className="flex items-center gap-4 lg:gap-8">
            <div className="hidden xs:block">
              <ThemeToggle />
            </div>
            <NotificationDropdown />
            <div className="h-10 w-px bg-border hidden sm:block"></div>
            <div className="flex items-center gap-3 lg:gap-4 cursor-pointer group">
                <div className="text-right hidden sm:block">
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{userRole} Node</p>
                    <p className="text-sm font-bold text-foreground">
                        ${userData?.balance?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || "0.00"}
                    </p>
                </div>
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-muted rounded-full border-2 border-border flex items-center justify-center text-primary font-black group-hover:border-primary transition-all duration-300 overflow-hidden uppercase italic text-xs lg:text-base">
                    {userData?.fullName?.charAt(0) || user?.email?.charAt(0) || "U"}
                </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto bg-background/50 rounded-3xl lg:rounded-[3rem] mt-4 border border-border/50 w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
