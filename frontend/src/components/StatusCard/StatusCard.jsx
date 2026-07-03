export default function StatusCard({ icon: Icon, label, value, status = 'ok', className = '' }) {
  const statusColors = {
    ok: 'bg-success',
    error: 'bg-error',
    warning: 'bg-yellow-500',
  }

  return (
    <div className={`bg-componente4 rounded-2xl p-4 flex items-center gap-4 ${className}`}>
      <div className="bg-componente1 rounded-xl p-3 flex items-center justify-center">
        <Icon size={24} className="text-texto2" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-texto1">{label}</p>
        <p className="text-xl font-bold text-texto1">{value}</p>
      </div>
      <div className={`w-3 h-3 rounded-full ${statusColors[status]}`} />
    </div>
  )
}
