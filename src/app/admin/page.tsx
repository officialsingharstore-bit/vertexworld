"use client";

import { 
  BarChart, 
  Users, 
  Gem, 
  ArrowUpRight, 
  ArrowDownRight,
  TrendingUp,
  Activity,
  DollarSign
} from "lucide-react";

export default function AdminOverview() {
  const stats = [
    { label: "Total Revenue", value: "$124,500", trend: "+12.5%", color: "text-primary" },
    { label: "Active Users", value: "8,420", trend: "+3.2%", color: "text-blue-500" },
    { label: "Platform Gigs", value: "15,200", trend: "+8.4%", color: "text-primary" },
    { label: "Company Fee (5%)", value: "$6,225", trend: "+10.2%", color: "text-primary" },
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-black text-foreground tracking-tight mb-2 uppercase italic">Mission Control</h1>
            <p className="text-muted-foreground text-sm font-medium">Real-time analytical overview of the VerteX ecosystem.</p>
        </div>
        <div className="flex gap-4">
            <div className="bg-card border border-border rounded-xl px-6 py-2 flex flex-col justify-center">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Server Load</p>
                <p className="text-foreground font-black">2.4%</p>
            </div>
            <div className="bg-primary rounded-xl px-6 py-2 flex flex-col justify-center shadow-lg shadow-primary/20">
                <p className="text-[10px] font-bold text-primary-foreground/70 uppercase tracking-widest">Uptime</p>
                <p className="text-primary-foreground font-black italic">99.99%</p>
            </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
            <div key={i} className="bg-card border border-border p-8 rounded-[32px] hover:border-primary/30 transition-all group overflow-hidden relative">
                <div className="relative z-10">
                    <p className="text-muted-foreground text-xs font-bold uppercase tracking-[0.2em] mb-4">{stat.label}</p>
                    <div className="flex items-end justify-between">
                        <h2 className="text-3xl font-black text-foreground italic">{stat.value}</h2>
                        <div className={`flex items-center gap-1 text-xs font-bold ${stat.color} bg-primary/10 px-2 py-1 rounded-lg`}>
                            <ArrowUpRight className="w-3 h-3" />
                            {stat.trend}
                        </div>
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent group-hover:via-primary transition-all"></div>
            </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 bg-card border border-border rounded-[40px] overflow-hidden">
            <div className="p-8 border-b border-border/50 flex items-center justify-between">
                <h3 className="text-xl font-bold text-foreground uppercase tracking-tighter">Financial Stream</h3>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-primary rounded-full animate-pulse"></span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Live Updates</span>
                </div>
            </div>
            <div className="p-0 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-background/50">
                            <th className="px-8 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Transaction ID</th>
                            <th className="px-8 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Value</th>
                            <th className="px-8 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Fee (5%)</th>
                            <th className="px-8 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                        {[
                            { id: "TX-90421", val: "$1,200.00", fee: "$60.00", status: "Escrow" },
                            { id: "TX-90422", val: "$450.00", fee: "$22.50", status: "Released" },
                            { id: "TX-90423", val: "$3,000.00", fee: "$150.00", status: "Escrow" },
                            { id: "TX-90424", val: "$850.00", fee: "$42.50", status: "Pending" },
                        ].map((tx, i) => (
                            <tr key={i} className="hover:bg-background/40 transition-all">
                                <td className="px-8 py-5 text-sm text-muted-foreground font-mono">#{tx.id}</td>
                                <td className="px-8 py-5 text-sm text-foreground font-black italic">{tx.val}</td>
                                <td className="px-8 py-5 text-sm text-primary font-black italic">{tx.fee}</td>
                                <td className="px-8 py-5">
                                    <span className={`text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest ${
                                        tx.status === "Escrow" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : "bg-primary/10 text-primary border border-primary/20"
                                    }`}>
                                        {tx.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        {/* System Activity */}
        <div className="bg-card border border-border rounded-[40px] p-8">
            <h3 className="text-xl font-bold text-foreground uppercase tracking-tighter mb-8 italic">System Radar</h3>
            <div className="space-y-8">
                {[
                    { label: "New User Registered", time: "2m ago", icon: <Users className="w-4 h-4" /> },
                    { label: "Withdrawal Approved", time: "12m ago", icon: <DollarSign className="w-4 h-4" /> },
                    { label: "Gig Flagged for Review", time: "45m ago", icon: <Activity className="w-4 h-4" /> },
                    { label: "New Project Posted", time: "1h ago", icon: <TrendingUp className="w-4 h-4" /> },
                ].map((log, i) => (
                    <div key={i} className="flex gap-4">
                        <div className="w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center text-primary shrink-0">
                            {log.icon}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-foreground">{log.label}</p>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{log.time}</p>
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-12 p-6 bg-primary/5 border border-primary/20 rounded-3xl">
                <p className="text-primary text-[10px] font-black uppercase tracking-widest mb-2 italic">Platform Health</p>
                <div className="flex items-center justify-between text-foreground font-bold">
                    <span className="text-[10px] uppercase tracking-tighter">Performance Score</span>
                    <span className="italic">98.2%</span>
                </div>
                <div className="mt-3 h-1.5 w-full bg-background rounded-full overflow-hidden">
                    <div className="h-full w-[98%] bg-primary"></div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
