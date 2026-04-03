import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useMockAnalytics } from '@/services/mockDataEngine';
import { 
  Users, 
  TrendingUp,
  Activity,
  ChevronRight,
  Zap
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
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from '@/components/ui/tooltip';

export const Route = createFileRoute('/')({
  component: Dashboard,
});

/**
 * Dashboard Component (Digital Curator Lifestyle)
 * High-fidelity 'Executive Tier' refinement matching model 3d199cd15cb2.
 */
function Dashboard() {
  const isEmpty = false; // Toggle for FR-020 verification
  const { kpis, accessHistory } = useMockAnalytics('zenith-v1', isEmpty);
  const [activeRange, setActiveRange] = useState('24h');

  const kpiCards = [
    { label: 'Total Portfolio Access', value: kpis.totalAccess.toLocaleString(), icon: Users, trend: 'stable', trendType: 'neutral' },
    { label: 'Access this Month', value: kpis.accessMonthly.toLocaleString(), icon: TrendingUp, trend: '+14%', trendType: 'up' },
    { label: 'New Contact Inquiries', value: kpis.newContacts, icon: Zap, trend: 'priority', trendType: 'up', highlight: true },
    { label: 'Viewers Active', value: kpis.activeUsers, icon: Activity, trend: 'live', trendType: 'neutral', highlight: true },
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
              <TrendingUp className="size-8 text-primary animate-pulse" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl">Ready to Curate</CardTitle>
              <CardDescription className="max-w-md mx-auto text-sm leading-relaxed">
                Your portfolio management engine is initialized. Begin by integrating your first projects to see real-time access analytics and contact inquiries.
              </CardDescription>
            </div>
            <div className="flex justify-center gap-3 pt-4">
              <Button size="sm" className="rounded-full px-6 bg-primary text-primary-foreground hover:bg-primary/90">
                Integrate Portfolio
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
    { name: 'United States', code: 'US', requests: '12,405', latency: '18ms', status: 'low', distribution: 85, flag: '🇺🇸' },
    { name: 'Brazil', code: 'BR', requests: '8,921', latency: '24ms', status: 'low', distribution: 65, flag: '🇧🇷' },
    { name: 'Germany', code: 'DE', requests: '4,562', latency: '42ms', status: 'med', distribution: 45, flag: '🇩🇪' },
    { name: 'Japan', code: 'JP', requests: '2,100', latency: '112ms', status: 'high', distribution: 25, flag: '🇯🇵' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700 font-sans">
      {/* Portfolio KPI Strip */}
      <div className="grid gap-4 md:grid-cols-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.label} className={cn(
            "bg-surface-container-low/40 border-none shadow-none group relative overflow-hidden",
            kpi.highlight && "ring-1 ring-primary/20"
          )}>
            {kpi.highlight && (
              <div className="absolute top-3 right-3">
                <span className="flex size-1.5 rounded-full bg-primary animate-pulse" />
              </div>
            )}
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">{kpi.label}</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-mono font-bold tracking-tight">{kpi.value}</h3>
                  <span className={cn(
                    "text-[10px] font-bold",
                    kpi.trendType === 'up' ? "text-primary" : "text-muted-foreground/40"
                  )}>
                    {kpi.trend}
                  </span>
                </div>
              </div>
              <div className={cn(
                "p-2 rounded-lg transition-colors",
                kpi.highlight ? "bg-primary/20" : "bg-foreground/3 group-hover:bg-primary/10"
              )}>
                <kpi.icon className={cn(
                  "size-4 transition-colors",
                  kpi.highlight ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                )} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Temporal Access Density */}
        <Card className="lg:col-span-2 border-none shadow-none bg-surface-container-low/20">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-display font-extrabold tracking-tight">Temporal Density</CardTitle>
              <CardDescription>Portfolio access frequency over the last 24 hours</CardDescription>
            </div>
            <div className="flex gap-1.5 bg-foreground/5 p-1 rounded-xl">
               {accessHistory.map((h) => (
                 <Button
                   key={h.label}
                   variant="ghost"
                   size="icon"
                   onClick={() => setActiveRange(h.label)}
                   className={cn(
                     "size-9 flex flex-col items-center justify-center rounded-lg transition-all border-none shadow-none",
                     activeRange === h.label 
                       ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                       : "text-muted-foreground/40 hover:bg-foreground/5 hover:text-muted-foreground"
                   )}
                 >
                   <p className="text-[9px] font-black uppercase leading-none">{h.label}</p>
                   <p className="text-[10px] font-mono font-bold leading-none mt-0.5">{h.value}</p>
                 </Button>
               ))}
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-2">
            <TooltipProvider>
              <div className="h-64 flex items-end gap-1.5">
                {Array.from({ length: 48 }).map((_, i) => {
                  const height = 20 + (Math.sin(i * 0.3) * 30) + (Math.random() * 40);
                  const timeAgo = (48 - i) * 30; // 30 mins intervals
                  const hours = Math.floor(timeAgo / 60);
                  const mins = timeAgo % 60;
                  const label = hours > 0 ? `${hours}h ${mins}m ago` : `${mins}m ago`;
                  
                  return (
                    <Tooltip key={i}>
                      <TooltipTrigger asChild>
                        <div 
                          className="flex-1 bg-primary/40 hover:bg-primary transition-all duration-300 rounded-t-sm cursor-crosshair min-w-[2px]"
                          style={{ height: `${height}%` }}
                        />
                      </TooltipTrigger>
                      <TooltipContent 
                        side="top" 
                        className="flex flex-col gap-1 py-3 px-4 bg-surface-container-high border-none shadow-2xl rounded-xl animate-in zoom-in-95"
                      >
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Capture Point</span>
                        <div className="flex flex-col gap-0">
                          <span className="text-lg font-mono font-black tabular-nums text-white leading-none">{label}</span>
                          <span className="text-[11px] font-bold text-muted-foreground mt-1">
                             <span className="text-primary">{Math.floor(height)}</span> verified hits
                          </span>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </TooltipProvider>
          </CardContent>
          <CardFooter className="px-6 py-5 flex flex-col gap-4 border-t border-white/5">
             <div className="flex justify-between w-full text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                {Array.from({ length: 5 }).map((_, i) => {
                  const rangeValue = parseInt(activeRange);
                  const step = rangeValue / 4;
                  const value = rangeValue - (i * step);
                  
                  return (
                    <span key={i} className="flex flex-col items-center gap-2">
                      <div className="w-px h-1.5 bg-foreground/20" />
                      <span className="tabular-nums">
                        {value === 0 
                          ? 'Now' 
                          : activeRange.includes('h') 
                            ? `${value}h ago` 
                            : `${value}m ago`}
                      </span>
                    </span>
                  );
                })}
             </div>
          </CardFooter>
        </Card>

        {/* Recent Contact Inquiries */}
        <Card className="border-none shadow-none bg-surface-container-low/20">
          <CardHeader>
            <CardTitle className="text-xl">Recent Inquiries</CardTitle>
            <CardDescription>New messages through portfolio</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: 'Sarah J.', subject: 'Collaboration Inquiry', time: '2h ago' },
              { name: 'Marcus Chen', subject: 'Project Proposal', time: '5h ago' },
              { name: 'Elite Designs', subject: 'Feedback on UX', time: '12h ago' },
            ].map((msg, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-foreground/3 rounded-xl hover:bg-primary/5 transition-colors cursor-pointer group">
                <div className="space-y-0.5">
                  <p className="text-sm font-bold">{msg.name}</p>
                  <p className="text-xs text-muted-foreground/60">{msg.subject}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[10px] font-bold text-muted-foreground/40">{msg.time}</span>
                  <ChevronRight className="size-3 text-muted-foreground/20 group-hover:text-primary transition-colors" />
                </div>
              </div>
            ))}
            <Button variant="ghost" size="sm" className="w-full text-[10px] font-bold uppercase tracking-widest hover:bg-primary/10 hover:text-primary">
              View All Messages
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Geographic Distribution (Reverted to Table) */}
      <Card className="border-none shadow-none bg-surface-container-low/20 overflow-hidden">
        <CardHeader className="flex flex-row items-baseline justify-between pb-8">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-display font-extrabold tracking-tight">Geographic Ingress</CardTitle>
            <CardDescription>Top performing regions by access volume</CardDescription>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
            <span className="size-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Live Traffic</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-8 pb-10">
          <div className="grid grid-cols-4 px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
            <span>Region</span>
            <span className="text-right">Requests</span>
            <span className="text-right">Latency</span>
            <span className="text-right">Distribution</span>
          </div>
          <div className="space-y-6">
            {regions.map((region) => (
              <div key={region.name} className="grid grid-cols-4 items-center px-4 group cursor-pointer transition-all hover:translate-x-1">
                <div className="flex items-center gap-3">
                  <div className="size-6 rounded-md bg-muted/20 flex items-center justify-center overflow-hidden">
                    <span className="text-xs leading-none">{region.flag}</span>
                  </div>
                  <span className="text-sm font-semibold">{region.name}</span>
                </div>
                <div className="text-right font-mono font-bold text-sm tabular-nums text-foreground/80">
                  {region.requests}
                </div>
                <div className={cn(
                  "text-right font-bold text-sm tabular-nums",
                  region.status === 'low' ? "text-emerald-500" :
                  region.status === 'med' ? "text-amber-500" : "text-rose-500"
                )}>
                  {region.latency}
                </div>
                <div className="flex justify-end pr-4">
                  <div className="w-40 h-1.5 bg-foreground/3 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: `${region.distribution}%` }} 
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
