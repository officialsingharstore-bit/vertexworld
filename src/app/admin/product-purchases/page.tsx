"use client";

import { useEffect, useState } from "react";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Package,
  User,
  Hash,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  Search,
  Filter,
  DollarSign
} from "lucide-react";
import { db } from "@/lib/firebase";
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  doc, 
  updateDoc, 
  addDoc, 
  serverTimestamp,
  where,
  getDocs
} from "firebase/firestore";
import { Button } from "@/components/ui/button";

export default function AdminProductPurchasesPage() {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("awaiting_verification");

  useEffect(() => {
    const q = query(
      collection(db, "product_purchases"), 
      orderBy("createdAt", "desc")
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPurchases(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const approvePurchase = async (purchase: any) => {
    if (!confirm(`Verify payment and unlock "${purchase.productTitle}" for ${purchase.userName}?`)) return;
    
    try {
      // 1. Update purchase status
      await updateDoc(doc(db, "product_purchases", purchase.id), {
        status: "active",
        verifiedAt: serverTimestamp()
      });

      // 2. Grant access in user_library
      // First check if already exists to avoid duplicates
      const q = query(
          collection(db, "user_library"),
          where("userId", "==", purchase.userId),
          where("productId", "==", purchase.productId)
      );
      const snap = await getDocs(q);
      
      if (snap.empty) {
          await addDoc(collection(db, "user_library"), {
              userId: purchase.userId,
              productId: purchase.productId,
              unlockedAt: serverTimestamp(),
              purchaseId: purchase.id
          });
      }

      alert("Purchase approved! Protocol access granted.");
    } catch (e) {
      console.error("Approval error:", e);
      alert("Failed to approve. Check console.");
    }
  };

  const rejectPurchase = async (purchaseId: string) => {
    if (!confirm("Reject this purchase request?")) return;
    try {
      await updateDoc(doc(db, "product_purchases", purchaseId), {
        status: "rejected",
        rejectedAt: serverTimestamp()
      });
    } catch (e) {
      alert("Failed to reject.");
    }
  };

  const filteredPurchases = activeFilter === "All" 
    ? purchases 
    : purchases.filter(p => p.status === activeFilter);

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-foreground italic uppercase tracking-tight mb-2">Digital Asset Orders</h1>
          <p className="text-muted-foreground text-sm font-medium">Verify WhatsApp payments and authorize digital node access.</p>
        </div>
        <div className="flex items-center gap-3">
            <div className="px-6 py-2 bg-primary/10 border border-primary/20 rounded-xl">
                <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-0.5">Asset Wealth</p>
                <p className="text-foreground font-black italic">
                    ${purchases.filter(p => p.status === "active").reduce((acc, p) => acc + (p.productPrice || 0), 0).toLocaleString()}
                </p>
            </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#0a0f1d] border border-primary/30 p-8 rounded-[32px] relative overflow-hidden">
              <div className="relative z-10">
                  <p className="text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-4">Awaiting Verification</p>
                  <h2 className="text-4xl font-black text-foreground italic">{purchases.filter(p => p.status === "awaiting_verification").length} Pending</h2>
              </div>
              <Clock className="absolute -bottom-4 -right-4 w-24 h-24 text-primary/10" />
          </div>
          <div className="bg-[#0a0f1d] border border-border p-8 rounded-[32px]">
              <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] mb-4">Total Assets Unlocked</p>
              <h2 className="text-4xl font-black text-foreground italic">{purchases.filter(p => p.status === "active").length}</h2>
          </div>
          <div className="bg-[#0a0f1d] border border-border p-8 rounded-[32px]">
              <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] mb-4">Rejected Requests</p>
              <h2 className="text-4xl font-black text-red-500 italic">
                {purchases.filter(p => p.status === "rejected").length}
              </h2>
          </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-3 flex-wrap">
          {["awaiting_verification", "active", "rejected", "All"].map(f => (
              <button 
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                    activeFilter === f 
                    ? "bg-primary border-emerald-500 text-foreground shadow-xl shadow-primary/20" 
                    : "bg-card border-border text-muted-foreground hover:text-foreground"
                  }`}
              >
                  {f === "awaiting_verification" ? "New Requests" : f}
              </button>
          ))}
      </div>

      <div className="space-y-6">
        {loading ? (
            <div className="py-20 text-center text-muted-foreground italic font-black uppercase tracking-[0.3em] animate-pulse">Syncing Asset Registry...</div>
        ) : filteredPurchases.length === 0 ? (
            <div className="py-20 text-center bg-[#0a0f1d] border border-border rounded-[40px]">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground font-bold">No orders detected in this category.</p>
            </div>
        ) : filteredPurchases.map((purchase) => (
            <div key={purchase.id} className="bg-[#0a0f1d] border border-border rounded-[40px] p-8 hover:border-primary/30 transition-all group">
                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="flex-1 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-card border border-border rounded-2xl flex items-center justify-center text-primary shadow-xl">
                                    <Package className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-1">Product Asset</p>
                                    <h3 className="text-xl font-black text-foreground italic tracking-widest uppercase">{purchase.productTitle}</h3>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-1">Cost</p>
                                <p className="text-3xl font-black text-primary italic">${purchase.productPrice || 0}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-background/50 p-6 rounded-3xl border border-border">
                            <div className="space-y-4">
                                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest flex items-center gap-2 italic">
                                    <User className="w-3 h-3" /> Requester Identity
                                </p>
                                <div>
                                    <p className="text-foreground font-bold">{purchase.userName}</p>
                                    <p className="text-xs text-muted-foreground">{purchase.userEmail}</p>
                                    <div className="mt-2 pt-2 border-t border-white/5">
                                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-1 italic">Transaction ID</p>
                                        <p className="text-primary font-black tracking-widest font-mono">{purchase.transactionId || "NO-ID"}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest flex items-center gap-2 italic">
                                    <MessageCircle className="w-3 h-3 text-emerald-500" /> WhatsApp Payment Node
                                </p>
                                <div className="flex flex-col gap-1">
                                    <p className="text-primary font-black uppercase italic text-lg">{purchase.whatsappNumber}</p>
                                    <a 
                                        href={`https://wa.me/${purchase.whatsappNumber.replace(/[^0-9]/g, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2 hover:underline"
                                    >
                                        Open Conversation <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="w-full lg:w-80 flex flex-col justify-center gap-3 pt-6 lg:pt-0 lg:pl-8 lg:border-l border-border">
                        {purchase.status === "awaiting_verification" ? (
                            <>
                                <button 
                                    onClick={() => approvePurchase(purchase)}
                                    className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
                                >
                                    <CheckCircle2 className="w-4 h-4" /> Grant Access
                                </button>
                                <button 
                                    onClick={() => rejectPurchase(purchase.id)}
                                    className="w-full h-14 bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-foreground rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2"
                                >
                                    <XCircle className="w-4 h-4" /> Reject Order
                                </button>
                            </>
                        ) : purchase.status === "active" ? (
                            <div className="w-full p-6 bg-card border border-border rounded-3xl text-center">
                                <ShieldCheck className="w-8 h-8 text-primary mx-auto mb-2" />
                                <p className="text-primary font-black uppercase tracking-[0.2em] text-[10px]">Verified & Active</p>
                                <p className="text-muted-foreground text-[10px] mt-1 italic font-medium">Unlocked by Admin</p>
                            </div>
                        ) : (
                            <div className="w-full p-6 bg-card border border-border rounded-3xl text-center">
                                <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                                <p className="text-red-500 font-black uppercase tracking-[0.2em] text-[10px]">Rejected</p>
                            </div>
                        )}
                        <p className="text-center text-[9px] text-muted-foreground font-bold uppercase tracking-widest mt-2 leading-relaxed">
                            Order {purchase.id.substring(0, 10)}<br />
                            Requested {purchase.createdAt ? (new Date(purchase.createdAt.seconds * 1000).toLocaleString()) : "N/A"}
                        </p>
                    </div>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
}
