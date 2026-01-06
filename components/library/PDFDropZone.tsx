import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PDFDropZoneProps {
  onFileAccepted: (file: File) => void;
  className?: string;
}

export function PDFDropZone({ onFileAccepted, className }: PDFDropZoneProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileAccepted(acceptedFiles[0]);
    }
  }, [onFileAccepted]);

  const { getRootProps, getInputProps, isDragActive, isDragAccept } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        'relative flex flex-col items-center justify-center gap-4 p-8 md:p-12',
        'border-2 border-dashed rounded-xl cursor-pointer',
        'transition-all duration-300 ease-out',
        isDragActive
          ? 'border-primary bg-primary/5 scale-[1.02]'
          : 'border-border hover:border-primary/50 hover:bg-secondary/50',
        isDragAccept && 'border-success bg-success/5',
        className
      )}
    >
      <input {...getInputProps()} />
      
      <div className={cn(
        'p-4 rounded-full bg-secondary transition-all duration-300',
        isDragActive && 'bg-primary/10 scale-110'
      )}>
        {isDragActive ? (
          <FileText className="w-8 h-8 text-primary" />
        ) : (
          <Upload className="w-8 h-8 text-muted-foreground" />
        )}
      </div>
      
      <div className="text-center space-y-2">
        <p className="font-medium text-foreground">
          {isDragActive ? 'Drop your PDF here' : 'Drag & drop a PDF'}
        </p>
        <p className="text-sm text-muted-foreground">
          or click to browse your files
        </p>
      </div>
    </div>
  );
}