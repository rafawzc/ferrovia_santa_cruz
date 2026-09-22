const statusColors = {
  'Manutenção': 'text-yellow-400',
  'Atraso': 'text-orange-400',
  'Fechado': 'text-red-400',
  'Na estação': 'text-green-400',
  'Já Partiu': 'text-green-400',
  'Ativo': 'text-green-400',
  'Inativo': 'text-red-400',
  'Parado': 'text-red-400',
  'Operacional': 'text-green-400',
}

export default function StatusBadge({ status, className = '' }) {
  const colorClass = statusColors[status] || 'text-texto2'

  return (
    <span className={`text-sm font-semibold ${colorClass} ${className}`}>
      {status}
    </span>
  )
}
