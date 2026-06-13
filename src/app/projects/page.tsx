"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import { 
  Search, 
  Briefcase, 
  Clock, 
  DollarSign, 
  ArrowRight,
  Filter,
  Users,
  X,
  Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, query, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function ProjectsPage() {
  const { user, userData } = useAuth();
  const router = useRouter();
  const [realProjects, setRealProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Proposal Modal State
  const [proposalModal, setProposalModal] = useState<{ open: boolean; project: any }>({ open: false, project: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [proposalText, setProposalText] = useState("");

  // Filter State
  const [filterType, setFilterType] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "jobs"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Client-side sort
        data.sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setRealProjects(data);
        setLoading(false);
    }, (err) => {
        console.error("Projects feed error:", err);
        setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredProjects = filterType 
    ? realProjects.filter(p => {
        if (filterType === "Fixed Price") return p.budgetType === "fixed";
        if (filterType === "Hourly Cycle") return p.budgetType === "hourly";
        return true;
      })
    : realProjects;

  const handleApplyClick = (project: any) => {
    if (!user) {
        router.push("/auth/login");
        return;
    }
    if (userData?.role !== "freelancer" && userData?.role !== "Freelancer") {
        alert("Verification Fail: Only dedicated Freelancer nodes can apply.");
        return;
    }
    setProposalModal({ open: true, project });
  };

  const submitProposal = async () => {
    if (!proposalText || !proposalModal.project) return;
    setIsSubmitting(true);
    try {
        await addDoc(collection(db, "proposals"), {
            projectId: proposalModal.project.id,
            projectTitle: proposalModal.project.title,
            buyerId: proposalModal.project.buyerId || "unknown",
            freelancerId: user?.uid,
            freelancerName: userData?.fullName || "Elite Talent",
            coverLetter: proposalText,
            status: "pending",
            createdAt: serverTimestamp()
        });

        // Create Notification for Buyer
        await addDoc(collection(db, "notifications"), {
            recipientId: proposalModal.project.buyerId || "unknown",
            message: `New Proposal from ${userData?.fullName || "Elite Talent"} for "${proposalModal.project.title}"`,
            type: "proposal",
            read: false,
            createdAt: serverTimestamp()
        });

        alert("Proposal transmitted! The buyer has been notified.");
        setProposalModal({ open: false, project: null });
        setProposalText("");
    } catch (err) {
        console.error("Proposal error:", err);
        alert("Transmission failed. Check network link.");
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground pt-32 pb-20 selection:bg-primary/30">
      <Navbar />

      {/* Proposal Modal */}
      <AnimatePresence>
        {proposalModal.open && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setProposalModal({ open: false, project: null })} className="absolute inset-0 bg-background/80 backdrop-blur-md" />
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-card border border-white/10 rounded-[48px] w-full max-w-xl p-12 shadow-3xl">
                    <button onClick={() => setProposalModal({ open: false, project: null })} className="absolute top-8 right-8 text-muted-foreground hover:text-foreground transition-colors"><X className="w-8 h-8" /></button>
                    <div className="mb-10 text-center">
                        <div className="w-20 h-20 bg-primary/20 rounded-3xl flex items-center justify-center text-primary mx-auto mb-6">
                            <Send className="w-10 h-10" />
                        </div>
                        <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-2">Transmit Proposal</h2>
                        <p className="text-muted-foreground font-bold text-sm tracking-widest uppercase">Target: {proposalModal.project.title}</p>
                    </div>
                    <div className="space-y-6">
                        <textarea 
                            rows={6}
                            value={proposalText}
                            onChange={(e) => setProposalText(e.target.value)}
                            className="w-full bg-background border border-border rounded-3xl p-8 text-foreground text-base focus:border-emerald-500 outline-none resize-none leading-relaxed transition-all italic font-medium"
                            placeholder="Describe your creative and technical strategy..."
                        />
                        <Button 
                            disabled={isSubmitting || !proposalText}
                            onClick={submitProposal}
                            className="w-full h-18 bg-primary hover:bg-primary/90 text-primary-foreground rounded-3xl font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 italic"
                        >
                            {isSubmitting ? "Transmitting..." : "Send Proposal Signals"}
                        </Button>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
            <div>
                <h1 className="text-5xl font-black text-foreground mb-4 uppercase italic tracking-tighter">Mission <span className="text-primary">Board</span></h1>
                <p className="text-muted-foreground text-lg font-medium tracking-tight">Active high-fidelity project nodes across the global network.</p>
            </div>
            <Button size="lg" asChild className="h-16 px-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl font-black uppercase tracking-widest italic shadow-2xl shadow-primary/20">
                <Link href="/dashboard/buyer/jobs/create">Deploy Project Node</Link>
            </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            {/* Sidebar Filters */}
            <div className="hidden lg:block space-y-12">
                <div>
                    <h4 className="text-foreground font-black mb-8 text-[10px] uppercase tracking-[0.4em] italic">Protocol Type</h4>
                    <div className="space-y-5">
                        {["Fixed Price", "Hourly Cycle", "Retainer"].map(t => (
                            <label 
                                key={t} 
                                className="flex items-center gap-4 cursor-pointer group"
                                onClick={() => setFilterType(filterType === t ? null : t)}
                            >
                                <div className={`w-6 h-6 rounded-xl border border-border transition-all flex items-center justify-center ${filterType === t ? "bg-primary border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]" : "bg-card group-hover:border-primary"}`}>
                                    {filterType === t && <X className="w-3 h-3 text-foreground uppercase" />}
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${filterType === t ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`}>{t}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            {/* Project List */}
            <div className="lg:col-span-3 space-y-8">
                {loading ? (
                    <div className="py-20 text-center text-muted-foreground font-black uppercase tracking-widest italic animate-pulse">Syncing Mission Streams...</div>
                ) : filteredProjects.length === 0 ? (
                    <div className="py-32 text-center bg-card/20 border border-dashed border-border rounded-[56px]">
                        <p className="text-muted-foreground font-black uppercase tracking-widest">{filterType ? `No ${filterType} missions detected` : "No live projects detected"}</p>
                    </div>
                ) : filteredProjects.map((p) => (
                    <div key={p.id} className="bg-card/50 border border-border rounded-[56px] p-10 hover:border-primary/30 transition-all group shadow-2xl relative overflow-hidden">
                        <div className="flex flex-col md:flex-row justify-between gap-10">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-4 mb-6">
                                    <span className="text-[9px] font-black bg-primary/10 text-primary px-4 py-1.5 rounded-full uppercase tracking-widest italic border border-primary/20">{p.category}</span>
                                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                        <Clock className="w-3 h-3 text-primary" />
                                        {p.createdAt ? new Date(p.createdAt.seconds * 1000).toLocaleDateString() : 'Active'}
                                    </span>
                                </div>
                                <h3 className="text-3xl font-black text-foreground mb-6 group-hover:text-primary transition-colors uppercase italic tracking-tighter leading-none">{p.title}</h3>
                                <div className="flex flex-wrap items-center gap-10 text-muted-foreground text-sm font-medium">
                                    <div className="flex items-center gap-3">
                                        <DollarSign className="w-5 h-5 text-primary" />
                                        <span className="text-foreground font-black text-lg italic tracking-tighter">${p.budgetAmount || p.budgetMin}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Briefcase className="w-5 h-5 text-muted-foreground" />
                                        <span className="font-black uppercase text-[10px] tracking-widest">Fixed Milestone</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Users className="w-5 h-5 text-muted-foreground" />
                                        <span className="font-black uppercase text-[10px] tracking-widest">Proposals: <span className="text-foreground">Active</span></span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-row md:flex-col justify-end gap-4 shrink-0">
                                <Button 
                                    onClick={() => handleApplyClick(p)}
                                    className="h-16 px-10 bg-primary/10 hover:bg-primary text-primary hover:text-foreground border border-primary/20 rounded-2xl font-black uppercase tracking-widest transition-all italic shadow-2xl shadow-emerald-500/10"
                                >
                                    Apply Now
                                </Button>
                                <Button variant="ghost" className="text-muted-foreground hover:text-foreground font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                                    Save Mission
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}

                <div className="pt-16 text-center">
                    <Link href="/marketplace">
                        <Button variant="outline" className="border-white/10 bg-card text-foreground h-16 px-12 rounded-[24px] font-black uppercase tracking-widest hover:border-primary transition-all italic">
                            Browse Global Marketplace
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
      </div>
    </main>
  );
}
