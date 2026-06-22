"use client";

import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { BUYER_NAV } from "@/constants/navigation";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Plus, 
  DollarSign, 
  Calendar,
  FileText,
  Target,
  Clock,
  CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";

export default function CreateJobPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Programming & Tech",
    skillLevel: "Expert (Top Talent)",
    budgetType: "fixed" as "fixed" | "hourly",
    budgetAmount: "",
  });

  const steps = [
    { title: "Description", icon: <FileText /> },
    { title: "Budget", icon: <DollarSign /> },
    { title: "Timeline", icon: <Calendar /> },
  ];

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else handleSubmit();
  };

  const handleSubmit = async () => {
    if (!user) {
        alert("Session expired. Please login again.");
        router.push("/auth/login");
        return;
    }

    if (!formData.title || !formData.description) {
        alert("Please fill in the project title and description.");
        setStep(1);
        return;
    }

    setIsLoading(true);
    try {
      await addDoc(collection(db, "jobs"), {
        ...formData,
        buyerId: user.uid,
        buyerName: user.displayName || "Value Buyer",
        buyerEmail: user.email,
        status: "open",
        createdAt: serverTimestamp(),
      });
      alert("Job posted successfully! Freelancers can now see your requirements.");
      router.push("/dashboard/buyer/projects");
    } catch (error) {
      console.error("Error posting job:", error);
      alert("Failed to publish job. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout navItems={BUYER_NAV} userRole="Buyer">
    <div className="max-w-4xl mx-auto pb-20">
      <Link href="/dashboard/buyer/projects" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Jobs
      </Link>

      <div className="mb-12">
        <h1 className="text-3xl font-bold text-foreground mb-2 italic">Post a New Job</h1>
        <p className="text-muted-foreground font-medium">Find the perfect expert for your project in minutes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Step List */}
        <div className="space-y-4">
            {steps.map((s, i) => (
                <div 
                    key={i} 
                    className={`flex items-center gap-4 p-5 rounded-3xl border transition-all ${
                        step === i + 1 ? "bg-primary/10 border-primary/30 text-primary shadow-xl shadow-emerald-500/5" : "bg-card border-border text-muted-foreground"
                    }`}
                >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                        step === i + 1 ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}>
                        {step > i + 1 ? <CheckCircle2 className="w-5 h-5" /> : s.icon}
                    </div>
                    <span className="font-black text-[10px] uppercase tracking-widest">{s.title}</span>
                </div>
            ))}
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
            <div className="bg-card border border-border rounded-[40px] overflow-hidden shadow-2xl relative">
                <div className="p-10">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div 
                                key="step1" 
                                initial={{ opacity: 0, x: 20 }} 
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div>
                                    <label className="block text-[10px] font-black text-muted-foreground mb-4 uppercase tracking-[0.2em]">Project Title</label>
                                    <input 
                                        className="w-full h-16 bg-background border border-border rounded-2xl px-6 text-foreground text-lg font-bold focus:outline-none focus:border-emerald-500 transition-all" 
                                        placeholder="e.g. Build a Web3 Dashboard with Next.js" 
                                        value={formData.title}
                                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-muted-foreground mb-4 uppercase tracking-[0.2em]">Project Description</label>
                                    <textarea 
                                        rows={8} 
                                        className="w-full bg-background border border-border rounded-2xl p-6 text-foreground text-sm focus:outline-none focus:border-emerald-500 transition-all resize-none leading-relaxed" 
                                        placeholder="Describe the requirements, tech stack, and goals..." 
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-muted-foreground mb-4 uppercase tracking-[0.2em]">Category</label>
                                        <select 
                                            className="w-full h-14 bg-background border border-border rounded-2xl px-6 text-foreground font-bold focus:outline-none"
                                            value={formData.category}
                                            onChange={(e) => setFormData({...formData, category: e.target.value})}
                                        >
                                            <option>Programming & Tech</option>
                                            <option>Design & Creative</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-muted-foreground mb-4 uppercase tracking-[0.2em]">Skill Level</label>
                                        <select 
                                            className="w-full h-14 bg-background border border-border rounded-2xl px-6 text-foreground font-bold focus:outline-none"
                                            value={formData.skillLevel}
                                            onChange={(e) => setFormData({...formData, skillLevel: e.target.value})}
                                        >
                                            <option>Expert (Top Talent)</option>
                                            <option>Intermediate</option>
                                            <option>Entry Level</option>
                                        </select>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div 
                                key="step2" 
                                initial={{ opacity: 0, x: 20 }} 
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-10"
                            >
                                <div className="p-8 bg-primary/5 border border-primary/20 rounded-[32px] flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-[24px] bg-primary flex items-center justify-center text-foreground shrink-0 shadow-lg shadow-primary/20">
                                        <DollarSign className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h4 className="text-foreground font-black text-xl mb-1 uppercase italic">Budget Protocol</h4>
                                        <p className="text-muted-foreground text-sm font-medium">Choose between a fixed-price milestone or flexible hourly rate.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Fixed Price Card */}
                                    <div
                                        onClick={() => setFormData({...formData, budgetType: "fixed"})}
                                        className={`p-8 bg-background rounded-[40px] text-center cursor-pointer transition-all border-2 ${
                                            formData.budgetType === "fixed"
                                                ? "border-emerald-500 bg-primary/5 shadow-2xl shadow-emerald-500/10"
                                                : "border-border opacity-60 hover:opacity-100 hover:border-slate-600"
                                        }`}
                                    >
                                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 ${formData.budgetType === "fixed" ? "bg-primary text-primary-foreground shadow-xl shadow-primary/20" : "bg-muted text-muted-foreground"}`}>
                                            <Target className="w-8 h-8" />
                                        </div>
                                        <h5 className="text-foreground font-black mb-3 text-xl uppercase italic">Fixed Project</h5>
                                        <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-8">Defined Scope & Value</p>
                                        {formData.budgetType === "fixed" && (
                                            <div className="relative">
                                                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground font-black text-xl italic">$</div>
                                                <input
                                                    autoFocus
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="w-full h-16 bg-card border border-slate-700 rounded-2xl pl-12 pr-6 text-foreground font-black text-3xl focus:border-emerald-500 outline-none"
                                                    placeholder="12,000"
                                                    value={formData.budgetAmount}
                                                    onChange={(e) => setFormData({...formData, budgetAmount: e.target.value})}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Hourly Rate Card */}
                                    <div
                                        onClick={() => setFormData({...formData, budgetType: "hourly"})}
                                        className={`p-8 bg-background rounded-[40px] text-center cursor-pointer transition-all border-2 ${
                                            formData.budgetType === "hourly"
                                                ? "border-emerald-500 bg-primary/5 shadow-2xl shadow-emerald-500/10"
                                                : "border-border opacity-60 hover:opacity-100 hover:border-slate-600"
                                        }`}
                                    >
                                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 ${formData.budgetType === "hourly" ? "bg-primary text-primary-foreground shadow-xl shadow-primary/20" : "bg-muted text-muted-foreground"}`}>
                                            <Clock className="w-8 h-8" />
                                        </div>
                                        <h5 className="text-foreground font-black mb-3 text-xl uppercase italic">Hourly Rate</h5>
                                        <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-8">Flexible Collaboration</p>
                                        {formData.budgetType === "hourly" && (
                                            <div className="relative">
                                                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground font-black text-xl italic">$</div>
                                                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-muted-foreground font-black text-[10px] uppercase tracking-widest">/hr</div>
                                                <input
                                                    autoFocus
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="w-full h-16 bg-card border border-slate-700 rounded-2xl pl-12 pr-12 text-foreground font-black text-3xl focus:border-emerald-500 outline-none"
                                                    placeholder="150"
                                                    value={formData.budgetAmount}
                                                    onChange={(e) => setFormData({...formData, budgetAmount: e.target.value})}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                             <motion.div 
                                key="step3" 
                                initial={{ opacity: 0, x: 20 }} 
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="text-center py-20"
                             >
                                <div className="w-24 h-24 bg-primary/20 border border-primary/30 rounded-[32px] flex items-center justify-center mx-auto mb-10 text-primary shadow-2xl shadow-emerald-500/10">
                                    <CheckCircle2 className="w-12 h-12" />
                                </div>
                                <h2 className="text-4xl font-black text-foreground mb-4 uppercase italic">Finalize Publication</h2>
                                <p className="text-muted-foreground text-lg max-w-sm mx-auto mb-12 font-medium leading-relaxed">Your project will be immediately visible to thousands of top-tier active freelancers on VerteX.</p>
                                <Button 
                                    onClick={handleSubmit}
                                    disabled={isLoading}
                                    className="h-16 px-16 bg-primary hover:bg-primary/90 text-primary-foreground rounded-3xl text-xl font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 transition-all hover:scale-105"
                                >
                                    {isLoading ? "Publishing..." : "Launch Project"}
                                </Button>
                             </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="p-8 bg-background border-t border-border flex items-center justify-between">
                    <Button 
                        variant="ghost" 
                        className="text-muted-foreground font-black uppercase tracking-widest text-xs h-12" 
                        onClick={() => setStep(Math.max(1, step - 1))} 
                        disabled={step === 1}
                    >
                        Back
                    </Button>
                    <Button 
                        disabled={isLoading}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest text-xs px-10 h-12 rounded-2xl shadow-xl shadow-emerald-500/10 transition-all" 
                        onClick={handleNext}
                    >
                        {step === 3 ? "Launch Project" : "Save & Continue"}
                    </Button>
                </div>
            </div>
        </div>
      </div>
    </div>
    </DashboardLayout>
  );
}
