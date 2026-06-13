"use client";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { BUYER_NAV } from "@/constants/navigation";
import { 
  Wallet as WalletIcon, 
  ArrowUpRight, 
  Plus, 
  CreditCard,
  Building2,
  Smartphone,
  ShieldCheck,
  History,
  TrendingDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { collection, query, where, orderBy, limit, onSnapshot, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import DepositModal from "@/components/dashboard/DepositModal";
import EscrowAuditModal from "@/components/dashboard/EscrowAuditModal";

export default function BuyerWalletPage() {
  const { user, userData } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [liveBalance, setLiveBalance] = useState(0);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

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

  // Sync Transactions & Requests
  useEffect(() => {
    if (!user) return;
    
    // Listen to Orders
    const qOrders = query(
        collection(db, "orders"),
        where("buyerId", "==", user.uid),
        limit(20)
    );

    // Listen to Deposit Requests
    const qDeps = query(
        collection(db, "deposit_requests"),
        where("userId", "==", user.uid),
        limit(20)
    );

    let orders: any[] = [];
    let deposits: any[] = [];

    const unsubscribeOrders = onSnapshot(qOrders, (snapshot) => {
        orders = snapshot.docs.map(doc => ({ id: doc.id, txType: "order", ...doc.data() }));
        combineAndSet();
    });

    const unsubscribeDeps = onSnapshot(qDeps, (snapshot) => {
        deposits = snapshot.docs.map(doc => ({ id: doc.id, txType: "deposit", ...doc.data() }));
        combineAndSet();
    });

    const combineAndSet = () => {
        const combined = [...orders, ...deposits].sort((a, b) => {
            const timeA = a.createdAt?.toMillis?.() || 0;
            const timeB = b.createdAt?.toMillis?.() || 0;
            return timeB - timeA;
        });
        setTransactions(combined.slice(0, 8));
        setLoadingTransactions(false);
    };

    return () => {
        unsubscribeOrders();
        unsubscribeDeps();
    };
  }, [user]);

  return (
    <DashboardLayout navItems={BUYER_NAV} userRole="Buyer">
      <DepositModal 
        isOpen={isDepositModalOpen} 
        onClose={() => setIsDepositModalOpen(false)} 
        userId={user?.uid || ""} 
      />
      <EscrowAuditModal 
        isOpen={isAuditModalOpen} 
        onClose={() => setIsAuditModalOpen(false)} 
        userId={user?.uid || ""} 
      />
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-black text-foreground mb-4 uppercase italic tracking-tighter italic">Wallet Core</h1>
          <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest opacity-60">Manage your strategic assets and escrow nodes.</p>
        </div>

        {/* Balance Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <div className="lg:col-span-2 bg-foreground border border-border rounded-[48px] p-10 text-background relative overflow-hidden shadow-2xl">
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center font-black text-primary-foreground text-xl italic">V</div>
                        <span className="text-xs font-black uppercase tracking-[0.4em]">VerteX Escrow Protocol</span>
                    </div>
                    <p className="text-background/60 text-xs font-black uppercase tracking-[0.3em] mb-3">Net Liquidity</p>
                    <h2 className="text-6xl md:text-7xl font-black mb-12 italic tracking-tighter">
                        ${liveBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </h2>
                    
                    <div className="flex flex-wrap gap-6">
                        <Button 
                            onClick={() => setIsDepositModalOpen(true)}
                            className="h-16 px-10 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl gap-3 uppercase italic tracking-widest text-xs transition-all hover:scale-105 border-none active:scale-95"
                        >
                            <Plus className="w-5 h-5" />
                            Add Credit
                        </Button>
                        <Button 
                            variant="outline" 
                            onClick={() => setIsAuditModalOpen(true)}
                            className="h-16 px-10 border-primary text-primary hover:bg-primary/10 rounded-2xl font-black uppercase italic tracking-widest text-xs transition-all active:scale-95"
                        >
                            Track Held Funds
                        </Button>
                    </div>
                </div>
                <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-primary/20 blur-[120px] rounded-full"></div>
                <div className="absolute top-0 right-0 p-10 opacity-10">
                    <WalletIcon className="w-48 h-48 -rotate-12" />
                </div>
            </div>

            <div className="space-y-6">
                <div className="bg-card border border-border p-8 rounded-[40px] shadow-xl">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center border border-primary/20">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <h4 className="text-foreground font-black uppercase italic tracking-tighter">Escrow Status</h4>
                    </div>
                    <p className="text-muted-foreground text-[10px] uppercase tracking-widest leading-relaxed font-bold">Secure funds held in active project nodes. Totaling <span className="text-primary">$0.00</span> currently.</p>
                </div>
                <div className="bg-card border border-border p-8 rounded-[40px] shadow-xl">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center border border-blue-500/20">
                            <TrendingDown className="w-6 h-6" />
                        </div>
                        <h4 className="text-foreground font-black uppercase italic tracking-tighter">Burn Rate</h4>
                    </div>
                    <p className="text-muted-foreground text-[10px] uppercase tracking-widest leading-relaxed font-bold">Monthly expenditure tracking is <span className="text-blue-400">Stable</span>. Operational efficiency at 94%.</p>
                </div>
            </div>
        </div>

        {/* Payment Logic / Methods */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <div className="bg-card border border-border rounded-[48px] p-10 shadow-xl">
                <h3 className="text-2xl font-black text-foreground mb-10 uppercase italic tracking-tighter">Quick Deposit</h3>
                <div className="space-y-4">
                    {[
                        { name: "Digital Credit Node", icon: <CreditCard /> },
                        { name: "Secure Bank Wire", icon: <Building2 /> },
                        { name: "Mobile Neural Pay", icon: <Smartphone /> }
                    ].map((m) => (
                        <div 
                            key={m.name} 
                            onClick={() => setIsDepositModalOpen(true)}
                            className="p-6 bg-background border border-border rounded-3xl flex items-center justify-between group hover:border-primary transition-all cursor-pointer active:scale-[0.98]"
                        >
                            <div className="flex items-center gap-6">
                                <div className="w-12 h-12 bg-card rounded-2xl flex items-center justify-center font-bold text-muted-foreground group-hover:text-primary transition-colors border border-border shadow-sm">
                                    {m.icon}
                                </div>
                                <span className="text-foreground text-sm font-black uppercase italic tracking-widest">{m.name}</span>
                            </div>
                            <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-card border border-border rounded-[48px] p-10 shadow-xl">
                <h3 className="text-2xl font-black text-foreground mb-10 uppercase italic tracking-tighter">Node Activity</h3>
                <div className="space-y-8 min-h-[200px]">
                    {loadingTransactions ? (
                        <div className="flex items-center justify-center h-40 text-muted-foreground font-bold italic animate-pulse uppercase tracking-widest">Scanning History...</div>
                    ) : transactions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                            <History className="w-10 h-10 mb-4 opacity-20" />
                            <p className="text-[10px] font-black uppercase tracking-[0.2em]">No Transactional data found.</p>
                        </div>
                    ) : (
                        transactions.map((tx, i) => (
                            <div key={i} className="flex items-center justify-between group">
                                <div className="flex items-center gap-6">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${tx.txType === 'deposit' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'} border border-border`}>
                                        <ArrowUpRight className={`w-6 h-6 ${tx.txType === 'deposit' ? '' : 'rotate-180'}`} />
                                    </div>
                                    <div>
                                        <p className="text-foreground text-sm font-black uppercase italic truncate max-w-[200px]">
                                            {tx.txType === 'deposit' ? 'Deposit Request' : (tx.gigTitle || "Project Service")}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                                            {tx.createdAt?.toDate ? tx.createdAt.toDate().toLocaleDateString() : "Just now"} :: {tx.status}
                                        </p>
                                    </div>
                                </div>
                                <span className={`text-xl font-black italic tracking-tighter ${tx.txType === 'deposit' ? "text-primary" : "text-foreground"}`}>
                                    {tx.txType === 'deposit' ? '+' : '-'}${tx.totalPrice || tx.amount || 0}
                                </span>
                            </div>
                        ))
                    )}
                </div>
                <Button variant="ghost" className="w-full mt-12 h-12 text-muted-foreground hover:text-primary font-black uppercase tracking-widest text-[10px] border border-border rounded-2xl hover:bg-muted">
                    Open Audit Ledger
                </Button>
            </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
