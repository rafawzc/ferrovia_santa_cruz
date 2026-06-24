import StatusBadge from '../StatusBadge/StatusBadge'

export default function LineCard({ numero, status, ativo }) {
  return (
    <div className="bg-componente3/50 rounded-2xl p-5 flex flex-col items-center gap-1 min-h-[100px] justify-center">
      <p className="text-lg font-bold text-texto2">Linha {numero}</p>
      <StatusBadge status={status} />
      <p className={`text-sm ${ativo ? 'text-texto2/70' : 'text-texto2/50'}`}>
        {ativo ? 'Ativo' : 'Inativo'}
      </p>
    </div>
  )
}
