import { createFileRoute } from '@tanstack/react-router';
import { useMockAnalytics } from '@/services/mockDataEngine';
import { 
  Users, 
  Clock, 
  MousePointerClick, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  ChevronRight,
  Globe,
  Zap,
  Server,
  DownloadCloud
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export const Route = createFileRoute('/')({
  component: Dashboard,
});

/**
 * Dashboard Component (Digital Curator Lifestyle)
 * High-fidelity 'Executive Tier' refinement matching model 3d199cd15cb2.
 */
function Dashboard() {
  const isEmpty = false; // Toggle for FR-020 verification
  const { kpis } = useMockAnalytics('zenith-v1', isEmpty);

  const kpiCards = [
    { label: 'Total MAU', value: kpis.visitors.toLocaleString(), icon: Users, trend: '12.5%', trendType: 'up' },
    { label: 'Avg. Session', value: kpis.avgSessionTime, icon: Clock, trend: '0.0%', trendType: 'neutral' },
    { label: 'Engagement Rate', value: kpis.engagementRate, icon: Zap, trend: '2.1%', trendType: 'down' },
    { label: 'Active Projects', value: '42', icon: Activity, trend: '0% change', trendType: 'neutral' },
  ];

  if (isEmpty) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700 font-sans">
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="bg-surface-container-low/40 border-none shadow-none">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="space-y-2.5 w-full">
                  <Skeleton className="h-2 w-16 bg-foreground/5" />
                  <Skeleton className="h-6 w-24 bg-foreground/10" />
                </div>
                <Skeleton className="size-8 rounded-lg bg-foreground/5 shrink-0" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-none shadow-none bg-surface-container-low/20">
          <CardHeader className="text-center py-12 space-y-4">
            <div className="p-4 bg-primary/10 rounded-full mx-auto w-fit">
              <Zap className="size-8 text-primary animate-pulse" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl">Welcome to Zenith Hub</CardTitle>
              <CardDescription className="max-w-md mx-auto text-sm leading-relaxed">
                Your administrative engine is ready. To begin populating your dashboard, 
                start by creating your first portfolio entries in the management sections.
              </CardDescription>
            </div>
            <div className="flex justify-center gap-3 pt-4">
              <Button size="sm" className="rounded-full px-6 bg-primary text-primary-foreground hover:bg-primary/90">
                Create Project
              </Button>
              <Button variant="ghost" size="sm" className="rounded-full px-6 hover:bg-foreground/5">
                View Documentation
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-12 pb-16 space-y-8">
             <div className="space-y-4 max-w-2xl mx-auto">
               {[1, 2, 3].map((i) => (
                 <div key={i} className="flex items-center gap-6 opacity-30">
                   <Skeleton className="size-5 rounded-full bg-foreground/10" />
                   <Skeleton className="h-3 flex-1 bg-foreground/5 rounded-full" />
                   <Skeleton className="h-3 w-20 bg-foreground/5 rounded-full" />
                 </div>
               ))}
             </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const regions = [
    { name: 'United States', code: 'US', requests: '1,240,582', latency: '18ms', status: 'low', distribution: 85 },
    { name: 'United Kingdom', code: 'GB', requests: '892,110', latency: '34ms', status: 'low', distribution: 65 },
    { name: 'Germany', code: 'DE', requests: '456,204', latency: '62ms', status: 'med', distribution: 45 },
    { name: 'Japan', code: 'JP', requests: '210,004', latency: '155ms', status: 'high', distribution: 25 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700 font-sans">
      {/* Top Metric Strip */}
      <div className="grid gap-4 md:grid-cols-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.label} className="bg-surface-container-low/40 border-none shadow-none group">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">{kpi.label}</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-display font-extrabold">{kpi.value}</h3>
                  <span className={cn(
                    "text-[10px] font-bold flex items-center",
                    kpi.trendType === 'up' ? "text-emerald-500" : 
                    kpi.trendType === 'down' ? "text-rose-500" : "text-muted-foreground/40"
                  )}>
                    {kpi.trendType === 'up' && <ArrowUpRight className="size-2.5 mr-0.5" />}
                    {kpi.trendType === 'down' && <ArrowDownRight className="size-2.5 mr-0.5" />}
                    {kpi.trend}
                  </span>
                </div>
              </div>
              <div className="p-2 bg-foreground/3 rounded-lg group-hover:bg-primary/10 transition-colors">
                <kpi.icon className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Primary Ingress Section */}
      <Card className="border-none shadow-none bg-surface-container-low/20">
        <CardHeader className="flex flex-row items-start justify-between pb-8">
          <div className="space-y-1.5">
            <CardTitle className="text-3xl">Geographical Ingress</CardTitle>
            <CardDescription className="normal-case tracking-normal">Visitor origins by top performing regions</CardDescription>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
            <span className="size-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Live Traffic</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-12 pb-10">
          {/* Table-like Header */}
          <div className="grid grid-cols-4 px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
            <span>Region</span>
            <span className="text-right">Requests</span>
            <span className="text-right">Latency</span>
            <span className="text-right">Distribution</span>
          </div>

          {/* Region Rows */}
          <div className="space-y-6">
            {regions.map((region) => (
              <div key={region.name} className="grid grid-cols-4 items-center px-4 group cursor-pointer transition-all hover:translate-x-1">
                <div className="flex items-center gap-3">
                  <div className="size-6 rounded-md bg-muted/20 overflow-hidden flex items-center justify-center">
                    <span className="text-xs">{region.code === 'US' ? '🇺🇸' : region.code === 'GB' ? '🇬🇧' : region.code === 'DE' ? '🇩🇪' : '🇯🇵'}</span>
                  </div>
                  <span className="text-sm font-semibold">{region.name}</span>
                </div>
                <div className="text-right font-display font-bold text-sm tabular-nums">
                  {region.requests}
                </div>
                <div className={cn(
                  "text-right font-bold text-sm tabular-nums",
                  region.status === 'low' ? "text-emerald-500" :
                  region.status === 'med' ? "text-amber-500" : "text-rose-500"
                )}>
                  {region.latency}
                </div>
                <div className="flex justify-end">
                  <div className="w-40 h-1.5 bg-foreground/3 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(208,188,255,0.4)]" 
                      style={{ width: `${region.distribution}%` }} 
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Map Visualization Placeholder */}
          <div className="relative w-full aspect-video rounded-3xl bg-muted/5 overflow-hidden group">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(208,188,255,0.1),transparent)]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center gap-4 text-center opacity-40 group-hover:opacity-100 transition-all duration-500">
                <div className="p-6 bg-background rounded-full shadow-2xl">
                   <Globe className="size-12 text-primary animate-[spin_20s_linear_infinite]" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">Global Density Visualization</p>
                  <p className="text-xs font-mono text-muted-foreground/60 italic">Integrated Node Graph rendering...</p>
                </div>
              </div>
            </div>
            {/* Minimal Background Grid Effect */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #d0bcff 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }} />
          </div>
        </CardContent>
      </Card>

      {/* Bottom Auxiliary Metrics */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none shadow-none bg-surface-container-low/20">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
               <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">System Load</p>
               <div className="flex items-baseline gap-2">
                 <h3 className="text-2xl font-display font-extrabold text-emerald-500">0.04</h3>
                 <span className="text-[10px] font-bold text-muted-foreground/40 uppercase">AVG</span>
               </div>
            </div>
            <div className="flex gap-1 h-8 items-end">
               {[20, 40, 30, 70, 50, 90, 40].map((h, i) => (
                 <div key={i} className="w-1 bg-primary/20 rounded-full" style={{ height: `${h}%` }} />
               ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-none bg-surface-container-low/20">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="space-y-1">
               <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Data Ingress</p>
               <div className="flex items-baseline gap-2">
                 <h3 className="text-2xl font-display font-extrabold">1.2</h3>
                 <span className="text-[10px] font-bold text-muted-foreground/40 uppercase">GB/S</span>
               </div>
            </div>
            <div className="flex gap-1 h-8 items-end">
               {[90, 60, 80, 40, 70, 30, 60].map((h, i) => (
                 <div key={i} className="w-1 bg-foreground/10 rounded-full" style={{ height: `${h}%` }} />
               ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
