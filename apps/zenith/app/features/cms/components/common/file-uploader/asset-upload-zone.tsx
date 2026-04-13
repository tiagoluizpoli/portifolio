import { ImageIcon, UploadCloud } from 'lucide-react';

interface AssetUploadZoneProps {
  label: string;
  variant: 'image' | 'file';
  isUploading: boolean;
  onTrigger: () => void;
}

export function AssetUploadZone({
  label,
  variant,
  isUploading,
  onTrigger,
}: AssetUploadZoneProps) {
  return (
    <button
      type="button"
      onClick={onTrigger}
      aria-label={`Upload ${label}`}
      className="size-full flex flex-col items-center justify-center gap-4 hover:bg-primary/5 hover:border-primary/30 cursor-pointer transition-all duration-300 group"
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
          Support: {variant === 'image' ? 'JPG, PNG, WEBP (1:1)' : 'PDF, DOCX'}
        </span>
      </div>
    </button>
  );
}
