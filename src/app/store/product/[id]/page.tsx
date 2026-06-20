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
        <main className="min-h-screen bg-background text-foreground pt-40 pb-20 selection:bg-primary/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 blur-[150px] rounded-full -z-10 animate-pulse" />
            
            <Navbar />

            <div className="max-w-7xl mx-auto px-6">
                {/* Back Button */}
                <button 
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-12 group"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Return to Matrix</span>
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
                    {/* Visual Interface */}
                    <div className="space-y-8">
                        <div className="relative aspect-video rounded-[48px] overflow-hidden border border-white/10 shadow-3xl bg-card">
                            <AnimatePresence mode="wait">
                                <motion.img 
                                    key={activeImage}
                                    initial={{ opacity: 0, scale: 1.1 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    src={product.images?.[activeImage] || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=2072"} 
                                    className="w-full h-full object-cover"
                                />
                            </AnimatePresence>
                            
                            {product.images?.length > 1 && (
                                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/40 backdrop-blur-xl p-2 rounded-2xl border border-white/10">
                                    <button onClick={() => setActiveImage(prev => prev > 0 ? prev - 1 : product.images.length - 1)} className="p-2 hover:text-primary transition-colors"><ChevronLeft /></button>
                                    <span className="text-[10px] font-black uppercase italic w-12 text-center">{activeImage + 1} / {product.images.length}</span>
                                    <button onClick={() => setActiveImage(prev => prev < product.images.length - 1 ? prev + 1 : 0)} className="p-2 hover:text-primary transition-colors"><ChevronRight /></button>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-4 gap-4">
                            {product.images?.map((img: string, i: number) => (
                                <button 
                                    key={i}
                                    onClick={() => setActiveImage(i)}
                                    className={`aspect-video rounded-2xl overflow-hidden border-2 transition-all ${activeImage === i ? "border-primary scale-95 shadow-xl shadow-primary/20" : "border-white/5 opacity-40 hover:opacity-100"}`}
                                >
                                    <img src={img} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Metadata & Protocol */}
                    <div className="space-y-12">
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <span className="px-4 py-1.5 bg-primary/10 text-primary rounded-xl border border-primary/20 text-[10px] font-black uppercase tracking-widest italic">{product.category}</span>
                                {product.price === 0 ? (
                                    <span className="px-4 py-1.5 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest italic">Global Open-Access</span>
                                ) : (
                                    <span className="px-4 py-1.5 bg-blue-500/10 text-blue-500 rounded-xl border border-blue-500/20 text-[10px] font-black uppercase tracking-widest italic">Encrypted Asset</span>
                                )}
                            </div>
                            <h1 className="text-5xl md:text-6xl font-black text-foreground uppercase italic tracking-tighter mb-8 leading-[0.9]">{product.title}</h1>
                            <p className="text-muted-foreground text-lg font-medium leading-relaxed opacity-80">{product.description}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-8 py-10 border-y border-white/5">
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-2 flex items-center gap-2 italic">
                                    <Globe className="w-3 h-3" /> Distribution
                                </h4>
                                <p className="text-xl font-black text-foreground italic uppercase">Global Node</p>
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-2 flex items-center gap-2 italic">
                                    <ShieldCheck className="w-3 h-3" /> Security
                                </h4>
                                <p className="text-xl font-black text-foreground italic uppercase">{product.price > 0 ? "Paywalled" : "Verified Safe"}</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] mb-1 italic">Protocol Access Cost</span>
                                    <span className="text-5xl font-black text-foreground italic tracking-tight">${product.price || 0}</span>
                                </div>
                                {isLocked ? (
                                    <Button onClick={handleContact} className="h-20 px-12 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-[0.2em] rounded-3xl shadow-2xl shadow-primary/30 transition-all text-xl italic group">
                                        Request Access
                                        <Lock className="ml-4 w-6 h-6 group-hover:rotate-12 transition-transform" />
                                    </Button>
                                ) : product.price > 0 ? (
                                     <div className="flex items-center gap-3 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-8 py-4 rounded-3xl">
                                        <CheckCircle2 className="w-6 h-6" />
                                        <span className="font-black uppercase italic tracking-tighter">Access Granted</span>
                                    </div>
                                ) : (
                                    <Button onClick={() => window.scrollTo({ top: document.getElementById('payload')?.offsetTop! - 100, behavior: 'smooth' })} className="h-16 px-12 bg-white text-black hover:bg-primary hover:text-white font-black uppercase tracking-[0.2em] rounded-3xl transition-all text-xs italic">
                                        Download Now
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Instruction & Payload Section */}
                <div className="mt-32 grid grid-cols-1 lg:grid-cols-3 gap-20">
                    <div className="lg:col-span-2 space-y-20">
                        {/* How to use */}
                        {product.howToUse && (
                            <section>
                                <div className="flex items-center gap-4 mb-10">
                                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20 shadow-xl shadow-primary/5">
                                        <Zap className="w-7 h-7" />
                                    </div>
                                    <h2 className="text-4xl font-black text-foreground uppercase italic tracking-tighter">Deployment Instructions</h2>
                                </div>
                                <div className="bg-card/40 backdrop-blur-3xl border border-white/10 rounded-[56px] p-16 relative overflow-hidden shadow-2xl">
                                     <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none"><Zap className="w-48 h-48" /></div>
                                     <p className="text-foreground/90 text-lg md:text-xl font-bold leading-relaxed whitespace-pre-wrap relative z-10 italic selection:bg-primary/50">
                                         {product.howToUse}
                                     </p>
                                </div>
                            </section>
                        )}

                        {/* Reviews */}
                        <ReviewSection productId={id} />
                    </div>

                    {/* Sidebar: Downloads & Support */}
                    <div className="space-y-12">
                        <div id="payload" className="bg-[#0c1222] border border-white/10 rounded-[56px] p-12 space-y-10 shadow-[0_30px_100px_rgba(0,0,0,0.5)] sticky top-32">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 bg-primary rounded-[20px] flex items-center justify-center text-black italic font-black text-2xl shadow-2xl shadow-primary/30">P</div>
                                <div>
                                    <h3 className="text-2xl font-black text-foreground uppercase italic tracking-tighter">Payload Output</h3>
                                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] opacity-40">Encrypted Nodes Ready</p>
                                </div>
                            </div>
                            
                            <div className="space-y-5">
                                {product.files?.length === 0 ? (
                                    <div className="bg-white/5 border border-dashed border-white/10 rounded-[32px] py-16 text-center">
                                        <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest opacity-40 italic">Buffer Empty</p>
                                    </div>
                                ) : (
                                    product.files?.map((file: any, i: number) => (
                                        <div key={i} className="group relative flex flex-col gap-4 p-8 bg-[#1a2235] border border-white/5 rounded-[32px] hover:border-primary/40 hover:bg-primary/5 transition-all duration-300">
                                            <div className="flex items-center justify-between gap-4">
                                                <div className="w-12 h-12 bg-black/40 rounded-2xl flex items-center justify-center text-primary border border-white/5 italic font-black text-[12px] group-hover:scale-110 transition-transform">VX-{i+1}</div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-black text-foreground uppercase italic tracking-tight truncate group-hover:text-primary transition-colors">{file.name}</p>
                                                    <p className="font-mono text-[9px] text-primary/60 font-black uppercase tracking-widest mt-1">Status: SYNC_READY</p>
                                                </div>
                                            </div>
                                            <Button 
                                                onClick={() => handleDownload(file)}
                                                className={`w-full h-14 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] italic transition-all ${isLocked ? "bg-white/5 text-muted-foreground opacity-50 cursor-not-allowed" : "bg-primary text-black hover:bg-white hover:scale-[1.02] active:scale-95 shadow-xl shadow-primary/10"}`}
                                            >
                                                {isLocked ? (
                                                    <><Lock className="w-4 h-4 mr-2" /> Protocol Locked</>
                                                ) : (
                                                    <><Download className="w-4 h-4 mr-2 group-hover:translate-y-1 transition-transform" /> Execute Download</>
                                                )}
                                            </Button>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="space-y-6 pt-6 border-t border-white/5">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground italic ml-2">Channel Connectivity</h4>
                                <Button onClick={handleContact} className="w-full h-20 bg-white text-black hover:bg-primary hover:text-white rounded-[24px] font-black uppercase tracking-[0.3em] text-xs italic shadow-2xl transition-all hover:scale-[1.02] active:scale-95 group">
                                    <MessageCircle className="w-6 h-6 mr-4 group-hover:rotate-12 transition-transform" />
                                    Direct Contact
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
