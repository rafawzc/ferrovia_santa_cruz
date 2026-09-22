import StatusBadge from '../StatusBadge/StatusBadge'

export default function LineCard({ numero, status, ativo }) {
  return (
    <div className="flex min-h-[100px] flex-col items-center justify-center gap-1 rounded-2xl bg-componente3/50 p-5">
      <p className="text-lg font-bold text-texto1">Linha {numero}</p>
      <StatusBadge status={status} />
      <p className={`text-sm ${ativo ? 'text-texto1/70' : 'text-texto1/60'}`}>
        {ativo ? 'Ativo' : 'Inativo'}
      </p>
    </div>
  )
}
