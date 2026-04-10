import {
  CheckCircle2,
  File,
  ImageIcon,
  RefreshCcw,
  UploadCloud,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import type { Area, Point } from 'react-easy-crop';
import Cropper from 'react-easy-crop';
import {
  getAssetInfo,
  getAssetPreview,
  getAssetView,
  uploadAsset,
} from '../../../../infrastructure/appwrite/server';
import { getCroppedImg } from '../../lib/crop-utils';
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

interface FileUploaderProps {
  label: string;
  accept?: string;
  value?: string; // fileId
  onChange?: (fileId: string) => void;
  variant?: 'image' | 'file';
  bucketId?: string;
}

/**
 * FileUploader (Constitution §XVII, §I)
 * High-fidelity asset uploader for the Portfolio CMS with native 1:1 Image Cropping.
 * Connected to Appwrite Storage via dedicated RPCs.
 */
export function FileUploader({
  label,
  accept,
  value,
  onChange,
  variant = 'file',
  bucketId = 'assets', // Standard bucket for portfolio assets
}: FileUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  // Crop state
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  // Preview management
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [assetName, setAssetName] = useState<string | null>(null);
  const [assetCreatedAt, setAssetCreatedAt] = useState<string | null>(null);
  const [originalFileName, setOriginalFileName] = useState<string | null>(null);

  // Resolve preview if value changes
  useEffect(() => {
    if (value) {
      // biome-ignore format: prevent expansion to keep @ts-expect-error aligned
      // @ts-expect-error - TanStack Start payload inference issue in monorepo
      getAssetInfo({ data: { bucketId, fileId: value } }).then((res) => {
        if (res.asset) {
          setAssetName(res.asset.name);
          setAssetCreatedAt(res.asset.createdAt);
        }
      });

      if (variant === 'image') {
        // biome-ignore format: prevent expansion to keep @ts-expect-error aligned
        // @ts-expect-error - TanStack Start payload inference issue in monorepo
        getAssetPreview({ data: { bucketId, fileId: value } }).then((res) => {
          setPreviewUrl(res.url);
        });
      } else if (variant === 'file') {
        // Fetch view URL for PDFs/Files to enable visualizer
        // biome-ignore format: prevent expansion to keep @ts-expect-error aligned
        // @ts-expect-error - TanStack Start payload inference issue in monorepo
        getAssetView({ data: { bucketId, fileId: value } }).then((res) => {
          setPreviewUrl(res.url);
        });
      }
    } else {
      setPreviewUrl(null);
      setAssetName(null);
    }
  }, [value, variant, bucketId]);

  const onCropComplete = useCallback(
    (_croppedArea: Area, _croppedAreaPixels: Area) => {
      setCroppedAreaPixels(_croppedAreaPixels);
    },
    [],
  );

  const toBase64 = (file: Blob | File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () =>
        resolve(reader.result?.toString().split(',')[1] || '');
      reader.onerror = (error) => reject(error);
    });

  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement> | React.MouseEvent,
  ) => {
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
          setOriginalFileName(file.name);
          setShowCropModal(true);
        };
        reader.readAsDataURL(file);
        return;
      }

      // Standard file upload (PDF, etc)
      try {
        setIsUploading(true);
        const base64 = await toBase64(file);
        // biome-ignore format: prevent expansion to keep @ts-expect-error aligned
        // @ts-expect-error - TanStack Start payload inference issue in monorepo
        const asset = await uploadAsset({ data: { bucketId, file: base64, fileName: file.name } });
        onChange?.(asset.id);
        setIsUploading(false);
      } catch (err) {
        console.error('Upload failed:', err);
        setIsUploading(false);
      }
    }
  };

  const onCropApply = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    try {
      setIsUploading(true);
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (croppedImage) {
        // Convert the DataURL (from getCroppedImg) to a Blob then to Base64 for the RPC
        const response = await fetch(croppedImage);
        const blob = await response.blob();
        const base64 = await toBase64(blob);

        // biome-ignore format: prevent expansion to keep @ts-expect-error aligned
        // @ts-expect-error - TanStack Start payload inference issue in monorepo
        const asset = await uploadAsset({ data: { bucketId, file: base64, fileName: originalFileName || `avatar-${Date.now()}.png` } });

        // biome-ignore format: prevent expansion to keep @ts-expect-error aligned
        // @ts-expect-error - TanStack Start payload inference issue in monorepo
        const previewRes = await getAssetPreview({ data: { bucketId, fileId: asset.id } });

        setPreviewUrl(previewRes.url);
        onChange?.(asset.id);
      }
      setIsUploading(false);
      setShowCropModal(false);
    } catch (err) {
      console.error('Failed to crop and upload image:', err);
      setIsUploading(false);
    }
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

      <div
        className={cn(
          'relative group transition-all duration-500',
          'w-full rounded-3xl overflow-hidden',
          variant === 'image' ? 'h-[160px]' : 'h-[350px]',
          'border border-dashed border-border flex flex-col items-center justify-center',
          isUploading && 'animate-pulse cursor-wait',
        )}
      >
        {value ? (
          <div className="size-full flex flex-col items-center justify-center gap-3 animate-in fade-in zoom-in duration-500 bg-background/50 relative">
            {variant === 'image' ? (
              <div className="size-full flex items-center px-8 gap-8 animate-in slide-in-from-left-4 duration-500">
                {/* Left Column: Portrait */}
                <div className="relative group/pic">
                  <div className="size-32 rounded-3xl border-2 border-border/50 overflow-hidden bg-muted/20 shadow-xl transition-all duration-500 group-hover/pic:border-primary/30 group-hover/pic:shadow-primary/5">
                    <img
                      src={
                        previewUrl ||
                        imageSrc ||
                        'https://ui.shadcn.com/avatars/02.png'
                      }
                      alt="preview"
                      className="size-full object-contain p-2 transition-transform duration-700 group-hover/pic:scale-110"
                    />
                  </div>
                  {/* Status Indicator */}
                  <div className="absolute -bottom-1 -right-1 size-5 rounded-full bg-emerald-500 border-2 border-background flex items-center justify-center shadow-lg transform scale-0 group-hover/pic:scale-100 transition-transform duration-300">
                    <div className="size-1.5 rounded-full bg-white animate-pulse" />
                  </div>
                </div>

                {/* Right Column: Metadata */}
                <div className="flex-1 min-w-0 space-y-3 py-2">
                  <div className="space-y-1">
                    <span className="block text-[8px] font-black uppercase tracking-[0.3em] text-primary/40">
                      Asset Designation
                    </span>
                    <h4 className="text-sm font-black uppercase tracking-tight text-foreground truncate drop-shadow-sm">
                      {assetName || 'UNNAMED_ENTITY'}
                    </h4>
                  </div>

                  <div className="space-y-1">
                    <span className="block text-[8px] font-black uppercase tracking-[0.3em] text-primary/40">
                      Time of Upload
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-muted-foreground/60 tracking-wider">
                        {assetCreatedAt
                          ? new Date(assetCreatedAt)
                              .toLocaleString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                              })
                              .replace(/\//g, '-')
                          : 'PENDING_DATETIME'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="size-full flex items-center justify-center overflow-hidden bg-muted/30 relative group/doc">
                <div className="absolute inset-0 z-0 bg-grid-white/5 opacity-20 pointer-events-none" />
                {previewUrl ? (
                  <div className="absolute inset-0 overflow-hidden bg-white">
                    <iframe
                      src={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                      title="Small Preview"
                      className="absolute -inset-x-8 -inset-y-8 w-[calc(100%+64px)] h-[calc(100%+64px)] border-none pointer-events-none opacity-90 group-hover/doc:opacity-100 transition-opacity bg-white"
                    />
                  </div>
                ) : (
                  <div className="size-16 rounded-2xl bg-muted flex items-center justify-center border border-border">
                    <File className="size-7 text-foreground/60" />
                  </div>
                )}
              </div>
            )}

            <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  triggerInput();
                }}
                className="size-7 rounded-sm bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all shadow-sm group"
                title="Replace Asset"
              >
                <RefreshCcw className="size-3.5 transition-transform group-hover:-rotate-180 duration-500" />
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="size-7 rounded-sm bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center hover:bg-destructive hover:text-white hover:border-destructive transition-all shadow-sm"
                title="Remove Asset"
              >
                <X className="size-3.5" />
              </button>
            </div>

            {!isUploading && variant === 'file' && (
              <div className="absolute bottom-3 inset-x-3 flex flex-col gap-2">
                <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-background border border-border shadow-md">
                  <CheckCircle2 className="size-4 text-green-500 shrink-0" />
                  <span className="text-[10px] font-bold text-foreground truncate uppercase tracking-widest max-w-[150px]">
                    {assetName || value}
                  </span>
                </div>
                {previewUrl && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowCropModal(true)}
                    className="w-full text-[10px] font-bold uppercase tracking-widest h-8"
                  >
                    View Document
                  </Button>
                )}
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={triggerInput}
            aria-label={`Upload ${label}`}
            className="size-full flex flex-col items-center justify-center gap-4 hover:bg-primary/5 hover:border-primary/30 cursor-pointer transition-all duration-300"
          >
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
          </button>
        )}
      </div>

      {/* Image Cropping & Document Viewing Overlay */}
      <Dialog open={showCropModal} onOpenChange={setShowCropModal}>
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
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
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
                    onChange={(e) => setZoom(Number(e.target.value))}
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
                    onClick={() => setShowCropModal(false)}
                    className="flex-1 sm:flex-none text-[10px] font-bold uppercase tracking-widest h-10 px-6 hover:bg-muted transition-all"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={onCropApply}
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
    </div>
  );
}
