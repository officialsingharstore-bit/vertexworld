"use client";

import { useEffect, useState } from "react";
import { 
  CreditCard, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  DollarSign, 
  Banknote,
  ExternalLink,
  ShieldCheck,
  Filter,
  Hash,
  User,
  Mail
} from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, doc, updateDoc, where } from "firebase/firestore";
import { Button } from "@/components/ui/button";

export default function AdminPaymentsPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("awaiting_verification");

  useEffect(() => {
    const q = query(
      collection(db, "orders"), 
      orderBy("createdAt", "desc")
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOrders(ordersData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const verifyPayment = async (orderId: string) => {
    if (!confirm("Confirm that you have received the funds in the company bank account?")) return;
    try {
      await updateDoc(doc(db, "orders", orderId), {
        status: "active",
        verifiedAt: new Date().toISOString()
      });
      alert("Payment verified! Order is now active.");
    } catch (e) {
      alert("Failed to verify payment.");
    }
  };

  const rejectPayment = async (orderId: string) => {
    if (!confirm("Reject this payment? This will notify the buyer.")) return;
    try {
      await updateDoc(doc(db, "orders", orderId), {
        status: "rejected",
        rejectedAt: new Date().toISOString()
      });
    } catch (e) {
      alert("Failed to reject.");
    }
  };

  const filteredOrders = activeFilter === "All" 
    ? orders 
    : orders.filter(o => o.status === activeFilter);

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-foreground italic uppercase tracking-tight mb-2">Financial Nexus</h1>
          <p className="text-muted-foreground text-sm font-medium">Verify bank transfers, manage escrow, and authorize project starts.</p>
        </div>
        <div className="flex items-center gap-3">
            <div className="px-6 py-2 bg-primary/10 border border-primary/20 rounded-xl">
                <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-0.5">Escrow Total</p>
                <p className="text-foreground font-black italic">
                    ${orders.filter(o => o.status === "active").reduce((acc, o) => acc + (o.totalPrice || 0), 0).toLocaleString()}
                </p>
            </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#0a0f1d] border border-primary/30 p-8 rounded-[32px] relative overflow-hidden">
              <div className="relative z-10">
                  <p className="text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-4">Awaiting Verification</p>
                  <h2 className="text-4xl font-black text-foreground italic">{orders.filter(o => o.status === "awaiting_verification").length} Orders</h2>
              </div>
              <Banknote className="absolute -bottom-4 -right-4 w-24 h-24 text-primary/10" />
          </div>
          <div className="bg-[#0a0f1d] border border-border p-8 rounded-[32px]">
              <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] mb-4">Processed Transactions</p>
              <h2 className="text-4xl font-black text-foreground italic">{orders.filter(o => o.status === "active" || o.status === "completed").length}</h2>
          </div>
          <div className="bg-[#0a0f1d] border border-border p-8 rounded-[32px]">
              <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] mb-4">Total Revenue (5% Fee)</p>
              <h2 className="text-4xl font-black text-primary italic">
                ${orders.filter(o => o.status === "active" || o.status === "completed").reduce((acc, o) => acc + (o.adminCommission || 0), 0).toFixed(2)}
              </h2>
          </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-3 flex-wrap">
          {["awaiting_verification", "active", "delivered", "completed", "rejected", "All"].map(f => (
              <button 
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                    activeFilter === f 
                    ? "bg-primary border-emerald-500 text-foreground shadow-xl shadow-primary/20" 
                    : "bg-card border-border text-muted-foreground hover:text-foreground"
                  }`}
              >
                  {f === "awaiting_verification" ? "New Payments" : f}
              </button>
          ))}
      </div>

      <div className="space-y-6">
        {loading ? (
            <div className="py-20 text-center text-muted-foreground italic font-black uppercase tracking-[0.3em] animate-pulse">Syncing Financial Records...</div>
        ) : filteredOrders.length === 0 ? (
            <div className="py-20 text-center bg-[#0a0f1d] border border-border rounded-[40px]">
                <ShieldCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground font-bold">No payments detected in this category.</p>
            </div>
        ) : filteredOrders.map((order) => (
            <div key={order.id} className="bg-[#0a0f1d] border border-border rounded-[40px] p-8 hover:border-primary/30 transition-all group">
                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="flex-1 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-card border border-border rounded-2xl flex items-center justify-center text-primary shadow-xl">
                                    <Hash className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-1">Transaction ID</p>
                                    <h3 className="text-xl font-black text-foreground italic tracking-widest">{order.transactionId || "NONE"}</h3>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-1">Value</p>
                                <p className="text-3xl font-black text-primary italic">${order.totalPrice || 0}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-background/50 p-6 rounded-3xl border border-border">
                            <div className="space-y-4">
                                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest flex items-center gap-2 italic">
                                    <User className="w-3 h-3" /> Buyer Identity
                                </p>
                                <div>
                                    <p className="text-foreground font-bold">{order.buyerName}</p>
                                    <p className="text-xs text-muted-foreground">{order.buyerEmail}</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest flex items-center gap-2 italic">
                                    <CreditCard className="w-3 h-3" /> Allocation
                                </p>
                                <div className="flex justify-between text-xs">
                                    <span className="text-muted-foreground">Platform Fee (5%):</span>
                                    <span className="text-pink-500 font-bold">${order.adminCommission?.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-muted-foreground">Freelancer Split:</span>
                                    <span className="text-primary font-bold">${order.freelancerEarnings?.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="w-full lg:w-80 flex flex-col justify-center gap-3 pt-6 lg:pt-0 lg:pl-8 lg:border-l border-border">
                        {order.status === "awaiting_verification" ? (
                            <>
                                <button 
                                    onClick={() => verifyPayment(order.id)}
                                    className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
                                >
                                    <CheckCircle2 className="w-4 h-4" /> Approve Payment
                                </button>
                                <button 
                                    onClick={() => rejectPayment(order.id)}
                                    className="w-full h-14 bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-foreground rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2"
                                >
                                    <XCircle className="w-4 h-4" /> Reject Transfer
                                </button>
                            </>
                        ) : (
                            <div className="w-full p-6 bg-card border border-border rounded-3xl text-center">
                                <CheckCircle2 className="w-8 h-8 text-primary mx-auto mb-2" />
                                <p className="text-primary font-black uppercase tracking-[0.2em] text-[10px]">Verified & Active</p>
                                <p className="text-muted-foreground text-[10px] mt-1 italic font-medium">Payment confirmed by Admin</p>
                            </div>
                        )}
                        <p className="text-center text-[9px] text-muted-foreground font-bold uppercase tracking-widest mt-2 leading-relaxed">
                            Order {order.id.substring(0, 10)}<br />
                            Placed {order.createdAt ? (new Date(order.createdAt.seconds * 1000).toLocaleString()) : "N/A"}
                        </p>
                    </div>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
}
