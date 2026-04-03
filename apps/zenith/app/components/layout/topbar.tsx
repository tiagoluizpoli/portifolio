import { Search, Bell, Command, Settings, LogOut } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { useOnlineStatus } from '@/hooks/use-online-status';

/**
 * Topbar Component (Constitution §XV, §I)
 * High-density editorial header providing search, utility actions, and profile context.
 * Features Oceanic Obsidian backdrop-blur-2xl and the 'No-Line' rule.
 */
export function Topbar() {
  const { isOffline } = useOnlineStatus();

  return (
    <header className="sticky top-0 z-10 flex h-14 w-full items-center justify-between px-4 glass-premium border-none">
      <div className="flex flex-1 items-center gap-4">
        {/* Offline Indicator: Positioned to avoid layout shifts */}
        {isOffline && (
          <div className="flex items-center gap-2 px-3 py-1 bg-destructive/10 rounded-full border border-destructive/20 animate-pulse shrink-0">
            <span className="size-1.5 rounded-full bg-destructive" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-destructive">Offline</span>
          </div>
        )}
        
        <SidebarTrigger className="hover:bg-sidebar-accent/50 text-muted-foreground transition-colors" />
        <div className="h-4 w-px bg-foreground/10 mx-2 hidden md:block" />
        
        <div className="relative w-full max-w-md group hidden md:block">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Search analytics..."
            className="h-9 w-full border-none bg-foreground/3 pl-10 pr-4 text-xs focus-visible:ring-primary/20 transition-all font-sans placeholder:text-muted-foreground/40"
            id="global-search"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative h-9 w-9 hover:bg-sidebar-accent/50 rounded-lg group" id="notifications-toggle">
          <Bell className="h-[18px] w-[18px] text-muted-foreground group-hover:text-foreground transition-colors" />
          <span className="absolute top-2.5 right-2.5 h-1.5 w-1.5 rounded-full bg-primary ring-2 ring-background animate-pulse" />
        </Button>
        
        <div className="h-4 w-px bg-foreground/10 mx-1 hidden sm:block" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-10 gap-3 px-2 hover:bg-sidebar-accent/50 rounded-xl group transition-all" id="profile-menu">
              <Avatar className="h-8 w-8 rounded-lg ring-2 ring-primary/10 transition-transform group-hover:scale-105">
                <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Alex Mercer" />
                <AvatarFallback className="rounded-lg bg-primary/20 text-[10px] font-bold text-primary">AM</AvatarFallback>
              </Avatar>
              <div className="hidden flex-col items-start gap-0 text-left md:flex">
                <span className="text-sm font-bold leading-tight tracking-tight">Alex Mercer</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 leading-tight">Executive VP</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 glass border-none shadow-2xl p-2 rounded-2xl">
            <DropdownMenuLabel className="font-display px-3 py-2">Account Management</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-foreground/5 mx-1" />
            <DropdownMenuItem className="gap-2 px-3 py-2 rounded-lg cursor-pointer">
              <Command className="size-4 opacity-70" />
              <span className="text-xs font-medium">Command Center</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 px-3 py-2 rounded-lg cursor-pointer">
              <Settings className="size-4 opacity-70" />
              <span className="text-xs font-medium">System Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-foreground/5 mx-1" />
            <DropdownMenuItem className="gap-2 px-3 py-2 rounded-lg text-destructive focus:text-destructive cursor-pointer">
              <LogOut className="size-4" />
              <span className="text-xs font-medium">Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
