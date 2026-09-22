import StatusBadge from '../StatusBadge/StatusBadge'

export default function LineCard({ numero, status, ativo }) {
  return (
    <div className="flex min-h-[100px] flex-col items-center justify-center gap-1 rounded-2xl bg-surface/50 p-5">
      <p className="text-lg font-bold text-on-primary">Linha {numero}</p>
      <StatusBadge status={status} />
      <p className={`text-sm ${ativo ? 'text-on-primary/70' : 'text-on-primary/50'}`}>
        {ativo ? 'Ativo' : 'Inativo'}
      </p>
    </div>
  )
}
