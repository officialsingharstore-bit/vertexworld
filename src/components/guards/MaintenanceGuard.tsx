"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";

export default function MaintenanceGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, userData } = useAuth();
  const [loading, setLoading] = useState(true);

  // COMPLETELY BYPASS FOR ADMIN ROUTES
  if (pathname.startsWith('/admin')) {
      return <>{children}</>;
  }

  // AUTHORIZED ADMIN EMAILS
  const ADMIN_EMAILS = [
    "www.stylewithsmile@gmail.com",
    "vertexworldz@gmail.com"
  ];

  useEffect(() => {
    // 0. EXEMPT ADMIN PATHS IMMEDIATELY
    if (pathname.startsWith('/admin')) {
        setLoading(false);
        return;
    }

    // 1. Listen to platform settings in real-time
    const unsub = onSnapshot(doc(db, "platform_settings", "config"), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const isMaintenanceOn = data.maintenanceMode;
        
        const isUserAdmin = user?.email && ADMIN_EMAILS.includes(user.email) || userData?.role === 'admin';
        const isAdminPath = pathname.startsWith('/admin');
        const isMaintenancePath = pathname === '/maintenance';

        // 2. BLOCK LOGIC
        if (isMaintenanceOn && !isUserAdmin && !isAdminPath && !isMaintenancePath) {
            router.push('/maintenance');
        } 
        
        // 3. UNBLOCK LOGIC (If maintenance is turned OFF)
        if (!isMaintenanceOn && isMaintenancePath) {
            router.push('/');
        }
      }
      setLoading(false);
    });

    return () => unsub();
  }, [user, pathname, router]);

  if (loading && pathname !== '/maintenance') {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
  }

  return <>{children}</>;
}
