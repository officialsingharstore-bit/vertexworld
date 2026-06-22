"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import { Briefcase, Search, Filter, Zap, ArrowRight, DollarSign, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/firebase";
import { collection, query, onSnapshot } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function JobsBoardPage() {
    const router = useRouter();
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const q = query(collection(db, "jobs"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            fetched.sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
            setJobs(fetched);
            setLoading(false);
        }, (err) => {
            console.error("Jobs feed error:", err);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const filteredJobs = jobs.filter(job => 
        job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <main className="min-h-screen bg-background text-foreground pt-32 pb-20">
            <Navbar />

            <div className="max-w-7xl mx-auto px-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                    <div>
                        <div className="flex items-center gap-3 text-primary mb-4">
                            <Briefcase className="w-6 h-6" />
                            <span className="text-[10px] font-black uppercase tracking-[0.5em]">Work Opportunity Grid</span>
                        </div>
                        <h1 className="text-6xl md:text-7xl font-black text-foreground uppercase italic tracking-tighter leading-none mb-6">
                            Browse <span className="text-primary">Jobs</span>
                        </h1>
                        <p className="text-muted-foreground text-xl font-medium max-w-2xl leading-relaxed">
                            Find the perfect creative or technical transmission for your professional expertise.
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button 
                            onClick={() => router.push("/dashboard/buyer/jobs/create")}
                            className="h-16 px-10 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest rounded-3xl gap-3 shadow-2xl shadow-primary/20 transition-all duration-500 scale-100 hover:scale-105"
                        >
                            Post a Vacancy
                        </Button>
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="flex flex-col lg:flex-row gap-6 mb-12">
                    <div className="flex-1 relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input 
                            type="text"
                            placeholder="Scan by title, skill, or requirement..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-16 bg-card border border-border rounded-full pl-16 pr-8 text-foreground font-bold outline-none focus:border-primary/50 transition-all shadow-xl"
                        />
                    </div>
                    <div className="flex gap-4">
                        <Button variant="outline" className="h-16 px-8 rounded-full border-border bg-card/50 font-black uppercase tracking-widest gap-3">
                            <Filter className="w-5 h-5" />
                            Listing Type
                        </Button>
                        <Button variant="outline" className="h-16 px-8 rounded-full border-border bg-card/50 font-black uppercase tracking-widest gap-3">
                            Category
                        </Button>
                    </div>
                </div>

                {/* Jobs List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {loading ? (
                        [...Array(6)].map((_, i) => (
                            <div key={i} className="h-[400px] bg-card/30 animate-pulse rounded-[48px] border border-white/5" />
                        ))
                    ) : (
                        <AnimatePresence>
                            {filteredJobs.map((job, idx) => (
                                <motion.div 
                                    key={job.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="group bg-card border border-border rounded-[48px] p-10 hover:border-primary/50 transition-all duration-500 shadow-xl relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                                    
                                    <div className="relative z-10">
                                        <div className="flex items-center justify-between mb-8">
                                            <div className="px-5 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary font-black text-[10px] uppercase tracking-widest">
                                                {job.category}
                                            </div>
                                            <span className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">
                                                {new Date(job.createdAt?.seconds * 1000).toLocaleDateString()}
                                            </span>
                                        </div>

                                        <h3 className="text-3xl font-black text-foreground italic uppercase tracking-tighter leading-tight mb-6 group-hover:text-primary transition-colors">
                                            {job.title}
                                        </h3>

                                        <div className="space-y-6 mb-10">
                                            <div className="flex items-center gap-4 text-muted-foreground font-medium">
                                                <DollarSign className="w-5 h-5 text-primary" />
                                                <span className="text-foreground font-black italic text-xl">${job.budgetAmount}</span>
                                                <span className="text-[10px] uppercase tracking-widest font-black">({job.budgetType})</span>
                                            </div>
                                            <div className="flex items-center gap-4 text-muted-foreground font-medium">
                                                <Zap className="w-5 h-5 text-primary" />
                                                <span>Level: <span className="text-foreground font-black italic">{job.skillLevel}</span></span>
                                            </div>
                                            <p className="text-sm line-clamp-3 leading-relaxed opacity-70">
                                                {job.description}
                                            </p>
                                        </div>

                                        <Button 
                                            onClick={() => router.push(`/jobs/${job.id}`)}
                                            className="w-full h-14 bg-background border border-border group-hover:bg-primary group-hover:text-black rounded-2xl font-black uppercase tracking-widest text-[10px] gap-3 transition-all"
                                        >
                                            Inspect Transmission <ArrowRight className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>

                {!loading && filteredJobs.length === 0 && (
                    <div className="py-40 text-center">
                        <Briefcase className="w-20 h-20 mx-auto mb-8 text-muted-foreground opacity-20" />
                        <h2 className="text-3xl font-black uppercase italic tracking-tighter text-muted-foreground">No active opportunities found</h2>
                        <p className="text-muted-foreground font-medium mt-4">Try adjusting your sensors or filters.</p>
                    </div>
                )}
            </div>
        </main>
    );
}
