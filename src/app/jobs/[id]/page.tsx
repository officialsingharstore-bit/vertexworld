"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import { 
    Briefcase, 
    ArrowLeft, 
    ArrowRight,
    DollarSign, 
    Clock, 
    Target, 
    Zap, 
    CheckCircle2, 
    MessageSquare,
    User,
    ShieldCheck,
    Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function JobDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user, userData } = useAuth();
    const [job, setJob] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [proposalText, setProposalText] = useState("");
    const [hasApplied, setHasApplied] = useState(false);

    useEffect(() => {
        if (!id) return;

        const fetchJob = async () => {
            try {
                const docSnap = await getDoc(doc(db, "jobs", id as string));
                if (docSnap.exists()) {
                    setJob({ id: docSnap.id, ...docSnap.data() });
                    
                    // Check if already applied
                    if (user) {
                        const q = query(
                            collection(db, "proposals"), 
                            where("projectId", "==", id),
                            where("freelancerId", "==", user.uid)
                        );
                        const querySnap = await getDocs(q);
                        setHasApplied(!querySnap.empty);
                    }
                } else {
                    router.push("/404");
                }
            } catch (err) {
                console.error("Error fetching job:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchJob();
    }, [id, user]);

    const handleApply = async () => {
        if (!user) {
            router.push("/auth/login");
            return;
        }

        if (!proposalText.trim()) {
            alert("Please provide some details about your professional strategy for this job.");
            return;
        }

        setApplying(true);
        try {
            await addDoc(collection(db, "proposals"), {
                projectId: id,
                jobTitle: job.title,
                freelancerId: user.uid,
                freelancerName: user.displayName || "Elite Freelancer",
                freelancerEmail: user.email,
                buyerId: job.buyerId,
                bidAmount: job.budgetAmount, // Default to job budget for now
                coverLetter: proposalText,
                status: "pending",
                createdAt: serverTimestamp(),
            });

            // Notify buyer
            await addDoc(collection(db, "notifications"), {
                userId: job.buyerId,
                title: "New Job Proposal",
                message: `${user.displayName || "A freelancer"} sent a proposal for "${job.title}"`,
                type: "proposal",
                link: "/dashboard/buyer/proposals",
                read: false,
                createdAt: serverTimestamp(),
            });

            setHasApplied(true);
            alert("Application transmitted successfully. Link established.");
        } catch (err) {
            console.error("Application error:", err);
            alert("Failed to send proposal. Network unstable.");
        } finally {
            setApplying(false);
        }
    };

    const handleContact = async () => {
        if (!user) {
            router.push("/auth/login");
            return;
        }

        try {
            // Check if conversation exists
            const q = query(
                collection(db, "conversations"),
                where("participants", "array-contains", user.uid)
            );
            const querySnap = await getDocs(q);
            let conv = querySnap.docs.find(doc => doc.data().participants.includes(job.buyerId));

            let convId;
            if (conv) {
                convId = conv.id;
            } else {
                // Create new conversation
                const newConv = await addDoc(collection(db, "conversations"), {
                    participants: [user.uid, job.buyerId],
                    participantNames: {
                        [user.uid]: user.displayName || "Elite Freelancer",
                        [job.buyerId]: job.buyerName || "Contractor Alpha"
                    },
                    lastMessage: "Channel established via Job Node",
                    updatedAt: serverTimestamp(),
                    status: "active"
                });
                convId = newConv.id;
            }

            // Redirect to messages
            const targetUrl = user && userData?.role === "Buyer" 
                ? `/dashboard/buyer/messages?conv=${convId}` 
                : `/dashboard/freelancer/messages?conv=${convId}`;
            router.push(targetUrl);
        } catch (err) {
            console.error("Error establishing contact:", err);
            alert("Could not establish channel.");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6">
                <Navbar />
                <Zap className="w-12 h-12 text-primary animate-pulse" />
                <p className="font-black uppercase tracking-[0.4em] text-muted-foreground italic">Syncing Transmission...</p>
            </div>
        );
    }

    if (!job) return null;

    return (
        <main className="min-h-screen bg-background text-foreground pt-32 pb-40">
            <Navbar />

            <div className="max-w-5xl mx-auto px-6">
                <Link href="/jobs" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-12 group">
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    Back to Jobs Board
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-12">
                        <section>
                            <div className="flex items-center gap-3 text-primary mb-6">
                                <span className="text-[10px] font-black uppercase tracking-[0.5em] border border-primary/20 bg-primary/5 px-4 py-1.5 rounded-full">
                                    {job.category}
                                </span>
                                <span className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">
                                    Released {new Date(job.createdAt?.seconds * 1000).toLocaleDateString()}
                                </span>
                            </div>
                            <h1 className="text-5xl md:text-6xl font-black text-foreground italic uppercase tracking-tighter leading-tight mb-8">
                                {job.title}
                            </h1>
                            <div className="prose prose-invert max-w-none">
                                <p className="text-xl text-muted-foreground font-medium leading-relaxed whitespace-pre-wrap">
                                    {job.description}
                                </p>
                            </div>
                        </section>

                        <div className="pt-12 border-t border-white/5 grid grid-cols-2 gap-8">
                             <div className="bg-card/30 border border-border rounded-[32px] p-8">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                        <Briefcase className="w-5 h-5" />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Expertise Level</p>
                                </div>
                                <p className="text-2xl font-black italic uppercase tracking-tight text-foreground">{job.skillLevel}</p>
                             </div>
                             <div className="bg-card/30 border border-border rounded-[32px] p-8">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Budget Mode</p>
                                </div>
                                <p className="text-2xl font-black italic uppercase tracking-tight text-foreground capitalize">{job.budgetType}</p>
                             </div>
                        </div>
                    </div>

                    {/* Sidebar / Apply */}
                    <div className="space-y-8">
                        <div className="bg-card border border-border rounded-[48px] p-10 shadow-3xl sticky top-32">
                            <div className="flex items-center justify-between mb-8">
                                <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">Threshold Value</p>
                                <p className="text-4xl font-black italic tracking-tighter text-primary">${job.budgetAmount}</p>
                            </div>

                            <AnimatePresence mode="wait">
                                {hasApplied ? (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="text-center py-6 bg-primary/5 border border-primary/20 rounded-3xl"
                                    >
                                        <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-4" />
                                        <p className="text-foreground font-black uppercase italic tracking-tight">Application Transmitted</p>
                                        <p className="text-muted-foreground text-xs font-medium mt-2">Node is under review by the buyer.</p>
                                    </motion.div>
                                ) : (
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-[10px] font-black text-muted-foreground mb-4 uppercase tracking-[0.2em]">Strategy Proposal</label>
                                            <textarea 
                                                rows={6}
                                                value={proposalText}
                                                onChange={(e) => setProposalText(e.target.value)}
                                                placeholder="Pitch your expertise and project roadmap..."
                                                className="w-full bg-background border border-border rounded-3xl p-6 text-foreground text-sm font-medium focus:outline-none focus:border-primary transition-all resize-none leading-relaxed"
                                            />
                                        </div>
                                        <Button 
                                            onClick={handleApply}
                                            disabled={applying}
                                            className="w-full h-20 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-[0.2em] rounded-3xl text-lg shadow-2xl shadow-primary/20 gap-3"
                                        >
                                            {applying ? "Transmitting..." : "Apply to Job"}
                                            {!applying && <Send className="w-5 h-5" />}
                                        </Button>
                                    </div>
                                )}
                            </AnimatePresence>

                            <div className="mt-12 pt-12 border-t border-white/5">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 bg-background border border-border rounded-[18px] flex items-center justify-center text-primary font-black italic text-xl">
                                        {job.buyerName?.[0] || "V"}
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Contractor Node</p>
                                        <p className="text-foreground font-black italic">{job.buyerName}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-primary font-black text-[9px] uppercase tracking-widest opacity-60">
                                    <ShieldCheck className="w-3 h-3" /> Expert Hub Verified Buyer
                                </div>
                            </div>
                        </div>

                        <div className="bg-card/50 border border-border rounded-[32px] overflow-hidden">
                            <button 
                                onClick={handleContact}
                                className="w-full p-8 flex items-center justify-between hover:bg-primary/5 transition-colors group"
                            >
                                <div className="flex items-center gap-4">
                                    <MessageSquare className="w-6 h-6 text-primary" />
                                    <div className="text-left">
                                        <p className="text-xs font-black uppercase tracking-widest text-foreground">Direct Link</p>
                                        <p className="text-xs font-medium text-muted-foreground italic">Establish secure comms channel</p>
                                    </div>
                                </div>
                                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
