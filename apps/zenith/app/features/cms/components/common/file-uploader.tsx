import {
  CheckCircle2,
  Crop,
  File,
  ImageIcon,
  UploadCloud,
  X,
} from 'lucide-react';
import { useCallback, useState } from 'react';
import type { Area, Point } from 'react-easy-crop';
import Cropper from 'react-easy-crop';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface FileUploaderProps {
  label: string;
  accept?: string;
  value?: string; // fileId
  onChange?: (fileId: string) => void;
  variant?: 'image' | 'file';
}

/**
 * FileUploader (Constitution §XVII, §I)
 * High-fidelity asset uploader for the Portfolio CMS with native 1:1 Image Cropping.
 */
export function FileUploader({
  label,
  accept,
  value,
  onChange,
  variant = 'file',
}: FileUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  // Crop state
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [_croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(
    null,
  );

  const onCropComplete = useCallback(
    (_croppedArea: Area, _croppedAreaPixels: Area) => {
      setCroppedAreaPixels(_croppedAreaPixels);
    },
    [],
  );

  const handleUpload = (
    e: React.ChangeEvent<HTMLInputElement> | React.MouseEvent,
  ) => {
    // If it's a file input event and we have files
    if (
      'target' in e &&
      (e.target as HTMLInputElement).files &&
      (e.target as HTMLInputElement).files?.length
    ) {
      const files = (e.target as HTMLInputElement).files;
      const file = files?.[0];
      if (!file) return;

      if (variant === 'image') {
        const reader = new FileReader();
        reader.onload = () => {
          setImageSrc(reader.result as string);
          setShowCropModal(true);
        };
        reader.readAsDataURL(file);
        return;
      }
    }

    // Mock standard upload if no file target or not an image
    if (variant === 'file' || ('type' in e && e.type === 'click')) {
      triggerMockUpload();
    }
  };

  const triggerMockUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      const mockId = `file-${Math.random().toString(36).substr(2, 9)}`;
      onChange?.(mockId);
      setIsUploading(false);
      setShowCropModal(false);
    }, 1500);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.('');
    setImageSrc(null);
  };

  const triggerInput = () => {
    document
      .getElementById(`uploader-${label.replace(/\s+/g, '-').toLowerCase()}`)
      ?.click();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!value) triggerInput();
    }
  };

  return (
    <div className="space-y-3 w-full">
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60">
          {label}
        </span>
      </div>

      <input
        type="file"
        id={`uploader-${label.replace(/\s+/g, '-').toLowerCase()}`}
        className="hidden"
        accept={accept || (variant === 'image' ? 'image/*' : undefined)}
        onChange={handleUpload}
      />

      <button
        type="button"
        tabIndex={0}
        onClick={!value ? triggerInput : undefined}
        onKeyDown={handleKeyDown}
        aria-label={`Upload ${label}`}
        className={cn(
          'relative group cursor-pointer transition-all duration-500',
          'w-full rounded-xl overflow-hidden',
          variant === 'image'
            ? value
              ? 'aspect-square max-w-[240px] mx-auto'
              : 'h-48'
            : 'h-40',
          'border border-dashed border-border flex flex-col items-center justify-center',
          !value && 'hover:bg-primary/5 hover:border-primary/30',
          isUploading && 'animate-pulse cursor-wait',
        )}
      >
        {value ? (
          <div className="size-full flex flex-col items-center justify-center gap-3 animate-in fade-in zoom-in duration-500 bg-background/50 relative">
            {variant === 'image' ? (
              <div className="size-full bg-cover bg-center rounded-lg border border-border flex items-center justify-center overflow-hidden relative aspect-square">
                <img
                  src={imageSrc || 'https://ui.shadcn.com/avatars/02.png'}
                  alt="preview"
                  className="size-full object-cover"
                />
              </div>
            ) : (
              <div className="size-16 rounded-2xl bg-muted flex items-center justify-center border border-border">
                <File className="size-7 text-foreground/60" />
              </div>
            )}

            <div className="absolute top-3 right-3 z-10">
              <button
                type="button"
                onClick={handleClear}
                className="size-7 rounded-sm bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center hover:bg-destructive hover:text-white hover:border-destructive transition-all shadow-sm"
              >
                <X className="size-3.5" />
              </button>
            </div>

            {!isUploading && variant === 'file' && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-background border border-border shadow-md">
                <CheckCircle2 className="size-4 text-green-500" />
                <span className="text-[10px] font-bold text-foreground truncate uppercase tracking-widest max-w-[150px]">
                  {value}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="size-12 rounded-full bg-muted border border-border flex items-center justify-center group-hover:bg-primary/10 group-hover:border-primary/20 group-hover:text-primary transition-all duration-300">
              {variant === 'image' ? (
                <ImageIcon className="size-5 transition-transform group-hover:scale-110" />
              ) : (
                <UploadCloud className="size-5 transition-transform group-hover:scale-110" />
              )}
            </div>
            <div className="text-center space-y-1">
              <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/60 group-hover:text-foreground transition-colors">
                {isUploading ? 'Orchestrating...' : 'Select Asset'}
              </span>
              <span className="block text-[8px] font-medium text-muted-foreground/40 uppercase tracking-widest">
                Support:{' '}
                {variant === 'image' ? 'JPG, PNG, WEBP (1:1)' : 'PDF, DOCX'}
              </span>
            </div>
          </div>
        )}
      </button>

      {/* Image Cropping Overlay */}
      <Dialog open={showCropModal} onOpenChange={setShowCropModal}>
        <DialogContent className="max-w-md w-full border-border bg-background p-0 overflow-hidden gap-0">
          <DialogHeader className="p-4 border-b border-border bg-muted/20">
            <DialogTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 text-foreground/80">
              <Crop className="size-4" /> Position & Scale
            </DialogTitle>
          </DialogHeader>
          <div className="relative w-full h-[400px] bg-black/90">
            {imageSrc && (
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
                classes={{ containerClassName: 'bg-transparent' }}
              />
            )}
          </div>
          <DialogFooter className="p-4 border-t border-border bg-muted/20 flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                Zoom
              </span>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-label="Zoom"
                onChange={(e) => setZoom(Number(e.target.value))}
                className="flex-1 h-1 bg-border rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div className="flex items-center gap-3 ml-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCropModal(false)}
                className="text-[10px] font-bold uppercase tracking-widest h-8"
              >
                Cancel
              </Button>
              <Button
                onClick={triggerMockUpload}
                size="sm"
                disabled={isUploading}
                className="text-[10px] h-8 font-bold uppercase tracking-widest px-6 shadow-sm shadow-primary/20"
              >
                {isUploading ? 'Processing...' : 'Apply Crop'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
