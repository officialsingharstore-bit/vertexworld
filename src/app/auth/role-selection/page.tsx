"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Briefcase, ShoppingBag, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export default function RoleSelectionPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<"freelancer" | "buyer" | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleSelection = async () => {
    if (!selectedRole) return;
    setIsLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
        await setDoc(doc(db, "users", user.uid), {
          role: selectedRole,
          updatedAt: new Date().toISOString(),
          // Include essential fields in case document is being created for the first time
          uid: user.uid,
          email: user.email,
        }, { merge: true });
      }
      setIsLoading(false);
      router.push(selectedRole === "freelancer" ? "/dashboard/freelancer" : "/dashboard/buyer");
    } catch (error) {
      console.error("Error updating role:", error);
      setIsLoading(false);
      // Fallback redirect even if Firestore update fails
      router.push(selectedRole === "freelancer" ? "/dashboard/freelancer" : "/dashboard/buyer");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl"
      >
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-6 tracking-tight">Choose Your <span className="text-primary">Path</span></h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">Select how you want to use VerteX. You can always change this later or manage both roles from one account.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Become Freelancer */}
          <div 
            onClick={() => setSelectedRole("freelancer")}
            className={`group relative p-10 rounded-[40px] border-2 cursor-pointer transition-all duration-500 overflow-hidden ${
              selectedRole === "freelancer" 
              ? "bg-primary/10 border-emerald-500 shadow-2xl shadow-primary/20" 
              : "bg-card/50 border-border hover:border-slate-700"
            }`}
          >
            <div className={`absolute top-6 right-6 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
              selectedRole === "freelancer" ? "bg-primary border-emerald-500" : "border-slate-700 bg-background/50"
            }`}>
              {selectedRole === "freelancer" && <CheckCircle className="w-5 h-5 text-foreground" />}
            </div>

            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-8 transition-all duration-500 ${
              selectedRole === "freelancer" ? "bg-primary text-primary-foreground scale-110" : "bg-muted text-muted-foreground group-hover:scale-110"
            }`}>
              <Briefcase className="w-10 h-10" />
            </div>

            <h3 className="text-3xl font-bold text-foreground mb-4">I'm a Freelancer</h3>
            <p className="text-muted-foreground leading-relaxed font-medium">
              I want to offer my services, build a professional portfolio, and grow my freelance business worldwide.
            </p>

            <div className={`mt-8 flex flex-wrap gap-3 transition-opacity duration-500 ${selectedRole === "freelancer" ? "opacity-100" : "opacity-40"}`}>
                {["Elite Network", "Escrow Protection", "Fast Payments"].map(tag => (
                    <span key={tag} className="px-3 py-1 bg-background/50 border border-border rounded-full text-xs font-bold text-muted-foreground">
                        {tag}
                    </span>
                ))}
            </div>
          </div>

          {/* Become Buyer */}
          <div 
            onClick={() => setSelectedRole("buyer")}
            className={`group relative p-10 rounded-[40px] border-2 cursor-pointer transition-all duration-500 overflow-hidden ${
              selectedRole === "buyer" 
              ? "bg-primary/10 border-emerald-500 shadow-2xl shadow-primary/20" 
              : "bg-card/50 border-border hover:border-slate-700"
            }`}
          >
            <div className={`absolute top-6 right-6 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
              selectedRole === "buyer" ? "bg-primary border-emerald-500" : "border-slate-700 bg-background/50"
            }`}>
              {selectedRole === "buyer" && <CheckCircle className="w-5 h-5 text-foreground" />}
            </div>

            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-8 transition-all duration-500 ${
              selectedRole === "buyer" ? "bg-primary text-primary-foreground scale-110" : "bg-muted text-muted-foreground group-hover:scale-110"
            }`}>
              <ShoppingBag className="w-10 h-10" />
            </div>

            <h3 className="text-3xl font-bold text-foreground mb-4">I'm a Buyer</h3>
            <p className="text-muted-foreground leading-relaxed font-medium">
              I want to hire elite talent, post professional projects, and scale my business with expert help.
            </p>

            <div className={`mt-8 flex flex-wrap gap-3 transition-opacity duration-500 ${selectedRole === "buyer" ? "opacity-100" : "opacity-40"}`}>
                {["Top 3% Talent", "Milestone Tracking", "Legal Safety"].map(tag => (
                    <span key={tag} className="px-3 py-1 bg-background/50 border border-border rounded-full text-xs font-bold text-muted-foreground">
                        {tag}
                    </span>
                ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center">
            <Button 
                disabled={!selectedRole || isLoading}
                onClick={handleRoleSelection}
                className="h-16 px-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl text-xl font-bold group shadow-2xl shadow-primary/20 disabled:opacity-50"
            >
              {isLoading ? "Preparing your dashboard..." : "Continue to Dashboard"}
              {!isLoading && <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />}
            </Button>
            <p className="mt-8 text-muted-foreground font-medium">Selected as: <span className="text-foreground capitalize">{selectedRole || "Nothing selected"}</span></p>
        </div>
      </motion.div>
    </div>
  );
}
