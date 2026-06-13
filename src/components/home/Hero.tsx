"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Star, CheckCircle, Zap } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function Hero() {
  const { user, userData } = useAuth();
  
  // Dynamic link based on auth state
  const getStartedLink = !user 
    ? "/auth/signup" 
    : (userData?.role === "Freelancer" ? "/dashboard/freelancer" : "/dashboard/buyer");

  const scrollToHowItWorks = () => {
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative pt-40 pb-20 lg:pt-56 lg:pb-32 overflow-hidden bg-background">
      {/* Background Glows */}
      <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[800px] h-[800px] bg-primary/20 blur-[160px] rounded-full" />
      <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[600px] h-[600px] bg-primary/10 blur-[140px] rounded-full" />

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="z-10"
        >
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-black uppercase tracking-[0.2em] mb-10 shadow-xl shadow-primary/20 italic">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-foreground/75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-foreground"></span>
            </span>
            Neural Freelance Network
          </div>
          <h1 className="text-6xl lg:text-8xl font-black tracking-tighter text-foreground leading-[0.9] mb-10 uppercase italic">
            Design <span className="text-primary drop-shadow-[0_0_30px_rgba(163,255,51,0.5)]">Infinite</span> Output
          </h1>
          <p className="text-2xl text-muted-foreground mb-12 max-w-lg leading-tight font-bold italic uppercase tracking-tighter">
            The world's most advanced workforce protocol. Secure, scalable, and decentralized. Managed by VerteX.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Button asChild size="lg" className="w-full sm:w-auto h-20 px-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-[2.5rem] text-xl font-black uppercase tracking-[0.2em] italic group shadow-2xl shadow-primary/30 transition-all duration-500">
              <Link href={getStartedLink}>
                {user ? "Initialize Node" : "Deploy Network"}
                <ArrowRight className="ml-3 w-7 h-7 group-hover:translate-x-2 transition-transform" />
              </Link>
            </Button>
            <Button 
                variant="outline" 
                size="lg" 
                onClick={scrollToHowItWorks}
                className="w-full sm:w-auto h-20 px-12 border-border bg-card/50 text-foreground rounded-[2.5rem] text-xl font-black uppercase tracking-[0.2em] italic hover:bg-muted transition-all duration-500 backdrop-blur-xl"
            >
              <Play className="mr-3 w-6 h-6 fill-primary text-primary" />
              Manual
            </Button>
          </div>

          <div className="mt-16 flex flex-wrap items-center gap-12 text-muted-foreground">
            {["Identity", "Escrow", "Support"].map((label) => (
                <div key={label} className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-primary" />
                    <span className="text-xs font-black uppercase tracking-[0.3em] italic">{label} Secured</span>
                </div>
            ))}
          </div>
        </motion.div>

        {/* Feature Visual */}
        <motion.div
           initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
           animate={{ opacity: 1, scale: 1, rotate: 0 }}
           transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
           className="relative hidden lg:block"
        >
          <div className="relative aspect-square rounded-[80px] overflow-hidden border border-border/50 shadow-[0_0_100px_rgba(0,0,0,0.5)] bg-card/30 backdrop-blur-3xl p-16">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5" />
                
                {/* Status Ring */}
                <div className="absolute inset-0 border-[40px] border-primary/5 rounded-[80px] pointer-events-none" />

                <div className="relative w-full h-full">
                   {/* Main Unit Card */}
                   <motion.div 
                     animate={{ y: [0, -15, 0] }} 
                     transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                     className="absolute top-0 right-0 p-10 bg-card border border-border rounded-[48px] shadow-[0_40px_80px_rgba(0,0,0,0.4)] backdrop-blur-3xl z-20 w-80"
                   >
                     <div className="flex items-center gap-4 mb-8">
                         <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center text-primary">
                             <Star className="w-8 h-8 fill-primary" />
                         </div>
                         <div>
                             <p className="text-[10px] font-black text-primary uppercase tracking-widest">Active Talent</p>
                             <p className="text-xl font-black text-foreground italic">Elite Verified</p>
                         </div>
                     </div>
                     <div className="space-y-4">
                         <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                             <div className="h-full w-[85%] bg-primary shadow-[0_0_15px_rgba(163,255,51,0.8)]"></div>
                         </div>
                         <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                             <span>Trust Level</span>
                             <span>85% Match</span>
                         </div>
                     </div>
                   </motion.div>

                   {/* Secondary Info Card */}
                   <motion.div 
                     animate={{ y: [0, 15, 0] }} 
                     transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                     className="absolute bottom-0 left-0 p-10 bg-primary/95 text-primary-foreground rounded-[56px] shadow-[0_40px_100px_rgba(163,255,51,0.2)] z-30 w-[340px]"
                   >
                        <div className="flex items-center justify-between mb-8">
                            <div className="w-16 h-16 bg-background rounded-3xl flex items-center justify-center text-primary text-3xl font-black italic">V</div>
                            <div className="text-right">
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">System Balance</p>
                                <p className="text-3xl font-black italic leading-none">$1.2M</p>
                            </div>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-4">Operations Status</p>
                        <div className="flex gap-2">
                            {[1,2,3,4,5,6].map(i => (
                                <div key={i} className="flex-1 h-1.5 bg-background/20 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ x: "-100%" }}
                                        animate={{ x: "0%" }}
                                        transition={{ duration: 1.5, delay: i * 0.1 }}
                                        className="h-full w-full bg-background"
                                    />
                                </div>
                            ))}
                        </div>
                   </motion.div>

                   {/* Floating Accessory */}
                   <motion.div 
                     animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }} 
                     transition={{ duration: 8, repeat: Infinity }}
                     className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 w-48 h-48 bg-primary/10 border border-primary/20 backdrop-blur-2xl rounded-full flex items-center justify-center -z-10"
                   >
                       <Zap className="w-20 h-20 text-primary opacity-50" />
                   </motion.div>
                </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
