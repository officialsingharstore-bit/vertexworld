"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldCheck, Activity, Lock, ArrowRight, History } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

export default function EscrowAuditModal({ isOpen, onClose, userId }: { isOpen: boolean, onClose: () => void, userId: string }) {
  const [escrowOrders, setEscrowOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !userId) return;

    const q = query(
      collection(db, "orders"),
      where("buyerId", "==", userId),
      where("status", "in", ["awaiting_verification", "in_progress", "revision"])
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEscrowOrders(orders);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isOpen, userId]);

  const totalInEscrow = escrowOrders.reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose} 
            className="absolute inset-0 bg-background/80 backdrop-blur-md" 
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 30 }} 
            animate={{ scale: 1, opacity: 1, y: 0 }} 
            exit={{ scale: 0.9, opacity: 0, y: 30 }} 
            className="relative bg-card border border-border rounded-[48px] w-full max-w-2xl p-12 shadow-3xl overflow-hidden"
          >
            <button onClick={onClose} className="absolute top-8 right-8 text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-8 h-8" />
            </button>

            <div className="mb-10 flex items-center gap-6">
              <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary border border-primary/20">
                <ShieldCheck className="w-10 h-10" />
              </div>
              <div>
                <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-1">Held Funds Tracker</h2>
                <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest opacity-60">Real-time status of your active payments</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-10">
                <div className="p-6 bg-background border border-border rounded-3xl">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Total Held</p>
                    <p className="text-3xl font-black text-primary italic">${totalInEscrow.toLocaleString()}</p>
                </div>
                <div className="p-6 bg-background border border-border rounded-3xl">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Active Nodes</p>
                    <p className="text-3xl font-black text-foreground italic">{escrowOrders.length}</p>
                </div>
            </div>

            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                {loading ? (
                    <div className="py-12 text-center text-muted-foreground font-bold italic animate-pulse uppercase tracking-widest">Scanning Blockchain Nodes...</div>
                ) : escrowOrders.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground">
                        <History className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p className="font-black uppercase tracking-tighter italic">No Active Escrow Holds Detected.</p>
                    </div>
                ) : (
                    escrowOrders.map((order) => (
                        <div key={order.id} className="p-5 bg-background/50 border border-border rounded-2xl flex items-center justify-between group hover:border-primary/30 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary border border-primary/10">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-black uppercase italic text-foreground truncate max-w-[200px]">{order.gigTitle}</p>
                                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{order.status} :: {order.freelancerName}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-black text-foreground italic tracking-tighter">${order.totalPrice}</p>
                                <span className="text-[8px] font-black uppercase tracking-widest text-primary">Holding</span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="mt-12 p-6 bg-primary/5 rounded-[32px] border border-primary/10 flex items-center gap-4">
                <Activity className="w-6 h-6 text-primary" />
                <p className="text-[9px] font-medium text-muted-foreground leading-relaxed">
                    VerteX Escrow Protocol ensures that funds are only released upon successful delivery and node verification. Your assets are cryptographically protected.
                </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
