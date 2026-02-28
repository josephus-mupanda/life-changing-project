// pages/beneficiary/DocumentsPage.tsx
import { useState, useEffect, useCallback } from 'react';
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
  AlertCircle,
  X,
  Upload,
  Save,
  HelpCircle,
  Layers,
  Copy,
  ExternalLink,
  ArrowLeft
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { useDropzone } from 'react-dropzone';

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

// Document type options
const documentTypeOptions = [
  { value: 'id_card', label: 'ID Card', icon: '🆔' },
  { value: 'birth_certificate', label: 'Birth Certificate', icon: '👶' },
  { value: 'school_certificate', label: 'School Certificate', icon: '🎓' },
  { value: 'medical_report', label: 'Medical Report', icon: '🏥' },
  { value: 'business_license', label: 'Business License', icon: '📄' },
  { value: 'other', label: 'Other', icon: '📁' }
];

// Document type icons and colors
const documentTypeConfig: Record<string, { icon: any; color: string; bg: string }> = {
  'id_card': {
    icon: FileText,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-100 dark:bg-blue-900/30'
  },
  'birth_certificate': {
    icon: FileText,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-100 dark:bg-amber-900/30'
  },
  'school_certificate': {
    icon: FileText,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-100 dark:bg-emerald-900/30'
  },
  'medical_report': {
    icon: FileText,
    color: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-100 dark:bg-rose-900/30'
  },
  'business_license': {
    icon: FileText,
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-100 dark:bg-purple-900/30'
  },
  'other': {
    icon: File,
    color: 'text-slate-600 dark:text-slate-400',
    bg: 'bg-slate-100 dark:bg-slate-900/30'
  }
};

// Max file size (20MB)
const MAX_FILE_SIZE = 20 * 1024 * 1024;

// Format file size
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

// Check if file can be previewed in browser
const canPreview = (mimeType: string): boolean => {
  return (
    mimeType.startsWith('image/') ||
    mimeType.startsWith('video/') ||
    mimeType === 'application/pdf' ||
    mimeType === 'text/plain' ||
    mimeType.includes('text/html') ||
    mimeType.includes('text/css') ||
    mimeType.includes('application/json')
  );
};

// Get Google Docs viewer URL for unsupported files
const getGoogleViewerUrl = (fileUrl: string): string => {
  return `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`;
};

// Upload Document Dialog Component
interface UploadDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

function UploadDocumentDialog({ open, onOpenChange, onSuccess }: UploadDocumentDialogProps) {
  const [uploadMode, setUploadMode] = useState<'single' | 'multiple'>('single');
  const [files, setFiles] = useState<File[]>([]);
  const [documentType, setDocumentType] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Single file dropzone
  const onSingleDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);

    if (acceptedFiles.length === 0) return;

    const selectedFile = acceptedFiles[0];

    // Check file size
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError('File size exceeds 20MB limit');
      return;
    }

    setFiles([selectedFile]);
  }, []);

  // Multiple files dropzone
  const onMultipleDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);

    if (acceptedFiles.length === 0) return;

    // Check each file size
    const oversizedFiles = acceptedFiles.filter(f => f.size > MAX_FILE_SIZE);
    if (oversizedFiles.length > 0) {
      setError(`${oversizedFiles.length} file(s) exceed 20MB limit`);
      return;
    }

    setFiles(prev => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps: getSingleRootProps, getInputProps: getSingleInputProps, isDragActive: isSingleDragActive } = useDropzone({
    onDrop: onSingleDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    maxFiles: 1,
    maxSize: MAX_FILE_SIZE,
    disabled: uploadMode !== 'single'
  });

  const { getRootProps: getMultipleRootProps, getInputProps: getMultipleInputProps, isDragActive: isMultipleDragActive } = useDropzone({
    onDrop: onMultipleDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    maxSize: MAX_FILE_SIZE,
    disabled: uploadMode !== 'multiple'
  });

  const resetForm = () => {
    setFiles([]);
    setDocumentType('');
    setError(null);
    setUploadProgress(0);
    setUploadMode('single');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (files.length === 0) {
      toast.error('Please select at least one file to upload');
      return;
    }

    if (!documentType) {
      toast.error('Please select a document type');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 300);

      if (uploadMode === 'single') {
        // Upload single document
        await beneficiaryService.uploadDocument(files[0], documentType);
        toast.success('Document uploaded successfully!', {
          description: 'Your document has been uploaded and will be reviewed.'
        });
      } else {
        // Upload multiple documents
        await beneficiaryService.uploadMultipleDocuments(files, documentType);
        toast.success(`${files.length} documents uploaded successfully!`, {
          description: 'Your documents have been uploaded and will be reviewed.'
        });
      }

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Close dialog and refresh after short delay
      setTimeout(() => {
        onSuccess();
        onOpenChange(false);
        resetForm();
      }, 1500);

    } catch (error) {
      console.error('Failed to upload document', error);
      toast.error('Failed to upload document. Please try again.');
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setError(null);
  };

  const clearAllFiles = () => {
    setFiles([]);
    setError(null);
  };

  // Get file icon based on type
  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return Image;
    if (file.type.startsWith('video/')) return Video;
    if (file.type === 'application/pdf') return FileText;
    return File;
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) resetForm();
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-[600px] w-[95%] md:w-full p-0">
        <div className="flex flex-col" style={{ maxHeight: '90vh' }}>
          {/* Fixed Header */}
          <div className="px-6 py-4 border-b">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <div className="p-2 rounded-lg bg-teal-100 text-teal-600">
                  <Upload className="w-4 h-4" />
                </div>
                Upload Documents
              </DialogTitle>
              <DialogDescription>
                Add documents to your profile
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto flex-1 p-6">
            <form id="upload-form" onSubmit={handleSubmit} className="space-y-6">

              {/* Upload Mode Tabs */}
              <Tabs
                defaultValue="single"
                onValueChange={(value) => {
                  setUploadMode(value as 'single' | 'multiple');
                  setFiles([]);
                  setError(null);
                }}
                className="mb-6"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="single" className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Single Document
                  </TabsTrigger>
                  <TabsTrigger value="multiple" className="flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    Multiple Documents
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Document Type */}
              <div className="space-y-2">
                <Label htmlFor="documentType" className="text-sm font-medium">
                  Document Type <span className="text-blue-500">*</span>
                </Label>
                <Select
                  value={documentType}
                  onValueChange={setDocumentType}
                  required
                >
                  <SelectTrigger className="border-slate-200">
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypeOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        <span className="mr-2">{option.icon}</span>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {uploadMode === 'multiple' && (
                  <p className="text-xs text-slate-500 mt-1">
                    All files will be uploaded with the same document type
                  </p>
                )}
              </div>

              {/* File Upload Area - Single */}
              {uploadMode === 'single' && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    File <span className="text-blue-500">*</span>
                  </Label>
                  <div
                    {...getSingleRootProps()}
                    className={cn(
                      "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200",
                      isSingleDragActive && "border-blue-500 bg-blue-50",
                      files.length > 0 ? "border-green-500 bg-green-50" : "border-slate-300 hover:border-blue-400 hover:bg-slate-50"
                    )}
                  >
                    <input {...getSingleInputProps()} />

                    {files.length > 0 ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-center">
                          <div className="p-3 rounded-full bg-green-100">
                            <CheckCircle2 className="w-8 h-8 text-green-600" />
                          </div>
                        </div>
                        <div>
                          <p className="font-medium text-green-600">
                            File selected successfully
                          </p>
                          <p className="text-sm text-slate-600 mt-1">
                            {files[0].name}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {formatFileSize(files[0].size)}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(0);
                          }}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Remove file
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center justify-center">
                          <div className="p-3 rounded-full bg-slate-100">
                            <Upload className="w-8 h-8 text-slate-500" />
                          </div>
                        </div>
                        <div>
                          <p className="font-medium text-slate-700">
                            {isSingleDragActive ? 'Drop your file here' : 'Drag & drop your file here'}
                          </p>
                          <p className="text-sm text-slate-500 mt-1">
                            or click to browse
                          </p>
                        </div>
                        <div className="flex items-center justify-center gap-4 text-xs text-slate-400">
                          <span>Max 20MB</span>
                          <span>•</span>
                          <span>PDF, Images, DOC</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* File Upload Area - Multiple */}
              {uploadMode === 'multiple' && (
                <div className="space-y-4">
                  <div
                    {...getMultipleRootProps()}
                    className={cn(
                      "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200",
                      isMultipleDragActive && "border-blue-500 bg-blue-50",
                      "border-slate-300 hover:border-blue-400 hover:bg-slate-50"
                    )}
                  >
                    <input {...getMultipleInputProps()} />
                    <div className="space-y-3">
                      <div className="flex items-center justify-center">
                        <div className="p-3 rounded-full bg-slate-100">
                          <Layers className="w-8 h-8 text-slate-500" />
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-slate-700">
                          {isMultipleDragActive ? 'Drop your files here' : 'Drag & drop multiple files here'}
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                          or click to browse
                        </p>
                      </div>
                      <div className="flex items-center justify-center gap-4 text-xs text-slate-400">
                        <span>Max 20MB each</span>
                        <span>•</span>
                        <span>PDF, Images, DOC</span>
                      </div>
                    </div>
                  </div>

                  {/* Selected Files List */}
                  {files.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">
                          Selected Files ({files.length})
                        </Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={clearAllFiles}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 px-2"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1" />
                          Clear all
                        </Button>
                      </div>
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                        <AnimatePresence>
                          {files.map((file, index) => {
                            const FileIcon = getFileIcon(file);
                            return (
                              <motion.div
                                key={`${file.name}-${index}`}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                              >
                                <div className="flex items-center gap-3">
                                  <FileIcon className="w-4 h-4 text-blue-600" />
                                  <div>
                                    <p className="text-sm font-medium line-clamp-1">
                                      {file.name}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                      {formatFileSize(file.size)}
                                    </p>
                                  </div>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 hover:bg-red-50 hover:text-red-600"
                                  onClick={() => removeFile(index)}
                                >
                                  <X className="w-3.5 h-3.5" />
                                </Button>
                              </motion.div>
                            );
                          })}
                        </AnimatePresence>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Error Message */}
              {error && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {error}
                </p>
              )}

              {/* Upload Progress */}
              {uploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Uploading...</span>
                    <span className="font-medium text-blue-600">{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}

              {/* Tips */}
              <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-100">
                <div className="flex items-start gap-3">
                  <HelpCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-blue-800">Document Tips</p>
                    <ul className="text-xs text-blue-600 mt-1 space-y-1 list-disc list-inside">
                      <li>Ensure documents are clear and readable</li>
                      <li>Accepted formats: PDF, JPG, PNG, DOC, XLS</li>
                      <li>Maximum file size: 20MB per document</li>
                      <li>Documents will be reviewed by admin</li>
                    </ul>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Fixed Footer */}
          <div className="px-6 py-4 border-t flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="upload-form"
              disabled={files.length === 0 || !documentType || uploading}
                  className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {uploadMode === 'single' ? 'Upload Document' : `Upload ${files.length} Document(s)`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Document Preview Dialog Component
interface DocumentPreviewDialogProps {
  document: BeneficiaryDocument | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void;
}

function DocumentPreviewDialog({ document, open, onOpenChange, onDelete }: DocumentPreviewDialogProps) {
  const [previewMode, setPreviewMode] = useState<'native' | 'google'>('native');
  const [loadError, setLoadError] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  if (!document) return null;

  const FileIcon = getFileIcon(document.mimeType);
  const isImage = document.mimeType.startsWith('image/');
  const isVideo = document.mimeType.startsWith('video/');
  const isPDF = document.mimeType === 'application/pdf';
  const canNativePreview = canPreview(document.mimeType);

  const handleDownload = () => {
    window.open(document.fileUrl, '_blank');
  };

  const handlePreviewError = () => {
    setLoadError(true);
    setPreviewMode('google');
  };

  const handleDelete = async () => {
    await onDelete();
    setDeleteDialogOpen(false);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[900px] w-[95%] md:w-full p-0">
          <div className="flex flex-col" style={{ maxHeight: '90vh' }}>
            {/* Fixed Header */}
            <div className="px-6 py-4 border-b">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                    <FileIcon className="w-4 h-4" />
                  </div>
                  Document Preview
                </DialogTitle>
                <DialogDescription>
                  {document.fileName}
                </DialogDescription>
              </DialogHeader>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto flex-1 p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Document Preview */}
                <div className="lg:col-span-2">
                  <Card className="border border-slate-200 bg-white/80 overflow-hidden">
                    <CardContent className="p-0">
                      <div className="aspect-[4/3] bg-slate-100 flex items-center justify-center overflow-auto">
                        {isImage ? (
                          <img
                            src={document.fileUrl}
                            alt={document.fileName}
                            className="w-full h-full object-contain"
                            onError={handlePreviewError}
                          />
                        ) : isVideo ? (
                          <video
                            src={document.fileUrl}
                            controls
                            className="w-full h-full"
                            onError={handlePreviewError}
                          />
                        ) : isPDF ? (
                          <iframe
                            src={`${document.fileUrl}#toolbar=0&navpanes=0`}
                            className="w-full h-full"
                            title={document.fileName}
                            onError={handlePreviewError}
                          />
                        ) : previewMode === 'google' ? (
                          <iframe
                            src={getGoogleViewerUrl(document.fileUrl)}
                            className="w-full h-full"
                            title={document.fileName}
                            onError={() => setLoadError(true)}
                          />
                        ) : (
                          <div className="text-center p-8">
                            <FileIcon className="w-20 h-20 mx-auto text-slate-400 mb-4" />
                            <p className="text-sm text-slate-500 mb-2">
                              {loadError ? 'Preview failed' : 'Preview not available'}
                            </p>
                            <div className="space-y-2">
                              <Button
                                variant="outline"
                                className="w-full"
                                onClick={handleDownload}
                              >
                                <Download className="w-4 h-4 mr-2" />
                                Download to view
                              </Button>
                              {!loadError && previewMode === 'native' && (
                                <Button
                                  variant="ghost"
                                  className="w-full text-xs"
                                  onClick={() => setPreviewMode('google')}
                                >
                                  Try Google Docs Viewer
                                </Button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Document Details */}
                <div className="space-y-4">
                  <Card className="border border-slate-200 bg-white/80">
                    <CardHeader>
                      <CardTitle className="text-lg">Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">

                      {/* Type */}
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-blue-100">
                          <FileIcon className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Document Type</p>
                          <p className="text-sm font-medium capitalize">
                            {document.documentType.replace('_', ' ')}
                          </p>
                        </div>
                      </div>

                      {/* MIME Type */}
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-purple-100">
                          <File className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">File Format</p>
                          <p className="text-sm font-medium">
                            {document.mimeType.split('/')[1]?.toUpperCase() || 'Unknown'}
                          </p>
                        </div>
                      </div>

                      {/* File Size */}
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-emerald-100">
                          <HardDrive className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">File Size</p>
                          <p className="text-sm font-medium">
                            {formatFileSize(document.fileSize)}
                          </p>
                        </div>
                      </div>

                      {/* Upload Date */}
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-amber-100">
                          <Calendar className="w-4 h-4 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Upload Date</p>
                          <p className="text-sm font-medium">
                            {format(new Date(document.createdAt), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>

                      {/* Uploaded By */}
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-indigo-100">
                          <User className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Uploaded By</p>
                          <p className="text-sm font-medium">
                            {document.uploadedBy.fullName}
                          </p>
                          <p className="text-xs text-slate-500">
                            {document.uploadedByType}
                          </p>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-amber-100">
                          <Shield className="w-4 h-4 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Status</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              className={cn(
                                "px-2 py-0.5 text-xs font-medium",
                                document.verified
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-amber-100 text-amber-700"
                              )}
                            >
                              {document.verified ? (
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
                          </div>
                        </div>
                      </div>

                      {/* Preview Note for non-previewable files */}
                      {!canNativePreview && !isImage && !isVideo && !isPDF && (
                        <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded-lg">
                          <AlertCircle className="w-3 h-3 inline-block mr-1" />
                          This file type cannot be previewed directly. Use Google Docs Viewer or download to view.
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={handleDownload}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                      onClick={() => setDeleteDialogOpen(true)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>

                  <Button
                    variant="link"
                    className="w-full text-xs text-blue-600"
                    onClick={() => window.open(document.fileUrl, '_blank')}
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Open in new tab
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Delete Document</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{document?.fileName}"?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Main Documents Page Component
export default function DocumentsPage() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<BeneficiaryDocument[]>([]);
  const [stats, setStats] = useState<DocumentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
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
    try {
      await beneficiaryService.deleteDocument(document.id);
      setDocuments(prev => prev.filter(d => d.id !== document.id));
      toast.success('Document deleted successfully');

      // Refresh stats
      const statsResponse = await beneficiaryService.getDocumentStats();
      const statsData = statsResponse as any;
      setStats(statsData.data || statsData);

    } catch (error) {
      toast.error('Failed to delete document');
    }
  };

  const handleDownload = (document: BeneficiaryDocument) => {
    window.open(document.fileUrl, '_blank');
    toast.success('Opening document...');
  };

  const openPreview = (document: BeneficiaryDocument) => {
    setSelectedDocument(document);
    setPreviewDialogOpen(true);
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
              <FileText className="w-16 h-16 text-blue-600 relative animate-bounce" />
            </div>
            <p className="text-slate-500 animate-pulse">Loading your documents...</p>
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
        className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-6 sm:space-y-8">

          {/* Header */}
          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
                  My Documents
                </h1>
                <Badge variant="outline" className="ml-2 text-xs font-medium bg-white/80">
                  {stats?.total || 0} Total
                </Badge>
              </div>
              <p className="text-sm sm:text-base text-slate-500 flex items-center gap-2 mt-1">
                <FileText className="w-4 h-4" />
                <span>Manage and organize your important documents</span>
              </p>
            </div>
            <Button
              className="h-9 sm:h-10 px-4 sm:px-5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs sm:text-sm font-medium shadow-lg shadow-teal-600/20 transition-all active:scale-95"
              onClick={() => setUploadDialogOpen(true)}

            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              Upload Document
            </Button>
          </motion.div>

          {/* Stats Cards */}
          {stats && (
            <motion.div variants={fadeInUp} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <Card className="border border-slate-200 bg-white/80 backdrop-blur-xl">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-slate-500 mb-1">Total Documents</p>
                      <p className="text-xl sm:text-2xl font-bold text-slate-900">
                        {stats.total}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-blue-100">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-slate-200 bg-white/80 backdrop-blur-xl">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-slate-500 mb-1">Verified</p>
                      <p className="text-xl sm:text-2xl font-bold text-emerald-600">
                        {stats.verified}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-100">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-slate-200 bg-white/80 backdrop-blur-xl">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-slate-500 mb-1">Pending</p>
                      <p className="text-xl sm:text-2xl font-bold text-amber-600">
                        {stats.pending}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-amber-100">
                      <Clock className="w-5 h-5 text-amber-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-slate-200 bg-white/80 backdrop-blur-xl">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-slate-500 mb-1">Types</p>
                      <p className="text-xl sm:text-2xl font-bold text-purple-600">
                        {stats.byType.length}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-purple-100">
                      <Filter className="w-5 h-5 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Filters and Search */}
          <motion.div variants={fadeInUp}>
            <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 p-4 sm:p-5 bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search by file name or type..."
                  className="w-full h-10 pl-10 bg-white border-slate-200 rounded-lg text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full sm:w-[140px] lg:w-[160px] h-10 bg-white border-slate-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-slate-500" />
                      <SelectValue placeholder="Document Type" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200">
                    <SelectItem value="all">All Types</SelectItem>
                    {uniqueTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[140px] lg:w-[160px] h-10 bg-white border-slate-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-slate-500" />
                      <SelectValue placeholder="Status" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
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
          </motion.div>

          {/* Documents Grid/List */}
          <motion.div variants={fadeInUp}>
            {filteredDocuments.length === 0 ? (
              <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50">
                <CardContent className="py-16 text-center">
                  <div className="flex flex-col items-center justify-center gap-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-3xl" />
                      <FileText className="w-16 h-16 text-slate-300 relative" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-xl font-bold text-slate-400">
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
                      onClick={() => setUploadDialogOpen(true)}
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
                        <Card className="h-full border border-slate-200 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] overflow-hidden">
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
                                  <DropdownMenuItem onClick={() => openPreview(doc)}>
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
                                <span className="text-xs text-slate-600">
                                  {formatFileSize(doc.fileSize)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Calendar className="w-4 h-4 text-slate-400" />
                                <span className="text-xs text-slate-600">
                                  {format(new Date(doc.createdAt), 'MMM d, yyyy')}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <User className="w-4 h-4 text-slate-400" />
                                <span className="text-xs text-slate-600">
                                  {doc.uploadedBy.fullName}
                                </span>
                              </div>
                            </div>

                            {/* Status Badge */}
                            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                              <Badge
                                className={cn(
                                  "px-2 py-0.5 text-[10px] font-medium",
                                  doc.verified
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-amber-100 text-amber-700"
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
                                onClick={() => openPreview(doc)}
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
              <Card className="border border-slate-200 bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">File</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Size</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Uploaded</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredDocuments.map((doc) => {
                        const FileIcon = getFileIcon(doc.mimeType);
                        const typeConfig = documentTypeConfig[doc.documentType] || documentTypeConfig.other;

                        return (
                          <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className={cn("p-2 rounded-lg", typeConfig.bg)}>
                                  <FileIcon className={cn("w-4 h-4", typeConfig.color)} />
                                </div>
                                <div>
                                  <div className="font-medium text-sm text-slate-900">
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
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-amber-100 text-amber-700"
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
                                      onClick={() => openPreview(doc)}
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

        {/* Upload Document Dialog */}
        <UploadDocumentDialog
          open={uploadDialogOpen}
          onOpenChange={setUploadDialogOpen}
          onSuccess={fetchData}
        />

        {/* Document Preview Dialog */}
        <DocumentPreviewDialog
          document={selectedDocument}
          open={previewDialogOpen}
          onOpenChange={setPreviewDialogOpen}
          onDelete={() => selectedDocument && handleDelete(selectedDocument)}
        />
      </motion.div>
    </TooltipProvider>
  );
}