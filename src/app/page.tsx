"use client";

import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/home/Hero";
import useSmoothScroll from "@/hooks/useSmoothScroll";
import { motion } from "framer-motion";
import VideoPopup from "@/components/popups/VideoPopup";
import { 
  BarChart3, 
  Search, 
  ShieldCheck, 
  Zap, 
  Users, 
  Briefcase,
  Star,
  ArrowRight,
  MessageSquare,
  CreditCard,
  CheckCircle2,
  TrendingUp,
  Cpu,
  Layers,
  Activity
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  useSmoothScroll();
  const { user, userData } = useAuth();

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      <VideoPopup />
      <Navbar />
      <Hero />

      {/* Stats Section */}
      <section className="py-24 border-y border-border bg-card/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {[
              { label: "Active Freelancers", value: "250K+", trend: "+12%" },
              { label: "Total Transactions", value: "1.2M+", trend: "+8%" },
              { label: "Market Volume", value: "$4.5B", trend: "+5%" },
              { label: "Client Satisfaction", value: "99.9%", trend: "+2%" },
            ].map((stat, i) => (
              <div key={i} className="text-center group">
                <p className="text-4xl md:text-5xl font-black text-foreground mb-3 italic tracking-tight group-hover:text-primary transition-colors">{stat.value}</p>
                <div className="flex items-center justify-center gap-2">
                    <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em]">{stat.label}</p>
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{stat.trend}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-32 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/5 blur-[120px] rounded-full -z-10" />
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-24">
            <h2 className="text-5xl md:text-6xl font-black text-foreground mb-6 uppercase italic tracking-tighter">
                The <span className="text-primary">VerteX</span> Protocol
            </h2>
            <p className="text-muted-foreground text-lg font-bold uppercase tracking-widest opacity-60">Revolutionizing the way work gets done.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
             {/* Buyer Process */}
             <div className="bg-card/50 border border-border p-12 rounded-[56px] relative group hover:border-primary/30 transition-all">
                <div className="absolute -top-6 -left-6 w-20 h-20 bg-primary rounded-3xl flex items-center justify-center text-foreground text-3xl font-black shadow-2xl shadow-emerald-500/30 group-hover:scale-110 transition-transform italic">B</div>
                <h3 className="text-3xl font-black text-foreground mb-10 uppercase italic">For Businesses</h3>
                <div className="space-y-10">
                    {[
                        { title: "Browse & Select", desc: "Explore our elite marketplace and choose a specialized gig that fits your vision.", icon: <Search /> },
                        { title: "Escrow Deposit", desc: "Pay securely to VerteX Escrow. Funds are only released when you approve the work.", icon: <ShieldCheck /> },
                        { title: "Review & Launch", desc: "Communicate in real-time, review deliverables, and launch your project with confidence.", icon: <Zap /> }
                    ].map((step, i) => (
                        <div key={i} className="flex gap-6">
                            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0 border border-primary/20">
                                {step.icon}
                            </div>
                            <div>
                                <h4 className="text-foreground font-bold mb-2 uppercase tracking-tight italic">{i+1}. {step.title}</h4>
                                <p className="text-muted-foreground text-sm leading-relaxed font-medium">{step.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
             </div>

             {/* Freelancer Process */}
             <div className="bg-card/50 border border-border p-12 rounded-[56px] relative group hover:border-blue-500/30 transition-all">
                <div className="absolute -top-6 -right-6 w-20 h-20 bg-blue-500 rounded-3xl flex items-center justify-center text-foreground text-3xl font-black shadow-2xl shadow-blue-500/30 group-hover:scale-110 transition-transform italic">F</div>
                <h3 className="text-3xl font-black text-foreground mb-10 uppercase italic">For Freelancers</h3>
                <div className="space-y-10">
                    {[
                        { title: "Setup Profile", desc: "Create a world-class profile and list your premium services on the marketplace.", icon: <Layers /> },
                        { title: "Deliver Quality", desc: "Track active orders, collaborate with clients, and upload your high-end solutions.", icon: <Cpu /> },
                        { title: "Instant Payout", desc: "Withdraw earnings as soon as the client approves. 95% goes directly to you.", icon: <TrendingUp /> }
                    ].map((step, i) => (
                        <div key={i} className="flex gap-6">
                            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 shrink-0 border border-blue-500/20">
                                {step.icon}
                            </div>
                            <div>
                                <h4 className="text-foreground font-bold mb-2 uppercase tracking-tight italic">{i+1}. {step.title}</h4>
                                <p className="text-muted-foreground text-sm leading-relaxed font-medium">{step.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Services/Categories */}
      <section className="py-32 relative bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20 reveal">
            <div className="max-w-2xl">
              <h2 className="text-5xl font-black text-foreground mb-4 uppercase italic leading-tight">Extreme <span className="text-primary">Talent</span> Catalog</h2>
              <p className="text-muted-foreground text-lg font-medium">Browse specialized services delivered by verified industry experts.</p>
            </div>
            <Link href="/marketplace" className="px-8 py-3 bg-white/5 border border-white/10 text-foreground rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-primary hover:text-foreground transition-all">
              Launch Marketplace
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Engineering", icon: <Cpu />, count: "12,450 Gigs", color: "from-yellow-400/20" },
              { title: "Branding", icon: <Layers />, count: "8,210 Gigs", color: "from-pink-400/20" },
              { title: "Marketing", icon: <TrendingUp />, count: "6,500 Gigs", color: "from-blue-400/20" },
              { title: "Data Core", icon: <Activity />, count: "4,320 Gigs", color: "from-emerald-400/20" },
            ].map((cat, i) => (
              <Link href="/marketplace" key={i} className="p-10 bg-card border border-border rounded-[48px] hover:border-primary transition-all group overflow-hidden relative">
                <div className={`w-16 h-16 bg-gradient-to-br ${cat.color} to-transparent rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-all border border-border shadow-2xl`}>
                  {cat.icon}
                </div>
                <h3 className="text-2xl font-black text-foreground mb-2 uppercase italic tracking-tighter">{cat.title}</h3>
                <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest">{cat.count}</p>
                <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-20 transition-opacity">
                    <ArrowRight className="w-12 h-12 -rotate-45" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-40 relative">
        <div className="max-w-5xl mx-auto px-6">
          <div className="relative rounded-[64px] bg-gradient-to-br from-primary via-primary/90 to-primary/70 p-16 md:p-24 overflow-hidden text-center shadow-[0_0_80px_rgba(163,255,51,0.4)]">
            <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
            <div className="relative z-10 text-black">
              <h2 className="text-5xl md:text-7xl font-black mb-10 tracking-tighter uppercase italic leading-none">Limitless Scaling Starts <span className="text-primary bg-black px-4 py-2 rounded-3xl">Now</span></h2>
              <p className="text-black/80 text-xl mb-16 max-w-2xl mx-auto font-bold opacity-80 uppercase tracking-tight">
                Join the platform where world-class talent meets groundbreaking vision.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
                <Button asChild size="lg" className="bg-black text-primary hover:bg-black/90 rounded-[2rem] h-20 px-12 text-xl font-black uppercase tracking-[0.2em] shadow-2xl transition-all scale-100 hover:scale-105 border-none">
                    <Link href="/marketplace">Post a Project</Link>
                </Button>
                <Button variant="link" asChild className="text-black text-xl font-black uppercase tracking-[0.2em] hover:no-underline group">
                    <Link href={user ? (userData?.role === "Freelancer" ? "/dashboard/freelancer" : "/dashboard/buyer") : "/auth/signup"}>
                        {userData?.role === "Freelancer" ? "Go to Dashboard" : "Become a Freelancer"} 
                        <ArrowRight className="ml-3 inline w-6 h-6 group-hover:translate-x-2 transition-transform" />
                    </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Digital Hub Promo */}
      <section className="py-32 relative overflow-hidden bg-card/5 border-y border-border">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
                <h2 className="text-5xl md:text-6xl font-black text-foreground mb-8 uppercase italic tracking-tighter">
                    Premium <span className="text-primary italic">Digital Assets</span>
                </h2>
                <p className="text-muted-foreground text-lg font-medium leading-relaxed mb-10 max-w-xl">
                    Accelerate your workflow with our curated collection of verified courses, premium themes, and industrial-grade software.
                </p>
                <div className="grid grid-cols-2 gap-6 mb-12">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary border border-primary/20"><CheckCircle2 className="w-5 h-5" /></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-foreground">Verified Courses</span>
                     </div>
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary border border-primary/20"><CheckCircle2 className="w-5 h-5" /></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-foreground">Premium Themes</span>
                     </div>
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary border border-primary/20"><CheckCircle2 className="w-5 h-5" /></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-foreground">Expert Plugins</span>
                     </div>
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary border border-primary/20"><CheckCircle2 className="w-5 h-5" /></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-foreground">Custom Software</span>
                     </div>
                </div>
                <Button asChild className="h-16 px-10 bg-foreground text-background hover:bg-primary hover:text-primary-foreground font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl">
                    <Link href="/store">Enter Digital Hub</Link>
                </Button>
            </div>
            <div className="relative">
                <div className="aspect-[4/3] bg-gradient-to-br from-primary/20 to-transparent rounded-[56px] border border-white/10 overflow-hidden shadow-3xl">
                    <img 
                        src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2426" 
                        className="w-full h-full object-cover mix-blend-overlay opacity-60" 
                        alt="Digital Assets"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="p-10 bg-card/80 backdrop-blur-3xl border border-white/10 rounded-[40px] text-center space-y-4">
                             <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-black mx-auto shadow-2xl shadow-primary/40"><Zap className="w-8 h-8" /></div>
                             <h4 className="text-2xl font-black text-foreground uppercase italic tracking-tighter">VX Protocol Active</h4>
                             <p className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.3em]">Encrypted Payload Ready</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-32 border-t border-border bg-background relative">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-20">
            <div>
                <div className="flex items-center gap-3 mb-10">
                    <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center font-black text-foreground text-2xl shadow-xl shadow-primary/20 italic">V</div>
                    <span className="text-2xl font-black tracking-tight text-foreground uppercase italic">VerteX</span>
                </div>
                <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.3em] leading-loose">
                    The premium neural marketplace for the next generation of global builders.
                </p>
            </div>
            {/* Footer Groups */}
            {[
                { title: "Categories", links: [
                    { name: "Code & Tech", href: "/marketplace" },
                    { name: "Design Art", href: "/marketplace" },
                    { name: "Marketing Core", href: "/marketplace" },
                    { name: "AI Neural", href: "/marketplace" }
                ]},
                { title: "Network", links: [
                    { name: "Trust Protocol", href: "/" },
                    { name: "Safe Escrow", href: "/" },
                    { name: "Global Help", href: "/" },
                    { name: "Success Feed", href: "/success-stories" }
                ]},
                { title: "VerteX", links: [
                    { name: "Our Vision", href: "/" },
                    { name: "Core Team", href: "/" },
                    { name: "Legal Node", href: "/" },
                    { name: "Press Kit", href: "/" }
                ]}
            ].map(col => (
                <div key={col.title}>
                    <h5 className="text-foreground font-black mb-10 text-[10px] uppercase tracking-[0.4em] italic">{col.title}</h5>
                    <ul className="space-y-4 text-muted-foreground text-xs font-bold uppercase tracking-widest">
                        {col.links.map(l => (
                          <li key={l.name} className="relative z-10 py-1">
                            <Link href={l.href} className="hover:text-primary transition-all cursor-pointer duration-300">
                              {l.name}
                            </Link>
                          </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-32 pt-10 border-t border-border flex flex-col md:flex-row justify-between items-center gap-10">
            <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.4em]">© 2026 VerteX Marketplace. All rights reserved.</p>
            <div className="flex gap-12 text-muted-foreground text-[10px] font-black uppercase tracking-[0.4em]">
                <Link href="/" className="hover:text-foreground cursor-pointer transition-colors">Terms of Service</Link>
                <Link href="/" className="hover:text-foreground cursor-pointer transition-colors">Privacy Policy</Link>
            </div>
        </div>
      </footer>
    </main>
  );
}
