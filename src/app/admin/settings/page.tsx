"use client";

import { useEffect, useRef, useState } from "react";
import { 
  Banknote, 
  Percent, 
  Save, 
  AlertTriangle,
  Globe,
  Lock,
  Server,
  Upload,
  Loader2,
  Link as LinkIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [videoMode, setVideoMode] = useState<'link' | 'upload'>('link');
  const [videoUploadProgress, setVideoUploadProgress] = useState<number | null>(null);
  const videoFileInputRef = useRef<HTMLInputElement>(null);
  const [settings, setSettings] = useState<{
    bankName: string;
    accountTitle: string;
    accountNum: string;
    withdrawalThreshold: number;
    commissionRate: number;
    platformStatus: string;
    maintenanceMode: boolean;
    popupVideoUrl: string;
    enablePopupVideo: boolean;
    updatedAt?: { seconds: number; nanoseconds: number } | null;
  }>({
    bankName: "VerteX Global Escrow",
    accountTitle: "VerteX Digital Marketplace Ltd",
    accountNum: "09871234567890 (International)",
    commissionRate: 5,
    withdrawalThreshold: 100,
    platformStatus: "active",
    maintenanceMode: false,
    popupVideoUrl: "",
    enablePopupVideo: false,
    updatedAt: null
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, "platform_settings", "config");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSettings(docSnap.data() as any);
        }
      } catch (e) {
        console.error("Error fetching settings:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const saveSettings = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, "platform_settings", "config"), {
        ...settings,
        updatedAt: serverTimestamp()
      });
      alert("Platform configurations updated successfully!");
    } catch (e) {
      alert("Failed to save settings. Check permissions.");
    } finally {
      setSaving(false);
    }
  };

  const toggleMaintenanceMode = async () => {
    const newValue = !settings.maintenanceMode;
    setSettings(prev => ({ ...prev, maintenanceMode: newValue }));
    
    try {
      await setDoc(doc(db, "platform_settings", "config"), {
        ...settings,
        maintenanceMode: newValue,
        updatedAt: serverTimestamp()
      });
    } catch (e) {
      alert("Failed to auto-sync maintenance mode.");
    }
  };

  const handleCloudinaryVideoUpload = async (file: File | null) => {
    if (!file) return;
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    if (!cloudName || cloudName === 'your_cloud_name') {
      alert('Cloudinary not configured.');
      return;
    }
    setVideoUploadProgress(0);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset || 'vertex_unsigned');
      formData.append('folder', 'vertex_marketing');
      formData.append('resource_type', 'video');
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`);
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) setVideoUploadProgress(Math.round((e.loaded / e.total) * 100));
      };
      const result = await new Promise<any>((resolve, reject) => {
        xhr.onload = () => resolve(JSON.parse(xhr.responseText));
        xhr.onerror = reject;
        xhr.send(formData);
      });
      if (result.secure_url) {
        setSettings(prev => ({ ...prev, popupVideoUrl: result.secure_url }));
      } else {
        alert('Video upload failed: ' + (result.error?.message || 'Unknown'));
      }
    } catch (err) {
      alert('Upload failed. Check Cloudinary settings.');
    } finally {
      setVideoUploadProgress(null);
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-foreground italic uppercase tracking-tight mb-2">Platform Engine</h1>
          <p className="text-muted-foreground text-sm font-medium">Core configuration and global variables for the VerteX ecosystem.</p>
        </div>
        <Button 
            onClick={saveSettings} 
            disabled={saving}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 h-14 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 gap-3"
        >
            <Save className="w-5 h-5" />
            {saving ? "Deploying..." : "Save Changes"}
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Financial Core */}
        <div className="space-y-8">
            <div className="bg-card border border-border rounded-[48px] p-10 space-y-8">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center text-primary">
                        <Banknote className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-black text-foreground uppercase tracking-tighter italic">Financial Protocol</h3>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-3 ml-2">Escrow Bank Name</label>
                        <input 
                            type="text" 
                            value={settings.bankName}
                            onChange={(e) => setSettings({...settings, bankName: e.target.value})}
                            className="w-full h-14 bg-background border border-border rounded-2xl px-6 text-foreground font-bold focus:outline-none focus:border-emerald-500 transition-all font-mono"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-3 ml-2">Account Holder Title</label>
                        <input 
                            type="text" 
                            value={settings.accountTitle}
                            onChange={(e) => setSettings({...settings, accountTitle: e.target.value})}
                            className="w-full h-14 bg-background border border-border rounded-2xl px-6 text-foreground font-bold focus:outline-none focus:border-emerald-500 transition-all font-mono"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-3 ml-2">Account / IBAN Number</label>
                        <input 
                            type="text" 
                            value={settings.accountNum}
                            onChange={(e) => setSettings({...settings, accountNum: e.target.value})}
                            className="w-full h-14 bg-background border border-border rounded-2xl px-6 text-foreground font-bold focus:outline-none focus:border-emerald-500 transition-all font-mono"
                        />
                    </div>
                </div>
            </div>

            {/* Marketing Engine */}
            <div className="bg-card border border-border rounded-[48px] p-10 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center text-primary">
                            <Server className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-foreground uppercase tracking-tighter italic">Marketing Engine</h3>
                            <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest opacity-50">Homepage video popup</p>
                        </div>
                    </div>
                    <div 
                        onClick={() => setSettings({...settings, enablePopupVideo: !settings.enablePopupVideo})}
                        className={`w-14 h-7 rounded-full px-1 flex items-center cursor-pointer transition-all ${settings.enablePopupVideo ? "bg-primary" : "bg-muted"}`}
                    >
                        <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-all ${settings.enablePopupVideo ? "translate-x-7" : "translate-x-0"}`} />
                    </div>
                </div>

                {/* Video Mode Tabs */}
                <div className="flex gap-2 bg-background/50 p-1.5 rounded-2xl border border-border">
                    <button type="button" onClick={() => setVideoMode('link')}
                        className={`flex-1 h-9 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                            videoMode === 'link' ? 'bg-primary text-black shadow-lg' : 'text-muted-foreground hover:text-foreground'
                        }`}>
                        <LinkIcon className="w-3 h-3" /> Paste URL
                    </button>
                    <button type="button" onClick={() => setVideoMode('upload')}
                        className={`flex-1 h-9 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                            videoMode === 'upload' ? 'bg-primary text-black shadow-lg' : 'text-muted-foreground hover:text-foreground'
                        }`}>
                        <Upload className="w-3 h-3" /> Cloudinary Upload
                    </button>
                </div>

                {videoMode === 'link' && (
                    <div className="space-y-2">
                        <label className="block text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-3 ml-2">Video URL (mp4 / webm)</label>
                        <input 
                            type="text" 
                            placeholder="https://example.com/promo-video.mp4"
                            value={settings.popupVideoUrl}
                            onChange={(e) => setSettings({...settings, popupVideoUrl: e.target.value})}
                            className="w-full h-14 bg-background border border-border rounded-2xl px-6 text-foreground font-bold focus:outline-none focus:border-primary transition-all font-mono placeholder:text-muted-foreground/30"
                        />
                        <p className="text-[8px] text-muted-foreground font-black uppercase tracking-widest ml-2 italic">Must be a direct public video URL</p>
                    </div>
                )}

                {videoMode === 'upload' && (
                    <div className="space-y-4">
                        <div
                            className="border-2 border-dashed border-primary/30 rounded-2xl p-8 text-center cursor-pointer hover:border-primary/60 hover:bg-primary/5 transition-all"
                            onClick={() => videoFileInputRef.current?.click()}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => { e.preventDefault(); handleCloudinaryVideoUpload(e.dataTransfer.files[0]); }}
                        >
                            {videoUploadProgress !== null ? (
                                <div className="space-y-3">
                                    <Loader2 className="w-8 h-8 text-primary mx-auto animate-spin" />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-primary">Uploading to Cloudinary... {videoUploadProgress}%</p>
                                    <div className="h-1.5 bg-muted rounded-full overflow-hidden max-w-xs mx-auto">
                                        <div className="h-full bg-primary rounded-full transition-all shadow-[0_0_8px_rgba(163,255,51,0.8)]" style={{ width: `${videoUploadProgress}%` }} />
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <Upload className="w-8 h-8 text-primary/40 mx-auto mb-3" />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Click or Drag & Drop Video</p>
                                    <p className="text-[8px] text-muted-foreground/40 mt-1 font-black uppercase tracking-widest">MP4 · WEBM · MOV</p>
                                </>
                            )}
                        </div>
                        <input
                            ref={videoFileInputRef}
                            type="file"
                            accept="video/mp4,video/webm,video/mov,video/avi"
                            className="hidden"
                            onChange={(e) => handleCloudinaryVideoUpload(e.target.files?.[0] || null)}
                        />
                        {settings.popupVideoUrl && (
                            <div className="flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-2xl px-5 py-3">
                                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                                <p className="text-[9px] font-black uppercase tracking-widest text-primary truncate flex-1">Video Ready: {settings.popupVideoUrl.split('/').pop()}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>

        {/* Commission & Safety */}
        <div className="space-y-8">
            <div className="bg-card border border-border rounded-[48px] p-10">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center justify-center text-purple-500">
                        <Percent className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-black text-foreground uppercase tracking-tighter italic">Profit Algorithms</h3>
                </div>
                
                <div className="flex items-center gap-6">
                    <div className="flex-1">
                        <label className="block text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-4 ml-2">Admin Commission Rate (%)</label>
                        <div className="relative">
                            <input 
                                type="number" 
                                value={settings.commissionRate}
                                onChange={(e) => setSettings({...settings, commissionRate: Number(e.target.value)})}
                                className="w-full h-20 bg-background border border-border rounded-3xl px-8 text-4xl font-black text-foreground focus:outline-none focus:border-purple-500 transition-all"
                            />
                            <span className="absolute right-8 top-1/2 -translate-y-1/2 text-2xl font-black text-muted-foreground">%</span>
                        </div>
                    </div>
                    <div className="w-48 p-6 bg-purple-500/5 border border-purple-500/10 rounded-3xl">
                        <p className="text-[10px] text-purple-500 font-black uppercase tracking-widest mb-2">Example</p>
                        <p className="text-foreground text-xs font-bold leading-relaxed">If a project costs $100, the platform keeps <span className="text-purple-400 font-black">${settings.commissionRate}</span>.</p>
                    </div>
                </div>
            </div>

            {/* Withdrawal Threshold */}
            <div className="bg-card border border-border rounded-[48px] p-10">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-500">
                        <Banknote className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-black text-foreground uppercase tracking-tighter italic">Payout Threshold</h3>
                </div>
                
                <div className="flex items-center gap-6">
                    <div className="flex-1">
                        <label className="block text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-4 ml-2">Minimum Withdrawal Amount ($)</label>
                        <div className="relative">
                            <input 
                                type="number" 
                                value={settings.withdrawalThreshold}
                                onChange={(e) => setSettings({...settings, withdrawalThreshold: Number(e.target.value)})}
                                className="w-full h-20 bg-background border border-border rounded-3xl px-8 text-4xl font-black text-foreground focus:outline-none focus:border-emerald-500 transition-all font-mono"
                            />
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-muted-foreground">$</span>
                        </div>
                    </div>
                    <div className="w-48 p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl">
                        <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest mb-2">Policy</p>
                        <p className="text-foreground text-xs font-bold leading-relaxed">Freelancers must have at least <span className="text-emerald-400 font-black">${settings.withdrawalThreshold}</span> to request a payout.</p>
                    </div>
                </div>
            </div>

            {/* Platform Status */}
            <div className="bg-card border border-border rounded-[48px] p-10 relative overflow-hidden group">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center text-blue-500">
                            <Server className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-black text-foreground uppercase tracking-tighter italic">System Vitality</h3>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">Global Live</span>
                    </div>
                </div>

                <div className="space-y-4">
                    <div 
                        onClick={toggleMaintenanceMode}
                        className={`p-6 border rounded-3xl flex items-center justify-between cursor-pointer transition-all ${
                            settings.maintenanceMode ? "bg-red-500/5 border-red-500" : "bg-background border-border hover:border-slate-700"
                        }`}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${settings.maintenanceMode ? "bg-red-500 text-foreground" : "bg-card text-muted-foreground"}`}>
                                <Lock className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-foreground font-bold text-sm">Maintenance Mode</p>
                                <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">Lock Public Access</p>
                            </div>
                        </div>
                        <div className={`w-12 h-6 rounded-full relative transition-all ${settings.maintenanceMode ? "bg-red-500" : "bg-muted"}`}>
                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.maintenanceMode ? "right-1" : "left-1"}`} />
                        </div>
                    </div>
                </div>

                <AlertTriangle className="absolute -bottom-6 -right-6 w-32 h-32 text-orange-500/5" />
            </div>
        </div>
      </div>

      <div className="p-10 bg-gradient-to-r from-emerald-500/5 via-transparent to-blue-500/5 border border-border rounded-[48px] flex items-center justify-between">
          <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-background rounded-[28px] border border-white/10 flex items-center justify-center">
                  <Globe className="w-8 h-8 text-foreground opacity-40 animate-pulse" />
              </div>
              <div>
                  <h4 className="text-xl font-bold text-foreground mb-1 uppercase tracking-tight">Global Meta Sync</h4>
                  <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.3em]">Last Updated: {settings.updatedAt ? new Date(settings.updatedAt.seconds * 1000).toLocaleString() : 'Never'}</p>
              </div>
          </div>
          <div className="flex gap-4">
              <Button variant="outline" className="border-border text-muted-foreground rounded-xl h-12 uppercase font-black tracking-widest text-[9px] px-6">Rollback Changes</Button>
              <Button onClick={saveSettings} className="bg-primary text-primary-foreground rounded-xl h-12 uppercase font-black tracking-widest text-[9px] px-8 shadow-xl shadow-primary/20">Sync Now</Button>
          </div>
      </div>
    </div>
  );
}
