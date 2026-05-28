'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ListTodo, History, BarChart3, Calendar, Trash2, FolderKanban, Settings } from 'lucide-react';
import { useAuth } from '@/store/authContext';
import { useSessionTimeout } from '@/hooks/useSessionTimeout';
import { SessionTimeoutCard } from '@/components/SessionTimeoutCard';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/calendar', label: 'Calendar', icon: Calendar },
  { href: '/tasks', label: 'Daily Tasks', icon: ListTodo },
  { href: '/projects', label: 'Projects', icon: FolderKanban },
  { href: '/history', label: 'Task History', icon: History },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/trash', label: 'Trash', icon: Trash2 },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { showWarning, countdown, keepAlive } = useSessionTimeout();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 bg-card/80 backdrop-blur-xl border-r shadow-sm transform transition-transform duration-300 lg:relative lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex flex-col h-full">
          <div className="shrink-0 flex h-16 items-center border-b px-6">
            <Link href="/" className="flex items-center gap-2">
              <img src="/dailypulse.png" alt="DailyPulse" className="w-8 h-8 rounded-xl shadow-md shadow-blue-200" />
              <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                DailyPulse
              </span>
            </Link>
          </div>

          <nav className="flex-1 overflow-y-auto space-y-1 p-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-sm dark:from-blue-950/50 dark:to-indigo-950/50 dark:text-blue-400'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  )}
                >
                  <span className={cn(
                    'w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-200',
                    isActive ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-sm' : 'bg-secondary text-muted-foreground'
                  )}>
                    <item.icon className="w-3.5 h-3.5" />
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="shrink-0 border-t bg-card/50 backdrop-blur-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full text-xs" onClick={logout}>
            Sign out
          </Button>
        </div>
        </div>
      </aside>

      <div className="flex-1 min-w-0 overflow-y-auto">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/70 backdrop-blur-xl px-6 lg:hidden">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:bg-accent transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <img src="/dailypulse.png" alt="DailyPulse" className="w-7 h-7 rounded-lg" />
            <span className="font-semibold text-foreground">DailyPulse</span>
          </div>
        </header>
        <main className="p-6 lg:p-8">{children}</main>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {showWarning && (
        <SessionTimeoutCard countdown={countdown} onKeepAlive={keepAlive} />
      )}
    </div>
  );
}
