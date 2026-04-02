import { Link } from '@tanstack/react-router';
import {
  LayoutDashboard,
  Briefcase,
  Cpu,
  GraduationCap,
  History,
  Share2,
  Settings,
  PanelLeftClose,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

/**
 * Sidebar Component (Constitution §XV, §I)
 * Provides navigation for all 7 primary entities.
 */
export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  const navigations = [
    { label: 'Dashboard', icon: LayoutDashboard, to: '/' },
    { label: 'Projects', icon: Briefcase, to: '/projects' },
    { label: 'Experience', icon: History, to: '/experience' },
    { label: 'Tech Stack', icon: Cpu, to: '/stack' },
    { label: 'Education', icon: GraduationCap, to: '/education' },
    { label: 'Socials', icon: Share2, to: '/socials' },
    { label: 'System', icon: Settings, to: '/settings' },
  ];

  return (
    <aside
      className={cn(
        'h-full border-r bg-card flex flex-col transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="p-4 flex items-center justify-between border-b">
        {!collapsed && <span className="text-lg font-bold tracking-tight">ZENITH</span>}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 hover:bg-accent rounded transition-colors"
          aria-label="Toggle Sidebar"
          id="sidebar-toggle"
        >
          <PanelLeftClose className={cn('h-5 w-5', collapsed && 'rotate-180')} />
        </button>
      </div>

      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {navigations.map((nav) => (
          <Link
            key={nav.label}
            to={nav.to}
            className="flex items-center gap-3 px-3 py-2 rounded-md transition-all hover:bg-accent group"
            activeProps={{ className: 'bg-primary/10 text-primary' }}
          >
            <nav.icon className="h-5 w-5 shrink-0" />
            {!collapsed && (
              <span className="text-sm font-medium tracking-wide">
                {nav.label}
              </span>
            )}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t text-[10px] text-muted-foreground uppercase tracking-widest text-center">
        {!collapsed ? 'v1.0.0-PROXIMA' : 'v1'}
      </div>
    </aside>
  );
}
