import { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  error?: string;
  className?: string;
  height?: number;
}

// Quill modules configuration
const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'indent': '-1'}, { 'indent': '+1' }],
    [{ 'align': [] }],
    ['link'],
    ['clean']
  ],
};

const formats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet', 'indent',
  'align',
  'link'
];

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Write your content here...',
  label,
  required,
  error,
  className,
  height = 200
}: RichTextEditorProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={cn("space-y-2", className)}>
        {label && (
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
            {label}
            {required && <span className="text-rose-500">*</span>}
          </label>
        )}
        <div 
          className="border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-900 animate-pulse"
          style={{ height }}
        />
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
          {label}
          {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      
      <div className="rich-text-editor-container">
        <ReactQuill
          theme="snow"
          value={value}
          onChange={onChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
          style={{ height }}
          className={cn(
            "rounded-lg overflow-hidden",
            error && "border-rose-300 dark:border-rose-800"
          )}
        />
      </div>

      {error && (
        <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{error}</p>
      )}
    </div>
  );
}