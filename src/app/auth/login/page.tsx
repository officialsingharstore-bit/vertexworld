"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Mail, ArrowRight, ShieldCheck, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/auth/role-selection";
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    setAuthError("");
    try {
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      // Check if user has a role in Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (user.email === "vertexworldz@gmail.com") {
          router.push("/admin");
          return;
        }

        if (userData.role) {
          // Priority Redirect for Admin
          if (userData.role === "admin") {
            router.push("/admin");
            return;
          }
          
          // Selection for Freelancer/Buyer
          const target = userData.role === "freelancer" ? "/dashboard/freelancer" : "/dashboard/buyer";
          router.push(target);
          return;
        }
      }

      // If no role found, go to standard redirect (which defaults to role-selection)
      router.push(redirectTo);
    } catch (err: any) {
      setAuthError("Invalid email or password. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 -translate-x-1/2" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <Link href="/" className="flex items-center gap-2 justify-center mb-12">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center font-bold text-foreground text-xl">V</div>
          <span className="text-2xl font-bold tracking-tight text-foreground">VerteX</span>
        </Link>

        <div className="bg-card/50 backdrop-blur-xl border border-border p-8 rounded-[32px] shadow-2xl">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-foreground mb-3">Welcome back</h1>
            <p className="text-muted-foreground">Log in to your account to continue.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  {...register("email")}
                  className="w-full h-12 bg-background border border-border rounded-xl pl-11 pr-4 text-foreground focus:outline-none focus:border-emerald-500 transition-colors"
                  placeholder="name@company.com"
                />
              </div>
              {errors.email && <p className="text-red-400 text-xs mt-1">{(errors.email as any).message}</p>}
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-muted-foreground">Password</label>
                <Link href="#" className="text-xs text-primary font-bold hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  {...register("password")}
                  type="password"
                  className="w-full h-12 bg-background border border-border rounded-xl pl-11 pr-4 text-foreground focus:outline-none focus:border-emerald-500 transition-colors"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{(errors.password as any).message}</p>}
            </div>

            {authError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-red-400 text-sm font-medium text-center">{authError}</p>
              </div>
            )}

            <Button 
                type="submit" 
                className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-lg font-bold group mt-4 shadow-lg shadow-primary/20"
                disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Log In"}
              {!isLoading && <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />}
            </Button>
          </form>

          <div className="relative my-8 text-center">
            <hr className="border-border" />
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-4 text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              or continue with
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="h-12 rounded-xl border-slate-700 bg-card/50 text-foreground hover:bg-muted flex items-center justify-center gap-3">
              <Image src="https://www.google.com/favicon.ico" alt="Google" width={18} height={18} />
              Google
            </Button>
            <Button variant="outline" className="h-12 rounded-xl border-slate-700 bg-card/50 text-foreground hover:bg-muted flex items-center justify-center gap-3 font-semibold">
              <Mail className="w-5 h-5" />
              LinkedIn
            </Button>
          </div>

          <p className="mt-8 text-center text-muted-foreground text-sm">
            Don't have an account?{" "}
            <Link href="/auth/signup" className="text-primary font-bold hover:underline">
              Sign up
            </Link>
          </p>
        </div>

        <div className="mt-10 flex items-center justify-center gap-2 text-muted-foreground text-xs font-medium">
            <ShieldCheck className="w-4 h-4" />
            PROTECTED BY VERETX SECURITY
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <LoginForm />
    </Suspense>
  );
}
