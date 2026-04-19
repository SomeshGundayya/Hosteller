import { Notice } from '@/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { AlertCircle, Bell, AlertTriangle } from 'lucide-react';

interface NoticeCardProps {
  notice: Notice;
}

const priorityStyles = {
  normal: {
    border: 'border-l-muted-foreground',
    icon: Bell,
    badge: 'bg-muted text-muted-foreground',
  },
  important: {
    border: 'border-l-warning',
    icon: AlertCircle,
    badge: 'bg-warning/10 text-warning',
  },
  urgent: {
    border: 'border-l-destructive',
    icon: AlertTriangle,
    badge: 'bg-destructive/10 text-destructive',
  },
};

export function NoticeCard({ notice }: NoticeCardProps) {
  const { border, icon: Icon, badge } = priorityStyles[notice.priority];

  return (
    <div className={cn("dashboard-card border-l-4", border)}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-foreground">{notice.title}</h3>
            <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium capitalize", badge)}>
              {notice.priority}
            </span>
          </div>
          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
            {notice.content}
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>By {notice.author}</span>
            <span>•</span>
            <span>{format(new Date(notice.createdAt), 'MMM d, yyyy')}</span>
          </div>
        </div>
        <div className={cn("p-2 rounded-lg", badge)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
