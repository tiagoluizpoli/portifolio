import { createFileRoute } from '@tanstack/react-router';
import {
  ArrowRight,
  Database,
  Save,
  Settings,
  Shield,
  User,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
});

/**
 * SettingsPage Component
 * Refactored for Oceanic Obsidian with high-density editorial controls.
 */
function SettingsPage() {
  const [activeTab, setActiveTab] = useState('system');

  const tabs = [
    { id: 'system', label: 'System', icon: Settings },
    { id: 'profile', label: 'Admin Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'database', label: 'Appwrite', icon: Database },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-500 font-sans">
      <div className="flex items-end justify-between">
        <div className="space-y-1">
          <h1 className="font-display text-4xl font-extrabold tracking-tight">
            System Configuration
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage your portfolio hub deployment and administrative parameters.
          </p>
        </div>
        <Button className="gap-2 font-bold uppercase tracking-widest text-[10px] h-10 px-6 bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl transition-all">
          <Save className="h-3.5 w-3.5" />
          Synchronize Changes
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Editorial Navigation rail */}
        <aside className="w-full lg:w-72 flex flex-col gap-2">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
            Categories
          </div>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all group',
                activeTab === tab.id
                  ? 'bg-primary/10 text-primary'
                  : 'hover:bg-muted/5 text-muted-foreground hover:text-foreground',
              )}
            >
              <div className="flex items-center gap-3">
                <tab.icon
                  className={cn(
                    'h-4 w-4 transition-colors',
                    activeTab === tab.id
                      ? 'text-primary'
                      : 'text-muted-foreground/60 group-hover:text-foreground',
                  )}
                />
                {tab.label}
              </div>
              {activeTab === tab.id && (
                <ArrowRight className="h-3 w-3 animate-in slide-in-from-left-1 duration-300" />
              )}
            </button>
          ))}
        </aside>

        {/* Content Canvas */}
        <div className="flex-1 space-y-6">
          {activeTab === 'system' && (
            <Card className="border-none shadow-none bg-surface-container-low/30">
              <CardHeader className="pb-8">
                <CardTitle>Hub Identity</CardTitle>
                <CardDescription>
                  Configure the primary metadata for your administrative board.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid gap-8 md:grid-cols-2">
                  <div className="space-y-2.5">
                    <label
                      htmlFor="hub-name"
                      className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                    >
                      Hub Display Name
                    </label>
                    <Input
                      id="hub-name"
                      placeholder="Zenith Portfolio Hub"
                      defaultValue="Zenith Hub"
                      className="bg-background/40 border-none h-11 focus-visible:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-2.5">
                    <label
                      htmlFor="hub-version"
                      className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                    >
                      System Version
                    </label>
                    <Input
                      id="hub-version"
                      placeholder="v1.0.0"
                      defaultValue="v1.0.0-PROXIMA"
                      disabled
                      className="bg-muted/5 border-none h-11 opacity-50"
                    />
                  </div>
                </div>
                <div className="space-y-2.5">
                  <label
                    htmlFor="hub-desc"
                    className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                  >
                    Dashboard Purpose
                  </label>
                  <textarea
                    id="hub-desc"
                    className="w-full bg-background/40 border-none rounded-xl p-4 text-sm min-h-[120px] outline-none focus:ring-2 ring-primary/20 transition-all font-sans"
                    placeholder="Primary administrative board for Zenith portfolio management."
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab !== 'system' && (
            <Card className="border-none shadow-none bg-surface-container-low/30 flex flex-col items-center justify-center py-24 text-center">
              <CardContent className="space-y-4">
                <div className="p-5 bg-background/40 rounded-3xl mx-auto w-fit shadow-inner">
                  <Settings className="h-10 w-10 text-primary/40 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-display text-xl font-bold">
                    Module Integration Pending
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                    This section will be connected to the Appwrite Service layer
                    in the next architectural sprint.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
