"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import { 
  Search, 
  MapPin, 
  Star, 
  CheckCircle2, 
  ArrowRight,
  Filter,
  X,
  UserCheck,
  Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, getDocs } from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function FreelancersPage() {
  const { user, userData } = useAuth();
  const router = useRouter();
  const [realFreelancers, setRealFreelancers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hireModal, setHireModal] = useState<{ open: boolean; freelancer: any }>({ open: false, freelancer: null });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Only real freelancers
    const q = query(collection(db, "users"), where("role", "in", ["freelancer", "Freelancer"]));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        setRealFreelancers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
    }, (err) => {
        console.error("Freelancers feed error:", err);
        setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleHireClick = (freelancer: any) => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    setHireModal({ open: true, freelancer });
  };

  const handleConfirmHire = async () => {
    if (!hireModal.freelancer) return;
    setIsSubmitting(true);
    try {
        await addDoc(collection(db, "orders"), {
            buyerId: user?.uid,
            buyerName: userData?.fullName || "Buyer",
            freelancerId: hireModal.freelancer.id,
            freelancerName: hireModal.freelancer.fullName || "Freelancer",
            gigTitle: "Custom Managed Project",
            totalPrice: parseInt(hireModal.freelancer.hourlyRate || "100"),
            status: "active",
            createdAt: serverTimestamp()
        });

        // Notify
        await addDoc(collection(db, "notifications"), {
            recipientId: hireModal.freelancer.id,
            message: `New hire from ${userData?.fullName || "Buyer"}!`,
            type: "hire",
            read: false,
            createdAt: serverTimestamp()
        });

        alert("Hire successful! Check your dashboard.");
        setHireModal({ open: false, freelancer: null });
        router.push("/dashboard/buyer/projects");
    } catch (err) {
        console.error(err);
        alert("Action failed.");
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

        const q = query(collection(db, "conversations"), where("participants", "array-contains", user.uid));
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

  return (
    <main className="min-h-screen bg-background text-foreground pt-32 pb-20">
      <Navbar />

      {/* Hire Modal */}
      <AnimatePresence>
        {hireModal.open && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setHireModal({ open: false, freelancer: null })} className="absolute inset-0 bg-background/80 backdrop-blur-md" />
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-card border border-white/10 rounded-[48px] w-full max-w-xl p-12 shadow-3xl text-center">
                    <button onClick={() => setHireModal({ open: false, freelancer: null })} className="absolute top-8 right-8 text-muted-foreground hover:text-foreground transition-colors"><X className="w-8 h-8" /></button>
                    <div className="w-24 h-24 bg-primary/10 rounded-[32px] flex items-center justify-center text-primary mx-auto mb-8 border border-primary/20">
                        <UserCheck className="w-12 h-12" />
                    </div>
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-4 text-foreground">Direct Project Link</h2>
                    <p className="text-muted-foreground font-medium mb-10 leading-relaxed">You are connecting with <span className="text-primary font-black">{hireModal.freelancer.fullName}</span> for a custom strategic project. Proceed?</p>
                    <div className="flex flex-col gap-4">
                        <Button 
                            onClick={handleConfirmHire}
                            disabled={isSubmitting}
                            className="h-16 bg-white text-slate-950 font-black uppercase tracking-[0.2em] rounded-3xl hover:bg-primary hover:text-foreground shadow-xl transition-all"
                        >
                            {isSubmitting ? "Syncing..." : "Activate Secure Hire"}
                        </Button>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
            <div>
                <h1 className="text-5xl font-black text-foreground mb-4 uppercase italic italic tracking-tighter">Elite <span className="text-primary">Talent</span> Nodes</h1>
                <p className="text-muted-foreground text-lg font-medium tracking-tight">The decentralized network of top-tier professional experts.</p>
            </div>
        </div>

        {/* Search Bar */}
        <div className="bg-card/50 border border-border p-2 rounded-3xl lg:rounded-full shadow-3xl flex flex-col lg:flex-row gap-4 mb-20">
            <div className="flex-1 flex items-center gap-4 px-8 py-3">
                <Search className="w-5 h-5 text-primary" />
                <input className="bg-transparent border-none outline-none text-foreground w-full placeholder:text-muted-foreground font-bold" placeholder="Locate skills, names or roles..." />
            </div>
            <div className="h-10 w-px bg-white/5 hidden lg:block self-center"></div>
            <div className="flex items-center gap-4 px-8 py-3">
                <MapPin className="w-5 h-5 text-muted-foreground" />
                <input className="bg-transparent border-none outline-none text-foreground w-40 placeholder:text-muted-foreground font-bold" placeholder="Global Status" />
            </div>
            <Button size="xl" className="h-14 lg:h-18 px-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl lg:rounded-full font-black uppercase tracking-widest transition-all italic">
                Sync Talent
            </Button>
        </div>

        {/* Freelancer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {loading ? (
                <div className="col-span-full py-20 text-center text-muted-foreground font-black uppercase tracking-widest italic animate-pulse">Scanning Neural Network...</div>
            ) : realFreelancers.length === 0 ? (
                <div className="col-span-full py-32 text-center bg-card/20 border border-dashed border-border rounded-[56px]">
                  <p className="text-muted-foreground font-black uppercase tracking-widest">No live freelancers detected</p>
                </div>
            ) : realFreelancers.map((f) => (
                <div key={f.id} className="bg-card/50 border border-border rounded-[56px] p-10 hover:border-primary/30 transition-all group relative overflow-hidden shadow-2xl">
                    <div className="flex flex-col lg:flex-row gap-8 items-start relative z-10">
                        <div className="relative shrink-0">
                            <div className="w-24 h-24 bg-background rounded-[32px] border border-border flex items-center justify-center font-black text-primary text-3xl italic group-hover:border-primary transition-all duration-500">
                                {f.fullName?.[0] || "V"}
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary rounded-2xl border-4 border-slate-950 flex items-center justify-center shadow-xl">
                                <CheckCircle2 className="w-5 h-5 text-foreground" />
                            </div>
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                                <div>
                                    <h3 className="text-3xl font-black text-foreground group-hover:text-primary transition-colors uppercase italic tracking-tighter">{f.fullName}</h3>
                                    <p className="text-primary font-black text-[10px] uppercase tracking-[0.3em] h-6">{f.expertise || "Expert Provider"}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-3xl font-black text-foreground italic tracking-tighter">${f.hourlyRate || "85"}<span className="text-[10px] text-muted-foreground uppercase">/hr</span></p>
                                    <div className="flex items-center gap-1 text-yellow-400 justify-end">
                                        <Star className="w-4 h-4 fill-current" />
                                        <span className="text-sm font-bold text-foreground">5.0</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-10">
                                {(f.skills || "React, TypeScript, UI").split(",").map((tag: string) => (
                                    <span key={tag} className="px-4 py-1.5 bg-background border border-border rounded-xl text-[9px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-muted-foreground transition-colors">
                                        {tag.trim()}
                                    </span>
                                ))}
                            </div>

                            <div className="flex gap-4">
                                <Button 
                                    onClick={() => handleHireClick(f)}
                                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl h-14 font-black uppercase tracking-widest italic"
                                >
                                    Hire Now
                                </Button>
                                <Button 
                                    variant="outline" 
                                    onClick={() => handleMessageClick(f)}
                                    className="w-14 h-14 border-border bg-background/50 text-primary rounded-2xl flex items-center justify-center hover:border-primary transition-all p-0"
                                >
                                    <Send className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>

        {/* Load More */}
        <div className="mt-24 text-center">
            <Link href="/marketplace">
              <Button variant="link" className="text-primary font-black uppercase tracking-[0.2em] text-sm hover:no-underline group">
                  Browse all specialized nodes <ArrowRight className="ml-3 inline group-hover:translate-x-2 transition-transform" />
              </Button>
            </Link>
        </div>
      </div>
    </main>
  );
}
