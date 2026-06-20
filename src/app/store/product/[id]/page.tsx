"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { 
  Download, 
  ShoppingCart, 
  MessageCircle, 
  ArrowLeft, 
  CheckCircle2, 
  ShieldCheck, 
  Zap,
  Globe,
  Lock,
  ChevronLeft,
  ChevronRight,
  FileText,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";
import ReviewSection from "@/components/products/ReviewSection";
import { motion, AnimatePresence } from "framer-motion";

export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user, userData } = useAuth();
    const id = params.id as string;

    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(0);
    const [hasAccess, setHasAccess] = useState(false);

    useEffect(() => {
        fetchProduct();
        checkAccess();
    }, [id, user]);

    const fetchProduct = async () => {
        try {
            const snap = await getDoc(doc(db, "products", id));
            if (snap.exists()) {
                setProduct({ id: snap.id, ...snap.data() });
            } else {
                router.push("/store");
            }
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const checkAccess = async () => {
        if (!user) return;
        try {
            const q = query(
                collection(db, "user_library"), 
                where("userId", "==", user.uid), 
                where("productId", "==", id)
            );
            const snap = await getDocs(q);
            if (!snap.empty) setHasAccess(true);
        } catch (err) {
            console.error("Access check error:", err);
        }
    };

    const handleDownload = (file: { name: string; url: string }) => {
        if (product.price > 0 && !hasAccess) {
            alert("This digital node is protocol-locked. Please complete purchase verification.");
            return;
        }
        window.open(file.url, "_blank");
    };

    const handleContact = () => {
        // Redirect to support or open chat with Admin
        // For now, let's assume there is a direct contact link
        router.push("/contact?subject=" + encodeURIComponent(`Purchase Inquiry: ${product?.title}`));
    };

    if (loading) return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
    );

    if (!product) return null;

    const isLocked = product.price > 0 && !hasAccess;

    return (
        <main className="min-h-screen bg-background text-foreground pt-32 pb-20 selection:bg-primary/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full -z-10 animate-pulse" />
            
            <Navbar />
a
            <div className="max-w-7xl mx-auto px-4 md:px-6">
                {/* Back Button */}
                <button 
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 md:mb-12 group"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Return</span>
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
                    {/* Visual Interface */}
                    <div className="space-y-6 md:space-y-8">
                        <div className="relative aspect-video rounded-[32px] md:rounded-[48px] overflow-hidden border border-white/10 shadow-3xl bg-card group/main">
                            <AnimatePresence mode="wait">
                                <motion.img 
                                    key={activeImage}
                                    initial={{ opacity: 0, scale: 1.02 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    src={product.images?.[activeImage] || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=2072"} 
                                    className="w-full h-full object-cover"
                                />
                            </AnimatePresence>
                            
                            {/* Improved subtle navigation */}
                            {product.images?.length > 1 && (
                                <>
                                    <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover/main:opacity-100 transition-opacity pointer-events-none">
                                        <button 
                                            onClick={() => setActiveImage(prev => prev > 0 ? prev - 1 : product.images.length - 1)} 
                                            className="w-12 h-12 bg-black/40 backdrop-blur-xl rounded-full flex items-center justify-center text-white border border-white/10 pointer-events-auto hover:bg-primary hover:text-black transition-all"
                                        >
                                            <ChevronLeft />
                                        </button>
                                        <button 
                                            onClick={() => setActiveImage(prev => prev < product.images.length - 1 ? prev + 1 : 0)} 
                                            className="w-12 h-12 bg-black/40 backdrop-blur-xl rounded-full flex items-center justify-center text-white border border-white/10 pointer-events-auto hover:bg-primary hover:text-black transition-all"
                                        >
                                            <ChevronRight />
                                        </button>
                                    </div>
                                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                                        {product.images.map((_: any, i: number) => (
                                            <div 
                                                key={i} 
                                                className={`h-1 transition-all rounded-full ${activeImage === i ? "w-8 bg-primary shadow-[0_0_15px_rgba(163,255,51,0.5)]" : "w-2 bg-white/20"}`} 
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                            {product.images?.map((img: string, i: number) => (
                                <button 
                                    key={i}
                                    onClick={() => setActiveImage(i)}
                                    className={`relative shrink-0 w-24 md:w-32 aspect-video rounded-xl md:rounded-2xl overflow-hidden border-2 transition-all ${activeImage === i ? "border-primary scale-95 shadow-xl" : "border-white/5 opacity-40 hover:opacity-100"}`}
                                >
                                    <img src={img} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Metadata & Protocol */}
                    <div className="space-y-8 md:space-y-12">
                        <div>
                            <div className="flex flex-wrap items-center gap-3 mb-4 md:mb-6">
                                <span className="px-3 py-1 bg-primary/10 text-primary rounded-lg border border-primary/20 text-[9px] font-black uppercase tracking-widest italic">{product.category}</span>
                                {product.price === 0 ? (
                                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg border border-emerald-500/20 text-[9px] font-black uppercase tracking-widest italic">Global Node Access</span>
                                ) : (
                                    <span className="px-3 py-1 bg-blue-500/10 text-blue-500 rounded-lg border border-blue-500/20 text-[9px] font-black uppercase tracking-widest italic">Premium Asset</span>
                                )}
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-foreground uppercase italic tracking-tighter mb-4 md:mb-8 leading-[1.1]">{product.title}</h1>
                            <p className="text-foreground/70 text-base md:text-lg font-medium leading-relaxed">{product.description}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 md:gap-8 py-6 md:py-10 border-y border-white/5">
                            <div className="space-y-2">
                                <h4 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2 italic">
                                    <Globe className="w-3 h-3" /> Area
                                </h4>
                                <p className="text-lg md:text-xl font-black text-foreground italic uppercase">Global Matrix</p>
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2 italic">
                                    <ShieldCheck className="w-3 h-3" /> Privacy
                                </h4>
                                <p className="text-lg md:text-xl font-black text-foreground italic uppercase">{product.price > 0 ? "Protected" : "Public Node"}</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-1 italic">Protocol Cost</span>
                                    <span className="text-4xl md:text-5xl font-black text-foreground italic tracking-tight">${product.price || 0}</span>
                                </div>
                                {isLocked ? (
                                    <Button onClick={handleContact} className="h-16 md:h-20 px-10 md:px-12 bg-primary hover:bg-white text-black font-bold uppercase tracking-[0.2em] rounded-2xl md:rounded-3xl shadow-2xl transition-all text-sm md:text-lg italic group">
                                        Request Access
                                        <Lock className="ml-3 w-5 h-5 group-hover:rotate-12 transition-transform" />
                                    </Button>
                                ) : (
                                    <div className="flex items-center gap-3 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-3xl">
                                        <CheckCircle2 className="w-5 h-5 md:w-6 h-6" />
                                        <span className="font-black uppercase italic tracking-tighter text-sm md:text-base">Ready for Sync</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Instruction & Payload Section */}
                <div className="mt-20 md:mt-32 grid grid-cols-1 lg:grid-cols-3 gap-12 md:gap-20">
                    <div className="lg:col-span-2 space-y-16 md:space-y-20">
                        {/* How to use */}
                        {product.howToUse && (
                            <section>
                                <div className="flex items-center gap-4 mb-6 md:mb-10">
                                    <div className="w-10 h-10 md:w-14 md:h-14 bg-primary/10 rounded-xl md:rounded-2xl flex items-center justify-center text-primary border border-primary/20 shadow-xl shadow-primary/5">
                                        <Zap className="w-5 h-5 md:w-7 md:h-7" />
                                    </div>
                                    <h2 className="text-2xl md:text-4xl font-black text-foreground uppercase italic tracking-tighter">Instructions</h2>
                                </div>
                                <div className="bg-card/30 backdrop-blur-3xl border border-white/5 rounded-[40px] md:rounded-[56px] p-8 md:p-16 relative overflow-hidden shadow-2xl">
                                     <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none"><Zap className="w-32 h-32 md:w-48 md:h-48" /></div>
                                     <p className="text-foreground/90 text-sm md:text-lg font-bold leading-relaxed whitespace-pre-wrap relative z-10 italic">
                                         {product.howToUse}
                                     </p>
                                </div>
                            </section>
                        )}

                        {/* Reviews */}
                        <ReviewSection productId={id} />
                    </div>

                    {/* Sidebar: Downloads & Support */}
                    <div className="space-y-8 md:space-y-12">
                        <div id="payload" className="bg-card/40 backdrop-blur-3xl border border-white/10 rounded-[40px] md:rounded-[56px] p-8 md:p-12 space-y-8 md:space-y-10 shadow-3xl lg:sticky lg:top-32">
                            <div className="flex items-center gap-4 md:gap-5">
                                <div className="w-12 h-12 md:w-14 md:h-14 bg-primary rounded-[16px] md:rounded-[20px] flex items-center justify-center text-black italic font-black text-xl md:text-2xl shadow-xl shadow-primary/20">P</div>
                                <div>
                                    <h3 className="text-xl md:text-2xl font-black text-foreground uppercase italic tracking-tighter">Payload Access</h3>
                                    <p className="text-[9px] md:text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] opacity-40 italic">Buffer Initialized</p>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                {product.files?.length === 0 ? (
                                    <div className="bg-white/5 border border-dashed border-white/10 rounded-[24px] py-12 text-center">
                                        <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest opacity-40 italic">No packets detected</p>
                                    </div>
                                ) : (
                                    product.files?.map((file: any, i: number) => (
                                        <div key={i} className="group relative p-6 bg-background/50 border border-white/5 rounded-[28px] hover:border-primary/40 hover:bg-primary/5 transition-all duration-300">
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="w-10 h-10 bg-muted/20 rounded-xl flex items-center justify-center text-primary border border-white/5 italic font-black text-[10px]">VX-{i+1}</div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-[11px] font-black text-foreground uppercase italic tracking-tight line-clamp-1 group-hover:text-primary transition-colors">{file.name}</p>
                                                    <p className="text-[8px] text-muted-foreground font-black uppercase tracking-[0.2em] mt-0.5">Packet No. {i+1}</p>
                                                </div>
                                            </div>
                                            <Button 
                                                onClick={() => handleDownload(file)}
                                                className={`w-full h-12 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] italic transition-all ${isLocked ? "bg-white/5 text-muted-foreground opacity-50 cursor-not-allowed" : "bg-primary text-black hover:bg-white shadow-xl shadow-primary/10"}`}
                                            >
                                                {isLocked ? (
                                                    <><Lock className="w-4 h-4 mr-2" /> Encrypted</>
                                                ) : (
                                                    <><Download className="w-4 h-4 mr-2" /> Get Packet</>
                                                )}
                                            </Button>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="pt-6 border-t border-white/5">
                                <Button onClick={handleContact} className="w-full h-16 bg-white text-black hover:bg-primary hover:text-white rounded-[20px] font-black uppercase tracking-[0.2em] text-[10px] italic shadow-2xl transition-all group">
                                    <MessageCircle className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform" />
                                    Support Node
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
