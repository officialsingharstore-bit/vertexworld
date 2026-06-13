"use client";

import { useEffect, useState } from "react";
import { 
  Settings, 
  Shield, 
  Banknote, 
  Percent, 
  Save, 
  AlertTriangle,
  Globe,
  Bell,
  Lock,
  RefreshCw,
  Server
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<{
    bankName: string;
    accountTitle: string;
    accountNum: string;
    commissionRate: number;
    platformStatus: string;
    maintenanceMode: boolean;
    updatedAt?: { seconds: number; nanoseconds: number } | null;
  }>({
    bankName: "VerteX Global Escrow",
    accountTitle: "VerteX Digital Marketplace Ltd",
    accountNum: "09871234567890 (International)",
    commissionRate: 5,
    platformStatus: "active",
    maintenanceMode: false,
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
                        onClick={() => setSettings({...settings, maintenanceMode: !settings.maintenanceMode})}
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
