import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Upload, Image, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface DropZoneProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
  preview?: string | null;
  onPreviewChange?: (preview: string | null) => void;
  accept?: Record<string, string[]>;
  maxSize?: number;
  label: string;
  description?: string;
  className?: string;
}

export function DropZone({
  onFileSelect,
  selectedFile,
  preview,
  onPreviewChange,
  accept = {
    'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
  },
  maxSize = 5 * 1024 * 1024, // 5MB
  label,
  description,
  className
}: DropZoneProps) {
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setError(null);
    
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors[0].code === 'file-too-large') {
        setError(`File is too large. Max size: ${maxSize / (1024 * 1024)}MB`);
      } else if (rejection.errors[0].code === 'file-invalid-type') {
        setError('Invalid file type. Please upload an image.');
      } else {
        setError('Error uploading file. Please try again.');
      }
      return;
    }

    const file = acceptedFiles[0];
    if (file) {
      onFileSelect(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        if (onPreviewChange) {
          onPreviewChange(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  }, [maxSize, onFileSelect, onPreviewChange]);

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
    onDropAccepted: () => setIsDragging(false),
    onDropRejected: () => setIsDragging(false),
    noClick: true,
    noKeyboard: true
  });

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileSelect(null);
    if (onPreviewChange) {
      onPreviewChange(null);
    }
    setError(null);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div
        {...getRootProps()}
        onClick={open}
        className={cn(
          "relative border-2 border-dashed rounded-xl transition-all duration-200 cursor-pointer overflow-hidden",
          isDragging ? "border-teal-500 bg-teal-50 dark:bg-teal-950/20" : "border-slate-200 dark:border-slate-800 hover:border-teal-400 dark:hover:border-teal-700",
          selectedFile ? "bg-slate-50 dark:bg-slate-900" : "bg-white dark:bg-slate-950",
          error && "border-rose-300 dark:border-rose-800"
        )}
      >
        <input {...getInputProps()} />
        
        <AnimatePresence mode="wait">
          {selectedFile && preview ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative aspect-video"
            >
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              
              {/* Overlay with actions */}
              <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="bg-white text-slate-900 hover:bg-slate-100"
                  onClick={open}
                >
                  Change
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={handleRemove}
                >
                  <X className="w-4 h-4 mr-1" />
                  Remove
                </Button>
              </div>

              {/* Success Badge */}
              <div className="absolute top-2 right-2">
                <div className="bg-emerald-500 text-white px-2 py-1 rounded-full text-[10px] font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Uploaded
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center p-8 text-center"
            >
              <div className={cn(
                "p-4 rounded-full mb-3 transition-colors",
                isDragging ? "bg-teal-100 dark:bg-teal-900/30" : "bg-slate-100 dark:bg-slate-800"
              )}>
                {isDragging ? (
                  <Upload className="w-6 h-6 text-teal-600 dark:text-teal-400 animate-bounce" />
                ) : (
                  <Image className="w-6 h-6 text-slate-400" />
                )}
              </div>
              
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {label}
              </p>
              
              {description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                  {description}
                </p>
              )}
              
              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                <span>Click to browse</span>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span>Max {maxSize / (1024 * 1024)}MB</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 text-xs mt-1"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}