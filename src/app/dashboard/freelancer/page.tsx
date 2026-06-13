"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Link from "next/link";
import { FREELANCER_NAV } from "@/constants/navigation";
import { 
  Wallet, 
  TrendingUp, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  MessageSquare,
  Star,
  Search,
  Zap,
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

export default function FreelancerDashboard() {
  const { user, userData } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "orders"),
      where("freelancerId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Client-side sort to bypass index
      ordersData.sort((a, b) => {
        const tA = (a as any).createdAt?.seconds || 0;
        const tB = (b as any).createdAt?.seconds || 0;
        return tB - tA;
      });

      setOrders(ordersData);
      setLoadingOrders(false);
    }, (err) => {
      console.error("Orders feed fail:", err);
      setLoadingOrders(false);
    });

    return () => unsubscribe();
  }, [user]);

  const stats = [
    { label: "Neural Wallet", value: `$${(userData?.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: <Wallet />, color: "text-primary", bg: "bg-primary/10" },
    { label: "Active Nodes", value: orders.filter(o => o.status === 'active').length.toString(), icon: <Clock />, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Total Revenue", value: `$${(userData?.totalEarned || 0).toLocaleString()}`, icon: <TrendingUp />, color: "text-purple-400", bg: "bg-purple-500/10" },
    { label: "Trust Score", value: "98%", icon: <CheckCircle2 />, color: "text-pink-400", bg: "bg-pink-500/10" },
  ];

  const displayName = userData?.fullName || "Elite Talent";

  return (
    <DashboardLayout navItems={FREELANCER_NAV} userRole="Freelancer">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-foreground mb-2 italic uppercase tracking-tighter">Welcome, {displayName}!</h1>
            <p className="text-muted-foreground font-medium tracking-wide">Syncing your professional neural network. {orders.length} events logged.</p>
          </div>
          <div className="flex gap-4">
            <Button asChild variant="outline" className="h-14 px-8 rounded-2xl border-border bg-card text-foreground gap-3 hover:border-primary transition-all">
              <Link href="/dashboard/freelancer/earnings">Transfer Funds</Link>
            </Button>
            <Button asChild className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black gap-3 uppercase italic tracking-widest shadow-2xl shadow-primary/20">
              <Link href="/dashboard/freelancer/gigs/create">Deploy New Gig</Link>
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
                    <Activity className="w-3 h-3" />
                    SYNC
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Active Orders Workspace */}
          <div className="lg:col-span-2">
            <div className="bg-card border border-border rounded-[48px] overflow-hidden shadow-3xl">
                <div className="p-8 border-b border-border flex items-center justify-between bg-background/20">
                    <h3 className="text-xl font-black text-foreground italic tracking-tighter uppercase flex items-center gap-4">
                        <Clock className="w-6 h-6 text-primary" />
                        Active Operational Nodes
                    </h3>
                    <Button variant="ghost" asChild size="sm" className="text-primary hover:bg-primary/10 h-10 font-black uppercase tracking-widest text-[10px]">
                        <Link href="/dashboard/freelancer/orders">Expand All</Link>
                    </Button>
                </div>
                <div className="divide-y divide-border">
                    {loadingOrders ? (
                        <div className="p-20 text-center text-muted-foreground font-black italic animate-pulse">Scanning orders collection...</div>
                    ) : orders.length === 0 ? (
                        <div className="p-24 text-center">
                            <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-6" />
                            <p className="text-muted-foreground font-black uppercase tracking-widest mb-6 italic text-sm">No active operations detected.</p>
                            <Button asChild variant="outline" className="h-10 rounded-xl border-border text-[10px] uppercase font-black tracking-widest">
                                <Link href="/marketplace">Search Marketplace</Link>
                            </Button>
                        </div>
                    ) : orders.slice(0, 5).map((order) => (
                        <div key={order.id} className="p-8 hover:bg-white/5 transition-all flex items-center justify-between gap-6 group">
                            <div className="flex items-center gap-6 min-w-0">
                                <div className="w-16 h-16 bg-background rounded-2xl flex items-center justify-center text-primary text-lg font-black shrink-0 border border-border group-hover:border-primary/50 transition-all italic">
                                    {(order.buyerName || "BU").substring(0, 2).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <h4 className="text-foreground font-black text-lg mb-1 truncate uppercase italic tracking-tighter group-hover:text-primary transition-colors">{order.gigTitle}</h4>
                                    <div className="flex items-center gap-3">
                                        <span className="text-muted-foreground text-[9px] font-black uppercase tracking-widest leading-none">Client: {order.buyerName}</span>
                                        <span className="w-1 h-1 bg-white/10 rounded-full"></span>
                                        <span className="text-primary text-[9px] font-black uppercase tracking-widest leading-none">{order.plan} Node</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right shrink-0">
                                <div className="text-foreground font-black text-2xl italic tracking-tighter mb-1">${(order.totalPrice || 0).toLocaleString()}</div>
                                <div className={`text-[9px] font-black px-3 py-1 rounded-full inline-block bg-primary/10 text-primary border border-primary/20 uppercase tracking-[0.2em]`}>
                                    {order.status}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          </div>

          {/* Activity Scroll */}
          <div className="space-y-8">
            <div className="bg-card border border-border rounded-[48px] p-10 shadow-3xl">
                <div className="flex items-center justify-between mb-10">
                    <h3 className="text-lg font-black text-foreground italic uppercase tracking-tighter">Event Signal</h3>
                    <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div className="space-y-8">
                    {orders.length === 0 ? (
                        <div className="text-center py-10 opacity-30">
                            <Activity className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />
                            <p className="text-[10px] font-black uppercase tracking-widest">No signals</p>
                        </div>
                    ) : orders.slice(0, 4).map((order) => (
                        <div key={order.id} className="flex items-center gap-4 group">
                            <div className="w-2 h-2 bg-primary rounded-full shadow-[0_0_15px_rgba(16,185,129,0.8)] animate-pulse"></div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-foreground truncate font-black uppercase italic tracking-tight group-hover:text-primary">Order from {order.buyerName}</p>
                                <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">Recent Node Entry</p>
                            </div>
                        </div>
                    ))}
                </div>
                <Button variant="outline" asChild className="w-full mt-12 h-14 rounded-2xl border-border text-[10px] font-black uppercase tracking-[0.2em] text-foreground hover:bg-muted transition-all">
                    <Link href="/dashboard/freelancer/messages">Initialize Comms</Link>
                </Button>
            </div>

            <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-[56px] p-12 text-slate-950 relative overflow-hidden shadow-2xl shadow-primary/20 group">
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                        <Star className="w-6 h-6 fill-slate-950" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Elite Ranking</span>
                    </div>
                    <h4 className="text-4xl font-black mb-4 leading-none italic uppercase tracking-tighter">Alpha Provider</h4>
                    <p className="text-slate-950/70 text-sm font-medium italic mb-10 leading-relaxed">Sustained mission completion rate is optimal. Maintain output to preserve Level 2 priority.</p>
                    <div className="w-full bg-background/20 h-2.5 rounded-full overflow-hidden">
                        <div className="bg-background h-full w-[92%] shadow-2xl"></div>
                    </div>
                </div>
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/20 blur-3xl -translate-y-1/2 translate-x-1/2 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
