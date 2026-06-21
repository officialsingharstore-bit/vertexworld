"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, X, Volume2, VolumeX } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function VideoPopup() {
    const [config, setConfig] = useState<{ url: string; enabled: boolean } | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isMuted, setIsMuted] = useState(true);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const docSnap = await getDoc(doc(db, "platform_settings", "config"));
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    if (data.enablePopupVideo && data.popupVideoUrl) {
                        setConfig({ url: data.popupVideoUrl, enabled: true });
                        // Check if already seen in this session to avoid annoyance
                        const hasSeen = sessionStorage.getItem("vx_popup_seen");
                        if (!hasSeen) {
                            setIsVisible(true);
                            sessionStorage.setItem("vx_popup_seen", "true");
                        }
                    }
                }
            } catch (e) {
                console.error("Popup config error:", e);
            }
        };
        fetchConfig();
    }, []);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleSkip = () => {
        setIsVisible(false);
    };

    if (!config || !isVisible) return null;

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-3xl"
            >
                {/* Close/Skip Button */}
                <button 
                    onClick={handleSkip}
                    className="absolute top-8 right-8 z-[100] flex items-center gap-3 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl text-white transition-all group"
                >
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Skip Protocol</span>
                    <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                </button>

                {/* Video Area */}
                <div className="relative w-full h-full max-w-6xl aspect-video mx-4 overflow-hidden rounded-[40px] border border-white/10 shadow-3xl group/player bg-black">
                    <video 
                        ref={videoRef}
                        src={config.url}
                        autoPlay
                        loop
                        muted={isMuted}
                        className="w-full h-full object-cover"
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                    />

                    {/* Controls Overlay */}
                    <div className="absolute inset-x-0 bottom-0 p-8 pt-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover/player:opacity-100 transition-opacity">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <button 
                                    onClick={togglePlay}
                                    className="w-16 h-16 bg-primary text-black rounded-2xl flex items-center justify-center hover:scale-105 transition-all shadow-xl shadow-primary/20"
                                >
                                    {isPlaying ? <Pause className="fill-black" /> : <Play className="fill-black" />}
                                </button>
                                
                                <div className="space-y-1">
                                    <h4 className="text-white font-black uppercase italic tracking-widest text-sm">System Transmission</h4>
                                    <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.4em]">VerteX Neural Link Active</p>
                                </div>
                            </div>

                            <button 
                                onClick={() => setIsMuted(!isMuted)}
                                className="w-12 h-12 bg-white/10 border border-white/10 rounded-xl flex items-center justify-center text-white hover:bg-white/20 transition-all"
                            >
                                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Progress Bar (Visual Only) */}
                    <div className="absolute bottom-0 left-0 h-1 bg-primary/20 w-full overflow-hidden">
                        <motion.div 
                            initial={{ x: "-100%" }}
                            animate={{ x: "0%" }}
                            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                            className="h-full bg-primary shadow-[0_0_20px_rgba(163,255,51,1)]"
                        />
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-40 h-px bg-gradient-to-r from-primary/50 to-transparent" />
                <div className="absolute top-1/2 right-0 -translate-y-1/2 w-40 h-px bg-gradient-to-l from-primary/50 to-transparent" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-40 w-px bg-gradient-to-b from-primary/50 to-transparent" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-40 w-px bg-gradient-to-t from-primary/50 to-transparent" />
            </motion.div>
        </AnimatePresence>
    );
}
