"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  ShieldCheck, 
  Users, 
  Briefcase, 
  CreditCard, 
  BarChart4, 
  Settings,
  Menu,
  X,
  Bell,
  Search
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navItems = [
    { name: "Overview", icon: <BarChart4 />, href: "/admin" },
    { name: "Users", icon: <Users />, href: "/admin/users" },
    { name: "Gigs", icon: <Briefcase />, href: "/admin/gigs" },
    { name: "Payments", icon: <CreditCard />, href: "/admin/payments" },
    { name: "Settings", icon: <Settings />, href: "/admin/settings" },
  ];

  return (
    <div className="min-h-screen bg-[#050914] text-muted-foreground font-sans">
      {/* Admin Sidebar */}
      <aside className={`fixed top-0 left-0 bottom-0 ${isSidebarOpen ? "w-64" : "w-20"} bg-[#0a0f1d] border-r border-border transition-all duration-300 z-50`}>
        <div className="p-6 flex items-center gap-3 border-b border-border/50">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center font-black text-foreground text-xl">A</div>
            {isSidebarOpen && <span className="text-xl font-black text-foreground tracking-tighter italic">ADMIN</span>}
        </div>

        <nav className="p-4 space-y-2 mt-6">
            {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                    <Link 
                        key={item.href} 
                        href={item.href}
                        className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                            isActive ? "bg-primary text-primary-foreground shadow-xl shadow-primary/20" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                    >
                        {item.icon}
                        {isSidebarOpen && <span className="font-bold text-sm">{item.name}</span>}
                    </Link>
                );
            })}
        </nav>
      </aside>

      {/* Main Area */}
      <div className={`${isSidebarOpen ? "pl-64" : "pl-20"} transition-all duration-300`}>
        <header className="h-20 bg-[#0a0f1d]/80 backdrop-blur-xl border-b border-border flex items-center justify-between px-8 sticky top-0 z-40">
            <div className="flex items-center gap-4">
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-muted rounded-lg transition-all text-muted-foreground">
                    {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
                <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input className="bg-background border border-border rounded-xl pl-10 pr-4 py-2 text-xs w-64 focus:outline-none focus:border-primary/50" placeholder="Search anything..." />
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">
                    <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest">System Online</span>
                </div>
                <Bell className="w-5 h-5 text-muted-foreground cursor-pointer" />
                <div className="w-10 h-10 bg-muted rounded-full border border-slate-700 flex items-center justify-center font-bold text-foreground text-xs">AD</div>
            </div>
        </header>

        <main className="p-8">
            {children}
        </main>
      </div>
    </div>
  );
}
