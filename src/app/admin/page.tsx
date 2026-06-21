"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  ArrowUpRight, 
  ArrowDownRight,
  Activity,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { db } from "@/lib/firebase";
import { 
    collection, 
    query, 
    onSnapshot, 
    doc, 
    updateDoc, 
    increment, 
    serverTimestamp,
    addDoc,
    orderBy
} from "firebase/firestore";
import { Button } from "@/components/ui/button";

export default function AdminOverview() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([
    { label: "Total Revenue", value: "$0", trend: "+0%", color: "text-primary" },
    { label: "Active Users", value: "0", trend: "+0%", color: "text-blue-500" },
    { label: "Pending Deposits", value: "0", trend: "Live", color: "text-yellow-500" },
    { label: "Pending Withdrawals", value: "0", trend: "Live", color: "text-purple-500" },
  ]);

  useEffect(() => {
    // 1. Sync Deposit Requests
    const qDep = query(collection(db, "deposit_requests"), orderBy("createdAt", "desc"));
    const unsubDep = onSnapshot(qDep, (snap) => {
        const depList = snap.docs.map(d => ({ id: d.id, ...(d.data() as any), reqType: "deposit" }));
        setRequests(prev => {
            const others = prev.filter(r => r.reqType !== "deposit");
            return [...depList, ...others].sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        });
        setLoading(false);
    });

    // 2. Sync Withdraw Requests
    const qWit = query(collection(db, "withdraw_requests"), orderBy("createdAt", "desc"));
    const unsubWit = onSnapshot(qWit, (snapW) => {
        const witList = snapW.docs.map(d => ({ id: d.id, ...(d.data() as any), reqType: "withdraw" }));
        setRequests(prev => {
            const others = prev.filter(r => r.reqType !== "withdraw");
            return [...witList, ...others].sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        });
        setLoading(false);
    });

    // 3. Sync Stats Calculation
    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
        setStats(prev => {
            const newStats = [...prev];
            newStats[1] = { ...newStats[1], value: snap.size.toString() };
            return newStats;
        });
    });

    return () => {
        unsubDep();
        unsubWit();
        unsubUsers();
    };
  }, []);

  const handleAction = async (request: any, action: "approve" | "decline") => {
    if (!confirm(`Are you sure you want to ${action} this request?`)) return;
    
    try {
        const ref = doc(db, request.reqType === "deposit" ? "deposit_requests" : "withdraw_requests", request.id);
        
        if (action === "approve") {
            if (request.reqType === "deposit") {
                // Add balance to user
                await updateDoc(doc(db, "users", request.userId), {
                    balance: increment(request.amount)
                });
            } else {
                // Withdraw: Deduct balance from user
                await updateDoc(doc(db, "users", request.userId), {
                    balance: increment(-request.requestedAmount)
                });
            }
            await updateDoc(ref, { status: "approved", processedAt: serverTimestamp() });
            
            // Notify user
            await addDoc(collection(db, "notifications"), {
                recipientId: request.userId,
                message: `Your ${request.reqType} of $${request.amount || request.requestedAmount} has been approved!`,
                type: "finance",
                read: false,
                createdAt: serverTimestamp()
            });
        } else {
            await updateDoc(ref, { status: "declined", processedAt: serverTimestamp() });
        }
        alert(`Request ${action}d successfully.`);
    } catch (err) {
        console.error(err);
        alert("Operation failed.");
    }
  };

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-black text-foreground tracking-tight mb-2 uppercase italic">Financial Ops Hub</h1>
            <p className="text-muted-foreground text-sm font-medium">Verify and synchronize global capital flows.</p>
        </div>
        <div className="flex gap-4">
            <div className="bg-card border border-border rounded-xl px-6 py-2 flex flex-col justify-center">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Active Nodes</p>
                <p className="text-foreground font-black italic">VerteX Core-1</p>
            </div>
            <div className="bg-primary rounded-xl px-6 py-2 flex flex-col justify-center shadow-lg shadow-primary/20">
                <p className="text-[10px] font-bold text-primary-foreground/70 uppercase tracking-widest">System Status</p>
                <p className="text-primary-foreground font-black italic">Operational</p>
            </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
            <div key={i} className="bg-card border border-border p-8 rounded-[38px] hover:border-primary/30 transition-all group overflow-hidden relative shadow-xl">
                <div className="relative z-10">
                    <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] mb-4">{stat.label}</p>
                    <div className="flex items-end justify-between">
                        <h2 className="text-4xl font-black text-foreground italic tracking-tighter">{stat.value}</h2>
                        <div className={`flex items-center gap-1 text-[10px] font-black ${stat.color} bg-background p-2 rounded-xl border border-border`}>
                            {stat.trend}
                        </div>
                    </div>
                </div>
            </div>
        ))}
      </div>

      <div className="space-y-8">
        <div className="bg-card border border-border rounded-[48px] overflow-hidden shadow-2xl">
            <div className="p-10 border-b border-border/50 flex items-center justify-between bg-background/20">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20">
                        <Activity className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-black text-foreground uppercase italic tracking-tighter">Pending Signal Buffer</h3>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Neural Live Stream</span>
                </div>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-background/30">
                            <th className="px-10 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Request Node</th>
                            <th className="px-10 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest">User / Email</th>
                            <th className="px-10 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Amount / Details</th>
                            <th className="px-10 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Status / Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                        {requests.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-10 py-20 text-center text-muted-foreground font-black uppercase tracking-widest italic opacity-40">No financial signals detected.</td>
                            </tr>
                        ) : requests.map((req, i) => (
                            <tr key={i} className="hover:bg-primary/5 transition-all group">
                                <td className="px-10 py-8">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
                                            req.reqType === "deposit" ? "bg-emerald-500/10 text-emerald-500" : "bg-purple-500/10 text-purple-500"
                                        }`}>
                                            {req.reqType === "deposit" ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownRight className="w-6 h-6" />}
                                        </div>
                                        <div>
                                            <p className="text-foreground font-black uppercase italic tracking-tighter text-lg">{req.reqType}</p>
                                            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">{req.id.slice(0,8)}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-10 py-8">
                                    <p className="text-foreground font-black text-sm">{req.userName || "Unknown"}</p>
                                    <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">{req.userEmail || "HIDDEN"}</p>
                                </td>
                                <td className="px-10 py-8">
                                    <div className="space-y-1">
                                        <p className="text-2xl font-black text-foreground italic tracking-tighter">
                                            ${req.amount || req.requestedAmount}
                                        </p>
                                        {req.reqType === "deposit" ? (
                                            <p className="text-[10px] text-primary font-black uppercase tracking-widest">TRX ID: {req.transactionId}</p>
                                        ) : (
                                            <p className="text-[10px] text-purple-400 font-black uppercase tracking-widest">Net Payout: ${req.payoutAmount} (5%)</p>
                                        )}
                                        <p className="text-[9px] text-muted-foreground font-medium italic opacity-60">
                                            {req.bankName} :: {req.accountNumber}
                                        </p>
                                    </div>
                                </td>
                                <td className="px-10 py-8">
                                    {req.status === "pending" ? (
                                        <div className="flex items-center gap-3">
                                            <Button 
                                                onClick={() => handleAction(req, "approve")}
                                                size="sm" 
                                                className="h-10 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl gap-2 font-black uppercase tracking-widest text-[9px]"
                                            >
                                                <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                                            </Button>
                                            <Button 
                                                onClick={() => handleAction(req, "decline")}
                                                size="sm" 
                                                variant="outline"
                                                className="h-10 px-4 border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white rounded-xl gap-2 font-black uppercase tracking-widest text-[9px]"
                                            >
                                                <XCircle className="w-3.5 h-3.5" /> Decline
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl w-fit ${
                                            req.status === "approved" ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                                        }`}>
                                            {req.status === "approved" ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                            {req.status}
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  );
}

