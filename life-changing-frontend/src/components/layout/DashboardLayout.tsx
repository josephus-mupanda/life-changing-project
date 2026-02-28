import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  PieChart,
  Settings,
  LogOut,
  Menu,
  Heart,
  Target,
  FileText,
  Calendar,
  BookOpen,
  DollarSign,
  User,
  Globe,
  Briefcase,
  Phone,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardHeader } from "./DashboardHeader";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserType } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import { motion } from "framer-motion";
import { useProfile } from "@/lib/profile-context";

export function DashboardLayout() {
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { currentProfile, isLoading: profileLoading } = useProfile();

  // Show loading while profile is loading
  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600 mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // If no profile, don't render dashboard (RouteGuard will redirect)
  if (!currentProfile) {
    return null;
  }

  const currentUserType = user?.userType || UserType.ADMIN;

  const getNavItems = () => {
    switch (currentUserType) {
      case UserType.BENEFICIARY:
        return [
          { href: "/beneficiary", label: "My Journey", icon: LayoutDashboard },
          { href: "/beneficiary/goals", label: "My Goals", icon: Target },
          { href: "/beneficiary/tracking", label: "Weekly Tracking", icon: Calendar },
          { href: "/beneficiary/contacts", label: "Emergency Contacts", icon: Phone },
          { href: "/beneficiary/documents", label: "My Documents", icon: FileText },
          { href: "/beneficiary/profile", label: "Profile", icon: User },
        ];
      case UserType.DONOR:
        return [
          { href: "/donor", label: "Impact Overview", icon: LayoutDashboard },
          { href: "/donor/donations", label: "My Donations", icon: Heart },
          { href: "/donor/reports", label: "Impact Reports", icon: PieChart },
          { href: "/donor/profile", label: "Profile", icon: User },
        ];
      case UserType.ADMIN:
      default:
        return [
          { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
          { href: "/admin/beneficiaries", label: "Beneficiaries", icon: Users },
          { href: "/admin/programs", label: "Programs", icon: Target },
          { href: "/admin/donors", label: "Donors", icon: Heart },
          { href: "/admin/donations", label: "Donations", icon: DollarSign },
          { href: "/admin/financial", label: "Financial", icon: PieChart },
          { href: "/admin/reports", label: "Reports", icon: PieChart },
          { href: "/admin/users", label: "Manage Users", icon: Users },
          { href: "/admin/profile", label: "Profile", icon: User },
        ];
    }
  };

  const navItems = getNavItems();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'U';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      {/* Top Header - fixed on scroll */}
      <DashboardHeader onMobileMenuClick={() => setMobileSheetOpen(true)} />

      {/* Spacer for fixed header */}
      <div className="h-16 w-full shrink-0" />

      {/* Main layout container */}
      <div className="flex flex-1">
        {/* Sidebar for Desktop - Now Fixed */}
        <aside className="hidden md:flex w-64 flex-col border-r bg-gradient-to-b from-[#2c5f56] to-[#1e4139] text-white fixed top-0 bottom-0 shadow-2xl z-40 overflow-hidden pt-16">
          {/* Top Section */}

          {/* Scrollable Nav Area */}
          <nav className="flex-1 px-3 space-y-6 py-8 overflow-y-auto min-h-0 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href || location.pathname.startsWith(`${item.href}/`);
              return (
                <motion.div
                  key={item.href}
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link
                    to={item.href}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                      ? "bg-white/10 text-white shadow-lg ring-1 ring-white/20"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                      }`}
                  >
                    <item.icon className="w-5 h-5 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          {/* Footer Section - Stuck to bottom */}
          <div className="p-4 border-t border-white/10 bg-[#1e4139]/50 backdrop-blur-sm shrink-0">
            <Link
              to="/profile"
              className="flex items-center gap-3 mb-4 px-2 hover:bg-white/5 p-2 rounded-xl transition-all group cursor-pointer"
            >
              <Avatar className="h-9 w-9 border-2 border-white/20 shrink-0 group-hover:scale-105 transition-transform">
                <AvatarImage src={user?.profileImageUrl} alt="" />
                <AvatarFallback className="bg-white/10 text-white font-semibold">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate leading-tight">{user?.fullName || 'User'}</p>
                <p className="text-[11px] text-white/50 truncate leading-tight uppercase tracking-wide">{currentUserType}</p>
              </div>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10 transition-all border border-transparent hover:border-white/10"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span className="font-bold">Log out</span>
            </Button>
          </div>
        </aside>

        {/* Mobile Sidebar Sheet */}
        <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
          <SheetContent side="left" className="bg-gradient-to-b from-teal-900 to-teal-950 text-white border-none w-[280px] sm:w-[350px] md:hidden p-0">
            <div className="py-6 h-full flex flex-col overflow-hidden">
              {/* Mobile Branding */}
              <div className="flex items-center gap-2 mb-2 px-4 shrink-0">
                <img src="/images/logo.png" alt="LCEO" className="h-10 w-10 object-contain" />
                <span className="text-2xl font-bold text-sand-200">LCEO</span>
              </div>
              <p className="text-xs text-teal-300 mb-8 px-4 uppercase tracking-wider font-medium shrink-0">{currentUserType} Portal</p>

              {/* Mobile Scrollable Nav */}
              <div className="flex-1 min-h-0 flex flex-col px-2">
                <nav className="space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-teal-800 scrollbar-track-transparent">
                  {navItems.map((item, index) => {
                    const isActive = location.pathname === item.href || location.pathname.startsWith(`${item.href}/`);
                    return (
                      <motion.div
                        key={item.href}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Link
                          to={item.href}
                          onClick={() => setMobileSheetOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${isActive
                            ? "bg-gradient-to-r from-teal-700 to-teal-800 text-white shadow-lg"
                            : "hover:bg-teal-800/60"
                            }`}
                        >
                          <item.icon className="w-5 h-5 shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </Link>
                      </motion.div>
                    );
                  })}
                </nav>
              </div>

              {/* Mobile Footer */}
              <div className="pt-6 border-t border-teal-800/50 mt-auto shrink-0 px-4 pb-6">
                <div className="flex items-center gap-3 mb-4 px-2">
                  <Avatar className="h-9 w-9 border border-teal-600 shrink-0">
                    <AvatarImage src={user?.profileImageUrl} alt="" />
                    <AvatarFallback className="bg-teal-800 text-sand-300">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate leading-tight">{user?.fullName || 'User'}</p>
                    <p className="text-[11px] text-teal-400 truncate leading-tight uppercase tracking-wide">{currentUserType}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-teal-300 hover:text-white hover:bg-teal-800 transition-all font-bold"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Main Content Area - Now with left margin for sidebar */}
        <div className="flex-1 flex flex-col min-h-[calc(100vh-4rem)] md:ml-64">
          <main className="flex-1 overflow-y-auto p-4 md:p-8 pt-0 bg-gray-50 dark:bg-gray-950">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-7xl mx-auto"
            >
              <Outlet />
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
}