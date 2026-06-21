"use client";

import { useState, useEffect, useRef } from "react";
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
  const [imageMode, setImageMode] = useState<'link' | 'upload'>('link');
  const [gigLinkInput, setGigLinkInput] = useState("");
  const [gigUploadProgress, setGigUploadProgress] = useState<number | null>(null);
  const gigFileInputRef = useRef<HTMLInputElement>(null);
  
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
    images: [] as string[],
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

  const handleAddGigLink = () => {
    if (!gigLinkInput.trim()) return;
    let url = gigLinkInput.trim();
    if (url.includes('drive.google.com/file')) {
      const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (match?.[1]) url = `https://drive.google.com/uc?export=view&id=${match[1]}`;
    }
    setFormData({ ...formData, images: [...formData.images, url] });
    setGigLinkInput("");
  };

  const handleGigCloudinaryUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    if (!cloudName || cloudName === 'your_cloud_name') {
      alert('Cloudinary not configured.');
      return;
    }
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue;
      setGigUploadProgress(0);
      try {
        const formDataObj = new FormData();
        formDataObj.append('file', file);
        formDataObj.append('upload_preset', uploadPreset || 'vertex_unsigned');
        formDataObj.append('folder', 'vertex_gigs');
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setGigUploadProgress(Math.round((e.loaded / e.total) * 100));
        };
        const result = await new Promise<any>((resolve, reject) => {
          xhr.onload = () => resolve(JSON.parse(xhr.responseText));
          xhr.onerror = reject;
          xhr.send(formDataObj);
        });
        if (result.secure_url) {
          setFormData(prev => ({ ...prev, images: [...prev.images, result.secure_url] }));
        } else {
          alert('Upload failed: ' + (result.error?.message || 'Unknown'));
        }
      } catch (err) {
        alert('Upload failed. Check Cloudinary settings.');
      } finally {
        setGigUploadProgress(null);
      }
    }
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
                            className="space-y-8"
                        >
                            <div>
                                <h3 className="text-xl font-black uppercase italic tracking-tight text-foreground mb-1">Gig Gallery</h3>
                                <p className="text-muted-foreground text-sm">Add images to showcase your service. These appear in the marketplace listing.</p>
                            </div>

                            {/* Mode Tabs */}
                            <div className="flex gap-2 bg-background/50 p-1.5 rounded-2xl border border-border">
                                <button type="button" onClick={() => setImageMode('link')}
                                    className={`flex-1 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                                        imageMode === 'link' ? 'bg-primary text-black shadow-lg' : 'text-muted-foreground hover:text-foreground'
                                    }`}>
                                    <Upload className="w-3 h-3" /> Paste Link
                                </button>
                                <button type="button" onClick={() => setImageMode('upload')}
                                    className={`flex-1 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                                        imageMode === 'upload' ? 'bg-primary text-black shadow-lg' : 'text-muted-foreground hover:text-foreground'
                                    }`}>
                                    <Upload className="w-3 h-3" /> Cloudinary Upload
                                </button>
                            </div>

                            {imageMode === 'link' && (
                                <div className="space-y-3">
                                    <div className="flex gap-3">
                                        <input
                                            type="text"
                                            value={gigLinkInput}
                                            onChange={(e) => setGigLinkInput(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddGigLink())}
                                            placeholder="https://i.imgur.com/your-image.jpg"
                                            className="flex-1 h-12 bg-background border border-border rounded-2xl px-5 text-foreground font-bold text-sm focus:border-primary outline-none placeholder:text-muted-foreground/30"
                                        />
                                        <Button type="button" onClick={handleAddGigLink} disabled={!gigLinkInput.trim()}
                                            className="h-12 px-6 bg-primary text-black font-black uppercase tracking-widest text-[9px] rounded-2xl">
                                            Add
                                        </Button>
                                    </div>
                                    <p className="text-[9px] text-muted-foreground/50 font-bold uppercase tracking-widest">Imgur, direct .jpg/.png links. Google Drive auto-converted.</p>
                                </div>
                            )}

                            {imageMode === 'upload' && (
                                <div>
                                    <div
                                        className="border-2 border-dashed border-primary/30 rounded-2xl p-10 text-center cursor-pointer hover:border-primary/60 hover:bg-primary/5 transition-all"
                                        onClick={() => gigFileInputRef.current?.click()}
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={(e) => { e.preventDefault(); handleGigCloudinaryUpload(e.dataTransfer.files); }}
                                    >
                                        {gigUploadProgress !== null ? (
                                            <div className="space-y-3">
                                                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                                                <p className="text-[10px] font-black uppercase tracking-widest text-primary">Uploading... {gigUploadProgress}%</p>
                                                <div className="h-1.5 bg-muted rounded-full overflow-hidden max-w-xs mx-auto">
                                                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${gigUploadProgress}%` }} />
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="w-16 h-16 rounded-full bg-card flex items-center justify-center text-primary mx-auto mb-4"><Upload className="w-7 h-7" /></div>
                                                <p className="text-foreground font-bold mb-1">Click or Drag & Drop</p>
                                                <p className="text-muted-foreground text-sm">PNG · JPG · WEBP</p>
                                            </>
                                        )}
                                    </div>
                                    <input ref={gigFileInputRef} type="file" accept="image/*" multiple className="hidden"
                                        onChange={(e) => handleGigCloudinaryUpload(e.target.files)} />
                                </div>
                            )}

                            {/* Preview */}
                            {formData.images.length > 0 && (
                                <div className="grid grid-cols-2 gap-4">
                                    {formData.images.map((img, i) => (
                                        <div key={i} className="bg-background border border-border p-3 rounded-2xl flex items-center gap-3 group">
                                            <div className="w-20 h-14 bg-muted rounded-lg overflow-hidden shrink-0">
                                                <img src={img} alt="Gig" className="object-contain w-full h-full" referrerPolicy="no-referrer" />
                                            </div>
                                            <div className="flex-1 overflow-hidden">
                                                <p className="text-foreground text-xs font-bold truncate">{img.split('/').pop()?.slice(0, 30)}</p>
                                                <p className="text-primary text-[10px] font-black uppercase">✓ Ready</p>
                                            </div>
                                            <Trash2 className="w-4 h-4 text-muted-foreground hover:text-red-400 cursor-pointer shrink-0"
                                                onClick={() => setFormData({...formData, images: formData.images.filter((_, idx) => idx !== i)})} />
                                        </div>
                                    ))}
                                </div>
                            )}
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
