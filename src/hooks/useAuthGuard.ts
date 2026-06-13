"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";

/**
 * useAuthGuard — redirects to /auth/login if the user is not authenticated.
 * @param redirectTo  Path to redirect unauthenticated users to (default: /auth/login)
 * @returns { user, loading }
 */
export function useAuthGuard(redirectTo = "/auth/login") {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        // Preserve the page they tried to visit so we can redirect back after login
        const currentPath = window.location.pathname;
        router.replace(`${redirectTo}?redirect=${encodeURIComponent(currentPath)}`);
      } else {
        setUser(firebaseUser);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, redirectTo]);

  return { user, loading };
}
