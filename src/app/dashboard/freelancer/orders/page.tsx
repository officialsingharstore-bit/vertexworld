"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { FREELANCER_NAV } from "@/constants/navigation";
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  ArrowUpRight,
  ChevronRight,
  Calendar,
  DollarSign,
  UploadCloud,
  Eye,
  Star,
  RefreshCw,
  FileCheck,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { collection, query, where, onSnapshot, orderBy, getDocs, addDoc, serverTimestamp, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const statusConfig: Record<string, { color: string; bg: string; label: string; icon: React.ReactNode }> = {
  active: {
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    label: "In Progress",
    icon: <Clock className="w-3 h-3" />,
  },
  delivered: {
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    label: "Delivered",
    icon: <Eye className="w-3 h-3" />,
  },
  late: {
    color: "text-red-400",
    bg: "bg-red-500/10",
    label: "Late",
    icon: <AlertCircle className="w-3 h-3" />,
  },
  completed: {
    color: "text-primary",
    bg: "bg-primary/10",
    label: "Completed",
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
};

const filterOptions = ["All", "active", "delivered", "late", "completed"];

export default function FreelancerOrdersPage() {
  const { user, userData } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isDelivering, setIsDelivering] = useState(false);

  const handleContactBuyer = async () => {
    if (!user || !selectedOrder) return;

    try {
      const convsRef = collection(db, "conversations");
      const q = query(
        convsRef,
        where("participants", "array-contains", user.uid)
      );

      const querySnapshot = await getDocs(q);
      let existingConv = querySnapshot.docs.find((doc) =>
        doc.data().participants.includes(selectedOrder.buyerId)
      );

      let conversationId = existingConv?.id;

      if (!conversationId) {
        const newConv = await addDoc(convsRef, {
          participants: [user.uid, selectedOrder.buyerId],
          participantNames: {
            [user.uid]: userData?.fullName || "Freelancer",
            [selectedOrder.buyerId]: selectedOrder.buyerName || "Buyer",
          },
          lastMessage: `Inquiry regarding order for: ${selectedOrder.gigTitle}`,
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp(),
        });
        conversationId = newConv.id;
      }

      router.push(`/dashboard/freelancer/messages?conv=${conversationId}`);
    } catch (error) {
      console.error("Error starting conversation:", error);
      alert("Failed to reach client. Please try again.");
    }
  };

  const handleDeliver = async () => {
    if (!selectedOrder || isDelivering) return;
    
    setIsDelivering(true);
    try {
      const orderRef = doc(db, "orders", selectedOrder.id);
      await updateDoc(orderRef, {
        status: "delivered",
        updatedAt: serverTimestamp(),
        deliveredAt: serverTimestamp()
      });
      alert("Project delivered successfully! Awaiting buyer review.");
    } catch (error) {
      console.error("Error delivering order:", error);
      alert("Failed to deliver project. Please try again.");
    } finally {
      setIsDelivering(false);
    }
  };

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "orders"),
      where("freelancerId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Client-side sorting to bypass index requirement
      ordersData.sort((a: any, b: any) => {
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;
        return dateB - dateA;
      });

      setOrders(ordersData);
      if (ordersData.length > 0 && !selectedOrder) {
        setSelectedOrder(ordersData[0]);
      }
      setLoading(false);
    }, (err) => {
      console.error("Orders listener error:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const filtered =
    activeFilter === "All" ? orders : orders.filter((o) => o.status === activeFilter);

  return (
    <DashboardLayout navItems={FREELANCER_NAV} userRole="Freelancer">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2 italic">Order Management</h1>
            <p className="text-muted-foreground font-medium">Track your project milestones and deliveries in real-time.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-xl font-bold">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-primary text-sm">{orders.filter(o => o.status === "active").length} Active Now</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
          <div className="xl:col-span-2 space-y-4">
            <div className="flex gap-2 flex-wrap">
              {filterOptions.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`text-[10px] uppercase font-black tracking-widest px-4 py-2 rounded-xl transition-all border ${
                    activeFilter === f
                      ? "bg-primary border-emerald-500 text-foreground"
                      : "bg-card border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f === "active" ? "In Progress" : f}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {loading ? (
                <div className="py-20 text-center text-muted-foreground italic">Finding your orders...</div>
              ) : filtered.map((order) => {
                const sc = statusConfig[order.status] || statusConfig.active;
                const isSelected = selectedOrder?.id === order.id;
                
                return (
                  <button
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className={`w-full text-left p-5 rounded-3xl border transition-all duration-300 ${
                      isSelected
                        ? "bg-primary/10 border-primary/50 shadow-xl shadow-emerald-500/5"
                        : "bg-card border-border hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] mb-1">
                          ID: {order.id.substring(0, 8)}
                        </p>
                        <h3 className="text-foreground font-bold text-sm leading-tight">{order.gigTitle}</h3>
                      </div>
                      <ChevronRight className={`w-4 h-4 transition-all ${isSelected ? "text-primary translate-x-1" : "text-muted-foreground"}`} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-1 rounded-lg ${sc.bg} ${sc.color}`}>
                        {sc.icon} {sc.label}
                      </span>
                      <span className="text-primary font-black text-lg">${order.totalPrice || 0}</span>
                    </div>
                  </button>
                );
              })}

              {!loading && filtered.length === 0 && (
                <div className="text-center py-20 bg-card/30 border border-dashed border-border rounded-[40px]">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground font-bold">No orders found in this category.</p>
                </div>
              )}
            </div>
          </div>

          <div className="xl:col-span-3">
            {selectedOrder ? (
                <div className="bg-card border border-border rounded-[40px] overflow-hidden sticky top-8 shadow-2xl">
                    <div className="p-10 border-b border-border bg-background/20">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                            <div>
                                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.3em] mb-3">Project Workspace</p>
                                <h2 className="text-3xl font-black text-foreground leading-tight mb-4">{selectedOrder.gigTitle}</h2>
                                <div className="flex flex-wrap gap-4">
                                    <span className={`inline-flex items-center gap-2 text-[10px] font-black uppercase px-4 py-1.5 rounded-full ${statusConfig[selectedOrder.status]?.bg || "bg-muted"} ${statusConfig[selectedOrder.status]?.color || "text-foreground"}`}>
                                        {statusConfig[selectedOrder.status]?.icon}
                                        {statusConfig[selectedOrder.status]?.label || "Active"}
                                    </span>
                                    <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase px-4 py-1.5 rounded-full bg-muted text-muted-foreground">
                                        <Calendar className="w-3 h-3" />
                                        Standard 3-Day Delivery
                                    </span>
                                </div>
                            </div>
                            <div className="w-20 h-20 bg-primary rounded-[32px] flex items-center justify-center text-foreground text-2xl font-black shadow-lg shadow-primary/20">
                                {selectedOrder.buyerName?.[0].toUpperCase()}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 divide-x divide-slate-800 border-b border-border bg-background/40">
                        {[
                            { label: "Price", value: `$${selectedOrder.totalPrice || 0}`, icon: <DollarSign className="w-4 h-4" /> },
                            { label: "Plan", value: selectedOrder.plan, icon: <Star className="w-4 h-4" />, color: "text-primary" },
                            { label: "Client", value: selectedOrder.buyerName, icon: <User className="w-3 h-3" /> },
                        ].map((s) => (
                            <div key={s.label} className="p-8 text-center">
                                <div className="flex items-center justify-center gap-2 text-muted-foreground mb-2 text-[10px] font-black uppercase tracking-widest">
                                    {s.icon} {s.label}
                                </div>
                                <p className={`text-xl font-black uppercase tracking-tight ${s.color || "text-foreground"}`}>{s.value}</p>
                            </div>
                        ))}
                    </div>

                    <div className="p-10 space-y-10">
                        <div>
                            <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                                    <Clock className="w-4 h-4" />
                                </span>
                                Order Timeline
                            </h3>
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                                    <p className="text-sm text-muted-foreground font-bold">Buyer placed the order</p>
                                    <span className="text-[10px] text-muted-foreground font-black">START</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className={`w-2 h-2 rounded-full ${selectedOrder.status === 'delivered' ? 'bg-purple-500' : 'bg-orange-400 animate-pulse'}`}></div>
                                    <p className={`text-sm font-bold ${selectedOrder.status === 'delivered' ? 'text-muted-foreground' : 'text-foreground'}`}>
                                        {selectedOrder.status === 'delivered' ? 'Project has been delivered' : 'Project is currently in progress'}
                                    </p>
                                    <span className="text-[10px] text-muted-foreground font-black uppercase">
                                        {selectedOrder.status === 'delivered' ? 'Delivered' : 'Active Now'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 flex gap-4">
                            {selectedOrder.status === 'active' ? (
                                <Button 
                                    onClick={handleDeliver}
                                    disabled={isDelivering}
                                    className="flex-1 h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl gap-3 text-lg uppercase tracking-wider shadow-xl shadow-primary/20 group"
                                >
                                    <UploadCloud className="w-6 h-6 group-hover:-translate-y-1 transition-transform" />
                                    {isDelivering ? "Processing..." : "Deliver Solution"}
                                </Button>
                            ) : (
                                <div className="flex-1 p-4 bg-purple-500/10 border border-purple-500/20 rounded-2xl text-center">
                                    <p className="text-purple-400 font-bold uppercase tracking-widest text-sm">Delivery Submitted</p>
                                </div>
                            )}
                            <Button 
                                variant="outline" 
                                onClick={handleContactBuyer}
                                className="h-14 border-border bg-card/50 text-foreground hover:bg-muted rounded-2xl px-8"
                            >
                                <MessageSquare className="w-6 h-6" />
                            </Button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="h-full bg-card border border-border rounded-[40px] flex flex-col items-center justify-center text-muted-foreground p-20 text-center">
                    <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-8 border border-slate-700">
                        <Clock className="w-10 h-10 opacity-20" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-2">Workspace Empty</h3>
                    <p className="max-w-xs mx-auto text-sm leading-relaxed">Select an active project from the list to manage deliverables and start collaborating.</p>
                </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
