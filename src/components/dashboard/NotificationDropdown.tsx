"use client";

import React, { useState, useEffect } from "react";
import { Bell, Check, X, Info, Zap, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc, orderBy, limit } from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";

export default function NotificationDropdown() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "notifications"),
      where("recipientId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Client-side sorting to bypass Index requirement
      data.sort((a: any, b: any) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });

      // Limit to 20 after sorting
      data = data.slice(0, 20);

      setNotifications(data);
      setUnreadCount(data.filter((n: any) => !n.read).length);
    }, (err) => {
      console.error("Notification listener error:", err);
    });

    return () => unsubscribe();
  }, [user]);

  const markAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, "notifications", id), { read: true });
    } catch (err) {
      console.error(err);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await deleteDoc(doc(db, "notifications", id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-4 h-4 bg-primary text-primary-foreground text-[9px] font-black flex items-center justify-center rounded-full border-2 border-slate-900 shadow-lg">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)} 
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-4 w-96 bg-card border border-border rounded-[32px] shadow-3xl overflow-hidden z-50 backdrop-blur-2xl"
            >
              <div className="p-6 border-b border-border flex items-center justify-between bg-background/20">
                <h3 className="text-foreground font-black uppercase text-xs tracking-widest italic">Signal Transmission</h3>
                {unreadCount > 0 && (
                    <span className="text-[10px] font-black bg-primary text-primary-foreground px-2 py-0.5 rounded-full uppercase tracking-tighter">
                        {unreadCount} New
                    </span>
                )}
              </div>

              <div className="max-h-[480px] overflow-y-auto custom-scrollbar bg-card/50">
                {notifications.length === 0 ? (
                  <div className="p-12 text-center">
                    <Zap className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">No Incoming Signals</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div 
                      key={n.id}
                      className={`p-6 border-b border-border hover:bg-white/5 transition-all relative group ${!n.read ? 'bg-primary/5' : ''}`}
                    >
                      <div className="flex gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${!n.read ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                           <Info className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-bold leading-relaxed mb-1 ${!n.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {n.message}
                          </p>
                          <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">
                            {n.createdAt ? new Date(n.createdAt.seconds * 1000).toLocaleTimeString() : 'Recent'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         {!n.read && (
                            <button 
                                onClick={() => markAsRead(n.id)}
                                className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 shadow-lg"
                            >
                                <Check className="w-3 h-3" />
                            </button>
                         )}
                         <button 
                            onClick={() => deleteNotification(n.id)}
                            className="p-2 bg-muted text-muted-foreground rounded-lg hover:bg-red-500 hover:text-foreground transition-colors"
                         >
                            <Trash2 className="w-3 h-3" />
                         </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {notifications.length > 0 && (
                <div className="p-4 bg-background/50 text-center border-t border-border">
                  <button className="text-[10px] font-black text-muted-foreground hover:text-primary uppercase tracking-[0.3em] transition-all"> Clear Active Buffers </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
