import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Image,
  Video,
  File,
  Download,
  Eye,
  Trash2,
  MoreVertical,
  Loader2,
  Plus,
  Search,
  Filter,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  FileImage,
  FileVideo,
  FileArchive,
  FileSpreadsheet,
  FilePieChart,
  FileCode,
  HardDrive,
  Calendar,
  User,
  Shield,
  Sparkles,
  Grid3x3,
  LayoutList,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
import { beneficiaryService } from '@/services/beneficiary.service';
import { BeneficiaryDocument, DocumentStats } from '@/lib/types/document';

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

// Document type icons and colors
const documentTypeConfig: Record<string, { icon: any; color: string; bg: string }> = {
  'school_certificate': {
    icon: FileText,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-100 dark:bg-blue-900/30'
  },
  'medical_report': {
    icon: FileText,
    color: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-100 dark:bg-rose-900/30'
  },
  'identification': {
    icon: FileText,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-100 dark:bg-amber-900/30'
  },
  'business_license': {
    icon: FileText,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-100 dark:bg-emerald-900/30'
  },
  'other': {
    icon: File,
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-100 dark:bg-purple-900/30'
  }
};

// File type icons based on mime type
const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return Image;
  if (mimeType.startsWith('video/')) return Video;
  if (mimeType.includes('pdf')) return FileText;
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return FileSpreadsheet;
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return FilePieChart;
  if (mimeType.includes('zip') || mimeType.includes('archive')) return FileArchive;
  if (mimeType.includes('code') || mimeType.includes('javascript') || mimeType.includes('json')) return FileCode;
  return File;
};

// Format file size
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function DocumentsPage() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<BeneficiaryDocument[]>([]);
  const [stats, setStats] = useState<DocumentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<BeneficiaryDocument | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    try {
      // Fetch documents and stats in parallel
      const [docsResponse, statsResponse] = await Promise.all([
        beneficiaryService.getDocuments(),
        beneficiaryService.getDocumentStats()
      ]);

      // ✅ ROBUST EXTRACTION PATTERN for documents
      const docsData = docsResponse as any;
      const documentsData = docsData.data?.data || docsData.data || docsData;
      setDocuments(Array.isArray(documentsData) ? documentsData : []);

      // ✅ Extract stats
      const statsData = statsResponse as any;
      const statsResult = statsData.data || statsData;
      setStats(statsResult);

    } catch (error: any) {
      console.error('Failed to fetch documents', error);
      toast.error('Failed to load documents');
      setDocuments([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (document: BeneficiaryDocument) => {
    setSelectedDocument(document);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedDocument) return;
    
    try {
      await beneficiaryService.deleteDocument(selectedDocument.id);
      setDocuments(prev => prev.filter(d => d.id !== selectedDocument.id));
      toast.success('Document deleted successfully');
      
      // Refresh stats
      const statsResponse = await beneficiaryService.getDocumentStats();
      const statsData = statsResponse as any;
      setStats(statsData.data || statsData);
      
    } catch (error) {
      toast.error('Failed to delete document');
    } finally {
      setDeleteDialogOpen(false);
      setSelectedDocument(null);
    }
  };

  const handleDownload = async (document: BeneficiaryDocument) => {
    try {
      // Open the file URL in a new tab (will download or preview based on browser)
      window.open(document.fileUrl, '_blank');
      toast.success('Opening document...');
    } catch (error) {
      toast.error('Failed to open document');
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = searchTerm === '' || 
      doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.documentType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || doc.documentType === typeFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'verified' && doc.verified) ||
      (statusFilter === 'pending' && !doc.verified);
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // Get unique document types for filter
  const uniqueTypes = Array.from(new Set(documents.map(d => d.documentType)));

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-white rounded-full blur-3xl animate-pulse" />
              <FileText className="w-16 h-16 text-blue-600 relative animate-bounce" />
            </div>
            <p className="text-slate-500 dark:text-slate-400 animate-pulse">Loading your documents...</p>
          </div>
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
        className="min-h-screen bg-white dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/20"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-6 sm:space-y-8">
          
          {/* Header */}
          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                  My Documents
                </h1>
                <Badge variant="outline" className="ml-2 text-xs font-medium bg-white/80">
                  {stats?.total || 0} Total
                </Badge>
              </div>
              <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-1">
                <FileText className="w-4 h-4" />
                <span>Manage and organize your important documents</span>
              </p>
            </div>

            <Button
              className="h-9 sm:h-10 px-4 sm:px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs sm:text-sm font-medium shadow-lg shadow-blue-600/20 transition-all active:scale-95"
              onClick={() => navigate('/beneficiary/documents/upload')}
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              Upload Document
            </Button>
          </motion.div>

          {/* Stats Cards */}
          {stats && (
            <motion.div variants={fadeInUp} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <Card className="border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-slate-500 mb-1">Total Documents</p>
                      <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                        {stats.total}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                      <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-slate-500 mb-1">Verified</p>
                      <p className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        {stats.verified}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-slate-500 mb-1">Pending</p>
                      <p className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400">
                        {stats.pending}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/30">
                      <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-slate-500 mb-1">Types</p>
                      <p className="text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {stats.byType.length}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30">
                      <Filter className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Document Type Distribution */}
          {stats && stats.byType.length > 0 && (
            <motion.div variants={fadeInUp}>
              <Card className="border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">Documents by Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {stats.byType.map((item, index) => {
                      const config = documentTypeConfig[item.documenttype] || documentTypeConfig.other;
                      const Icon = config.icon;
                      return (
                        <Badge
                          key={index}
                          variant="outline"
                          className={cn(
                            "px-3 py-1.5 text-xs font-medium border-slate-200 dark:border-slate-700",
                            config.bg,
                            config.color
                          )}
                        >
                          <Icon className="w-3 h-3 mr-1 inline-block" />
                          {item.documenttype.replace('_', ' ')}: {item.total}
                        </Badge>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Filters and Search */}
          <motion.div variants={fadeInUp}>
            <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 p-4 sm:p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search by file name or type..."
                  className="w-full h-10 pl-10 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-lg text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full sm:w-[140px] lg:w-[160px] h-10 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-slate-500" />
                      <SelectValue placeholder="Document Type" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                    <SelectItem value="all">All Types</SelectItem>
                    {uniqueTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[140px] lg:w-[160px] h-10 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-slate-500" />
                      <SelectValue placeholder="Status" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>

                {/* View Toggle */}
                <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  <Button
                    size="sm"
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    className={cn(
                      "h-8 w-8 p-0",
                      viewMode === 'grid' && "bg-white dark:bg-slate-950 shadow-sm"
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
                      viewMode === 'list' && "bg-white dark:bg-slate-950 shadow-sm"
                    )}
                    onClick={() => setViewMode('list')}
                  >
                    <LayoutList className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Documents Grid/List */}
          <motion.div variants={fadeInUp}>
            {filteredDocuments.length === 0 ? (
              <Card className="border-dashed border-2 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <CardContent className="py-16 text-center">
                  <div className="flex flex-col items-center justify-center gap-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-white rounded-full blur-3xl" />
                      <FileText className="w-16 h-16 text-slate-300 dark:text-slate-600 relative" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-xl font-bold text-slate-400 dark:text-slate-600">
                        No documents found
                      </p>
                      <p className="text-sm text-slate-400">
                        {searchTerm || typeFilter !== 'all' || statusFilter !== 'all'
                          ? 'Try adjusting your filters'
                          : 'Upload your first document to get started'}
                      </p>
                    </div>
                    <Button
                      className="mt-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6"
                      onClick={() => navigate('/beneficiary/documents/upload')}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Upload Document
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : viewMode === 'grid' ? (
              /* Grid View */
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence mode="popLayout">
                  {filteredDocuments.map((doc) => {
                    const FileIcon = getFileIcon(doc.mimeType);
                    const typeConfig = documentTypeConfig[doc.documentType] || documentTypeConfig.other;
                    
                    return (
                      <motion.div
                        key={doc.id}
                        variants={fadeInUp}
                        layout
                        exit={{ opacity: 0, scale: 0.9 }}
                      >
                        <Card className="h-full border border-slate-200 dark:border-slate-800 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] overflow-hidden">
                          <CardHeader className="p-5 pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className={cn("p-2.5 rounded-xl", typeConfig.bg)}>
                                  <FileIcon className={cn("w-5 h-5", typeConfig.color)} />
                                </div>
                                <div className="space-y-1">
                                  <CardTitle className="text-base font-bold line-clamp-1">
                                    {doc.fileName}
                                  </CardTitle>
                                  <CardDescription className="text-xs">
                                    {doc.documentType.replace('_', ' ')}
                                  </CardDescription>
                                </div>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 -mt-1 -mr-2">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-40">
                                  <DropdownMenuLabel className="text-xs">Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleDownload(doc)}>
                                    <Download className="w-4 h-4 mr-2" />
                                    Download
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => navigate(`/beneficiary/documents/${doc.id}`)}>
                                    <Eye className="w-4 h-4 mr-2" />
                                    Preview
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    className="text-red-600"
                                    onClick={() => handleDelete(doc)}
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </CardHeader>

                          <CardContent className="p-5 pt-0 space-y-3">
                            {/* File Info */}
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm">
                                <HardDrive className="w-4 h-4 text-slate-400" />
                                <span className="text-xs text-slate-600 dark:text-slate-400">
                                  {formatFileSize(doc.fileSize)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Calendar className="w-4 h-4 text-slate-400" />
                                <span className="text-xs text-slate-600 dark:text-slate-400">
                                  {format(new Date(doc.createdAt), 'MMM d, yyyy')}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <User className="w-4 h-4 text-slate-400" />
                                <span className="text-xs text-slate-600 dark:text-slate-400">
                                  {doc.uploadedBy.fullName}
                                </span>
                              </div>
                            </div>

                            {/* Status Badge */}
                            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                              <Badge
                                className={cn(
                                  "px-2 py-0.5 text-[10px] font-medium",
                                  doc.verified
                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                    : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                )}
                              >
                                {doc.verified ? (
                                  <>
                                    <CheckCircle2 className="w-3 h-3 mr-1 inline-block" />
                                    Verified
                                  </>
                                ) : (
                                  <>
                                    <Clock className="w-3 h-3 mr-1 inline-block" />
                                    Pending
                                  </>
                                )}
                              </Badge>

                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2 text-xs hover:bg-blue-50 text-blue-600"
                                onClick={() => navigate(`/beneficiary/documents/${doc.id}`)}
                              >
                                Preview
                                <ChevronRight className="w-3 h-3 ml-1" />
                              </Button>
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
              <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">File</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Size</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Uploaded</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredDocuments.map((doc) => {
                        const FileIcon = getFileIcon(doc.mimeType);
                        const typeConfig = documentTypeConfig[doc.documentType] || documentTypeConfig.other;
                        
                        return (
                          <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className={cn("p-2 rounded-lg", typeConfig.bg)}>
                                  <FileIcon className={cn("w-4 h-4", typeConfig.color)} />
                                </div>
                                <div>
                                  <div className="font-medium text-sm text-slate-900 dark:text-white">
                                    {doc.fileName}
                                  </div>
                                  <div className="text-xs text-slate-500">
                                    {doc.documentType.replace('_', ' ')}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm capitalize">
                              {doc.documentType.replace('_', ' ')}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              {formatFileSize(doc.fileSize)}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              {formatDistanceToNow(new Date(doc.createdAt), { addSuffix: true })}
                            </td>
                            <td className="px-6 py-4">
                              <Badge
                                className={cn(
                                  "px-2 py-0.5 text-[10px] font-medium",
                                  doc.verified
                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                    : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                )}
                              >
                                {doc.verified ? 'Verified' : 'Pending'}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-8 w-8 hover:bg-blue-50 text-blue-600"
                                      onClick={() => handleDownload(doc)}
                                    >
                                      <Download className="w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Download</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-8 w-8 hover:bg-indigo-50 text-indigo-600"
                                      onClick={() => navigate(`/beneficiary/documents/${doc.id}`)}
                                    >
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Preview</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-8 w-8 hover:bg-red-50 text-red-600"
                                      onClick={() => handleDelete(doc)}
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
          </motion.div>
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Delete Document</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{selectedDocument?.fileName}"? 
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Delete Document
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    </TooltipProvider>
  );
}