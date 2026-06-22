"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import PostGrid from "@/components/explore/PostGrid";
import UploadPostModal from "@/components/explore/UploadPostModal";
import UploadPortfolioModal from "@/components/explore/UploadPortfolioModal";
import { 
    User, 
    MapPin, 
    Link as LinkIcon, 
    Twitter, 
    Github, 
    Instagram, 
    Star, 
    ShieldCheck, 
    MessageSquare,
    Briefcase,
    Zap,
    Share2,
    CheckCircle2,
    Plus,
    X,
    FileText,
    ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, onSnapshot, orderBy, addDoc, serverTimestamp, setDoc, deleteDoc } from "firebase/firestore";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "@/components/products/ProductCard";

export default function PublicProfilePage() {
    const { id } = useParams();
    const router = useRouter();
    const { user: currentUser } = useAuth();
    const [profile, setProfile] = useState<any>(null);
    const [posts, setPosts] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [portfolio, setPortfolio] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("posts");
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [portfolioModalOpen, setPortfolioModalOpen] = useState(false);

    const [isFollowing, setIsFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);

    useEffect(() => {
        if (!id) return;

        const fetchProfile = async () => {
            const docSnap = await getDoc(doc(db, "users", id as string));
            if (docSnap.exists()) {
                setProfile({ id: docSnap.id, ...docSnap.data() });
                
                // Check following status
                if (currentUser) {
                    const followDoc = await getDoc(doc(db, "follows", `${currentUser.uid}_${id}`));
                    setIsFollowing(followDoc.exists());
                }
            } else {
                router.push("/404");
            }
        };

        const fetchPosts = () => {
            const q = query(
                collection(db, "posts"), 
                where("creatorId", "==", id)
            );
            return onSnapshot(q, (snapshot) => {
                const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                fetched.sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
                setPosts(fetched);
            });
        };

        const fetchProducts = () => {
            const q = query(
                collection(db, "products"), 
                where("sellerId", "==", id)
            );
            return onSnapshot(q, (snapshot) => {
                const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                fetched.sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
                setProducts(fetched);
            });
        };

        const fetchPortfolio = () => {
            const q = query(
                collection(db, "portfolio"), 
                where("userId", "==", id)
            );
            return onSnapshot(q, (snapshot) => {
                const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                fetched.sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
                setPortfolio(fetched);
            });
        };

        fetchProfile().then(() => {
            const unsubPosts = fetchPosts();
            const unsubProducts = fetchProducts();
            const unsubPortfolio = fetchPortfolio();
            setLoading(false);
            return () => {
                unsubPosts();
                unsubProducts();
                unsubPortfolio();
            };
        });
    }, [id, currentUser]);

    const [hireModalOpen, setHireModalOpen] = useState(false);
    const [sharing, setSharing] = useState(false);

    const handleShare = async () => {
        setSharing(true);
        try {
            const shareData = {
                title: `${profile.fullName} on VerteX World`,
                text: profile.bio || "Check out this elite creative node!",
                url: window.location.href,
            };

            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(window.location.href);
                alert("Link optimized and copied to your neural clipboard.");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSharing(false);
        }
    };

    const handleConfirmHire = async () => {
        if (!currentUser) {
            router.push("/auth/login");
            return;
        }
        setFollowLoading(true);
        try {
            await addDoc(collection(db, "orders"), {
                buyerId: currentUser.uid,
                buyerName: currentUser.displayName || "Elite Buyer",
                freelancerId: profile.id,
                freelancerName: profile.fullName || "Freelancer",
                gigTitle: "Direct Strategic Hire",
                totalPrice: parseInt(profile.hourlyRate || "85"),
                status: "active",
                createdAt: serverTimestamp()
            });

            await addDoc(collection(db, "notifications"), {
                recipientId: profile.id,
                message: `New strategic hire activation from ${currentUser.displayName || "Buyer"}!`,
                type: "hire",
                read: false,
                createdAt: serverTimestamp()
            });

            alert("Hire successfully activated. Check your buyer dashboard.");
            setHireModalOpen(false);
            router.push("/dashboard/buyer/projects");
        } catch (err) {
            console.error(err);
            alert("Hire link unstable. Try again.");
        } finally {
            setFollowLoading(false);
        }
    };

    const handleFollowToggle = async () => {
        if (!currentUser || !profile) {
            router.push("/auth/login");
            return;
        }
        if (currentUser.uid === profile.id) return;

        setFollowLoading(true);
        const followId = `${currentUser.uid}_${profile.id}`;
        const followRef = doc(db, "follows", followId);

        try {
            if (isFollowing) {
                await deleteDoc(followRef);
                setIsFollowing(false);
            } else {
                await setDoc(followRef, {
                    followerId: currentUser.uid,
                    followedId: profile.id,
                    createdAt: serverTimestamp()
                });
                
                await addDoc(collection(db, "notifications"), {
                    recipientId: profile.id,
                    senderId: currentUser.uid,
                    senderName: profile.fullName || "A user",
                    message: `${profile.fullName || "Someone"} started following you!`,
                    type: "follow",
                    read: false,
                    createdAt: serverTimestamp()
                });

                setIsFollowing(true);
            }
        } catch (err) {
            console.error("Follow error:", err);
        } finally {
            setFollowLoading(false);
        }
    };

    if (loading || !profile) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-primary font-black uppercase tracking-[0.5em] animate-pulse">Scanning Profile Node...</div>
            </div>
        );
    }

    const tabs = [
        { id: "posts", label: "Posts", count: posts.length },
        { id: "portfolio", label: "Portfolio", count: portfolio.length },
        { id: "reviews", label: "Reviews", count: profile.reviewCount || 0 },
        { id: "services", label: "Services", count: profile.serviceCount || 0 },
        { id: "products", label: "Products", count: products.length },
        { id: "about", label: "About", count: null }
    ];

    return (
        <main className="min-h-screen bg-background text-foreground pt-32 pb-20">
            <Navbar />

            <div className="max-w-7xl mx-auto px-6">
                {/* Header Profile Section */}
                <div className="bg-card/50 border border-border rounded-[56px] p-12 mb-12 relative overflow-hidden group shadow-3xl">
                    <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    
                    <div className="flex flex-col lg:flex-row gap-12 items-center lg:items-start relative z-10">
                        {/* Avatar */}
                        <div className="relative shrink-0">
                            <div className="w-48 h-48 bg-background border-4 border-border rounded-[64px] flex items-center justify-center text-primary text-7xl font-black italic shadow-2xl relative group-hover:border-primary transition-all duration-500 overflow-hidden">
                                {profile.avatarUrl ? (
                                    <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    profile.fullName?.[0] || "V"
                                )}
                            </div>
                            <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-primary rounded-[24px] border-[6px] border-card flex items-center justify-center shadow-xl">
                                <CheckCircle2 className="w-8 h-8 text-black" />
                            </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-center lg:text-left">
                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 mb-4">
                                <h1 className="text-5xl font-black text-foreground italic tracking-tighter uppercase">{profile.fullName}</h1>
                                <div className="flex items-center gap-2 px-6 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-[10px] font-black uppercase tracking-widest">
                                    <ShieldCheck className="w-4 h-4" /> NODE VERIFIED
                                </div>
                            </div>
                            
                            <p className="text-muted-foreground font-black text-[12px] uppercase tracking-[0.4em] mb-6 flex items-center justify-center lg:justify-start gap-4">
                                @{profile.id?.slice(0, 8)} <span className="opacity-20">|</span> <MapPin className="w-4 h-4 text-primary" /> {profile.location || "GLOBAL PRESENCE"}
                            </p>

                            <p className="text-muted-foreground text-lg font-medium leading-relaxed max-w-2xl mb-8 lg:max-w-3xl">
                                {profile.bio || "Member of the elite VerteX decentralized talent network. Specializing in advanced creative and technical solutions."}
                            </p>

                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-10">
                                <div className="text-center lg:text-left">
                                    <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mb-1 opacity-50">Earned</p>
                                    <div className="text-3xl font-black text-foreground italic tracking-tighter">$0</div>
                                </div>
                                <div className="bg-white/5 w-px h-10 hidden sm:block" />
                                <div className="text-center lg:text-left">
                                    <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mb-1 opacity-50">Hired</p>
                                    <div className="text-3xl font-black text-foreground italic tracking-tighter">0x</div>
                                </div>
                                <div className="bg-white/5 w-px h-10 hidden sm:block" />
                                <div className="text-center lg:text-left">
                                    <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mb-1 opacity-50">Rating</p>
                                    <div className="text-3xl font-black text-foreground italic tracking-tighter flex items-center justify-center lg:justify-start gap-2">
                                        <Star className="w-6 h-6 text-yellow-400 fill-current" /> 0.00
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-4 min-w-[200px]">
                            {currentUser?.uid !== profile.id ? (
                                <>
                                    <Button 
                                        onClick={handleFollowToggle}
                                        disabled={followLoading}
                                        className={`h-16 font-black uppercase tracking-widest italic rounded-3xl gap-3 shadow-xl transition-all ${
                                            isFollowing 
                                            ? "bg-white text-black hover:bg-destructive hover:text-white" 
                                            : "bg-primary text-black hover:bg-primary/90"
                                        }`}
                                    >
                                        {isFollowing ? "Following" : "Follow node"}
                                    </Button>
                                    <Button 
                                        onClick={() => setHireModalOpen(true)}
                                        className="h-16 bg-card hover:bg-card/80 border border-border text-foreground font-black uppercase tracking-widest italic rounded-3xl gap-3"
                                    >
                                        <MessageSquare className="w-5 h-5 text-primary" /> Hire node
                                    </Button>
                                    {profile.resumeLink && (
                                        <a 
                                            href={profile.resumeLink} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                        >
                                            <Button 
                                                variant="outline"
                                                className="h-16 border-border bg-background/50 text-foreground font-black uppercase tracking-widest italic rounded-3xl gap-3"
                                            >
                                                <FileText className="w-5 h-5 text-primary" /> CV
                                            </Button>
                                        </a>
                                    )}
                                </>
                            ) : (
                                <Button 
                                    onClick={() => router.push("/dashboard/freelancer/profile")}
                                    className="h-16 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest italic rounded-3xl gap-3 shadow-xl"
                                >
                                    Edit Profile
                                </Button>
                            )}
                            <Button 
                                variant="outline" 
                                onClick={handleShare}
                                disabled={sharing}
                                className="h-16 border-border bg-background/50 text-foreground font-black uppercase tracking-widest italic rounded-3xl gap-3"
                            >
                                <Share2 className="w-5 h-5 text-primary" /> {sharing ? "Syncing..." : "Share node"}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Hire Modal */}
                <AnimatePresence>
                    {hireModalOpen && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setHireModalOpen(false)} className="absolute inset-0 bg-background/80 backdrop-blur-md" />
                            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-card border border-white/10 rounded-[48px] w-full max-w-xl p-12 shadow-3xl text-center">
                                <button onClick={() => setHireModalOpen(false)} className="absolute top-8 right-8 text-muted-foreground hover:text-foreground transition-colors"><X className="w-6 h-6" /></button>
                                <div className="w-20 h-20 bg-primary/10 rounded-[32px] flex items-center justify-center text-primary mx-auto mb-8 border border-primary/20">
                                    <Briefcase className="w-10 h-10" />
                                </div>
                                <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-4">Strategic Activation</h2>
                                <p className="text-muted-foreground font-medium mb-10 leading-relaxed">You are initiating a direct project link with <span className="text-primary font-black">{profile.fullName}</span> at a rate of <span className="text-white font-black">${profile.hourlyRate || "85"}/hr</span>. Confirm?</p>
                                <div className="flex flex-col gap-4">
                                    <Button 
                                        onClick={handleConfirmHire}
                                        disabled={followLoading}
                                        className="h-16 bg-primary text-black font-black uppercase tracking-widest rounded-3xl hover:bg-primary/90 shadow-xl transition-all"
                                    >
                                        {followLoading ? "Syncing..." : "Activate Hire Node"}
                                    </Button>
                                    <button onClick={() => setHireModalOpen(false)} className="text-muted-foreground font-black uppercase text-[10px] tracking-widest hover:text-foreground transition-all">Cancel Link</button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Tabs Section */}
                <div className="flex items-center justify-between border-b border-white/5 mb-12">
                    <div className="flex overflow-x-auto gap-12 no-scrollbar">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`pb-8 text-sm font-black uppercase tracking-[0.3em] transition-all relative whitespace-nowrap ${
                                    activeTab === tab.id ? "text-primary" : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                {tab.label}
                                {tab.count !== null && <span className="ml-3 text-[10px] opacity-40">{tab.count}</span>}
                                {activeTab === tab.id && (
                                    <motion.div layoutId="tabLine" className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full shadow-[0_-4px_12px_rgba(148,255,61,0.5)]" />
                                )}
                            </button>
                        ))}
                    </div>

                    {id === currentUser?.uid && (
                         <Button 
                            onClick={() => router.push("/dashboard/freelancer/profile")}
                            className="bg-card hover:bg-primary hover:text-primary-foreground border border-border h-12 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest gap-2"
                         >
                            Edit Profile
                         </Button>
                    )}
                </div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {activeTab === "posts" && (
                            <div className="space-y-12">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-3xl font-black text-foreground italic uppercase tracking-tighter">Recent Transmissions</h2>
                                    {id === currentUser?.uid && (
                                         <Button onClick={() => setUploadModalOpen(true)} variant="outline" className="rounded-2xl gap-2 font-black uppercase text-[10px] tracking-widest border-primary/50 text-primary hover:bg-primary hover:text-black">
                                            <Plus className="w-4 h-4" /> Add Post
                                         </Button>
                                    )}
                                </div>
                                {posts.length > 0 ? (
                                    <PostGrid posts={posts} loading={false} />
                                ) : (
                                    <div className="py-20 text-center text-muted-foreground font-black uppercase tracking-widest italic border border-dashed border-border rounded-[48px]">No transmissions detected from this node yet...</div>
                                )}
                            </div>
                        )}
                        {activeTab === "products" && (
                            <div className="space-y-12">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-3xl font-black text-foreground italic uppercase tracking-tighter">Hosted Products</h2>
                                    {id === currentUser?.uid && (
                                         <Button onClick={() => router.push("/dashboard/freelancer/gigs/create")} variant="outline" className="rounded-2xl gap-2 font-black uppercase text-[10px] tracking-widest border-primary/50 text-primary hover:bg-primary hover:text-black">
                                            <Plus className="w-4 h-4" /> Add Product
                                         </Button>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                    {products.length > 0 ? products.map(product => (
                                        <ProductCard key={product.id} product={product} />
                                    )) : (
                                        <div className="col-span-full py-20 text-center text-muted-foreground font-black uppercase tracking-widest italic border border-dashed border-border rounded-[48px]">No biological products hosted on this node yet...</div>
                                    )}
                                </div>
                            </div>
                        )}
                        {activeTab === "services" && (
                            <div className="space-y-12">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-3xl font-black text-foreground italic uppercase tracking-tighter">Active Services</h2>
                                    {id === currentUser?.uid && (
                                         <Button onClick={() => router.push("/dashboard/freelancer/gigs/create")} variant="outline" className="rounded-2xl gap-2 font-black uppercase text-[10px] tracking-widest border-primary/50 text-primary hover:bg-primary hover:text-black">
                                            <Plus className="w-4 h-4" /> Create Service
                                         </Button>
                                    )}
                                </div>
                                <div className="py-20 text-center text-muted-foreground font-black uppercase tracking-widest italic border border-dashed border-border rounded-[48px]">Scanning for active service nodes... 0 detected.</div>
                            </div>
                        )}
                        {activeTab === "portfolio" && (
                            <div className="space-y-12">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-3xl font-black text-foreground italic uppercase tracking-tighter">Visual Archive</h2>
                                    {id === currentUser?.uid && (
                                         <Button onClick={() => setPortfolioModalOpen(true)} variant="outline" className="rounded-2xl gap-2 font-black uppercase text-[10px] tracking-widest border-primary/50 text-primary hover:bg-primary hover:text-black">
                                            <Plus className="w-4 h-4" /> Add to Portfolio
                                         </Button>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {portfolio.length > 0 ? portfolio.map(item => (
                                        <motion.div 
                                            key={item.id} 
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="group relative bg-card border border-border rounded-[32px] overflow-hidden aspect-video shadow-xl"
                                        >
                                            <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
                                                <p className="text-xs text-primary font-black uppercase tracking-widest mb-1">{item.category}</p>
                                                <div className="flex items-center justify-between gap-4">
                                                    <p className="text-xl font-black italic uppercase italic tracking-tighter truncate">{item.title}</p>
                                                    {item.projectLink && (
                                                        <a 
                                                            href={item.projectLink} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="p-2 bg-primary text-black rounded-lg hover:scale-110 transition-transform"
                                                        >
                                                            <ExternalLink className="w-4 h-4" />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )) : (
                                        <div className="col-span-full py-20 text-center text-muted-foreground font-black uppercase tracking-widest italic border border-dashed border-border rounded-[48px]">Neural archive is currently empty for this node.</div>
                                    )}
                                </div>
                            </div>
                        )}
                        {activeTab === "about" && (
                             <div className="bg-card/30 border border-border rounded-[48px] p-12 leading-relaxed text-lg max-w-4xl relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                <h3 className="text-2xl font-black text-foreground uppercase italic tracking-tighter mb-8 flex items-center gap-4">
                                    Professional Philosophy <div className="h-px flex-1 bg-white/5" />
                                </h3>
                                <div className="space-y-6 text-muted-foreground font-medium relative z-10">
                                    <p>{profile.bio || "No biography provided. This node prefers to let its work speak for itself."}</p>
                                    <div className="pt-10 grid grid-cols-1 md:grid-cols-2 gap-10 border-t border-white/5">
                                        <div>
                                            <p className="text-primary font-black uppercase text-[10px] tracking-widest mb-4">Core Expertise</p>
                                            <p className="text-foreground font-black text-xl italic">{profile.expertise || "Full Stack Specialist"}</p>
                                        </div>
                                        <div>
                                            <p className="text-primary font-black uppercase text-[10px] tracking-widest mb-4">Baseline Rate</p>
                                            <p className="text-foreground font-black text-xl italic">${profile.hourlyRate || "85"} / hour</p>
                                        </div>
                                    </div>
                                </div>
                             </div>
                        )}
                        {["reviews"].includes(activeTab) && (
                            <div className="py-40 text-center opacity-30">
                                <Zap className="w-20 h-20 mx-auto mb-8 text-primary animate-pulse" />
                                <p className="text-2xl font-black uppercase tracking-[0.5em] italic">Link Pending Activation</p>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                <UploadPostModal 
                    isOpen={uploadModalOpen} 
                    onClose={() => setUploadModalOpen(false)} 
                />

                <UploadPortfolioModal 
                    isOpen={portfolioModalOpen} 
                    onClose={() => setPortfolioModalOpen(false)} 
                />
            </div>
        </main>
    );
}
