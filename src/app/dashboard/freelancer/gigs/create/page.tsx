"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { FREELANCER_NAV } from "@/constants/navigation";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Upload, 
  CheckCircle, 
  Info, 
  DollarSign, 
  Clock, 
  Plus,
  Trash2,
  Zap
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function CreateGigPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    title: "",
    category: "Programming & Tech",
    subCategory: "Web Development",
    tags: ["Next.js", "React", "Tailwind"],
    pricing: {
      basic: { name: "Basic Plan", desc: "Basic features", delivery: "3 Days", price: "50" },
      standard: { name: "Standard Plan", desc: "Standard features", delivery: "7 Days", price: "150" },
      premium: { name: "Premium Plan", desc: "Premium features", delivery: "14 Days", price: "300" },
    },
    images: ["https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=2072"],
  });

  const steps = [
    { id: 1, title: "Overview", desc: "Title & Category" },
    { id: 2, title: "Pricing", desc: "Packages & Scope" },
    { id: 3, title: "Media", desc: "Images & Videos" },
    { id: 4, title: "Review", desc: "Final Polish" }
  ];

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
    else handleSubmit();
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!auth.currentUser) {
        router.push("/auth/login");
        return;
    }
    setIsLoading(true);
    try {
      await addDoc(collection(db, "gigs"), {
        ...formData,
        freelancerId: auth.currentUser.uid,
        status: "active",
        createdAt: serverTimestamp(),
      });
      router.push("/dashboard/freelancer/gigs");
    } catch (error) {
      console.error("Error creating gig:", error);
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout navItems={FREELANCER_NAV} userRole="Freelancer">
      <div className="max-w-4xl mx-auto">
        <Link href="/dashboard/freelancer/gigs" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to My Gigs
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Create a New Gig</h1>
            <p className="text-muted-foreground">Transform your skills into a fixed-price service.</p>
          </div>
          
          <div className="flex items-center gap-4">
            {steps.map((s, i) => (
                <div key={s.id} className="flex items-center">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all ${
                        step >= s.id ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-card border border-border text-muted-foreground"
                    }`}>
                        {step > s.id ? <CheckCircle className="w-5 h-5" /> : s.id}
                    </div>
                    {i < steps.length - 1 && <div className={`w-8 h-0.5 mx-2 ${step > s.id ? "bg-primary" : "bg-muted"}`}></div>}
                </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-[32px] overflow-hidden shadow-2xl relative">
            <div className="p-10">
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div className="grid grid-cols-1 gap-8">
                                <div>
                                    <label className="block text-sm font-bold text-muted-foreground mb-3 uppercase tracking-wider">Gig Title</label>
                                    <div className="relative">
                                        <textarea 
                                            rows={3}
                                            value={formData.title}
                                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                                            className="w-full bg-background border border-border rounded-2xl p-6 text-xl font-bold text-foreground focus:outline-none focus:border-emerald-500 transition-all resize-none placeholder:text-muted-foreground" 
                                            placeholder="I will build a professional Next.js application for your business..."
                                        />
                                        <div className="absolute bottom-4 right-6 text-xs text-muted-foreground font-bold uppercase">{formData.title.length}/80 Characters</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-muted-foreground mb-3 uppercase tracking-wider">Category</label>
                                        <select 
                                            value={formData.category}
                                            onChange={(e) => setFormData({...formData, category: e.target.value})}
                                            className="w-full h-14 bg-background border border-border rounded-2xl px-6 text-foreground focus:outline-none focus:border-emerald-500 transition-all appearance-none cursor-pointer"
                                        >
                                            <option>Programming & Tech</option>
                                            <option>Graphics & Design</option>
                                            <option>Digital Marketing</option>
                                            <option>Writing & Translation</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-muted-foreground mb-3 uppercase tracking-wider">Sub-Category</label>
                                        <select 
                                            value={formData.subCategory}
                                            onChange={(e) => setFormData({...formData, subCategory: e.target.value})}
                                            className="w-full h-14 bg-background border border-border rounded-2xl px-6 text-foreground focus:outline-none focus:border-emerald-500 transition-all appearance-none cursor-pointer"
                                        >
                                            <option>Web Development</option>
                                            <option>Mobile Apps</option>
                                            <option>Cybersecurity</option>
                                            <option>Blockchain</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-muted-foreground mb-3 uppercase tracking-wider">Search Tags</label>
                                    <div className="w-full min-h-14 bg-background border border-border rounded-2xl px-6 py-3 flex flex-wrap gap-2 items-center">
                                        {formData.tags.map(tag => (
                                            <span key={tag} className="px-3 py-1 bg-primary/10 border border-primary/20 text-primary text-xs font-bold rounded-lg flex items-center gap-2">
                                                {tag}
                                                <Plus className="w-3 h-3 rotate-45 cursor-pointer" onClick={() => setFormData({...formData, tags: formData.tags.filter(t => t !== tag)})} />
                                            </span>
                                        ))}
                                        <input 
                                            className="bg-transparent border-none outline-none text-muted-foreground ml-2" 
                                            placeholder="Add custom tags..." 
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    const val = (e.target as HTMLInputElement).value;
                                                    if (val) {
                                                        setFormData({...formData, tags: [...formData.tags, val]});
                                                        (e.target as HTMLInputElement).value = '';
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {["basic", "standard", "premium"].map((tier, i) => (
                                    <div key={tier} className={`p-6 rounded-[32px] border-2 transition-all ${
                                        tier === "standard" ? "bg-primary/5 border-primary/30" : "bg-background/50 border-border"
                                    }`}>
                                        <div className="flex items-center justify-between mb-6">
                                            <h4 className="text-lg font-bold text-foreground uppercase tracking-wider">{tier}</h4>
                                            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                                                {i === 0 && <Clock className="w-4 h-4" />}
                                                {i === 1 && <DollarSign className="w-4 h-4" />}
                                                {i === 2 && <Zap className="w-4 h-4" />}
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <input 
                                                className="w-full bg-card border border-border rounded-xl p-4 text-foreground text-sm focus:outline-none focus:border-emerald-500" 
                                                placeholder="Package name"
                                                value={(formData.pricing as any)[tier].name}
                                                onChange={(e) => {
                                                    const newPricing = {...formData.pricing};
                                                    (newPricing as any)[tier].name = e.target.value;
                                                    setFormData({...formData, pricing: newPricing});
                                                }}
                                            />
                                            <textarea 
                                                className="w-full bg-card border border-border rounded-xl p-4 text-foreground text-xs h-24 focus:outline-none focus:border-emerald-500 resize-none" 
                                                placeholder="Description..."
                                                value={(formData.pricing as any)[tier].desc}
                                                onChange={(e) => {
                                                    const newPricing = {...formData.pricing};
                                                    (newPricing as any)[tier].desc = e.target.value;
                                                    setFormData({...formData, pricing: newPricing});
                                                }}
                                            />
                                            <div className="grid grid-cols-2 gap-3">
                                                <select 
                                                    className="bg-card border border-border rounded-xl p-3 text-foreground text-xs focus:outline-none"
                                                    value={(formData.pricing as any)[tier].delivery}
                                                    onChange={(e) => {
                                                        const newPricing = {...formData.pricing};
                                                        (newPricing as any)[tier].delivery = e.target.value;
                                                        setFormData({...formData, pricing: newPricing});
                                                    }}
                                                >
                                                    <option>3 Days</option>
                                                    <option>7 Days</option>
                                                    <option>14 Days</option>
                                                </select>
                                                <input 
                                                    className="bg-card border border-border rounded-xl p-3 text-foreground text-xs focus:outline-none" 
                                                    placeholder="Price ($)" 
                                                    value={(formData.pricing as any)[tier].price}
                                                    onChange={(e) => {
                                                        const newPricing = {...formData.pricing};
                                                        (newPricing as any)[tier].price = e.target.value;
                                                        setFormData({...formData, pricing: newPricing});
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-10"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="border-2 border-dashed border-border rounded-[32px] p-12 flex flex-col items-center justify-center text-center group hover:border-primary/50 transition-all cursor-pointer bg-background/30">
                                    <div className="w-20 h-20 rounded-full bg-card flex items-center justify-center text-muted-foreground mb-6 group-hover:scale-110 transition-transform">
                                        <Upload className="w-8 h-8" />
                                    </div>
                                    <h4 className="text-xl font-bold text-foreground mb-2">Upload Gig Gallery</h4>
                                    <p className="text-muted-foreground text-sm">Add showcase images. (Mockup auto-file added)</p>
                                </div>

                                <div className="space-y-4">
                                    {formData.images.map(img => (
                                        <div key={img} className="bg-background border border-border p-4 rounded-2xl flex items-center gap-4">
                                            <div className="w-20 h-14 bg-muted rounded-lg flex items-center justify-center font-bold text-primary overflow-hidden">
                                                <img src={img} alt="Gig" className="object-cover w-full h-full" />
                                            </div>
                                            <div className="flex-1 overflow-hidden">
                                                <p className="text-foreground text-sm font-bold truncate">{img.split('/').pop()}</p>
                                                <p className="text-muted-foreground text-xs text-primary">Uploaded</p>
                                            </div>
                                            <Trash2 className="w-5 h-5 text-muted-foreground hover:text-red-400 cursor-pointer" onClick={() => setFormData({...formData, images: formData.images.filter(i => i !== img)})} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                    
                    {step === 4 && (
                         <motion.div
                            key="step4"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="text-center py-20"
                         >
                            <div className="w-24 h-24 bg-primary/20 border border-primary/30 rounded-full flex items-center justify-center mx-auto mb-8 text-primary">
                                <CheckCircle className="w-12 h-12" />
                            </div>
                            <h2 className="text-4xl font-bold text-foreground mb-4">Almost There!</h2>
                            <p className="text-muted-foreground text-lg max-w-md mx-auto mb-10">Review your gig details. Once you publish, it will be visible to buyers worldwide.</p>
                            <div className="flex items-center justify-center gap-4">
                                <Button 
                                    onClick={handleSubmit}
                                    disabled={isLoading}
                                    className="h-14 px-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl text-lg font-bold"
                                >
                                    {isLoading ? "Publishing..." : "Publish Gig"}
                                </Button>
                            </div>
                         </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="p-8 bg-background border-t border-border flex items-center justify-between">
                <Button 
                    variant="ghost" 
                    onClick={handleBack}
                    disabled={step === 1}
                    className="text-muted-foreground font-bold hover:text-foreground disabled:opacity-0"
                >
                    <ArrowLeft className="mr-2 w-4 h-4" /> 
                    Back
                </Button>

                <div className="flex gap-4">
                    <Button 
                        onClick={handleNext}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 rounded-xl shadow-lg shadow-primary/20"
                    >
                        {step === 4 ? "Finalize" : "Save & Continue"}
                    </Button>
                </div>
            </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
