"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Send, Loader2, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";

interface UploadPortfolioModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function UploadPortfolioModal({ isOpen, onClose }: UploadPortfolioModalProps) {
    const { user } = useAuth();
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("");
    const [projectLink, setProjectLink] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleUpload = async () => {
        if (!user || !image || !title) return;
        setIsUploading(true);
        try {
            const imageUrl = await uploadToCloudinary(image);

            await addDoc(collection(db, "portfolio"), {
                title,
                category,
                projectLink,
                imageUrl,
                userId: user.uid,
                createdAt: serverTimestamp(),
            });

            onClose();
            alert("Work added to your professional archive.");
        } catch (err) {
            console.error("Upload error:", err);
            alert("Upload failed.");
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
                        initial={{ scale: 0.9, opacity: 0 }} 
                        animate={{ scale: 1, opacity: 1 }} 
                        exit={{ scale: 0.9, opacity: 0 }} 
                        className="relative bg-card border border-border rounded-[48px] w-full max-w-xl p-12 shadow-3xl overflow-y-auto max-h-[90vh] no-scrollbar"
                    >
                        <button onClick={onClose} className="absolute top-8 right-8 text-muted-foreground hover:text-destructive transition-colors"><X className="w-6 h-6" /></button>
                        
                        <div className="flex flex-col items-center text-center mb-10">
                            <div className="w-20 h-20 bg-primary/10 rounded-[32px] flex items-center justify-center text-primary mb-6 border border-primary/20">
                                <Briefcase className="w-10 h-10" />
                            </div>
                            <h2 className="text-3xl font-black uppercase italic tracking-tighter">Archive New Work</h2>
                            <p className="text-muted-foreground font-medium text-sm">Add a masterpiece to your professional nodes.</p>
                        </div>

                        <div className="space-y-6">
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full aspect-video bg-muted/20 border-2 border-dashed border-border rounded-3xl flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-primary/50 transition-all overflow-hidden relative"
                            >
                                {preview ? (
                                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <>
                                        <Upload className="w-8 h-8 text-muted-foreground" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Select Project Visual</span>
                                    </>
                                )}
                            </div>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} hidden accept="image/*" />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-muted-foreground text-[10px] font-black uppercase tracking-widest ml-1">Project Title</label>
                                    <input 
                                        className="w-full h-14 bg-background border border-border rounded-2xl px-6 text-foreground font-bold outline-none focus:border-primary/50 transition-all"
                                        placeholder="Project name..."
                                        value={title}
                                        onChange={e => setTitle(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-muted-foreground text-[10px] font-black uppercase tracking-widest ml-1">Category</label>
                                    <input 
                                        className="w-full h-14 bg-background border border-border rounded-2xl px-6 text-foreground font-bold outline-none focus:border-primary/50 transition-all"
                                        placeholder="e.g. Web App"
                                        value={category}
                                        onChange={e => setCategory(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-muted-foreground text-[10px] font-black uppercase tracking-widest ml-1">External Link (Optional)</label>
                                <input 
                                    className="w-full h-14 bg-background border border-border rounded-2xl px-6 text-foreground font-bold outline-none focus:border-primary/50 transition-all"
                                    placeholder="https://your-project.com"
                                    value={projectLink}
                                    onChange={e => setProjectLink(e.target.value)}
                                />
                            </div>

                            <Button 
                                onClick={handleUpload}
                                disabled={isUploading || !image || !title}
                                className="w-full h-16 bg-primary hover:bg-primary/90 text-primary-foreground rounded-3xl font-black uppercase tracking-widest italic gap-3 shadow-xl transition-all mt-6"
                            >
                                {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                {isUploading ? "Uploading Archive..." : "Submit to Portfolio"}
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
