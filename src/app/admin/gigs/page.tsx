"use client";

import { useEffect, useState } from "react";
import { 
  Briefcase, 
  Search, 
  Eye, 
  Trash2, 
  Star, 
  Info,
  ExternalLink,
  ChevronRight,
  Filter,
  MoreVertical,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AdminGigsPage() {
  const [gigs, setGigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const q = query(collection(db, "gigs"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const gigsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setGigs(gigsData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const deleteGig = async (gigId: string) => {
    if (!confirm("Are you sure you want to PERMANENTLY remove this gig from the marketplace?")) return;
    try {
      await deleteDoc(doc(db, "gigs", gigId));
    } catch (e) {
      alert("Failed to delete gig.");
    }
  };

  const toggleFeatured = async (gigId: string, current: boolean) => {
    try {
      await updateDoc(doc(db, "gigs", gigId), {
        featured: !current
      });
    } catch (e) {
      alert("Failed to update status.");
    }
  };

  const filteredGigs = gigs.filter(g => 
    g.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    g.author?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-foreground italic uppercase tracking-tight mb-2">Gig Inventory</h1>
          <p className="text-muted-foreground text-sm font-medium">Monitoring and auditing all active services on the platform.</p>
        </div>
        <div className="flex gap-4">
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input 
                    type="text" 
                    placeholder="Search gigs or sellers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-[#0a0f1d] border border-border rounded-2xl pl-12 pr-6 py-3 text-sm text-foreground w-full md:w-80 focus:outline-none focus:border-emerald-500 transition-all shadow-xl"
                />
            </div>
            <Button variant="outline" className="border-border bg-card/50 text-muted-foreground gap-2 font-bold px-6 h-12 rounded-2xl">
                <Filter className="w-4 h-4" /> Category
            </Button>
        </div>
      </div>

      <div className="bg-[#0a0f1d] border border-border rounded-[40px] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-background/50 border-b border-border">
                <th className="px-10 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Gig / Service</th>
                <th className="px-8 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Seller Identity</th>
                <th className="px-8 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Base Pricing</th>
                <th className="px-8 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Platform Status</th>
                <th className="px-10 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Management</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr>
                    <td colSpan={5} className="px-10 py-20 text-center text-muted-foreground italic uppercase font-black tracking-widest animate-pulse">Syncing Gig Database...</td>
                </tr>
              ) : filteredGigs.length === 0 ? (
                <tr>
                    <td colSpan={5} className="px-10 py-20 text-center text-muted-foreground font-bold">Zero gigs detected in the inventory.</td>
                </tr>
              ) : filteredGigs.map((g) => (
                <tr key={g.id} className="hover:bg-card/40 transition-all group">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-12 bg-muted rounded-xl overflow-hidden border border-slate-700 shrink-0">
                        <img src={g.image || `https://source.unsplash.com/featured/?code&${g.id}`} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" alt="" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-foreground font-black text-sm mb-1 truncate max-w-[200px]">{g.title}</p>
                        <p className="text-[10px] text-primary font-black uppercase tracking-widest">{g.category || "General"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-muted border border-slate-700 flex items-center justify-center text-[10px] font-black text-muted-foreground">
                            {g.author?.[0] || "S"}
                        </div>
                        <span className="text-muted-foreground font-bold text-sm">{g.author || "Seller"}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-foreground font-black text-lg">${g.pricing?.basic?.price || 50}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                            g.featured ? "bg-primary/10 text-primary border border-primary/20" : "bg-muted text-muted-foreground"
                        }`}>
                            {g.featured ? "Featured" : "Standard"}
                        </span>
                        <div className="w-2 h-2 bg-primary rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button asChild variant="outline" className="p-3 bg-card border-border hover:bg-primary hover:text-foreground rounded-xl h-10 w-10">
                            <Link href={`/marketplace/gigs/${g.id}`} target="_blank">
                                <ExternalLink className="w-4 h-4" />
                            </Link>
                        </Button>
                        <button 
                            onClick={() => toggleFeatured(g.id, g.featured)}
                            className={`p-3 rounded-xl transition-all h-10 w-10 flex items-center justify-center ${g.featured ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted"}`}
                        >
                            <Star className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => deleteGig(g.id)}
                            className="p-3 bg-card hover:bg-red-500 text-muted-foreground hover:text-foreground rounded-xl transition-all h-10 w-10 flex items-center justify-center"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
