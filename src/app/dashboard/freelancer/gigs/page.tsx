"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { FREELANCER_NAV } from "@/constants/navigation";
import { Button } from "@/components/ui/button";
import { Plus, MoreVertical, Star, Clock, Eye, Trash2 } from "lucide-react";
import Link from "next/link";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";

export default function MyGigsPage() {
  const [gigs, setGigs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGigs = async () => {
      if (!auth.currentUser) return;
      try {
        const q = query(
          collection(db, "gigs"),
          where("freelancerId", "==", auth.currentUser.uid)
        );
        const querySnapshot = await getDocs(q);
        const gigsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setGigs(gigsData);
      } catch (error) {
        console.error("Error fetching gigs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGigs();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this gig?")) {
      try {
        await deleteDoc(doc(db, "gigs", id));
        setGigs(gigs.filter(gig => gig.id !== id));
      } catch (error) {
        console.error("Error deleting gig:", error);
      }
    }
  };

  return (
    <DashboardLayout navItems={FREELANCER_NAV} userRole="Freelancer">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">My Gigs</h1>
            <p className="text-muted-foreground">Manage and optimize your active services.</p>
          </div>
          <Button asChild className="h-12 px-6 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold gap-2">
            <Link href="/dashboard/freelancer/gigs/create">
              <Plus className="w-5 h-5" />
              Create New Gig
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-card border border-border rounded-3xl h-64 animate-pulse"></div>
            ))}
          </div>
        ) : gigs.length === 0 ? (
          <div className="bg-card border border-border rounded-[32px] p-20 text-center">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6 text-muted-foreground">
                <Plus className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-3">No Gigs Found</h3>
            <p className="text-muted-foreground mb-8 max-w-sm mx-auto">You haven't created any gigs yet. Start offering your professional services today!</p>
            <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 h-12 rounded-xl font-bold">
                <Link href="/dashboard/freelancer/gigs/create">Create Your First Gig</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gigs.map((gig) => (
              <div key={gig.id} className="bg-card border border-border rounded-3xl overflow-hidden group hover:border-primary/50 transition-all flex flex-col">
                <div className="relative h-48">
                  <Link href={`/marketplace/gigs/${gig.id}`}>
                    <img src={gig.images?.[0] || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=2072"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer" />
                  </Link>
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button className="w-8 h-8 bg-card/80 backdrop-blur-md rounded-lg flex items-center justify-center text-foreground" onClick={() => handleDelete(gig.id)}>
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <span className="px-3 py-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full uppercase tracking-wider">{gig.category}</span>
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <Link href={`/marketplace/gigs/${gig.id}`}>
                    <h3 className="text-foreground font-bold text-lg mb-3 line-clamp-2 hover:text-primary cursor-pointer">{gig.title}</h3>
                  </Link>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="w-4 h-4 fill-yellow-500" />
                      <span className="text-xs font-bold">5.0</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span className="text-xs font-medium">{gig.pricing?.basic?.delivery || "3 Days"}</span>
                    </div>
                  </div>
                  <div className="mt-auto pt-6 border-t border-border flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Eye className="w-4 h-4" />
                      <span className="text-xs font-bold">0 Views</span>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Starting At</p>
                      <p className="text-primary font-extrabold text-xl">${gig.pricing?.basic?.price || "50"}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
