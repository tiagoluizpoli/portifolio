import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function ExperienceSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-32" />
        </div>
      </div>
      <div className="space-y-6">
        {[1, 2, 3].map((id) => (
          <Card key={`exp-skel-${id}`} className="bg-card/30 border-border/50">
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
