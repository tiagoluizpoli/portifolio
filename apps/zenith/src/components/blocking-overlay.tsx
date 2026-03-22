import { ClientOnly } from './client-only';

interface BlockingErrorOverlayProps {
  isVisible: boolean;
  message?: string;
}

export function BlockingErrorOverlay({
  isVisible,
  message,
}: BlockingErrorOverlayProps) {
  if (!isVisible) return null;

  return (
    <ClientOnly>
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-md transition-opacity duration-500"
        style={{ pointerEvents: 'all' }}
        onContextMenu={(e) => e.preventDefault()}
      >
        <div className="flex flex-col items-center gap-6 p-8 text-center">
          <div className="relative h-24 w-24 overflow-hidden rounded-full bg-destructive/10">
            <div className="absolute inset-0 animate-ping rounded-full bg-destructive/20" />
            <div className="relative flex h-full w-full items-center justify-center text-destructive">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
              </svg>
            </div>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Critical Error Encountered
          </h2>
          <p className="max-w-md text-muted-foreground">
            {message ||
              "We're performing an automatic rollback to ensure your data remains consistent. Please do not close this window."}
          </p>
          <div className="mt-4 flex items-center gap-2 text-sm font-medium text-destructive">
            <div className="h-2 w-2 animate-pulse rounded-full bg-destructive" />
            Rollback in progress...
          </div>
        </div>
      </div>
    </ClientOnly>
  );
}
