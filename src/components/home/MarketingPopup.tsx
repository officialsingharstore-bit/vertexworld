"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Pause, FastForward } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { usePathname } from "next/navigation";

export default function MarketingPopup() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [videoUrl, setVideoUrl] = useState("");
    const [isPlaying, setIsPlaying] = useState(true);
    const [hasSeen, setHasSeen] = useState(false);

    useEffect(() => {
        // Only show once per session ideally, but for now let's respect the DB toggle
        const unsub = onSnapshot(doc(db, "platform_settings", "config"), (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.data();
                if (data.enablePopupVideo && data.popupVideoUrl && !hasSeen) {
                    setVideoUrl(data.popupVideoUrl);
                    setIsOpen(true);
                } else {
                    setIsOpen(false);
                }
            }
        });

        return () => unsub();
    }, [hasSeen]);

    const handleClose = () => {
        setIsOpen(false);
        setHasSeen(true);
    };

    // NEVER show on admin, dashboard, or auth pages
    const isRestrictedPath = pathname.startsWith('/admin') || 
                             pathname.startsWith('/dashboard') || 
                             pathname.startsWith('/auth');

    if (!isOpen || !videoUrl || isRestrictedPath) return null;

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-3xl p-4 md:p-10"
            >
                <div className="relative w-full max-w-6xl aspect-video rounded-[32px] md:rounded-[64px] overflow-hidden border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)] group">
                    {/* Video Element */}
                    <video 
                        src={videoUrl}
                        autoPlay
                        muted={false}
                        loop
                        playsInline
                        className="w-full h-full object-cover"
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                    />

                    {/* Overlay Controls */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    
                    {/* Premium Header */}
                    <div className="absolute top-8 left-8 md:top-12 md:left-12 flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-black font-black text-xl shadow-2xl">V</div>
                        <div>
                            <p className="text-white font-black uppercase tracking-tighter text-xl italic">VerteX <span className="text-primary italic">Inside</span></p>
                            <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">Exclusive Preview</p>
                        </div>
                    </div>

                    {/* Play/Pause Center Trigger */}
                    <div 
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="absolute inset-0 flex items-center justify-center cursor-pointer"
                    >
                        {!isPlaying && (
                            <motion.div 
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="w-24 h-24 bg-primary rounded-full flex items-center justify-center text-black shadow-[0_0_50px_rgba(163,255,51,0.5)]"
                            >
                                <Play className="w-10 h-10 fill-current" />
                            </motion.div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="absolute bottom-8 left-8 right-8 md:bottom-12 md:left-12 md:right-12 flex items-center justify-between">
                         <div className="flex items-center gap-4">
                             <button 
                                onClick={() => setIsPlaying(!isPlaying)}
                                className="w-14 h-14 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center text-white hover:bg-white/20 transition-all"
                             >
                                 {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                             </button>
                             <div className="hidden md:block">
                                 <p className="text-white font-bold text-sm">System Showcase</p>
                                 <p className="text-white/40 text-[10px] font-black uppercase tracking-widest italic">Audio Enabled • 4K Stream</p>
                             </div>
                         </div>

                         <button 
                            onClick={handleClose}
                            className="h-14 px-10 bg-primary hover:bg-white text-black font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-2xl transition-all flex items-center gap-3 group"
                         >
                             Skip Preview
                             <FastForward className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                         </button>
                    </div>

                    {/* Visual Progress Bar */}
                    <div className="absolute bottom-0 left-0 w-full h-1.5 bg-white/10">
                        <motion.div 
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                            className="h-full bg-primary shadow-[0_0_15px_rgba(163,255,51,0.8)]"
                        />
                    </div>
                </div>

                {/* Close Overlay */}
                <button 
                    onClick={handleClose}
                    className="absolute top-10 right-10 w-16 h-16 bg-white/5 hover:bg-red-500 hover:text-white border border-white/10 rounded-full flex items-center justify-center text-white/50 transition-all z-[210] backdrop-blur-md"
                >
                    <X className="w-8 h-8" />
                </button>
            </motion.div>
        </AnimatePresence>
    );
}
