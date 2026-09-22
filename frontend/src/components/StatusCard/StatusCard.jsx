export default function StatusCard({ icon: Icon, label, value, status = 'ok', className = '' }) {
  const statusColors = {
    ok: 'bg-success',
    error: 'bg-destructive',
    warning: 'bg-warning',
  }

  return (
    <div className={`flex items-center gap-4 rounded-2xl bg-accent p-4 ${className}`}>
      <div className="flex items-center justify-center rounded-xl bg-primary p-3">
        <Icon size={24} className="text-foreground" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xl font-bold text-foreground">{value}</p>
      </div>
      <div className={`h-3 w-3 rounded-full ${statusColors[status]}`} />
    </div>
  )
}
