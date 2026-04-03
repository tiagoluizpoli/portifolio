import { Link, useLocation } from '@tanstack/react-router';
import {
  LayoutDashboard,
  Briefcase,
  History,
  Cpu,
  GraduationCap,
  Share2,
  Settings,
  Zap,
  HelpCircle,
  LogOut,
  BarChart3,
  BookOpen,
  PieChart
} from 'lucide-react';
import { 
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navigations = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/' },
  { label: 'Portfolio Manager', icon: Briefcase, to: '/projects' },
  { label: 'Blog WIP', icon: BookOpen, to: '/experience' },
  { label: 'Reports WIP', icon: PieChart, to: '/stack' },
];

const systemNav = [
  { label: 'System Settings', icon: Settings, to: '/settings' },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar collapsible="icon" className="border-none bg-sidebar font-sans transition-all duration-300">
      <SidebarHeader className="h-24 flex items-start pt-8 px-6 mt-4 transition-all duration-300 group-data-[collapsible=icon]:h-14 group-data-[collapsible=icon]:pt-0 group-data-[collapsible=icon]:mt-1 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:justify-center">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:gap-0">
          <div className="flex aspect-square size-10 group-data-[collapsible=icon]:size-8 items-center justify-center rounded-xl group-data-[collapsible=icon]:rounded-full bg-primary/10 text-primary shadow-lg shadow-primary/5 transition-all">
            <Zap className="size-5 group-data-[collapsible=icon]:size-4 fill-current transition-all" />
          </div>
          <div className="flex flex-col gap-0.5 group-data-[collapsible=icon]:hidden ml-3">
            <span className="font-display text-lg font-extrabold tracking-tight leading-none text-foreground">
              Zenith Hub
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary/60 leading-none">
              Portfolio Management
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 group-data-[collapsible=icon]:px-0">
        <SidebarGroup className="group-data-[collapsible=icon]:p-2">
          <SidebarMenu>
            {navigations.map((nav) => {
              const isActive = location.pathname === nav.to;
              return (
                <SidebarMenuItem key={nav.label}>
                  <SidebarMenuButton
                    asChild
                    tooltip={nav.label}
                    className={cn(
                      "h-11 px-4 group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-0! group-data-[collapsible=icon]:justify-center transition-all duration-200 rounded-lg",
                      isActive 
                        ? "bg-sidebar-accent text-primary font-bold shadow-sm" 
                        : "text-muted-foreground/50 hover:bg-sidebar-accent/30 hover:text-muted-foreground/80"
                    )}
                  >
                    <Link to={nav.to}>
                      <nav.icon className="size-[18px] group-data-[collapsible=icon]:size-4" />
                      <span className="font-medium text-sm ml-3 group-data-[collapsible=icon]:hidden">{nav.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup className="mt-4 group-data-[collapsible=icon]:p-2">
          <SidebarGroupLabel className="font-bold uppercase tracking-[0.2em] text-[10px] opacity-40 px-4 mb-2 group-data-[collapsible=icon]:hidden">
            Configuration
          </SidebarGroupLabel>
          <SidebarMenu>
            {systemNav.map((nav) => {
              const isActive = location.pathname === nav.to;
              return (
                <SidebarMenuItem key={nav.label}>
                  <SidebarMenuButton
                    asChild
                    tooltip={nav.label}
                    className={cn(
                      "h-11 px-4 group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-0! group-data-[collapsible=icon]:justify-center transition-all duration-200 rounded-lg",
                      isActive 
                        ? "bg-sidebar-accent text-primary font-bold shadow-sm" 
                        : "text-muted-foreground/50 hover:bg-sidebar-accent/30 hover:text-muted-foreground/80"
                    )}
                  >
                    <Link to={nav.to}>
                      <nav.icon className="size-[18px] group-data-[collapsible=icon]:size-4" />
                      <span className="font-medium text-sm ml-3 group-data-[collapsible=icon]:hidden">{nav.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-none">
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
