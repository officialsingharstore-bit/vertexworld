"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { 
  Search, 
  Star, 
  Clock, 
  LayoutGrid, 
  List, 
  Zap, 
  CheckCircle2,
  X,
  Send,
  UserCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, query, limit, getDocs, where, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function MarketplacePage() {
  const { user, userData } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"gigs" | "projects" | "freelancers">("gigs");
  const [isSearching, setIsSearching] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [proposalModal, setProposalModal] = useState<{ open: boolean; project: any }>({ open: false, project: null });
  const [hireModal, setHireModal] = useState<{ open: boolean; freelancer: any }>({ open: false, freelancer: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [proposalText, setProposalText] = useState("");

  // Node State
  const [realGigs, setRealGigs] = useState<any[]>([]);
  const [realProjects, setRealProjects] = useState<any[]>([]);
  const [realFreelancers, setRealFreelancers] = useState<any[]>([]);

  // High-Fidelity Fallbacks
  const DEMO_PROJECTS = [
    { id: "demo-p1", title: "Next-Gen Fintech App Architecture", description: "Design a high-security neural architecture for a global fintech node. Requires expertise in React, Go, and AWS.", category: "Engineering", budgetAmount: 12500, time: "Benchmark" },
    { id: "demo-p2", title: "Cyber-Premium Brand Identity", description: "Develop a complete visual language for a new AI-driven creative agency. Must include 3D assets.", category: "Branding", budgetAmount: 4200, time: "Benchmark" },
    { id: "demo-p3", title: "Data-Core Optimization Node", description: "Audit and optimize a large-scale PostgreSQL database for high-concurrency event processing.", category: "Data Core", budgetAmount: 850, time: "Benchmark" }
  ];

  const DEMO_FREELANCERS = [
    { id: "demo-f1", fullName: "Alexander Vance", expertise: "Full Stack Architect", hourlyRate: "125", isReal: false },
    { id: "demo-f2", fullName: "Elena Kovic", expertise: "Cyber-UI Specialist", hourlyRate: "95", isReal: false },
    { id: "demo-f3", fullName: "Marcus Thorne", expertise: "Security Protocol Lead", hourlyRate: "150", isReal: false }
  ];

  useEffect(() => {
    const fetchData = async () => {
        setLoading(true);
        try {
            const gigsSnap = await getDocs(query(collection(db, "gigs"), limit(12)));
            setRealGigs(gigsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

            const jobsSnap = await getDocs(query(collection(db, "jobs"), limit(20)));
            const dbJobs = jobsSnap.docs.map(doc => ({ 
                id: doc.id, 
                ...doc.data(),
                isReal: true,
                time: "Live Node"
            }));
            setRealProjects([...dbJobs, ...DEMO_PROJECTS]);

            const freelancersQuery = query(collection(db, "users"), where("role", "in", ["freelancer", "Freelancer"]), limit(20));
            const freelancersSnap = await getDocs(freelancersQuery);
            const dbFreelancers = freelancersSnap.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                isReal: true
            }));
            setRealFreelancers([...dbFreelancers, ...DEMO_FREELANCERS]);
        } catch (error) {
            console.error("Marketplace fetch error:", error);
            setRealProjects(DEMO_PROJECTS);
            setRealFreelancers(DEMO_FREELANCERS);
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, []);

  // Action Handlers
  const handleApplyClick = (project: any) => {
    if (!user) {
        router.push("/auth/login");
        return;
    }
    if (userData?.role !== "freelancer" && userData?.role !== "Freelancer") {
        alert("Only Freelancers can apply for project nodes.");
        return;
    }
    setProposalModal({ open: true, project });
  };

  const handleHireClick = (freelancer: any) => {
    if (!user) {
        router.push("/auth/login");
        return;
    }
    if (userData?.role !== "buyer") {
        alert("Please switch to a Buyer account to hire talent.");
        return;
    }
    setHireModal({ open: true, freelancer });
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

  const handleMessageClick = async (freelancer: any) => {
    if (!user) {
        router.push("/auth/login");
        return;
    }
    
    setIsSubmitting(true);
    try {
        const freelancerId = freelancer.id || freelancer.uid;
        if (!freelancerId) throw new Error("ID Missing");

        // Query existing
        const q = query(
            collection(db, "conversations"),
            where("participants", "array-contains", user.uid)
        );
        const snap = await getDocs(q);
        const existing = snap.docs.find(d => d.data().participants.includes(freelancerId));

        if (existing) {
            router.push(`/dashboard/buyer/messages?conv=${existing.id}`);
        } else {
            const newConv = await addDoc(collection(db, "conversations"), {
                participants: [user.uid, freelancerId],
                participantNames: {
                    [user.uid]: userData?.fullName || "Buyer",
                    [freelancerId]: freelancer.fullName || "Freelancer"
                },
                lastMessage: "Conversation Activated",
                updatedAt: serverTimestamp(),
                createdAt: serverTimestamp()
            });
            router.push(`/dashboard/buyer/messages?conv=${newConv.id}`);
        }
    } catch (err) {
        console.error("Message error:", err);
        alert("Failed to initialize chat link.");
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleConfirmHire = async () => {
    if (!hireModal.freelancer) return;
    setIsSubmitting(true);
    try {
        // Create a direct hire order
        await addDoc(collection(db, "orders"), {
            buyerId: user?.uid || "unknown",
            buyerName: userData?.fullName || "Strategic Buyer",
            freelancerId: hireModal.freelancer.id || hireModal.freelancer.uid || "unknown",
            freelancerName: hireModal.freelancer.fullName || hireModal.freelancer.displayName || "Elite Professional",
            gigTitle: `Direct Hire: Custom Project`,
            status: "awaiting_verification", // Starts at verification for escrow
            totalPrice: parseInt(hireModal.freelancer.hourlyRate || "100"),
            type: "direct_hire",
            createdAt: serverTimestamp()
        });

        // Create Notification for Freelancer
        await addDoc(collection(db, "notifications"), {
            recipientId: hireModal.freelancer.id || hireModal.freelancer.uid,
            message: `You were hired by ${userData?.fullName || "Strategic Buyer"} for a custom project node!`,
            type: "hire",
            read: false,
            createdAt: serverTimestamp()
        });
        
        alert("Hire Request Initialized! Redirecting to payment verification node...");
        setHireModal({ open: false, freelancer: null });
        router.push("/dashboard/buyer/projects");
    } catch (error) {
        console.error("Hire error:", error);
        alert("Initialization failed. Field sync error.");
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground pt-32 pb-20 selection:bg-primary/30">
      <Navbar />

      {/* --- PROPOSAL MODAL --- */}
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
                        <p className="text-muted-foreground font-bold text-sm tracking-widest uppercase">Applying to: {proposalModal.project.title}</p>
                    </div>
                    <div className="space-y-6">
                        <textarea 
                            rows={6}
                            value={proposalText}
                            onChange={(e) => setProposalText(e.target.value)}
                            className="w-full bg-background border border-border rounded-3xl p-6 text-foreground text-sm focus:border-primary outline-none resize-none leading-relaxed transition-all"
                            placeholder="Describe your strategy for this project node..."
                        />
                        <Button 
                            disabled={isSubmitting || !proposalText}
                            onClick={submitProposal}
                            className="w-full h-16 bg-primary hover:bg-primary/90 text-primary-foreground rounded-3xl font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/20"
                        >
                            {isSubmitting ? "Transmitting..." : "Send Proposal"}
                        </Button>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      {/* --- HIRE MODAL --- */}
      <AnimatePresence>
        {hireModal.open && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setHireModal({ open: false, freelancer: null })} className="absolute inset-0 bg-background/80 backdrop-blur-md" />
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-card border border-white/10 rounded-[48px] w-full max-w-xl p-12 shadow-3xl text-center">
                    <button onClick={() => setHireModal({ open: false, freelancer: null })} className="absolute top-8 right-8 text-muted-foreground hover:text-foreground transition-colors"><X className="w-8 h-8" /></button>
                    <div className="w-24 h-24 bg-primary/10 rounded-[32px] flex items-center justify-center text-primary mx-auto mb-8 border border-primary/20">
                        <UserCheck className="w-12 h-12" />
                    </div>
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-4 text-foreground">Direct Hire Request</h2>
                    <p className="text-muted-foreground font-medium mb-10 leading-relaxed">You are requesting to hire <span className="text-primary font-black">{hireModal.freelancer.fullName || hireModal.freelancer.displayName}</span> directly. Proceed to open secure session?</p>
                    <div className="flex flex-col gap-4">
                        <Button 
                            onClick={handleConfirmHire}
                            disabled={isSubmitting}
                            className="h-16 bg-foreground text-background font-black uppercase tracking-[0.2em] rounded-3xl hover:bg-primary hover:text-primary-foreground shadow-xl transition-all"
                        >
                            {isSubmitting ? "Initializing..." : "Initialize Secure Hire"}
                        </Button>
                        <Button variant="ghost" onClick={() => setHireModal({ open: false, freelancer: null })} className="h-12 text-muted-foreground font-bold uppercase tracking-widest text-[10px]">
                            Cancel Request
                        </Button>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-20">
            <h1 className="text-5xl lg:text-7xl font-black text-foreground mb-10 italic uppercase tracking-tighter">
                Marketplace <span className="text-primary">Node</span>
            </h1>
            <div className="flex flex-col lg:flex-row gap-6 items-center">
                <div className="flex-1 bg-card/50 border border-border rounded-3xl p-2 flex items-center gap-4 px-6 focus-within:border-primary">
                    <Search className="w-5 h-5 text-muted-foreground" />
                    <input className="bg-transparent border-none outline-none py-4 text-foreground font-bold w-full" placeholder={`Locate ${activeTab}...`} />
                </div>
                <div className="flex items-center gap-3 bg-card border border-border p-2 rounded-3xl">
                    {["gigs", "projects", "freelancers"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                activeTab === tab ? "bg-primary text-primary-foreground shadow-lg" : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>
        </div>

        {/* Content Section */}
        <div className="min-h-[400px]">
          {loading ? (
             <div className="py-20 text-center text-muted-foreground font-black uppercase tracking-widest italic animate-pulse">Syncing Network...</div>
          ) : (
            <AnimatePresence mode="wait">
                {activeTab === "projects" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {realProjects.map((p, i) => (
                            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} key={i} className="bg-card border border-border rounded-[48px] p-10 hover:border-primary transition-all group shadow-2xl relative">
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-xl border border-primary/20">{p.category}</span>
                                    <span className="text-muted-foreground font-bold text-[10px] uppercase tracking-widest ml-auto">{p.time}</span>
                                </div>
                                <h3 className="text-2xl font-black text-foreground mb-4 uppercase italic tracking-tighter group-hover:text-primary transition-colors">{p.title}</h3>
                                <p className="text-muted-foreground text-sm font-medium leading-relaxed mb-10 line-clamp-2">{p.description}</p>
                                <div className="flex items-center justify-between pt-8 border-t border-border">
                                    <p className="text-3xl font-black text-foreground italic tracking-tighter">${p.budgetAmount || 500}</p>
                                    <Button onClick={() => handleApplyClick(p)} className="h-14 px-10 bg-primary text-primary-foreground font-black hover:bg-primary/90 rounded-2xl uppercase italic tracking-widest text-xs transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                                        Apply Now
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {activeTab === "freelancers" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {realFreelancers.map((f, i) => (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} key={i} className="bg-card border border-border rounded-[56px] p-10 hover:border-primary shadow-2xl group transition-all relative overflow-hidden">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary text-3xl font-black italic">
                                        {(f.fullName || "F")[0]}
                                    </div>
                                    <div className="px-4 py-1.5 bg-primary/10 border border-primary/20 text-primary rounded-full text-[10px] font-black uppercase tracking-widest">Verified talent</div>
                                </div>
                                <h3 className="text-2xl font-black text-foreground mb-2 uppercase italic tracking-tighter group-hover:text-primary transition-colors">{f.fullName || f.displayName}</h3>
                                <p className="text-primary text-[10px] font-black uppercase tracking-widest mb-6">Expert Consultant</p>
                                <p className="text-muted-foreground text-sm font-medium mb-12 line-clamp-2 leading-relaxed">Member of the elite VerteX talent network. Specialized in high-end digital strategic output.</p>
                                <div className="flex items-center gap-3 pt-8 border-t border-border">
                                    <p className="text-3xl font-black text-foreground italic">${f.hourlyRate || "85"}/hr</p>
                                    <div className="flex gap-2 ml-auto">
                                        <Button 
                                            variant="outline" 
                                            onClick={() => handleMessageClick(f)}
                                            className="w-14 h-14 bg-background border-border text-primary rounded-2xl hover:border-primary transition-all p-0"
                                        >
                                            <Send className="w-5 h-5" />
                                        </Button>
                                        <Button onClick={() => handleHireClick(f)} className="h-14 px-8 bg-foreground text-background font-black hover:bg-primary hover:text-primary-foreground rounded-2xl uppercase italic tracking-widest text-xs transition-all">
                                            Hire
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
                
                {activeTab === "gigs" && (
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                        {realGigs.map((gig, i) => (
                             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} key={gig.id} className="group flex flex-col">
                                <Link href={`/marketplace/gigs/${gig.id}`}>
                                    <div className="relative aspect-[16/10] bg-card rounded-[40px] overflow-hidden mb-6 border border-border group-hover:border-primary/50 transition-all shadow-2xl">
                                        <img src={gig.images?.[0] || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=2072"} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                        <div className="absolute top-4 right-4 bg-primary px-4 py-2 rounded-2xl text-[10px] font-black text-foreground">
                                            ${gig.pricing?.basic?.price || 50}
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-black text-foreground mb-2 uppercase italic leading-tight group-hover:text-primary transition-colors line-clamp-2">{gig.title}</h3>
                                    <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">Global Provider</p>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}

            </AnimatePresence>
          )}
        </div>
      </div>
    </main>
  );
}
