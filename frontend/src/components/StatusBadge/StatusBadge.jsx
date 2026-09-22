const statusColors = {
  Manutenção: 'text-warning',
  Atraso: 'text-delay',
  Fechado: 'text-danger',
  'Na estação': 'text-success',
  'Já Partiu': 'text-success',
  Ativo: 'text-success',
  Inativo: 'text-danger',
  Parado: 'text-danger',
  Operacional: 'text-success',
}

export default function StatusBadge({ status, className = '' }) {
  const colorClass = statusColors[status] || 'text-primary-foreground'

  return <span className={`text-sm font-semibold ${colorClass} ${className}`}>{status}</span>
}
