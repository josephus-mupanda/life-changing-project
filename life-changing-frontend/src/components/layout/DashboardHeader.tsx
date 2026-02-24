import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  MessageSquare,
  Bell,
  User,
  LayoutDashboard,
  LogOut,
  Target,
  Menu,
  DollarSign,
  Calendar,
  Upload,
  FolderKanban,
  Heart,
  UserPlus,
  FileText,
  ChevronDown,

  Layout,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth-context";
import { UserType } from "@/lib/types";

interface DashboardHeaderProps {
  onMobileMenuClick?: () => void;
}

export function DashboardHeader({ onMobileMenuClick }: DashboardHeaderProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [messagesOpen, setMessagesOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);


  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getDashboardLink = () => {
    if (!user) return "/";
    switch (user.userType) {
      case UserType.ADMIN:
        return "/admin";
      case UserType.DONOR:
        return "/donor";
      case UserType.BENEFICIARY:
        return "/beneficiary";
      default:
        return "/";
    }
  };

  const initials = user?.fullName
    ? user.fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase()
    : "U";

  const quickAddItems = (() => {
    if (!user) return [];

    switch (user.userType) {
      case UserType.ADMIN:
        return [
          { label: "New Beneficiary", icon: UserPlus, href: "/admin/beneficiaries/add", description: "Register a new person" },
          { label: "New Donor", icon: Heart, href: "/admin/donors/add", description: "Record a contribution" },
          { label: "Create Program", icon: FolderKanban, href: "/admin/programs", description: "Launch initiative" },
          { label: "Edit Home Page", icon: Layout, href: "/admin/web-contents/home", description: "Update landing content" },
          { label: "Manage Stories", icon: BookOpen, href: "/admin/web-contents/impact-stories", description: "Add impact stories" },
          { label: "Update Resources", icon: FileText, href: "/admin/web-contents/resources", description: "Manage documents" },
        ];
      case UserType.BENEFICIARY:
        return [
          { label: "Add New Goal", icon: Target, href: "/beneficiary/goals/add" },
          { label: "Log Progress", icon: Calendar, href: "/beneficiary/tracking/add" },
          { label: "Upload Document", icon: Upload, href: "/beneficiary/resources/upload" },
        ];
      case UserType.DONOR:
        return [
          { label: "Make Donation", icon: DollarSign, href: "/donate" },
          { label: "Impact Reports", icon: FileText, href: "/donor/reports" },
          { label: "Donation History", icon: Heart, href: "/donor/donations" },
        ];
      default:
        return [];
    }
  })();

  const mockNotifications = [
    { id: 1, text: "New donation received: $500", time: "2 mins ago", type: "donation" },
    { id: 2, text: "Beneficiary Ineza Keza updated goals", time: "1 hour ago", type: "update" },
    { id: 3, text: "Quarterly report is ready for review", time: "5 hours ago", type: "report" },
  ];

  const mockMessages = [
    { id: 1, sender: "Robert Donor", text: "I'd like to increase my monthly gift", time: "10 mins ago" },
    { id: 2, sender: "Ineza Keza", text: "Thank you for the support!", time: "2 hours ago" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full h-16 border-b bg-white dark:bg-slate-950 shadow-sm transition-all duration-300">
      <div className="flex h-full items-center justify-between gap-4 px-4 md:px-8 max-w-[1600px] mx-auto">
        <div className="flex items-center gap-3 shrink-0">
          {onMobileMenuClick && (
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-10 w-10 hover:bg-teal-50 dark:hover:bg-teal-950/30 text-teal-700 dark:text-teal-400"
              onClick={onMobileMenuClick}
            >
              <Menu className="h-6 w-6" />
            </Button>
          )}
          <Link to={getDashboardLink()} className="flex items-center gap-1 sm:gap-3 group transition-all hover:opacity-90">
            <div className="bg-white dark:bg-slate-900 p-1 rounded-lg sm:p-1.5 sm:rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm shrink-0">
              <img src="/images/logo.png" alt="LCEO" className="h-6 w-6 sm:h-8 sm:w-8 object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-black tracking-tight text-teal-950 dark:text-white leading-none">
                LCEO<span className="text-teal-500">.</span>
              </span>
              <span className="text-[9px] sm:text-[11px] font-bold text-teal-600 dark:text-teal-500 tracking-[0.15em] uppercase leading-none mt-1 hidden sm:block xs-hidden">
                Portal
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Quick Add (+) */}
          {quickAddItems.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-transparent hover:border-teal-100 dark:hover:border-teal-900 hover:bg-teal-50 dark:hover:bg-teal-950/30 transition-all"
                  aria-label="Quick add"
                >
                  <Plus className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72 p-2 rounded-[2rem] border-slate-200/60 dark:border-slate-800 shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 mb-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Quick Command Center</p>
                </div>
                <div className="grid grid-cols-1 gap-1">
                  {quickAddItems.map((item) => (
                    <DropdownMenuItem key={item.href} asChild className="rounded-2xl focus:bg-teal-50 dark:focus:bg-teal-900/30 p-0">
                      <Link to={item.href} className="flex items-center gap-4 px-3 py-2.5 cursor-pointer group/item">
                        <div className="h-10 w-10 shrink-0 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl flex items-center justify-center group-hover/item:scale-110 group-hover/item:bg-teal-500 group-hover/item:text-white transition-all shadow-sm">
                          <item.icon className="h-5 w-5 text-teal-600 dark:text-teal-400 group-hover/item:text-white transition-colors" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-black text-slate-900 dark:text-white leading-tight">{item.label}</span>
                          {"description" in item && (
                            <span className="text-[10px] font-medium text-slate-400 truncate mt-0.5">{(item as any).description}</span>
                          )}
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </div>
                <DropdownMenuSeparator className="my-2 opacity-50" />
                <div className="p-1">
                  <Button variant="ghost" className="w-full justify-center text-[11px] font-black uppercase tracking-widest text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-xl py-5 h-auto">
                    Global Search Command (⌘K)
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Messages */}
          <DropdownMenu open={messagesOpen} onOpenChange={setMessagesOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-transparent hover:border-teal-100 dark:hover:border-teal-900 hover:bg-teal-50 dark:hover:bg-teal-950/30 transition-all relative"
              >
                <MessageSquare className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-teal-500 rounded-full border-2 border-white dark:border-gray-950" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0 rounded-2xl border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-b">
                <DropdownMenuLabel className="font-bold text-slate-900 dark:text-white p-0">Messages</DropdownMenuLabel>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {mockMessages.map(msg => (
                  <DropdownMenuItem key={msg.id} className="p-4 border-b last:border-0 focus:bg-slate-50 dark:focus:bg-slate-900/50 gap-3">
                    <Avatar className="h-10 w-10 border-2 border-teal-100 dark:border-teal-900">
                      <AvatarFallback className="bg-teal-500 text-white font-bold">{msg.sender[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-slate-900 dark:text-slate-200">{msg.sender}</p>
                      <p className="text-xs text-slate-500 truncate">{msg.text}</p>
                      <p className="text-[10px] text-teal-600 mt-1 font-medium">{msg.time}</p>
                    </div>
                  </DropdownMenuItem>
                ))}
              </div>
              <div className="p-2 border-t text-center">
                <Button variant="ghost" size="sm" className="w-full text-xs font-bold text-teal-600 hover:text-teal-700">View All Messages</Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications */}
          <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-transparent hover:border-teal-100 dark:hover:border-teal-900 hover:bg-teal-50 dark:hover:bg-teal-950/30 transition-all relative"
              >
                <Bell className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-950 animate-pulse" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0 rounded-2xl border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-b">
                <DropdownMenuLabel className="font-bold text-slate-900 dark:text-white p-0">Recent Activity</DropdownMenuLabel>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {mockNotifications.map(note => (
                  <DropdownMenuItem key={note.id} className="p-4 border-b last:border-0 focus:bg-slate-50 dark:focus:bg-slate-900/50 gap-3">
                    <div className={`p-2 rounded-xl ${note.type === 'donation' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                      {note.type === 'donation' ? <Heart className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-200 break-words line-clamp-2">{note.text}</p>
                      <p className="text-[10px] text-slate-500 mt-1">{note.time}</p>
                    </div>
                  </DropdownMenuItem>
                ))}
              </div>
              <div className="p-2 border-t text-center">
                <Button variant="ghost" size="sm" className="w-full text-xs font-bold text-teal-600 hover:text-teal-700">Clear All Notifications</Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Profile */}
          <div className="flex items-center gap-0.5 bg-teal-50/50 dark:bg-teal-950/20 rounded-2xl border border-teal-100/50 dark:border-teal-900/50 h-11 transition-all">
            <Link
              to="/profile"
              className="flex items-center gap-3 pl-2 pr-2 h-full hover:bg-teal-100 dark:hover:bg-teal-900 rounded-l-2xl transition-all group"
            >
              <Avatar className="h-8 w-8 ring-2 ring-white dark:ring-slate-900 shadow-md shrink-0">
                <AvatarImage src={user?.profileImageUrl} alt="" />
                <AvatarFallback className="bg-gradient-to-br from-teal-400 to-teal-600 text-white font-black text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-black text-teal-900 dark:text-white truncate max-w-[80px]">{user?.fullName?.split(' ')[0] || 'User'}</p>
                <p className="text-[10px] font-bold text-teal-600 uppercase tracking-tighter">Portal</p>
              </div>
            </Link>

            <DropdownMenu open={profileMenuOpen} onOpenChange={setProfileMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-full w-8 rounded-r-2xl hover:bg-teal-100 dark:hover:bg-teal-900 flex items-center justify-center p-0 border-l border-teal-100/50 dark:border-teal-900/50"
                >
                  <ChevronDown className={`h-4 w-4 text-teal-600 transition-transform duration-200 ${profileMenuOpen ? 'rotate-180' : ''}`} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 p-2 rounded-2xl border-slate-200 dark:border-slate-800 shadow-2xl">
                <DropdownMenuItem asChild className="p-0 rounded-xl focus:bg-transparent mb-1">
                  <Link to="/profile" className="w-full px-3 py-3 bg-slate-50 dark:bg-slate-900 hover:bg-teal-50 dark:hover:bg-teal-900/40 rounded-xl transition-all block group/summary">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border-2 border-white dark:border-slate-800 shrink-0">
                        <AvatarImage src={user?.profileImageUrl} alt="" />
                        <AvatarFallback className="bg-teal-500 text-white font-bold">{initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-slate-900 dark:text-white truncate group-hover/summary:text-teal-600 transition-colors">{user?.fullName}</p>
                        <p className="text-[10px] font-medium text-slate-500 truncate">{user?.email}</p>
                      </div>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1 opacity-50" />
                <DropdownMenuItem asChild className="rounded-xl">
                  <Link to="/profile" className="flex items-center gap-3 py-2.5 font-semibold text-slate-700 dark:text-slate-200">
                    <User className="h-4 w-4 text-teal-500" />
                    View Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-xl">
                  <Link to={getDashboardLink()} className="flex items-center gap-3 py-2.5 font-semibold text-slate-700 dark:text-slate-200">
                    <LayoutDashboard className="h-4 w-4 text-teal-500" />
                    My Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-2" />
                <DropdownMenuItem className="rounded-xl focus:bg-red-50 dark:focus:bg-red-950/20 text-red-600 dark:text-red-400 font-bold" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-3" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
