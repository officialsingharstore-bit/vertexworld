"use client";

import { useState, useEffect } from "react";
import { Star, Send, User, MessageCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/firebase";
import { collection, addDoc, query, where, getDocs, orderBy, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";

interface ReviewSectionProps {
    productId: string;
}

export default function ReviewSection({ productId }: ReviewSectionProps) {
    const { user, userData } = useAuth();
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [comment, setComment] = useState("");
    const [rating, setRating] = useState(5);

    useEffect(() => {
        fetchReviews();
    }, [productId]);

    const fetchReviews = async () => {
        try {
            const q = query(
                collection(db, "product_reviews"), 
                where("productId", "==", productId),
                orderBy("createdAt", "desc")
            );
            const snap = await getDocs(q);
            setReviews(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch (err) {
            console.error("Fetch reviews error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return alert("Log in to transmit feedback.");
        if (!comment) return;

        setSubmitting(true);
        try {
            await addDoc(collection(db, "product_reviews"), {
                productId,
                userId: user.uid,
                userName: userData?.fullName || "Elite User",
                comment,
                rating,
                createdAt: serverTimestamp()
            });
            setComment("");
            fetchReviews();
        } catch (err) {
            console.error("Submit review error:", err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-12">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20">
                    <MessageCircle className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-3xl font-black text-foreground uppercase italic tracking-tighter">Field Intelligence</h2>
                    <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest opacity-60">Verified user feedback and performance analytics.</p>
                </div>
            </div>

            {/* Review Form */}
            <form onSubmit={handleSubmit} className="bg-card/40 backdrop-blur-3xl border border-white/10 rounded-[40px] p-8 space-y-6 shadow-2xl relative overflow-hidden">
                <div className="flex items-center gap-6 mb-4">
                    <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((s) => (
                            <button 
                                key={s} 
                                type="button"
                                onClick={() => setRating(s)}
                                className={`transition-all ${rating >= s ? "text-primary scale-110" : "text-muted-foreground/30 hover:text-muted-foreground"}`}
                            >
                                <Star className={`w-6 h-6 ${rating >= s ? "fill-primary" : ""}`} />
                            </button>
                        ))}
                    </div>
                    <span className="text-xs font-black text-foreground uppercase tracking-widest italic opacity-60">Set Security Rating</span>
                </div>
                <div className="relative">
                    <textarea 
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Log your experience with this digital node..."
                        className="w-full bg-background border border-border rounded-3xl p-6 text-foreground font-medium focus:border-primary transition-all outline-none resize-none min-h-[120px]"
                    />
                    <Button 
                        disabled={submitting}
                        className="absolute bottom-4 right-4 h-12 px-8 bg-primary text-primary-foreground font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20"
                    >
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                        Transmit
                    </Button>
                </div>
            </form>

            {/* List */}
            <div className="space-y-6">
                {loading ? (
                    <div className="py-20 text-center opacity-50"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>
                ) : reviews.length === 0 ? (
                    <div className="py-20 bg-muted/10 rounded-[40px] border border-dashed border-border text-center">
                        <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">No field reports logged for this asset yet.</p>
                    </div>
                ) : (
                    reviews.map((r) => (
                        <div key={r.id} className="bg-card/20 border border-white/5 rounded-[32px] p-8 space-y-4 hover:border-white/10 transition-all group">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center border border-border">
                                        <User className="w-5 h-5 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-foreground uppercase italic">{r.userName}</h4>
                                        <div className="flex gap-1 mt-0.5">
                                            {Array(r.rating).fill(0).map((_, i) => (
                                                <Star key={i} className="w-2.5 h-2.5 text-primary fill-primary" />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <span className="text-[9px] text-muted-foreground font-black uppercase tracking-widest opacity-40 italic">VerteX Node Verified</span>
                            </div>
                            <p className="text-muted-foreground text-sm font-medium leading-relaxed italic group-hover:text-foreground transition-colors">
                                "{r.comment}"
                            </p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
