"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { BUYER_NAV } from "@/constants/navigation";
import {
  Briefcase,
  Plus,
  Search,
  ChevronRight,
  Target,
  Activity,
  DollarSign,
  Users,
  Calendar,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, getDocs } from "firebase/firestore";

const statusConfig: Record<string, { color: string; bg: string; icon: React.ReactNode; label: string }> = {
  open: { color: "text-orange-400", bg: "bg-orange-500/10", icon: <Briefcase className="w-3 h-3" />, label: "Hiring" },
  hiring: { color: "text-orange-400", bg: "bg-orange-500/10", icon: <Briefcase className="w-3 h-3" />, label: "Hiring" },
  closed: { color: "text-muted-foreground", bg: "bg-muted", icon: <Activity className="w-3 h-3" />, label: "Closed" },
  completed: { color: "text-primary", bg: "bg-primary/10", icon: <Activity className="w-3 h-3" />, label: "Fulfilled" },
};

export default function BuyerProjectsPage() {
  const { user } = useAuth();
  const [dbJobs, setDbJobs] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [proposalCounts, setProposalCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!user) return;

    // Fetch ONLY manual job posts
    const jobsQuery = query(
      collection(db, "jobs"),
      where("buyerId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(jobsQuery, async (snapshot) => {
        let jobsData = snapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data(),
            budget: (doc.data() as any).budgetAmount ? `$${(doc.data() as any).budgetAmount}` : "Fixed"
        }));

        // Sort client-side
        jobsData.sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        
        setDbJobs(jobsData);
        if (jobsData.length > 0 && !selectedProject) {
            setSelectedProject(jobsData[0]);
        }
        setLoading(false);

        // Fetch proposal counts for each job
        const counts: Record<string, number> = {};
        for (const job of jobsData) {
            const pQuery = query(collection(db, "proposals"), where("projectId", "==", job.id));
            const pSnap = await getDocs(pQuery);
            counts[job.id] = pSnap.size;
        }
        setProposalCounts(counts);
    }, (error) => {
        console.error("Snapshot error:", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const filtered = dbJobs.filter((p) => p.title?.toLowerCase().includes(search.toLowerCase()));

  return (
    <DashboardLayout navItems={BUYER_NAV} userRole="Buyer">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-black text-foreground mb-2 italic tracking-tight uppercase">Active Postings</h1>
            <p className="text-muted-foreground font-medium tracking-wide">
              Manage your open requirements and hiring pipeline.
            </p>
          </div>
          <Button
            asChild
            className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest gap-3 shadow-[0_0_30px_rgba(16,185,129,0.2)]"
          >
            <Link href="/dashboard/buyer/jobs/create">
              <Plus className="w-5 h-5" />
              Post New Job
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
          <div className="xl:col-span-2 space-y-4">
            <div className="bg-card border border-border rounded-[28px] p-4 flex items-center gap-4 focus-within:border-emerald-500 transition-all shadow-2xl">
              <Search className="w-5 h-5 text-muted-foreground shrink-0 ml-2" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search job posts..."
                className="bg-transparent border-none outline-none text-foreground text-sm w-full font-bold"
              />
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {loading ? (
                  <div className="py-20 text-center text-muted-foreground font-black italic uppercase animate-pulse">Syncing...</div>
              ) : filtered.length === 0 ? (
                  <div className="text-center py-20 bg-card/30 border border-dashed border-border rounded-[40px]">
                    <Briefcase className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground font-black uppercase tracking-widest text-[10px]">No job postings found</p>
                  </div>
              ) : filtered.map((project) => {
                const sc = statusConfig[project.status] || statusConfig.open;
                const isSelected = selectedProject?.id === project.id;
                return (
                  <button
                    key={project.id}
                    onClick={() => setSelectedProject(project)}
                    className={`w-full text-left p-6 rounded-[32px] border transition-all relative overflow-hidden group ${
                      isSelected ? "bg-primary/5 border-primary/50 shadow-2xl" : "bg-card border-border hover:border-slate-600"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-4">
                        <h3 className="text-foreground font-black text-lg uppercase italic tracking-tighter">{project.title}</h3>
                        <ChevronRight className={`w-5 h-5 transition-all mt-1 ${isSelected ? "text-primary translate-x-1" : "text-muted-foreground"}`} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center gap-2 text-[10px] font-black uppercase px-4 py-1.5 rounded-full tracking-widest ${sc.bg} ${sc.color}`}>
                        {sc.label}
                      </span>
                      <span className="text-foreground font-black text-xl italic">{project.budget}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="xl:col-span-3">
            {selectedProject ? (
                <div className="bg-card border border-border rounded-[56px] overflow-hidden sticky top-8 shadow-3xl">
                    <div className="p-12 border-b border-border bg-background/20">
                        <div className="flex flex-col gap-4 mb-8">
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black bg-primary/10 text-primary border border-primary/20 px-4 py-1.5 rounded-full uppercase tracking-widest">
                                    {selectedProject.category || "Strategic Node"}
                                </span>
                                <span className={`inline-flex items-center gap-2 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest ${statusConfig[selectedProject.status]?.bg || 'bg-muted'} ${statusConfig[selectedProject.status]?.color || 'text-foreground'}`}>
                                    {statusConfig[selectedProject.status]?.label || "Hiring"}
                                </span>
                            </div>
                            <h2 className="text-4xl font-black text-foreground italic tracking-tighter leading-none uppercase">{selectedProject.title}</h2>
                        </div>
                        <p className="text-muted-foreground text-lg leading-relaxed font-medium mb-10 max-w-2xl">{selectedProject.description}</p>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-6 bg-background rounded-3xl border border-border">
                                <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-1 flex items-center gap-2"><Target className="w-3 h-3" /> Expertise</p>
                                <p className="text-foreground font-bold">{selectedProject.skillLevel || "Not Specified"}</p>
                            </div>
                            <div className="p-6 bg-background rounded-3xl border border-border">
                                <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-1 flex items-center gap-2"><Calendar className="w-3 h-3" /> Deployment</p>
                                <p className="text-foreground font-bold">{selectedProject.createdAt ? new Date(selectedProject.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 divide-x divide-slate-800 border-b border-border bg-background/40">
                        <div className="p-10 text-center">
                            <p className="text-muted-foreground mb-2 text-[10px] font-black uppercase tracking-widest">Value Threshold</p>
                            <p className="text-3xl font-black italic tracking-tighter text-foreground">{selectedProject.budget}</p>
                        </div>
                        <div className="p-10 text-center">
                            <p className="text-muted-foreground mb-2 text-[10px] font-black uppercase tracking-widest">Active Applications</p>
                            <p className="text-3xl font-black italic tracking-tighter text-primary">{proposalCounts[selectedProject.id] || 0}</p>
                        </div>
                    </div>

                    <div className="p-12">
                        <div className="flex gap-6">
                            <Button asChild className="flex-1 h-20 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-[0.2em] rounded-[24px] shadow-2xl shadow-primary/20 text-lg italic">
                                <Link href="/dashboard/buyer/proposals">
                                    Review Proposals
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="h-20 px-10 border-border bg-background text-foreground rounded-[24px] hover:border-primary transition-all">
                                <Link href="/dashboard/buyer/proposals">
                                    <MessageSquare className="w-6 h-6" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="h-full bg-card/30 border border-dashed border-border rounded-[56px] flex flex-col items-center justify-center p-20 text-center">
                    <h3 className="text-2xl font-black text-foreground mb-4 uppercase italic">No Selection</h3>
                    <p className="text-muted-foreground text-lg font-medium italic">Select a project node to manage its hiring pipeline.</p>
                </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
