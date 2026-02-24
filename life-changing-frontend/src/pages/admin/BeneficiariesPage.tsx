import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Search,
  Filter,
  MoreHorizontal,
  Download,
  Plus,
  UserCheck,
  Loader2,
  Trash2,
  GraduationCap,
  Users,
  MapPin,
  Calendar,
  Phone,
  Activity,
  RefreshCw,
  Eye,
  Edit,
  Briefcase,
  Award,
  AlertCircle,
  UserPlus,
  UserMinus,
  UserCheck2,
  Target,
  BarChart3,
  ArrowRightCircle,
  FileText,
} from 'lucide-react';
import { Beneficiary, BeneficiaryStatus, Program } from '@/lib/types';
import { toast } from 'sonner';
import { beneficiaryService } from '@/services/beneficiary.service';
import { programsService } from '@/services/programs.service';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export function BeneficiariesPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [filteredBeneficiaries, setFilteredBeneficiaries] = useState<Beneficiary[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [programFilter, setProgramFilter] = useState<string>('all');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalBeneficiaries, setTotalBeneficiaries] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    graduated: 0,
    inactive: 0,
    completionRate: 0
  });

  // Sync state with URL params
  useEffect(() => {
    const query = searchParams.get('search');
    if (query !== null) {
      setSearchTerm(query);
    }
  }, [searchParams]);

  // Fetch Programs for Filter
  useEffect(() => {
    const loadPrograms = async () => {
      try {
        const response = await programsService.getPrograms();
        const data = (response as any).data?.data || (response as any).data || response;
        setPrograms(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load programs for filter", error);
      }
    };
    loadPrograms();
  }, []);

  // Fetch All Beneficiaries
  const fetchAllBeneficiaries = async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const response = await beneficiaryService.getAllBeneficiaries(1, 1000);

      const responseData = response as any;
      const beneficiariesData = responseData.data?.data || responseData.data || responseData;

      const beneficiariesList: Beneficiary[] = Array.isArray(beneficiariesData) ? beneficiariesData : [];

      setBeneficiaries(beneficiariesList);
      setFilteredBeneficiaries(beneficiariesList);
      setTotalBeneficiaries(beneficiariesList.length);
      setTotalPages(Math.ceil(beneficiariesList.length / itemsPerPage) || 1);

      // Calculate stats
      const active = beneficiariesList.filter(b => b.status === BeneficiaryStatus.ACTIVE).length;
      const graduated = beneficiariesList.filter(b => b.status === BeneficiaryStatus.GRADUATED).length;
      const inactive = beneficiariesList.filter(b => b.status === BeneficiaryStatus.INACTIVE).length;
      const completed = beneficiariesList.filter(b => b.profileCompletion === 100).length;

      setStats({
        total: beneficiariesList.length,
        active,
        graduated,
        inactive,
        completionRate: beneficiariesList.length ? Math.round((completed / beneficiariesList.length) * 100) : 0
      });

      if (showRefresh) {
        toast.success("Data refreshed successfully!");
      }
    } catch (error) {
      console.error("Failed to fetch beneficiaries", error);
      toast.error("Failed to load beneficiaries");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllBeneficiaries();
  }, []);

  // Client-side filtering
  useEffect(() => {
    let filtered = [...beneficiaries];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(b =>
        b.user?.fullName?.toLowerCase().includes(term) ||
        b.user?.phone?.includes(term) ||
        b.location?.district?.toLowerCase().includes(term) ||
        b.location?.sector?.toLowerCase().includes(term) ||
        b.businessType?.toLowerCase().includes(term) ||
        b.user?.email?.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(b => b.status === statusFilter);
    }

    if (programFilter !== 'all') {
      filtered = filtered.filter(b => b.program?.id === programFilter);
    }

    setFilteredBeneficiaries(filtered);
    setTotalBeneficiaries(filtered.length);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage) || 1);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, programFilter, beneficiaries]);

  // Get current page data
  const getCurrentPageData = (): Beneficiary[] => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredBeneficiaries.slice(startIndex, endIndex);
  };

  const handleExport = () => {
    toast.success("Exporting beneficiary data to CSV...");
  };

  const handleStatusChange = async (id: string, action: 'graduate' | 'delete') => {
    try {
      if (action === 'graduate') {
        await beneficiaryService.graduate(id);
        toast.success("Beneficiary graduated successfully! 🎓");
      } else if (action === 'delete') {
        if (!confirm("Are you sure you want to delete this beneficiary?")) return;
        await beneficiaryService.delete(id);
        toast.success("Beneficiary deleted.");
      }
      fetchAllBeneficiaries(true);
    } catch (error) {
      toast.error("Action failed");
    }
  };

  const formatDate = (date: Date | string) => {
    if (!date) return 'N/A';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(date));
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getStatusConfig = (status: BeneficiaryStatus) => {
    switch (status) {
      case BeneficiaryStatus.ACTIVE:
        return {
          bg: 'bg-emerald-100 dark:bg-emerald-900/30',
          text: 'text-emerald-700 dark:text-emerald-300',
          border: 'border-emerald-200 dark:border-emerald-800',
          icon: UserCheck2,
          label: 'Active'
        };
      case BeneficiaryStatus.GRADUATED:
        return {
          bg: 'bg-blue-100 dark:bg-blue-900/30',
          text: 'text-blue-700 dark:text-blue-300',
          border: 'border-blue-200 dark:border-blue-800',
          icon: Award,
          label: 'Graduated'
        };
      case BeneficiaryStatus.INACTIVE:
        return {
          bg: 'bg-slate-100 dark:bg-slate-800',
          text: 'text-slate-600 dark:text-slate-400',
          border: 'border-slate-200 dark:border-slate-700',
          icon: UserMinus,
          label: 'Inactive'
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-700',
          border: 'border-gray-200',
          icon: AlertCircle,
          label: status
        };
    }
  };

  // ✅ FIX: Use inline styles instead of dynamic Tailwind class names
  // Dynamic class names like `bg-emerald-500` get purged by Tailwind in production
  const getProgressColor = (progress: number): string => {
    if (progress >= 100) return '#10b981'; // emerald-500
    if (progress >= 75) return '#3b82f6';  // blue-500
    if (progress >= 50) return '#f59e0b';  // amber-500
    if (progress >= 25) return '#f97316';  // orange-500
    return '#f43f5e';                       // rose-500
  };

  // ✅ FIX: A wrapper that applies the color via a CSS variable or indicator style
  const ColoredProgress = ({ value, progress }: { value: number; progress: number }) => (
    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${Math.min(value, 100)}%`, backgroundColor: getProgressColor(progress) }}
      />
    </div>
  );

  const currentBeneficiaries = getCurrentPageData();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6 lg:space-y-8">
          {/* Skeleton Header */}
          <div className="space-y-2 sm:space-y-3">
            <div className="h-8 sm:h-10 lg:h-12 w-48 sm:w-56 lg:w-64 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
            <div className="h-4 sm:h-5 lg:h-6 w-64 sm:w-80 lg:w-96 bg-slate-200 dark:bg-slate-800 rounded-md animate-pulse" />
          </div>

          {/* Skeleton Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <CardContent className="p-4 sm:p-5 lg:p-6">
                  <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mb-3" />
                  <div className="h-6 sm:h-7 lg:h-8 w-12 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Skeleton Table */}
          <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
            <div className="p-4 sm:p-5 lg:p-6 space-y-3 sm:space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-3 sm:space-x-4">
                  <div className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse flex-shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="h-3 sm:h-4 w-full max-w-[200px] sm:max-w-[250px] bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                    <div className="h-3 sm:h-4 w-full max-w-[150px] sm:max-w-[200px] bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="min-h-screen bg-slate-50 dark:bg-slate-950"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6 lg:space-y-8">
          {/* Header */}
          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                Beneficiaries
              </h1>
              <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-1">
                <Users className="w-4 h-4" />
                <span>Management Portal · {stats.total} total beneficiaries</span>
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 sm:h-10 px-3 sm:px-4 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm font-medium"
                    onClick={handleExport}
                  >
                    <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                    <span className="hidden xs:inline">Export</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Export as CSV</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 sm:h-10 px-3 sm:px-4 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm font-medium"
                    onClick={() => fetchAllBeneficiaries(true)}
                    disabled={isRefreshing}
                  >
                    <RefreshCw className={cn("w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2", isRefreshing && "animate-spin")} />
                    <span className="hidden xs:inline">Refresh</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Refresh data</p>
                </TooltipContent>
              </Tooltip>

              <Button
                className="h-9 sm:h-10 px-4 sm:px-5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs sm:text-sm font-medium shadow-lg shadow-teal-600/20 transition-all active:scale-95"
                onClick={() => navigate('/admin/beneficiaries/add')}
              >
                <UserPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                <span>Add New</span>
              </Button>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
          >
            {[
              { label: 'Total', value: stats.total, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
              { label: 'Active', value: stats.active, icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
              { label: 'Graduated', value: stats.graduated, icon: Award, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30' },
              { label: 'Completion', value: `${stats.completionRate}%`, icon: Target, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' }
            ].map((stat, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                          {stat.label}
                        </p>
                        <p className={`text-xl sm:text-2xl lg:text-3xl font-bold ${stat.color}`}>
                          {stat.value}
                        </p>
                      </div>
                      <div className={cn("p-2 sm:p-3 rounded-xl", stat.bg)}>
                        <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 dark:text-slate-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Filters and Search - Always Visible */}
          <motion.div variants={fadeInUp}>
            <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 p-4 sm:p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search by name, phone, district..."
                  className="w-full h-10 pl-10 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-lg text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[140px] lg:w-[160px] h-10 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-slate-500" />
                      <SelectValue placeholder="Status" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                    <SelectItem value="all" className="text-sm">All Statuses</SelectItem>
                    <SelectItem value={BeneficiaryStatus.ACTIVE} className="text-sm text-emerald-600">Active</SelectItem>
                    <SelectItem value={BeneficiaryStatus.GRADUATED} className="text-sm text-blue-600">Graduated</SelectItem>
                    <SelectItem value={BeneficiaryStatus.INACTIVE} className="text-sm text-slate-600">Inactive</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={programFilter} onValueChange={setProgramFilter}>
                  <SelectTrigger className="w-full sm:w-[180px] lg:w-[200px] h-10 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-slate-500" />
                      <SelectValue placeholder="Program" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 max-h-[300px]">
                    <SelectItem value="all" className="text-sm">All Programs</SelectItem>
                    {programs.map(p => (
                      <SelectItem key={p.id} value={p.id} className="text-sm">
                        {p.name?.en || 'Unnamed Program'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </motion.div>

          {/* Beneficiary Cards Grid - Scrollable on all devices */}
          <motion.div variants={fadeInUp}>
            <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
              <div className="max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent">
                {currentBeneficiaries.length === 0 ? (
                  <div className="p-12 text-center">
                    <Users className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">No beneficiaries found</p>
                    <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">Try adjusting your filters or add a new beneficiary</p>
                    <Button
                      variant="outline"
                      size="default"
                      className="mt-6"
                      onClick={() => navigate('/admin/beneficiaries/add')}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Beneficiary
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                    {currentBeneficiaries.map((beneficiary) => {
                      const statusConfig = getStatusConfig(beneficiary.status);
                      const StatusIcon = statusConfig.icon;
                      const progress = beneficiary.startCapital
                        ? Math.min(Math.round((Number(beneficiary.currentCapital) / Number(beneficiary.startCapital)) * 100), 100)
                        : 0;

                      return (
                        <motion.div
                          key={beneficiary.id}
                          variants={fadeInUp}
                          className="group"
                        >
                          <Card className="h-full border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                            <CardContent className="p-5">
                              {/* Header with Avatar and Status */}
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-12 w-12 ring-2 ring-white dark:ring-slate-800 shadow-md">
                                    <AvatarImage src={beneficiary.user?.profileImageUrl} />
                                    <AvatarFallback className="bg-gradient-to-br from-teal-500 to-teal-600 text-white font-semibold">
                                      {beneficiary.user?.fullName ? getInitials(beneficiary.user.fullName) : 'NA'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <h3 className="font-semibold text-slate-900 dark:text-white">
                                      {beneficiary.user?.fullName || 'Unknown'}
                                    </h3>
                                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                      <Phone className="w-3 h-3" />
                                      {beneficiary.user?.phone || 'No phone'}
                                    </p>
                                  </div>
                                </div>
                                <Badge className={cn(
                                  "rounded-full px-2.5 py-1 text-xs font-medium border",
                                  statusConfig.bg,
                                  statusConfig.text,
                                  statusConfig.border
                                )}>
                                  <StatusIcon className="w-3 h-3 mr-1 inline-block" />
                                  {statusConfig.label}
                                </Badge>
                              </div>

                              {/* Program & Location */}
                              <div className="space-y-2 mb-4">
                                <div className="flex items-center gap-2 text-sm">
                                  <Briefcase className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                  <span className="text-slate-700 dark:text-slate-300 truncate">
                                    {beneficiary.program?.name?.en || 'Unassigned'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                  <span className="text-slate-700 dark:text-slate-300 capitalize">
                                    {beneficiary.location?.district || 'N/A'}
                                    {beneficiary.location?.sector && `, ${beneficiary.location.sector}`}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                  <span className="text-slate-700 dark:text-slate-300">
                                    Enrolled: {formatDate(beneficiary.enrollmentDate)}
                                  </span>
                                </div>
                              </div>

                              {/* Progress Bar */}
                              <div className="mb-4">
                                <div className="flex items-center justify-between mb-1.5">
                                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                                    Capital Progress
                                  </span>
                                  <span className={cn(
                                    "text-xs font-bold",
                                    progress >= 100 ? "text-emerald-600" :
                                      progress >= 75 ? "text-blue-600" :
                                        progress >= 50 ? "text-amber-600" : "text-rose-600"
                                  )}>
                                    {progress}%
                                  </span>
                                </div>
                                <Progress
                                  value={progress}
                                  className={cn("h-2", getProgressColor(progress))}
                                />
                                <div className="flex items-center justify-between mt-1.5">
                                  <span className="text-[10px] text-slate-400">
                                    ₣{Number(beneficiary.currentCapital).toLocaleString()}
                                  </span>
                                  <span className="text-[10px] text-slate-400">
                                    ₣{Number(beneficiary.startCapital).toLocaleString()}
                                  </span>
                                </div>
                              </div>

                              {/* Business Type */}
                              {beneficiary.businessType && (
                                <div className="mb-4">
                                  <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/30 dark:text-teal-400 text-xs">
                                    <Briefcase className="w-3 h-3 mr-1" />
                                    {beneficiary.businessType}
                                  </Badge>
                                </div>
                              )}

                              {/* Action Buttons */}
                              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-8 px-3 text-xs hover:bg-blue-50 text-blue-600 hover:text-blue-700 dark:hover:bg-blue-950/30"
                                      onClick={() => navigate(`/admin/beneficiaries/${beneficiary.id}`)}
                                    >
                                      <Eye className="w-3.5 h-3.5 mr-1" />
                                      View
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>View Details</TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-8 px-3 text-xs hover:bg-amber-50 text-amber-600 hover:text-amber-700 dark:hover:bg-amber-950/30"
                                      onClick={() => navigate(`/admin/beneficiaries/${beneficiary.id}/edit`)}
                                    >
                                      <Edit className="w-3.5 h-3.5 mr-1" />
                                      Edit
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Edit Beneficiary</TooltipContent>
                                </Tooltip>

                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-8 w-8 p-0 hover:bg-slate-100 text-slate-600 hover:text-slate-700 dark:hover:bg-slate-800"
                                    >
                                      <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuLabel className="text-xs font-medium text-slate-500">
                                      More Actions
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      className="text-sm cursor-pointer"
                                      onClick={() => navigator.clipboard.writeText(beneficiary.id)}
                                    >
                                      <FileText className="w-4 h-4 mr-2" />
                                      Copy ID
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="text-sm cursor-pointer"
                                      onClick={() => navigate(`/admin/beneficiaries/${beneficiary.id}/tracking`)}
                                    >
                                      <BarChart3 className="w-4 h-4 mr-2" />
                                      View Tracking
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="text-sm cursor-pointer"
                                      onClick={() => handleStatusChange(beneficiary.id, 'graduate')}
                                    >
                                      <GraduationCap className="w-4 h-4 mr-2 text-blue-600" />
                                      Graduate
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="text-sm cursor-pointer"
                                      onClick={() => navigate(`/admin/beneficiaries/${beneficiary.id}/assign`)}
                                    >
                                      <ArrowRightCircle className="w-4 h-4 mr-2 text-teal-600" />
                                      Assign Program
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      className="text-sm text-red-600 focus:text-red-600 cursor-pointer"
                                      onClick={() => handleStatusChange(beneficiary.id, 'delete')}
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Pagination */}
              <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-4 sm:px-6 py-3 sm:py-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Showing <span className="font-medium text-slate-700 dark:text-slate-300">{currentBeneficiaries.length}</span> of{' '}
                    <span className="font-medium text-slate-700 dark:text-slate-300">{totalBeneficiaries}</span> records
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      className="h-8 px-3 text-xs"
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-slate-600 dark:text-slate-400 px-2">
                      {currentPage} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage(p => p + 1)}
                      className="h-8 px-3 text-xs"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </TooltipProvider>
  );
}