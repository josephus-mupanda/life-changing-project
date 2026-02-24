import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Upload, Image, Video, X, CheckCircle2, AlertCircle, Loader2, File, Plus } from 'lucide-react';
import { Button } from './button';

type FileType = 'image' | 'video' | 'other';

interface FileWithPreview {
  file: File;
  preview: string;
  type: FileType;
}

interface MultiFileDropZoneProps {
  onFilesSelect: (files: File[]) => void;
  selectedFiles: File[];
  existingPreviews?: { url: string; type: string }[];
  onRemoveExisting?: (index: number) => void;
  accept?: Record<string, string[]>;
  maxSize?: number;
  maxFiles?: number;
  label: string;
  description?: string;
  className?: string;
}

export function MultiFileDropZone({
  onFilesSelect,
  selectedFiles,
  existingPreviews = [],
  onRemoveExisting,
  accept = {
    'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    'video/*': ['.mp4', '.webm', '.ogg']
  },
  maxSize = 10 * 1024 * 1024, // 10MB
  maxFiles = 10,
  label,
  description,
  className
}: MultiFileDropZoneProps) {
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [filesWithPreview, setFilesWithPreview] = useState<FileWithPreview[]>([]);

  const getFileType = (file: File): FileType => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    return 'other';
  };

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setError(null);
    
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors[0].code === 'file-too-large') {
        setError(`File is too large. Max size: ${maxSize / (1024 * 1024)}MB`);
      } else if (rejection.errors[0].code === 'file-invalid-type') {
        setError('Invalid file type. Please upload images or videos.');
      } else {
        setError('Error uploading file. Please try again.');
      }
      return;
    }

    // Check total files limit
    if (selectedFiles.length + acceptedFiles.length + existingPreviews.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Create previews for new files
    const newFilesWithPreview: FileWithPreview[] = acceptedFiles.map(file => {
      const type = getFileType(file);
      const preview = type === 'image' ? URL.createObjectURL(file) : '';
      
      return {
        file,
        preview,
        type
      };
    });

    setFilesWithPreview(prev => [...prev, ...newFilesWithPreview]);
    onFilesSelect([...selectedFiles, ...acceptedFiles]);
  }, [maxSize, maxFiles, selectedFiles, existingPreviews.length, onFilesSelect]);

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: true,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
    onDropAccepted: () => setIsDragging(false),
    onDropRejected: () => setIsDragging(false),
    noClick: true,
    noKeyboard: true
  });

  const handleRemoveNewFile = (index: number) => {
    const fileToRemove = filesWithPreview[index];
    if (fileToRemove.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
    
    const newFilesWithPreview = filesWithPreview.filter((_, i) => i !== index);
    const newSelectedFiles = selectedFiles.filter((_, i) => i !== index);
    
    setFilesWithPreview(newFilesWithPreview);
    onFilesSelect(newSelectedFiles);
  };

  const handleRemoveExisting = (index: number) => {
    if (onRemoveExisting) {
      onRemoveExisting(index);
    }
  };

  const getFileIcon = (type: FileType) => {
    switch (type) {
      case 'image': return Image;
      case 'video': return Video;
      default: return File;
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        onClick={open}
        className={cn(
          "relative border-2 border-dashed rounded-xl transition-all duration-200 cursor-pointer",
          isDragging ? "border-teal-500 bg-teal-50 dark:bg-teal-950/20" : "border-slate-200 dark:border-slate-800 hover:border-teal-400 dark:hover:border-teal-700",
          error && "border-rose-300 dark:border-rose-800"
        )}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center justify-center p-6 text-center">
          <div className={cn(
            "p-3 rounded-full mb-2 transition-colors",
            isDragging ? "bg-teal-100 dark:bg-teal-900/30" : "bg-slate-100 dark:bg-slate-800"
          )}>
            {isDragging ? (
              <Upload className="w-5 h-5 text-teal-600 dark:text-teal-400 animate-bounce" />
            ) : (
              <Upload className="w-5 h-5 text-slate-400" />
            )}
          </div>
          
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            {label}
          </p>
          
          {description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
              {description}
            </p>
          )}
          
          <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] text-slate-400">
            <span>Click to browse</span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span>Max {maxFiles} files</span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span>Up to {maxSize / (1024 * 1024)}MB each</span>
          </div>
        </div>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 text-xs"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Grid */}
      {(existingPreviews.length > 0 || filesWithPreview.length > 0) && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-slate-500">
            Files ({existingPreviews.length + filesWithPreview.length}/{maxFiles})
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
            {/* Existing Files */}
            <AnimatePresence mode="popLayout">
              {existingPreviews.map((item, index) => {
                const fileType = item.type?.includes('video') ? 'video' : 'image';
                const Icon = fileType === 'video' ? Video : Image;
                return (
                  <motion.div
                    key={`existing-${index}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="relative group aspect-square rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800"
                  >
                    {fileType === 'image' ? (
                      <img
                        src={item.url}
                        alt={`Gallery ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <Icon className="w-6 h-6 text-slate-400" />
                      </div>
                    )}
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveExisting(index);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Type Badge */}
                    <div className="absolute top-1 left-1">
                      <div className="bg-black/50 backdrop-blur-sm rounded px-1 py-0.5">
                        <Icon className="w-2.5 h-2.5 text-white" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* New Files */}
              {filesWithPreview.map((item, index) => {
                const Icon = getFileIcon(item.type);
                return (
                  <motion.div
                    key={`new-${index}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="relative group aspect-square rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800"
                  >
                    {item.type === 'image' && item.preview ? (
                      <img
                        src={item.preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <Icon className="w-6 h-6 text-slate-400" />
                      </div>
                    )}
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        type="button"
                        size="icon"
                        variant="destructive"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveNewFile(index);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* File Size Badge */}
                    <div className="absolute bottom-1 right-1">
                      <div className="bg-black/50 backdrop-blur-sm rounded px-1 py-0.5">
                        <span className="text-[8px] text-white">
                          {(item.file.size / (1024 * 1024)).toFixed(1)}MB
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Add More Button */}
            {existingPreviews.length + filesWithPreview.length < maxFiles && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={open}
                className="aspect-square rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-teal-400 dark:hover:border-teal-700 transition-colors flex items-center justify-center cursor-pointer"
              >
                <div className="text-center">
                  <Plus className="w-4 h-4 mx-auto text-slate-400 mb-1" />
                  <span className="text-[8px] text-slate-400">Add More</span>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}