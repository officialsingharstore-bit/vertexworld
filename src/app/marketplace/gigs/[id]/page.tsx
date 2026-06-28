"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { 
  Star, 
  Clock, 
  CheckCircle, 
  ShieldCheck, 
  MessageSquare, 
  ArrowRight,
  ChevronRight,
  Info,
  Calendar,
  Zap,
  Globe,
  Share2,
  Heart,
  Banknote,
  Copy,
  AlertCircle,
  Hash,
  User,
  Mail,
  Medal,
  Award,
  Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";

export default function GigDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, userData, loading: authLoading } = useAuth();
  
  const [gig, setGig] = useState<any>(null);
  const [freelancerProfile, setFreelancerProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"basic" | "standard" | "premium">("basic");
  const [mainImage, setMainImage] = useState<string>("https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop");
  
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [transactionId, setTransactionId] = useState("");

  // COMPANY BANK DETAILS
  const COMPANY_BANK_NAME = "VerteX Global Escrow";
  const COMPANY_ACCOUNT_TITLE = "VerteX Digital Marketplace Ltd";
  const COMPANY_ACCOUNT_NUM = "09871234567890 (International)";

  useEffect(() => {
    const fetchGig = async () => {
      if (!id) return;
      try {
        const gigDoc = await getDoc(doc(db, "gigs", id as string));
        if (gigDoc.exists()) {
          const data = gigDoc.data();
          setGig({ id: gigDoc.id, ...data });

          if (data.freelancerId) {
            const userDoc = await getDoc(doc(db, "users", data.freelancerId));
            if (userDoc.exists()) {
              setFreelancerProfile(userDoc.data());
            }
          }
        }
      } catch (error) {
        console.error("Error fetching gig:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGig();
  }, [id]);

  useEffect(() => {
    if (gig) {
      // Resolve initial main image
      const img = gig.images?.[0] || gig.image || gig.imageUrl || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop";
      setMainImage(img);
    }
  }, [gig]);

  const confirmOrder = async () => {
    if (!transactionId) {
        alert("Transaction ID is required for bank verification.");
        return;
    }
    setIsPlacingOrder(true);
    try {
      const price = gig.pricing?.[selectedPlan]?.price || 50;
      await addDoc(collection(db, "orders"), {
        gigId: gig.id,
        gigTitle: gig.title,
        buyerId: user?.uid,
        buyerName: userData?.fullName || "Buyer",
        buyerEmail: user?.email || "",
        freelancerId: gig.freelancerId,
        freelancerName: gig.author || "Freelancer",
        plan: selectedPlan,
        totalPrice: price,
        transactionId: transactionId,
        adminCommission: price * 0.05,
        freelancerEarnings: price * 0.95,
        status: "awaiting_verification",
        createdAt: serverTimestamp(),
      });
      setShowPaymentModal(false);
      router.push("/dashboard/buyer/projects");
    } catch (e) {
      alert("Order failed. Please try again.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handleContact = async () => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    try {
      const convsRef = collection(db, "conversations");
      const q = query(
        convsRef, 
        where("participants", "array-contains", user.uid)
      );
      
      const querySnapshot = await getDocs(q);
      let existingConv = querySnapshot.docs.find(doc => 
        doc.data().participants.includes(gig.freelancerId)
      );

      let conversationId = existingConv?.id;

      if (!conversationId) {
        const newConv = await addDoc(convsRef, {
          participants: [user.uid, gig.freelancerId],
          participantNames: {
            [user.uid]: userData?.fullName || "Buyer",
            [gig.freelancerId]: freelancerProfile?.fullName || gig.author || "Freelancer"
          },
          lastMessage: `Hi, I'm interested in your gig: ${gig.title}`,
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp()
        });
        conversationId = newConv.id;
      }

      router.push(`/dashboard/buyer/messages?conv=${conversationId}`);
    } catch (error) {
      console.error("Error starting conversation:", error);
      alert("Failed to start conversation. Please try again.");
    }
  };

  const handleOrderClick = () => {
    if (authLoading) return;
    if (!user) {
      router.push("/auth/login");
      return;
    }
    const userRole = userData?.role?.toLowerCase();
    if (userRole !== "buyer") {
        alert("Access Denied: Only Buyer accounts can place orders.");
        return;
    }
    setShowPaymentModal(true);
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(16,185,129,0.3)]"></div>
    </div>
  );

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      <Navbar />
      
      {/* Ambient Background Glow */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full -z-10 pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 pt-32 pb-20">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-muted-foreground text-xs font-black uppercase tracking-widest mb-10">
          <span>Marketplace</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-primary">{gig.category || "Design & Tech"}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <h1 className="text-4xl md:text-6xl font-black text-foreground mb-8 leading-[1.1] tracking-tight italic">
                {gig.title}
            </h1>

            {/* Seller Brief */}
            <div className="flex flex-wrap items-center gap-8 mb-12 pb-8 border-b border-border">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-2xl flex items-center justify-center font-black text-foreground shadow-xl">
                            {freelancerProfile?.fullName?.[0] || gig.author?.[0] || "V"}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary border-2 border-slate-950 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-3 h-3 text-foreground" />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <p className="text-foreground font-black uppercase tracking-wider">{freelancerProfile?.fullName || gig.author || "VerteX Creator"}</p>
                            <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-black rounded-md border border-primary/20">PRO</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex text-amber-400">
                                {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 fill-amber-400" />)}
                            </div>
                            <span className="text-xs text-muted-foreground font-bold">5.0 (124 reviews)</span>
                        </div>
                    </div>
                </div>
                <div className="h-8 w-px bg-white/10 hidden md:block" />
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Medal className="w-4 h-4 text-primary" />
                    <span className="text-xs font-bold uppercase tracking-widest">Top Rated Seller</span>
                </div>
            </div>

            {/* Gallery */}
            <div className="mb-16 space-y-6">
                <div className="relative aspect-[16/9] w-full rounded-[48px] overflow-hidden border border-white/10 shadow-2xl group bg-slate-900 flex items-center justify-center">
                    {mainImage ? (
                      <img 
                        src={mainImage} 
                        alt="Project Preview" 
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-800 animate-pulse" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Thumbnail Strip */}
                {gig.images && gig.images.length > 1 && (
                    <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                        {gig.images.map((img: string, i: number) => (
                            <button 
                                key={i}
                                onClick={() => setMainImage(img)}
                                className={`w-32 aspect-video rounded-2xl overflow-hidden border-2 transition-all shrink-0 ${
                                    mainImage === img ? "border-primary scale-95 shadow-[0_0_15px_rgba(163,255,51,0.3)]" : "border-white/10 opacity-50 hover:opacity-100"
                                }`}
                            >
                                {img ? (
                                    <img src={img} className="w-full h-full object-cover" alt={`Thumb ${i}`} referrerPolicy="no-referrer" />
                                ) : (
                                    <div className="w-full h-full bg-slate-800" />
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Description Card */}
            <div className="bg-card/50 backdrop-blur-3xl border border-border p-12 rounded-[56px] mb-16 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Info className="w-32 h-32" />
                </div>
                <h2 className="text-3xl font-black text-foreground mb-8 border-b-2 border-emerald-500 w-fit pb-2">About this Gig</h2>
                <div className="prose prose-invert max-w-none">
                    <p className="text-muted-foreground text-xl leading-[1.8] font-medium whitespace-pre-wrap">
                        {gig.description || "Transforming digital ideas into reality. This gig offers professional services dedicated to quality and high-performance delivery."}
                    </p>
                </div>

                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(gig.tags || ["Next.js", "React", "Fullstack", "Performance", "Optimization"]).map((tag: string) => (
                        <div key={tag} className="flex items-center gap-3 p-4 bg-background/50 rounded-2xl border border-border">
                            <CheckCircle className="w-5 h-5 text-primary" />
                            <span className="text-sm font-bold text-muted-foreground tracking-wide">{tag}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Trusted Shield */}
            <div className="bg-gradient-to-r from-emerald-500/10 to-transparent p-10 rounded-[40px] border border-primary/20 flex flex-col md:flex-row items-center gap-8">
                <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center shadow-2xl shadow-emerald-500/30">
                    <ShieldCheck className="w-10 h-10 text-foreground" />
                </div>
                <div>
                    <h3 className="text-2xl font-black text-foreground mb-2">VerteX Secure Escrow</h3>
                    <p className="text-muted-foreground font-medium">Your funds are held safely in our corporate bank account until the project is delivered and approved by you. We ensure 100% security for every transaction.</p>
                </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-8">
            <div className="bg-card border border-border rounded-[48px] overflow-hidden shadow-2xl sticky top-32">
                {/* Tabs */}
                <div className="flex bg-background/50">
                    {(["basic", "standard", "premium"] as const).map(p => (
                        <button 
                            key={p}
                            onClick={() => setSelectedPlan(p)}
                            className={`flex-1 py-6 text-[10px] font-black uppercase tracking-[0.3em] transition-all relative ${
                                selectedPlan === p ? "text-primary" : "text-muted-foreground hover:text-muted-foreground"
                            }`}
                        >
                            {p}
                            {selectedPlan === p && <motion.div layoutId="tab" className="absolute bottom-0 left-0 w-full h-1 bg-primary" />}
                        </button>
                    ))}
                </div>

                <div className="p-10">
                    <div className="flex items-end justify-between mb-8">
                        <div>
                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-1">Price Consideration</p>
                            <h3 className="text-5xl font-black text-foreground">${gig.pricing?.[selectedPlan]?.price || 120}</h3>
                        </div>
                        <div className="text-right">
                           <Award className="w-6 h-6 text-primary mb-1 ml-auto" />
                           <p className="text-[10px] text-primary font-black uppercase">Standard</p>
                        </div>
                    </div>

                    <p className="text-muted-foreground text-sm leading-relaxed mb-10 font-bold italic opacity-80">
                        {gig.pricing?.[selectedPlan]?.description || "The entry point for high-quality production with 3 revisions and fast handoff."}
                    </p>

                    <div className="space-y-4 mb-12">
                        <div className="flex items-center gap-3 text-sm font-bold text-foreground uppercase tracking-tight">
                            <Clock className="w-4 h-4 text-primary" /> 3-Day Delivery
                        </div>
                        <div className="flex items-center gap-3 text-sm font-bold text-foreground uppercase tracking-tight">
                            <RefreshCw className="w-4 h-4 text-primary" /> Unlimited Revisions
                        </div>
                        <div className="flex items-center gap-3 text-sm font-bold text-foreground uppercase tracking-tight">
                            <Zap className="w-4 h-4 text-primary" /> Express Handover
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Button 
                            onClick={handleOrderClick}
                            className="w-full h-16 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl text-xl font-black uppercase tracking-widest shadow-2xl shadow-primary/20 group scale-100 hover:scale-[1.02] transition-all"
                        >
                            Order Now
                            <ArrowRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                        <Button 
                            variant="outline" 
                            onClick={handleContact}
                            className="w-full h-16 border-border bg-white/5 text-foreground font-black uppercase tracking-widest rounded-2xl hover:bg-white/10 gap-3 text-xs"
                        >
                            <MessageSquare className="w-4 h-4" /> Message Seller
                        </Button>
                    </div>
                </div>
            </div>

            <div className="p-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[48px] text-foreground shadow-2xl shadow-indigo-500/20 relative overflow-hidden group">
                <Glob className="absolute -bottom-10 -right-10 w-40 h-40 opacity-20 group-hover:rotate-12 transition-transform duration-1000" />
                <div className="relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 opacity-70">VerteX Global</p>
                    <h4 className="text-2xl font-black mb-2">Hire Overseas</h4>
                    <p className="text-foreground/80 text-sm font-medium leading-relaxed">Our global network ensures you get the best talent regardless of location.</p>
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-3xl bg-background/90">
             <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-card border border-white/10 p-10 md:p-14 rounded-[56px] max-w-2xl w-full relative shadow-[0_0_100px_rgba(16,185,129,0.1)]"
            >
                <button onClick={() => setShowPaymentModal(false)} className="absolute top-10 right-10 text-muted-foreground hover:text-foreground transition-colors">
                    <ChevronRight className="w-8 h-8 rotate-180" />
                </button>

                <div className="flex items-center gap-6 mb-12">
                    <div className="w-20 h-20 bg-primary rounded-[32px] flex items-center justify-center text-foreground shadow-2xl shadow-emerald-500/30">
                        <Banknote className="w-10 h-10" />
                    </div>
                    <div>
                        <h3 className="text-3xl font-black text-foreground italic uppercase tracking-tighter">Manual Bank Check</h3>
                        <p className="text-muted-foreground text-xs font-black uppercase tracking-[0.4em]">Transaction Verification</p>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Bank Panel */}
                    <div className="bg-background border border-border rounded-[40px] p-10">
                        <div className="flex justify-between items-start mb-10 pb-6 border-b border-border">
                            <div>
                                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-2">Company Account</p>
                                <p className="text-2xl font-black text-foreground uppercase">{COMPANY_BANK_NAME}</p>
                                <p className="text-muted-foreground font-medium text-xs mt-1">{COMPANY_ACCOUNT_TITLE}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-2">Total Amount</p>
                                <p className="text-3xl font-black text-primary italic">${gig.pricing?.[selectedPlan]?.price || 120}.00</p>
                            </div>
                        </div>

                        <div className="p-6 bg-card/50 rounded-2xl flex items-center justify-between group border border-border">
                            <div className="min-w-0">
                                <p className="text-[10px] text-muted-foreground font-black uppercase mb-1">Account Number / IBAN</p>
                                <p className="text-foreground font-black font-mono text-lg tracking-widest">{COMPANY_ACCOUNT_NUM}</p>
                            </div>
                            <button onClick={() => navigator.clipboard.writeText(COMPANY_ACCOUNT_NUM)} className="p-4 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-foreground transition-all shadow-xl">
                                <Copy className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Form Panel */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-6">
                            <div className="bg-background/50 border border-border p-6 rounded-3xl opacity-50">
                                <p className="text-[10px] text-muted-foreground font-black uppercase mb-2 flex items-center gap-2 italic"><User className="w-3 h-3" /> Account Name</p>
                                <p className="text-foreground font-black uppercase tracking-wide truncate">{userData?.fullName || "Guest Account"}</p>
                            </div>
                            <div className="bg-background/50 border border-border p-6 rounded-3xl opacity-50">
                                <p className="text-[10px] text-muted-foreground font-black uppercase mb-2 flex items-center gap-2 italic"><Mail className="w-3 h-3" /> Registered Email</p>
                                <p className="text-foreground font-black truncate text-sm">{user?.email || "guest@vertex.com"}</p>
                            </div>
                        </div>
                        <div className="bg-background border border-primary/30 p-8 rounded-[40px] flex flex-col justify-center">
                            <label className="block text-[10px] text-primary font-black uppercase tracking-[0.2em] mb-4 italic">
                                <Hash className="w-4 h-4 inline mr-1" /> Transaction ID
                            </label>
                            <input 
                                type="text"
                                value={transactionId}
                                onChange={(e) => setTransactionId(e.target.value)}
                                className="w-full h-16 bg-card border border-white/10 rounded-2xl px-6 text-foreground font-black placeholder:text-muted-foreground placeholder:uppercase text-xl focus:outline-none focus:border-emerald-500 focus:shadow-[0_0_30px_rgba(16,185,129,0.1)] transition-all"
                                placeholder="TRX-XXXXXX"
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-12 flex gap-4">
                    <Button 
                        onClick={() => setShowPaymentModal(false)}
                        className="flex-1 h-16 bg-white/5 border border-white/10 text-muted-foreground hover:text-foreground rounded-[24px] font-black uppercase tracking-widest text-xs"
                    >
                        Back
                    </Button>
                    <Button 
                        onClick={confirmOrder}
                        disabled={isPlacingOrder || !transactionId}
                        className="flex-[2.5] h-16 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest rounded-[24px] shadow-2xl shadow-primary/20 text-xs disabled:opacity-20"
                    >
                        {isPlacingOrder ? "Initializing..." : "Place Final Order"}
                    </Button>
                </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}

// Icons
function Glob({ className }: { className?: string }) { return <Globe className={className} /> }
function RefreshCw({ className }: { className?: string }) { return <RefreshCwIcon className={className} /> }
function RefreshCwIcon({ className }: { className?: string}) { return <ChevronRight className={className} /> }
