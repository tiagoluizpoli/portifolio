import { createFileRoute } from '@tanstack/react-router';
import { useMockAnalytics } from '@/services/mockDataEngine';
import { 
  Users, 
  Clock, 
  MousePointerClick, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/')({
  component: Dashboard,
});

function Dashboard() {
  const { kpis } = useMockAnalytics();

  const kpiCards = [
    { label: 'Total Visitors', value: kpis.visitors.toLocaleString(), icon: Users, trend: '+12.5%', trendType: 'up' },
    { label: 'Avg. Session', value: kpis.avgSessionTime, icon: Clock, trend: '-2.4%', trendType: 'down' },
    { label: 'Engagement', value: kpis.engagementRate, icon: MousePointerClick, trend: '+5.7%', trendType: 'up' },
    { label: 'Growth', value: '24%', icon: TrendingUp, trend: '+0.2%', trendType: 'up' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Overview</h2>
        <div className="text-xs text-muted-foreground bg-accent px-2 py-1 rounded uppercase tracking-wider font-semibold">
          Last updated: Today, 14:02 PM
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((kpi) => (
          <div key={kpi.label} className="p-6 bg-card border rounded-xl shadow-sm hover:ring-2 ring-primary/5 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                <kpi.icon className="h-5 w-5 text-primary" />
              </div>
              <div className={cn(
                "flex items-center text-xs font-semibold px-2 py-1 rounded-full",
                kpi.trendType === 'up' ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
              )}>
                {kpi.trendType === 'up' ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                {kpi.trend}
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">{kpi.label}</p>
              <h3 className="text-3xl font-bold tracking-tight">{kpi.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Placeholder Section */}
      <div className="grid gap-4 md:grid-cols-7">
        <div className="md:col-span-4 p-8 bg-card border rounded-xl flex items-center justify-center min-h-[400px]">
           <div className="text-center space-y-2">
             <TrendingUp className="h-12 w-12 text-muted-foreground/20 mx-auto" />
             <p className="text-muted-foreground font-medium">Activity Chart Visualization</p>
             <p className="text-xs text-muted-foreground/50">Coming soon in Phase 5</p>
           </div>
        </div>
        <div className="md:col-span-3 p-8 bg-card border rounded-xl flex items-center justify-center min-h-[400px]">
           <div className="text-center space-y-2">
             <Users className="h-12 w-12 text-muted-foreground/20 mx-auto" />
             <p className="text-muted-foreground font-medium">Top Traffic Channels</p>
             <p className="text-xs text-muted-foreground/50">Coming soon in Phase 5</p>
           </div>
        </div>
      </div>
    </div>
  );
}
