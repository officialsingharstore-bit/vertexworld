"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { BUYER_NAV } from "@/constants/navigation";
import { 
  User, 
  Mail, 
  MapPin, 
  Briefcase, 
  ShieldCheck, 
  Save, 
  Camera,
  Building2,
  DollarSign,
  Globe,
  Wallet
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

export default function BuyerProfilePage() {
  const { user, userData } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    company: "",
    bio: "",
    location: "Global",
    website: ""
  });

  useEffect(() => {
    if (userData) {
      setFormData({
        fullName: userData.fullName || "",
        company: userData.company || "Direct Strategic Partner",
        bio: userData.bio || "Active buyer in the elite VerteX talent network.",
        location: userData.location || "Global Presence",
        website: userData.website || "https://vertex.market"
      });
    }
  }, [userData]);

  const handleUpdate = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        ...formData,
        updatedAt: new Date()
      });
      alert("Executive account updated successfully. 业务极");
    } catch (err) {
      console.error(err);
      alert("Update failed. Link unstable.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout navItems={BUYER_NAV} userRole="Buyer">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-12">
            <div>
                <h1 className="text-4xl font-black text-foreground italic tracking-tighter uppercase mb-2">Executive Account</h1>
                <p className="text-muted-foreground font-medium tracking-wide">Configure your identity within the strategic sourcing node.</p>
            </div>
            <Button 
                onClick={handleUpdate}
                disabled={isSaving}
                className="h-14 px-10 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest rounded-2xl gap-3 shadow-[0_0_30px_rgba(16,185,129,0.2)]"
            >
                <Save className="w-5 h-5" />
                {isSaving ? "Syncing..." : "Apply Updates"}
            </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left Col: Executive Node */}
            <div className="space-y-8">
                <div className="bg-card border border-border rounded-[48px] p-10 text-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10">
                        <div className="w-32 h-32 bg-background border-4 border-white/10 rounded-[40px] flex items-center justify-center mx-auto mb-6 group-hover:border-primary transition-all duration-500 text-muted-foreground group-hover:text-primary">
                             <div className="w-24 h-24 bg-card rounded-[32px] flex items-center justify-center text-3xl font-black italic">
                                {formData.fullName?.[0] || "B"}
                             </div>
                             <button className="absolute bottom-0 right-0 p-3 bg-white text-slate-950 rounded-2xl shadow-xl hover:bg-primary hover:text-foreground transition-all">
                                <Camera className="w-5 h-5" />
                             </button>
                        </div>
                        <h3 className="text-2xl font-black text-foreground italic truncate mb-1">{formData.fullName}</h3>
                        <p className="text-primary font-black text-[10px] uppercase tracking-widest mb-8">Strategic Partner</p>
                        
                        <div className="space-y-3">
                            <div className="bg-background/50 p-5 rounded-[24px] border border-border flex items-center justify-between">
                                <p className="text-muted-foreground text-[9px] font-black uppercase tracking-widest">Hiring Power</p>
                                <p className="text-foreground font-black text-sm italic">Verified</p>
                            </div>
                            <div className="bg-background/50 p-5 rounded-[24px] border border-border flex items-center justify-between">
                                <p className="text-muted-foreground text-[9px] font-black uppercase tracking-widest">Active Spend</p>
                                <p className="text-primary font-black text-sm italic">$12,450.00</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-card border border-border rounded-[40px] p-8 text-center">
                    <div className="w-16 h-16 bg-background rounded-3xl flex items-center justify-center text-muted-foreground mx-auto mb-4 border border-border">
                        <Wallet className="w-8 h-8" />
                    </div>
                    <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] mb-1">Vault Status</p>
                    <p className="text-foreground font-black text-lg italic uppercase">Secured Escrow</p>
                </div>
            </div>

            {/* Right Col: Parameters */}
            <div className="lg:col-span-2 space-y-8">
                <div className="bg-card border border-border rounded-[48px] p-12 shadow-3xl">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                        <div className="space-y-3">
                            <label className="text-muted-foreground text-[10px] font-black uppercase tracking-widest ml-1">Identity Name</label>
                            <div className="relative">
                                <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input 
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                                    className="w-full h-16 bg-background border border-border rounded-3xl pl-14 pr-6 text-foreground font-bold outline-none focus:border-primary/50 transition-all"
                                    placeholder="Enter full name..."
                                />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="text-muted-foreground text-[10px] font-black uppercase tracking-widest ml-1">Company / Entity</label>
                            <div className="relative">
                                <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input 
                                    value={formData.company}
                                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                                    className="w-full h-16 bg-background border border-border rounded-3xl pl-14 pr-6 text-foreground font-bold outline-none focus:border-primary/50 transition-all"
                                    placeholder="Entity name..."
                                />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="text-muted-foreground text-[10px] font-black uppercase tracking-widest ml-1">Location Base</label>
                            <div className="relative">
                                <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input 
                                    value={formData.location}
                                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                                    className="w-full h-16 bg-background border border-border rounded-3xl pl-14 pr-6 text-foreground font-bold outline-none focus:border-primary/50 transition-all"
                                    placeholder="City, Country"
                                />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="text-muted-foreground text-[10px] font-black uppercase tracking-widest ml-1">Corporate Link</label>
                            <div className="relative">
                                <Globe className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input 
                                    value={formData.website}
                                    onChange={(e) => setFormData({...formData, website: e.target.value})}
                                    className="w-full h-16 bg-background border border-border rounded-3xl pl-14 pr-6 text-foreground font-bold outline-none focus:border-primary/50 transition-all"
                                    placeholder="https://company.com"
                                />
                            </div>
                        </div>
                     </div>

                     <div className="space-y-3">
                        <label className="text-muted-foreground text-[10px] font-black uppercase tracking-widest ml-1">Executive Summary (Bio)</label>
                        <textarea 
                            rows={6}
                            value={formData.bio}
                            onChange={(e) => setFormData({...formData, bio: e.target.value})}
                            className="w-full bg-background border border-border rounded-[32px] p-8 text-foreground font-medium outline-none focus:border-primary/50 transition-all resize-none leading-relaxed"
                            placeholder="Describe your organization's goals and project requirements..."
                        />
                     </div>
                </div>
            </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
