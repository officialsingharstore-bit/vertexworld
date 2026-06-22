"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import { 
    Heart, 
    MessageSquare, 
    Share2, 
    ChevronLeft, 
    MoreHorizontal, 
    Send,
    Play,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, onSnapshot, orderBy, addDoc, serverTimestamp, setDoc, deleteDoc } from "firebase/firestore";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import PostCard from "@/components/explore/PostCard";
import Link from "next/link";

export default function PostDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user, userData } = useAuth();
    const [post, setPost] = useState<any>(null);
    const [comments, setComments] = useState<any[]>([]);
    const [relatedPosts, setRelatedPosts] = useState<any[]>([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [isFollowing, setIsFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);

    useEffect(() => {
        if (!id) return;

        const fetchPost = async () => {
            const docSnap = await getDoc(doc(db, "posts", id as string));
            if (docSnap.exists()) {
                const data = { id: docSnap.id, ...docSnap.data() } as any;
                setPost(data);

                // Check if following
                if (user) {
                    const followDoc = await getDoc(doc(db, "follows", `${user.uid}_${data.creatorId}`));
                    setIsFollowing(followDoc.exists());
                }
                
                // Fetch related posts (same creator)
                const relatedQ = query(
                    collection(db, "posts"), 
                    where("creatorId", "==", data.creatorId)
                );
                onSnapshot(relatedQ, (snap) => {
                    const fetched = snap.docs.filter(d => d.id !== id).map(d => ({ id: d.id, ...d.data() }));
                    fetched.sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
                    setRelatedPosts(fetched.slice(0, 6));
                });

                // Fetch comments
                const commentsQ = query(
                    collection(db, "comments"),
                    where("postId", "==", id)
                );
                onSnapshot(commentsQ, (snap) => {
                    const fetched = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                    fetched.sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
                    setComments(fetched);
                });
            } else {
                router.push("/explore");
            }
            setLoading(false);
        };

        fetchPost();
    }, [id, user]);

    const handleFollowToggle = async () => {
        if (!user || !post) {
            router.push("/auth/login");
            return;
        }
        if (user.uid === post.creatorId) return;

        setFollowLoading(true);
        const followId = `${user.uid}_${post.creatorId}`;
        const followRef = doc(db, "follows", followId);

        try {
            if (isFollowing) {
                // Unfollow
                await deleteDoc(followRef);
                setIsFollowing(false);
            } else {
                // Follow
                await setDoc(followRef, {
                    followerId: user.uid,
                    followedId: post.creatorId,
                    createdAt: serverTimestamp()
                });
                
                // Create Notification
                await addDoc(collection(db, "notifications"), {
                    recipientId: post.creatorId,
                    senderId: user.uid,
                    senderName: userData?.fullName || "A user",
                    message: `${userData?.fullName || "Someone"} started following you!`,
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

    const handleComment = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!user || !newComment.trim()) return;
        setSubmitting(true);
        try {
            await addDoc(collection(db, "comments"), {
                postId: id,
                userId: user.uid,
                userName: userData?.fullName || "Anonymous",
                userAvatar: userData?.avatarUrl || null,
                text: newComment,
                createdAt: serverTimestamp(),
            });
            setNewComment("");
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading || !post) {
        return <div className="min-h-screen bg-background flex items-center justify-center text-primary font-black uppercase tracking-[0.5em] animate-pulse">Accessing Data Node...</div>;
    }

    return (
        <main className="min-h-screen bg-background text-foreground pt-32 pb-20">
            <Navbar />

            <div className="max-w-[1600px] mx-auto px-6">
                {/* Back Button */}
                <button 
                    onClick={() => router.back()}
                    className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors mb-8 font-black uppercase text-[10px] tracking-[0.3em]"
                >
                    <ChevronLeft className="w-5 h-5" /> Back to transmission grid
                </button>

                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Left: Content Display */}
                    <div className="flex-[1.5] space-y-8">
                        <div className="bg-card/50 border border-border rounded-[48px] overflow-hidden shadow-3xl relative group">
                            {post.type === "video" ? (
                                <video 
                                    src={post.mediaUrl} 
                                    controls 
                                    className="w-full h-auto max-h-[80vh] object-contain bg-black" 
                                />
                            ) : (
                                <img 
                                    src={post.mediaUrl} 
                                    alt={post.title} 
                                    className="w-full h-auto max-h-[85vh] object-contain"
                                />
                            )}
                        </div>

                        {/* Title and Stats for Mobile/Tablets */}
                        <div className="lg:hidden space-y-6">
                            <h1 className="text-4xl font-black text-foreground italic uppercase tracking-tighter">{post.title}</h1>
                            <p className="text-muted-foreground text-lg leading-relaxed">{post.description}</p>
                        </div>
                    </div>

                    {/* Right: Details & Sidebar */}
                    <div className="flex-1 space-y-12">
                        {/* Header & Bio */}
                        <div className="bg-card border border-border rounded-[40px] p-10 space-y-10 shadow-2xl relative overflow-hidden">
                            <div className="flex items-center justify-between">
                                <Link href={`/freelancers/${post.creatorId}`} className="flex items-center gap-4 group">
                                    <div className="w-14 h-14 bg-background border-2 border-border rounded-2xl flex items-center justify-center text-primary text-2xl font-black italic group-hover:border-primary transition-all overflow-hidden shrink-0">
                                        {post.creatorAvatar ? <img src={post.creatorAvatar} className="w-full h-full object-cover" /> : post.creatorName?.[0] || "V"}
                                    </div>
                                    <div>
                                        <h3 className="font-black text-foreground uppercase italic tracking-tighter group-hover:text-primary transition-colors">{post.creatorName}</h3>
                                        <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">Active Node Creator</p>
                                    </div>
                                </Link>
                                {user?.uid !== post.creatorId && (
                                    <div className="flex items-center gap-2">
                                        <Button 
                                            size="sm" 
                                            onClick={handleFollowToggle}
                                            disabled={followLoading}
                                            className={`h-10 px-6 font-black uppercase text-[9px] tracking-widest rounded-xl transition-all ${
                                                isFollowing 
                                                ? "bg-white text-black hover:bg-destructive hover:text-white" 
                                                : "bg-primary text-black hover:bg-primary/90"
                                            }`}
                                        >
                                            {followLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : (isFollowing ? "Following" : "Follow")}
                                        </Button>
                                        <Button variant="outline" size="sm" className="rounded-xl border-border h-10 w-10 p-0">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <h1 className="text-4xl font-black text-foreground italic uppercase tracking-tighter hidden lg:block">{post.title}</h1>
                                <p className="text-muted-foreground leading-relaxed hidden lg:block">{post.description}</p>
                            </div>

                            <div className="flex items-center gap-4 border-t border-white/5 pt-10">
                                <Button variant="outline" className="flex-1 h-14 rounded-2xl gap-3 border-border hover:border-primary/50 text-muted-foreground hover:text-primary">
                                    <Heart className="w-5 h-5" />
                                    <span className="font-black uppercase text-[10px] tracking-widest">{post.likes} Likes</span>
                                </Button>
                                <Button variant="outline" className="h-14 w-14 rounded-2xl border-border hover:border-primary/50 text-muted-foreground hover:text-primary p-0">
                                    <MessageSquare className="w-5 h-5" />
                                </Button>
                                <Button variant="outline" className="h-14 w-14 rounded-2xl border-border hover:border-primary/50 text-muted-foreground hover:text-primary p-0">
                                    <Share2 className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>

                        {/* Comments Section */}
                        <div className="bg-card border border-border rounded-[40px] p-10 shadow-2xl flex flex-col h-[500px]">
                            <h3 className="text-xl font-black text-foreground uppercase italic tracking-tighter mb-8 flex items-center gap-3">
                                <MessageSquare className="w-5 h-5 text-primary" /> Transmissions Feed <span className="text-[10px] opacity-40 ml-auto">{comments.length} Comments</span>
                            </h3>
                            
                            <div className="flex-1 overflow-y-auto pr-2 space-y-6 mb-8 custom-scrollbar">
                                {comments.length === 0 ? (
                                    <div className="h-full flex items-center justify-center text-muted-foreground font-black uppercase text-[10px] tracking-widest italic opacity-30">No neural transmissions yet...</div>
                                ) : (
                                    comments.map((comment) => (
                                        <div key={comment.id} className="flex gap-4 group">
                                            <div className="w-10 h-10 bg-background border border-border rounded-xl flex items-center justify-center text-primary text-sm font-black italic shrink-0 overflow-hidden">
                                                {comment.userAvatar ? <img src={comment.userAvatar} className="w-full h-full object-cover" /> : comment.userName?.[0]}
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-primary italic">{comment.userName}</span>
                                                    <span className="text-[8px] text-muted-foreground uppercase opacity-40">Just now</span>
                                                </div>
                                                <p className="text-sm font-medium text-foreground leading-relaxed bg-white/5 p-4 rounded-2xl rounded-tl-none">{comment.text}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <form onSubmit={handleComment} className="relative">
                                <textarea 
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Participate in transmission..."
                                    className="w-full bg-background border border-border rounded-3xl p-6 pr-16 text-sm font-medium outline-none focus:border-primary/50 transition-all resize-none shadow-xl"
                                    rows={2}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleComment();
                                        }
                                    }}
                                />
                                <button 
                                    type="submit"
                                    disabled={submitting || !newComment.trim()}
                                    className="absolute right-4 bottom-4 w-10 h-10 bg-primary text-black rounded-2xl flex items-center justify-center hover:scale-105 transition-all disabled:opacity-30 disabled:scale-100 shadow-lg shadow-primary/20"
                                >
                                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                </button>
                                <p className="mt-3 text-[8px] text-muted-foreground uppercase tracking-widest text-right px-2">Press Enter to sync, Shift+Enter for new line</p>
                            </form>
                        </div>

                        {/* More Like This */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-black text-foreground uppercase italic tracking-tighter">More from {post.creatorName}</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {relatedPosts.map((rp) => (
                                    <PostCard key={rp.id} post={rp} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
