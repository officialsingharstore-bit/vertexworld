"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { BUYER_NAV } from "@/constants/navigation";
import { 
  Rocket, 
  Users, 
  Briefcase, 
  ArrowUpRight, 
  FileText, 
  Plus,
  Star,
  Search,
  Zap,
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, getDocs, limit } from "firebase/firestore";

export default function BuyerDashboard() {
  const { user, userData } = useAuth();
  const [activeJobs, setActiveJobs] = useState<any[]>([]);
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Fetch active jobs
    const qJobs = query(collection(db, "jobs"), where("buyerId", "==", user.uid));
    const unsubJobs = onSnapshot(qJobs, (snap) => {
        setActiveJobs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Fetch all proposals to this buyer
    const qProps = query(collection(db, "proposals"), where("buyerId", "==", user.uid));
    const unsubProps = onSnapshot(qProps, (snap) => {
        setProposals(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    setLoading(false);
    return () => { unsubJobs(); unsubProps(); };
  }, [user]);

  const stats = [
    { label: "Active Jobs", value: activeJobs.length.toString(), icon: <Briefcase />, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Neural Payouts", value: `$${(userData?.totalSpent || 0).toLocaleString()}`, icon: <Rocket />, color: "text-primary", bg: "bg-primary/10" },
    { label: "Talent Nodes", value: "0", icon: <Users />, color: "text-purple-400", bg: "bg-purple-500/10" },
    { label: "Proposals", value: proposals.length.toString(), icon: <FileText />, color: "text-pink-400", bg: "bg-pink-500/10" },
  ];

  return (
    <DashboardLayout navItems={BUYER_NAV} userRole="Buyer">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-foreground mb-2 italic uppercase tracking-tighter">Strategic Ops Hub</h1>
            <p className="text-muted-foreground font-medium tracking-wide">Command center for elite project node management.</p>
          </div>
          <div className="flex gap-4">
            <Button asChild variant="outline" className="h-14 px-8 rounded-2xl border-border bg-card text-foreground gap-3 hover:border-primary transition-all">
                <Link href="/marketplace">
                    <Search className="w-5 h-5 text-primary" />
                    Locate Talent
                </Link>
            </Button>
            <Button asChild className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black gap-3 uppercase italic tracking-widest shadow-2xl shadow-primary/20">
                <Link href="/dashboard/buyer/jobs/create">
                    <Plus className="w-5 h-5" />
                    Post Mission
                </Link>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {stats.map((stat, i) => (
            <div key={i} className="bg-card border border-border p-8 rounded-[38px] hover:border-primary/30 transition-all group">
              <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-[20px] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                {stat.icon}
              </div>
              <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.3em] mb-2">{stat.label}</p>
              <div className="flex items-center justify-between">
                <span className="text-3xl font-black text-foreground italic tracking-tighter">{stat.value}</span>
                <span className="flex items-center gap-1 text-[10px] font-black text-primary bg-primary/10 px-3 py-1 rounded-full">
                    <ArrowUpRight className="w-3 h-3" />
                    LIVE
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Recent Mission Hub */}
          <div className="lg:col-span-2">
            <div className="bg-card border border-border rounded-[48px] overflow-hidden shadow-3xl">
                <div className="p-8 border-b border-border flex items-center justify-between bg-background/20">
                    <h3 className="text-xl font-black text-foreground uppercase italic tracking-tighter">Active Missions</h3>
                    <Button variant="ghost" asChild size="sm" className="text-primary hover:bg-primary/10 h-10 font-black uppercase tracking-widest text-[10px]">
                        <Link href="/dashboard/buyer/projects">Command All</Link>
                    </Button>
                </div>
                <div className="divide-y divide-border">
                    {activeJobs.length === 0 ? (
                        <div className="p-20 text-center">
                            <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground font-bold uppercase tracking-widest italic">No active missions deployed.</p>
                        </div>
                    ) : activeJobs.slice(0, 5).map((job, i) => {
                        const jobProps = proposals.filter(p => p.projectId === job.id);
                        return (
                            <div key={i} className="p-8 hover:bg-white/5 transition-all flex items-center justify-between gap-6 group">
                                <div className="min-w-0">
                                    <h4 className="text-foreground font-black text-lg mb-1 truncate group-hover:text-primary transition-colors uppercase italic tracking-tighter">{job.title}</h4>
                                    <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                        <Activity className="w-3 h-3" />
                                        {jobProps.length} Signals Received • <span className="text-primary">${job.budgetAmount || job.budgetMin}</span>
                                    </p>
                                </div>
                                <div className="text-right shrink-0">
                                    <Link href="/dashboard/buyer/proposals">
                                        <div className="text-[9px] font-black px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 uppercase tracking-widest hover:bg-primary hover:text-foreground transition-all">
                                            Sync Signals
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
          </div>

          {/* Expert Node Stats */}
          <div className="space-y-8">
            <div className="bg-card border border-border rounded-[48px] p-10 shadow-3xl">
                <h3 className="text-lg font-black text-foreground italic uppercase tracking-tighter mb-8 flex items-center gap-3">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    Elite Talent Nodes
                </h3>
                <div className="space-y-8">
                    <div className="text-center py-10 opacity-40">
                         <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                         <p className="text-muted-foreground font-black text-[10px] uppercase tracking-widest">No talent hired yet.</p>
                    </div>
                </div>
                <Button variant="outline" asChild className="w-full mt-8 h-14 rounded-2xl border-border text-[10px] font-black uppercase tracking-[0.2em] text-foreground hover:bg-muted transition-all">
                    <Link href="/marketplace">Source New Nodes</Link>
                </Button>
            </div>
            
            <div className="bg-primary rounded-[48px] p-10 relative overflow-hidden group shadow-2xl shadow-primary/20">
                <div className="relative z-10">
                    <p className="text-foreground/60 text-[10px] font-black uppercase tracking-widest mb-2">Vault Security</p>
                    <h4 className="text-3xl font-black text-foreground italic uppercase tracking-tighter leading-none mb-6 text-slate-950">Active Escrow</h4>
                    <p className="text-foreground/90 text-sm font-medium italic mb-8">Your transactions are shielded by the VerteX neural escrow layer.</p>
                    <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full bg-background w-full animate-pulse"></div>
                    </div>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl -translate-y-1/2 translate-x-1/2 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
