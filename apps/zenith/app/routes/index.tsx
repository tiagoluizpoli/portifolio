import { createFileRoute } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DashboardEmpty } from '@/features/dashboard/components/dashboard-empty';
import { GeoDistribution } from '@/features/dashboard/components/geo-distribution';
import { KpiCards } from '@/features/dashboard/components/kpi-cards';
import { TemporalDensity } from '@/features/dashboard/components/temporal-density';
import { useDashboardModel } from '@/features/dashboard/hooks/use-dashboard-model';

export const Route = createFileRoute('/')({
  component: Dashboard,
});

/**
 * Dashboard Orchestrator (FR-006: < 100 LoC)
 * Composes UI fragments; all data/state lives in `useDashboardModel`.
 */
function Dashboard() {
  const isEmpty = false; // Toggle for FR-020 verification
  const model = useDashboardModel(isEmpty);

  if (isEmpty) return <DashboardEmpty kpiCards={model.kpiCards} />;

  return (
    <div className="space-y-8 animate-in fade-in duration-700 font-sans">
      <KpiCards kpiCards={model.kpiCards} />
      <div className="grid gap-8 lg:grid-cols-3">
        <TemporalDensity
          sparklineData={model.sparklineData}
          axisLabels={model.axisLabels}
          accessHistory={model.accessHistory}
          activeRange={model.activeRange}
          onRangeChange={model.setActiveRange}
        />
        <RecentInquiries />
      </div>
      <GeoDistribution regions={model.regions} />
    </div>
  );
}

// Static demo inquiry data — module scope for referential stability (no re-allocation on render)
const RECENT_MESSAGES = [
  { name: 'Sarah J.', subject: 'Collaboration Inquiry', time: '2h ago' },
  { name: 'Marcus Chen', subject: 'Project Proposal', time: '5h ago' },
  { name: 'Elite Designs', subject: 'Feedback on UX', time: '12h ago' },
];

/** Recent Inquiries panel — static demo data, intentionally self-contained */
function RecentInquiries() {
  return (
    <Card className="border-none shadow-none bg-surface-container-low/20">
      <CardHeader>
        <CardTitle className="text-xl">Recent Inquiries</CardTitle>
        <CardDescription>New messages through portfolio</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {RECENT_MESSAGES.map((msg) => (
          <div
            key={`${msg.name}-${msg.subject}`}
            className="flex items-center justify-between p-3 bg-foreground/3 rounded-xl hover:bg-primary/5 transition-colors cursor-pointer"
          >
            <div className="space-y-0.5">
              <p className="text-sm font-bold">{msg.name}</p>
              <p className="text-xs text-muted-foreground/60">{msg.subject}</p>
            </div>
            <span className="text-[10px] font-bold text-muted-foreground/40">
              {msg.time}
            </span>
          </div>
        ))}
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-[10px] font-bold uppercase tracking-widest hover:bg-primary/10 hover:text-primary"
        >
          View All Messages
        </Button>
      </CardContent>
    </Card>
  );
}
