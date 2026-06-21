"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
    const { user, userData, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push("/auth/login?redirect=/admin");
            } else if (userData?.role !== "admin") {
                router.push("/");
            }
        }
    }, [user, userData, loading, router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050914] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 animate-spin text-primary" />
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse">Initializing Protocol...</p>
                </div>
            </div>
        );
    }

    if (!user || userData?.role !== "admin") {
        return null;
    }

    return <>{children}</>;
}
