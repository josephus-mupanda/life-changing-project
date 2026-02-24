import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Download,
  Trash2,
  Loader2,
  FileText,
  Image,
  Video,
  File,
  Calendar,
  User,
  HardDrive,
  CheckCircle2,
  Clock,
  Shield,
  AlertCircle,
  ExternalLink,
  FileSpreadsheet,
  FileArchive,
  FileCode,
  FilePieChart,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { beneficiaryService } from '@/services/beneficiary.service';
import { BeneficiaryDocument } from '@/lib/types/document';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

// Format file size
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Get appropriate icon based on mime type
const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return Image;
  if (mimeType.startsWith('video/')) return Video;
  if (mimeType === 'application/pdf') return FileText;
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || mimeType.includes('csv')) {
    return FileSpreadsheet;
  }
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) {
    return FilePieChart;
  }
  if (mimeType.includes('zip') || mimeType.includes('archive') || mimeType.includes('tar') || mimeType.includes('rar')) {
    return FileArchive;
  }
  if (mimeType.includes('json') || mimeType.includes('javascript') || mimeType.includes('html') || mimeType.includes('css')) {
    return FileCode;
  }
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

export default function DocumentPreviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [document, setDocument] = useState<BeneficiaryDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState<'native' | 'google'>('native');
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (id) {
      fetchDocument();
    }
  }, [id]);

  const fetchDocument = async () => {
    setLoading(true);
    try {
      const response = await beneficiaryService.getDocument(id!);
      
      // ✅ ROBUST EXTRACTION PATTERN
      const responseData = response as any;
      const docData = responseData.data || responseData;
      setDocument(docData);
      
      // Check if native preview is possible
      if (docData && !canPreview(docData.mimeType)) {
        setPreviewMode('google');
      }
      
    } catch (error) {
      console.error('Failed to fetch document', error);
      toast.error('Failed to load document');
      navigate('/beneficiary/documents');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (document) {
      window.open(document.fileUrl, '_blank');
    }
  };

  const handleDelete = async () => {
    if (!document) return;
    
    try {
      await beneficiaryService.deleteDocument(document.id);
      toast.success('Document deleted successfully');
      navigate('/beneficiary/documents');
    } catch (error) {
      toast.error('Failed to delete document');
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const handlePreviewError = () => {
    setLoadError(true);
    // Fallback to Google Docs viewer
    setPreviewMode('google');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
            <p className="text-slate-500 dark:text-slate-400">Loading document...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!document) return null;

  const FileIcon = getFileIcon(document.mimeType);
  const isImage = document.mimeType.startsWith('image/');
  const isVideo = document.mimeType.startsWith('video/');
  const isPDF = document.mimeType === 'application/pdf';
  const canNativePreview = canPreview(document.mimeType);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
      className="min-h-screen bg-white dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/20"
    >
      <div className="container mx-auto px-4 py-8">
        
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/beneficiary/documents')}
            className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 h-10 w-10"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Document Preview
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {document.fileName}
            </p>
          </div>
        </div>

        {/* Preview Mode Tabs (for non-native previews) */}
        {!canNativePreview && !isImage && !isVideo && !isPDF && (
          <Tabs defaultValue="google" className="mb-4" onValueChange={(v) => setPreviewMode(v as 'native' | 'google')}>
            <TabsList className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
              <TabsTrigger value="google" className="text-xs sm:text-sm">
                <Eye className="w-4 h-4 mr-2" />
                Google Docs Viewer
              </TabsTrigger>
              <TabsTrigger value="native" className="text-xs sm:text-sm">
                <Download className="w-4 h-4 mr-2" />
                Download
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Document Preview */}
          <div className="lg:col-span-2">
            <Card className="border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl overflow-hidden">
              <CardContent className="p-0">
                <div className="aspect-[4/3] bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-auto">
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
          <div className="space-y-6">
            <Card className="border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-lg">Document Details</CardTitle>
                <CardDescription>
                  Information about this document
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {/* Type */}
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <FileIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
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
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                    <File className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">File Format</p>
                    <p className="text-sm font-medium">
                      {document.mimeType.split('/')[1]?.toUpperCase() || 'Unknown'}
                    </p>
                  </div>
                </div>

                {/* File Name */}
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                    <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">File Name</p>
                    <p className="text-sm font-medium break-all">
                      {document.fileName}
                    </p>
                  </div>
                </div>

                {/* File Size */}
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                    <HardDrive className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
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
                  <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                    <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Upload Date</p>
                    <p className="text-sm font-medium">
                      {format(new Date(document.createdAt), 'MMMM d, yyyy')}
                    </p>
                  </div>
                </div>

                {/* Uploaded By */}
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                    <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
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
                  <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                    <Shield className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Verification Status</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        className={cn(
                          "px-2 py-0.5 text-xs font-medium",
                          document.verified
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
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
                            Pending Verification
                          </>
                        )}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Button
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={handleDownload}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>

                {/* External Link */}
                <Button
                  variant="link"
                  className="w-full text-xs text-blue-600"
                  onClick={() => window.open(document.fileUrl, '_blank')}
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Open in new tab
                </Button>

                {/* Preview Note for non-previewable files */}
                {!canNativePreview && !isImage && !isVideo && !isPDF && (
                  <p className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/20 p-2 rounded-lg mt-2">
                    <AlertCircle className="w-3 h-3 inline-block mr-1" />
                    This file type cannot be previewed directly. Use Google Docs Viewer or download to view.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

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
      </div>
    </motion.div>
  );
}