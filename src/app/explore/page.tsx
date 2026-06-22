"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import PostGrid from "@/components/explore/PostGrid";
import { Plus, Search, Filter, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";
import UploadPostModal from "@/components/explore/UploadPostModal";

export default function ExplorePage() {
    const { user } = useAuth();
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const q = query(collection(db, "posts"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // Client-side sort to avoid index requirement for now
            fetchedPosts.sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
            setPosts(fetchedPosts);
            setLoading(false);
        }, (err) => {
            console.error("Explore feed error:", err);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const filteredPosts = posts.filter(post => 
        post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.creatorName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <main className="min-h-screen bg-background text-foreground pt-32 pb-20">
            <Navbar />

            <div className="max-w-7xl mx-auto px-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                    <div>
                        <div className="flex items-center gap-3 text-primary mb-4">
                            <Zap className="w-6 h-6 fill-current" />
                            <span className="text-[10px] font-black uppercase tracking-[0.5em]">Neural Network Feed</span>
                        </div>
                        <h1 className="text-6xl md:text-7xl font-black text-foreground uppercase italic tracking-tighter leading-none mb-6">
                            Explore <span className="text-primary">Creativity</span>
                        </h1>
                        <p className="text-muted-foreground text-xl font-medium max-w-2xl leading-relaxed">
                            Discover high-tier professional work across the VerteX decentralized creative network.
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        {user && (
                            <Button 
                                onClick={() => setIsUploadModalOpen(true)}
                                className="h-16 px-10 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest rounded-3xl gap-3 shadow-2xl shadow-primary/20 transition-all duration-500 scale-100 hover:scale-105"
                            >
                                <Plus className="w-5 h-5" />
                                Initiate Post
                            </Button>
                        )}
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="flex flex-col lg:flex-row gap-6 mb-12">
                    <div className="flex-1 relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input 
                            type="text"
                            placeholder="Scan titles, creators, or nodes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-16 bg-card border border-border rounded-full pl-16 pr-8 text-foreground font-bold outline-none focus:border-primary/50 transition-all shadow-xl"
                        />
                    </div>
                    <div className="flex gap-4">
                        <Button variant="outline" className="h-16 px-8 rounded-full border-border bg-card/50 font-black uppercase tracking-widest gap-3">
                            <Filter className="w-5 h-5" />
                            Category
                        </Button>
                        <Button variant="outline" className="h-16 px-8 rounded-full border-border bg-card/50 font-black uppercase tracking-widest gap-3">
                            Trending
                        </Button>
                    </div>
                </div>

                {/* Post Grid */}
                <PostGrid posts={filteredPosts} loading={loading} />
            </div>

            {/* Upload Modal */}
            {isUploadModalOpen && (
                <UploadPostModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} />
            )}
        </main>
    );
}
