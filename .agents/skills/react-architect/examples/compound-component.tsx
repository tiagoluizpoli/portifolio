/**
 * Compound Component Pattern — Tabs Example
 *
 * A set of components that work together via shared Context.
 * The consumer gets a clean, declarative API without managing state.
 *
 * Usage:
 * <Tabs defaultValue="tab1" onValueChange={(v) => console.log(v)}>
 *   <Tabs.List>
 *     <Tabs.Trigger value="tab1">Account</Tabs.Trigger>
 *     <Tabs.Trigger value="tab2">Settings</Tabs.Trigger>
 *   </Tabs.List>
 *   <Tabs.Content value="tab1">Account settings...</Tabs.Content>
 *   <Tabs.Content value="tab2">App settings...</Tabs.Content>
 * </Tabs>
 */

import {
  type ComponentPropsWithoutRef,
  createContext,
  forwardRef,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'
import { cn } from '@/lib/utils'

// ─── Context ──────────────────────────────────────────────────────
interface TabsContextValue {
  activeTab: string
  setActiveTab: (value: string) => void
}

const TabsContext = createContext<TabsContextValue | null>(null)

function useTabsContext(): TabsContextValue {
  const context = useContext(TabsContext)
  if (!context) {
    throw new Error(
      'Tabs compound components must be used within a <Tabs> parent. ' +
        'Wrap your Tabs.List, Tabs.Trigger, and Tabs.Content components inside <Tabs>.'
    )
  }
  return context
}

// ─── Root ─────────────────────────────────────────────────────────
interface TabsRootProps extends ComponentPropsWithoutRef<'div'> {
  defaultValue: string
  onValueChange?: (value: string) => void
  children: ReactNode
}

const TabsRoot = forwardRef<HTMLDivElement, TabsRootProps>(
  ({ defaultValue, onValueChange, children, className, ...props }, ref) => {
    const [activeTab, setActiveTabInternal] = useState(defaultValue)

    const setActiveTab = useCallback(
      (value: string) => {
        setActiveTabInternal(value)
        onValueChange?.(value)
      },
      [onValueChange]
    )

    const contextValue = useMemo(
      () => ({ activeTab, setActiveTab }),
      [activeTab, setActiveTab]
    )

    return (
      <TabsContext.Provider value={contextValue}>
        <div ref={ref} className={cn('w-full', className)} {...props}>
          {children}
        </div>
      </TabsContext.Provider>
    )
  }
)
TabsRoot.displayName = 'Tabs'

// ─── List ─────────────────────────────────────────────────────────
const TabsList = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      role="tablist"
      className={cn(
        'inline-flex h-10 items-center justify-center rounded-lg bg-muted p-1',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)
TabsList.displayName = 'Tabs.List'

// ─── Trigger ──────────────────────────────────────────────────────
interface TabsTriggerProps extends ComponentPropsWithoutRef<'button'> {
  value: string
}

const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ value, className, children, ...props }, ref) => {
    const { activeTab, setActiveTab } = useTabsContext()
    const isActive = activeTab === value

    return (
      <button
        ref={ref}
        role="tab"
        type="button"
        aria-selected={isActive}
        data-state={isActive ? 'active' : 'inactive'}
        onClick={() => setActiveTab(value)}
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5',
          'text-sm font-medium ring-offset-background transition-all',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          isActive
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground',
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)
TabsTrigger.displayName = 'Tabs.Trigger'

// ─── Content ──────────────────────────────────────────────────────
interface TabsContentProps extends ComponentPropsWithoutRef<'div'> {
  value: string
}

const TabsContent = forwardRef<HTMLDivElement, TabsContentProps>(
  ({ value, className, children, ...props }, ref) => {
    const { activeTab } = useTabsContext()
    if (activeTab !== value) return null

    return (
      <div
        ref={ref}
        role="tabpanel"
        data-state="active"
        className={cn('mt-2 ring-offset-background', className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
TabsContent.displayName = 'Tabs.Content'

// ─── Assembled Export ─────────────────────────────────────────────
export const Tabs = Object.assign(TabsRoot, {
  List: TabsList,
  Trigger: TabsTrigger,
  Content: TabsContent,
})
