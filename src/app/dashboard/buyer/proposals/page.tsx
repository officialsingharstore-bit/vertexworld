"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { BUYER_NAV } from "@/constants/navigation";
import {
  Star,
  CheckCircle2,
  Clock,
  MessageSquare,
  ThumbsUp,
  MapPin,
  X,
  FileText,
  DollarSign,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc, addDoc, serverTimestamp } from "firebase/firestore";

export default function ProposalsPage() {
  const { user } = useAuth();
  const [dbProposals, setDbProposals] = useState<any[]>([]);
  const [selectedProposal, setSelectedProposal] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Fetch real proposals for this buyer
    const q = query(collection(db, "proposals"), where("buyerId", "==", user.uid));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setDbProposals(data);
        if (data.length > 0 && !selectedProposal) {
            setSelectedProposal(data[0]);
        }
        setLoading(false);
    }, (err) => {
        console.error("Proposals feed error:", err);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleUpdateStatus = async (proposalId: string, newStatus: string, freelancerId: string, projectTitle: string) => {
    if (!proposalId) {
        alert("Signal Error: Proposal ID missing.");
        return;
    }

    console.log(`[VerteX] Transmitting status update: ${proposalId} -> ${newStatus}`);
    
    try {
        const proposalRef = doc(db, "proposals", proposalId);
        await updateDoc(proposalRef, { 
            status: newStatus,
            updatedAt: serverTimestamp() 
        });
        
        console.log(`[VerteX] Database commitment successful for ${proposalId}`);

        // Notify Freelancer
        if (freelancerId) {
            await addDoc(collection(db, "notifications"), {
                recipientId: freelancerId,
                message: `Your proposal for "${projectTitle || 'Project'}" has been ${newStatus}!`,
                type: "status_update",
                read: false,
                createdAt: serverTimestamp()
            });
        }

        // Deep local update to force UI refresh
        if (selectedProposal && selectedProposal.id === proposalId) {
            setSelectedProposal((prev: any) => ({ ...prev, status: newStatus }));
        }

        alert(`PROPOSAL ${newStatus.toUpperCase()} - NODE UPDATED`);
    } catch (err: any) {
        console.error("[VerteX] Status transmission failure:", err);
        alert(`Transmission Error: ${err.message || 'Access Denied'}`);
    }
  };

  const statusConfig: Record<string, { color: string; bg: string }> = {
    pending: { color: "text-blue-400", bg: "bg-blue-500/10" },
    shortlisted: { color: "text-primary", bg: "bg-primary/10" },
    declined: { color: "text-muted-foreground", bg: "bg-muted" },
    hired: { color: "text-yellow-400", bg: "bg-yellow-500/10" },
  };

  return (
    <DashboardLayout navItems={BUYER_NAV} userRole="Buyer">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-black text-foreground mb-2 italic tracking-tight uppercase">Strategic Proposals</h1>
            <p className="text-muted-foreground font-medium tracking-wide">
              Review real-time transmissions from elite talent across your network.
            </p>
          </div>
          <div className="bg-card border border-border rounded-2xl px-6 py-3">
             <span className="text-primary font-black text-xl italic">{dbProposals.length}</span>
             <span className="text-muted-foreground text-[10px] font-black uppercase tracking-widest ml-3">Incoming Nodes</span>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
          {/* List */}
          <div className="xl:col-span-2 space-y-4">
            {loading ? (
                <div className="py-20 text-center text-muted-foreground font-black italic animate-pulse">Scanning Proposals...</div>
            ) : dbProposals.length === 0 ? (
                <div className="text-center py-24 bg-card/30 border border-dashed border-border rounded-[40px]">
                    <FileText className="w-16 h-16 mx-auto mb-6 text-muted-foreground" />
                    <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">No active proposals found</p>
                </div>
            ) : dbProposals.map((p) => {
              const sc = statusConfig[p.status || 'pending'];
              const isSelected = selectedProposal?.id === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedProposal(p)}
                  className={`w-full text-left p-6 rounded-[32px] border transition-all group relative overflow-hidden ${
                    isSelected ? "bg-primary/5 border-primary/50 shadow-2xl" : "bg-card border-border hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-background border border-border rounded-2xl flex items-center justify-center text-primary font-black text-lg">
                      {(p.freelancerName || "F")[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-foreground font-black text-base uppercase italic tracking-tighter truncate group-hover:text-primary transition-colors">{p.freelancerName}</h4>
                      <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest truncate">{p.projectTitle}</p>
                    </div>
                    <div className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${sc.bg} ${sc.color}`}>
                      {p.status || 'pending'}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                     <span className="text-muted-foreground font-bold text-[10px] uppercase tracking-widest italic">{p.createdAt ? new Date(p.createdAt.seconds * 1000).toLocaleTimeString() : 'Recent'}</span>
                     <ChevronRight className={`w-5 h-5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Details */}
          <div className="xl:col-span-3">
             {selectedProposal ? (
                 <div className="bg-card border border-border rounded-[56px] overflow-hidden sticky top-8 shadow-3xl">
                    <div className="p-12 border-b border-border bg-background/20">
                        <div className="flex items-start justify-between gap-6 mb-10">
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 bg-primary/10 border border-primary/20 rounded-[32px] flex items-center justify-center text-primary font-black text-3xl italic">
                                    {(selectedProposal.freelancerName || "F")[0]}
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-foreground italic tracking-tighter uppercase mb-1">{selectedProposal.freelancerName}</h2>
                                    <p className="text-primary font-black text-[10px] uppercase tracking-[0.3em]">Elite Freelance Node</p>
                                </div>
                            </div>
                            <div className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] ${statusConfig[selectedProposal.status || 'pending'].bg} ${statusConfig[selectedProposal.status || 'pending'].color}`}>
                                {selectedProposal.status || 'pending'}
                            </div>
                        </div>

                        <div className="p-8 bg-background/50 rounded-[40px] border border-border">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">Incoming Strategy</span>
                            </div>
                            <p className="text-muted-foreground text-lg leading-relaxed font-medium italic">"{selectedProposal.coverLetter}"</p>
                        </div>
                    </div>

                    <div className="p-12 space-y-10">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="p-6 bg-background border border-border rounded-3xl">
                                <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-1 flex items-center gap-2"><Clock className="w-3 h-3" /> Transmitted At</p>
                                <p className="text-foreground font-black italic">{selectedProposal.createdAt ? new Date(selectedProposal.createdAt.seconds * 1000).toLocaleString() : 'N/A'}</p>
                            </div>
                            <div className="p-6 bg-background border border-border rounded-3xl">
                                <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-1 flex items-center gap-2"><FileText className="w-3 h-3" /> Targeted Project</p>
                                <p className="text-foreground font-black italic truncate">{selectedProposal.projectTitle}</p>
                            </div>
                        </div>

                        <div className="flex gap-6">
                            <Button 
                                onClick={() => handleUpdateStatus(selectedProposal.id, 'hired', selectedProposal.freelancerId, selectedProposal.projectTitle)}
                                className="flex-1 h-20 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-[0.2em] rounded-[24px] shadow-2xl shadow-primary/20 text-lg italic"
                            >
                                Hire Professional
                            </Button>
                            <Button 
                                onClick={() => handleUpdateStatus(selectedProposal.id, 'shortlisted', selectedProposal.freelancerId, selectedProposal.projectTitle)}
                                className="h-20 px-8 bg-background border border-white/10 text-foreground font-black uppercase tracking-widest rounded-[24px] hover:border-primary transition-all"
                            >
                                <ThumbsUp className="w-6 h-6" />
                            </Button>
                            <Button 
                                onClick={() => handleUpdateStatus(selectedProposal.id, 'declined', selectedProposal.freelancerId, selectedProposal.projectTitle)}
                                className="h-20 px-8 bg-background border border-red-500/20 text-red-500 font-black uppercase tracking-widest rounded-[24px] hover:bg-red-500/10 transition-all"
                            >
                                <X className="w-6 h-6" />
                            </Button>
                        </div>
                    </div>
                 </div>
             ) : (
                <div className="h-full min-h-[500px] bg-card/30 border border-dashed border-border rounded-[56px] flex flex-col items-center justify-center text-muted-foreground p-20 text-center">
                    <h3 className="text-2xl font-black text-foreground mb-4 uppercase italic">No Node Selected</h3>
                    <p className="max-w-sm mx-auto text-muted-foreground text-lg font-medium italic leading-relaxed">Choose a proposal transmission from the left to view the strategic cover letter and hire talent.</p>
                </div>
             )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
