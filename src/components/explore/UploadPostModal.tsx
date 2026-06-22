"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Image as ImageIcon, Video, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadToCloudinary, uploadVideoToCloudinary } from "@/lib/cloudinary";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, getDocs, query, where } from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";

interface UploadPostModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function UploadPostModal({ isOpen, onClose }: UploadPostModalProps) {
    const { user, userData } = useAuth();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [media, setMedia] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [mediaType, setMediaType] = useState<"image" | "video">("image");
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setMedia(file);
            setMediaType(file.type.startsWith("video/") ? "video" : "image");
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleUpload = async () => {
        if (!user || !media || !title) return;
        setIsUploading(true);
        try {
            let mediaUrl = "";
            if (mediaType === "video") {
                mediaUrl = await uploadVideoToCloudinary(media);
            } else {
                mediaUrl = await uploadToCloudinary(media);
            }

            const postRef = await addDoc(collection(db, "posts"), {
                title,
                description,
                mediaUrl,
                type: mediaType,
                creatorId: user.uid,
                creatorName: userData?.fullName || "Anonymous Node",
                creatorAvatar: userData?.avatarUrl || null,
                likes: 0,
                comments: 0,
                createdAt: serverTimestamp(),
            });

            // Notify Followers
            const followersQ = query(collection(db, "follows"), where("followedId", "==", user.uid));
            const followersSnap = await getDocs(followersQ);
            
            const notificationPromises = followersSnap.docs.map(followerDoc => {
                const followerData = followerDoc.data();
                return addDoc(collection(db, "notifications"), {
                    recipientId: followerData.followerId,
                    senderId: user.uid,
                    senderName: userData?.fullName || "A node you follow",
                    message: `${userData?.fullName || "A creator you follow"} deployed a new transmission: ${title}`,
                    type: "new_post",
                    postId: postRef.id,
                    read: false,
                    createdAt: serverTimestamp()
                });
            });

            await Promise.all(notificationPromises);

            onClose();
            alert("New node deployed to the network. Followers notified.");
        } catch (err) {
            console.error("Upload error:", err);
            alert("Upload failed. Encryption error.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }} 
                        onClick={onClose} 
                        className="absolute inset-0 bg-background/80 backdrop-blur-md" 
                    />
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0, y: 20 }} 
                        animate={{ scale: 1, opacity: 1, y: 0 }} 
                        exit={{ scale: 0.9, opacity: 0, y: 20 }} 
                        className="relative bg-card border border-border rounded-[48px] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-3xl flex flex-col md:flex-row"
                    >
                        {/* Close Button */}
                        <button 
                            onClick={onClose} 
                            className="absolute top-6 right-6 p-2 rounded-full bg-background/50 hover:bg-destructive text-foreground hover:text-white shadow-lg transition-all z-20"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        {/* Left: Media Upload/Preview */}
                        <div className="flex-1 bg-muted/20 relative min-h-[300px] md:min-h-auto flex items-center justify-center p-12 border-b md:border-b-0 md:border-r border-border">
                            {preview ? (
                                <div className="w-full h-full flex flex-col items-center justify-center">
                                    {mediaType === "video" ? (
                                        <video src={preview} controls className="max-w-full max-h-[400px] rounded-3xl shadow-2xl" />
                                    ) : (
                                        <img src={preview} alt="Preview" className="max-w-full max-h-[400px] rounded-3xl shadow-2xl object-contain" />
                                    )}
                                    <button 
                                        onClick={() => { setPreview(null); setMedia(null); }}
                                        className="mt-4 text-muted-foreground hover:text-primary transition-colors text-[10px] font-black uppercase tracking-widest"
                                    >
                                        Change Media
                                    </button>
                                </div>
                            ) : (
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full aspect-square border-4 border-dashed border-border rounded-[40px] flex flex-col items-center justify-center gap-6 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all group"
                                >
                                    <div className="w-24 h-24 bg-background border border-border rounded-[32px] flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                                        <Upload className="w-10 h-10" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-foreground font-black uppercase italic italic tracking-tighter text-2xl mb-2">Select Visual Node</p>
                                        <p className="text-muted-foreground font-bold text-sm">Image or Video up to 100MB</p>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                            <ImageIcon className="w-3 h-3" /> Image
                                        </div>
                                        <div className="flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                            <Video className="w-3 h-3" /> Video
                                        </div>
                                    </div>
                                </div>
                            )}
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} hidden accept="image/*,video/*" />
                        </div>

                        {/* Right: Metadata */}
                        <div className="flex-1 p-12 flex flex-col justify-between">
                            <div className="space-y-8">
                                <div>
                                    <h2 className="text-3xl font-black uppercase italic italic tracking-tighter mb-2">New Transmission</h2>
                                    <p className="text-muted-foreground font-medium text-sm">Deploy your creative work across the decentralized grid.</p>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <label className="text-muted-foreground text-[10px] font-black uppercase tracking-widest ml-1">Transmission Title</label>
                                        <input 
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            className="w-full h-14 bg-background border border-border rounded-2xl px-6 text-foreground font-bold outline-none focus:border-primary/50 transition-all placeholder:opacity-30"
                                            placeholder="Enter a compelling title..."
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-muted-foreground text-[10px] font-black uppercase tracking-widest ml-1">Strategic Description</label>
                                        <textarea 
                                            rows={4}
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            className="w-full bg-background border border-border rounded-2xl p-6 text-foreground font-medium outline-none focus:border-primary/50 transition-all resize-none leading-relaxed placeholder:opacity-30"
                                            placeholder="Describe your design intent or process..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-12 flex items-center gap-6">
                                <Button
                                    onClick={handleUpload}
                                    disabled={isUploading || !media || !title}
                                    className="flex-1 h-16 bg-primary hover:bg-primary/90 text-primary-foreground rounded-3xl font-black uppercase tracking-widest italic gap-3 shadow-xl transition-all"
                                >
                                    {isUploading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Synchronizing...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5" />
                                            Deploy Post
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
