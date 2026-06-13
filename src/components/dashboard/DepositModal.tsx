"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CreditCard, ShieldCheck, Zap, ArrowRight, Building2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";

export default function DepositModal({ isOpen, onClose, userId }: { isOpen: boolean, onClose: () => void, userId: string }) {
  const [amount, setAmount] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [platformSettings, setPlatformSettings] = useState<any>(null);

  useEffect(() => {
    const fetchSettings = async () => {
        const snap = await getDoc(doc(db, "platform_settings", "config"));
        if (snap.exists()) setPlatformSettings(snap.data());
    };
    if (isOpen) fetchSettings();
  }, [isOpen]);

  const handleDeposit = async () => {
    if (!amount || isNaN(parseFloat(amount)) || !transactionId) {
        alert("Please enter amount and Transaction ID.");
        return;
    }
    setIsProcessing(true);

    try {
      // Create a Deposit Request for Admin
      await addDoc(collection(db, "deposit_requests"), {
        userId,
        amount: parseFloat(amount),
        transactionId,
        status: "pending",
        type: "bank_transfer",
        createdAt: serverTimestamp(),
        bankReference: "VX-" + Math.random().toString(36).substring(7).toUpperCase()
      });
      
      alert(`Strategic Deposit Request Transmitted! Once our neural node verifies your Transaction ID (${transactionId}), the funds will be activated.`);
      setAmount("");
      setTransactionId("");
      onClose();
    } catch (error) {
      console.error("Deposit request error:", error);
      alert("Transmission failed. Digital bridge unstable.");
    } finally {
      setIsProcessing(false);
    }
  };

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
            initial={{ scale: 0.9, opacity: 0, y: 20 }} 
            animate={{ scale: 1, opacity: 1, y: 0 }} 
            exit={{ scale: 0.9, opacity: 0, y: 20 }} 
            className="relative bg-card border border-border rounded-[48px] w-full max-w-lg p-10 lg:p-12 shadow-3xl overflow-y-auto max-h-[90vh] custom-scrollbar"
          >
            <button onClick={onClose} className="absolute top-8 right-8 text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-8 h-8" />
            </button>

            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mx-auto mb-6 border border-primary/20">
                <ShieldCheck className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-2">Initialize Deposit</h2>
              <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">VerteX Secure Escrow Gateway</p>
            </div>

            <div className="space-y-6">
              {/* Bank Details Section */}
              <div className="p-6 bg-primary/5 border border-primary/20 rounded-[32px] space-y-4">
                <div className="flex items-center gap-3 text-primary mb-2">
                    <Building2 className="w-5 h-5" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">VerteX Liquidity Node</span>
                </div>
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold text-muted-foreground uppercase">Bank Name</span>
                        <span className="text-xs font-black text-foreground uppercase italic">{platformSettings?.bankName || "Syncing..."}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold text-muted-foreground uppercase">Account Nbr</span>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-foreground">{platformSettings?.accountNum || "0000"}</span>
                            <button onClick={() => { navigator.clipboard.writeText(platformSettings?.accountNum); alert("Acc nbr copied."); }} className="text-primary hover:scale-110 transition-transform"><Copy className="w-3 h-3" /></button>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold text-muted-foreground uppercase">Account Title</span>
                        <span className="text-xs font-black text-foreground">{platformSettings?.accountTitle || "VerteX Node"}</span>
                    </div>
                </div>
                <p className="text-[8px] text-muted-foreground font-medium uppercase italic opacity-60">* Transfer amount and enter your Transaction ID below.</p>
              </div>

              <div className="space-y-4">
                <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-xl font-black text-primary italic">$</span>
                    <input 
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter Amount"
                    className="w-full h-14 bg-background border border-border rounded-2xl pl-12 pr-8 text-lg font-black text-foreground focus:border-primary outline-none transition-all placeholder:text-muted-foreground/30"
                    />
                </div>
                <div className="relative">
                    <input 
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="Transaction ID / TRX ID"
                    className="w-full h-14 bg-background border border-border rounded-2xl px-6 text-sm font-bold text-foreground focus:border-primary outline-none transition-all placeholder:text-muted-foreground/30 uppercase tracking-widest"
                    />
                </div>
              </div>

              <Button 
                onClick={handleDeposit}
                disabled={isProcessing || !amount || !transactionId}
                className="w-full h-18 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 italic"
              >
                {isProcessing ? "Transmitting..." : "Submit Payment Request"}
                <ArrowRight className="ml-3 w-6 h-6" />
              </Button>
            </div>

            <div className="mt-8 text-center">
                <p className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.5em] opacity-40 italic">End-to-End Encrypted Node Connection</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
