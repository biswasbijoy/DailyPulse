'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface SessionTimeoutCardProps {
  countdown: number;
  onKeepAlive: () => void;
}

export function SessionTimeoutCard({ countdown, onKeepAlive }: SessionTimeoutCardProps) {
  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <Card className="mx-4 w-full max-w-sm animate-in fade-in zoom-in-95 duration-200">
        <CardContent className="p-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-950/30">
            <svg className="h-8 w-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <h3 className="mb-1 text-lg font-semibold text-foreground">Session Expiring Soon</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Your session will expire in <span className="font-mono font-medium text-foreground">
              {minutes}:{seconds.toString().padStart(2, '0')}
            </span>. Extend your session to continue working.
          </p>

          <div className="mb-4 h-2 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-1000"
              style={{ width: `${(countdown / 300) * 100}%` }}
            />
          </div>

          <Button
            variant="gradient"
            size="lg"
            className="w-full"
            onClick={onKeepAlive}
          >
            Keep Alive
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
