const statusColors: Record<string, string> = {
  OPEN: 'bg-blue-50 text-blue-700',
  IN_PROGRESS: 'bg-amber-50 text-amber-700',
  WAITING_FOR_CUSTOMER: 'bg-purple-50 text-purple-700',
  RESOLVED: 'bg-green-50 text-green-700',
  CLOSED: 'bg-slate-100 text-slate-600',
}

const priorityColors: Record<string, string> = {
  LOW: 'bg-slate-100 text-slate-600',
  MEDIUM: 'bg-blue-50 text-blue-700',
  HIGH: 'bg-orange-50 text-orange-700',
  URGENT: 'bg-red-50 text-red-700',
}

const label = (v: string) => v.replace(/_/g, ' ').toLowerCase()

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusColors[status] ?? ''}`}>
      {label(status)}
    </span>
  )
}

export function PriorityBadge({ priority }: { priority: string }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${priorityColors[priority] ?? ''}`}>
      {label(priority)}
    </span>
  )
}