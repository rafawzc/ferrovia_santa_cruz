export default function StatusCard({ icon: Icon, label, value, status = 'ok', className = '' }) {
  const statusColors = {
    ok: 'bg-success',
    error: 'bg-error',
    warning: 'bg-yellow-500',
  }

  return (
    <div className={`flex items-center gap-4 rounded-2xl bg-componente4 p-4 ${className}`}>
      <div className="flex items-center justify-center rounded-xl bg-componente1 p-3">
        <Icon size={24} className="text-texto1" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-texto1">{label}</p>
        <p className="text-xl font-bold text-texto1">{value}</p>
      </div>
      <div className={`h-3 w-3 rounded-full ${statusColors[status]}`} />
    </div>
  )
}
