"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { FREELANCER_NAV } from "@/constants/navigation";
import { Briefcase, Plus, Trash2, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, doc, deleteDoc } from "firebase/firestore";
import UploadPortfolioModal from "@/components/explore/UploadPortfolioModal";
import Link from "next/link";

export default function DashboardPortfolioPage() {
    const { user } = useAuth();
    const [portfolio, setPortfolio] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, "portfolio"),
            where("userId", "==", user.uid)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            fetched.sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
            setPortfolio(fetched);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this transmission from your visual archive?")) return;
        try {
            await deleteDoc(doc(db, "portfolio", id));
        } catch (err) {
            console.error(err);
            alert("Deletion failed.");
        }
    };

    return (
        <DashboardLayout navItems={FREELANCER_NAV} userRole="Freelancer">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-foreground italic tracking-tighter uppercase mb-2">Visual Archive</h1>
                        <p className="text-muted-foreground font-medium tracking-wide">Command center for your professional project nodes.</p>
                    </div>
                    <div className="flex gap-4">
                        <Link href={`/freelancers/${user?.uid}?tab=portfolio`}>
                            <Button variant="outline" className="h-14 px-8 border-border rounded-2xl gap-3 font-black uppercase text-[10px] tracking-widest">
                                <ExternalLink className="w-4 h-4" /> View Public
                            </Button>
                        </Link>
                        <Button 
                            onClick={() => setModalOpen(true)}
                            className="h-14 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest rounded-2xl gap-3 shadow-lg"
                        >
                            <Plus className="w-5 h-5" /> Archive New Work
                        </Button>
                    </div>
                </div>

                {loading ? (
                    <div className="py-40 flex flex-col items-center justify-center gap-6 opacity-30">
                        <Loader2 className="w-12 h-12 animate-spin text-primary" />
                        <p className="font-black uppercase tracking-[0.3em] italic">Syncing Archive...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {portfolio.length > 0 ? portfolio.map((item) => (
                            <div key={item.id} className="group relative bg-card border border-border rounded-[40px] overflow-hidden shadow-xl hover:border-primary/30 transition-all duration-500">
                                <div className="aspect-video relative overflow-hidden">
                                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <div className="p-8">
                                    <div className="flex items-center justify-between mb-4">
                                        <p className="text-primary font-black uppercase text-[10px] tracking-widest">{item.category}</p>
                                        <button 
                                            onClick={() => handleDelete(item.id)}
                                            className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <h3 className="text-xl font-black italic uppercase tracking-tighter text-foreground truncate">{item.title}</h3>
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-full py-40 text-center border-2 border-dashed border-border rounded-[64px]">
                                <Briefcase className="w-20 h-20 mx-auto mb-8 text-muted-foreground opacity-20" />
                                <h3 className="text-2xl font-black text-foreground italic uppercase mb-2">Archive Offline</h3>
                                <p className="text-muted-foreground font-medium mb-8">No visual masterpieces detected in your neural network.</p>
                                <Button onClick={() => setModalOpen(true)} className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-2xl font-black uppercase text-[10px] tracking-widest px-8 h-12">
                                    Initialize First Scan
                                </Button>
                            </div>
                        )}
                    </div>
                )}

                <UploadPortfolioModal 
                    isOpen={modalOpen} 
                    onClose={() => setModalOpen(false)} 
                />
            </div>
        </DashboardLayout>
    );
}
