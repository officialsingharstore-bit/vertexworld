"use client";

import { useEffect, useState } from "react";
import { 
  Users, 
  Search, 
  MoreHorizontal, 
  Mail, 
  Shield, 
  Calendar,
  CheckCircle2,
  XCircle,
  Filter,
  UserCheck,
  UserX
} from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const toggleUserRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === "Buyer" ? "Freelancer" : "Buyer";
    if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;
    
    try {
      await updateDoc(doc(db, "users", userId), {
        role: newRole
      });
    } catch (error) {
      console.error("Error updating role:", error);
      alert("Failed to update role.");
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to PERMANENTLY delete this user? This cannot be undone.")) return;
    try {
      await deleteDoc(doc(db, "users", userId));
    } catch (error) {
      alert("Failed to delete user.");
    }
  };

  const filteredUsers = users.filter(u => 
    u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-foreground italic uppercase tracking-tight mb-2">User Command</h1>
          <p className="text-muted-foreground text-sm font-medium">Global management of VerteX platform residents.</p>
        </div>
        <div className="flex gap-4">
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input 
                    type="text" 
                    placeholder="Search name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-[#0a0f1d] border border-border rounded-2xl pl-12 pr-6 py-3 text-sm text-foreground w-full md:w-80 focus:outline-none focus:border-emerald-500 transition-all shadow-xl"
                />
            </div>
            <Button variant="outline" className="border-border bg-card/50 text-muted-foreground gap-2 font-bold px-6 h-12 rounded-2xl">
                <Filter className="w-4 h-4" /> Filter
            </Button>
        </div>
      </div>

      <div className="bg-[#0a0f1d] border border-border rounded-[40px] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-background/50 border-b border-border">
                <th className="px-10 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Profile</th>
                <th className="px-8 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Role & Identity</th>
                <th className="px-8 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Joined Date</th>
                <th className="px-10 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr>
                    <td colSpan={4} className="px-10 py-20 text-center text-muted-foreground italic">Decrypting user database...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                    <td colSpan={4} className="px-10 py-20 text-center text-muted-foreground font-bold">No users found matching your search parameters.</td>
                </tr>
              ) : filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-card/40 transition-all group">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center font-black text-primary border border-slate-700 shadow-lg group-hover:border-primary/50 transition-all">
                        {u.fullName?.[0] || "U"}
                      </div>
                      <div>
                        <p className="text-foreground font-black text-sm mb-1">{u.fullName || "VerteX Resident"}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {u.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                        <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            u.role === "Freelancer" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                        }`}>
                            {u.role || "User"}
                        </span>
                        {u.role === "Freelancer" && <Shield className="w-3.5 h-3.5 text-primary" />}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs font-bold font-mono">
                        <Calendar className="w-3.5 h-3.5" />
                        {u.createdAt ? (new Date(u.createdAt.seconds * 1000).toLocaleDateString()) : "N/A"}
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                            onClick={() => toggleUserRole(u.id, u.role)}
                            className="p-3 bg-card hover:bg-primary text-muted-foreground hover:text-foreground rounded-xl transition-all shadow-lg hover:shadow-primary/20"
                            title="Toggle Role"
                        >
                            <UserCheck className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => deleteUser(u.id)}
                            className="p-3 bg-card hover:bg-red-500 text-muted-foreground hover:text-foreground rounded-xl transition-all shadow-lg hover:shadow-red-500/20"
                            title="Delete User"
                        >
                            <UserX className="w-4 h-4" />
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
