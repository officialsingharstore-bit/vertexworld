"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Mail, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
});

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    setError("");
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;

      // Create user document in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: data.email,
        fullName: data.fullName,
        role: null, // To be selected in the next step
        createdAt: new Date().toISOString(),
      });

      setIsLoading(false);
      router.push("/auth/role-selection");
    } catch (err: any) {
      setError(err.message || "Failed to create account. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />

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
            <h1 className="text-3xl font-bold text-foreground mb-3">Create your account</h1>
            <p className="text-muted-foreground">Join the world's most trusted freelance ecosystem.</p>
          </div>

          <div className="space-y-4 mb-8">
            <Button variant="outline" className="w-full h-12 rounded-xl border-slate-700 bg-card/50 text-foreground hover:bg-muted flex items-center justify-center gap-3">
              <Image src="https://www.google.com/favicon.ico" alt="Google" width={18} height={18} />
              Continue with Google
            </Button>
            <Button variant="outline" className="w-full h-12 rounded-xl border-slate-700 bg-card/50 text-foreground hover:bg-muted flex items-center justify-center gap-3 font-semibold">
              <Mail className="w-5 h-5" />
              Continue with LinkedIn
            </Button>
          </div>

          <div className="relative mb-8 text-center">
            <hr className="border-border" />
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-4 text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              or use email
            </span>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Full Name</label>
              <input 
                {...register("fullName")}
                className="w-full h-12 bg-background border border-border rounded-xl px-4 text-foreground focus:outline-none focus:border-emerald-500 transition-colors"
                placeholder="Enter your name"
              />
              {errors.fullName && <p className="text-red-400 text-xs mt-1">{(errors.fullName as any).message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Email Address</label>
              <input 
                {...register("email")}
                className="w-full h-12 bg-background border border-border rounded-xl px-4 text-foreground focus:outline-none focus:border-emerald-500 transition-colors"
                placeholder="name@company.com"
              />
              {errors.email && <p className="text-red-400 text-xs mt-1">{(errors.email as any).message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Password</label>
              <input 
                {...register("password")}
                type="password"
                className="w-full h-12 bg-background border border-border rounded-xl px-4 text-foreground focus:outline-none focus:border-emerald-500 transition-colors"
                placeholder="Min. 8 characters"
              />
              {errors.password && <p className="text-red-400 text-xs mt-1">{(errors.password as any).message}</p>}
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl mb-4">
                <p className="text-red-400 text-sm font-medium text-center">{error}</p>
              </div>
            )}

            <Button 
                type="submit" 
                className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-lg font-bold group mt-4 shadow-lg shadow-primary/20"
                disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Create Account"}
              {!isLoading && <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />}
            </Button>
          </form>

          <p className="mt-8 text-center text-muted-foreground text-sm">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-primary font-bold hover:underline">
              Log in
            </Link>
          </p>
        </div>

        <div className="mt-10 flex items-center justify-center gap-2 text-muted-foreground text-xs font-medium">
            <ShieldCheck className="w-4 h-4" />
            SECURED BY VERETX ESCROW & PROTECTION SYSTEM
        </div>
      </motion.div>
    </div>
  );
}


