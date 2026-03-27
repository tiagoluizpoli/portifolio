import { createFileRoute } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/')({
  component: Dashboard,
  loader: async () => {
    return { message: 'Welcome to Zenith Hub' };
  },
});

function Dashboard() {
  const { message } = Route.useLoaderData();

  return (
    <div className="p-8 flex flex-col gap-6">
      <h1 className="text-4xl font-bold text-brand-primary mb-4">{message}</h1>
      <p className="text-muted-foreground">
        This is the foundation of your administrative board.
      </p>

      <div className="flex gap-4">
        <Button>Get Started</Button>
        <Button variant="outline">Learn More</Button>
      </div>
    </div>
  );
}
