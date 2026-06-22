"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { FREELANCER_NAV } from "@/constants/navigation";
import { 
  User, 
  Mail, 
  MapPin, 
  Briefcase, 
  ShieldCheck, 
  Save, 
  Camera,
  Star,
  Zap,
  Globe,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function FreelancerProfilePage() {
  const { user, userData } = useAuth();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    bio: "",
    hourlyRate: "",
    expertise: "",
    location: "Global Presence",
    skills: "",
    resumeLink: ""
  });

  useEffect(() => {
    if (userData) {
      setFormData({
        fullName: userData.fullName || "",
        bio: userData.bio || "Member of the elite VerteX talent network.",
        hourlyRate: userData.hourlyRate || "85",
        expertise: userData.expertise || "Full Stack Architect",
        location: userData.location || "Global Presence",
        skills: userData.skills || "React, TypeScript, Node.js",
        resumeLink: userData.resumeLink || ""
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
      alert("Neural profile updated successfully. 业务极");
    } catch (err) {
      console.error(err);
      alert("Update failed. Link unstable.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout navItems={FREELANCER_NAV} userRole="Freelancer">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-12">
            <div>
                <h1 className="text-4xl font-black text-foreground italic tracking-tighter uppercase mb-2">Neural Profile</h1>
                <p className="text-muted-foreground font-medium tracking-wide">Optimize your professional node for maximum visibility.</p>
            </div>
            <Button 
                onClick={handleUpdate}
                disabled={isSaving}
                className="h-14 px-10 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest rounded-2xl gap-3 shadow-[0_0_30px_rgba(16,185,129,0.2)]"
            >
                <Save className="w-5 h-5" />
                {isSaving ? "Syncing..." : "Commit Changes"}
            </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left Col: Visual Node */}
            <div className="space-y-8">
                <div className="bg-card border border-border rounded-[48px] p-10 text-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10">
                        <div className="w-32 h-32 bg-background border-4 border-primary/20 rounded-[40px] flex items-center justify-center mx-auto mb-6 group-hover:border-primary transition-all duration-500">
                             <div className="w-24 h-24 bg-primary/10 rounded-[32px] flex items-center justify-center text-primary text-4xl font-black italic">
                                {formData.fullName?.[0] || "V"}
                             </div>
                             <button className="absolute bottom-0 right-0 p-3 bg-primary text-primary-foreground rounded-2xl shadow-xl hover:scale-110 transition-transform">
                                <Camera className="w-5 h-5" />
                             </button>
                        </div>
                        <h3 className="text-2xl font-black text-foreground italic truncate mb-1">{formData.fullName}</h3>
                        <div className="flex items-center justify-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest mb-6">
                            <ShieldCheck className="w-3 h-3" /> Expert Hub Verified
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-background/50 p-4 rounded-3xl border border-border">
                                <p className="text-muted-foreground text-[9px] font-black uppercase tracking-widest mb-1">Global Rank</p>
                                <p className="text-foreground font-black flex items-center justify-center gap-1"><Star className="w-3 h-3 text-yellow-400 fill-current" /> 4.9</p>
                            </div>
                            <div className="bg-background/50 p-4 rounded-3xl border border-border">
                                <p className="text-muted-foreground text-[9px] font-black uppercase tracking-widest mb-1">Status</p>
                                <p className="text-primary font-black">Active</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-card border border-border rounded-[40px] p-8">
                     <h4 className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                        <Zap className="w-4 h-4 text-primary" /> Active Skills
                     </h4>
                     <div className="flex flex-wrap gap-2">
                        {formData.skills.split(",").map((s, i) => (
                            <span key={i} className="px-4 py-2 bg-background border border-border rounded-xl text-xs font-bold text-muted-foreground">
                                {s.trim()}
                            </span>
                        ))}
                     </div>
                </div>
            </div>

            {/* Right Col: Parameters */}
            <div className="lg:col-span-2 space-y-8">
                <div className="bg-card border border-border rounded-[48px] p-12">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                        <div className="space-y-3">
                            <label className="text-muted-foreground text-[10px] font-black uppercase tracking-widest ml-1">Identity Tag</label>
                            <div className="relative">
                                <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input 
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                                    className="w-full h-16 bg-background border border-border rounded-3xl pl-14 pr-6 text-foreground font-bold outline-none focus:border-primary/50 transition-all"
                                    placeholder="Enter full legal name..."
                                />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="text-muted-foreground text-[10px] font-black uppercase tracking-widest ml-1">Threshold Rate ($)</label>
                            <div className="relative">
                                <Zap className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input 
                                    value={formData.hourlyRate}
                                    onChange={(e) => setFormData({...formData, hourlyRate: e.target.value})}
                                    className="w-full h-16 bg-background border border-border rounded-3xl pl-14 pr-6 text-foreground font-bold outline-none focus:border-primary/50 transition-all"
                                    placeholder="Hourly rate..."
                                />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="text-muted-foreground text-[10px] font-black uppercase tracking-widest ml-1">Expertise Node</label>
                            <div className="relative">
                                <Briefcase className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input 
                                    value={formData.expertise}
                                    onChange={(e) => setFormData({...formData, expertise: e.target.value})}
                                    className="w-full h-16 bg-background border border-border rounded-3xl pl-14 pr-14 text-foreground font-bold outline-none focus:border-primary/50 transition-all"
                                    placeholder="E.g. Senior Product Designer"
                                />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="text-muted-foreground text-[10px] font-black uppercase tracking-widest ml-1">Geospatial Link</label>
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
                     </div>

                     <div className="space-y-3 mb-10">
                        <label className="text-muted-foreground text-[10px] font-black uppercase tracking-widest ml-1">Professional Strategy (Bio)</label>
                        <textarea 
                            rows={4}
                            value={formData.bio}
                            onChange={(e) => setFormData({...formData, bio: e.target.value})}
                            className="w-full bg-background border border-border rounded-3xl p-6 text-foreground font-medium outline-none focus:border-primary/50 transition-all resize-none leading-relaxed"
                            placeholder="Describe your creative and technical strategy..."
                        />
                     </div>

                     <div className="space-y-3">
                        <label className="text-muted-foreground text-[10px] font-black uppercase tracking-widest ml-1">Neural Skills (Comma separated)</label>
                        <div className="relative">
                            <Globe className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <input 
                                value={formData.skills}
                                onChange={(e) => setFormData({...formData, skills: e.target.value})}
                                className="w-full h-16 bg-background border border-border rounded-3xl pl-14 pr-6 text-foreground font-bold outline-none focus:border-primary/50 transition-all"
                                placeholder="React, Figma, SolidJS, Go..."
                            />
                        </div>
                     </div>

                     <div className="space-y-3 mb-10">
                        <label className="text-muted-foreground text-[10px] font-black uppercase tracking-widest ml-1">Resume / CV Node (Link or Doc URL)</label>
                        <div className="relative">
                            <FileText className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <input 
                                value={formData.resumeLink}
                                onChange={(e) => setFormData({...formData, resumeLink: e.target.value})}
                                className="w-full h-16 bg-background border border-border rounded-3xl pl-14 pr-6 text-foreground font-bold outline-none focus:border-primary/50 transition-all"
                                placeholder="Link to your resume (Google Drive, LinkedIn, etc.)"
                            />
                        </div>
                     </div>

                     {/* Portfolio & Services Nodes */}
                     <div className="pt-10 border-t border-white/5 space-y-8">
                        <div>
                            <h3 className="text-xl font-black text-foreground italic uppercase tracking-tighter mb-6">Extended Node Configuration</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div 
                                    onClick={() => router.push(`/freelancers/${user?.uid}?tab=portfolio`)}
                                    className="p-8 bg-background border border-border rounded-[32px] hover:border-primary/50 transition-all cursor-pointer group"
                                >
                                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                                        <Briefcase className="w-6 h-6" />
                                    </div>
                                    <h4 className="text-lg font-black italic uppercase tracking-tight mb-2">Portfolio Archive</h4>
                                    <p className="text-muted-foreground text-sm font-medium">Manage your visual transmissions and masterpieces.</p>
                                </div>
                                <div 
                                    onClick={() => router.push("/dashboard/freelancer/gigs")}
                                    className="p-8 bg-background border border-border rounded-[32px] hover:border-primary/50 transition-all cursor-pointer group"
                                >
                                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                                        <Zap className="w-6 h-6" />
                                    </div>
                                    <h4 className="text-lg font-black italic uppercase tracking-tight mb-2">Service Nodes</h4>
                                    <p className="text-muted-foreground text-sm font-medium">Configure your professional gig parameters and logs.</p>
                                </div>
                            </div>
                        </div>
                     </div>
                </div>
            </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
