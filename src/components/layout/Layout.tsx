import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Zap, 
  Palette, 
  Video, 
  Mic2, 
  Search, 
  BarChart3, 
  Briefcase, 
  FileTerminal,
  Menu,
  X,
  User,
  Settings,
  Bell,
  LogOut,
  ShieldCheck,
  Crown
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../../context/AuthContext";

const baseNavItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Zap, label: "Contenu Viral", path: "/viral" },
  { icon: Palette, label: "Design AI", path: "/design" },
  { icon: Video, label: "Vidéo", path: "/video" },
  { icon: Mic2, label: "Voix AI", path: "/voice" },
  { icon: Search, label: "Analyse Design", path: "/analyze" },
  { icon: BarChart3, label: "Channel Analyzer", path: "/channel" },
  { icon: Briefcase, label: "Business", path: "/business" },
  { icon: FileTerminal, label: "Prompt Gen", path: "/prompts" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isLoading } = useAuth();

  const isAuthPage = location.pathname === "/login" || location.pathname === "/signup";

  React.useEffect(() => {
    if (!isLoading && !user && !isAuthPage) {
      navigate("/login");
    }
  }, [user, isLoading, isAuthPage, navigate]);

  if (isLoading) return <div className="h-screen bg-slate-950 flex items-center justify-center">Chargement...</div>;

  if (isAuthPage) return <>{children}</>;

  if (!user) return null;

  const navItems = [...baseNavItems];
  // Force admin in UI if email matches (Client-side fallback)
  if (user?.role === "admin" || user?.email?.toLowerCase().trim() === "henridesign581@gmail.com") {
    if (!navItems.find(i => i.path === "/admin")) {
      navItems.push({ icon: ShieldCheck, label: "Admin", path: "/admin" });
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#020617] text-slate-100">
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
            className="fixed inset-y-0 left-0 z-50 w-72 bg-slate-900/80 backdrop-blur-xl border-r border-white/5 lg:relative"
          >
            <div className="flex flex-col h-full">
              <div className="p-6 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center font-bold text-xl shadow-lg shadow-brand-primary/20">
                    C
                  </div>
                  <span className="font-bold text-xl tracking-tight">Creator Studio</span>
                </Link>
                <button 
                  onClick={() => setIsSidebarOpen(false)}
                  className="lg:hidden text-slate-400 hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>

              <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto custom-scrollbar">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                        isActive 
                          ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/10" 
                          : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
                      )}
                    >
                      <item.icon size={20} className={cn(isActive ? "text-white" : "group-hover:text-brand-primary transition-colors")} />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-white/5">
                <div className="p-4 mb-4 rounded-2xl bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 border border-brand-primary/20 text-center">
                  <Crown className="mx-auto mb-2 text-brand-primary" size={24} />
                  <p className="text-xs font-bold uppercase tracking-widest mb-1">
                    {user?.email?.toLowerCase().trim() === "henridesign581@gmail.com" 
                      ? "Lifetime Access" 
                      : (user?.plan === "free" ? "Plan Gratuit" : "Premium Access")}
                  </p>
                  {(user?.plan === "free" && user?.email?.toLowerCase().trim() !== "henridesign581@gmail.com") && (
                    <Link to="/pricing" className="text-[10px] text-brand-primary hover:underline font-bold uppercase">Passer Pro</Link>
                  )}
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 group relative">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                    <User size={20} className="text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={cn(
                        "text-sm font-medium truncate",
                        user?.email?.toLowerCase().trim() === "henridesign581@gmail.com" ? "text-yellow-400 font-bold" : ""
                      )}>
                        {user?.email}
                      </p>
                      {(user?.role === "admin" || user?.email?.toLowerCase().trim() === "henridesign581@gmail.com") && (
                        <span className="bg-red-500/20 text-red-400 text-[8px] font-bold px-1 rounded uppercase border border-red-500/30">
                          Admin
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 truncate capitalize">
                      {user?.email?.toLowerCase().trim() === "henridesign581@gmail.com" ? "Lifetime" : user?.plan} Plan
                    </p>
                  </div>
                  <button 
                    onClick={logout}
                    className="text-slate-400 hover:text-red-500 transition-colors"
                    title="Logout"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Navbar */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-slate-950/50 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-4">
            {!isSidebarOpen && (
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <Menu size={24} />
              </button>
            )}
            <h1 className="font-semibold text-lg breadcrumbs capitalize flex items-center gap-2">
              {navItems.find(i => i.path === location.pathname)?.label || (location.pathname === "/pricing" ? "Abonnement" : "Creator Studio")}
              {(user?.role === "admin" || user?.email?.toLowerCase().trim() === "henridesign581@gmail.com") && (
                <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse shadow-lg shadow-red-500/20">
                  ADMIN
                </span>
              )}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {(user?.plan === "free" && user?.email?.toLowerCase().trim() !== "henridesign581@gmail.com") && (
              <Link to="/pricing" className="hidden lg:flex items-center gap-2 px-4 py-2 bg-yellow-500/10 text-yellow-500 text-xs font-bold rounded-full border border-yellow-500/20 hover:bg-yellow-500/20 transition-all uppercase tracking-widest">
                <Crown size={14} /> Go Premium
              </Link>
            )}
            <div className="hidden md:flex items-center h-10 px-4 rounded-full bg-white/5 border border-white/10 group focus-within:border-brand-primary/50 transition-all">
              <Search size={18} className="text-slate-500 group-focus-within:text-brand-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-transparent border-none outline-none px-3 text-sm w-48 placeholder:text-slate-600"
              />
            </div>
            <button className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-all relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-brand-primary rounded-full border-2 border-slate-950"></span>
            </button>
            <div className="h-8 w-[1px] bg-white/5 mx-2"></div>
            <button className="px-4 py-2 bg-brand-primary hover:bg-brand-primary/90 text-white text-sm font-bold rounded-full transition-all shadow-lg shadow-brand-primary/20 uppercase tracking-tighter">
              PUBLIER
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-7xl mx-auto h-full"
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
