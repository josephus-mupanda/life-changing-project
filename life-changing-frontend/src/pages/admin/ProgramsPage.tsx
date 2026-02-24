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
            label="Description (English)"
          />
        </div>

        <div>
          <Label htmlFor="descRw" className="text-xs font-medium text-slate-600 mb-2 block">Description (Kinyarwanda) *</Label>
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

    <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
      <Button variant="outline" type="button" onClick={onCancel} className="h-9 px-4 text-xs font-medium">
        Cancel
      </Button>
      <Button type="submit" disabled={isSubmitting} className="h-9 px-5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium">
        {isSubmitting && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
        {submitLabel}
      </Button>
    </div>
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
              /* Grid View */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredPrograms.map((program) => {
                    const categoryConfig = getCategoryConfig(program.category);
                    const statusConfig = getStatusConfig(program.status);
                    const StatusIcon = statusConfig.icon;
                    const budgetProgress = program.budget > 0 ?
                      Math.min(((program.fundsUtilized || 0) / program.budget) * 100, 100) : 0;

                    return (
                      <motion.div
                        key={program.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Card className="group h-full border border-slate-200 bg-white hover:shadow-2xl transition-all duration-500 overflow-hidden">
                          {/* Cover Image */}
                          <div className="relative h-40 overflow-hidden">
                            {program.coverImage ? (
                              <img
                                src={program.coverImage}
                                alt={program.name.en}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                              />
                            ) : (
                              <div className="w-full h-full bg-white flex items-center justify-center">
                                <Target className="w-12 h-12 text-slate-400" />
                              </div>
                            )}

                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-white" />

                            {/* Category Badge */}
                            <div className="absolute top-3 left-3">
                              <Badge className={cn(
                                "px-2 py-1 text-[10px] font-bold uppercase tracking-wider border-0",
                                categoryConfig.bg,
                                categoryConfig.text
                              )}>
                                <span className="mr-1">{categoryConfig.icon}</span>
                                {categoryConfig.label}
                              </Badge>
                            </div>

                            {/* Status Badge */}
                            <div className="absolute top-3 right-3">
                              <Badge className={cn(
                                "px-2 py-1 text-[10px] font-bold uppercase tracking-wider border-0",
                                statusConfig.bg,
                                statusConfig.text
                              )}>
                                <StatusIcon className="w-3 h-3 mr-1 inline-block" />
                                {statusConfig.label}
                              </Badge>
                            </div>

                            {/* Logo if exists */}
                            {program.logo && (
                              <div className="absolute bottom-3 left-3">
                                <Avatar className="h-10 w-10 ring-2 ring-white">
                                  <AvatarImage src={program.logo} />
                                  <AvatarFallback className="bg-teal-100 text-teal-800 text-xs">
                                    {program.name.en.substring(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                              </div>
                            )}
                          </div>

                          <CardContent className="p-5">
                            {/* Title & SDG */}
                            <div className="mb-3">
                              <h3 className="text-base font-bold text-slate-900 mb-1 line-clamp-1">
                                {program.name.en}
                              </h3>
                              <div className="flex items-center gap-2">
                                <Globe className="w-3 h-3 text-slate-400" />
                                <span className="text-xs text-slate-500">
                                  SDG: {program.sdgAlignment?.join(', ') || 'N/A'}
                                </span>
                              </div>
                            </div>

                            {/* Description */}
                            <p className="text-xs text-slate-600 mb-4 line-clamp-2">
                              {program.description.en || 'No description available.'}
                            </p>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-3 mb-4">
                              <div className="bg-slate-50 rounded-lg p-2">
                                <div className="flex items-center gap-1 text-[10px] text-slate-500 mb-1">
                                  <Users className="w-3 h-3" />
                                  Beneficiaries
                                </div>
                                <span className="text-sm font-bold text-slate-900">
                                  {program.beneficiaries?.length || 0}
                                </span>
                              </div>
                              <div className="bg-slate-50 rounded-lg p-2">
                                <div className="flex items-center gap-1 text-[10px] text-slate-500 mb-1">
                                  <FolderKanban className="w-3 h-3" />
                                  Projects
                                </div>
                                <span className="text-sm font-bold text-slate-900">
                                  {program.projects?.length || 0}
                                </span>
                              </div>
                            </div>

                            {/* Budget Progress */}
                            <div className="space-y-2 mb-4">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-500">Budget Progress</span>
                                <span className="font-medium text-slate-900">
                                  {Math.round(budgetProgress)}%
                                </span>
                              </div>
                              <Progress
                                value={budgetProgress}
                                className={cn(
                                  "h-1.5",
                                  budgetProgress >= 75 ? "bg-emerald-500" :
                                    budgetProgress >= 50 ? "bg-blue-500" :
                                      budgetProgress >= 25 ? "bg-amber-500" : "bg-rose-500"
                                )}
                              />
                              <div className="flex items-center justify-between text-[10px] text-slate-400">
                                <span>₣{program.fundsUtilized?.toLocaleString() || 0}</span>
                                <span>₣{program.budget.toLocaleString()}</span>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2">
                              <Button
                                className="flex-1 h-8 bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium rounded-lg"
                                onClick={() => navigate(`/admin/programs/${program.id}`)}
                              >
                                <Eye className="w-3.5 h-3.5 mr-1.5" />
                                View Details
                              </Button>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="outline" size="icon" className="h-8 w-8 border-slate-200">
                                    <MoreVertical className="w-3.5 h-3.5" />
                                  </Button>
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
                          </CardContent>
                        </Card>
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
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Create New Program</DialogTitle>
              <DialogDescription>
                Fill in the details below to create a new impact program.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate}>
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
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={(open) => {
          if (!open) resetForm();
          setEditDialogOpen(open);
        }}>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Edit Program</DialogTitle>
              <DialogDescription>
                Update the program details below.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdate}>
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