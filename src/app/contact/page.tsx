"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { Send, MessageSquare, Mail, Phone, MapPin, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

function ContactContent() {
    const searchParams = useSearchParams();
    const subjectParam = searchParams.get("subject");
    
    const [submitting, setSubmitting] = useState(false);
    const [sent, setSent] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: subjectParam || "",
        message: ""
    });

    useEffect(() => {
        if (subjectParam) {
            setFormData(prev => ({ ...prev, subject: subjectParam }));
        }
    }, [subjectParam]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        // Simulate sending
        await new Promise(r => setTimeout(r, 2000));
        setSubmitting(false);
        setSent(true);
    };

    return (
        <main className="min-h-screen bg-background text-foreground pt-40 pb-20 selection:bg-primary/30 relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[1000px] bg-primary/5 blur-[150px] rounded-full -z-10 pointer-events-none" />
            
            <Navbar />

            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                <div className="space-y-10">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                        <h1 className="text-6xl md:text-8xl font-black text-foreground uppercase italic tracking-tighter mb-6 leading-none">Direct <span className="text-primary italic">Support</span></h1>
                        <p className="text-muted-foreground text-lg font-bold uppercase tracking-[0.3em] opacity-60">Establish a secure link with the VertX Command Center.</p>
                    </motion.div>

                    <div className="space-y-8">
                        <div className="flex items-center gap-6 p-8 bg-card/30 backdrop-blur-3xl border border-white/5 rounded-[32px] hover:border-primary/30 transition-all group">
                            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20 group-hover:scale-110 transition-transform"><Mail /></div>
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground mb-1 italic">Email Protocol</h4>
                                <p className="text-xl font-black text-foreground italic uppercase">support@vertexworld.com</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6 p-8 bg-card/30 backdrop-blur-3xl border border-white/5 rounded-[32px] hover:border-primary/30 transition-all group">
                            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20 group-hover:scale-110 transition-transform"><MessageSquare /></div>
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground mb-1 italic">Live Comms</h4>
                                <p className="text-xl font-black text-foreground italic uppercase">Direct Node Chat</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative">
                    <AnimatePresence mode="wait">
                        {sent ? (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-card border border-primary/30 rounded-[56px] p-20 text-center space-y-8 shadow-[0_0_80px_rgba(163,255,51,0.1)]"
                            >
                                <div className="w-24 h-24 bg-primary text-black rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-primary/40 animate-bounce"><CheckCircle2 className="w-12 h-12" /></div>
                                <h2 className="text-4xl font-black uppercase italic tracking-tighter">Transmission Successful</h2>
                                <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">The command center has received your request and will respond shortly.</p>
                                <Button onClick={() => setSent(false)} variant="link" className="text-primary font-black uppercase tracking-[0.2em] italic">Send New Signal</Button>
                            </motion.div>
                        ) : (
                            <motion.form 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                onSubmit={handleSubmit} 
                                className="bg-card/40 backdrop-blur-3xl border border-white/10 rounded-[56px] p-12 space-y-8 shadow-3xl"
                            >
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-4">Identity</label>
                                        <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Full Name" className="w-full h-14 bg-background border border-border rounded-2xl px-6 text-xs font-black uppercase placeholder:opacity-30 focus:border-primary outline-none transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-4">Mail Node</label>
                                        <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="Email Address" className="w-full h-14 bg-background border border-border rounded-2xl px-6 text-xs font-black uppercase placeholder:opacity-30 focus:border-primary outline-none transition-all" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-4">Signal Subject</label>
                                    <input required value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} placeholder="What is the inquiry about?" className="w-full h-14 bg-background border border-border rounded-2xl px-6 text-xs font-black uppercase placeholder:opacity-30 focus:border-primary outline-none transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-4">Encoded Message</label>
                                    <textarea required rows={5} value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} placeholder="Details of your request..." className="w-full bg-background border border-border rounded-3xl p-6 text-xs font-black uppercase placeholder:opacity-30 focus:border-primary outline-none transition-all resize-none" />
                                </div>
                                <Button disabled={submitting} className="w-full h-20 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-[0.4em] rounded-3xl shadow-2xl shadow-primary/20 text-xl italic group">
                                    {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6 mr-3 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform" />}
                                    Transmit Signal
                                </Button>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </main>
    );
}

export default function ContactPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ContactContent />
        </Suspense>
    );
}
