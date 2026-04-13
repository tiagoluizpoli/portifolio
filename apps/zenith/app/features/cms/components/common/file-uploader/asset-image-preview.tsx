import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface AssetImagePreviewProps {
  previewUrl: string | null;
  imageSrc: string | null;
  assetName: string | null;
  assetCreatedAt: string | null;
  isImageLoading: boolean;
  onImageLoad: () => void;
}

export function AssetImagePreview({
  previewUrl,
  imageSrc,
  assetName,
  assetCreatedAt,
  isImageLoading,
  onImageLoad,
}: AssetImagePreviewProps) {
  return (
    <div className="size-full flex items-center px-8 gap-8 animate-in slide-in-from-left-4 duration-500">
      {/* Left Column: Portrait */}
      <div className="relative group/pic">
        <div className="size-32 rounded-3xl border-2 border-border/50 overflow-hidden bg-muted/20 shadow-xl transition-all duration-500 group-hover/pic:border-primary/30 group-hover/pic:shadow-primary/5 relative">
          {isImageLoading && (previewUrl || imageSrc) && (
            <Skeleton className="size-full absolute inset-0 z-10 animate-pulse bg-muted" />
          )}
          <img
            src={previewUrl || imageSrc || ''}
            alt="preview"
            onLoad={onImageLoad}
            className={cn(
              'size-full object-contain p-2 transition-all duration-700 group-hover/pic:scale-110',
              isImageLoading ? 'opacity-0' : 'opacity-100',
            )}
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
  );
}
