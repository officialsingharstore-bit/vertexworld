"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { FREELANCER_NAV } from "@/constants/navigation";
import { 
  Wallet as WalletIcon, 
  ArrowUpRight, 
  ArrowDownLeft,
  DollarSign,
  TrendingUp,
  History,
  ShieldCheck,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { collection, query, where, orderBy, limit, onSnapshot, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import DepositModal from "@/components/dashboard/DepositModal";
import WithdrawModal from "@/components/dashboard/WithdrawModal";

export default function FreelancerEarningsPage() {
  const { user, userData } = useAuth();
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [liveBalance, setLiveBalance] = useState(0);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

  // Sync Live Balance
  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(doc(db, "users", user.uid), (doc) => {
        if (doc.exists()) {
            setLiveBalance(doc.data().balance || 0);
        }
    });
    return () => unsubscribe();
  }, [user]);

  // Sync Orders / Earnings
  useEffect(() => {
    if (!user) return;
    const q = query(
        collection(db, "orders"),
        where("freelancerId", "==", user.uid),
        orderBy("createdAt", "desc"),
        limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const txs = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        setPayouts(txs);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <DashboardLayout navItems={FREELANCER_NAV} userRole="Freelancer">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-black text-foreground mb-4 uppercase italic tracking-tighter">Earnings Node</h1>
          <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest opacity-60">Track your strategic revenue and neural payouts.</p>
        </div>

        {/* Balance Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <div className="lg:col-span-2 bg-primary border border-border rounded-[48px] p-10 text-primary-foreground relative overflow-hidden shadow-2xl">
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="w-10 h-10 bg-black rounded-2xl flex items-center justify-center font-black text-primary text-xl italic transition-transform hover:scale-110">V</div>
                        <span className="text-xs font-black uppercase tracking-[0.4em]">VerteX Revenue Protocol</span>
                    </div>
                    <p className="text-primary-foreground/60 text-xs font-black uppercase tracking-[0.3em] mb-3">Available for Withdrawal</p>
                    <h2 className="text-6xl md:text-7xl font-black mb-12 italic tracking-tighter">
                        ${liveBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </h2>
                    
                    <div className="flex flex-wrap gap-4 md:gap-6">
                        <Button 
                            onClick={() => setIsDepositOpen(true)}
                            className="flex-1 sm:flex-none h-16 px-6 md:px-10 bg-black text-primary hover:bg-black/80 font-black rounded-2xl gap-3 uppercase italic tracking-widest text-[10px] md:text-xs transition-all hover:scale-105 border-none"
                        >
                            <Zap className="w-5 h-5 shrink-0" />
                            Add Credit / Funds
                        </Button>
                        <Button 
                            variant="outline" 
                            onClick={() => setIsWithdrawOpen(true)}
                            className="flex-1 sm:flex-none h-16 px-6 md:px-10 border-black/20 text-black dark:text-foreground hover:bg-black/5 dark:hover:bg-white/5 rounded-2xl font-black uppercase italic tracking-widest text-[10px] md:text-xs"
                        >
                            Initialize Withdrawal
                        </Button>
                    </div>
                </div>
                <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-black/5 blur-[120px] rounded-full"></div>
            </div>

            <div className="space-y-6">
                <div className="bg-card border border-border p-8 rounded-[40px] shadow-xl">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center border border-primary/20">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <h4 className="text-foreground font-black uppercase italic tracking-tighter">Growth Node</h4>
                    </div>
                    <p className="text-muted-foreground text-[10px] uppercase tracking-widest leading-relaxed font-bold">Your quarterly revenue is <span className="text-primary">+18% higher</span>. Secure performance detected.</p>
                </div>
                <div className="bg-card border border-border p-8 rounded-[40px] shadow-xl">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center border border-blue-500/20">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <h4 className="text-foreground font-black uppercase italic tracking-tighter">Safety Escrow</h4>
                    </div>
                    <p className="text-muted-foreground text-[10px] uppercase tracking-widest leading-relaxed font-bold">VerteX Escrow guarantees 100% payout security for all verified project nodes.</p>
                </div>
            </div>
        </div>

        {/* Transaction History */}
        <div className="bg-card border border-border rounded-[48px] p-10 shadow-xl overflow-hidden relative">
            <h3 className="text-2xl font-black text-foreground mb-10 uppercase italic tracking-tighter">Payment Stream</h3>
            <div className="space-y-8 min-h-[300px]">
                {loading ? (
                    <div className="flex items-center justify-center h-48 text-muted-foreground font-black uppercase tracking-[0.5em] animate-pulse">Syncing Network...</div>
                ) : payouts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                        <History className="w-16 h-16 mb-4 opacity-20" />
                        <p className="text-xs font-black uppercase tracking-widest">No spectral earnings found.</p>
                    </div>
                ) : (
                    payouts.map((tx, i) => (
                        <div key={i} className="flex items-center justify-between group p-4 hover:bg-muted/30 rounded-3xl transition-all border border-transparent hover:border-border">
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center border border-primary/20">
                                    <Zap className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-foreground text-sm font-black uppercase italic truncate max-w-[300px]">{tx.gigTitle || "Strategic Project Node"}</p>
                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.3em] mt-1">{tx.createdAt?.toDate ? tx.createdAt.toDate().toLocaleDateString() : "Just now"} :: {tx.status}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-black text-primary italic tracking-tighter">+${tx.totalPrice || 0}</p>
                                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Processed</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
            <Button variant="ghost" className="w-full mt-12 h-14 text-muted-foreground hover:text-primary font-black uppercase tracking-widest text-[10px] border border-border rounded-2xl hover:bg-muted">
                Download Neural Payout Logs
            </Button>
        </div>
      </div>
      
      {user && (
        <>
            <DepositModal 
                isOpen={isDepositOpen} 
                onClose={() => setIsDepositOpen(false)} 
                userId={user.uid} 
            />
            <WithdrawModal
                isOpen={isWithdrawOpen}
                onClose={() => setIsWithdrawOpen(false)}
                user={user}
                userData={userData}
            />
        </>
      )}
    </DashboardLayout>
  );
}
