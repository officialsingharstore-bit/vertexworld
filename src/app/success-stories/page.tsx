"use client";

import Navbar from "@/components/layout/Navbar";
import { 
  Quote, 
  ArrowRight, 
  Star,
  ExternalLink,
  Users,
  Trophy,
  Rocket
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export default function SuccessStoriesPage() {
  const stories = [
    {
      company: "Metaverse Corp",
      logo: "MC",
      title: "Building the Future of Digital Real Estate",
      description: "How a startup hired 15+ elite freelancers on VerteX to build their entire blockchain-based platform in under 6 months.",
      impact: "10x Growth in 180 Days",
      tags: ["Blockchain", "Web3", "Scale-up"]
    },
    {
      company: "Nexus AI",
      logo: "NA",
      title: "Optimizing LLM Workflows at Scale",
      description: "Nexus AI found specialized data scientists on VerteX who reduced their compute costs by 45% through custom architectural optimizations.",
      impact: "45% Cost Reduction",
      tags: ["AI/ML", "Optimization", "Enterprise"]
    },
    {
        company: "Design Studio X",
        logo: "DS",
        title: "From 0 to $1M in Revenue as a Global Agency",
        description: "A freelance design collective that used VerteX to land enterprise contracts and manage their global workflow seamlessly.",
        impact: "Reached $1M ARR",
        tags: ["Design", "Agency", "Workflow"]
    }
  ];

  return (
    <main className="min-h-screen bg-background text-foreground pt-32 pb-20 overflow-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative mb-32">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="max-w-7xl mx-auto px-6 text-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-8">
                    <Trophy className="w-4 h-4" />
                    Customer Success
                </div>
                <h1 className="text-5xl md:text-7xl font-extrabold text-foreground mb-8 tracking-tight">
                    Where Vision Meets <span className="text-primary">Excellence</span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                    Read how world-class teams and elite freelancers are redefining the future of work on VerteX.
                </p>
            </motion.div>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="max-w-7xl mx-auto px-6 mb-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-10 bg-card border border-border rounded-[40px] text-center group hover:border-primary/30 transition-all">
                <div className="w-16 h-16 bg-blue-500/10 text-blue-400 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                    <Users className="w-8 h-8" />
                </div>
                <h3 className="text-4xl font-bold text-foreground mb-2">5,000+</h3>
                <p className="text-muted-foreground font-medium">Businesses Thriving</p>
            </div>
            <div className="p-10 bg-card border border-border rounded-[40px] text-center group hover:border-primary/30 transition-all">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                    <Rocket className="w-8 h-8" />
                </div>
                <h3 className="text-4xl font-bold text-foreground mb-2">99.8%</h3>
                <p className="text-muted-foreground font-medium">Project Success Rate</p>
            </div>
            <div className="p-10 bg-card border border-border rounded-[40px] text-center group hover:border-primary/30 transition-all">
                <div className="w-16 h-16 bg-pink-500/10 text-pink-400 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                    <Trophy className="w-8 h-8" />
                </div>
                <h3 className="text-4xl font-bold text-foreground mb-2">$2B+</h3>
                <p className="text-muted-foreground font-medium">Earned by Talent</p>
            </div>
        </div>
      </section>

      {/* Success Stories Grid */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="space-y-12">
            {stories.map((story, i) => (
                <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="flex flex-col lg:flex-row gap-12 bg-card border border-border rounded-[40px] overflow-hidden group"
                >
                    <div className="lg:w-1/2 aspect-video bg-muted relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-800/50 to-slate-950 flex items-center justify-center">
                             <div className="text-9xl font-black text-foreground/5 uppercase select-none">{story.logo}</div>
                        </div>
                    </div>
                    <div className="lg:w-1/2 p-10 flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-10 h-10 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center font-bold text-primary">
                                {story.logo}
                            </span>
                            <span className="text-foreground font-bold">{story.company}</span>
                        </div>
                        <h3 className="text-3xl font-bold text-foreground mb-6 group-hover:text-primary transition-colors">
                            {story.title}
                        </h3>
                        <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                            {story.description}
                        </p>
                        <div className="flex flex-wrap gap-4 mb-10">
                            {story.tags.map(tag => (
                                <span key={tag} className="px-4 py-1.5 bg-background/50 border border-border rounded-full text-xs font-bold text-muted-foreground">
                                    {tag}
                                </span>
                            ))}
                        </div>
                        <div className="flex items-center justify-between mt-auto pt-6 border-t border-border/50">
                            <div>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Key Impact</p>
                                <p className="text-xl font-bold text-primary">{story.impact}</p>
                            </div>
                            <Button variant="ghost" className="text-foreground font-bold group-hover:text-primary gap-2">
                                Read Full Story
                                <ExternalLink className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
      </section>

      {/* Quote Banner */}
      <section className="mt-32 max-w-5xl mx-auto px-6">
        <div className="relative p-12 bg-primary rounded-[40px] text-center overflow-hidden">
            <Quote className="absolute top-10 left-10 w-24 h-24 text-foreground/10" />
            <div className="relative z-10">
                <p className="text-foreground text-3xl font-bold italic mb-10 leading-snug">
                    "VerteX hasn't just changed how we find talent; it's changed how we think about scale. We no longer have geographic boundaries."
                </p>
                <div>
                    <h5 className="text-foreground font-bold text-xl uppercase tracking-tighter italic">Sarah Jenkins</h5>
                    <p className="text-foreground/70 text-sm font-medium uppercase tracking-widest">CEO, FutureTech Global</p>
                </div>
            </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mt-32 text-center pb-20">
        <h2 className="text-4xl font-bold text-foreground mb-8">Start your own success story today.</h2>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="xl" className="h-16 px-10 bg-white text-primary hover:bg-slate-100 rounded-2xl font-bold">
                Hire Talent
            </Button>
            <Button variant="outline" size="xl" className="h-16 px-10 border-border text-foreground rounded-2xl font-bold">
                Join as Freelancer
            </Button>
        </div>
      </section>
    </main>
  );
}
