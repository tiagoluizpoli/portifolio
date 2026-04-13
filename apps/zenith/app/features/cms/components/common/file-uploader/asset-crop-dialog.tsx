import { CheckCircle2, ImageIcon, RefreshCcw } from 'lucide-react';
import type { Area, Point } from 'react-easy-crop';
import Cropper from 'react-easy-crop';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface AssetCropDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant: 'image' | 'file';
  imageSrc: string | null;
  crop: Point;
  zoom: number;
  previewUrl: string | null;
  assetName: string | null;
  isUploading: boolean;
  onCropChange: (crop: Point) => void;
  onZoomChange: (zoom: number) => void;
  onCropComplete: (croppedArea: Area, croppedAreaPixels: Area) => void;
  onApply: () => void;
}

export function AssetCropDialog({
  open,
  onOpenChange,
  variant,
  imageSrc,
  crop,
  zoom,
  previewUrl,
  assetName,
  isUploading,
  onCropChange,
  onZoomChange,
  onCropComplete,
  onApply,
}: AssetCropDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'transition-all duration-500 p-6 flex flex-col items-stretch overflow-hidden gap-0',
          variant === 'file' ? 'sm:max-w-6xl h-[90vh]' : 'sm:max-w-2xl',
        )}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight">
            {variant === 'file' ? 'View Document' : 'Visual Curation'}
          </DialogTitle>
          <DialogDescription className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60">
            {variant === 'file'
              ? assetName || 'UNNAMED_ENTITY'
              : 'Precise 1:1 Aspect Ratio Transformation'}
          </DialogDescription>
        </DialogHeader>

        <div
          className={cn(
            'relative w-full overflow-hidden bg-muted rounded-2xl border border-border/50 shadow-inner group',
            variant === 'image'
              ? 'aspect-[3/4] sm:aspect-video mt-4'
              : 'flex-1 min-h-0 mt-2',
          )}
        >
          {variant === 'image' && imageSrc ? (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={onCropChange}
              onCropComplete={onCropComplete}
              onZoomChange={onZoomChange}
            />
          ) : variant === 'file' && previewUrl ? (
            <iframe
              src={previewUrl}
              title="Document Preview"
              className="size-full border-none bg-white rounded-xl shadow-2xl"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground/40 italic">
              <ImageIcon className="size-12 mb-4 opacity-10" />
              <p className="text-sm font-medium">Ready for transformation</p>
            </div>
          )}
        </div>

        {variant === 'image' && (
          <>
            <div className="py-6 space-y-4">
              <div className="flex items-center gap-6 px-1">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 shrink-0">
                  Density
                </span>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-label="Zoom"
                  onChange={(e) => onZoomChange(Number(e.target.value))}
                  className="flex-1 accent-primary h-1.5 bg-muted rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-[10px] font-mono text-primary font-bold w-10 text-right">
                  {zoom.toFixed(1)}x
                </span>
              </div>
            </div>

            <DialogFooter className="bg-muted/30 -mx-6 -mb-6 p-6 mt-2 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500/80">
                  Precision Core Active
                </span>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                  className="flex-1 sm:flex-none text-[10px] font-bold uppercase tracking-widest h-10 px-6 hover:bg-muted transition-all"
                >
                  Cancel
                </Button>
                <Button
                  onClick={onApply}
                  size="sm"
                  disabled={isUploading}
                  className="flex-1 sm:flex-none text-[10px] h-10 font-bold uppercase tracking-widest px-8 shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 transition-all"
                >
                  {isUploading ? (
                    <RefreshCcw className="size-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle2 className="size-4 mr-2" />
                  )}
                  {isUploading ? 'Transforming...' : 'Commit Changes'}
                </Button>
              </div>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
