import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/error/startup')({
  component: StartupError,
});

function StartupError() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
      <h1 className="text-3xl font-bold mb-4">Startup Configuration Error</h1>
      <p className="text-lg mb-6">
        One or more required environment variables are missing or invalid.
      </p>
      <div className="bg-muted p-4 rounded-md mb-6 max-w-md w-full">
        <p className="font-mono text-sm">
          Please check your .env file against .env.example
        </p>
      </div>
      <a href="/docs/setup" className="text-brand-primary hover:underline">
        Zenith Setup Documentation
      </a>
    </div>
  );
}
