"use client";

import { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  Edit2, 
  Trash2, 
  Download,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/firebase";
import { collection, query, getDocs, deleteDoc, doc, orderBy } from "firebase/firestore";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminProductsPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
            const snap = await getDocs(q);
            setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch (err) {
            console.error("Fetch products error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this product?")) return;
        try {
            await deleteDoc(doc(db, "products", id));
            setProducts(products.filter(p => p.id !== id));
        } catch (err) {
            alert("Delete failed.");
        }
    };

    const filteredProducts = products.filter(p => 
        p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-foreground uppercase italic tracking-tighter mb-2">Digital Core</h1>
                    <p className="text-muted-foreground text-xs font-bold uppercase tracking-[0.2em]">Manage your courses, themes, and plugins.</p>
                </div>
                <Button asChild className="h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest px-8 rounded-2xl shadow-xl shadow-primary/20 transition-all">
                    <Link href="/admin/products/new" className="flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        Initialize New Node
                    </Link>
                </Button>
            </div>

            <div className="bg-[#0a0f1d] border border-border rounded-[32px] overflow-hidden">
                <div className="p-8 border-b border-border flex flex-col md:flex-row gap-6 items-center">
                    <div className="flex-1 relative w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-background border border-border rounded-xl pl-12 pr-4 py-3 text-sm w-full focus:outline-none focus:border-primary transition-all" 
                            placeholder="Locate digital asset by name or category..." 
                        />
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <Button variant="outline" className="flex-1 md:flex-none h-12 rounded-xl border-border bg-background text-[10px] font-black uppercase tracking-widest">
                            <Filter className="w-4 h-4 mr-2" />
                            Filter
                        </Button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-muted/30">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Product Detail</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Category</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Price Mode</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-right">Direct Commands</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-8 py-6 h-20 bg-muted/10"></td>
                                    </tr>
                                ))
                            ) : filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center text-muted-foreground font-bold uppercase tracking-widest text-xs">
                                        No digital nodes detected in the local buffer.
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map((p) => (
                                    <tr key={p.id} className="hover:bg-muted/20 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 bg-muted rounded-xl flex items-center justify-center overflow-hidden border border-border group-hover:border-primary/50 transition-all">
                                                    {p.images?.[0] ? (
                                                        <img src={p.images[0]} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <ImageIcon className="w-6 h-6 text-muted-foreground" />
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-black text-foreground uppercase italic">{p.title}</h4>
                                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">ID: {p.id.slice(0, 8)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="px-3 py-1 bg-primary/10 border border-primary/20 text-primary rounded-lg text-[9px] font-black uppercase tracking-widest">
                                                {p.category}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            {p.price > 0 ? (
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-foreground italic">${p.price}</span>
                                                    <span className="text-[9px] font-bold text-muted-foreground uppercase opacity-60">Paid Access</span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-emerald-500 italic uppercase">FREE</span>
                                                    <span className="text-[9px] font-bold text-muted-foreground uppercase opacity-60">Open Node</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Active</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl hover:bg-primary/10 hover:text-primary" asChild>
                                                    <Link href={`/store/product/${p.id}`}>
                                                        <Eye className="w-4 h-4" />
                                                    </Link>
                                                </Button>
                                                <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl hover:bg-blue-500/10 hover:text-blue-500" asChild>
                                                    <Link href={`/admin/products/${p.id}/edit`}>
                                                        <Edit2 className="w-4 h-4" />
                                                    </Link>
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="w-10 h-10 rounded-xl hover:bg-destructive/10 hover:text-destructive"
                                                    onClick={() => handleDelete(p.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
