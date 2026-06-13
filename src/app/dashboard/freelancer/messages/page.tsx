"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ChatWindow from "@/components/chat/ChatWindow";
import { FREELANCER_NAV } from "@/constants/navigation";
import { Search } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, orderBy, addDoc, serverTimestamp, doc, updateDoc, getDoc, deleteDoc, arrayUnion, getDocs, writeBatch, arrayRemove } from "firebase/firestore";
import { useSearchParams } from "next/navigation";

// ── PROFILE NAME RESOLVER ──
function ProfileName({ uid, fallback, className }: { uid: string, fallback: string, className?: string }) {
  const [name, setName] = useState(fallback);

  useEffect(() => {
    const fetchName = async () => {
      if (!uid || uid === "undefined") return;
      try {
        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists() && userDoc.data().fullName) {
          setName(userDoc.data().fullName);
        }
      } catch (err) {
        console.error("Error resolving name:", err);
      }
    };
    fetchName();
  }, [uid, fallback]);

  return <span className={className}>{name}</span>;
}

export default function FreelancerMessagesPage() {
  const { user, userData } = useAuth();
  const searchParams = useSearchParams();
  const initialConvId = searchParams.get("conv");

  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConv, setActiveConv] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Conversations
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "conversations"),
      where("participants", "array-contains", user.uid),
      orderBy("updatedAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const convs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setConversations(convs);
      
      if (initialConvId && !activeConv) {
        const target = convs.find(c => c.id === initialConvId);
        if (target) setActiveConv(target);
      } else if (!activeConv && convs.length > 0) {
        setActiveConv(convs[0]);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, initialConvId]);

  // 2. Sync Messages
  useEffect(() => {
    if (!activeConv) return;

    const q = query(
      collection(db, "conversations", activeConv.id, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [activeConv]);

  const handleSendMessage = async (text: string, type: string = "text") => {
    if (!user || !activeConv) return;

    try {
      const msgRef = collection(db, "conversations", activeConv.id, "messages");
      await addDoc(msgRef, {
        text,
        type,
        senderId: user.uid,
        senderName: userData?.fullName || user.displayName || "Elite Freelancer",
        createdAt: serverTimestamp()
      });

      const convRef = doc(db, "conversations", activeConv.id);
      await updateDoc(convRef, {
        lastMessage: type === "text" ? text : `[Sent ${type}]`,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleDeleteMessage = async (messageId: string, forEveryone: boolean) => {
    if (!user || !activeConv) return;

    try {
      const msgRef = doc(db, "conversations", activeConv.id, "messages", messageId);
      if (forEveryone) {
        await deleteDoc(msgRef);
        
        // Update last message
        const convRef = doc(db, "conversations", activeConv.id);
        await updateDoc(convRef, {
          lastMessage: "Message deleted",
          updatedAt: serverTimestamp()
        });
      } else {
        await updateDoc(msgRef, {
          deletedFor: arrayUnion(user.uid)
        });
      }
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  const handleClearChat = async () => {
    if (!user || !activeConv) return;
    if (!confirm("Clear all messages? This action is permanent.")) return;

    try {
        const msgsRef = collection(db, "conversations", activeConv.id, "messages");
        const snapshot = await getDocs(msgsRef);
        const batch = writeBatch(db);
        snapshot.docs.forEach(doc => batch.delete(doc.ref));
        await batch.commit();

        await updateDoc(doc(db, "conversations", activeConv.id), {
            lastMessage: "Messages cleared",
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error("Error clearing chat:", error);
    }
  };

  const handleArchiveChat = async () => {
    if (!user || !activeConv) return;
    try {
        await updateDoc(doc(db, "conversations", activeConv.id), {
            status: "archived",
            updatedAt: serverTimestamp()
        });
        alert("Conversation archived.");
    } catch (error) {
        console.error("Error archiving:", error);
    }
  };

  const handleBlockUser = async () => {
    if (!user || !activeConv) return;
    const otherId = getOtherParticipantId(activeConv);
    const isCurrentlyBlocked = userData?.blockedUsers?.includes(otherId);
    
    if (!confirm(`${isCurrentlyBlocked ? 'Unblock' : 'Block'} this user?`)) return;

    try {
        await updateDoc(doc(db, "users", user.uid), {
            blockedUsers: isCurrentlyBlocked ? arrayRemove(otherId) : arrayUnion(otherId)
        });
        alert(`User ${isCurrentlyBlocked ? 'unblocked' : 'blocked'}.`);
    } catch (error) {
        console.error("Error toggling block:", error);
    }
  };


  const getOtherParticipantId = (conv: any) => {
    if (!user) return "";
    return conv.participants.find((id: string) => id !== user.uid);
  };

  const getOtherParticipantNameFallback = (conv: any) => {
    const otherId = getOtherParticipantId(conv);
    return conv.participantNames?.[otherId] || "User";
  };

  return (
    <DashboardLayout navItems={FREELANCER_NAV} userRole="Freelancer">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="hidden lg:flex flex-col bg-card border border-border rounded-[32px] overflow-hidden h-[calc(100vh-160px)]">
            <div className="p-6 border-b border-border">
                <h2 className="text-xl font-bold text-foreground mb-6 uppercase tracking-tighter italic">Neural Comms</h2>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input 
                        className="w-full h-11 bg-background border border-border rounded-xl pl-10 pr-4 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-all font-medium"
                        placeholder="Scan channels..."
                    />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-border">
                {loading ? (
                    <div className="p-8 text-center text-muted-foreground font-bold italic animate-pulse">Syncing...</div>
                ) : conversations.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground text-sm font-bold uppercase tracking-widest">Archive Empty.</div>
                ) : (
                    conversations.map((conv) => {
                        const otherId = getOtherParticipantId(conv);
                        const otherNameFallback = getOtherParticipantNameFallback(conv);
                        return (
                            <div 
                                key={conv.id} 
                                onClick={() => setActiveConv(conv)}
                                className={`p-6 flex gap-4 hover:bg-muted/30 cursor-pointer transition-all ${
                                    activeConv?.id === conv.id ? "bg-primary/10 border-l-4 border-primary" : ""
                                }`}
                            >
                                <div className="relative">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black italic transition-all ${
                                        activeConv?.id === conv.id ? "bg-primary text-primary-foreground" : "bg-muted text-primary"
                                    }`}>
                                        {otherNameFallback[0]}
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-1">
                                        <ProfileName 
                                            uid={otherId} 
                                            fallback={otherNameFallback} 
                                            className={`text-sm font-black uppercase italic truncate ${activeConv?.id === conv.id ? "text-primary" : "text-foreground"}`}
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground truncate font-bold uppercase tracking-widest opacity-60">{conv.lastMessage}</p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>

        <div className="lg:col-span-3">
            {activeConv ? (
                <ChatWindow 
                    key={activeConv.id}
                    activeContact={{
                        name: getOtherParticipantNameFallback(activeConv),
                        initials: getOtherParticipantNameFallback(activeConv)[0],
                        online: true,
                        id: getOtherParticipantId(activeConv)
                    }} 
                    messages={messages
                        .filter(m => !m.deletedFor?.includes(user?.uid))
                        .map(m => ({
                        ...m,
                        isSender: m.senderId === user?.uid,
                        time: m.createdAt?.toDate ? m.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"
                    }))}
                    onSendMessage={handleSendMessage}
                    onDeleteMessage={handleDeleteMessage}
                    onClearChat={handleClearChat}
                    onArchiveChat={handleArchiveChat}
                    onBlockUser={handleBlockUser}
                    isBlocked={userData?.blockedUsers?.includes(getOtherParticipantId(activeConv))}
                />
            ) : (
                <div className="h-full bg-card border border-border rounded-[48px] flex items-center justify-center text-muted-foreground shadow-2xl">
                    <div className="text-center">
                        <div className="w-20 h-20 bg-muted rounded-3xl flex items-center justify-center text-muted-foreground mx-auto mb-6 border border-border">
                            <Search className="w-10 h-10" />
                        </div>
                        <p className="font-black text-xl mb-2 text-foreground uppercase italic tracking-tighter">Strategic Workspace</p>
                        <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Select a neural node to begin transmission.</p>
                    </div>
                </div>
            )}
        </div>
      </div>
    </DashboardLayout>
  );
}
