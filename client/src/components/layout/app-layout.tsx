import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  Activity, Users, LayoutDashboard, CalendarClock, PieChart,
  LogOut, Bell, Search, Menu, Stethoscope
} from "lucide-react";
import { useAuth, useLogout } from "@/hooks/use-auth";
import { useLoadBalanceSuggestions } from "@/hooks/use-dashboard";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/queue", label: "Live Queue", icon: Activity },
  { href: "/intake", label: "Patient Intake", icon: Users },
  { href: "/doctors", label: "Doctors", icon: Stethoscope },
  { href: "/analytics", label: "Analytics", icon: PieChart },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { data: user } = useAuth();
  const { mutate: logout } = useLogout();
  const { data: suggestions } = useLoadBalanceSuggestions();
  
  const hasAlerts = suggestions && suggestions.length > 0;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border/50 bg-white shadow-sm z-10">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-md shadow-primary/20">
            <Activity size={18} strokeWidth={2.5} />
          </div>
          <span className="font-bold text-lg tracking-tight">ClinicOS</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 mt-4">
          {NAV_ITEMS.map((item) => {
            const isActive = location === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-200
                  ${isActive 
                    ? 'bg-primary/10 text-primary hover:bg-primary/15' 
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                  }
                `}
              >
                <item.icon size={18} className={isActive ? 'text-primary' : 'text-slate-400'} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-border/50">
          <div className="flex items-center gap-3 px-2 py-2">
            <Avatar className="h-9 w-9 border border-border">
              <AvatarFallback className="bg-primary/5 text-primary text-xs">
                {user?.username?.substring(0,2).toUpperCase() || 'AD'}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-semibold leading-none">{user?.username}</span>
              <span className="text-xs text-muted-foreground">Admin</span>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="ml-auto text-slate-400 hover:text-red-500 hover:bg-red-50"
              onClick={() => logout()}
            >
              <LogOut size={16} />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-border/40 bg-white/80 backdrop-blur-md z-10 sticky top-0">
          <div className="flex items-center gap-4 flex-1">
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu size={20} />
            </Button>
            
            <div className="relative w-full max-w-md hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <Input 
                placeholder="Search patients..." 
                className="pl-9 bg-slate-50/50 border-slate-200 focus-visible:ring-primary/20 rounded-full h-9"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-slate-500 hover:bg-slate-100 rounded-full">
                  <Bell size={18} />
                  {hasAlerts && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border-2 border-white"></span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0 rounded-2xl shadow-xl border-border/50" align="end">
                <div className="p-4 border-b border-border/50 bg-slate-50 rounded-t-2xl">
                  <h4 className="font-semibold text-sm">System Alerts</h4>
                </div>
                <div className="p-2 max-h-[300px] overflow-auto">
                  {!hasAlerts ? (
                    <div className="p-4 text-center text-sm text-slate-500">No new alerts</div>
                  ) : (
                    suggestions.map((s, i) => (
                      <div key={i} className="p-3 bg-orange-50/50 text-orange-800 rounded-xl text-sm mb-2 border border-orange-100">
                        <span className="font-semibold block mb-1">Load Imbalance Detected</span>
                        {s.reason}
                      </div>
                    ))
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 md:p-8 bg-[#F8FAFC]">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
