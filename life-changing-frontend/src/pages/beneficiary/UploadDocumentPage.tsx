import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Upload,
  X,
  FileText,
  Image,
  Video,
  File,
  CheckCircle2,
  AlertCircle,
  Loader2,
  HelpCircle,
  Save,
  HardDrive,
  Layers,
  Copy,
  Trash2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { beneficiaryService } from '@/services/beneficiary.service';
import { cn } from '@/lib/utils';

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

export default function UploadDocumentPage() {
  const navigate = useNavigate();
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
      
      // Navigate back after short delay
      setTimeout(() => {
        navigate('/beneficiary/documents');
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
    <TooltipProvider>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="min-h-screen bg-slate-50"
      >
        <div className="container max-w-3xl mx-auto px-4 py-8">
          
          {/* Header with Back Button */}
          <motion.div variants={fadeInUp} className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/beneficiary/documents')}
              className="rounded-full hover:bg-slate-100 h-10 w-10"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Upload Documents
              </h1>
              <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                <Upload className="w-4 h-4" />
                <span>Add documents to your profile</span>
              </p>
            </div>
          </motion.div>

          {/* Upload Form */}
          <motion.div variants={fadeInUp}>
            <Card className="border border-slate-200 bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                    <Upload className="w-4 h-4" />
                  </div>
                  Document Information
                </CardTitle>
                <CardDescription>
                  Choose upload mode and select your files
                </CardDescription>
              </CardHeader>
              <CardContent>
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

                <form onSubmit={handleSubmit} className="space-y-6">
                  
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

                  {/* Form Actions */}
                  <div className="flex items-center gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 h-11 border-slate-200"
                      onClick={() => navigate('/beneficiary/documents')}
                      disabled={uploading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white"
                      disabled={files.length === 0 || !documentType || uploading}
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          {uploadMode === 'single' ? 'Upload Document' : `Upload ${files.length} Document(s)`}
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </TooltipProvider>
  );
}