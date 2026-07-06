import StatusBadge from '../StatusBadge/StatusBadge'

export default function LineCard({ numero, status, ativo }) {
  return (
    <div className="bg-surface/50 rounded-2xl p-5 flex flex-col items-center gap-1 min-h-[100px] justify-center">
      <p className="text-lg font-bold text-on-primary">Linha {numero}</p>
      <StatusBadge status={status} />
      <p className={`text-sm ${ativo ? 'text-on-primary/70' : 'text-on-primary/50'}`}>
        {ativo ? 'Ativo' : 'Inativo'}
      </p>
    </div>
  )
}
