import { File } from 'lucide-react';

interface AssetFilePreviewProps {
  previewUrl: string | null;
}

export function AssetFilePreview({ previewUrl }: AssetFilePreviewProps) {
  return (
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
  );
}
