import { cn } from '@/lib/utils';

interface ComplaintStatusBadgeProps {
  status: 'pending' | 'in-progress' | 'resolved';
}

export function ComplaintStatusBadge({ status }: ComplaintStatusBadgeProps) {
  const styles = {
    'pending': 'status-badge status-pending',
    'in-progress': 'status-badge status-open',
    'resolved': 'status-badge status-resolved',
  };

  const labels = {
    'pending': 'Pending',
    'in-progress': 'In Progress',
    'resolved': 'Resolved',
  };

  return (
    <span className={cn(styles[status])}>
      {labels[status]}
    </span>
  );
}
