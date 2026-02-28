import {
  Plus, Search, MoreVertical, Users, DollarSign, Calendar, Edit, Trash2, Loader2,
  TrendingUp, Award, Target, Globe, Layers, Eye, Clock, FolderKanban, Heart,
  ChevronRight, Download, RefreshCw, Filter, Grid3x3, LayoutList, Sparkles,
  FileText, BarChart3, PieChart, Activity, CheckCircle, XCircle, AlertCircle, Archive
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { PageSkeleton } from '@/components/Skeletons';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ProgramCategory, ProgramStatus, Program, CreateProgramDto } from '@/lib/types';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { programsService } from '@/services/programs.service';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { DropZone } from '@/components/ui/drop-zone';
import { RichTextEditor } from '@/components/ui/rich-text-editor';

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

// Interface for API response
interface ProgramsApiResponse {
  success: boolean;
  data: {
    data: Program[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  };
  timestamp: string;
}

interface ProgramFormProps {
  formData: CreateProgramDto;
  setFormData: (data: CreateProgramDto) => void;
  sdgInput: string;
  setSdgInput: (val: string) => void;
  coverFile: File | null;
  setCoverFile: (file: File | null) => void;
  coverPreview: string | null;
  setCoverPreview: (preview: string | null) => void;
  logoFile: File | null;
  setLogoFile: (file: File | null) => void;
  logoPreview: string | null;
  setLogoPreview: (preview: string | null) => void;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  submitLabel: string;
  onCancel: () => void;
}

const ProgramForm = ({
  formData,
  setFormData,
  sdgInput,
  setSdgInput,
  coverFile,
  setCoverFile,
  coverPreview,
  setCoverPreview,
  logoFile,
  setLogoFile,
  logoPreview,
  setLogoPreview,
  isSubmitting,
  onSubmit,
  submitLabel,
  onCancel
}: ProgramFormProps) => (
  <div className="grid gap-6 py-4">
    {/* Basic Info */}
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-1 h-5 bg-teal-500 rounded-full"></div>
        <Label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Program Details</Label>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="nameEn" className="text-xs font-medium text-slate-600">Name (English) *</Label>
          <Input
            id="nameEn"
            value={formData.name.en}
            onChange={(e) => setFormData({ ...formData, name: { ...formData.name, en: e.target.value } })}
            className="h-9 border-slate-200 focus:border-teal-500 focus:ring-teal-500/20"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="nameRw" className="text-xs font-medium text-slate-600">Name (Kinyarwanda) *</Label>
          <Input
            id="nameRw"
            value={formData.name.rw}
            onChange={(e) => setFormData({ ...formData, name: { ...formData.name, rw: e.target.value } })}
            className="h-9 border-slate-200 focus:border-teal-500 focus:ring-teal-500/20"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="category" className="text-xs font-medium text-slate-600">Category</Label>
          <Select
            value={formData.category}
            onValueChange={(val: ProgramCategory) => setFormData({ ...formData, category: val })}
          >
            <SelectTrigger className="h-9 border-slate-200">
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ProgramCategory.EDUCATION}>Education</SelectItem>
              <SelectItem value={ProgramCategory.ENTREPRENEURSHIP}>Entrepreneurship</SelectItem>
              <SelectItem value={ProgramCategory.HEALTH}>Health</SelectItem>
              <SelectItem value={ProgramCategory.CROSS_CUTTING}>Cross Cutting</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="sdgAlignment" className="text-xs font-medium text-slate-600">SDG Alignment</Label>
          <Input
            id="sdgAlignment"
            value={sdgInput}
            onChange={(e) => {
              setSdgInput(e.target.value);
              const nums = e.target.value.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
              setFormData({ ...formData, sdgAlignment: nums });
            }}
            placeholder="e.g. 1, 4, 10"
            className="h-9 border-slate-200"
          />
        </div>
      </div>
    </div>

    {/* Description with Rich Text Editor */}
    <div className="space-y-3 pt-4 border-t border-slate-100">
      <div className="flex items-center gap-2">
        <div className="w-1 h-5 bg-teal-500 rounded-full"></div>
        <Label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Descriptions</Label>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="descEn" className="text-xs font-medium text-slate-600 mb-2 block">Description (English)</Label>
          <RichTextEditor
            value={formData.description.en}
            onChange={(value) => setFormData({ ...formData, description: { ...formData.description, en: value } })}
            placeholder="Write a detailed description in English..."
            height={200}
            required
          />
        </div>

        <div>
          <Label htmlFor="descRw" className="text-xs font-medium text-slate-600 mb-2 block">Description (Kinyarwanda)</Label>
          <RichTextEditor
            value={formData.description.rw}
            onChange={(value) => setFormData({ ...formData, description: { ...formData.description, rw: value } })}
            placeholder="Write a detailed description in Kinyarwanda..."
            height={200}
            required
          />
        </div>
      </div>
    </div>

    {/* File Uploads with DropZone */}
    <div className="space-y-6 pt-4 border-t border-slate-100">
      <div className="flex items-center gap-2">
        <div className="w-1 h-5 bg-teal-500 rounded-full"></div>
        <Label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Media</Label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-xs font-medium text-slate-600">Cover Image</Label>
          <DropZone
            onFileSelect={setCoverFile}
            selectedFile={coverFile}
            preview={coverPreview}
            onPreviewChange={setCoverPreview}
            label="Upload cover image"
            description="Recommended size: 1200x630px"
            maxSize={5 * 1024 * 1024} // 5MB
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-medium text-slate-600">Logo</Label>
          <DropZone
            onFileSelect={setLogoFile}
            selectedFile={logoFile}
            preview={logoPreview}
            onPreviewChange={setLogoPreview}
            label="Upload logo"
            description="Square image recommended"
            maxSize={2 * 1024 * 1024} // 2MB
          />
        </div>
      </div>
    </div>

    {/* Status & Budget */}
    <div className="space-y-3 pt-4 border-t border-slate-100">
      <div className="flex items-center gap-2">
        <div className="w-1 h-5 bg-teal-500 rounded-full"></div>
        <Label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Planning & Finance</Label>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="status" className="text-xs font-medium text-slate-600">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(val: ProgramStatus) => setFormData({ ...formData, status: val })}
          >
            <SelectTrigger className="h-9 border-slate-200">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ProgramStatus.PLANNING}>Planning</SelectItem>
              <SelectItem value={ProgramStatus.ACTIVE}>Active</SelectItem>
              <SelectItem value={ProgramStatus.COMPLETED}>Completed</SelectItem>
              <SelectItem value={ProgramStatus.ARCHIVED}>Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="budget" className="text-xs font-medium text-slate-600">Budget (USD)</Label>
          <Input
            id="budget"
            type="number"
            value={formData.budget}
            onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
            className="h-9 border-slate-200"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="startDate" className="text-xs font-medium text-slate-600">Start Date</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            className="h-9 border-slate-200"
          />
        </div>
      </div>
    </div>

    {/* Removed the footer buttons from here - they're now in the dialog */}
  </div>
);

export function ProgramsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Data State
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Modal States
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPrograms, setTotalPrograms] = useState(0);
  const itemsPerPage = 9;

  // Form State
  const [formData, setFormData] = useState<CreateProgramDto>({
    name: { en: '', rw: '' },
    description: { en: '', rw: '' },
    category: ProgramCategory.CROSS_CUTTING,
    status: ProgramStatus.PLANNING,
    startDate: new Date().toISOString().split('T')[0],
    endDate: undefined,
    budget: 0,
    kpiTargets: {},
    sdgAlignment: []
  });

  // File Upload States
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [sdgInput, setSdgInput] = useState("");

  const resetForm = () => {
    setFormData({
      name: { en: '', rw: '' },
      description: { en: '', rw: '' },
      category: ProgramCategory.CROSS_CUTTING,
      status: ProgramStatus.PLANNING,
      startDate: new Date().toISOString().split('T')[0],
      endDate: undefined,
      budget: 0,
      kpiTargets: {},
      sdgAlignment: []
    });
    setSdgInput("");
    setCoverFile(null);
    setCoverPreview(null);
    setLogoFile(null);
    setLogoPreview(null);
    setSelectedProgram(null);
  };

  const fetchPrograms = async () => {
    setIsLoading(true);
    try {
      // Fetch programs with pagination and search
      const response = await programsService.getAdminList(currentPage, itemsPerPage, searchQuery);

      // Extract data from the nested structure based on your Swagger
      const programsData = response.data || [];
      const total = response.total || 0;

      setPrograms(programsData);
      setTotalPrograms(total);
      setTotalPages(Math.ceil(total / itemsPerPage));

    } catch (error) {
      console.error("Failed to fetch programs", error);
      toast.error("Failed to load programs");
    } finally {
      setIsLoading(false);
    }
  };

  // Apply filters
  const filteredPrograms = programs.filter(program => {
    const matchesStatus = statusFilter === "all" || program.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || program.category === categoryFilter;
    return matchesStatus && matchesCategory;
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPrograms();
    }, 500);
    return () => clearTimeout(timer);
  }, [currentPage, searchQuery]);

  useEffect(() => {
    if (selectedProgram && editDialogOpen) {
      setFormData({
        name: selectedProgram.name,
        description: selectedProgram.description,
        category: selectedProgram.category,
        status: selectedProgram.status,
        startDate: new Date(selectedProgram.startDate).toISOString().split('T')[0],
        endDate: selectedProgram.endDate ? new Date(selectedProgram.endDate).toISOString().split('T')[0] : undefined,
        budget: selectedProgram.budget,
        kpiTargets: selectedProgram.kpiTargets || {},
        sdgAlignment: selectedProgram.sdgAlignment || []
      });
      setSdgInput((selectedProgram.sdgAlignment || []).join(', '));
    }
  }, [selectedProgram, editDialogOpen]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const newProgram = await programsService.createProgram(formData);

      if (coverFile) {
        try {
          await programsService.uploadProgramCover(newProgram.id, coverFile);
        } catch (err) {
          console.error("Failed to upload cover", err);
          toast.warning("Program created but cover image upload failed");
        }
      }

      if (logoFile) {
        try {
          await programsService.uploadProgramLogo(newProgram.id, logoFile);
        } catch (err) {
          console.error("Failed to upload logo", err);
          toast.warning("Program created but logo upload failed");
        }
      }

      toast.success("Program created successfully");
      setCreateDialogOpen(false);
      resetForm();
      fetchPrograms();
    } catch (error) {
      toast.error("Failed to create program");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProgram) return;
    setIsSubmitting(true);
    try {
      await programsService.updateProgram(selectedProgram.id, formData);

      // Handle file uploads if changed
      if (coverFile) {
        try {
          await programsService.uploadProgramCover(selectedProgram.id, coverFile);
        } catch (err) {
          console.error("Failed to upload cover", err);
          toast.warning("Program updated but cover image upload failed");
        }
      }

      if (logoFile) {
        try {
          await programsService.uploadProgramLogo(selectedProgram.id, logoFile);
        } catch (err) {
          console.error("Failed to upload logo", err);
          toast.warning("Program updated but logo upload failed");
        }
      }

      toast.success("Program updated successfully");
      setEditDialogOpen(false);
      resetForm();
      fetchPrograms();
    } catch (error) {
      toast.error("Failed to update program");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this program?")) return;
    try {
      await programsService.deleteProgram(id);
      toast.success("Program deleted");
      fetchPrograms();
    } catch (error) {
      toast.error("Failed to delete program");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getCategoryConfig = (category: ProgramCategory) => {
    const configs = {
      [ProgramCategory.EDUCATION]: {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        icon: '📚',
        label: 'Education'
      },
      [ProgramCategory.ENTREPRENEURSHIP]: {
        bg: 'bg-green-50',
        text: 'text-green-700',
        border: 'border-green-200',
        icon: '💼',
        label: 'Entrepreneurship'
      },
      [ProgramCategory.HEALTH]: {
        bg: 'bg-pink-50',
        text: 'text-pink-700',
        border: 'border-pink-200',
        icon: '🏥',
        label: 'Health'
      },
      [ProgramCategory.CROSS_CUTTING]: {
        bg: 'bg-purple-50',
        text: 'text-purple-700',
        border: 'border-purple-200',
        icon: '🔄',
        label: 'Cross Cutting'
      },
    };
    return configs[category] || configs[ProgramCategory.CROSS_CUTTING];
  };

  const getStatusConfig = (status: ProgramStatus) => {
    const configs = {
      [ProgramStatus.ACTIVE]: {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        icon: CheckCircle,
        label: 'Active'
      },
      [ProgramStatus.PLANNING]: {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        icon: Clock,
        label: 'Planning'
      },
      [ProgramStatus.COMPLETED]: {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        icon: Award,
        label: 'Completed'
      },
      [ProgramStatus.ARCHIVED]: {
        bg: 'bg-slate-50',
        text: 'text-slate-600',
        border: 'border-slate-200',
        icon: Archive,
        label: 'Archived'
      },
    };
    return configs[status] || configs[ProgramStatus.PLANNING];
  };

  if (isLoading && programs.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <PageSkeleton />
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
        className="min-h-screen bg-slate-50"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-6 sm:space-y-8 lg:space-y-10">

          {/* Header with Premium Design */}
          <motion.div variants={fadeInUp} className="relative">
            <div className="absolute inset-0 bg-white rounded-3xl blur-3xl -z-10" />
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-1 h-6 bg-teal-500 rounded-full"></div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
                    Programs
                  </h1>
                  <Badge variant="outline" className="ml-2 text-xs font-medium bg-white/80">
                    {totalPrograms} Total
                  </Badge>
                </div>
                <p className="text-sm sm:text-base text-slate-500 flex items-center gap-2 mt-1">
                  <Target className="w-4 h-4" />
                  <span>Manage and track all your impact programs</span>
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 sm:h-10 px-3 sm:px-4 border-slate-200 hover:bg-slate-100 text-xs sm:text-sm font-medium"
                      onClick={() => fetchPrograms()}
                    >
                      <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                      <span className="hidden xs:inline">Refresh</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Refresh data</TooltipContent>
                </Tooltip>

                <Button
                  className="h-9 sm:h-10 px-4 sm:px-5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs sm:text-sm font-medium shadow-lg shadow-teal-600/20 transition-all active:scale-95"
                  onClick={() => { resetForm(); setCreateDialogOpen(true); }}
                >
                  <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                  <span>New Program</span>
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div variants={fadeInUp} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[
              {
                label: 'Active Programs',
                value: programs.filter(p => p.status === ProgramStatus.ACTIVE).length,
                icon: Activity,
                color: 'text-emerald-600',
                bg: 'bg-emerald-100',
                change: '+12%'
              },
              {
                label: 'Total Budget',
                value: formatCurrency(programs.reduce((sum, p) => sum + (p.budget || 0), 0)),
                icon: DollarSign,
                color: 'text-blue-600',
                bg: 'bg-blue-100',
                change: '+8%'
              },
              {
                label: 'Beneficiaries',
                value: programs.reduce((sum, p) => sum + (p.beneficiaries?.length || 0), 0),
                icon: Users,
                color: 'text-purple-600',
                bg: 'bg-purple-100',
                change: '+24%'
              },
              {
                label: 'Projects',
                value: programs.reduce((sum, p) => sum + (p.projects?.length || 0), 0),
                icon: FolderKanban,
                color: 'text-amber-600',
                bg: 'bg-amber-100',
                change: '+5%'
              }
            ].map((stat, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="border border-slate-200 bg-white hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-slate-500 mb-1">
                          {stat.label}
                        </p>
                        <p className={`text-xl sm:text-2xl lg:text-3xl font-bold ${stat.color}`}>
                          {stat.value}
                        </p>
                        <p className="text-[10px] text-emerald-600 mt-1 flex items-center gap-0.5">
                          <TrendingUp className="w-3 h-3" />
                          {stat.change}
                        </p>
                      </div>
                      <div className={cn("p-2 sm:p-3 rounded-xl", stat.bg)}>
                        <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Filters & Search Bar */}
          <motion.div variants={fadeInUp}>
            <Card className="border border-slate-200 bg-white">
              <CardContent className="p-4 sm:p-5">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Search */}
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="Search programs by name or description..."
                      className="w-full h-10 pl-9 bg-white border-slate-200 rounded-lg text-sm"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  {/* Filters */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full sm:w-[140px] h-10 bg-white border-slate-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Filter className="w-4 h-4 text-slate-500" />
                          <SelectValue placeholder="Status" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value={ProgramStatus.ACTIVE}>Active</SelectItem>
                        <SelectItem value={ProgramStatus.PLANNING}>Planning</SelectItem>
                        <SelectItem value={ProgramStatus.COMPLETED}>Completed</SelectItem>
                        <SelectItem value={ProgramStatus.ARCHIVED}>Archived</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="w-full sm:w-[140px] h-10 bg-white border-slate-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4 text-slate-500" />
                          <SelectValue placeholder="Category" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value={ProgramCategory.EDUCATION}>Education</SelectItem>
                        <SelectItem value={ProgramCategory.ENTREPRENEURSHIP}>Entrepreneurship</SelectItem>
                        <SelectItem value={ProgramCategory.HEALTH}>Health</SelectItem>
                        <SelectItem value={ProgramCategory.CROSS_CUTTING}>Cross Cutting</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* View Toggle */}
                    <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                      <Button
                        size="sm"
                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                        className={cn(
                          "h-8 w-8 p-0",
                          viewMode === 'grid' && "bg-white shadow-sm"
                        )}
                        onClick={() => setViewMode('grid')}
                      >
                        <Grid3x3 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                        className={cn(
                          "h-8 w-8 p-0",
                          viewMode === 'list' && "bg-white shadow-sm"
                        )}
                        onClick={() => setViewMode('list')}
                      >
                        <LayoutList className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Programs Display */}
          <motion.div variants={fadeInUp}>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="border border-slate-200 animate-pulse">
                    <div className="h-40 bg-slate-200" />
                    <CardContent className="p-5 space-y-3">
                      <div className="h-4 w-3/4 bg-slate-200 rounded" />
                      <div className="h-3 w-1/2 bg-slate-200 rounded" />
                      <div className="h-8 w-full bg-slate-200 rounded" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredPrograms.length === 0 ? (
              <Card className="border border-slate-200 bg-white">
                <CardContent className="py-16 text-center">
                  <div className="flex flex-col items-center justify-center gap-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-white rounded-full blur-3xl" />
                      <Target className="w-16 h-16 text-slate-300 relative" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-xl font-bold text-slate-400">
                        No programs found
                      </p>
                      <p className="text-sm text-slate-400">
                        Try adjusting your filters or create a new program
                      </p>
                    </div>
                    <Button
                      className="mt-4 bg-teal-600 hover:bg-teal-700 text-white rounded-lg px-6"
                      onClick={() => { resetForm(); setCreateDialogOpen(true); }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Program
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : viewMode === 'grid' ? (
              /* Grid View with Homepage Design - Including Cover Image */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredPrograms.map((program, index) => {
                    // Color schemes based on index to create visual variety (like homepage)
                    const colorSchemes = [
                      {
                        primary: '#4FB1A1',      // Primary green
                        secondary: '#eacfa2',     // Beige
                        icon: '#4FB1A1',
                        statusBg: '#4FB1A115',
                        statusIcon: '#4FB1A1',
                        dotColor: '#4FB1A1'
                      },
                      {
                        primary: '#076c5b',      // Dark green
                        secondary: '#4FB1A1',     // Primary green
                        icon: '#076c5b',
                        statusBg: '#076c5b15',
                        statusIcon: '#076c5b',
                        dotColor: '#076c5b'
                      },
                      {
                        primary: '#eacfa2',      // Beige
                        secondary: '#4FB1A1',     // Primary green
                        icon: '#c4a56e',
                        statusBg: '#eacfa225',
                        statusIcon: '#c4a56e',
                        dotColor: '#eacfa2'
                      }
                    ];

                    const colors = colorSchemes[index % colorSchemes.length];

                    // SVG paths for variety (like homepage)
                    const svgPaths = [
                      'M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z',
                      'M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z',
                      'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'
                    ];

                    const svgPath = svgPaths[index % svgPaths.length];

                    // Extract program information
                    const programName = program.name?.en || 'Program Name';
                    const programDescription = program.description?.en || 'No description available.';

                    // Create features based on program data (matches homepage style)
                    const features = [
                      `💰 Budget: ${formatCurrency(program.budget || 0)}`,
                      `👥 Beneficiaries: ${program.beneficiaries?.length || 0}`,
                      `📊 Projects: ${program.projects?.length || 0}`,
                      program.sdgAlignment?.length ? `🎯 SDG: ${program.sdgAlignment.join(', ')}` : '🌍 Global Impact'
                    ];

                    // Get status configuration
                    const statusConfig = getStatusConfig(program.status);
                    const statusLabel = statusConfig.label;
                    const StatusIcon = statusConfig.icon;

                    // Calculate budget progress
                    const budgetProgress = program.budget > 0 ?
                      Math.min(((program.fundsUtilized || 0) / program.budget) * 100, 100) : 0;

                    return (
                      <motion.div
                        key={program.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="col-span-1 ftco-animate"
                      >
                        {/* Main Card - Matches homepage design exactly with cover image */}
                        <div
                          className="program-card overflow-hidden"
                          style={{
                            borderRadius: '20px',
                            boxShadow: '0 15px 40px rgba(18, 47, 43, 0.06)',
                            border: 'none',
                            height: '100%',
                            position: 'relative',
                            backgroundColor: '#ffffff',
                            transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-5px)';
                            e.currentTarget.style.boxShadow = '0 25px 50px rgba(18, 47, 43, 0.12)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 15px 40px rgba(18, 47, 43, 0.06)';
                          }}
                        >
                          {/* Cover Image Section - New addition */}
                          <div className="position-relative" style={{ height: '160px', overflow: 'hidden' }}>
                            {program.coverImage ? (
                              <img
                                src={program.coverImage}
                                alt={programName}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                  transition: 'transform 0.7s ease'
                                }}
                                className="program-cover-image"
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                              />
                            ) : (
                              <div
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  background: `linear-gradient(135deg, ${colors.primary}20, ${colors.secondary}20)`,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                <Target size={48} color={colors.primary} style={{ opacity: 0.5 }} />
                              </div>
                            )}

                            {/* Gradient Overlay for better text visibility if needed */}
                            <div
                              style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                height: '50%',
                                background: 'linear-gradient(to top, rgba(0,0,0,0.3), transparent)',
                                pointerEvents: 'none'
                              }}
                            />

                            {/* Status Badge - Positioned on cover image */}
                            <div
                              className="position-absolute"
                              style={{
                                top: '12px',
                                right: '12px',
                                zIndex: 2
                              }}
                            >
                              <div
                                className="program-card-status px-3 py-1 d-flex align-items-center"
                                style={{
                                  backgroundColor: colors.statusBg,
                                  borderRadius: '50px',
                                  fontSize: '12px',
                                  fontWeight: '700',
                                  color: colors.statusIcon,
                                  backdropFilter: 'blur(4px)',
                                  border: '1px solid rgba(255,255,255,0.2)',
                                  transition: 'transform 0.3s ease'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                              >
                                <StatusIcon
                                  size={12}
                                  className="mr-2"
                                  style={{ stroke: colors.statusIcon }}
                                />
                                {statusLabel}
                              </div>
                            </div>

                            {/* Logo - Positioned on cover image if exists */}
                            {program.logo && (
                              <div
                                className="position-absolute"
                                style={{
                                  bottom: '12px',
                                  left: '12px',
                                  zIndex: 2
                                }}
                              >
                                <Avatar
                                  className="h-10 w-10 ring-2 ring-white shadow-lg"
                                  style={{
                                    transition: 'transform 0.3s ease'
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                  <AvatarImage src={program.logo} />
                                  <AvatarFallback className="bg-teal-100 text-teal-800 text-xs font-bold">
                                    {program.name.en.substring(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                              </div>
                            )}
                          </div>

                          {/* Dual color top border - Now below cover image */}
                          <div className="program-card-border d-flex" style={{ height: '5px' }}>
                            <div style={{ flex: 1, backgroundColor: colors.primary }}></div>
                            <div style={{ flex: 1, backgroundColor: colors.secondary }}></div>
                          </div>

                          <div className="p-4">
                            {/* Header with SVG Icon and Title */}
                            <div className="d-flex align-items-center mb-3">
                              <div className="mr-3 d-flex align-items-center justify-content-center" style={{
                                width: '40px',
                                height: '40px',
                                flexShrink: 0
                              }}>
                                <svg
                                  className="program-card-icon"
                                  width="32"
                                  height="32"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                  style={{ transition: 'transform 0.3s ease' }}
                                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                  <path d={svgPath} fill={colors.icon} />
                                </svg>
                              </div>
                              <div>
                                <h3 className="program-card-title mb-0" style={{
                                  fontWeight: 800,
                                  fontSize: '18px',
                                  color: '#122f2b',
                                  lineHeight: '1.2',
                                  fontFamily: "'Poppins', sans-serif",
                                  transition: 'color 0.3s ease'
                                }}
                                  onMouseEnter={(e) => e.currentTarget.style.color = '#17D1AC'}
                                  onMouseLeave={(e) => e.currentTarget.style.color = '#122f2b'}>
                                  {programName}
                                </h3>
                                <span className="program-card-subtitle" style={{
                                  fontSize: '12px',
                                  letterSpacing: '0.3px',
                                  color: '#666',
                                  fontWeight: 600
                                }}>
                                  {program.category?.replace(/_/g, ' ') || 'Program'}
                                </span>
                              </div>
                            </div>

                            {/* Description */}
                            <p className="program-card-desc mb-3" style={{
                              color: '#444',
                              fontSize: '14px',
                              lineHeight: '1.7',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}>
                              {programDescription}
                            </p>

                            {/* Features Section */}
                            <div className="program-card-features-box mb-4 p-3" style={{
                              backgroundColor: '#f9fbfb',
                              borderRadius: '14px',
                              border: '1px solid #eef2f2'
                            }}>
                              <h4 className="program-card-features-title mb-2" style={{
                                fontSize: '13px',
                                fontWeight: 700,
                                color: '#122f2b',
                                fontFamily: "'Poppins', sans-serif"
                              }}>
                                Key Details:
                              </h4>
                              <ul className="list-unstyled mb-0">
                                {features.map((feature, fIndex) => (
                                  <li key={fIndex} className="d-flex align-items-start mb-1" style={{ fontSize: '13px' }}>
                                    <span
                                      className="program-card-feature-dot mr-2 mt-1"
                                      style={{
                                        width: '6px',
                                        height: '6px',
                                        backgroundColor: colors.dotColor,
                                        borderRadius: '50%',
                                        flexShrink: 0,
                                        display: 'inline-block',
                                        transition: 'transform 0.3s ease'
                                      }}
                                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.5)'}
                                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                    />
                                    <span className="program-card-feature-text" style={{
                                      lineHeight: '1.5',
                                      color: '#555'
                                    }}>
                                      {feature}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Budget Progress Bar */}
                            {program.budget > 0 && (
                              <div className="mb-4">
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                  <span style={{ fontSize: '12px', color: '#666' }}>Budget Progress</span>
                                  <span style={{ fontSize: '12px', fontWeight: 600, color: colors.primary }}>
                                    {Math.round(budgetProgress)}%
                                  </span>
                                </div>
                                <div className="w-100 bg-slate-200 rounded-pill" style={{ height: '4px', overflow: 'hidden' }}>
                                  <div
                                    style={{
                                      width: `${budgetProgress}%`,
                                      height: '100%',
                                      backgroundColor: budgetProgress >= 75 ? colors.primary :
                                        budgetProgress >= 50 ? '#3b82f6' :
                                          budgetProgress >= 25 ? '#f59e0b' : '#f43f5e',
                                      transition: 'width 0.3s ease'
                                    }}
                                  />
                                </div>
                              </div>
                            )}

                            {/* Footer with Action Buttons */}
                            <div className="d-flex justify-content-end align-items-center">
                              {/* Admin Actions */}
                              <div className="d-flex gap-2">
                                {/* View Details Button */}
                                <button
                                  className="btn btn-sm d-flex align-items-center justify-content-center"
                                  style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '8px',
                                    backgroundColor: '#f0f9f7',
                                    border: 'none',
                                    color: colors.primary,
                                    transition: 'all 0.2s ease'
                                  }}
                                  onClick={() => navigate(`/admin/programs/${program.id}`)}
                                  title="View Details"
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                  }}
                                >
                                  <Eye size={16} />
                                </button>

                                {/* More Actions Dropdown */}
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <button
                                      className="btn btn-sm d-flex align-items-center justify-content-center"
                                      style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '8px',
                                        backgroundColor: '#f8f9fa',
                                        border: 'none',
                                        color: '#666',
                                        transition: 'all 0.2s ease'
                                      }}
                                      onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = 'none';
                                      }}
                                    >
                                      <MoreVertical size={16} />
                                    </button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-40">
                                    <DropdownMenuItem onClick={() => { setSelectedProgram(program); setEditDialogOpen(true); }}>
                                      <Edit className="w-4 h-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="text-red-600"
                                      onClick={() => handleDelete(program.id)}
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            ) : (
              /* List View */
              <Card className="border border-slate-200 bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Program</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Budget</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Progress</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Beneficiaries</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredPrograms.map((program) => {
                        const categoryConfig = getCategoryConfig(program.category);
                        const statusConfig = getStatusConfig(program.status);
                        const StatusIcon = statusConfig.icon;
                        const budgetProgress = program.budget > 0 ?
                          Math.min(((program.fundsUtilized || 0) / program.budget) * 100, 100) : 0;

                        return (
                          <tr key={program.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={program.logo ?? program.coverImage ?? undefined} />
                                  <AvatarFallback className="bg-teal-100 text-teal-800 text-xs">
                                    {program.name.en.substring(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium text-sm text-slate-900">
                                    {program.name.en}
                                  </div>
                                  <div className="text-xs text-slate-500">
                                    SDG: {program.sdgAlignment?.join(', ') || 'N/A'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <Badge className={cn(
                                "px-2 py-1 text-[10px] font-medium",
                                categoryConfig.bg,
                                categoryConfig.text
                              )}>
                                {categoryConfig.icon} {categoryConfig.label}
                              </Badge>
                            </td>
                            <td className="px-6 py-4">
                              <Badge className={cn(
                                "px-2 py-1 text-[10px] font-medium",
                                statusConfig.bg,
                                statusConfig.text
                              )}>
                                <StatusIcon className="w-3 h-3 mr-1 inline-block" />
                                {statusConfig.label}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 text-sm font-medium">
                              {formatCurrency(program.budget)}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <Progress value={budgetProgress} className="w-24 h-1.5" />
                                <span className="text-xs font-medium">{Math.round(budgetProgress)}%</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm">
                              {program.beneficiaries?.length || 0}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-8 w-8 hover:bg-blue-50 text-blue-600"
                                      onClick={() => navigate(`/admin/programs/${program.id}`)}
                                    >
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>View Details</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-8 w-8 hover:bg-amber-50 text-amber-600"
                                      onClick={() => { setSelectedProgram(program); setEditDialogOpen(true); }}
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Edit</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-8 w-8 hover:bg-red-50 text-red-600"
                                      onClick={() => handleDelete(program.id)}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Delete</TooltipContent>
                                </Tooltip>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-xs text-slate-500">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalPrograms)} of {totalPrograms} programs
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
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum = currentPage;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <Button
                          key={i}
                          variant={currentPage === pageNum ? 'default' : 'outline'}
                          size="sm"
                          className={cn(
                            "h-8 w-8 p-0 text-xs",
                            currentPage === pageNum && "bg-teal-600 hover:bg-teal-700"
                          )}
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
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
            )}
          </motion.div>

        </div>

        {/* Create Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={(open) => {
          if (!open) resetForm();
          setCreateDialogOpen(open);
        }}>
          <DialogContent className="sm:max-w-[800px] w-[95%] md:w-full p-0">
            {/* Main container with max height */}
            <div className="flex flex-col" style={{ maxHeight: '90vh' }}>
              {/* Fixed Header */}
              <div className="px-6 py-4 border-b">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold">Create New Program</DialogTitle>
                  <DialogDescription>
                    Fill in the details below to create a new impact program.
                  </DialogDescription>
                </DialogHeader>
              </div>

              {/* Scrollable Content - THIS IS THE KEY PART */}
              <div className="overflow-y-auto flex-1 px-6 py-4" style={{ maxHeight: 'calc(90vh - 130px)' }}>
                <form onSubmit={handleCreate} id="create-program-form">
                  <ProgramForm
                    formData={formData}
                    setFormData={setFormData}
                    sdgInput={sdgInput}
                    setSdgInput={setSdgInput}
                    coverFile={coverFile}
                    setCoverFile={setCoverFile}
                    coverPreview={coverPreview}
                    setCoverPreview={setCoverPreview}
                    logoFile={logoFile}
                    setLogoFile={setLogoFile}
                    logoPreview={logoPreview}
                    setLogoPreview={setLogoPreview}
                    isSubmitting={isSubmitting}
                    onSubmit={handleCreate}
                    submitLabel="Create Program"
                    onCancel={() => {
                      resetForm();
                      setCreateDialogOpen(false);
                    }}
                  />
                </form>
              </div>

              {/* Fixed Footer */}
              <div className="px-6 py-4 border-t flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    setCreateDialogOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  form="create-program-form"
                  disabled={isSubmitting}
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Program
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={(open) => {
          if (!open) resetForm();
          setEditDialogOpen(open);
        }}>
          <DialogContent className="sm:max-w-[800px] w-[95%] md:w-full p-0">
            {/* Main container with max height */}
            <div className="flex flex-col" style={{ maxHeight: '90vh' }}>
              {/* Fixed Header */}
              <div className="px-6 py-4 border-b">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold">Edit Program</DialogTitle>
                  <DialogDescription>
                    Update the program details below.
                  </DialogDescription>
                </DialogHeader>
              </div>

              {/* Scrollable Content - THIS IS THE KEY PART */}
              <div className="overflow-y-auto flex-1 px-6 py-4" style={{ maxHeight: 'calc(90vh - 130px)' }}>
                <form onSubmit={handleUpdate} id="edit-program-form">
                  <ProgramForm
                    formData={formData}
                    setFormData={setFormData}
                    sdgInput={sdgInput}
                    setSdgInput={setSdgInput}
                    coverFile={coverFile}
                    setCoverFile={setCoverFile}
                    coverPreview={coverPreview}
                    setCoverPreview={setCoverPreview}
                    logoFile={logoFile}
                    setLogoFile={setLogoFile}
                    logoPreview={logoPreview}
                    setLogoPreview={setLogoPreview}
                    isSubmitting={isSubmitting}
                    onSubmit={handleUpdate}
                    submitLabel="Save Changes"
                    onCancel={() => {
                      resetForm();
                      setEditDialogOpen(false);
                    }}
                  />
                </form>
              </div>

              {/* Fixed Footer */}
              <div className="px-6 py-4 border-t flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    setEditDialogOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  form="edit-program-form"
                  disabled={isSubmitting}
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Mobile FAB */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="fixed bottom-6 right-6 md:hidden z-50"
        >
          <Button
            className="h-14 w-14 rounded-full bg-teal-600 hover:bg-teal-700 text-white shadow-xl"
            onClick={() => { resetForm(); setCreateDialogOpen(true); }}
          >
            <Plus className="w-6 h-6" />
          </Button>
        </motion.div>
      </motion.div>
    </TooltipProvider>
  );
}