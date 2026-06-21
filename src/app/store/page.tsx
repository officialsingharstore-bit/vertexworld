"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { 
  Search, 
  Grid2X2, 
  Layers, 
  Cpu, 
  Zap, 
  Layout, 
  Package,
  BookOpen,
  Filter
} from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import ProductCard from "@/components/products/ProductCard";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { Lock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function StoreContent() {
    const searchParams = useSearchParams();
    const categoryQuery = searchParams.get("category");
    
    const { user, loading: authLoading } = useAuth();
    
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState(categoryQuery || "All");
    const [searchQuery, setSearchQuery] = useState("");

    const categories = [
        { name: "All", icon: <Package className="w-4 h-4" /> },
        { name: "Course", icon: <BookOpen className="w-4 h-4" /> },
        { name: "Theme", icon: <Layout className="w-4 h-4" /> },
        { name: "Plugin", icon: <Zap className="w-4 h-4" /> },
        { name: "App", icon: <Cpu className="w-4 h-4" /> },
        { name: "Software", icon: <Layers className="w-4 h-4" /> },
    ];

    useEffect(() => {
        if (categoryQuery) {
            // Capitalize first letter
            const cap = categoryQuery.charAt(0).toUpperCase() + categoryQuery.slice(1);
            setActiveCategory(cap);
        }
    }, [categoryQuery]);

    useEffect(() => {
        fetchProducts();
    }, [activeCategory]);

    const fetchProducts = async () => {
        setLoading(true);
        setProducts([]); // Clear current view
        try {
            let q = query(collection(db, "products"), orderBy("createdAt", "desc"));
            
            if (activeCategory !== "All") {
                q = query(collection(db, "products"), where("category", "==", activeCategory), orderBy("createdAt", "desc"));
            }

            const snap = await getDocs(q);
            setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch (err) {
            console.error("Fetch products error:", err);
            // If index is missing or query fails, fallback to client-side filter
            const qAll = query(collection(db, "products"), orderBy("createdAt", "desc"));
            const snapAll = await getDocs(qAll);
            const allData = snapAll.docs.map(d => ({ id: d.id, ...d.data() }));
            if (activeCategory === "All") {
                setProducts(allData);
            } else {
                setProducts(allData.filter((p: any) => p.category === activeCategory));
            }
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.title?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeCategory === "All" || p.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <main className="min-h-screen bg-background text-foreground pt-40 pb-20 selection:bg-primary/30 relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-primary/5 blur-[120px] rounded-full -z-10 pointer-events-none" />
            
            <Navbar />

            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 mb-20">
                    <div className="max-w-3xl">
                        <motion.h1 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-6xl md:text-8xl font-black text-foreground mb-6 uppercase italic tracking-tighter"
                        >
                            The Digital <span className="text-primary italic">Hub</span>
                        </motion.h1>
                        <motion.p 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-muted-foreground text-lg font-bold uppercase tracking-[0.3em] opacity-60"
                        >
                            High-fidelity assets for modern developers & visionaries.
                        </motion.p>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="flex flex-col lg:flex-row gap-6 items-center mb-16">
                    <div className="flex-1 w-full bg-card/40 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-2 flex items-center px-8 focus-within:border-primary transition-all shadow-2xl">
                        <Search className="w-5 h-5 text-muted-foreground" />
                        <input 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent border-none outline-none py-4 px-4 text-foreground font-bold w-full uppercase text-xs tracking-widest placeholder:text-muted-foreground/30" 
                            placeholder="Locate protocol assets..." 
                        />
                    </div>
                    <div className="flex items-center gap-3 bg-card/40 backdrop-blur-3xl border border-white/10 p-2 rounded-[2rem] overflow-x-auto w-full lg:w-auto no-scrollbar">
                        {categories.map((cat) => (
                            <button
                                key={cat.name}
                                onClick={() => setActiveCategory(cat.name)}
                                className={`flex items-center gap-2 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                                    activeCategory === cat.name ? "bg-primary text-primary-foreground shadow-[0_0_30px_rgba(163,255,51,0.3)]" : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                {cat.icon}
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid */}
                {authLoading ? (
                    <div className="py-40 text-center">
                        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto shadow-[0_0_20px_rgba(163,255,51,0.3)]"></div>
                    </div>
                ) : !user ? (
                    <div className="py-32 flex flex-col items-center text-center max-w-2xl mx-auto">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="w-24 h-24 bg-primary/10 border border-primary/20 rounded-[32px] flex items-center justify-center text-primary mb-10 shadow-[0_0_50px_rgba(163,255,51,0.1)]"
                        >
                            <Lock className="w-10 h-10" />
                        </motion.div>
                        <h2 className="text-4xl font-black text-foreground uppercase italic tracking-tighter mb-4">Membership <span className="text-primary italic">Required</span></h2>
                        <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs mb-12 opacity-70 leading-loose">
                            The VerteX Digital Hub is an exclusive environment for registered operators. Authentication is required to browse protocol assets, courses, and premium tools.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 w-full px-10">
                            <Button asChild className="h-16 flex-1 bg-primary hover:bg-primary/90 text-black font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl shadow-xl shadow-primary/20">
                                <Link href="/auth/login" className="flex items-center justify-center gap-2">
                                    Initialize Login <ArrowRight className="w-4 h-4" />
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="h-16 flex-1 border-white/10 bg-white/5 text-foreground font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl hover:bg-white/10">
                                <Link href="/auth/register">Create Account</Link>
                            </Button>
                        </div>
                    </div>
                ) : loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {Array(6).fill(0).map((_, i) => (
                            <div key={i} className="aspect-[16/18] bg-card/20 rounded-[48px] animate-pulse border border-white/5" />
                        ))}
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="py-40 text-center space-y-4">
                        <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mx-auto mb-6">
                            <Filter className="w-10 h-10" />
                        </div>
                        <h2 className="text-3xl font-black uppercase italic tracking-tighter">No Active Nodes Found</h2>
                        <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">The local buffer is empty for the requested category.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        <AnimatePresence mode="popLayout">
                            {filteredProducts.map((p) => (
                                <ProductCard key={p.id} product={p} />
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </main>
    );
}

export default function StorePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <StoreContent />
        </Suspense>
    );
}
