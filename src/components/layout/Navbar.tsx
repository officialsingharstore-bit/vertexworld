"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight, LogOut, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, userData, loading } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = () => {
    signOut(auth);
  };

  const dashboardPath = userData?.role === "freelancer" ? "/dashboard/freelancer" : "/dashboard/buyer";

  return (
    <nav
      className={`fixed top-6 left-0 right-0 z-50 transition-all duration-500 flex justify-center`}
    >
      <div className={`flex items-center justify-between px-10 rounded-full border border-white/10 transition-all duration-500 shadow-2xl ${
        isScrolled ? "bg-card/70 backdrop-blur-2xl py-3 w-[90%] lg:w-[80%]" : "bg-card/30 backdrop-blur-md py-5 w-[95%] lg:w-[90%]"
      }`}>
        <Link href="/" className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center font-black text-primary-foreground text-2xl shadow-lg shadow-primary/20">
            V
          </div>
          <span className="text-2xl font-black tracking-tighter text-foreground uppercase italic hidden sm:block">
            VerteX
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-10">
          <Link
            href="/courses"
            className="text-muted-foreground hover:text-primary transition-all duration-300 text-sm font-black uppercase tracking-widest"
          >
            Courses
          </Link>
          <div className="relative group">
            <button className="text-muted-foreground group-hover:text-primary transition-all duration-300 text-sm font-black uppercase tracking-widest flex items-center gap-2">
              Store
              <svg className="w-4 h-4 group-hover:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-500 z-50">
              <div className="bg-card/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-3xl min-w-[200px]">
                {["Themes", "Plugins", "Apps", "Software"].map((cat) => (
                  <Link
                    key={cat}
                    href={`/store?category=${cat.toLowerCase()}`}
                    className="block px-4 py-3 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all mb-1 last:mb-0"
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          {["Marketplace", "Freelancers", "Projects"].map((item) => (
            <Link
              key={item}
              href={`/${item.toLowerCase().replace(" ", "-")}`}
              className="text-muted-foreground hover:text-primary transition-all duration-300 text-sm font-black uppercase tracking-widest"
            >
              {item}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-6">
          <ThemeToggle />
          {loading ? (
            <div className="w-24 h-12 bg-muted animate-pulse rounded-full" />
          ) : user ? (
            <div className="flex items-center gap-6">
              <Link 
                href={userData?.role ? dashboardPath : "/auth/role-selection"} 
                className="flex items-center gap-3 text-muted-foreground hover:text-foreground text-sm font-black uppercase tracking-widest px-4 transition-all"
              >
                <LayoutDashboard className="w-5 h-5 text-primary" />
                Node Dashboard
              </Link>
              <button 
                onClick={handleSignOut}
                className="flex items-center gap-3 text-muted-foreground hover:text-destructive text-sm font-black uppercase tracking-widest px-2 transition-all"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          ) : (
            <>
              <Link href="/auth/login" className="text-muted-foreground hover:text-foreground text-sm font-black uppercase tracking-widest px-4 transition-all">
                Login
              </Link>
              <Button asChild className="h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-[0.2em] px-8 rounded-full shadow-xl shadow-primary/20 group transition-all duration-500">
                <Link href="/auth/signup" className="flex items-center gap-3">
                  Deploy Account
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden w-12 h-12 rounded-full bg-muted flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-32 left-6 right-6 md:hidden bg-card border border-border rounded-[3rem] overflow-hidden shadow-3xl z-[60] backdrop-blur-3xl"
          >
            <div className="px-8 py-10 flex flex-col gap-8">
              <Link
                href="/courses"
                className="text-muted-foreground hover:text-primary text-xl font-black uppercase tracking-widest italic"
                onClick={() => setMobileMenuOpen(false)}
              >
                Courses
              </Link>
              {["Themes", "Plugins", "Apps", "Software"].map((item) => (
                <Link
                  key={item}
                  href={`/store?category=${item.toLowerCase()}`}
                  className="text-muted-foreground hover:text-primary text-xl font-black uppercase tracking-widest italic"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item}
                </Link>
              ))}
              <hr className="border-border/50" />
              {["Marketplace", "Freelancers", "Projects"].map((item) => (
                <Link
                  key={item}
                  href={`/${item.toLowerCase().replace(" ", "-")}`}
                  className="text-muted-foreground hover:text-primary text-xl font-black uppercase tracking-widest italic"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item}
                </Link>
              ))}
              <div className="flex flex-col gap-6">
                {user ? (
                  <>
                    <Link 
                      href={userData?.role ? dashboardPath : "/auth/role-selection"} 
                      className="text-muted-foreground text-xl font-black uppercase tracking-widest py-3 flex items-center gap-4 italic"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <LayoutDashboard className="w-6 h-6 text-primary" />
                      Dashboard
                    </Link>
                    <button 
                      onClick={() => {
                        handleSignOut();
                        setMobileMenuOpen(false);
                      }}
                      className="text-muted-foreground text-left py-3 flex items-center gap-4 text-xl font-black uppercase tracking-widest italic"
                    >
                      <LogOut className="w-6 h-6" />
                      Sign Out
                    </button>
                    <div className="flex items-center justify-between py-4 border-t border-border/50 mt-4">
                      <span className="text-muted-foreground text-xl font-black uppercase tracking-widest italic">Appearance</span>
                      <ThemeToggle />
                    </div>
                  </>
                ) : (
                  <>
                    <Link href="/auth/login" className="text-muted-foreground text-center py-4 text-xl font-black uppercase tracking-widest italic" onClick={() => setMobileMenuOpen(false)}>
                      Login
                    </Link>
                    <div className="flex items-center justify-between py-4 border-t border-border/50 mb-2">
                       <span className="text-muted-foreground text-xl font-black uppercase tracking-widest italic">Appearance</span>
                       <ThemeToggle />
                    </div>
                    <Button asChild className="h-16 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full text-xl font-black uppercase tracking-widest italic shadow-xl shadow-primary/20">
                      <Link href="/auth/signup" onClick={() => setMobileMenuOpen(false)}>Join VerteX</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
