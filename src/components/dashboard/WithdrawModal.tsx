"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Landmark, Send, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  userData: any;
}

export default function WithdrawModal({ isOpen, onClose, user, userData }: WithdrawModalProps) {
  const [formData, setFormData] = useState({
    amount: "",
    bankName: "",
    accountNumber: "",
    accountHolder: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [commissionRate, setCommissionRate] = useState(5);
  const [threshold, setThreshold] = useState(100);

  useEffect(() => {
    const fetchSettings = async () => {
        const snap = await getDoc(doc(db, "platform_settings", "config"));
        if (snap.exists()) {
            setCommissionRate(snap.data().commissionRate || 5);
            setThreshold(snap.data().withdrawalThreshold || 100);
        }
    };
    if (isOpen) fetchSettings();
  }, [isOpen]);

  const availableBalance = userData?.balance || 0;

  const handleWithdraw = async () => {
    const amount = parseFloat(formData.amount);
    if (!amount || amount <= 0 || isNaN(amount)) {
      alert("Please enter a valid amount.");
      return;
    }

    if (amount > availableBalance) {
      alert("Insufficient neural balance for this operation.");
      return;
    }

    if (availableBalance < threshold) {
        alert(`Strategic Restriction: Minimum withdrawal threshold is $${threshold}. Current balance: $${availableBalance}.`);
        return;
    }

    if (!formData.bankName || !formData.accountNumber || !formData.accountHolder) {
      alert("Please fill all bank details.");
      return;
    }

    setIsProcessing(true);

    try {
      // Calculate commission for record
      const commission = amount * (commissionRate / 100);
      const finalAmount = amount - commission;

      await addDoc(collection(db, "withdraw_requests"), {
        userId: user.uid,
        userEmail: user.email,
        userName: userData?.fullName || "Elite Provider",
        requestedAmount: amount,
        commissionFee: commission,
        payoutAmount: finalAmount,
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        accountHolder: formData.accountHolder,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      alert(`Withdrawal Request Transmitted! Admin will verify and process your payment (${finalAmount.toLocaleString()} after 5% fee).`);
      setFormData({ amount: "", bankName: "", accountNumber: "", accountHolder: "" });
      onClose();
    } catch (error) {
      console.error("Withdrawal error:", error);
      alert("Neural sync failure. Please try again.");
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
            className="relative bg-card border border-border rounded-[48px] w-full max-w-xl p-10 lg:p-12 shadow-3xl overflow-y-auto max-h-[90vh] custom-scrollbar"
          >
            <button onClick={onClose} className="absolute top-8 right-8 text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-8 h-8" />
            </button>

            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mx-auto mb-6 border border-primary/20">
                <Landmark className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-2">Initialize Payout</h2>
              <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest italic">VerteX Secure Withdrawal Node</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-primary/5 p-4 rounded-3xl border border-primary/20">
                    <p className="text-muted-foreground text-[8px] font-black uppercase tracking-widest mb-1">Available Protocol Balance</p>
                    <p className="text-xl font-black text-primary italic">${availableBalance.toLocaleString()}</p>
                </div>
                <div className="bg-muted p-4 rounded-3xl border border-border">
                    <p className="text-muted-foreground text-[8px] font-black uppercase tracking-widest mb-1">System Commission Fee</p>
                    <p className="text-xl font-black text-foreground italic">{commissionRate.toFixed(2)}%</p>
                </div>
            </div>

            <div className="space-y-4">
               <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4 mb-2 block">Account Holder Name</label>
                  <input 
                    type="text"
                    value={formData.accountHolder}
                    onChange={(e) => setFormData({...formData, accountHolder: e.target.value})}
                    placeholder="Enter Full Name"
                    className="w-full h-14 bg-background border border-border rounded-2xl px-6 text-sm font-bold text-foreground focus:border-primary outline-none transition-all"
                  />
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4 mb-2 block">Bank Name</label>
                        <input 
                            type="text"
                            value={formData.bankName}
                            onChange={(e) => setFormData({...formData, bankName: e.target.value})}
                            placeholder="e.g. MCB, HBL"
                            className="w-full h-14 bg-background border border-border rounded-2xl px-6 text-sm font-bold text-foreground focus:border-primary outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4 mb-2 block">Account Number / IBAN</label>
                        <input 
                            type="text"
                            value={formData.accountNumber}
                            onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
                            placeholder="Full A/C Number"
                            className="w-full h-14 bg-background border border-border rounded-2xl px-6 text-sm font-bold text-foreground focus:border-primary outline-none transition-all uppercase"
                        />
                    </div>
               </div>

               <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4 mb-2 block">Withdrawal Amount ($)</label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-xl font-black text-primary italic">$</span>
                    <input 
                        type="number"
                        value={formData.amount}
                        onChange={(e) => setFormData({...formData, amount: e.target.value})}
                        placeholder="0.00"
                        max={availableBalance}
                        className="w-full h-16 bg-background border border-border rounded-2xl pl-12 pr-6 text-xl font-black text-foreground focus:border-primary outline-none transition-all italic"
                    />
                  </div>
               </div>

               <div className="p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-2xl flex gap-4 items-start">
                  <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                  <p className="text-[9px] text-muted-foreground font-medium italic">
                    The platform will deduct a {commissionRate}% operational commission on all withdrawals. 
                    Minimum payout threshold is <span className="text-primary font-black">${threshold}</span>.
                    Ensure details are accurate.
                  </p>
               </div>

               <Button 
                onClick={handleWithdraw}
                disabled={isProcessing || !formData.amount}
                className="w-full h-20 bg-primary hover:bg-primary/90 text-primary-foreground rounded-3xl font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 italic mt-4"
              >
                {isProcessing ? "Transmitting..." : "Initialize Payout Node"}
                <Send className="ml-3 w-6 h-6" />
              </Button>
            </div>
            
            <div className="mt-8 text-center">
                <p className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.5em] opacity-40 italic">Linked Account: {user?.email}</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
