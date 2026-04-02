import { Search, Bell, User } from 'lucide-react';
import { Button } from '../ui/button';

/**
 * Topbar Component (Constitution §XV, §I)
 * High-density header providing search, utility actions, and profile context.
 */
export function Topbar() {
  return (
    <header className="h-16 border-b bg-card sticky top-0 z-10 px-4 md:px-6 flex items-center justify-between">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-full max-w-md group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search zenith hub..."
            className="w-full bg-accent/50 h-9 rounded-md pl-10 pr-4 text-sm outline-none ring-primary/20 focus:ring-2 transition-all"
            id="global-search"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="relative" id="notifications-toggle">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 bg-primary rounded-full ring-2 ring-card" />
        </Button>
        <div className="h-8 w-px bg-border mx-2" />
        <Button variant="ghost" size="sm" className="gap-2" id="profile-menu">
          <div className="h-6 w-6 rounded-full bg-linear-to-tr from-primary to-accent" />
          <span className="hidden sm:inline-block text-sm font-medium">Administrator</span>
        </Button>
      </div>
    </header>
  );
}
