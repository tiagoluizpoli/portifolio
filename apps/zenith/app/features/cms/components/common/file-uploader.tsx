import type { UploadAssetPayload } from '@repo/appwrite-core';
import { CheckCircle2, RefreshCcw, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import type { Area, Point } from 'react-easy-crop';
import {
  getAssetInfo,
  getAssetPreview,
  getAssetView,
  uploadAsset,
} from '../../../../infrastructure/appwrite/server';
import { getCroppedImg } from '../../lib/crop-utils';
import { AssetCropDialog } from './file-uploader/asset-crop-dialog';
import { AssetFilePreview } from './file-uploader/asset-file-preview';
import { AssetImagePreview } from './file-uploader/asset-image-preview';
import { AssetUploadZone } from './file-uploader/asset-upload-zone';
import { Button } from '@/components/ui/button';
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
 * High-fidelity asset uploader for the Portfolio CMS.
 * Decomposed into sub-components for architectural integrity.
 */
export function FileUploader({
  label,
  accept,
  value,
  onChange,
  variant = 'file',
  bucketId = 'assets',
}: FileUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
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
      // biome-ignore lint/suspicious/noExplicitAny: library RPC wrapper ambiguity
      const rpcPayload: any = {
        data: {
          bucketId,
          fileId: value,
        },
      };

      getAssetInfo(rpcPayload).then((res) => {
        if (res.asset) {
          setAssetName(res.asset.name);
          setAssetCreatedAt(res.asset.createdAt);
        }
      });

      if (variant === 'image') {
        setIsImageLoading(true);
        getAssetPreview(rpcPayload).then((res) => {
          setPreviewUrl(res.url);
        });
      } else if (variant === 'file') {
        getAssetView(rpcPayload).then((res) => {
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
          setIsImageLoading(true);
          setShowCropModal(true);
        };
        reader.readAsDataURL(file);
        return;
      }

      try {
        setIsUploading(true);
        const base64 = await toBase64(file);
        const payload: UploadAssetPayload['data'] = {
          bucketId,
          file: base64,
          fileName: file.name,
        };
        // biome-ignore lint/suspicious/noExplicitAny: library RPC wrapper ambiguity
        const asset = await uploadAsset({ data: payload } as any);
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
        setIsImageLoading(true);
        const response = await fetch(croppedImage);
        const blob = await response.blob();
        const base64 = await toBase64(blob);

        const uploadPayload: UploadAssetPayload['data'] = {
          bucketId,
          file: base64,
          fileName: originalFileName || `avatar-${Date.now()}.png`,
        };
        // biome-ignore lint/suspicious/noExplicitAny: library RPC wrapper ambiguity
        const asset = await uploadAsset({ data: uploadPayload } as any);

        // biome-ignore lint/suspicious/noExplicitAny: library RPC wrapper ambiguity
        const previewPayload: any = {
          data: {
            bucketId,
            fileId: asset.id,
          },
        };
        const previewRes = await getAssetPreview(previewPayload);

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
              <AssetImagePreview
                previewUrl={previewUrl}
                imageSrc={imageSrc}
                assetName={assetName}
                assetCreatedAt={assetCreatedAt}
                isImageLoading={isImageLoading}
                onImageLoad={() => setIsImageLoading(false)}
              />
            ) : (
              <AssetFilePreview previewUrl={previewUrl} />
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
          <AssetUploadZone
            label={label}
            variant={variant}
            isUploading={isUploading}
            onTrigger={triggerInput}
          />
        )}
      </div>

      <AssetCropDialog
        open={showCropModal}
        onOpenChange={setShowCropModal}
        variant={variant}
        imageSrc={imageSrc}
        crop={crop}
        zoom={zoom}
        previewUrl={previewUrl}
        assetName={assetName}
        isUploading={isUploading}
        onCropChange={setCrop}
        onZoomChange={setZoom}
        onCropComplete={onCropComplete}
        onApply={onCropApply}
      />
    </div>
  );
}
