"use client";

import { motion } from "framer-motion";
import { Link as LucideLink, ShoppingCart, Download, Star, Eye } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
    product: any;
}

export default function ProductCard({ product }: ProductCardProps) {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group flex flex-col bg-card/30 backdrop-blur-md border border-white/10 rounded-[48px] overflow-hidden hover:border-primary/50 transition-all duration-500 shadow-2xl relative"
        >
            <Link href={`/store/product/${product.id}`} className="block relative aspect-[16/11] overflow-hidden bg-muted/20">
                <img 
                    src={product.images?.[0] || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=2072"} 
                    alt={product.title}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=2072";
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-8">
                    <div className="flex items-center gap-3 w-full">
                        <Button className="flex-1 h-12 bg-white text-black hover:bg-primary hover:text-white font-black uppercase tracking-widest text-[10px] rounded-2xl">
                           View Details
                        </Button>
                    </div>
                </div>
                <div className="absolute top-6 left-6 flex flex-col gap-2">
                    <span className="px-4 py-1.5 bg-background/80 backdrop-blur-md border border-white/10 text-foreground text-[10px] font-black uppercase tracking-widest rounded-full">
                        {product.category}
                    </span>
                    {product.price === 0 && (
                        <span className="px-4 py-1.5 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-emerald-500/20">
                            FREE
                        </span>
                    )}
                </div>
            </Link>

            <div className="p-8 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-primary fill-primary" />
                        <span className="text-[10px] font-black text-foreground uppercase tracking-widest">4.9 Node Score</span>
                    </div>
                    <p className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.2em] opacity-40 italic">#VX-{product.id?.slice(-4)}</p>
                </div>

                <Link href={`/store/product/${product.id}`}>
                    <h3 className="text-2xl font-black text-foreground leading-tight uppercase italic hover:text-primary transition-colors line-clamp-1">
                        {product.title}
                    </h3>
                </Link>

                <p className="text-muted-foreground text-sm font-medium line-clamp-2 leading-relaxed opacity-70">
                    {product.description}
                </p>

                <div className="flex items-center justify-between pt-6 border-t border-white/5 mt-4">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Net Credit</span>
                        <span className="text-2xl font-black text-foreground italic tracking-tighter">
                            {product.price > 0 ? `$${product.price}` : "FREE"}
                        </span>
                    </div>
                    <Button variant="outline" className="h-10 w-10 p-0 rounded-xl border-white/10 hover:border-primary group/btn" asChild>
                        <Link href={`/store/product/${product.id}`}>
                            <Eye className="w-4 h-4 group-hover/btn:text-primary transition-colors" />
                        </Link>
                    </Button>
                </div>
            </div>
        </motion.div>
    );
}
