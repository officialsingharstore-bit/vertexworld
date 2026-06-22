"use client";

import { motion } from "framer-motion";
import { Heart, MessageCircle, Share2, Play } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface PostCardProps {
    post: {
        id: string;
        type: "image" | "video";
        mediaUrl: string;
        thumbnailUrl?: string;
        title: string;
        creatorId: string;
        creatorName: string;
        creatorAvatar?: string;
        likes: number;
        comments: number;
    };
}

export default function PostCard({ post }: PostCardProps) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            className="relative group bg-card border border-border rounded-3xl overflow-hidden cursor-pointer shadow-lg hover:shadow-primary/10 transition-all duration-500"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Link href={`/post/${post.id}`}>
                <div className="relative aspect-auto min-h-[200px] overflow-hidden bg-muted/20">
                    {post.type === "video" ? (
                        <div className="relative">
                            <img
                                src={post.thumbnailUrl || post.mediaUrl.replace(/\.[^/.]+$/, ".jpg")}
                                alt={post.title}
                                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white">
                                    <Play className="w-6 h-6 fill-current ml-1" />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <img
                            src={post.mediaUrl}
                            alt={post.title}
                            className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                    )}

                    {/* Overlay on Hover */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isHovered ? 1 : 0 }}
                        className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6"
                    >
                        <div className="flex items-center justify-between text-white mb-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-primary/20 border border-white/20 flex items-center justify-center text-[10px] font-black italic text-primary overflow-hidden">
                                    {post.creatorAvatar ? (
                                        <img src={post.creatorAvatar} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        post.creatorName?.[0] || "V"
                                    )}
                                </div>
                                <span className="text-xs font-bold truncate max-w-[100px]">{post.creatorName}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1">
                                    <Heart className="w-4 h-4" />
                                    <span className="text-[10px] font-bold">{post.likes}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <MessageCircle className="w-4 h-4" />
                                    <span className="text-[10px] font-bold">{post.comments}</span>
                                </div>
                            </div>
                        </div>
                        <h3 className="text-sm font-black text-white italic uppercase tracking-wider line-clamp-1">
                            {post.title}
                        </h3>
                    </motion.div>
                </div>
            </Link>
        </motion.div>
    );
}
