import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, MessageCircle, AlertCircle, CheckCircle2, Loader2, Banknote, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";

interface PurchaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: any;
    user: any;
    onSuccess: () => void;
}

export default function PurchaseModal({ isOpen, onClose, product, user, onSuccess }: PurchaseModalProps) {
    const [whatsappNumber, setWhatsappNumber] = useState("");
    const [transactionId, setTransactionId] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [bankSettings, setBankSettings] = useState<any>(null);

    useEffect(() => {
        if (isOpen) {
            fetchBankSettings();
        }
    }, [isOpen]);

    const fetchBankSettings = async () => {
        try {
            const snap = await getDoc(doc(db, "platform_settings", "config"));
            if (snap.exists()) {
                setBankSettings(snap.data());
            }
        } catch (err) {
            console.error("Fetch settings error:", err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!whatsappNumber.trim()) {
            setError("Please provide your WhatsApp number.");
            return;
        }
        if (!transactionId.trim()) {
            setError("Please provide the Transaction ID for verification.");
            return;
        }

        setIsSubmitting(true);
        setError("");

        try {
            await addDoc(collection(db, "product_purchases"), {
                productId: product.id,
                productTitle: product.title,
                productPrice: product.price,
                userId: user.uid,
                userName: user.displayName || "Unknown User",
                userEmail: user.email,
                whatsappNumber: whatsappNumber.trim(),
                transactionId: transactionId.trim(),
                status: "awaiting_verification",
                createdAt: serverTimestamp(),
            });
            onSuccess();
            onClose();
        } catch (err: any) {
            console.error("Purchase error:", err);
            setError("Failed to initialize purchase protocol. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-[#050914]/80 backdrop-blur-xl"
                    />

                    {/* Modal Content */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-xl bg-[#0a0f1d] border border-white/10 rounded-[40px] shadow-3xl overflow-y-auto max-h-[90vh] no-scrollbar p-8 md:p-12"
                    >
                        {/* Close button */}
                        <button 
                            onClick={onClose}
                            className="absolute top-8 right-8 p-2 text-muted-foreground hover:text-white transition-colors z-10"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20 shadow-xl shadow-primary/5">
                                    <Banknote className="w-7 h-7" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-foreground uppercase italic tracking-tighter">Secure Payment</h3>
                                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] opacity-40 italic">Bank Transfer & Verification</p>
                                </div>
                            </div>

                            <div className="bg-white/5 rounded-3xl p-6 border border-white/5 space-y-6">
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-primary italic border-b border-white/5 pb-2">Deposit Destination</h4>
                                    {bankSettings ? (
                                        <div className="space-y-3 font-mono">
                                            <div>
                                                <p className="text-[9px] text-muted-foreground uppercase">Bank Name</p>
                                                <p className="text-sm text-foreground font-bold">{bankSettings.bankName}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] text-muted-foreground uppercase">Account Title</p>
                                                <p className="text-sm text-foreground font-bold">{bankSettings.accountTitle}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] text-muted-foreground uppercase">Account Number</p>
                                                <p className="text-lg text-primary font-black tracking-widest">{bankSettings.accountNum}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="h-20 flex items-center justify-center">
                                            <Loader2 className="w-6 h-6 animate-spin text-primary/30" />
                                        </div>
                                    )}
                                </div>
                                
                                <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl space-y-2">
                                     <div className="flex items-center gap-2 text-emerald-500">
                                        <AlertCircle className="w-4 h-4" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Crucial Step</span>
                                     </div>
                                     <p className="text-[11px] text-muted-foreground font-bold leading-relaxed italic">
                                        1. Transfer <span className="text-white font-black">${product.price}</span> to the account above.<br/>
                                        2. Enter your <span className="text-white font-black">Transaction ID</span> and <span className="text-white font-black">WhatsApp</span> below.<br/>
                                        3. Send a screenshot of the payment slip to <span className="text-primary font-black underline">{bankSettings?.companyWhatsapp || "our WhatsApp"}</span> for instant approval.
                                     </p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">WhatsApp Number</label>
                                        <input 
                                            type="text"
                                            placeholder="+92 300 0000000"
                                            value={whatsappNumber}
                                            onChange={(e) => setWhatsappNumber(e.target.value)}
                                            className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 text-foreground font-bold focus:border-primary focus:outline-none transition-all placeholder:text-muted-foreground/30"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Transaction ID</label>
                                        <input 
                                            type="text"
                                            placeholder="TRX-123456789"
                                            value={transactionId}
                                            onChange={(e) => setTransactionId(e.target.value)}
                                            className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 text-foreground font-bold focus:border-primary focus:outline-none transition-all placeholder:text-muted-foreground/30"
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <p className="text-red-500 text-[10px] font-black uppercase tracking-widest text-center italic">{error}</p>
                                )}

                                <Button 
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full h-16 bg-primary hover:bg-white text-black font-black uppercase tracking-[0.2em] rounded-2xl shadow-2xl transition-all group"
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                    ) : (
                                        <>
                                            Submit Verification Request
                                            <Send className="ml-3 w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                        </>
                                    )}
                                </Button>
                            </form>

                            <p className="text-[9px] text-center text-muted-foreground font-black uppercase tracking-widest opacity-40 italic leading-loose">
                                VerteX Financial Nodes are Monitored 24/7.<br/>
                                Misleading Transaction IDs will result in permanent Protocol Exile.
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
