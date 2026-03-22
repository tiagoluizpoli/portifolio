import { createFileRoute } from '@tanstack/react-router';
import { Button } from '#/components/ui/button';

export const Route = createFileRoute('/connection-lost')({
  component: ConnectionLostPage,
});

function ConnectionLostPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2v8" />
          <path d="m4.93 4.93 4.24 4.24" />
          <path d="M2 12h8" />
          <path d="m4.93 19.07 4.24-4.24" />
          <path d="M12 22v-8" />
          <path d="m19.07 19.07-4.24-4.24" />
          <path d="M22 12h-8" />
          <path d="m19.07 4.93-4.24 4.24" />
        </svg>
      </div>
      <h1 className="text-3xl font-bold tracking-tight">Connectivity Lost</h1>
      <p className="max-w-md text-muted-foreground">
        We've lost contact with the Zenith core after multiple attempts. Your
        unsaved progress has been backed up locally.
      </p>
      <Button onClick={() => window.location.reload()} size="lg">
        Retry Connection
      </Button>
    </div>
  );
}
