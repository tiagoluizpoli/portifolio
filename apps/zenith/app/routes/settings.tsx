import { createFileRoute } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Settings, 
  User, 
  Shield, 
  Database,
  Save
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
});

function SettingsPage() {
  const [activeTab, setActiveTab] = useState('system');

  const tabs = [
    { id: 'system', label: 'System', icon: Settings },
    { id: 'profile', label: 'Admin Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'database', label: 'Appwrite', icon: Database },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
          <p className="text-sm text-muted-foreground">Manage your portfolio hub configuration.</p>
        </div>
        <Button className="gap-2">
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Settings Navigation */}
        <aside className="w-full md:w-64 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all",
                activeTab === tab.id 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "hover:bg-accent text-muted-foreground hover:text-foreground"
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </aside>

        {/* Settings Content Area */}
        <div className="flex-1 bg-card border rounded-xl p-6 shadow-sm">
          {activeTab === 'system' && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="hub-name" className="text-sm font-semibold tracking-wide">Hub Display Name</label>
                  <Input id="hub-name" placeholder="Zenith Portfolio Hub" defaultValue="Zenith Hub" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="hub-version" className="text-sm font-semibold tracking-wide">System Version</label>
                  <Input id="hub-version" placeholder="v1.0.0" defaultValue="v1.0.0-PROXIMA" disabled />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="hub-desc" className="text-sm font-semibold tracking-wide">Dashboard Description</label>
                <textarea 
                  id="hub-desc"
                  className="w-full bg-accent/20 border rounded-md p-3 text-sm min-h-[100px] outline-none focus:ring-2 ring-primary/20 transition-all"
                  placeholder="Primary administrative board for Zenith portfolio management."
                />
              </div>
            </div>
          )}
          {activeTab !== 'system' && (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-2">
              <div className="p-4 bg-muted rounded-full">
                <Settings className="h-8 w-8 text-muted-foreground/40" />
              </div>
              <p className="text-muted-foreground font-medium">Tab Implementation Pending</p>
              <p className="text-xs text-muted-foreground/50">This module will be connected to Appwrite in Phase 2 Expansion.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
