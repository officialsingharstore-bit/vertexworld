"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";

export default function MaintenanceGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // 1. COMPLETELY BYPASS FOR ADMIN & AUTH ROUTES (Instant Render)
  const isExempt = pathname.startsWith('/admin') || pathname.startsWith('/auth') || pathname === '/maintenance';
  
  // Hooks must be called in order
  const { user, userData, loading: authLoading } = useAuth();
  const [settingsLoading, setSettingsLoading] = useState(true);

  const ADMIN_EMAILS = [
    "www.stylewithsmile@gmail.com",
    "vertexworldz@gmail.com"
  ];

  useEffect(() => {
    if (isExempt) return;

    // Listen to platform settings in real-time
    const unsub = onSnapshot(doc(db, "platform_settings", "config"), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const isMaintenanceOn = data.maintenanceMode;
        
        const isUserAdmin = user?.email && ADMIN_EMAILS.includes(user.email) || (userData && (userData as any).role === 'admin');
        const isMaintenancePath = pathname === '/maintenance';

        // 2. BLOCK LOGIC
        if (isMaintenanceOn && !isUserAdmin && !isMaintenancePath) {
            router.push('/maintenance');
        } 
        
        // 3. UNBLOCK LOGIC (If maintenance is turned OFF)
        if (!isMaintenanceOn && isMaintenancePath) {
            router.push('/');
        }
      }
      setSettingsLoading(false);
    }, (err) => {
      console.error("Settings sync error:", err);
      setSettingsLoading(false);
    });

    return () => unsub();
  }, [user, userData, pathname, router, isExempt]);

  if (isExempt) {
      return <>{children}</>;
  }

  // During initial load, show a subtle loading state for protected pages only
  if ((authLoading || settingsLoading) && pathname !== '/maintenance') {
      return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse">Initializing Neural Link...</p>
        </div>
      );
  }

  return <>{children}</>;
}
