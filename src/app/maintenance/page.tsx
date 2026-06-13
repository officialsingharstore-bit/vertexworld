"use client";

import { motion } from "framer-motion";
import { Hammer, Sparkles, Clock, Globe, ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 blur-[150px] rounded-full -z-10 animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/5 blur-[150px] rounded-full -z-10 animate-pulse delay-700" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full text-center relative z-10"
      >
        <div className="w-24 h-24 bg-primary rounded-[32px] flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-primary/20">
          <ShieldAlert className="w-12 h-12 text-primary-foreground animate-pulse" />
        </div>

        <h1 className="text-5xl md:text-7xl font-black text-foreground mb-6 italic uppercase tracking-tighter">
          System <span className="text-primary drop-shadow-[0_0_30px_rgba(163,255,51,0.5)]">Syncing</span>
        </h1>
        
        <p className="text-muted-foreground text-lg md:text-xl font-medium leading-relaxed mb-12">
          VerteX is currently undergoing a scheduled core evolution. We're refining our neural pathways to serve you better.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white/5 border border-white/10 p-6 rounded-[32px] backdrop-blur-xl">
             <Clock className="w-8 h-8 text-primary mx-auto mb-3" />
             <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-1">Expected Uptime</p>
             <p className="text-foreground font-bold">~ 2 Hours</p>
          </div>
          <div className="bg-white/5 border border-white/10 p-6 rounded-[32px] backdrop-blur-xl">
             <ShieldAlert className="w-8 h-8 text-blue-400 mx-auto mb-3" />
             <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-1">Impact Level</p>
             <p className="text-foreground font-bold">Global Core</p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-6">
            <div className="flex items-center gap-2 px-6 py-2 bg-primary/10 border border-primary/20 rounded-full">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <span className="text-[10px] font-black text-primary uppercase tracking-widest">Core Synchronizing</span>
            </div>
            
            <p className="text-muted-foreground text-sm font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                Follow Updates <Globe className="w-4 h-4" /> @VerteX_Dev
            </p>
        </div>
      </motion.div>

      {/* Corporate Badge */}
      <div className="absolute bottom-10 left-10 opacity-20">
          <p className="text-[10px] font-black text-foreground uppercase tracking-[0.5em]">VerteX Neural Marketplace v2.4.0</p>
      </div>
    </div>
  );
}
